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
    expect(res.body.matchedKey).toBeNull();
    expect(res.body.wadaCategory).toBe("未知");
  });
});

// P1-10：藥物資料改讀單一來源 substances.json，/check 支援別名比對並回傳結構化欄位。
describe("POST /api/tue/check 單一來源升級（P1-10）", () => {
  it("中文別名『胰島素』可查得 insulin", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "胰島素" });
    expect(res.status).toBe(200);
    expect(res.body.matchedKey).toBe("insulin");
    expect(res.body.needsTUE).toBe(true);
  });

  it("中文別名『利他能』可查得 methylphenidate", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "利他能" });
    expect(res.body.matchedKey).toBe("methylphenidate");
  });

  it("testosterone → needsTUE false 且 tueEligible false（實務極少獲准）", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "testosterone" });
    expect(res.body.needsTUE).toBe(false);
    expect(res.body.tueEligible).toBe(false);
    expect(res.body.wadaCategory).toMatch(/S1/);
  });

  it("回傳結構化欄位 prohibition / routes（salbutamol 途徑別）", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "salbutamol" });
    expect(res.body.prohibition).toBe("in-and-out");
    expect(res.body.routes.inhaled.status).toBe("permitted-threshold");
    expect(res.body.routes.oral.status).toBe("needs-tue");
  });

  it("糖皮質激素 prednisolone → 賽內、注射需 TUE、吸入允許（P1-11 依據）", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "prednisolone" });
    expect(res.body.prohibition).toBe("in-competition");
    expect(res.body.routes.injection.status).toBe("needs-tue");
    expect(res.body.routes.inhaled.status).toBe("permitted");
  });
});

// P1-11：決策工具需要完整結構化清單，由 GET /substances 提供。
describe("GET /api/tue/substances 單一來源清單", () => {
  it("回傳 substances map 與 _meta", async () => {
    const res = await request(app).get("/api/tue/substances");
    expect(res.status).toBe(200);
    expect(res.body.substances).toBeTruthy();
    expect(Object.keys(res.body.substances).length).toBeGreaterThanOrEqual(25);
    expect(res.body._meta).toBeTruthy();
  });

  it("propranolol 為 sport-specific 且含受限運動清單", async () => {
    const res = await request(app).get("/api/tue/substances");
    const p = res.body.substances.propranolol;
    expect(p.prohibition).toBe("sport-specific");
    expect(p.sportRestricted).toContain("射箭");
  });
});
