import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowRight, Database, ExternalLink, RotateCcw } from "lucide-react";
import DrugProductDetail from "../components/DrugProductDetail.jsx";
import CatalogNavigation from "../components/CatalogNavigation.jsx";
import { createDrugSearchClient } from "../services/drugSearch.js";
import { DRUG_RULE_VERSION, matchDrugIngredient } from "../utils/drugAssessment.js";

function MatchSummary({ product }) {
  const matches = product.ingredientNames.map(matchDrugIngredient);
  const codes = [...new Set(matches.map((m) => m?.rule.wadaCode).filter((code) => code && code !== "none"))];
  const unknown = matches.filter((m) => !m).length;
  return <p className="mt-3 flex flex-wrap gap-2 text-xs">
    {codes.map((code) => <span key={code} className="rounded bg-amber-50 px-2 py-1 font-medium text-amber-900">{code} · 須核對條件</span>)}
    <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">{!matches.length ? "來源缺少成分" : unknown ? `${unknown} 個成分名稱待確認` : "已對應列名成分，請查看判讀"}</span>
  </p>;
}

export default function DrugSearch() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("id") || "";
  const [query, setQuery] = useState(params.get("q") || "");
  const [status, setStatus] = useState("all");
  const [manifest, setManifest] = useState(null);
  const [results, setResults] = useState(null);
  const [submitted, setSubmitted] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const client = useRef(null);
  const generation = useRef(0);
  const headingRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const searchClient = createDrugSearchClient();
    client.current = searchClient;
    searchClient.request("init").then((data) => { if (active) setManifest(data); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; client.current = null; searchClient.close(); };
  }, [attempt]);

  useEffect(() => {
    if (!selectedId || !manifest || !client.current) return;
    let active = true;
    setDetailLoading(true);
    setProduct(null);
    client.current.request("detail", selectedId).then((data) => {
      if (active) { setProduct(data); setError(""); }
    }).catch((e) => { if (active) setError(e.message); }).finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [selectedId, manifest]);

  useEffect(() => {
    if (product && selectedId) {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [product, selectedId]);

  async function search(page = 1, value = query) {
    if (!client.current || !manifest) return;
    const activeClient = client.current;
    const requestId = ++generation.current;
    setError(""); setBusy(true);
    setParams({ q: value }, { replace: true });
    setProduct(null);
    try {
      const data = await client.current.request("search", { query: value, status, page, limit: 20 });
      if (client.current === activeClient && requestId === generation.current) { setResults(data); setSubmitted(value); }
    } catch (e) {
      if (client.current === activeClient && requestId === generation.current) { setError(e.message); setResults(null); }
    } finally { if (client.current === activeClient && requestId === generation.current) setBusy(false); }
  }
  function clear() {
    generation.current++; setQuery(""); setStatus("all"); setSubmitted(""); setResults(null); setProduct(null); setError(""); setBusy(false);
    setParams({}, { replace: true }); inputRef.current?.focus();
  }
  function closeDetail() { setParams(submitted ? { q: submitted } : {}, { replace: true }); setProduct(null); inputRef.current?.focus(); }

  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="mb-8 border-b border-gray-200 pb-7">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium tracking-wide text-emerald-800"><Database size={17} aria-hidden="true" />台灣藥品開放資料</p>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">西藥商品與禁用成分查詢</h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">輸入藥袋上的商品名、英文成分或許可證字號，核對完整配方，再確認比賽期間與使用條件。</p>
      <p className="mt-3 text-sm font-medium text-amber-900">查無資料不代表可用。禁用判讀為初步對照，請以最新官方資訊與專業確認為準。</p>
      <CatalogNavigation />
    </div>

    <form onSubmit={(e) => { e.preventDefault(); search(); }} className="mb-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <label htmlFor="drug-query" className="block text-sm font-semibold text-gray-900">商品名、成分或許可證字號</label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input id="drug-query" ref={inputRef} type="search" autoComplete="off" minLength={2} maxLength={100} required value={query} onChange={(e) => setQuery(e.target.value)} placeholder="例如：普拿疼、tramadol、衛署藥製字第036167號" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
        <button type="submit" disabled={!manifest || busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-7 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-50"><Search size={18} />{busy ? "查詢中" : "查詢"}</button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="drug-status" className="text-sm text-gray-600">許可證範圍</label>
        <select id="drug-status" value={status} disabled={busy} onChange={(e) => { setStatus(e.target.value); setResults(null); }} className="max-w-full rounded-lg border border-gray-300 bg-white p-2 text-sm disabled:opacity-50"><option value="all">全部（含已註銷／已廢止）</option><option value="uncancelled">來源未標示註銷</option><option value="current">未註銷且來源有效日期未過</option></select>
        <button type="button" onClick={clear} className="ml-auto inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><RotateCcw size={14} />清除條件</button>
      </div>
      <p className="mt-4 text-xs text-gray-500">搜尋在你的瀏覽器中執行。首次使用會下載資料索引；不會將輸入的關鍵字送往 TADA。</p>
    </form>

    {!manifest && !error && <p role="status" className="my-6 text-sm text-gray-600">正在載入並驗證 TFDA 查詢索引，首次下載需要稍候……</p>}
    {error && <div role="alert" className="my-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}{!manifest && <button type="button" className="ml-4 underline" onClick={() => { setError(""); setAttempt((n) => n + 1); }}>重新載入資料</button>}</div>}

    {detailLoading && selectedId && <p role="status" className="py-6 text-sm text-gray-600">正在讀取藥品詳細資料……</p>}
    {selectedId && product?.id === selectedId && <DrugProductDetail key={product.id} product={product} manifest={manifest} onClose={closeDetail} headingRef={headingRef} />}

    {!selectedId && results && <section aria-label="藥品搜尋結果" aria-busy={busy}>
      <p role="status" className="mb-4 text-sm text-gray-700">「{submitted}」找到 <strong>{results.total.toLocaleString()}</strong> 筆許可證</p>
      {results.total === 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><p className="font-semibold">沒有找到符合的藥品</p><p className="mt-2 text-sm">請嘗試成分英文名、完整商品名或許可證字號。查無資料不代表不含禁用物質，請向藥師或 TADA 核對。</p></div>}
      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {results.results.map((row) => <article key={row.id} className="p-5 sm:p-6">
          <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-500"><span>{row.license}</span><span>· {row.dosageForm || "劑型未提供"}</span>{row.cancellation && <span className="rounded bg-gray-100 px-2 text-gray-700">{row.cancellation}</span>}</div>
          <button type="button" className="flex w-full items-start justify-between gap-3 text-left text-lg font-bold text-emerald-900 hover:underline" onClick={() => setParams({ q: submitted, id: row.id })}><span className="break-words">{row.nameZh || row.nameEn}</span><ArrowRight size={20} className="mt-1 shrink-0" aria-hidden="true" /></button>
          <p className="mt-1 break-words text-sm text-gray-500">{row.nameEn}</p>
          <p className="mt-3 line-clamp-2 break-words text-sm text-gray-700"><span className="text-gray-500">成分：</span>{row.ingredientNames.join("；") || "來源未提供"}</p>
          <MatchSummary product={row} />
        </article>)}
      </div>
      {results.totalPages > 1 && <nav aria-label="查詢結果分頁" className="mt-5 flex items-center justify-between text-sm">
        <button type="button" disabled={busy || results.currentPage <= 1} onClick={() => search(results.currentPage - 1, submitted)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:opacity-40">上一頁</button>
        <span>第 {results.currentPage} / {results.totalPages} 頁</span>
        <button type="button" disabled={busy || results.currentPage >= results.totalPages} onClick={() => search(results.currentPage + 1, submitted)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:opacity-40">下一頁</button>
      </nav>}
    </section>}

    {!results && !selectedId && <div className="my-7 grid gap-5 text-sm text-gray-600 sm:grid-cols-3">
      <div><h2 className="font-semibold text-gray-900">1. 找到正確商品</h2><p className="mt-2">確認品牌、劑型與許可證。相近商品名可能有不同配方。</p></div>
      <div><h2 className="font-semibold text-gray-900">2. 確認每個成分</h2><p className="mt-2">配方中任何未對應的成分都會保留「待確認」，不推定可用。</p></div>
      <div><h2 className="font-semibold text-gray-900">3. 核對使用條件</h2><p className="mt-2">給藥途徑、使用時段、運動項目與併用藥物都可能影響判讀。</p></div>
    </div>}

    {manifest && <details className="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-600"><summary className="cursor-pointer font-medium text-gray-800">資料來源、更新與涵蓋範圍</summary><div className="mt-3 space-y-3 leading-relaxed">
      <p>{manifest.attribution} <a className="text-emerald-800 underline" href={manifest.licenseUrl} target="_blank" rel="noopener noreferrer">授權條款</a></p>
      <p>資料為下載時的快照，不代表即時藥證狀態；請至原始來源核對最新資料。</p>
      <p>部分來源缺少成分，規則尚未涵蓋所有同類藥理作用物質；尚無逐商品的專業核准。</p>
      <p>WADA 規則適用期間：{DRUG_RULE_VERSION.effectiveFrom} 至 {DRUG_RULE_VERSION.effectiveThrough}，核對日期：{DRUG_RULE_VERSION.checkedAt}。產品許可證與禁用判讀屬不同資料層。</p>
      <a className="inline-flex items-center gap-1 text-emerald-800 underline" href="https://www.check-antidoping.org.tw/inquiry.php?category=2" target="_blank" rel="noopener noreferrer">到 TADA 官方系統核對<ExternalLink size={14} /></a>
    </div></details>}
  </div>;
}
