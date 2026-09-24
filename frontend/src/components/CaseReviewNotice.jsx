const labels = {
  core_checked: "核心事實已查核",
  primary_excerpt_checked: "裁決主文已核對",
  registry_checked: "官方名冊已核對",
  pending: "待逐案查核",
};

export default function CaseReviewNotice({ review, compact = false }) {
  const info = review ?? { status: "pending", caseType: "歷史資料（待逐案查核）" };
  return (
    <div className={`${compact ? "my-3 p-2 text-xs" : "mb-6 p-4 text-sm border border-blue-200"} rounded-lg bg-blue-50 text-blue-900`}>
      <p className="font-medium">{info.caseType} · {labels[info.status] ?? "待逐案查核"}</p>
      {info.countryEvidence?.status === "title_only" && <p className="mt-1 text-amber-800">國家身分待補證：公告標題不足以單獨確認代表國。</p>}
      {info.sourceComparison?.unresolvedSourceFields?.includes("dates") && <p className="mt-1 text-amber-800">來源日期有缺漏或歧義，請一併閱讀下方個案說明。</p>}
      {info.sourceComparison?.unresolvedSourceFields?.includes("event") && <p className="mt-1 text-amber-800">部分事件細節未見於公開來源，不推定採樣場合。</p>}
      {!compact && <>
        <p className="mt-1">{info.outcome ?? "尚未完成個案來源與最新裁決核對"}</p>
        {info.checkedAt && <p className="mt-1">查核日期：{info.checkedAt}。處分依查核時取得的來源記錄，不是即時參賽資格查詢。</p>}
        {info.status === "pending" && <p className="mt-1">本頁為歷史資料，請以個案官方裁決為準。</p>}
        {info.scope && <p className="mt-1">查核範圍：{info.scope}</p>}
        {info.nationalitySource && <p className="mt-1">國家／地區依據：<a className="underline" href={info.nationalitySource} target="_blank" rel="noopener noreferrer">官方來源（原文：{info.nationalityAsListed || "見來源"}）</a></p>}
        {info.countryEvidence?.note && <p className="mt-1">{info.countryEvidence.note}</p>}
        {info.countryEvidence?.checkedAt && <p className="mt-1">國家資料補查：{info.countryEvidence.checkedAt}；{info.countryEvidence.modelReview?.modelSeats?.join("、")} 對讀。本次範圍限國家來源及身分配對，未重審全部處分內容。</p>}
        {info.countryEvidence?.modelReview?.annotationUpdatedAfterReview && <p className="mt-1">國家補查的模型疑義已依官方資料處理；其後補入的來源或註記尚未再次送交模型。</p>}
        {info.countryFollowup?.resolution === "held" && <p className="mt-1 text-amber-800">國家資料補查（{info.countryFollowup.checkedAt}）仍待確認：{info.countryFollowup.note}</p>}
        {info.dateFollowup && <p className="mt-1 text-amber-800">日期補查（{info.dateFollowup.checkedAt}）：{info.dateFollowup.note}</p>}
        {info.sourceComparison?.modelSeats?.length > 0 && <p className="mt-1">來源交叉對讀：{info.sourceComparison.modelSeats.join("、")}。這表示已取得模型對讀回覆；疑義仍須依官方原文判定，不等於每個欄位均已確認。</p>}
        {info.sourceComparison?.claimsChangedAfterReview && <p className="mt-1">模型對讀後已依來源修正文字；本頁修正版尚未再次送交模型對讀。</p>}
        {info.sourceLocator && <p className="mt-1 break-words">官方紀錄定位：{info.sourceLocator}</p>}
      </>}
    </div>
  );
}
