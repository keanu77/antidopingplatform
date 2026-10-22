import { registry } from '../../../shared/content-evidence.mjs';

export const learningPaths = [
  {
    id: 'athlete', label: '選手', title: '上場前，自己也會查核',
    description: '從用藥查詢、藥檢權利，到需要治療時的下一步。',
    course: 'ADEL for National-Level Athletes／International-Level Athletes', courseUrl: 'https://adel.wada-ama.org/learn',
    tasks: [
      { id: 'medicine', title: '練習查詢一項藥物', description: '用成分名稱查詢，再到官方系統核對；未找到不代表可以使用。', href: '/tue?tab=tools', action: '開啟藥物查詢', evidenceId: 'quiz:sc8' },
      { id: 'testing', title: '認識藥檢通知與陪同權利', description: '走過採樣流程，說出收到通知後要做的事。', href: '/testing-process', action: '閱讀藥檢流程', evidenceId: 'quiz:kn7' },
      { id: 'treatment', title: '準備與醫師討論 TUE', description: '核對申請對象、申請時點及所需資料，保留官方確認紀錄。', href: '/tue?tab=application', action: '閱讀 TUE 申請指引', evidenceId: 'quiz:sc6' },
      { id: 'supplements', title: '辨識補充品查核的限制', description: '閱讀污染風險與批次檢驗說明，再與專業人員討論是否需要使用。', href: '/education?tab=supplements', action: '閱讀補充劑安全', evidenceId: 'quiz:kn5' },
    ],
    checklist: ['知道賽事適用年度及主管運動禁藥管制組織', '準備藥品包裝、成分及使用方式，供醫師或藥師核對', '確認需要 TUE 時的申請管道與時點', '知道藥檢通知後的流程及可請求的協助', '保留官方查核紀錄與補充品批號，並再次確認新處方'],
  },
  {
    id: 'coach', label: '教練', title: '把查核習慣帶進團隊',
    description: '用一堂短課建立團隊共識，知道何時轉介醫護與官方機構。',
    course: 'ADEL for High Performance Coaches', courseUrl: 'https://adel.wada-ama.org/learn',
    tasks: [
      { id: 'responsibility', title: '釐清選手與支援人員責任', description: '讀違規類型，討論教練如何支持選手查核而不代替醫療判斷。', href: '/education?tab=violationTypes', action: '閱讀違規類型', evidenceId: 'quiz:kn5' },
      { id: 'lesson', title: '帶一堂 12 分鐘團隊短課', description: '依下方教案討論感冒用藥與補充品情境，練習找出下一步。', href: '/learning?role=coach#mini-lesson', action: '開啟短課教案', evidenceId: 'quiz:sc8' },
      { id: 'testing', title: '演練收到藥檢通知的支援方式', description: '與選手確認陪同、隱私及聯絡安排，避免把拒檢當作選項。', href: '/testing-process', action: '閱讀藥檢流程', evidenceId: 'quiz:kn7' },
      { id: 'official', title: '核對官方教育與賽事要求', description: '查看 CTADA 公告，將團隊學習與賽會報名要求分開確認。', href: registry.sources['ctada-exam'].url, action: '查看 CTADA 官方公告', evidenceId: 'quiz:kn4' },
    ],
    checklist: ['安排 12 分鐘團隊討論與一次稍後複習', '建立醫師、藥師與主管機構的諮詢聯絡流程', '提醒每次新藥與補充品使用前先查核', '確認未成年選手的陪同與隱私安排', '核對賽事教育要求，避免把站內測驗當作證書'],
  },
  {
    id: 'medical', label: '醫護', title: '讓治療與規則查核接得上',
    description: '核對成分、途徑與適用規則，準備 TUE 文件及跨團隊交接。',
    course: 'ADEL for Medical Professionals', courseUrl: 'https://adel.wada-ama.org/learn',
    tasks: [
      { id: 'route', title: '核對成分、途徑與競賽條件', description: '使用查詢工具檢視條件與限制，未能確定時轉官方諮詢。', href: '/tue?tab=tools', action: '開啟查詢與決策工具', evidenceId: 'quiz:sc5' },
      { id: 'documents', title: '檢查 TUE 申請資料是否齊備', description: '依申請指引準備診斷、檢查及治療理由；資料由醫療機構依規定保管。', href: '/tue?tab=application', action: '閱讀 TUE 申請指引', evidenceId: 'quiz:sc6' },
      { id: 'specialties', title: '閱讀相關科別用藥提醒', description: '把科別提醒與當年度清單、疾病指引交叉核對。', href: '/education?tab=specialties', action: '開啟各科專區', evidenceId: 'quiz:sc6' },
      { id: 'official', title: '到 TADA 官方系統再次查詢', description: '核對具體藥品與使用條件；品牌、劑型或治療方法不同時重新查核。', href: registry.sources.tada.url, action: '前往 TADA 官方查詢', evidenceId: 'quiz:sc8' },
    ],
    checklist: ['確認選手競賽層級、賽事日期及負責審查的機構', '核對藥物成分、途徑、劑量與賽內／賽外條件', '依官方疾病指引確認需要的診斷與檢查資料', '整理治療必要性及替代方案評估，供正式申請使用', '確認申請、認可與後續追蹤流程，保留醫療及官方文件'],
  },
];

export const sharedLearningSources = ['list-2026', 'ctada-consult', 'tada'];

export const questionLearning = {
  sc1: { competency: '治療方法查核', roles: ['medical', 'athlete'], href: '/tue?tab=tools' },
  sc2: { competency: '治療方法查核', roles: ['medical', 'athlete'], href: '/tue?tab=tools' },
  sc3: { competency: '賽事規則查核', roles: ['athlete', 'coach'], href: '/prohibited-list' },
  sc4: { competency: '治療方法查核', roles: ['medical'], href: '/tue?tab=tools' },
  sc5: { competency: '途徑與醫療例外', roles: ['medical', 'athlete'], href: '/tue?tab=tools' },
  sc6: { competency: '劑量與 TUE', roles: ['medical', 'athlete'], href: '/tue?tab=application' },
  sc7: { competency: '監控與禁用的區別', roles: ['athlete', 'coach', 'medical'], href: '/prohibited-list' },
  sc8: { competency: '賽內用藥查核', roles: ['athlete', 'coach', 'medical'], href: '/tue?tab=tools' },
  kn1: { competency: '禁用清單原則', roles: ['athlete', 'coach', 'medical'], href: '/education?tab=substances' },
  kn2: { competency: '違規與處分', roles: ['coach', 'athlete'], href: '/education?tab=violationTypes' },
  kn3: { competency: '官方諮詢管道', roles: ['athlete', 'coach', 'medical'], href: '/resources' },
  kn4: { competency: '教育與賽事資格', roles: ['athlete', 'coach'], href: '/adel' },
  kn5: { competency: '嚴格責任', roles: ['athlete', 'coach', 'medical'], href: '/education?tab=supplements' },
  kn6: { competency: '監控與禁用的區別', roles: ['athlete', 'coach', 'medical'], href: '/prohibited-list' },
  kn7: { competency: '未成年選手權利', roles: ['athlete', 'coach'], href: '/testing-process' },
  kn8: { competency: '年度規則更新', roles: ['athlete', 'coach', 'medical'], href: '/sources#rule-transition' },
};
