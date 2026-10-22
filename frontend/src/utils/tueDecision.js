import { S5_RULE_NOTE, S5_EXCEPTIONS_NOTE } from "../data/s5Rule.js";

// TUE 多步決策引擎（純函式，無 React／DOM 依賴，供 tools tab 決策工具使用）。
// 資料來源為後端 /api/tue/substances（backend/data/substances.json），
// 快速查詢與多步工具共用此判準；缺少條件時不推定允許。

export const ROUTE_LABELS = {
  inhaled: "吸入",
  oral: "口服",
  injection: "注射（關節內／肌腱周圍／肌肉／靜脈）",
  topical: "局部（皮膚／鼻／眼）",
  rectal: "直腸",
};

// 判定結果的顯示中繼資料（label + tone；tone 對應前端色票）
export const VERDICT_META = {
  permitted: { label: "允許使用", tone: "green" },
  "permitted-threshold": { label: "有條件允許（須確認閾值）", tone: "amber" },
  "conditions-required": { label: "需確認使用條件", tone: "amber" },
  "in-competition": { label: "僅賽內禁用（賽外允許）", tone: "amber" },
  "needs-tue": { label: "需申請 TUE", tone: "orange" },
  prohibited: { label: "禁用（實務極少獲准 TUE）", tone: "red" },
  monitored: { label: "允許（監控物質）", tone: "blue" },
  unknown: { label: "資料不足", tone: "gray" },
};

export function requiresS5Check(substance) {
  return substance?.s5ThresholdRule === true;
}

// 回傳某物質可供選擇的給藥途徑鍵；無途徑差異者回空陣列
export function availableRoutes(substance) {
  return substance && substance.routes ? Object.keys(substance.routes) : [];
}

// 判斷此物質是否需要「運動項目」這個維度（僅 P1 Beta 阻斷劑）
export function requiresSport(substance) {
  return !!substance && substance.prohibition === "sport-specific";
}

// 判斷此物質是否需要「賽內／賽外」這個維度。
// in-and-out（全時段禁）閾值賽內外一致，不需此維度；
// in-competition 與 sport-specific（部分精準運動僅賽內禁）才需要。
export function requiresCompetitionContext(substance) {
  if (!substance) return false;
  return (
    substance.prohibition === "in-competition" ||
    substance.prohibition === "sport-specific"
  );
}

// 無途徑差異物質的統一判準：無法獲准 TUE 者禁用，其餘需 TUE。
// （兩個「無 routes」分支共用同一準則，避免資料漂移時判準不一致）
function noRouteVerdict(substance) {
  return substance.tueEligible === false ? "prohibited" : "needs-tue";
}

// 依已選途徑產生判定；route 必須已存在於 substance.routes。
function routeResult(substance, route, { inCompetition, washout }) {
  const r = substance.routes[route];
  if (!Object.hasOwn(VERDICT_META, r.status)) {
    return { verdict: "unknown", reasons: ["此途徑的判定資料不完整，請諮詢專業人員"], washout };
  }
  const label = ROUTE_LABELS[route] || route;
  const prefix = inCompetition ? `賽內、${label}` : label;
  const reason = r.note ? `${prefix}：${r.note}` : prefix;
  return {
    verdict: r.status,
    reasons: [reason],
    threshold: r.threshold || null,
    routeNote: r.note || null,
    washout,
  };
}

/**
 * 依 途徑 × 賽內外 × 運動項目 推導 TUE 判定。
 * @param {object} substance - 單一物質資料（backend/data/substances.json 的一筆）
 * @param {object} opts
 * @param {string|null} opts.route - 給藥途徑鍵（inhaled/oral/...），無途徑差異者可為 null
 * @param {boolean} opts.inCompetition - 是否於賽內（預設 true，賽內較嚴格）
 * @param {string|null} opts.sport - 運動項目（僅 sport-specific 需要）
 * @returns {{verdict:string, reasons:string[], threshold?:string|null, washout?:string|null, sportRestricted?:string[]|null, routeNote?:string|null}}
 */
function evaluateContext(
  substance,
  { route = null, inCompetition = true, sport = null } = {},
) {
  if (!substance) {
    return { verdict: "unknown", reasons: ["查無此物質資料，請諮詢專業人員"] };
  }

  const prohibition = substance.prohibition;
  const washout = substance.washout || null;

  // 未列入禁用清單
  if (prohibition === "not-prohibited") {
    return {
      verdict: "permitted",
      reasons: ["未列入 WADA 禁用清單，一般允許使用"],
      washout,
    };
  }

  // 監控物質
  if (prohibition === "monitored") {
    return {
      verdict: "monitored",
      reasons: ["未列入禁用清單，屬監控計畫物質；一般允許但受監控"],
      washout,
    };
  }

  // 僅特定精準運動禁用（P1 Beta 阻斷劑）
  if (prohibition === "sport-specific") {
    const restrictedList = Array.isArray(substance.sportRestricted)
      ? substance.sportRestricted
      : [];
    const outOfCompList = Array.isArray(substance.sportRestrictedOutOfComp)
      ? substance.sportRestrictedOutOfComp
      : [];
    if (!sport) {
      return {
        verdict: "conditions-required",
        reasons: [
          "僅特定精準運動（如射箭、射擊）禁用；請選擇運動項目以精確判定",
        ],
        sportRestricted: restrictedList,
      };
    }
    if (!restrictedList.includes(sport)) {
      return {
        verdict: "permitted",
        reasons: [`${sport}非 P1 Beta 阻斷劑受限運動，一般允許使用`],
        sportRestricted: restrictedList,
      };
    }
    // 賽外受限項目由資料指定，包含射箭、射擊及列名的 CMAS 水下運動。
    if (outOfCompList.includes(sport)) {
      return {
        verdict: "needs-tue",
        reasons: [
          `${sport}賽內與賽外皆禁用 P1 Beta 阻斷劑；若有醫療需要須申請 TUE`,
        ],
        sportRestricted: restrictedList,
      };
    }
    if (typeof inCompetition !== "boolean") {
      return { verdict: "conditions-required", reasons: ["請確認賽內／賽外時段，以判定此運動項目的禁用條件"] };
    }
    if (inCompetition) {
      return {
        verdict: "needs-tue",
        reasons: [`${sport}賽內禁用 P1 Beta 阻斷劑；若有醫療需要須申請 TUE`],
        sportRestricted: restrictedList,
      };
    }
    return {
      verdict: "permitted",
      reasons: [`${sport}僅賽內禁用 P1 Beta 阻斷劑；賽外使用不禁，但須留意賽內檢體殘留。若有醫療需要，應向運動禁藥管制組織確認 TUE 要求`],
      sportRestricted: restrictedList,
    };
  }

  // 僅賽內禁用
  if (prohibition === "in-competition") {
    if (typeof inCompetition !== "boolean") {
      return { verdict: "conditions-required", reasons: ["請確認賽內／賽外時段，以及給藥途徑與適用閾值；賽外使用仍須留意賽內檢體殘留"], washout };
    }
    if (!inCompetition) {
      return {
        verdict: "permitted",
        reasons: [
          "僅賽內禁用；賽外使用不禁，但須留意賽內檢體殘留及清除期。若賽外治療導致賽內不利分析結果，必要時須申請回溯 TUE；應保留診療紀錄",
        ],
        washout,
      };
    }
    if (substance.routes) {
      if (!route) {
        return {
          verdict: "conditions-required",
          reasons: [
            "賽內禁用，請選擇給藥途徑以精確判定（部分途徑如吸入／局部允許）",
          ],
          washout,
        };
      }
      if (!substance.routes[route]) {
        return {
          verdict: "unknown",
          reasons: [
            `此物質無「${ROUTE_LABELS[route] || route}」途徑的對應資料，請諮詢專業人員`,
          ],
          washout,
        };
      }
      return routeResult(substance, route, { inCompetition: true, washout });
    }
    return {
      verdict: noRouteVerdict(substance),
      reasons: [substance.needsTUE ? "賽內禁用，須申請 TUE" : "賽內禁用"],
      washout,
    };
  }

  // 全時段禁用（賽內與賽外皆禁）
  if (prohibition === "in-and-out") {
    if (substance.routes) {
      if (!route) {
        return {
          verdict: "conditions-required",
          reasons: [
            "全時段禁用，請選擇給藥途徑（部分途徑如吸入受閾值允許，口服需 TUE）",
          ],
          washout,
        };
      }
      if (!substance.routes[route]) {
        return {
          verdict: "unknown",
          reasons: [
            `此物質無「${ROUTE_LABELS[route] || route}」途徑的對應資料，請諮詢專業人員`,
          ],
          washout,
        };
      }
      return routeResult(substance, route, { inCompetition: false, washout });
    }
    if (substance.tueEligible === false) {
      return {
        verdict: "prohibited",
        reasons: ["全時段禁用；因難以符合核准條件，實務上極少獲准 TUE"],
        washout,
      };
    }
    return {
      verdict: "needs-tue",
      reasons: ["全時段禁用；若有醫療需要須事先申請 TUE"],
      washout,
    };
  }

  return { verdict: "unknown", reasons: ["無法判定，請諮詢專業人員"] };
}

/** 依使用條件判定，再套用 S5 列名物質併用規則；不計算個人劑量或尿液濃度。 */
export function evaluateDrug(substance, opts = {}) {
  const result = evaluateContext(substance, opts);
  const s5Concomitant = opts.s5Concomitant || "unknown";
  const inCompetition = opts.inCompetition === undefined ? true : opts.inCompetition;
  const applies = requiresS5Check(substance)
    && (substance.prohibition === "in-and-out" || inCompetition !== false);
  const confirmedTiming = substance?.prohibition === "in-and-out" || inCompetition === true;
  const s5DrugWarning = "S5 利尿劑／掩蔽劑本身全時段禁用；本次判定僅針對所選藥物，不能作為整組用藥的許可。";

  if (s5Concomitant === "prohibited") {
    result.reasons.push(s5DrugWarning);
  }
  if (applies) {
    result.reasons.push(S5_RULE_NOTE);
    if (s5Concomitant === "prohibited" && confirmedTiming && result.verdict !== "unknown") {
      result.verdict = "needs-tue";
      result.threshold = null;
      result.routeNote = null;
      // 此時原途徑的劑量例外不能作為允許依據，直接使用併用規則說明。
      result.reasons = [S5_RULE_NOTE, s5DrugWarning];
    } else if (!["none", "exception"].includes(s5Concomitant) && result.verdict === "permitted-threshold") {
      result.verdict = "conditions-required";
      result.reasons.unshift("請先確認是否併用 S5 利尿劑／掩蔽劑，才能判讀閾值例外。");
    }
    if (s5Concomitant === "exception") result.reasons.push(S5_EXCEPTIONS_NOTE);
  }
  if (result.threshold) {
    result.reasons.push("本工具未計算你的實際劑量或尿液濃度；須由醫療人員確認符合下列限制，超出例外時應確認 TUE 要求。");
  }
  return result;
}

// 快速查詢未收集使用條件；不以 needsTUE=false 當作允許的依據。
export function summarizeDrug(result) {
  if (!result || result.matchedKey === null || result.needsTUE === null) {
    return { verdict: "unknown", reasons: ["查無資料不代表允許使用。請核對完整成分，並使用 TADA 藥物查詢或諮詢專業人員。"] };
  }
  return evaluateDrug(result, { inCompetition: null });
}
