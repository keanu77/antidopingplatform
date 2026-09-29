// TUE 制度內容（基礎知識／申請指引／工具分頁共用）。
// 依據：WADA ISTUE（2023 年 1 月版）、World Anti-Doping Code 2021、2026 禁用清單。
// 2027/1/1 起 2027 Code 與新版 ISTUE 生效，條號與細節屆時需統一在此檔更新。

export const ISTUE_VERSION = "ISTUE 2023";

export const tueDefinition = {
  summary:
    "運動員因病必須使用禁用清單上的物質或方法時，經運動禁藥管制組織的 TUE 審查委員會（TUEC，至少 3 名醫師）審查、事先核准的合法用藥許可。取得核可後使用，不構成違反運動禁藥管制規則。",
  is: "因病、有醫療必要、經審查核准的合法用藥途徑；讓有病的運動員不必在治療與參賽之間二選一。",
  isNot: "不是合法禁藥、不是拿牌捷徑，也不是事後補救的漏洞。核准範圍明確、效期有限。",
};

// ISTUE 2023 第 4.2 條：四項條件須同時成立
export const approvalCriteria = [
  {
    code: "4.2(a)",
    title: "有醫療必要",
    body: "該禁用物質或方法是治療一項有相關臨床證據支持、已診斷的醫療狀況所必需。",
    note: "醫療文件要足以讓委員在未見到病人的情況下，做出與主治醫師相同的診斷。",
  },
  {
    code: "4.2(b)",
    title: "不超過回復正常健康",
    body: "依蓋然性權衡，治療用途不會產生超出回復正常健康狀態的額外運動表現提升。",
    note: "TUE 是把生病的人拉回正常，不是把正常人推得更高；例如睪固酮補到超過正常範圍就不符合。",
  },
  {
    code: "4.2(c)",
    title: "沒有合理的替代治療",
    body: "該物質或方法是此病況的適應症治療，且沒有合理、允許的替代治療。",
    note: "不以先試用其他方法並失敗為要件，但醫師要說明為何非禁用替代不適用。",
  },
  {
    code: "4.2(d)",
    title: "不是先前違規使用的後果",
    body: "使用的必要性並非（全部或部分）先前未經 TUE 使用禁用物質或方法所造成。",
    note: "例：濫用外源性睪固酮導致自身分泌被抑制，再以此申請睪固酮 TUE，會被這條擋下。",
  },
];

export const criteriaFootnote =
  "舉證責任在運動員，標準為蓋然性權衡（balance of probabilities）。四大條件自 2021 年版 ISTUE 起列在第 4.2 條（2023 年版沿用；2019 年以前為第 4.1 條），現行第 4.1 條規範的是追溯 TUE 的例外情形。";

// 申請時程：依物質禁用時段區分
export const timingRules = [
  {
    title: "全時段禁用物質（S0～S5、M1～M3）",
    body: "賽內與賽外皆禁用，確診需要治療時就應儘速申請，不必等到比賽前。",
  },
  {
    title: "僅賽內禁用物質（S6～S9）",
    body: "原則上至少於下一場比賽前 30 天申請，或依賽事主辦單位訂定的截止日期。",
    note: "賽內期：運動員表定參賽前一日 23:59 起，至比賽與檢體採集流程結束為止。",
  },
  {
    title: "特定運動禁用（P1 Beta 阻斷劑）",
    body: "射箭（WA）、射擊（ISSF／IPC），以及 CMAS 自由潛水、魚槍捕魚、水下標靶射擊的所有分項，賽內與賽外皆禁用；汽車運動（FIA）、撞球（WCBS）、飛鏢（WDF）、高爾夫（IGF）、迷你高爾夫（WMF）僅賽內禁用。",
    note: "申請時程依該運動屬「賽內外皆禁」或「僅賽內禁」而定，請對照最新版禁用清單 P1 適用運動。",
  },
];

export const reviewTimeline = [
  {
    tone: "ok",
    text: "TUEC 原則上於收到「完整」申請資料起 21 個日曆天內作成決定；缺文件會被退回補件，不起算 21 天。",
  },
  {
    tone: "warn",
    text: "因特殊情況延後申請時，如距賽事少於 21 天，不保證於賽事前完成審查。",
  },
  {
    tone: "info",
    text: "非國家級運動員：通常不需於使用前申請；如被檢測並出現不利分析結果，可提出追溯 TUE 申請。",
  },
];

// 申請對象（依運動員層級）
export const applicantLevels = [
  {
    level: "國際級運動員",
    to: "向所屬國際單項運動總會（IF）申請",
    note: "常見包含需填報行蹤的 TP／RTP 運動員、參與總會特定賽事者；是否屬國際級由各 IF 規則界定。",
  },
  {
    level: "國家級運動員及非國家級運動員",
    to: "向中華運動禁藥防制基金會（CTADA）申請",
    note: "CTADA 區分「國家級」與「休閒級」運動員，申請表與檢查表可於官網下載。",
  },
  {
    level: "參與大型國際賽事",
    to: "依賽事主辦單位（MEO）的競賽規程辦理",
    note: "如奧運、亞運、世界錦標賽；不確定層級時，請詢問所屬單項協會或 CTADA。",
  },
];

export const applicationSteps = [
  {
    title: "備齊醫療文件",
    body: "由醫師整理診斷依據、檢查或影像結果、治療計畫與替代方案評估。",
  },
  {
    title: "醫師簽署申請表",
    body: "運動員與醫師共同填寫 TUE 申請表，由具資格的醫師簽名確認。",
  },
  {
    title: "送交審查組織",
    body: "國際級多透過 ADAMS 線上送件；向 CTADA 申請請依官網最新公告的送件方式辦理。",
  },
  {
    title: "TUEC 審查",
    body: "至少 3 名醫師依第 4.2 條審查，必要時要求補件。",
  },
  {
    title: "收到決定",
    body: "以書面通知結果，並經 ADAMS 提供 WADA。核准後依所載劑量與途徑使用；駁回會附理由，可依規定申請救濟。",
  },
];

// 醫療文件標準（WADA TUE 醫師指引的共同要求）
export const documentationStandard = [
  "完整病史與現病史",
  "確立診斷的客觀證據（檢驗、影像、激發試驗等）",
  "相關專科醫師意見",
  "治療計畫：藥名、劑量、頻率、途徑、療程",
  "已考慮或嘗試過的替代藥物（名稱、劑量、效果）",
  "所有文件在有效期內",
];

// ISTUE 2023 第 4.1 條：追溯 TUE 的五種情形；第 4.3 條另立
export const retroactiveGrounds = [
  { code: "4.1(a)", text: "需要緊急或急迫的醫療治療" },
  {
    code: "4.1(b)",
    text: "因時間、機會不足或其他特殊情況，無法在採樣前提出申請，或 TUEC 來不及審查",
  },
  { code: "4.1(c)", text: "依所屬組織規則，運動員不被要求或不被允許事先申請" },
  {
    code: "4.1(d)",
    text: "非國際級或國家級運動員被抽測，而其正因治療使用禁用物質或方法",
  },
  { code: "4.1(e)", text: "於賽外使用「僅賽內禁用」的物質後，在賽內檢測中被驗出" },
];

export const retroactiveFairness = {
  code: "4.3",
  text: "上述情形都不符合、但不核准追溯 TUE 會明顯不公平時，可在取得 WADA 事前同意後例外核准；這是極少數的例外。",
};

export const retroactiveNote =
  "追溯 TUE 仍須同時符合第 4.2 條四大條件，並檢附完整病歷。這是例外補救，不是常規申請方式；先用藥再補申請，風險由運動員自負。";

// TUE 核准之後
export const lifecycleItems = [
  {
    title: "效期",
    body: "每張 TUE 都有 TUEC 訂定的效期，到期自動失效。要繼續使用，應在到期前充分提早提出新申請，建議至少預留 30 天審查時間。",
  },
  {
    title: "劑量或途徑改變",
    body: "實際使用的劑量、頻率、途徑或期間與 TUE 所載實質不同時，須先聯繫核發組織確認是否要重新申請。用法不符，持有 TUE 也不能免責。",
  },
  {
    title: "劑量會波動的疾病",
    body: "如糖尿病，可在申請時預先載明合理的劑量範圍，避免每次調整都要重新申請。",
  },
  {
    title: "跨組織效力",
    body: "CTADA 核准的 TUE 在國家層級具全球效力。成為國際級運動員或參加國際賽時，須經國際總會或賽事主辦單位承認後才對該賽事有效；不被承認時，可於收到通知後 21 天內向 WADA 申請覆核。",
  },
];

export const noTueConsequence =
  "沒有有效 TUE 而檢出禁用物質：不利分析結果（AAF）→ 可能認定違反運動禁藥管制規則 → 禁賽、成績取消與公開公告。嚴格責任下，「我不知道」不能推翻違規成立。";

export const tueEvidence = {
  title: "TUE 不是拿牌捷徑：研究怎麼說",
  points: [
    "2016–2022 年四屆奧運參賽者持有效 TUE 的比例為 0.90%，四屆帕運為 2.76%（Vernec et al., BJSM 2024）。",
    "2010–2018 年五屆奧運個人項目，調整國家資源後，持 TUE 與奪牌的相對風險為 1.07（95% CI 0.69–1.56），未達統計顯著（Vernec & Healy, BJSM 2020）。",
  ],
  caveat: "這些是觀察性研究，只能說明未見顯著關聯，不能證明 TUE 對成績完全沒有影響。",
};

export const applicationChecklist = [
  { title: "確認醫療診斷", body: "由合格醫師完成診斷，並有客觀檢查佐證" },
  { title: "準備醫療文件", body: "病史、檢驗或影像報告、專科意見、治療計畫" },
  { title: "評估替代治療", body: "說明非禁用替代為何不適用" },
  { title: "完成申請表格", body: "與醫師共同填寫並簽名" },
  { title: "確認申請對象", body: "國際級向國際總會；國家級與休閒級向 CTADA" },
  {
    title: "把握申請時間",
    body: "全時段禁用物質確診後儘速申請；僅賽內禁用物質至少於下一場比賽前 30 天",
  },
  { title: "記下效期", body: "到期前提早續辦；劑量或途徑改變先問核發組織" },
];

// 決策工具情境範例（講座課堂題）；key 對應 substances.json
export const decisionScenarios = [
  {
    id: "q1",
    question: "馬拉松跑者因高血壓服用 propranolol，比賽要不要 TUE？",
    preset: { drug: "propranolol", route: "", inCompetition: true, sport: "其他運動項目" },
  },
  {
    id: "q2",
    question: "賽外打了一針膝關節內 triamcinolone，要不要 TUE？",
    preset: { drug: "triamcinolone", route: "injection", inCompetition: false, sport: "" },
  },
  {
    id: "q3",
    question: "比賽期間吃了含偽麻黃鹼的複方感冒藥，有沒有問題？",
    preset: { drug: "pseudoephedrine", route: "oral", inCompetition: true, sport: "" },
  },
];
