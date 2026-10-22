import { useState } from 'react';
import { Link } from 'react-router-dom';
import teaching from '../../../data/case-teaching.json';
import queue from '../../../data/case-evidence-queue.json';
const outcomeLabel = value => value == null ? '未知／未公開' : value ? '是' : '否（依既有來源）';
export default function CaseLearning() {
  const [priority,setPriority]=useState('P1');
  const [search,setSearch]=useState('');
  const pending=queue.records.filter(r=>(priority==='all'||r.priority===priority)&&`${r.caseId} ${r.athleteName}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="max-w-4xl mx-auto space-y-8">
    <header><h1 className="text-3xl font-bold">案例教學與證據待辦</h1><p className="mt-3 text-gray-700">30 案由既有核對紀錄挑選，涵蓋醫療用藥、污染、方法、程序、支援人員與上訴。以下事實沿用個案來源；角色行動與討論題為本站教學設計，不是當事人的原話。</p><p className="mt-2 text-gray-700">教材整理：{teaching.preparedAt}。{teaching.scope}</p><Link to="/editorial-policy" className="inline-block mt-3 text-primary-700 underline">閱讀編輯政策與更正方式</Link></header>
    <section className="space-y-3"><h2 className="text-xl font-bold">30 案精選教材</h2>{teaching.records.map(r=><details id={r.caseId} key={r.caseId} className="rounded-lg bg-white border border-gray-200 p-5"><summary className="font-bold cursor-pointer">{r.title}（{r.year}）</summary><div className="space-y-3 mt-4">
      <p className="text-sm text-amber-900">{r.ruleYearNote}</p><p className="text-sm text-gray-600">年份基準：{r.yearBasis}</p>
      <h3 className="font-bold">已核對事實</h3><p>{r.facts}</p><h3 className="font-bold">程序與結果</h3><p>既有文件程序標示：{r.procedure}</p><p>處理結果：{r.outcome.banDuration}；成績取消：{outcomeLabel(r.outcome.resultsCancelled)}；獎牌剝奪：{outcomeLabel(r.outcome.medalStripped)}</p><p>{r.outcome.otherPenalties}</p>
      <h3 className="font-bold">不確定性與閱讀限制</h3><ul className="list-disc pl-5">{r.uncertainty.map((u,i)=><li key={i}>{u}</li>)}</ul><p className="font-medium text-primary-800">{r.learningPoint}</p>
      <h3 className="font-bold">角色行動（教學建議）</h3><ul className="list-disc pl-5">{r.roleActions.map(a=><li key={a.role}><strong>{a.role}：</strong>{a.action}</li>)}</ul><h3 className="font-bold">討論題</h3><ol className="list-decimal pl-5">{r.discussionQuestions.map(q=><li key={q}>{q}</li>)}</ol>
      <h3 className="font-bold">來源與版本</h3><p className="text-sm">原來源查核：{r.sourceCheckedAt || '未記錄'}；定位：{r.sourceLocator || '未記錄'}。本次未新增原始證據查核。責任角色：{r.ownerRole}；下次複核：{r.nextReviewAt}。</p><ul className="space-y-2">{r.sources.map(s=><li key={s.url}><a className="text-primary-700 underline break-words" href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul><Link to={`/cases/${r.caseId}`} className="inline-block text-primary-700 underline">開啟完整案例與原審查說明</Link>
    </div></details>)}</section>
    <section id="evidence-queue" className="space-y-3"><h2 className="text-xl font-bold">517 案證據維護隊列</h2><p>{queue.scope} P1 是未解來源欄位、查核後主張變更或僅核對節錄；P2 優先追蹤未知結果；P3 定期追蹤。這是工作優先度，不是認定個案內容錯誤。</p>
      <div className="flex flex-wrap gap-3"><label>優先度 <select className="border rounded p-2" value={priority} onChange={e=>setPriority(e.target.value)}><option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option><option value="all">全部</option></select></label><label className="flex-1">搜尋案例 <input className="border rounded p-2 w-full" value={search} onChange={e=>setSearch(e.target.value)} /></label></div><p role="status">符合 {pending.length} 案</p>
      {pending.map(r=><details key={r.caseId} className="border rounded-lg p-4 bg-white"><summary className="cursor-pointer">{r.priority} · {r.athleteName} · {r.reviewStatus === 'core_checked' ? '既有核心核對' : '既有節錄／其他核對'}</summary><div className="mt-3 space-y-2 text-sm"><p>{r.nextAction}</p><p>責任角色：{r.ownerRole}；原查核日期：{r.sourceCheckedAt || '未知'}；複核期限：{r.nextReviewAt}</p><p>來源待解欄位：{r.unresolvedSourceFields.join('、') || '既有紀錄未列'}；查核後主張變更：{r.claimsChangedAfterReview == null ? '未知／未記錄' : r.claimsChangedAfterReview ? '是' : '否'}</p><p>成績取消：{outcomeLabel(r.resultsCancelled)}；獎牌剝奪：{outcomeLabel(r.medalStripped)}</p><p>來源定位：{r.sourceLocator || '未記錄'}</p><Link className="text-primary-700 underline" to={`/cases/${r.caseId}`}>開啟案例來源</Link></div></details>)}
    </section>
  </div>;
}
