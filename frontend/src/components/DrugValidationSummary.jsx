import validation from "../data/drugValidation.json";

export default function DrugValidationSummary() {
  return <details className="mb-5 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
    <summary className="cursor-pointer font-semibold text-gray-900">與 TADA 的抽樣查驗：範圍與限制</summary>
    <div className="mt-3 space-y-3 leading-relaxed">
      <p>固定版本 {validation.snapshot}，查驗日期 {validation.checkedAt}。隨機抽取 {validation.sampleSize} 筆西藥，已有 {validation.referenceFound} 筆取得許可證相符的參考。</p>
      <p><strong>{validation.directAgreement} 筆可直接比較，賽內外狀態均一致。</strong>這部分占原始樣本 74.6%；尚不能換算為整個資料庫的準確率。</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>{validation.localUnresolved} 筆本機判讀仍待確認。</li>
        <li>{validation.referenceConditional} 筆參考結果附有使用條件。</li>
        <li>{validation.sourceConflict} 筆有配方／來源衝突，不能直接比較。</li>
        <li>{validation.referenceMissing} 筆尚未取得可用參考。</li>
      </ul>
      <p>另做 {validation.supplementalContexts.total} 個條件情境測試：{validation.supplementalContexts.agreement} 個一致、{validation.supplementalContexts.unresolved} 個未定、{validation.supplementalContexts.pendingConflict} 個 riociguat／CMAS 潛在誤判可用。此情境在目前發布版已改為需專業確認，適用範圍仍待裁定；歷史測試結果保留。</p>
      <p>本摘要描述固定快照，並非目前發布版的重新抽樣驗證。目前版本另保留正式站的來源審核與糖皮質激素劑量條件，部分判讀較固定快照保守。新增產品參考有 400 筆，其成分仍可能與開發資料重疊；結果尚未經獨立臨床裁定，中藥與營養品也不在這次樣本範圍內。</p>
      <p>西藥資料每月產生更新候選，通過資料品質檢查及審核後才發布；規則有年度適用期限。來源沒有成分、條件不明或查無資料時，都不能視為允許使用。</p>
    </div>
  </details>;
}
