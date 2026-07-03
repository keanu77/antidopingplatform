import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { SEED_CASES, waitForRoute } from "./_fixtures.js";

// /api/stats 路由整合測試：聚合統計與 banDuration 分類 pipeline。
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

  const statsRouter = (await import("../routes/statsFixed.js")).default;
  app = express();
  app.use(express.json());
  app.use("/api/stats", statsRouter);

  await waitForRoute(app, "/api/stats/overview");
});

afterAll(async () => {
  if (dbApi) await dbApi.close();
  if (mongod) await mongod.stop();
});

describe("GET /api/stats/overview", () => {
  it("回傳總數與各維度不重複計數", async () => {
    const res = await request(app).get("/api/stats/overview");
    expect(res.status).toBe(200);
    expect(res.body.totalCases).toBe(4);
    expect(res.body.uniqueSports).toBe(4);
    expect(res.body.uniqueCountries).toBe(3);
    expect(res.body.uniqueSubstances).toBe(4);
  });
});

describe("GET /api/stats/yearly-trends", () => {
  it("依年份升序聚合，2016 有兩筆", async () => {
    const res = await request(app).get("/api/stats/yearly-trends");
    expect(res.status).toBe(200);
    const y2016 = res.body.find((r) => r.year === 2016);
    expect(y2016.count).toBe(2);
    const years = res.body.map((r) => r.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });
});

describe("GET /api/stats/sport-distribution", () => {
  it("回傳 {sport, count} 陣列", async () => {
    const res = await request(app).get("/api/stats/sport-distribution");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(4);
    expect(res.body[0]).toHaveProperty("sport");
    expect(res.body[0]).toHaveProperty("count");
  });
});

describe("GET /api/stats/substance-distribution", () => {
  it("將 S1.1 正規化為 'S1: 合成代謝劑'", async () => {
    const res = await request(app).get("/api/stats/substance-distribution");
    expect(res.status).toBe(200);
    const categories = res.body.map((r) => r.category);
    expect(categories).toContain("S1: 合成代謝劑");
  });
});

describe("GET /api/stats/ban-duration-distribution", () => {
  it("將 banDuration 歸類（終身/TUE 等）", async () => {
    const res = await request(app).get("/api/stats/ban-duration-distribution");
    expect(res.status).toBe(200);
    const categories = res.body.map((r) => r.category);
    expect(categories).toContain("終身禁賽"); // Beta「終身禁賽」
    expect(categories).toContain("無處罰 (TUE/合法)"); // Delta「無禁賽（TUE證明）」
    res.body.forEach((r) => expect(r).toHaveProperty("percentage"));
  });
});

describe("GET /api/stats/punishment-stats", () => {
  it("正確計數獎牌剝奪與成績取消", async () => {
    const res = await request(app).get("/api/stats/punishment-stats");
    expect(res.status).toBe(200);
    expect(res.body.medalStripped).toBe(1); // Alpha
    expect(res.body.resultsCancelled).toBe(2); // Alpha + Beta
  });
});

describe("GET /api/stats/country-distribution", () => {
  it("美國聚合為 2 筆", async () => {
    const res = await request(app).get("/api/stats/country-distribution");
    expect(res.status).toBe(200);
    const us = res.body.find((r) => r.country === "美國");
    expect(us.count).toBe(2);
  });
});
