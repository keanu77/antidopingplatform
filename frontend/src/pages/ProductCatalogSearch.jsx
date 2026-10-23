import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Database, RotateCcw, Search } from "lucide-react";
import CatalogNavigation from "../components/CatalogNavigation.jsx";
import ProductCatalogDetail from "../components/ProductCatalogDetail.jsx";
import { createDrugSearchClient } from "../services/drugSearch.js";

const labels = {
  herbal: { title: "中藥商品與來源查詢", label: "中藥", source: "健保署中藥用藥品項表", input: "商品名或健保藥品代碼", placeholder: "例如：麻黃湯、葛根湯、A061341", intro: "依商品名或健保藥品代碼找到單方與複方紀錄，再帶著完整處方向專業人員核對禁用風險。" },
  supplements: { title: "營養品與食品登錄查詢", label: "營養品", source: "TFDA 食品開放資料", input: "商品名、登錄成分或許可／核備字號", placeholder: "例如：魚油、CREATINE、健食字", intro: "查詢健康食品與輸入錠狀、膠囊狀食品的登錄資料。產品批號的運動禁藥檢測證明須另外查證。" },
};

export default function ProductCatalogSearch({ category }) {
  const config = labels[category];
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("id") || "";
  const [query, setQuery] = useState(params.get("q") || "");
  const [submitted, setSubmitted] = useState("");
  const [manifest, setManifest] = useState(null);
  const [results, setResults] = useState(null);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const client = useRef(null), generation = useRef(0), headingRef = useRef(null), inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const searchClient = createDrugSearchClient(category);
    client.current = searchClient;
    searchClient.request("init").then((data) => { if (active) setManifest(data); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; client.current = null; searchClient.close(); };
  }, [category, attempt]);

  useEffect(() => {
    if (!selectedId || !manifest || !client.current) return;
    let active = true;
    setDetailLoading(true); setProduct(null);
    client.current.request("detail", selectedId).then((data) => { if (active) { setProduct(data); setError(""); } })
      .catch((e) => { if (active) setError(e.message); }).finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [selectedId, manifest]);

  useEffect(() => {
    if (product && selectedId) { headingRef.current?.focus({ preventScroll: true }); headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }, [product, selectedId]);

  async function search(page = 1, value = query) {
    if (!client.current || !manifest) return;
    const activeClient = client.current, requestId = ++generation.current;
    setError(""); setBusy(true); setParams({ q: value }, { replace: true }); setProduct(null);
    try {
      const data = await activeClient.request("search", { query: value, page, limit: 20 });
      if (client.current === activeClient && requestId === generation.current) { setResults(data); setSubmitted(value); }
    } catch (e) {
      if (client.current === activeClient && requestId === generation.current) { setError(e.message); setResults(null); }
    } finally { if (client.current === activeClient && requestId === generation.current) setBusy(false); }
  }
  function clear() { generation.current++; setQuery(""); setSubmitted(""); setResults(null); setProduct(null); setError(""); setBusy(false); setParams({}, { replace: true }); inputRef.current?.focus(); }
  function closeDetail() { setParams(submitted ? { q: submitted } : {}, { replace: true }); setProduct(null); inputRef.current?.focus(); }

  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="mb-8 border-b border-gray-200 pb-7">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium tracking-wide text-emerald-800"><Database size={17} aria-hidden="true" />{config.source}</p>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{config.title}</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-gray-600">{config.intro}</p>
      <p className="mt-3 text-sm font-medium text-amber-900">查得到商品，不代表運動員可用。查無資料也不能排除禁用風險。</p>
      <CatalogNavigation />
    </div>
    <form onSubmit={(e) => { e.preventDefault(); search(); }} className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <label htmlFor="product-query" className="block text-sm font-semibold text-gray-900">{config.input}</label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input id="product-query" ref={inputRef} type="search" autoComplete="off" minLength={2} maxLength={100} required value={query} onChange={(e) => setQuery(e.target.value)} placeholder={config.placeholder} className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
        <button type="submit" disabled={!manifest || busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-7 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-50"><Search size={18} />{busy ? "查詢中" : "查詢"}</button>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-gray-500">保留來源歷史紀錄；找到商品後，請確認登錄日期與狀態。</p><button type="button" onClick={clear} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><RotateCcw size={14} />清除條件</button></div>
    </form>
    {!manifest && !error && <p role="status" className="my-6 text-sm text-gray-600">正在載入並驗證{config.label}查詢索引……</p>}
    {error && <div role="alert" className="my-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}{!manifest && <button type="button" className="ml-4 underline" onClick={() => { setError(""); setAttempt((n) => n + 1); }}>重新載入資料</button>}</div>}
    {manifest && <div className="my-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500"><span>{manifest.counts.products.toLocaleString()} 筆來源紀錄</span><span>取得：{new Date(manifest.retrievedAt).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" })}</span><span>{category === "herbal" ? `複方 ${manifest.counts.complex.toLocaleString()} 筆／單方 ${manifest.counts.single.toLocaleString()} 筆` : `健康食品 ${manifest.counts.healthFoods.toLocaleString()} 筆／輸入錠膠囊食品 ${manifest.counts.importedCapsules.toLocaleString()} 筆`}</span></div>}
    {detailLoading && selectedId && <p role="status" className="py-6 text-sm text-gray-600">正在讀取商品詳細資料……</p>}
    {selectedId && product?.id === selectedId && <ProductCatalogDetail key={product.id} product={product} manifest={manifest} headingRef={headingRef} onClose={closeDetail} />}
    {!selectedId && results && <section aria-label={`${config.label}搜尋結果`} aria-busy={busy}>
      <p role="status" className="mb-4 text-sm text-gray-700">「{submitted}」找到 <strong>{results.total.toLocaleString()}</strong> 筆紀錄</p>
      {results.total === 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><p className="font-semibold">沒有找到符合的商品</p><p className="mt-2 text-sm">目前只收錄上述官方資料範圍，不涵蓋全部市售商品。請核對商品名或識別字號；查無資料不代表可用。</p></div>}
      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">{results.results.map((row) => <article key={row.id} className="p-5 sm:p-6">
        <p className="mb-2 text-xs text-gray-500">{category === "herbal" ? "健保代碼" : "許可／核備字號"}：{row.license} · {row.dosageForm}{row.cancellation ? ` · ${row.cancellation}` : ""}</p>
        <button type="button" className="flex w-full items-start justify-between gap-3 text-left text-lg font-bold text-emerald-900 hover:underline" onClick={() => setParams({ q: submitted, id: row.id })}><span className="break-words">{row.nameZh || row.nameEn}</span><ArrowRight size={20} className="mt-1 shrink-0" aria-hidden="true" /></button>
        {row.nameEn && <p className="mt-1 break-words text-sm text-gray-500">{row.nameEn}</p>}
        {category === "supplements" && <p className="mt-3 line-clamp-2 break-words text-sm text-gray-700">來源成分欄：{row.ingredientNames.join("；") || "未提供"}</p>}
        <p className="mt-3 text-xs font-medium text-amber-900">{category === "herbal" ? "處方成分未提供，需另行核對" : "未提供運動禁藥批號檢測證明"}</p>
      </article>)}</div>
      {results.totalPages > 1 && <nav aria-label="查詢結果分頁" className="mt-5 flex items-center justify-between text-sm"><button type="button" disabled={busy || results.currentPage <= 1} onClick={() => search(results.currentPage - 1, submitted)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:opacity-40">上一頁</button><span>第 {results.currentPage} / {results.totalPages} 頁</span><button type="button" disabled={busy || results.currentPage >= results.totalPages} onClick={() => search(results.currentPage + 1, submitted)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:opacity-40">下一頁</button></nav>}
    </section>}
    {!results && !selectedId && <div className="my-7 rounded-xl bg-gray-50 p-5 text-sm leading-relaxed text-gray-700"><h2 className="font-semibold text-gray-900">這份資料可以確認什麼？</h2><p className="mt-2">{category === "herbal" ? "可核對健保品項的名稱、方名、製造廠與收載資訊。沒有提供完整處方、藥證效期及禁用物質判定；不會依方名自動補出藥材配方。" : "可核對 TFDA 登錄商品與來源提供的成分欄。健康食品資料只列保健功效相關成分，未必是完整配方；這份資料不涵蓋所有國際運動營養品或認證產品。"}</p></div>}
    {manifest && <details className="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-600"><summary className="cursor-pointer font-medium text-gray-800">資料來源、更新與涵蓋範圍</summary><div className="mt-3 space-y-3 leading-relaxed"><p>{manifest.attribution} <a className="text-emerald-800 underline" href={manifest.licenseUrl} target="_blank" rel="noopener noreferrer">授權條款</a></p><p>{manifest.scope}</p><p>資料為下載時快照，非即時同步。搜尋在瀏覽器執行，關鍵字不會送往 TADA。</p>{Object.entries(manifest.sources).map(([key, source]) => <p key={key}><a className="text-emerald-800 underline" href={source.dataset} target="_blank" rel="noopener noreferrer">{source.name}</a>{source.snapshotDate ? ` · 來源版本 ${source.snapshotDate}` : ""} · {source.rows.toLocaleString()} 列</p>)}</div></details>}
  </div>;
}
