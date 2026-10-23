// Shared by the browser worker, asset builder and tests. No UI or network calls.
export function normalizeDrugText(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

export function taiwanDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function createDrugIndex(products) {
  return products.map((p) => ({
    id: p.id, license: p.license, nameZh: p.nameZh, nameEn: p.nameEn,
    dosageForm: p.dosageForm, cancellation: p.cancellation, validUntil: p.validUntil,
    ingredientNames: p.ingredientNames,
    terms: normalizeDrugText([p.license, p.nameZh, p.nameEn, ...p.ingredientNames, ...(p.searchAliases || [])].join("\n")),
  }));
}

export function searchDrugIndex(index, { query, status = "all", page = 1, limit = 20, today = taiwanDate() } = {}) {
  const term = normalizeDrugText(query);
  if (term.length < 2 || term.length > 100) throw new Error("請輸入 2 至 100 個字的商品名、成分或許可證字號。");
  if (!["all", "uncancelled", "current"].includes(status)) throw new Error("許可證篩選條件不正確。");
  if (!Number.isSafeInteger(page) || page < 1 || ![10, 20, 50, 100].includes(limit)) throw new Error("分頁條件不正確。");
  const terms = term.split(" ").filter(Boolean);
  const scored = [];
  for (const row of index) {
    if (status !== "all" && row.cancellation) continue;
    if (status === "current" && (!row.validUntil || row.validUntil < today)) continue;
    if (!terms.every((token) => row.terms.includes(token))) continue;
    const exact = [row.license, row.nameZh, row.nameEn].some((name) => normalizeDrugText(name) === term);
    scored.push({ row, score: (exact ? 100 : 0) + (!row.cancellation ? 10 : 0) + (row.validUntil >= today ? 1 : 0) });
  }
  scored.sort((a, b) => b.score - a.score || a.row.license.localeCompare(b.row.license, "zh-Hant"));
  const total = scored.length;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const results = scored.slice((currentPage - 1) * limit, currentPage * limit).map(({ row }) => {
    const { terms: _terms, ...product } = row;
    return product;
  });
  return { results, total, currentPage, totalPages, limit };
}

export function productShard(id) {
  if (!/^tw-[a-f0-9]{20}$/.test(id)) throw new Error("藥品識別碼格式不正確。");
  return id.slice(3, 5);
}
