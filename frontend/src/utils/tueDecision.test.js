import { describe, it, expect } from "vitest";
import {
  evaluateDrug,
  availableRoutes,
  requiresSport,
  requiresCompetitionContext,
  ROUTE_LABELS,
  VERDICT_META,
} from "./tueDecision.js";

// 貼近 backend/data/substances.json schema 的代表性樣本，
// 每種 prohibition 分支各一，用以驗證決策引擎邏輯（非資料正確性）。
const salbutamol = {
  prohibition: "in-and-out",
  needsTUE: false,
  tueEligible: true,
  routes: {
    inhaled: {
      status: "permitted-threshold",
      threshold: "24h≤1600µg 且 8h≤600µg",
    },
    oral: { status: "needs-tue" },
  },
  sportRestricted: null,
  washout: null,
};
const prednisolone = {
  prohibition: "in-competition",
  needsTUE: true,
  tueEligible: true,
  routes: {
    oral: { status: "needs-tue" },
    injection: { status: "needs-tue" },
    inhaled: { status: "permitted" },
    topical: { status: "permitted" },
  },
  sportRestricted: null,
  washout: "口服約 3 天",
};
const testosterone = {
  prohibition: "in-and-out",
  needsTUE: false,
  tueEligible: false,
  routes: null,
};
const insulin = {
  prohibition: "in-and-out",
  needsTUE: true,
  tueEligible: true,
  routes: null,
};
const methylphenidate = {
  prohibition: "in-competition",
  needsTUE: true,
  tueEligible: true,
  routes: null,
};
// 僅賽內禁用、無途徑差異、且不獲准 TUE（濫用物質）——in-competition 無 routes 的 false-branch
const cocaine = {
  prohibition: "in-competition",
  needsTUE: false,
  tueEligible: false,
  routes: null,
};
const propranolol = {
  prohibition: "sport-specific",
  needsTUE: true,
  tueEligible: true,
  routes: null,
  sportRestricted: ["射箭", "射擊", "高爾夫"],
  sportRestrictedOutOfComp: ["射箭", "射擊"],
};
const glucagon = { prohibition: "not-prohibited", needsTUE: false };
const codeine = { prohibition: "monitored", needsTUE: false };

describe("evaluateDrug — 全時段禁用 + 途徑差異（salbutamol）", () => {
  it("吸入 → 允許但受閾值限制，且帶出閾值", () => {
    const r = evaluateDrug(salbutamol, {
      route: "inhaled",
      inCompetition: true,
    });
    expect(r.verdict).toBe("permitted-threshold");
    expect(r.threshold).toContain("1600µg");
  });
  it("口服 → 需 TUE", () => {
    expect(evaluateDrug(salbutamol, { route: "oral" }).verdict).toBe(
      "needs-tue",
    );
  });
  it("同藥不同途徑回不同結果（P1-11 驗收）", () => {
    const inhaled = evaluateDrug(salbutamol, { route: "inhaled" }).verdict;
    const oral = evaluateDrug(salbutamol, { route: "oral" }).verdict;
    expect(inhaled).not.toBe(oral);
  });
  it("未選途徑 → 提示選途徑（needs-tue）", () => {
    const r = evaluateDrug(salbutamol, { route: null });
    expect(r.verdict).toBe("needs-tue");
    expect(r.reasons[0]).toContain("途徑");
  });
  it("傳入不存在的途徑（injection）→ unknown，且不當成未選途徑", () => {
    const r = evaluateDrug(salbutamol, { route: "injection" });
    expect(r.verdict).toBe("unknown");
    expect(r.reasons[0]).toContain("無");
  });
});

describe("evaluateDrug — 僅賽內禁用 + 途徑差異（糖皮質激素 prednisolone）", () => {
  it("賽內注射 → 需 TUE", () => {
    expect(
      evaluateDrug(prednisolone, { route: "injection", inCompetition: true })
        .verdict,
    ).toBe("needs-tue");
  });
  it("賽內吸入 → 允許", () => {
    expect(
      evaluateDrug(prednisolone, { route: "inhaled", inCompetition: true })
        .verdict,
    ).toBe("permitted");
  });
  it("賽內注射禁 vs 賽內吸入允許（P1-11 驗收）", () => {
    const inj = evaluateDrug(prednisolone, {
      route: "injection",
      inCompetition: true,
    }).verdict;
    const inh = evaluateDrug(prednisolone, {
      route: "inhaled",
      inCompetition: true,
    }).verdict;
    expect(inj).not.toBe(inh);
  });
  it("賽外任何途徑 → 允許（不需 TUE）", () => {
    expect(
      evaluateDrug(prednisolone, { route: "injection", inCompetition: false })
        .verdict,
    ).toBe("permitted");
  });
  it("賽內未選途徑 → needs-tue（提示選途徑）", () => {
    const r = evaluateDrug(prednisolone, { route: null, inCompetition: true });
    expect(r.verdict).toBe("needs-tue");
    expect(r.reasons[0]).toContain("途徑");
  });
  it("帶出 washout 資訊", () => {
    expect(
      evaluateDrug(prednisolone, { route: "oral", inCompetition: true }).washout,
    ).toBe("口服約 3 天");
  });
});

describe("evaluateDrug — 全時段禁用、無途徑差異", () => {
  it("testosterone（tueEligible=false）→ 禁用（實務極少獲准）", () => {
    expect(evaluateDrug(testosterone, {}).verdict).toBe("prohibited");
  });
  it("insulin（tueEligible=true）→ 需 TUE", () => {
    expect(evaluateDrug(insulin, {}).verdict).toBe("needs-tue");
  });
});

describe("evaluateDrug — 僅賽內禁用、無途徑差異", () => {
  it("methylphenidate 賽內 → 需 TUE；賽外 → 允許（同藥賽內外回不同結果，P1-11 驗收）", () => {
    expect(evaluateDrug(methylphenidate, { inCompetition: true }).verdict).toBe(
      "needs-tue",
    );
    expect(evaluateDrug(methylphenidate, { inCompetition: false }).verdict).toBe(
      "permitted",
    );
  });
  it("cocaine（不獲准 TUE）賽內 → 禁用；賽外 → 允許", () => {
    expect(evaluateDrug(cocaine, { inCompetition: true }).verdict).toBe(
      "prohibited",
    );
    expect(evaluateDrug(cocaine, { inCompetition: false }).verdict).toBe(
      "permitted",
    );
  });
});

describe("evaluateDrug — 特定精準運動（P1 Beta 阻斷劑 propranolol）", () => {
  it("射箭（賽內外皆禁）→ 賽內、賽外皆需 TUE", () => {
    expect(
      evaluateDrug(propranolol, { sport: "射箭", inCompetition: true }).verdict,
    ).toBe("needs-tue");
    expect(
      evaluateDrug(propranolol, { sport: "射箭", inCompetition: false }).verdict,
    ).toBe("needs-tue");
  });
  it("高爾夫（僅賽內禁）→ 賽內需 TUE、賽外允許（同運動賽內外回不同結果）", () => {
    expect(
      evaluateDrug(propranolol, { sport: "高爾夫", inCompetition: true })
        .verdict,
    ).toBe("needs-tue");
    expect(
      evaluateDrug(propranolol, { sport: "高爾夫", inCompetition: false })
        .verdict,
    ).toBe("permitted");
  });
  it("游泳（非受限運動）→ 允許", () => {
    expect(evaluateDrug(propranolol, { sport: "游泳" }).verdict).toBe(
      "permitted",
    );
  });
  it("受限運動禁 vs 非受限運動允許（P1-11 驗收）", () => {
    const restricted = evaluateDrug(propranolol, { sport: "射擊" }).verdict;
    const free = evaluateDrug(propranolol, { sport: "游泳" }).verdict;
    expect(restricted).not.toBe(free);
  });
  it("未選運動 → 提示選運動（needs-tue）", () => {
    const r = evaluateDrug(propranolol, { sport: null });
    expect(r.verdict).toBe("needs-tue");
    expect(r.reasons[0]).toContain("運動");
  });
});

describe("evaluateDrug — 未列入 / 監控 / 邊界", () => {
  it("glucagon（未列入）→ 允許", () => {
    expect(evaluateDrug(glucagon, {}).verdict).toBe("permitted");
  });
  it("codeine（監控）→ monitored", () => {
    expect(evaluateDrug(codeine, {}).verdict).toBe("monitored");
  });
  it("null → unknown", () => {
    expect(evaluateDrug(null, {}).verdict).toBe("unknown");
  });
  it("未知 prohibition 值 → unknown", () => {
    expect(evaluateDrug({ prohibition: "??" }, {}).verdict).toBe("unknown");
  });
});

describe("輔助函式", () => {
  it("availableRoutes 回傳途徑鍵；無途徑差異回空陣列", () => {
    expect(availableRoutes(salbutamol)).toEqual(["inhaled", "oral"]);
    expect(availableRoutes(insulin)).toEqual([]);
    expect(availableRoutes(null)).toEqual([]);
  });
  it("requiresSport 僅對 sport-specific 為真", () => {
    expect(requiresSport(propranolol)).toBe(true);
    expect(requiresSport(salbutamol)).toBe(false);
  });
  it("requiresCompetitionContext 對 in-competition / sport-specific 為真，in-and-out 為假", () => {
    expect(requiresCompetitionContext(prednisolone)).toBe(true);
    expect(requiresCompetitionContext(propranolol)).toBe(true);
    // in-and-out 閾值賽內外一致，不需此維度
    expect(requiresCompetitionContext(salbutamol)).toBe(false);
    expect(requiresCompetitionContext(glucagon)).toBe(false);
  });
  it("VERDICT_META 覆蓋所有可能 verdict（含 in-competition）、ROUTE_LABELS 含五途徑", () => {
    [
      "permitted",
      "permitted-threshold",
      "in-competition",
      "needs-tue",
      "prohibited",
      "monitored",
      "unknown",
    ].forEach((v) => expect(VERDICT_META[v]).toBeTruthy());
    expect(Object.keys(ROUTE_LABELS)).toHaveLength(5);
  });
});
