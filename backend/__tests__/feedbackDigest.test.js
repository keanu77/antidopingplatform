import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

// /api/cron/feedback-digest 整合測試：cron secret 保護、空窗不寄、有資料寄信（mock fetch）。
const PATH = "/api/cron/feedback-digest";
const SECRET = "cron-secret";

let mongod;
let dbApi;
let app;

// digest route 先驗 secret 才碰 DB；帶正確 secret 打到「非 500 或非未連線」即代表 DB 就緒。
async function waitDigestReady() {
  for (let i = 0; i < 100; i++) {
    const res = await request(app).get(PATH).set("x-cron-secret", SECRET);
    if (res.status !== 500 || res.body?.error !== "Database not connected")
      return;
    await new Promise((r) => setTimeout(r, 30));
  }
  throw new Error("digest route DB 未就緒");
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.CRON_SECRET = SECRET;

  const dbMod = await import("../db.js");
  dbApi = dbMod.default || dbMod;
  await dbApi.connect();

  const digestRouter = (await import("../routes/feedbackDigest.js")).default;
  app = express();
  app.use(express.json());
  app.use(PATH, digestRouter);

  await waitDigestReady();
});

afterAll(async () => {
  if (dbApi) await dbApi.close();
  if (mongod) await mongod.stop();
  delete process.env.CRON_SECRET;
  delete process.env.ZSEND_API_KEY;
  delete process.env.FEEDBACK_DIGEST_TO;
});

describe("GET /api/cron/feedback-digest（授權）", () => {
  it("未帶 secret → 401", async () => {
    const res = await request(app).get(PATH);
    expect(res.status).toBe(401);
  });

  it("錯誤 secret → 401", async () => {
    const res = await request(app).get(PATH).set("x-cron-secret", "wrong");
    expect(res.status).toBe(401);
  });

  it("空窗（無回饋）→ 200 且 sent:false、不寄信", async () => {
    const res = await request(app).get(PATH).set("x-cron-secret", SECRET);
    expect(res.status).toBe(200);
    expect(res.body.sent).toBe(false);
    expect(res.body.count).toBe(0);
  });
});

describe("GET /api/cron/feedback-digest（有回饋資料）", () => {
  beforeAll(async () => {
    await dbApi
      .getDb()
      .collection("feedback")
      .insertMany([
        { type: "rating", toolSlug: "/tue", rating: 5, createdAt: new Date() },
        {
          type: "rating",
          toolSlug: "/cases",
          rating: 2,
          createdAt: new Date(),
        },
        {
          type: "error",
          toolSlug: "/cases",
          errorType: "案例資料錯誤",
          description: "判罰年限標錯",
          createdAt: new Date(),
        },
        {
          type: "feedback",
          toolSlug: "/tue",
          rating: 3,
          message: "希望多一些案例",
          createdAt: new Date(),
        },
      ]);
  });

  it("有資料但未設 ZSEND_API_KEY → 500", async () => {
    delete process.env.ZSEND_API_KEY;
    const res = await request(app).get(PATH).set("x-cron-secret", SECRET);
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/ZSEND_API_KEY/);
  });

  it("設好 ZSEND + 收件人 + mock fetch → 200 sent:true 並呼叫 email API", async () => {
    process.env.ZSEND_API_KEY = "test-key";
    process.env.FEEDBACK_DIGEST_TO = "boss@example.com";
    const calls = [];
    const orig = global.fetch;
    global.fetch = async (url, opts) => {
      calls.push({ url, opts });
      return { ok: true, text: async () => "" };
    };
    try {
      const res = await request(app).get(PATH).set("x-cron-secret", SECRET);
      expect(res.status).toBe(200);
      expect(res.body.sent).toBe(true);
      expect(res.body.count).toBe(4);
      expect(calls.length).toBe(1);
      expect(String(calls[0].url)).toContain("zsend");
      const body = JSON.parse(calls[0].opts.body);
      expect(body.to).toContain("boss@example.com");
      expect(body.subject).toContain("每日回饋總結");
      expect(body.html).toContain("整體平均");
      expect(body.html).toContain("錯誤回報");
    } finally {
      global.fetch = orig;
      delete process.env.ZSEND_API_KEY;
      delete process.env.FEEDBACK_DIGEST_TO;
    }
  });
});
