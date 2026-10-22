import { useMemo, useState } from "react";
import { ExternalLink, ArrowLeft, AlertTriangle } from "lucide-react";
import { assessDrugProduct, DRUG_RULE_VERSION, DRUG_SPORTS } from "../utils/drugAssessment.js";
import { taiwanDate } from "../utils/drugCatalog.js";

const tones = {
  restricted: "border-red-200 bg-red-50 text-red-950",
  conditional: "border-amber-200 bg-amber-50 text-amber-950",
  unresolved: "border-amber-200 bg-amber-50 text-amber-950",
  "outdated-rules": "border-red-200 bg-red-50 text-red-950",
  "no-listed-restriction": "border-sky-200 bg-sky-50 text-sky-950",
};
const verdictLabel = {
  "needs-tue": "禁用，醫療使用須確認 TUE", prohibited: "禁用",
  "conditions-required": "使用條件待確認", "permitted-threshold": "須符合閾值及例外條件",
  permitted: "此成分在所選條件下未見禁用限制", monitored: "監控物質，未列禁用",
  unknown: "未完成對照", "in-competition": "賽內禁用",
};
const fieldClass = "mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200";
const External = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-4">{children}<ExternalLink size={14} aria-hidden="true" /><span className="sr-only">（另開分頁）</span></a>;

export default function DrugProductDetail({ product, manifest, onClose, headingRef }) {
  const [route, setRoute] = useState("");
  const [sport, setSport] = useState("");
  const [concomitant, setConcomitant] = useState("unknown");
  const [date, setDate] = useState(taiwanDate);
  const context = useMemo(() => ({ route: route || null, sport: sport || null, s5Concomitant: concomitant, date }), [route, sport, concomitant, date]);
  const inside = useMemo(() => assessDrugProduct(product, { ...context, inCompetition: true }), [product, context]);
  const outside = useMemo(() => assessDrugProduct(product, { ...context, inCompetition: false }), [product, context]);
  const today = taiwanDate();
  const expired = product.validUntil && product.validUntil < today;
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-8" aria-labelledby="drug-detail-heading">
      <button type="button" onClick={onClose} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:underline"><ArrowLeft size={16} />返回搜尋結果</button>
      <p className="mb-2 text-sm text-gray-500">{product.license} · {product.dosageForm || "劑型未提供"}</p>
      <h2 id="drug-detail-heading" ref={headingRef} tabIndex={-1} className="scroll-mt-28 break-words text-2xl font-bold text-gray-900 focus:outline-none">{product.nameZh || product.nameEn}</h2>
      <p className="mt-2 break-words text-sm text-gray-600">{product.nameEn}</p>
      {(product.cancellation || expired) && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">許可證提醒：{product.cancellation || "來源有效期限已過"}。這是許可證資料紀錄，不代表目前仍可販售；請向 TFDA 與藥師確認。</p>}

      <fieldset className="my-6 rounded-lg bg-gray-50 p-4">
        <legend className="px-1 text-base font-semibold text-gray-900">確認使用條件</legend>
        <p className="mb-4 text-sm text-gray-600">以下條件會同時套用至賽內、賽外判讀。請依實際用法選擇，不能僅從劑型推定。</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">給藥途徑<select className={fieldClass} value={route} onChange={(e) => setRoute(e.target.value)}>
            <option value="">尚未確認</option><option value="oral">口服／口腔黏膜</option><option value="inhaled">吸入</option><option value="injection">注射（任何注射途徑）</option><option value="topical">局部（皮膚／鼻／眼／耳等）</option><option value="rectal">直腸</option>
          </select></label>
          <label className="text-sm font-medium text-gray-700">運動項目<select className={fieldClass} value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="">尚未確認</option>{DRUG_SPORTS.map((item) => <option key={item} value={item}>{item}</option>)}<option value="其他運動">其他運動（確認不屬上述項目）</option>
          </select></label>
          <label className="text-sm font-medium text-gray-700">是否併用 S5 利尿劑／掩蔽劑<select className={fieldClass} value={concomitant} onChange={(e) => setConcomitant(e.target.value)}>
            <option value="unknown">尚未確認</option><option value="none">已確認沒有併用</option><option value="prohibited">有併用禁用的 S5 物質</option><option value="exception">已由專業人員確認符合 S5 例外</option>
          </select></label>
          <label className="text-sm font-medium text-gray-700">使用日期<input type="date" className={fieldClass} required value={date} onChange={(e) => setDate(e.target.value)} /></label>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2" aria-live="polite">
        {[["比賽期間", inside], ["非比賽期間", outside]].map(([label, result]) => <div key={label} className={`rounded-lg border p-4 ${tones[result.verdict]}`}>
          <p className="text-sm font-medium">{label} · WADA {result.ruleYear}</p>
          <p className="mt-2 text-lg font-bold">{result.label}</p>
          <p className="mt-2 text-sm">{result.unknownCount > 0 ? `${result.unknownCount} 個成分名稱／途徑仍待確認。` : "請一併閱讀各成分的條件與注意事項。"}</p>
        </div>)}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">賽內通常自比賽前一天 23:59 起至比賽及相關採樣結束；特定運動可能有經 WADA 核准的不同定義。</p>

      <h3 className="mb-3 mt-7 text-lg font-bold text-gray-900">逐一核對成分</h3>
      {!inside.ingredients.length && <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-950">來源未提供成分，無法判讀。</p>}
      <div className="space-y-3">
        {inside.ingredients.map((item, i) => <details key={item.name} className="rounded-lg border border-gray-200 p-4" open={inside.ingredients.length < 3}>
          <summary className="cursor-pointer break-words font-medium text-gray-900">{item.name}<span className="ml-2 text-sm font-normal text-gray-600">{item.wadaCode && item.wadaCode !== "none" ? item.wadaCode : item.key ? "已對應" : "待確認"}</span></summary>
          <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
            {[["賽內", item.assessment], ["賽外", outside.ingredients[i].assessment]].map(([label, result]) => <div key={label}>
              <p className="font-semibold text-gray-800">{label}：{verdictLabel[result.verdict] || "需專業確認"}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600">{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              {result.threshold && <p className="mt-2 font-medium text-amber-950">限制：{result.threshold}</p>}
              {result.washout && <p className="mt-2 text-gray-600">清除期參考：{result.washout}</p>}
            </div>)}
          </div>
        </details>)}
      </div>

      <div className="mt-6 flex gap-3 rounded-lg bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <ul className="space-y-2">{inside.notices.map((notice) => <li key={notice}>{notice}</li>)}</ul>
      </div>

      <h3 className="mb-3 mt-7 text-lg font-bold text-gray-900">TFDA 藥品許可證資料</h3>
      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {[["許可證字號", product.license], ["許可證狀態", product.cancellation || "來源未標示註銷（不等於保證有效）"], ["有效期限", product.validUntil], ["最近異動日期", product.changedOn], ["許可證種類", product.licenseType], ["藥品類別", product.drugCategory], ["申請商", product.applicant], ["製造商", product.manufacturers.join("、")], ["適應症", product.indication]].map(([label, value]) => <div key={label}>
          <dt className="text-gray-500">{label}</dt><dd className="mt-1 break-words text-gray-900">{value || "來源未提供"}</dd>
        </div>)}
      </dl>
      {product.ingredients.length > 0 && <details className="mt-5 rounded-lg border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-medium">查看原始處方成分及含量（{product.ingredients.length} 列）</summary>
        <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs">
          <thead><tr className="border-b text-gray-500"><th className="p-2">成分／代碼</th><th className="p-2">處方標示</th><th className="p-2">含量／原文描述</th></tr></thead>
          <tbody>{product.ingredients.map((d, i) => <tr key={i} className="border-b border-gray-100"><td className="p-2">{d.name}<br /><span className="text-gray-500">{d.code}</span></td><td className="p-2">{d.basis || "未提供"}</td><td className="p-2">{[d.amount, d.unit].filter(Boolean).join(" ")}<br />{d.amountText || "未提供描述"}</td></tr>)}</tbody>
        </table></div>
        <p className="mt-2 text-xs text-gray-500">含量為原資料照錄，可能以鹽類或等價活性成分表示；不自動換算成個人用藥劑量。</p>
      </details>}
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm">
        <External href="https://www.check-antidoping.org.tw/inquiry.php?category=2">前往 TADA 核對商品</External>
        <External href={DRUG_RULE_VERSION.sourceUrl}>WADA 2026 原始清單</External>
        <External href={manifest.sources.licenses.dataset}>TFDA 藥品資料來源</External>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-gray-500">資料取得時間：{new Date(manifest.retrievedAt).toLocaleString("zh-TW")}。{manifest.attribution}</p>
    </section>
  );
}
