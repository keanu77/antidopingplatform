import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import educationRouter from "../routes/education.js";

// GET /api/education/adrv（P1-7 反禁藥規則違反 ADRV + 運動精神價值 + 禁用清單三層結構）。
// 純靜態 JSON，無需資料庫。
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/education", educationRouter);
  return app;
}

const app = makeApp();

describe("GET /api/education/adrv", () => {
  it("回傳 status 200", async () => {
    const res = await request(app).get("/api/education/adrv");
    expect(res.status).toBe(200);
  });

  it("adrvTypes 為 11 類反禁藥規則違反", async () => {
    const res = await request(app).get("/api/education/adrv");
    expect(Array.isArray(res.body.adrvTypes)).toBe(true);
    expect(res.body.adrvTypes.length).toBe(11);
  });

  it("spiritValues 為 12 項運動精神價值", async () => {
    const res = await request(app).get("/api/education/adrv");
    expect(Array.isArray(res.body.spiritValues)).toBe(true);
    expect(res.body.spiritValues.length).toBe(12);
  });

  it("第 2.11 條存在且標註為 2021 新增", async () => {
    const res = await request(app).get("/api/education/adrv");
    const article211 = res.body.adrvTypes.find((t) => t.code === "2.11");
    expect(article211).toBeTruthy();
    expect(article211.isNew2021).toBe(true);
  });

  it("運動員權利為 2021 新增的運動精神價值", async () => {
    const res = await request(app).get("/api/education/adrv");
    const newValue = res.body.spiritValues.find((v) => v.isNew2021 === true);
    expect(newValue).toBeTruthy();
    expect(newValue.valueEn).toMatch(/Athletes/);
  });

  it("listStructure 含 allTimes / inCompetition / particularSports 三層", async () => {
    const res = await request(app).get("/api/education/adrv");
    expect(res.body.listStructure).toBeTruthy();
    expect(res.body.listStructure.allTimes).toBeTruthy();
    expect(res.body.listStructure.inCompetition).toBeTruthy();
    expect(res.body.listStructure.particularSports).toBeTruthy();
  });
});
