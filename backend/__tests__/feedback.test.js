import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { waitForRoute } from "./_fixtures.js";

// /api/feedback 路由整合測試：honeypot、time-trap、rating 驗證、error 必填、admin 保護。
let mongod;
let dbApi;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.FEEDBACK_ADMIN_SECRET = "test-secret";

  const dbMod = await import("../db.js");
  dbApi = dbMod.default || dbMod;
  await dbApi.connect();

  const feedbackRouter = (await import("../routes/feedback.js")).default;
  app = express();
  app.use(express.json());
  app.use("/api/feedback", feedbackRouter);

  // admin 端點連線就緒後不是 500（未授權時回 401），用它探測 DB 已連上。
  await waitForRoute(app, "/api/feedback/admin");
});

afterAll(async () => {
  if (dbApi) await dbApi.close();
  if (mongod) await mongod.stop();
  delete process.env.FEEDBACK_ADMIN_SECRET;
});

async function countFeedback() {
  return dbApi.getDb().collection("feedback").countDocuments();
}

describe("POST /api/feedback", () => {
  it("有效 rating 寫入並回 { ok: true }", async () => {
    const before = await countFeedback();
    const res = await request(app)
      .post("/api/feedback")
      .send({ type: "rating", toolSlug: "/tue", rating: 5 });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(await countFeedback()).toBe(before + 1);
  });

  it("honeypot（website 被填）→ 回 200 但不寫入", async () => {
    const before = await countFeedback();
    const res = await request(app).post("/api/feedback").send({
      type: "rating",
      toolSlug: "/tue",
      rating: 4,
      website: "http://spam.example",
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(await countFeedback()).toBe(before);
  });

  it("time-trap（非 rating 且瞬間送出）→ 回 200 但不寫入", async () => {
    const before = await countFeedback();
    const res = await request(app).post("/api/feedback").send({
      type: "feedback",
      toolSlug: "/tue",
      rating: 3,
      message: "測試",
      loadedAt: Date.now(), // 距現在 < 1500ms
    });
    expect(res.status).toBe(200);
    expect(await countFeedback()).toBe(before);
  });

  it("rating 超出 1-5 → 400", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ type: "rating", toolSlug: "/tue", rating: 9 });
    expect(res.status).toBe(400);
  });

  it("未知 type → 400", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ type: "bogus", toolSlug: "/tue" });
    expect(res.status).toBe(400);
  });

  it("缺 toolSlug → 400", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ type: "rating", rating: 5 });
    expect(res.status).toBe(400);
  });

  it("error 類缺 errorType/description → 400", async () => {
    const res = await request(app).post("/api/feedback").send({
      type: "error",
      toolSlug: "/cases",
      loadedAt: Date.now() - 5000,
    });
    expect(res.status).toBe(400);
  });

  it("error 類齊全 → 寫入成功", async () => {
    const before = await countFeedback();
    const res = await request(app).post("/api/feedback").send({
      type: "error",
      toolSlug: "/cases",
      errorType: "案例資料錯誤",
      description: "某案例判罰年限標錯",
      loadedAt: Date.now() - 5000,
    });
    expect(res.status).toBe(200);
    expect(await countFeedback()).toBe(before + 1);
  });

  it("email 格式錯誤 → 400", async () => {
    const res = await request(app).post("/api/feedback").send({
      type: "feedback",
      toolSlug: "/tue",
      rating: 2,
      email: "not-an-email",
      loadedAt: Date.now() - 5000,
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/feedback/admin", () => {
  it("缺 secret → 401", async () => {
    const res = await request(app).get("/api/feedback/admin");
    expect(res.status).toBe(401);
  });

  it("錯誤 secret → 401", async () => {
    const res = await request(app)
      .get("/api/feedback/admin")
      .set("x-admin-secret", "wrong");
    expect(res.status).toBe(401);
  });

  it("正確 secret → 200 並回統計結構", async () => {
    const res = await request(app)
      .get("/api/feedback/admin")
      .set("x-admin-secret", "test-secret");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("overall");
    expect(res.body).toHaveProperty("byPage");
    expect(res.body).toHaveProperty("byType");
    expect(Array.isArray(res.body.byPage)).toBe(true);
    expect(res.body.overall.count).toBeGreaterThanOrEqual(1);
  });
});
