import { ExternalLink, X } from "lucide-react";
import { reviewProductEvidence } from "../utils/productEvidence.js";
import { taiwanDate } from "../utils/drugCatalog.js";

export default function ProductCatalogDetail({ product, manifest, onClose, headingRef }) {
  const herbal = product.category === "herbal";
  const evidence = reviewProductEvidence(product);
  const source = manifest.sources[product.sourceKey];
  const today = taiwanDate();
  return <section aria-label="商品詳細資料" className="my-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div className="border-b border-gray-200 p-5 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3"><p className="break-all text-sm text-gray-500">{product.referenceLabel}：{product.license}</p><button type="button" onClick={onClose} className="inline-flex shrink-0 items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><X size={16} />關閉</button></div>
      <h2 ref={headingRef} tabIndex={-1} className="scroll-mt-28 break-words text-2xl font-bold leading-snug text-gray-900 focus:outline-none">{product.nameZh || product.nameEn}</h2>
      {product.nameEn && <p className="mt-2 break-words text-sm text-gray-600">{product.nameEn}</p>}
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-gray-500">{herbal ? "製造廠" : "申請商"}</dt><dd className="mt-1 break-words text-gray-900">{product.applicant || "來源未提供"}</dd></div>
        <div><dt className="text-gray-500">{herbal ? "類別／劑型" : "登錄類別"}</dt><dd className="mt-1 text-gray-900">{[product.herbalType, product.dosageForm].filter(Boolean).join("／")}</dd></div>
        {herbal && <div><dt className="text-gray-500">方名</dt><dd className="mt-1 text-gray-900">{product.formulaName || "來源未提供"}</dd></div>}
        <div><dt className="text-gray-500">來源登錄狀態</dt><dd className="mt-1 text-gray-900">{product.registrationStatus}</dd></div>
        {product.validUntil && <div><dt className="text-gray-500">來源有效日期</dt><dd className="mt-1 text-gray-900">{product.validUntil}{product.validUntil < today ? "（已逾來源有效日期）" : ""}</dd></div>}
        {product.delistedOn && <div><dt className="text-gray-500">不再收載日期</dt><dd className="mt-1 text-gray-900">{product.delistedOn}{product.delistedOn > today ? "（來源預告）" : ""}；健保給付與藥證效期不同</dd></div>}
      </dl>
      {(product.sourceConflict || product.dateWarnings?.length > 0) && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">{product.sourceConflict ? "來源中同一代碼有不同商品紀錄，已分別保留，請先核對商品與製造廠。" : ""}{product.dateWarnings?.length > 0 ? "來源有格式異常的日期，未代為推定；可在下方查看原始欄位。" : ""}</p>}
    </div>
    <div className="space-y-6 p-5 sm:p-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <h3 className="font-bold">{evidence.label}</h3>
        <p className="mt-2 text-sm leading-relaxed">{herbal ? "健保品項表沒有提供完整藥材組成與含量。方名、單方名稱或收載狀態，均不足以判定實際產品的禁用風險。請攜帶藥袋與完整處方向中醫師、藥師或 TADA 核對。" : "食品登錄或健康食品許可，不等於運動禁藥檢驗。須另外確認實際配方、產品版本與批號；第三方檢測能降低風險，仍不能保證沒有禁用物質。"}</p>
        {!herbal && <p className="mt-2 text-sm font-semibold">{evidence.batchLabel}</p>}
      </div>
      <div><h3 className="font-semibold text-gray-900">{evidence.compositionLabel}</h3><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{product.ingredientSummary || "未提供；未依商品名推測或補入配方。"}</p></div>
      {!herbal && <div className="text-sm leading-relaxed text-gray-700">
        <h3 className="font-semibold text-gray-900">已收錄成分名稱的初步對照</h3>
        {!evidence.rulesCurrent ? <p className="mt-2">目前只支援 WADA 2026 列名規則；已超出適用日期，停止顯示成分對照。</p>
          : evidence.flags.length ? <ul className="mt-2 list-inside list-disc">{evidence.flags.map((flag) => <li key={flag.name} className="break-words">{flag.name}：{flag.code}，仍需核對期間、途徑及其他限制。</li>)}</ul>
          : <p className="mt-2">現有列名規則未找到需要提示的精確名稱對應。收錄規則與來源配方可能不完整，此結果不能當作「無禁藥」證明。</p>}
      </div>}
      <div className="flex flex-wrap gap-4 text-sm">
        <a className="inline-flex items-center gap-1 text-emerald-800 underline" href={`https://www.check-antidoping.org.tw/inquiry.php?category=${herbal ? 3 : 4}`} target="_blank" rel="noopener noreferrer">到 TADA 核對{herbal ? "中藥" : "營養品"}<ExternalLink size={14} /><span className="sr-only">（另開分頁）</span></a>
        {!herbal && <a className="inline-flex items-center gap-1 text-emerald-800 underline" href="https://www.usada.org/substances/supplement-connect/" target="_blank" rel="noopener noreferrer">USADA 營養品與檢測查證資源<ExternalLink size={14} /><span className="sr-only">（另開分頁）</span></a>}
      </div>
      <details className="border-t border-gray-200 pt-4 text-sm"><summary className="cursor-pointer font-semibold text-gray-700">官方來源與原始欄位</summary><p className="mt-3 leading-relaxed text-gray-600"><a className="text-emerald-800 underline" href={source.dataset} target="_blank" rel="noopener noreferrer">{source.name}</a> · 取得日期 {new Date(source.retrievedAt).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" })}{source.snapshotDate ? ` · 來源版本 ${source.snapshotDate}` : ""}</p><dl className="mt-3 divide-y divide-gray-100">{Object.entries(product.rawFields).filter(([, value]) => value !== null && value !== "").map(([key, value]) => <div key={key} className="grid gap-1 py-2 sm:grid-cols-[10rem_1fr]"><dt className="text-gray-500">{key}</dt><dd className="min-w-0 whitespace-pre-wrap break-words text-gray-700">{String(value)}</dd></div>)}</dl></details>
    </div>
  </section>;
}
