import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import tueRouter from "../routes/tue.js";

// POST /api/tue/check 藥檢器（純內容，無需資料庫）。
// 斷言對齊 P0-1（胰島素 S4.4.2）與 P1-2（偽麻黃鹼 S6 賽內禁）資料修正。
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/tue", tueRouter);
  return app;
}

const app = makeApp();

describe("POST /api/tue/check 藥檢器", () => {
  it("缺 drugName → 400", async () => {
    const res = await request(app).post("/api/tue/check").send({});
    expect(res.status).toBe(400);
  });

  it("drugName 過長(>200) → 400", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "x".repeat(201) });
    expect(res.status).toBe(400);
  });

  it("drugName 非字串 → 400", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: 12345 });
    expect(res.status).toBe(400);
  });

  it("已知藥物 insulin → S4.4.2、需要 TUE（P0-1）", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "insulin" });
    expect(res.status).toBe(200);
    expect(res.body.drugName).toBe("insulin");
    expect(res.body.needsTUE).toBe(true);
    expect(res.body.wadaCategory).toMatch(/S4\.4\.2/);
  });

  it("偽麻黃鹼 pseudoephedrine → S6、賽內禁、免 TUE（P1-2）", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "Pseudoephedrine" }); // 大小寫不敏感
    expect(res.status).toBe(200);
    expect(res.body.needsTUE).toBe(false);
    expect(res.body.wadaCategory).toMatch(/S6/);
    expect(res.body.explanation).toMatch(/賽內/);
  });

  it("未知藥物 → needsTUE null + 未知分類", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "zzz-not-a-real-drug" });
    expect(res.status).toBe(200);
    expect(res.body.needsTUE).toBeNull();
    expect(res.body.wadaCategory).toBe("未知");
  });
});
