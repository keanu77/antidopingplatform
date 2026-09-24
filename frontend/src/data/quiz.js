export const scenarioQuestions = [
  {
    id: "sc1",
    question: "PRP / PRF 注射算不算運動禁藥？",
    options: ["算，屬於禁用方法", "不算運動禁藥", "需要申請 TUE"],
    correctIndex: 1,
    explanation:
      "PRP / PRF 注射目前不在 WADA 禁用清單上，不算運動禁藥。但其中的生長因子（如 PDGF、IGF-1）在純化後單獨使用則屬 S2 禁用物質。",
    category: "scenario",
  },
  {
    id: "sc2",
    question: "高壓氧治療算不算運動禁藥？",
    options: ["算，操縱攜氧能力", "不算運動禁藥", "僅賽內禁用"],
    correctIndex: 1,
    explanation:
      "高壓氧治療不算運動禁藥。它透過增加環境壓力讓身體吸收更多氧氣，但不屬於 WADA 定義的禁用方法。",
    category: "scenario",
  },
  {
    id: "sc3",
    question: "低氧艙訓練算不算運動禁藥？",
    options: ["算，人為改變氧氣環境", "不算運動禁藥", "視情況而定"],
    correctIndex: 1,
    explanation:
      "低氧艙（模擬高地）訓練不算運動禁藥。WADA 曾討論是否禁用，但最終決定維持合法。",
    category: "scenario",
  },
  {
    id: "sc4",
    question: "靜脈雷射 ILIB 算不算運動禁藥？",
    options: [
      "並非一律違規，但侵入式 ILIB 可能落入禁用方法 M1.3",
      "一定算，屬於 M2 且很難申請 TUE",
      "完全合法，不受任何規範",
    ],
    correctIndex: 0,
    explanation:
      "WADA 禁用清單並未逐字列名 ILIB。侵入式靜脈雷射（置針、光纖入血管）因涉及「以物理手段對血液進行血管內操作」，在解釋上可能落入禁用方法 M1.3（全時段禁用）；M2.2（12 小時內超過 100mL 的靜脈輸注／注射）則須在同時大量輸液時才觸及。非侵入式的鼻腔／穿皮低能量雷射不進入血管，通常不屬此範疇。實際個案是否違規仍以 WADA／各運動總會認定為準。",
    category: "scenario",
  },
  {
    id: "sc5",
    question: "靜脈注射超過 100mL/12 小時算不算運動禁藥？",
    options: ["不算，正常醫療行為", "屬禁用方法，但有特定醫療情境例外", "只有禁用物質才算"],
    correctIndex: 1,
    explanation:
      "任何 12 小時內靜脈注射或輸液總量超過 100mL，屬於 M2.2 禁用方法；合法的醫院治療、外科手術或臨床診斷程序為例外。不符合上述例外而有醫療需要時，才須就此方法申請 TUE。即使方法符合例外，輸注的物質仍須另行確認是否禁用。",
    category: "scenario",
  },
  {
    id: "sc6",
    question: "吸入式 Salbutamol（氣喘用藥）算不算運動禁藥？",
    options: ["算，一律禁用", "不算，完全自由使用", "有條件豁免（劑量限制）"],
    correctIndex: 2,
    explanation:
      "吸入式 Salbutamol 的劑量例外為 24 小時內不超過 1600 微克，且任何 8 小時內不超過 600 微克。超出此例外劑量需 TUE，未獲核准可能構成違規；尿液濃度另有規範，不能單憑吸入劑量保證檢測結果。",
    category: "scenario",
  },
  {
    id: "sc7",
    question: "依 2026 年 WADA 規範，Ozempic（瘦瘦筆）的狀態是？",
    options: ["已列入禁用清單", "列入監控計畫（尚未禁用）", "完全合法使用"],
    correctIndex: 1,
    explanation:
      "2026 年 WADA 監控計畫列入 semaglutide（Ozempic／Wegovy）與 tirzepatide（Mounjaro）的標記物，賽內與賽外皆監控。兩者未列入 2026 年禁用清單；監控是收集使用資料，不能據此推定未來禁用日期。",
    category: "scenario",
  },
  {
    id: "sc8",
    question: "比賽前吃了含 pseudoephedrine 的感冒藥，會怎樣？",
    options: [
      "沒問題，感冒藥不管",
      "有賽內風險，須留意尿液濃度門檻及 TUE 規定",
      "只要劑量不多就沒事",
    ],
    correctIndex: 1,
    explanation:
      "Pseudoephedrine（偽麻黃鹼）屬 S6 興奮劑，賽內尿液濃度超過 150µg/mL 時禁用。不能僅憑吃過感冒藥就判定違規，也不能以低劑量保證不超標；用藥前應核對規範，有醫療需要時確認 TUE 要求。",
    category: "scenario",
  },
];

export const knowledgeQuestions = [
  {
    id: "kn1",
    question: "WADA 將一個物質列入禁用清單，需要符合幾項標準中的幾項？",
    options: ["三項全部符合", "三項中的兩項", "只需一項即可"],
    correctIndex: 1,
    explanation:
      "根據 WADA Code 4.3.1，符合三項標準（增強運動表現、危害健康、違反運動精神）中的兩項即可列入禁用清單。",
    category: "knowledge",
  },
  {
    id: "kn2",
    question: "一般初次故意違反「存在、使用或持有禁用物質／方法」規則，未適用特別或加減條款時，禁賽基準是多久？",
    options: ["禁賽一年", "禁賽兩年", "禁賽四年"],
    correctIndex: 2,
    explanation:
      "WADA Code 第 10.2 條對存在、使用／企圖使用或持有違規，以四年或兩年為一般基準，故意與舉證規則會影響判定。四年不是所有違規的固定結果；濫用物質特別規定、加重情節、無過失或無重大過失、其他減免條款及重複違規等，可能改變最終處分。",
    category: "knowledge",
  },
  {
    id: "kn3",
    question: "台灣的國家運動禁藥防制機構是？",
    options: [
      "WADA",
      "CTADA（中華運動禁藥防制基金會）",
      "運動部（前身教育部體育署）",
    ],
    correctIndex: 1,
    explanation:
      "CTADA（中華運動禁藥防制基金會）是我國辦理運動禁藥管制的單位，依據 WADA Code 第 20.5 條設立。我國運動主管機關已於 2025 年由教育部體育署升格為運動部，但國家反禁藥組織仍為 CTADA。",
    category: "knowledge",
  },
  {
    id: "kn4",
    question: "115 年台灣全中運/全大運報名是否仍需通過運動禁藥線上測驗？",
    options: [
      "是，仍需通過測驗才能報名",
      "不需要，已取消此報名條件",
      "僅全中運需要，全大運不需要",
    ],
    correctIndex: 1,
    explanation:
      "CTADA 公告：115 年全中運、全大運與全民運動會取消將線上測驗通過證明列為報名條件；全國身心障礙國民運動會的公告則明列肢體及聽覺障礙選手。各賽會資格依最新公告，這不代表免除反禁藥責任。",
    category: "knowledge",
  },
  {
    id: "kn5",
    question: "「嚴格責任原則」是什麼意思？",
    options: [
      "只有故意使用才算違規",
      "成立檢體中存在禁用物質的違規，不需證明故意或過失",
      "教練負最終責任",
    ],
    correctIndex: 1,
    explanation:
      "運動員須對進入身體的物質負責。依 WADA Code 第 2.1.1 條，成立檢體中存在禁用物質的違規，不需證明故意、過失、疏忽或明知使用；但違規成立與禁賽處分不同，無過失、無重大過失等規則可能免除或減輕禁賽，須個案審查。",
    category: "knowledge",
  },
  {
    id: "kn6",
    question: "咖啡因目前在 WADA 的分類是？",
    options: ["S6 興奮劑（禁用）", "監控物質（尚未禁用）", "完全不管"],
    correctIndex: 1,
    explanation:
      "咖啡因目前僅列為監控物質，WADA 持續追蹤其在運動中的使用模式，但尚未禁用。",
    category: "knowledge",
  },
  {
    id: "kn7",
    question: "未成年運動員接受藥檢時，以下哪項是正確的？",
    options: [
      "不需要任何陪同",
      "可要求代表陪同，採樣程序依未成年人規範調整",
      "可以拒絕藥檢",
    ],
    correctIndex: 1,
    explanation:
      "未成年運動員可要求代表（如家長或其他適當成年人）陪同，採樣程序須依未成年人規範調整並保護隱私。代表陪同不等於必須直接觀看排尿；實際觀察安排依採樣規範及運動員要求辦理。",
    category: "knowledge",
  },
  {
    id: "kn8",
    question: "2026 年 WADA 禁用清單新增了哪項禁用方法？",
    options: ["低氧艙訓練", "一氧化碳（CO）非診斷用途", "高壓氧治療"],
    correctIndex: 1,
    explanation:
      "2026 年新增一氧化碳（CO）非診斷用途為 M1 禁用方法，因其能增加紅血球生成且高劑量可能致命。",
    category: "knowledge",
  },
];
