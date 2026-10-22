import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { registry, assessEvidence } from '../../../shared/content-evidence.mjs';
import EvidenceLinks from '../components/EvidenceLinks';

export default function ContentSources() {
  const [params] = useSearchParams();
  const selectedId = params.get('id') || '';
  return <SourceRegistry key={selectedId} selectedId={selectedId} />;
}

function SourceRegistry({ selectedId }) {
  const [query, setQuery] = useState(selectedId);
  const entries = Object.entries(registry.entries).filter(([id,e]) => `${id} ${e.title}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="max-w-4xl mx-auto space-y-8">
    <header><h1 className="text-3xl font-bold">來源、規則版本與核對紀錄</h1><p className="mt-3 text-gray-700">完整盤點 50 項藥物、16 題正式測驗及 70 題舊題庫。來源核對與臨床簽核是不同程序；尚無逐項具名專業簽核紀錄。</p><Link to="/editorial-policy" className="inline-block mt-3 text-primary-700 underline">編輯政策與內容更正</Link></header>
    <section id="rule-transition" className="rounded-lg border border-amber-200 bg-amber-50 p-5 space-y-3">
      <h2 className="text-xl font-bold">2026／2027 規則交接</h2>
      <p>目前平台啟用的藥物規則為 2026 清單，有效期間為 2026-01-01 至 2026-12-31。WADA 已於 2026-09-21 公布 2027 清單，官方生效日為 2027-01-01。</p>
      <p>2027 版在本平台仍為「已公布、未啟用」。完成逐項來源核對、差異更新、日期與判定測試後，才會另行發布。跨年不會自動把舊規則標成新版；過期、缺證據或逾複核日會停止確定判定。</p>
      <a className="block text-primary-700 underline" href={registry.sources['list-2027'].url} target="_blank" rel="noopener noreferrer">開啟 WADA 2027 官方公告、清單與修訂摘要</a>
      <p className="text-sm">公告及日期核對：2026-10-23；負責角色：規則內容維護編輯；下次複核：2026-12-31。這不是已完成 2027 全站內容審查的聲明。</p>
    </section>
    <section className="space-y-3"><h2 className="text-xl font-bold">逐項來源登錄</h2><p className="text-gray-700">44 項藥物已核對所列規則來源；6 項尚缺個別許可證據，工具顯示資料不足，不代表禁用。舊題庫僅第 1 題已核對，另外 69 題暫停答案評分。</p>
      <label className="block font-medium" htmlFor="source-search">搜尋藥物、題目或來源識別碼</label><input id="source-search" value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3" placeholder="例如 salbutamol、sc4、legacy-quiz" />
      <p role="status" className="text-sm text-gray-600">找到 {entries.length} 項</p>
      {entries.map(([id,e]) => <details key={id} open={selectedId === id || undefined} className="rounded-lg border border-gray-200 bg-white p-4">
        <summary className="cursor-pointer font-semibold">{e.title} <span className="font-normal text-sm">（{registry.statusLabels[e.verificationStatus]}）</span></summary>
        <p className="mt-3 text-sm text-gray-600">識別碼：{id} · {registry.versions[e.ruleVersion].label}</p>
        <p className="mt-2">{e.reviewScope}</p><p className="mt-2 text-sm">責任角色：{e.ownerRole}；複核期限：{e.nextReviewAt}；有效期間：{registry.versions[e.ruleVersion].effectiveFrom || "尚未確認"} 起，至 {registry.versions[e.ruleVersion].effectiveUntil || "尚未確認"} 前。</p>
        {!assessEvidence(id,e.ruleVersion).valid && <p className="mt-2 text-amber-800">{assessEvidence(id,e.ruleVersion).reason}</p>}
        <EvidenceLinks evidenceId={id}/><h3 className="font-semibold mt-3">修訂紀錄</h3><ul className="list-disc pl-5 text-sm">{e.history.map((h,i)=><li key={i}>{h.date}：{h.action}（{h.role}）</li>)}</ul>
      </details>)}
      {!entries.length && <p>沒有符合的登錄；查無資料不代表允許。</p>}
    </section>
    <Link to="/case-learning" className="text-primary-700 underline">查看 30 案教學與案例證據待辦</Link>
  </div>;
}
