import { useState, useEffect, useCallback } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { BarChart3, AlertTriangle, ExternalLink } from "lucide-react";
import { statsAPI } from "../services/api";
import { banDurationColor } from "../utils/banDurationColors";
import { majorEvents, evidenceCards } from "../data/statisticsEvidence";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);
const colors = ["#2563eb", "#059669", "#9333ea", "#d97706", "#e11d48", "#0891b2", "#4f46e5", "#65a30d", "#c2410c", "#64748b"];
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
};
const chartData = (rows) => ({
  labels: rows.map((row) => row.label),
  datasets: [{ label: "案例數", data: rows.map((row) => row.count), backgroundColor: rows.map((row, i) => row.color ?? colors[i % colors.length]) }],
});

function ChartPanel({ title, note, rows, doughnut = false }) {
  const description = rows.map((row) => `${row.label} ${row.count} 件`).join("、");
  return <section className="min-w-0 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-600 mt-2 mb-4">{note}</p>
    <div className="h-80" role="img" aria-label={`${title}：${description}`}>
      {doughnut
        ? <Doughnut data={chartData(rows)} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } }} />
        : <Bar data={chartData(rows)} options={options} />}
    </div>
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer text-primary-700 font-medium">查看圖表數值</summary>
      <table className="w-full mt-3 text-left">
        <caption className="sr-only">{title}數值表</caption>
        <thead><tr><th scope="col" className="py-2">分類</th><th scope="col" className="py-2 text-right">案例數</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.label} className="border-t border-gray-100"><th scope="row" className="py-2 font-normal">{row.label}</th><td className="py-2 text-right">{row.count}</td></tr>)}</tbody>
      </table>
    </details>
  </section>;
}

function Statistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sport, substance, ban, yearly, review] = await Promise.all([
        statsAPI.getSportDistribution(), statsAPI.getSubstanceDistribution(),
        statsAPI.getBanDurationDistribution(), statsAPI.getYearlyTrends(), statsAPI.getReviewSummary(),
      ]);
      setData({ sport: sport.data, substance: substance.data, ban: ban.data, yearly: yearly.data, review: review.data });
    } catch {
      setError("統計資料暫時無法載入，請重試。尚未取得的數字不會以預設值代替。");
      setData(null);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { document.title = "資料庫分析 | 乾淨運動從你我開始"; load(); }, [load]);

  if (loading) return <div role="status" className="py-16 text-center text-gray-600">載入資料庫分析中…</div>;
  if (error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6"><p>{error}</p><button onClick={load} className="mt-4 rounded-lg bg-primary-700 px-4 py-2 text-white">重新載入</button></div>;
  const { review } = data;
  const total = review.totalCases;
  const sportRows = data.sport.map((row) => ({ label: row.sport, count: row.count }));
  const substanceRows = data.substance.map((row) => ({ label: row.category, count: row.count }));
  const substanceTotal = substanceRows.reduce((sum, row) => sum + row.count, 0);
  const sourceRows = review.sourceDistribution.map((row) => ({ label: row.source, count: row.count }));
  const sourceLeader = sourceRows[0];
  const countryRows = (review.countryConfirmedDistribution ?? []).map((row) => ({ label: row.country, count: row.count }));

  return <div>
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">資料庫案例分析</h1>
      <p className="mt-3 text-gray-600">依目前收錄資料整理事件、來源與處分分布。最新案例查核日期：{review.lastReviewedAt || "未提供"}。</p>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />這是教學案例集，不是禁藥盛行率調查</p>
        <p className="mt-2">包含違規、污染、合法 TUE、未提出指控及處分撤銷等不同情境；案例數不等於違規人數。各來源公開程度及收錄策略不同，不能據此比較國家或運動項目的違規風險。</p>
      </div>
    </header>

    <nav aria-label="分析頁章節" className="flex flex-wrap gap-3 mb-6 text-sm text-emerald-800">
      <a className="underline underline-offset-4" href="#case-charts">分布圖表</a>
      <a className="underline underline-offset-4" href="#case-timeline">制度時間軸</a>
    </nav>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        [total, "收錄教學案例", `${review.newCases} 件新增＋${review.correctedLegacyCases} 件既有校正／分案`],
        [review.coreChecked, "核心事實已查核", `另 ${review.primaryExcerptChecked} 件為裁決主文核對`],
        [review.sourceCompared, "本輪獨立來源複核", "複核覆蓋不等於所有欄位均已確認"],
        [review.comparedByAtLeastTwo, "至少兩模型來源對讀", `其中 ${review.comparedByThree} 件由至少三模型對讀`],
      ].map(([number, label, detail]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-3xl font-bold text-primary-700">{number}</p><p className="mt-2 font-semibold text-gray-900">{label}</p><p className="mt-1 text-xs text-gray-600">{detail}</p>
      </div>)}
    </div>

    <details className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
      <summary className="font-bold text-gray-900 cursor-pointer">資料來源與查核方法：如何解讀這批資料</summary>
      <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-gray-700">
        {sourceLeader && <li>主要公開來源以 {sourceLeader.label} 最多，{sourceLeader.count}／{total} 件（{(sourceLeader.count / total * 100).toFixed(1)}%）；反映本次蒐集來源的分布，不代表該機構或地區違規較多。</li>}
        <li>官方文件的編輯查核與模型來源對讀分開計算。目前 {review.sourceCompared} 件取得模型對讀回覆，{review.comparedByAtLeastTwo} 件至少有兩個模型參與。覆蓋件數不代表所有欄位都已確認；模型提出的疑義仍須回到原文判定。</li>
        {review.modelCoverage && <li>各模型覆蓋：{Object.entries(review.modelCoverage).map(([model, count]) => `${model} ${count} 件`).join("、")}；其中 {review.comparedByFour} 件取得四個模型回覆。同一案例可由多個模型對讀，不能將各模型件數相加當作案例總數。</li>}
        {review.changedAfterModelReview > 0 && <li>{review.changedAfterModelReview} 件已依來源修正文字；模型回覆對應修正前的版本，修正版尚未再次送交模型對讀。</li>}
        {review.sourceDatesUnresolved > 0 && <li>{review.sourceDatesUnresolved} 件的來源日期有缺漏或歧義，個案頁有進一步說明。</li>}
        <li>國家／地區沿用來源描述，並非法律國籍認證。其中 {review.countryEvidencePending} 件依公告標題標示，代表國身分仍待補證，國家分布圖只計入其餘 {review.countryConfirmedDenominator} 件；也不能因此宣稱台灣選手排除條件已逐件獨立核實。</li>
        {review.countrySourceFollowups > 0 && <li>另於 {review.lastCountryFollowupAt} 為 {review.countrySourceFollowups} 件補充官方選手資料、代表隊或賽事紀錄，並另做國家欄位模型對讀。其中 {review.countryProfileAtLookup} 件依查閱時官方個人資料列國家，尚不能據此確認事件當時的代表資格；各案保留適用時期說明。</li>}
        <li>禁賽、公開警告、成績取消和獎牌處置是不同後果。未知不等於沒有，禁賽期間的減免與停算以個案說明為準。</li>
      </ul>
    </details>

    <div id="case-charts" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartPanel title="主要公開來源" note="依各案主要來源分組，每件只計一次；不等同裁決機構或所屬國家。" rows={sourceRows} />
      <ChartPanel title="運動項目分布（前十項）" note={`圖中涵蓋 ${sportRows.reduce((sum, row) => sum + row.count, 0)}／${total} 件，其餘項目未顯示；不可解讀為項目盛行率。`} rows={sportRows} />
      {countryRows.length > 0 && <ChartPanel title="國家／地區分布（已有國家來源）" note={`分母為國家欄位已有來源依據的 ${review.countryConfirmedDenominator}／${total} 件；另 ${review.countryEvidencePending} 件僅依公告標題標示，待補證前不計入此圖。前十五名以外合併為「其他國家／地區」；不可解讀為國家違規風險。`} rows={countryRows} />}
      <ChartPanel title="物質／規則標籤分布" note={`本圖納入已有物質／規則標籤的 ${substanceTotal}／${total} 件；另 ${total - substanceTotal} 件分類未核對或未標示，排除於本圖。前九種標籤以外合併為「其他標籤」；混合分類及非物質違規保留原標示，不當成單一 WADA 物質計數。`} rows={substanceRows} doughnut />
      <ChartPanel title="禁賽期限分布" note={`依個案公開處分文字分組，共 ${total} 件。「無禁賽」也可能包含公開警告或違規成立但免禁賽，不能視為全部無違規。`} rows={data.ban.map((row) => ({ label: row.category, count: row.count, color: banDurationColor(row.category) }))} />
      <div className="lg:col-span-2"><ChartPanel title="收錄案例年份分布" note="年份依個案事件年或裁決公布年，且收錄並不完整；不得解讀為每年違規發生率或上升下降趨勢。" rows={data.yearly.map((row) => ({ label: String(row.year), count: row.count }))} /></div>
    </div>

    <section className="mt-10 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 id="case-timeline" className="scroll-mt-24 text-xl font-bold text-gray-900">反禁藥事件與制度時間軸</h2>
      <p className="text-sm text-gray-600 mt-2">以下是有來源的背景整理；賽會、調查公布及裁決日期分別標明，不納入上方案例數。</p>
      <ol className="mt-5 space-y-5">{majorEvents.map((event) => <li key={event.year} className="border-l-2 border-primary-200 pl-4">
        <p className="text-sm font-bold text-primary-700">{event.year}</p><h3 className="font-bold mt-1">{event.title}</h3><p className="text-sm text-gray-700 mt-2">{event.description}</p><p className="text-sm text-gray-600 mt-1">{event.impact}</p>
        <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-700 underline text-sm mt-2">{event.sourceTitle}<ExternalLink className="h-3 w-3" /></a>
      </li>)}</ol>
    </section>

    <section className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
      <h2 className="text-xl font-bold text-gray-900 flex gap-2 items-center"><BarChart3 className="h-5 w-5" />外部研究：分母與適用範圍</h2>
      <p className="text-sm text-blue-900 mt-2">以下引用原始研究，與本站案例統計分開。研究中的關聯與檢出比例不能直接外推到所有運動員或產品。</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">{evidenceCards.map((card) => <article key={card.title} className="rounded-xl bg-white p-5">
        <h3 className="font-semibold text-gray-800">{card.title}</h3><p className="text-2xl font-bold text-primary-700 my-3">{card.value}</p><p className="text-sm text-gray-700 leading-relaxed">{card.body}</p>
        <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1 items-center text-sm text-primary-700 underline mt-4">{card.sourceTitle}<ExternalLink className="h-3 w-3 shrink-0" /></a>
      </article>)}</div>
    </section>
  </div>;
}

export default Statistics;
