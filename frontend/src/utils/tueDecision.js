// TUE 多步決策引擎（純函式，無 React／DOM 依賴，供 tools tab 決策工具使用）。
// 資料來源為後端 /api/tue/substances（backend/data/substances.json），
// 本檔只負責「依 途徑 × 賽內外 × 運動項目」推導判定結果，不重複維護藥物資料。

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
  "permitted-threshold": { label: "允許（受閾值限制）", tone: "amber" },
  "in-competition": { label: "僅賽內禁用（賽外允許）", tone: "amber" },
  "needs-tue": { label: "需申請 TUE", tone: "orange" },
  prohibited: { label: "禁用（實務極少獲准 TUE）", tone: "red" },
  monitored: { label: "允許（監控物質）", tone: "blue" },
  unknown: { label: "資料不足", tone: "gray" },
};

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
export function evaluateDrug(
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
        verdict: "needs-tue",
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
    // 射箭、射擊：賽內與賽外皆禁；其餘精準運動：僅賽內禁
    if (outOfCompList.includes(sport)) {
      return {
        verdict: "needs-tue",
        reasons: [
          `${sport}賽內與賽外皆禁用 P1 Beta 阻斷劑；若有醫療需要須申請 TUE`,
        ],
        sportRestricted: restrictedList,
      };
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
      reasons: [`${sport}僅賽內禁用 P1 Beta 阻斷劑；賽外使用允許、不需 TUE`],
      sportRestricted: restrictedList,
    };
  }

  // 僅賽內禁用
  if (prohibition === "in-competition") {
    if (!inCompetition) {
      return {
        verdict: "permitted",
        reasons: ["僅賽內禁用；賽外使用允許、不需 TUE"],
        washout,
      };
    }
    if (substance.routes) {
      if (!route) {
        return {
          verdict: "needs-tue",
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
          verdict: "needs-tue",
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
