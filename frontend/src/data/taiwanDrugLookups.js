// 官方系統禁止被 iframe 嵌入（X-Frame-Options: SAMEORIGIN），且資料受著作權保護，
// 因此只提供另開分頁的深層連結，不轉載或代查其資料。
const LOOKUP_BASE = "https://www.check-antidoping.org.tw/inquiry.php?category=";

export const TAIWAN_DRUG_LOOKUPS = [
  { category: 1, label: "禁用物質", hint: "依 WADA 禁用清單查成分" },
  { category: 2, label: "西藥藥品", hint: "衛福部核可之西藥許可證" },
  { category: 3, label: "中藥藥品", hint: "衛福部核可之中藥許可證" },
  { category: 4, label: "營養品", hint: "國內外營養補充品" },
].map((item) => ({ ...item, url: `${LOOKUP_BASE}${item.category}` }));
