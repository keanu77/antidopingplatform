import { createDrugIndex, productShard, searchDrugIndex } from "../utils/drugCatalog.js";
import { matchDrugIngredient } from "../utils/drugAssessment.js";

let loading, manifest, index;
let catalogRoot, selectedCatalog;
const shardCache = new Map();

async function fetchJson(path, checksum) {
  const response = await fetch(path, { cache: checksum ? "default" : "no-cache", signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error("查詢資料暫時無法下載，請稍後重試。");
  const bytes = await response.arrayBuffer();
  if (checksum) {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hash = [...new Uint8Array(digest)].map((n) => n.toString(16).padStart(2, "0")).join("");
    if (hash !== checksum) throw new Error("藥品資料版本不一致，請重新載入；本次不顯示判讀。");
  }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new Error("藥品資料格式不正確，請重新載入。"); }
}

function fetchAsset(info, file) {
  const descriptor = info.files?.[file];
  if (!descriptor || !/^[a-f0-9]{64}$/.test(descriptor.sha256)) throw new Error("藥品資料缺少驗證資訊，請重新載入。");
  return fetchJson(`${catalogRoot}/${info.assetVersion}/${file}`, descriptor.sha256);
}

async function initialize(catalog = "drugs") {
  if (!["drugs", "herbal", "supplements"].includes(catalog) || (selectedCatalog && selectedCatalog !== catalog)) throw new Error("查詢分類不一致，請重新載入。");
  selectedCatalog = catalog;
  catalogRoot = catalog === "drugs" ? "/drug-data" : `/product-data/${catalog}`;
  if (!loading) {
    loading = (async () => {
      const info = await fetchJson(`${catalogRoot}/manifest.json`);
      if ((info.category || "drugs") !== catalog) throw new Error("資料來源分類不一致，請重新載入。");
      if (info.schemaVersion !== 1 || !/^[a-f0-9]{16}-v1$/.test(info.assetVersion)) throw new Error("不支援的藥品資料版本。");
      const data = await fetchAsset(info, "index.json");
      if (data.schemaVersion !== 1 || data.rows.length !== info.counts.products) throw new Error("藥品資料筆數驗證失敗。");
      const aliases = data.ingredients.map((name) => {
        const match = matchDrugIngredient(name);
        // The older single-substance tool also accepts brand names as aliases.
        // Do not make every product with paracetamol searchable as "普拿疼".
        return match ? [match.key, match.rule.displayName] : [];
      });
      index = createDrugIndex(data.rows.map(([id, license, nameZh, nameEn, dosageForm, cancellation, validUntil, ids]) => ({
        id, license, nameZh, nameEn, dosageForm, cancellation, validUntil,
        ingredientNames: ids.map((i) => data.ingredients[i]),
        searchAliases: ids.flatMap((i) => aliases[i]),
      })));
      manifest = info;
      return info;
    })().catch((error) => { loading = null; throw error; });
  }
  return loading;
}

async function detail(id) {
  const shard = productShard(id);
  if (!shardCache.has(shard)) {
    const file = `${shard}.json`;
    if (!manifest.files[file]) throw new Error("查無此藥品資料。");
    const data = await fetchAsset(manifest, file);
    if (shardCache.size >= 8) shardCache.delete(shardCache.keys().next().value);
    shardCache.set(shard, data);
  }
  const product = shardCache.get(shard)[id];
  if (!product) throw new Error("查無此藥品資料。");
  return product;
}

self.onmessage = async ({ data: { id, type, payload, catalog } }) => {
  try {
    await initialize(catalog);
    const result = type === "init" ? manifest : type === "search" ? searchDrugIndex(index, payload) : type === "detail" ? await detail(payload) : null;
    if (!result) throw new Error("不支援的查詢。");
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.name === "TimeoutError" ? "資料下載逾時，請確認網路後重試。" : error.message || "查詢失敗，請稍後重試。" });
  }
};
