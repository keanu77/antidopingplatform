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
    options: ["不算，只是光照治療", "算！且很難申請 TUE", "僅賽內禁用"],
    correctIndex: 1,
    explanation:
      "靜脈雷射（ILIB）算運動禁藥！因為需要將光纖導管插入靜脈，屬於 M2 化學及物理操作的範疇，且很難取得 TUE。",
    category: "scenario",
  },
  {
    id: "sc5",
    question: "靜脈注射超過 100mL/12 小時算不算運動禁藥？",
    options: ["不算，正常醫療行為", "可能算！需要申請 TUE", "只有禁用物質才算"],
    correctIndex: 1,
    explanation:
      "在 12 小時內超過 100mL 的靜脈注射或輸液屬於 M2 禁用方法，除非是住院治療、手術或臨床診斷需要。需要申請 TUE。",
    category: "scenario",
  },
  {
    id: "sc6",
    question: "吸入式 Salbutamol（氣喘用藥）算不算運動禁藥？",
    options: ["算，一律禁用", "不算，完全自由使用", "有條件豁免（劑量限制）"],
    correctIndex: 2,
    explanation:
      "吸入式 Salbutamol 有條件豁免：24 小時內不超過 1600 微克，且 8 小時內不超過 600 微克。超過則視為違規。",
    category: "scenario",
  },
  {
    id: "sc7",
    question: "Ozempic（瘦瘦筆）目前的狀態是？",
    options: ["已列入禁用清單", "列入監控計畫（尚未禁用）", "完全合法使用"],
    correctIndex: 1,
    explanation:
      "Semaglutide（Ozempic/Wegovy）自 2024 年起列入 WADA 監控計畫，2026 年又新增 Tirzepatide（Mounjaro）。目前尚未禁用，但正在收集濫用證據，可能在 LA 2028 奧運前被禁。",
    category: "scenario",
  },
  {
    id: "sc8",
    question: "比賽前吃了含 pseudoephedrine 的感冒藥，會怎樣？",
    options: [
      "沒問題，感冒藥不管",
      "屬於 S6 興奮劑，賽內違規！",
      "只要劑量不多就沒事",
    ],
    correctIndex: 1,
    explanation:
      "Pseudoephedrine（偽麻黃鹼）屬於 S6 興奮劑，僅賽內禁用。比賽期間使用含此成分的感冒藥將構成違規。嚴格責任原則：誤服不能免責！",
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
    question: "蓄意使用運動禁藥的禁賽期間是多久？",
    options: ["禁賽一年", "禁賽兩年", "禁賽四年"],
    correctIndex: 2,
    explanation:
      "蓄意（故意行為者）禁賽四年，非蓄意（非故意行為者）禁賽兩年。屢犯者有更嚴重處罰。",
    category: "knowledge",
  },
  {
    id: "kn3",
    question: "台灣的國家運動禁藥防制機構是？",
    options: ["WADA", "CTADA（中華運動禁藥防制基金會）", "教育部體育署"],
    correctIndex: 1,
    explanation:
      "CTADA（中華運動禁藥防制基金會）是我國辦理運動禁藥管制的單位，依據 WADA Code 第 20.5 條設立。",
    category: "knowledge",
  },
  {
    id: "kn4",
    question: "115 年起，台灣全中運/全大運報名是否仍需通過運動禁藥線上測驗？",
    options: [
      "是，仍需通過測驗才能報名",
      "不需要，已取消此報名條件",
      "僅全中運需要，全大運不需要",
    ],
    correctIndex: 1,
    explanation:
      "115 年起，考量參賽權利，全中運、全大運、全民運動會及全國身心障礙國民運動會報名已無需進行運動禁藥測驗。如有報名問題可洽運動部或各主辦單位。",
    category: "knowledge",
  },
  {
    id: "kn5",
    question: "「嚴格責任原則」是什麼意思？",
    options: [
      "只有故意使用才算違規",
      "運動員對自己攝入的所有物質負責，誤服也算違規",
      "教練負最終責任",
    ],
    correctIndex: 1,
    explanation:
      "Your Body, Your Responsibility! 運動員要對自己所吃下的任何物質及使用的方法負責，誤服誤用不能成為躲避處罰的理由。",
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
      "應有陪同人員（教練/家長）全程參與",
      "可以拒絕藥檢",
    ],
    correctIndex: 1,
    explanation:
      "未成年運動員應有陪同人員（如教練、家長等）全程參與藥檢。陪同人員與藥檢代表會監督藥檢人員的執行過程。",
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
