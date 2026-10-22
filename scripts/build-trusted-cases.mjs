import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root)));
const write = (path, value) => writeFileSync(new URL(path, root), JSON.stringify(value, null, 2) + '\n');
const cases = read('data/cases.json');
const selection = read('data/case-teaching-selection.json');
const actions = {
  tue: ['保存處方、成分、途徑、使用及賽程日期；核對TUE涵蓋範圍。','協助確認參賽層級及主管機構，保存申請往來。','備妥診斷與治療紀錄；區分處方、申報、追溯與未來TUE。'],
  contamination: ['保存產品、批號、包裝、購買及使用紀錄，避免自行推定污染。','協助追溯供應鏈與接觸紀錄，區分聲稱與已採信的事實。','記錄臨床用藥及可能來源，檢驗與法律因果判定交由合格機構。'],
  procedure: ['核對採樣通知；有疑慮當場記錄並尋求代表協助。','協助運動員理解採樣義務、代表權利與程序記錄。','完整記錄可能影響採樣的醫療情況，不以處方替代程序義務。'],
  whereabouts: ['更新行蹤並保存異動及通知紀錄。','協助行程協調及提醒，不修改或補造紀錄。','如有醫療影響，保存當時可核實的診療時間與資料。'],
  method: ['除成分外，保存輸注總量、時間、地點及目的。','協助確認醫療場所與賽程，避免將宣傳圖片當作完整事實。','區分方法與物質規則，記錄醫療例外及TUE依據。'],
  support: ['記錄藥物來源與接觸者，保護其他人隱私。','建立分藥、標籤與產品保管流程，禁止擅自給予不明物質。','確認照護者提供資訊，核對實際藥品及用藥紀錄。'],
  appeal: ['保存各階段裁決與通知，尋求具相關資格的法律協助。','更新團隊資料，以最新已知裁決區分各指控結果。','保留提供給程序的原始診療證據，不把法律結果當作臨床因果證明。'],
  year: ['保存事件當年的查詢及適用規則。','將舊案教學與今日用藥流程分開，查閱當年度規則。','核對當時藥物、途徑及TUE；新清單不等同自動追溯核准。'],
  source: ['保存原始通知及文件日期，不以摘要取代裁決。','比對官方名冊與個案文件，記下不一致及採信理由。','提供可核實的醫療日期；未知資料維持未知。'],
  records: ['保留真實病歷與處方，不補造事後證明。','保存程序往來與期限，協助提供原始證據。','如需更正病歷，留下更正時間、原因及原紀錄。'],
  sanction: ['理解本案適用條件，勿以他人刑期推算自己的結果。','分開記錄禁賽期間、參與限制、成績取消與減免。','提供真實醫療證據；處分與TUE核准均須個案程序。'],
  team: ['確認個人與接力隊成績處理的不同範圍。','依裁決記錄隊伍後果，不套用未列明的集體責任。','區分已成立違規與未追究的發現，保存原始說明。'],
};
const records = selection.records.map(item => {
  const c = cases.find(c => c.id === item.caseId);
  if (!c || c.review?.status !== 'core_checked' || c.review.sourceComparison?.claimsChangedAfterReview || c.review.sourceComparison?.unresolvedSourceFields?.length) throw new Error(`Selection needs evidence review: ${item.caseId}`);
  return {
    caseId: c.id, title: `${c.athleteName}｜${c.review.caseType}`, topic: item.topic,
    year: c.year, yearBasis: c.yearBasis || '未另列年份基準',
    facts: c.eventBackground, procedure: c.registryRecordAsPublished?.resolution || c.review.caseType,
    outcome: c.punishment, learningPoint: c.educationalNotes,
    uncertainty: [c.review.scope, ...(c.review.auditNotes || []), ...['resultsCancelled','medalStripped'].filter(k => c.punishment[k] == null).map(k => `${k === 'resultsCancelled' ? '成績取消' : '獎牌剝奪'}：現有紀錄未知，不能當作「沒有」。`)],
    roleActions: ['選手','教練／支援人員','醫療人員'].map((role,i) => ({role, action: actions[item.topic][i]})),
    discussionQuestions: [item.question, `依原來源，${c.athleteName}案有哪些已確認、僅為當事人說法或未公開的事項？下一步須找哪份文件？`],
    ruleYearNote: `這是${c.year}年事件／公告的歷史教學；適用當年及當時程序規則，不以2026或2027清單倒推本案。今日用藥須另查現行規範。`,
    sourceCheckedAt: c.review.checkedAt, sourceLocator: c.review.sourceLocator,
    sources: c.sourceLinks, originalReviewStatus: c.review.status,
    preparedAt: selection.selectedAt, newVerificationPerformed: false,
    ownerRole: '案例教學編輯', nextReviewAt: '2026-12-31',
  };
});
write('data/case-teaching.json', { schemaVersion: 1, preparedAt: selection.selectedAt, scope: selection.selectionScope, records });
const queue = cases.map(c => {
  const review = c.review || {};
  const unresolvedSourceFields = review.sourceComparison?.unresolvedSourceFields || [];
  const claimsChangedAfterReview = review.sourceComparison?.claimsChangedAfterReview ?? null;
  const urgent = unresolvedSourceFields.length > 0 || claimsChangedAfterReview === true || review.status !== 'core_checked';
  const unknownOutcome = c.punishment?.resultsCancelled == null || c.punishment?.medalStripped == null;
  return {
    caseId: c.id, athleteName: c.athleteName, reviewStatus: review.status || 'unknown',
    sourceCheckedAt: review.checkedAt || null, sourceLocator: review.sourceLocator || null,
    unresolvedSourceFields, claimsChangedAfterReview,
    resultsCancelled: c.punishment?.resultsCancelled ?? null, medalStripped: c.punishment?.medalStripped ?? null,
    priority: urgent ? 'P1' : unknownOutcome ? 'P2' : 'P3',
    queueStatus: urgent ? 'needs_source_review' : 'scheduled_followup',
    ownerRole: '案例證據維護編輯', nextReviewAt: '2026-12-31',
    nextAction: urgent ? '核對未解欄位、修改後主張或節錄證據；保留原審查範圍。' : unknownOutcome ? '若有新裁決，優先補核未公開的結果欄位；不得將未知改為否。' : '定期追蹤後續裁決或更正；本次未重新開啟全部個案來源。',
    newVerificationPerformed: false,
  };
});
write('data/case-evidence-queue.json', { schemaVersion: 1, generatedAt: selection.selectedAt, scope: '依現有狀態產生維護隊列，不是517案新查核報告。', records: queue });
console.log(JSON.stringify({teaching:records.length,queue:queue.length,priorities:queue.reduce((a,q)=>(a[q.priority]=(a[q.priority]||0)+1,a),{})}));
