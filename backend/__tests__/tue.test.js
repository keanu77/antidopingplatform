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

  it("testosterone → 需申請 TUE 並由 TUEC 個案審查", async () => {
    const res = await request(app)
      .post("/api/tue/check")
      .send({ drugName: "testosterone" });
    expect(res.body.needsTUE).toBe(true);
    expect(res.body.tueEligible).toBe(true);
    expect(res.body.explanation).toContain("TUEC 個案審查");
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

// 講座對照補充的常用藥（2026-09）：清除期最長的 triamcinolone、非吸入例外的 terbutaline、
// 非禁用替代藥，以及監控物質 hydrocodone。
describe("POST /api/tue/check 講座補充藥物", () => {
  const check = (drugName) => request(app).post("/api/tue/check").send({ drugName });

  it("Kenalog（別名）→ triamcinolone，清除期含肌注 60 天", async () => {
    const res = await check("kenalog");
    expect(res.body.matchedKey).toBe("triamcinolone");
    expect(res.body.wadaCode).toBe("S9");
    expect(res.body.washout).toMatch(/60 天/);
  });

  it("terbutaline 吸入也須 TUE", async () => {
    const res = await check("terbutaline");
    expect(res.body.needsTUE).toBe(true);
    expect(res.body.routes.inhaled.status).toBe("needs-tue");
  });

  it("非禁用替代 atomoxetine／amlodipine 無需 TUE", async () => {
    for (const name of ["思銳", "amlodipine"]) {
      const res = await check(name);
      expect(res.body.prohibition).toBe("not-prohibited");
      expect(res.body.needsTUE).toBe(false);
    }
  });

  it("hydrocodone 屬監控計畫、未列禁用", async () => {
    const res = await check("hydrocodone");
    expect(res.body.prohibition).toBe("monitored");
  });

  it("meldonium → S4.4.3 全時段禁用、需 TUE", async () => {
    const res = await check("mildronate");
    expect(res.body.matchedKey).toBe("meldonium");
    expect(res.body.wadaCode).toBe("S4.4.3");
    expect(res.body.prohibition).toBe("in-and-out");
    expect(res.body.needsTUE).toBe(true);
  });

  it("大麻 → THC、S8 僅賽內禁用且屬濫用物質；CBD 不禁", async () => {
    const thc = await check("大麻");
    expect(thc.body.matchedKey).toBe("thc");
    expect(thc.body.prohibition).toBe("in-competition");
    expect(thc.body.explanation).toMatch(/150 ng\/mL/);
    expect(thc.body.explanation).toMatch(/濫用物質/);
    const cbd = await check("CBD");
    expect(cbd.body.prohibition).toBe("not-prohibited");
  });

  it("S5 分類名稱統一為「利尿劑與掩蔽劑」", async () => {
    const res = await check("spironolactone");
    expect(res.body.wadaCategory).toBe("S5: 利尿劑與掩蔽劑");
  });
});
