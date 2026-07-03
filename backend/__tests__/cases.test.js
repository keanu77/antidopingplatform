import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ObjectId } from "mongodb";
import { SEED_CASES, waitForRoute } from "./_fixtures.js";

// /api/cases 路由整合測試：篩選、搜尋、分頁、單筆查詢。
let mongod;
let dbApi;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const dbMod = await import("../db.js");
  dbApi = dbMod.default || dbMod;
  await dbApi.connect();
  await dbApi.getDb().collection("cases").insertMany(SEED_CASES);

  const casesRouter = (await import("../routes/casesFixed.js")).default;
  app = express();
  app.use(express.json());
  app.use("/api/cases", casesRouter);

  await waitForRoute(app, "/api/cases?limit=1");
});

afterAll(async () => {
  if (dbApi) await dbApi.close();
  if (mongod) await mongod.stop();
});

describe("GET /api/cases", () => {
  it("回傳全部案例與分頁 metadata", async () => {
    const res = await request(app).get("/api/cases");
    expect(res.status).toBe(200);
    expect(res.body.totalCases).toBe(4);
    expect(Array.isArray(res.body.cases)).toBe(true);
    expect(res.body.cases).toHaveLength(4);
    expect(res.body.currentPage).toBe(1);
  });

  it("依 year 降序排列", async () => {
    const res = await request(app).get("/api/cases");
    const years = res.body.cases.map((c) => c.year);
    // 釘死確切排序結果（SEED 為 2016×2 / 2010 / 2000），而非只驗自我單調遞減
    expect(years).toEqual([2016, 2016, 2010, 2000]);
  });

  it("依 sport 篩選", async () => {
    const res = await request(app).get("/api/cases?sport=舉重");
    expect(res.body.totalCases).toBe(1);
    expect(res.body.cases[0].athleteName).toBe("Gamma Lifter");
  });

  it("依 year 篩選（2016 有兩筆）", async () => {
    const res = await request(app).get("/api/cases?year=2016");
    expect(res.body.totalCases).toBe(2);
  });

  it("依 nationality 篩選（美國兩筆）", async () => {
    const res = await request(app).get("/api/cases?nationality=美國");
    expect(res.body.totalCases).toBe(2);
  });

  it("文字搜尋比對 athleteName", async () => {
    const res = await request(app).get("/api/cases?search=Beta");
    expect(res.body.totalCases).toBe(1);
    expect(res.body.cases[0].athleteName).toBe("Beta Cyclist");
  });

  it("punishmentType=獎牌剝奪 只回傳 medalStripped 案例", async () => {
    const res = await request(app).get("/api/cases?punishmentType=獎牌剝奪");
    expect(res.body.totalCases).toBe(1);
    expect(res.body.cases[0].athleteName).toBe("Alpha Runner");
  });

  it("分頁：limit=2 → 每頁 2 筆、共 2 頁", async () => {
    const res = await request(app).get("/api/cases?limit=2&page=1");
    expect(res.body.cases).toHaveLength(2);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.limit).toBe(2);
  });

  it("搜尋字串過長(>200) → 400", async () => {
    const res = await request(app).get(`/api/cases?search=${"a".repeat(201)}`);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/cases/filters", () => {
  it("回傳去重後的篩選選項", async () => {
    const res = await request(app).get("/api/cases/filters");
    expect(res.status).toBe(200);
    expect(res.body.sports).toContain("舉重");
    expect(res.body.nationalities).toContain("美國");
    expect(res.body.years).toContain(2016);
  });
});

describe("GET /api/cases/:id", () => {
  it("有效 id → 回傳該筆案例", async () => {
    const doc = await dbApi
      .getDb()
      .collection("cases")
      .findOne({ athleteName: "Alpha Runner" });
    const res = await request(app).get(`/api/cases/${doc._id}`);
    expect(res.status).toBe(200);
    expect(res.body.athleteName).toBe("Alpha Runner");
  });

  it("不存在的有效 ObjectId → 404", async () => {
    const res = await request(app).get(`/api/cases/${new ObjectId()}`);
    expect(res.status).toBe(404);
  });
});
