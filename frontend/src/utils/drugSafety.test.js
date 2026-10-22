import { describe, it, expect } from "vitest";
import data from "../../../backend/data/substances.json";
import { evaluateDrug, VERDICT_META } from "./tueDecision.js";
import { checkResultVerdict } from "../components/tue/verdictStyle.js";

const { substances } = data;
const lookup = (key) => ({ ...substances[key], matchedKey: key });

describe("快速查詢與情境判定使用相同安全邊界", () => {
  it.each(["salbutamol", "formoterol", "salmeterol", "vilanterol", "prednisolone", "pseudoephedrine", "propranolol"])("%s：尚無途徑／賽內外／運動條件不能宣告允許", (key) => {
    expect(checkResultVerdict(lookup(key))).toBe("conditions-required");
    expect(checkResultVerdict(lookup(key))).toBe(evaluateDrug(substances[key], { inCompetition: null }).verdict);
  });
  it.each([null, {}, { matchedKey: null, needsTUE: null }, { matchedKey: "future", needsTUE: false, prohibition: "future-rule" }])("缺少或未知規則保持資料不足：%j", (result) => {
    expect(checkResultVerdict(result)).toBe("unknown");
  });
  it("明確允許、監控與全時段禁用仍可區分", () => {
    expect(checkResultVerdict(lookup("guanfacine"))).toBe("permitted");
    expect(checkResultVerdict(lookup("codeine"))).toBe("monitored");
    expect(checkResultVerdict(lookup("insulin"))).toBe("needs-tue");
    expect(checkResultVerdict(lookup("clenbuterol"))).toBe("prohibited");
    expect(VERDICT_META["conditions-required"].tone).toBe("amber");
  });
});

describe("S5 併用規則：依 WADA 列名與適用時段", () => {
  const listed = ["salbutamol", "formoterol", "pseudoephedrine", "ephedrine", "methylephedrine"];
  it("現有資料僅標記列名閾值物質，不擴張至所有 Beta-2 激動劑", () => {
    expect(Object.keys(substances).filter((key) => substances[key].s5ThresholdRule).sort()).toEqual([...listed].sort());
  });
  it.each(listed)("%s：未確認併用不得給予閾值允許", (key) => {
    const drug = substances[key];
    const route = drug.routes.inhaled ? "inhaled" : "oral";
    expect(evaluateDrug(drug, { route }).verdict).toBe("conditions-required");
    expect(evaluateDrug(drug, { route, s5Concomitant: "invalid" }).verdict).toBe("conditions-required");
    expect(evaluateDrug(drug, { route, s5Concomitant: "none" }).verdict).toBe("permitted-threshold");
    expect(evaluateDrug(drug, { route, s5Concomitant: "exception" }).verdict).toBe("permitted-threshold");
    const combined = evaluateDrug(drug, { route, s5Concomitant: "prohibited" });
    expect(combined.verdict).toBe("needs-tue");
    expect(combined.threshold).toBeNull();
    expect(combined.reasons.join(" ")).toMatch(/各自.*TUE/);
  });
  it.each(["salmeterol", "vilanterol"])("%s 不套用 S5 的列名閾值規則，但仍提醒 S5 藥物本身禁用", (key) => {
    const result = evaluateDrug(substances[key], { route: "inhaled", s5Concomitant: "prohibited" });
    expect(result.verdict).toBe("permitted-threshold");
    expect(result.reasons.join(" ")).toMatch(/S5.*本身/);
  });
  it("S6 賽外不誤判為需額外 TUE，保留 S5 本身禁用與賽內殘留提醒", () => {
    const result = evaluateDrug(substances.pseudoephedrine, { route: "oral", inCompetition: false, s5Concomitant: "prohibited" });
    expect(result.verdict).toBe("permitted");
    expect(result.reasons.join(" ")).toMatch(/賽內檢體殘留/);
    expect(result.reasons.join(" ")).toMatch(/S5.*本身/);
  });
  it("S3 賽外仍須套用併用規則；例外不能放行口服", () => {
    expect(evaluateDrug(substances.salbutamol, { route: "inhaled", inCompetition: false, s5Concomitant: "prohibited" }).verdict).toBe("needs-tue");
    expect(evaluateDrug(substances.salbutamol, { route: "oral", s5Concomitant: "exception" }).verdict).toBe("needs-tue");
  });
  it("已選途徑但未確認適用時段時保持待確認", () => {
    expect(evaluateDrug(substances.pseudoephedrine, { route: "oral", inCompetition: null, s5Concomitant: "none" }).verdict).toBe("conditions-required");
    expect(evaluateDrug(substances.propranolol, { sport: "高爾夫", inCompetition: null }).verdict).toBe("conditions-required");
    expect(evaluateDrug(substances.pseudoephedrine, { route: "oral", inCompetition: null, s5Concomitant: "prohibited" }).verdict).toBe("conditions-required");
  });
  it("未知途徑狀態不產生無法顯示的結果，也不因併用而放行", () => {
    const drug = { ...substances.salbutamol, routes: { inhaled: { status: "future-rule" } } };
    expect(evaluateDrug(drug, { route: "inhaled", s5Concomitant: "prohibited" }).verdict).toBe("unknown");
  });
});
