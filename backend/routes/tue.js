const express = require("express");
const router = express.Router();

// WADA禁藥數據庫 (簡化版)
const substancesData = require("../data/substances.json");
const wadaSubstances = substancesData.substances;

// Get full structured substance list (single source of truth for
// the front-end drug checker and multi-step decision tool)
router.get("/substances", (req, res) => {
  res.json(substancesData);
});

// 依標準鍵、別名或顯示名（小寫精確比對）查找物質；找不到回 null
function lookupSubstance(query) {
  const q = query.toLowerCase().trim();
  if (wadaSubstances[q]) return { key: q, info: wadaSubstances[q] };

  for (const [key, info] of Object.entries(wadaSubstances)) {
    const aliases = (info.aliases || []).map((a) => String(a).toLowerCase());
    const display = (info.displayName || "").toLowerCase();
    if (aliases.includes(q) || display === q) {
      return { key, info };
    }
  }
  return null;
}

// Drug TUE check
router.post("/check", (req, res) => {
  const { drugName } = req.body;

  if (!drugName) {
    return res.status(400).json({ error: "請提供藥物名稱" });
  }

  // P0: 輸入長度驗證
  if (typeof drugName !== "string" || drugName.length > 200) {
    return res.status(400).json({ error: "藥物名稱過長或格式不正確" });
  }

  const match = lookupSubstance(drugName);

  if (match) {
    const { key, info } = match;
    res.json({
      drugName: drugName,
      matchedKey: key,
      displayName: info.displayName,
      needsTUE: info.needsTUE,
      wadaCode: info.wadaCode,
      // 向後相容欄位名（wadaCategory / explanation）
      wadaCategory: info.categoryLabel,
      prohibition: info.prohibition,
      tueEligible: info.tueEligible,
      routes: info.routes,
      sportRestricted: info.sportRestricted,
      washout: info.washout,
      explanation: info.note,
    });
  } else {
    // 未找到藥物資訊
    res.json({
      drugName: drugName,
      matchedKey: null,
      needsTUE: null,
      wadaCategory: "未知",
      explanation: `未找到 "${drugName}" 的資訊。建議：1) 檢查藥物名稱是否正確 2) 諮詢醫療專業人員 3) 查閱最新WADA禁用清單 4) 聯繫相關運動禁藥管制組織確認`,
    });
  }
});

module.exports = router;
