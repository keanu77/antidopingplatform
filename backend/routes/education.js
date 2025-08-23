const express = require('express');
const router = express.Router();

// 完整的WADA禁藥知識內容
const educationalContent = {
  substances: [
    {
      id: 1,
      category: 'S0: 未批准物質',
      wadaCode: 'S0',
      description: '任何未獲得政府衛生管理當局批准供人類治療使用的藥物或實驗物質。',
      mechanism: '由於屬於實驗階段，作用機制可能不明確或存在未知副作用。',
      risks: '未知的健康風險、可能造成嚴重副作用、長期影響不明',
      examples: '實驗性SARM、新型類固醇前體、研發階段的藥物',
      detectability: '檢測困難，需要特殊檢測方法',
      icon: '🧪',
      prohibitionType: '永久禁用'
    },
    {
      id: 2,
      category: 'S1: 合成代謝劑',
      wadaCode: 'S1',
      description: '包括外源性和內源性合成代謝雄激素類固醇及其他合成代謝劑。',
      mechanism: '模擬睪固酮作用，增加蛋白質合成，促進肌肉生長和力量提升。',
      risks: '肝損傷、心血管疾病、情緒波動、荷爾蒙失調、男性女性化、女性男性化',
      examples: '睪固酮、南德龍(Nandrolone)、康力龍(Stanozolol)、口服妥納龍(Turinabol)',
      detectability: '代謝物可在尿液中檢出數週至數月',
      icon: '💪',
      prohibitionType: '永久禁用',
      subcategories: [
        {
          code: 'S1.1',
          name: '外源性合成代謝雄激素類固醇',
          examples: 'Boldenone、Clostebol、Fluoxymesterone、Metandienone'
        },
        {
          code: 'S1.2', 
          name: '其他合成代謝劑',
          examples: 'Clenbuterol(在S3類別時)、SARM、Tibolone'
        }
      ]
    },
    {
      id: 3,
      category: 'S2: 肽類激素、生長因子',
      wadaCode: 'S2',
      description: '影響生長、細胞分裂和再生的天然或合成肽類物質。',
      mechanism: '刺激生長激素釋放、增加紅血球生成、促進組織修復和肌肉生長。',
      risks: '關節疼痛、糖尿病風險、心臟肥大、血栓、中風',
      examples: 'EPO、生長激素(HGH)、IGF-1、胰島素、促性腺激素',
      detectability: '血液檢測較準確，部分物質檢測窗口較短',
      icon: '📈',
      prohibitionType: '永久禁用',
      subcategories: [
        {
          code: 'S2.1',
          name: '促紅血球生成素類',
          examples: 'EPO、CERA、Methoxy polyethylene glycol-epoetin beta'
        },
        {
          code: 'S2.2',
          name: '肽類激素和釋放因子',
          examples: '生長激素(HGH)、IGF-1、胰島素、HCG'
        },
        {
          code: 'S2.3',
          name: '生長因子和調節劑',
          examples: 'MGF、FGF、VEGF、PDGF'
        }
      ]
    },
    {
      id: 4,
      category: 'S3: Beta-2激動劑',
      wadaCode: 'S3',
      description: '作用於Beta-2腎上腺素受體的物質，可放鬆支氣管平滑肌。',
      mechanism: '擴張支氣管、增加氧氣攝取、可能具有合成代謝效果。',
      risks: '心律不整、肌肉震顫、頭痛、心率加快、電解質失衡',
      examples: 'Clenbuterol、Salbutamol、Terbutaline、Formoterol',
      detectability: '尿液檢測，某些物質有劑量閾值限制',
      icon: '🫁',
      prohibitionType: '永久禁用(除特殊TUE情況)',
      note: 'Salbutamol等特定物質在規定劑量下可通過TUE使用'
    },
    {
      id: 5,
      category: 'S4: 激素和代謝調節劑',
      wadaCode: 'S4',
      description: '影響激素平衡和新陳代謝的物質和方法。',
      mechanism: '調節激素水平、影響脂肪代謝、調節血糖、改善心血管功能。',
      risks: '激素失調、肝功能異常、心血管疾病、血糖異常',
      examples: 'Meldonium、芳香酶抑制劑、抗雌激素物質、代謝調節劑',
      detectability: '檢測方法日益完善，代謝調節劑檢測期較長',
      icon: '⚖️',
      prohibitionType: '永久禁用',
      subcategories: [
        {
          code: 'S4.4',
          name: '代謝調節劑',
          examples: 'Meldonium、GW1516、SR9009'
        }
      ]
    },
    {
      id: 6,
      category: 'S5: 利尿劑和掩蔽劑',
      wadaCode: 'S5',
      description: '用於快速減重或掩蓋其他禁藥使用的物質。',
      mechanism: '增加尿液產生、稀釋禁藥濃度、快速減少體重。',
      risks: '嚴重脫水、電解質失衡、腎功能損害、血壓異常',
      examples: 'Furosemide、Hydrochlorothiazide、Spironolactone、Probenecid',
      detectability: '容易檢出，但主要用途是掩蓋其他禁藥',
      icon: '💧',
      prohibitionType: '永久禁用'
    },
    {
      id: 7,
      category: 'S6: 興奮劑',
      wadaCode: 'S6',
      description: '刺激中樞神經系統，增強警覺性和能量的物質。',
      mechanism: '刺激交感神經系統、增加腎上腺素分泌、提高專注力和反應速度。',
      risks: '心律不整、高血壓、焦慮、成癮、心臟病發作',
      examples: '安非他命、可卡因、MDMA、Modafinil、高劑量咖啡因',
      detectability: '大多數可在尿液中檢出數天',
      icon: '⚡',
      prohibitionType: '僅比賽期間禁用',
      note: '咖啡因已從禁用清單移除，但仍在監控清單上'
    },
    {
      id: 8,
      category: 'S7: 麻醉劑',
      wadaCode: 'S7',
      description: '強效鎮痛劑，可能掩蓋傷痛並產生欣快感。',
      mechanism: '作用於鴉片受體，產生鎮痛和欣快效果，可能掩蓋運動傷害。',
      risks: '呼吸抑制、成癮、認知能力下降、掩蓋嚴重傷害',
      examples: '嗎啡、芬太尼、海洛因、可待因、Tramadol',
      detectability: '可在尿液和血液中檢出',
      icon: '💊',
      prohibitionType: '僅比賽期間禁用'
    },
    {
      id: 9,
      category: 'S8: 大麻類',
      wadaCode: 'S8',
      description: '大麻及其活性成分四氫大麻酚(THC)。',
      mechanism: '作用於大麻素受體，影響協調性、判斷力和反應時間。',
      risks: '注意力不集中、協調性下降、記憶力影響、可能成癮',
      examples: '大麻、THC、合成大麻素',
      detectability: 'THC可在尿液中檢出數週',
      icon: '🍃',
      prohibitionType: '僅比賽期間禁用',
      note: 'CBD不在禁用清單上'
    },
    {
      id: 10,
      category: 'S9: 糖皮質激素',
      wadaCode: 'S9',
      description: '具有強效抗炎作用的類固醇激素。',
      mechanism: '強效抗炎、抑制免疫反應、可能增強耐力和減少疲勞感。',
      risks: '免疫抑制、骨質疏鬆、肌肉萎縮、血糖升高',
      examples: 'Prednisolone、Dexamethasone、Cortisone、Hydrocortisone',
      detectability: '可通過尿液檢測',
      icon: '🩹',
      prohibitionType: '僅比賽期間禁用（除局部使用外）'
    },
    {
      id: 11,
      category: 'M1: 血液和血液成分操作',
      wadaCode: 'M1',
      description: '涉及血液、血液成分或影響氧氣輸送的禁用方法。',
      mechanism: '增加血液中紅血球數量、提高氧氣輸送能力。',
      risks: '血栓、感染、免疫反應、血液系統疾病',
      examples: '血液輸注、人工氧氣載體、血液替代品',
      detectability: '需要血液檢測，檢測複雜',
      icon: '🩸',
      prohibitionType: '永久禁用'
    },
    {
      id: 12,
      category: 'M2: 化學和物理操作',
      wadaCode: 'M2',
      description: '篡改或企圖篡改樣本完整性的行為。',
      mechanism: '稀釋樣本、替換樣本、加入掩蔽物質。',
      risks: '法律後果、終身禁賽、名譽受損',
      examples: '樣本替換、尿液稀釋、加入蛋白酶、導尿管使用',
      detectability: '可通過樣本檢測發現異常',
      icon: '🔬',
      prohibitionType: '永久禁用'
    },
    {
      id: 13,
      category: 'M3: 基因和細胞禁藥',
      wadaCode: 'M3',
      description: '基因治療、基因編輯和細胞治療的非治療性使用。',
      mechanism: '改變基因表達、增強肌肉生長、改善氧氣利用。',
      risks: '未知長期風險、免疫反應、基因不穩定',
      examples: '基因治療載體、基因編輯技術、幹細胞療法',
      detectability: '檢測技術仍在發展中',
      icon: '🧬',
      prohibitionType: '永久禁用'
    },
    {
      id: 14,
      category: 'P1: Beta阻斷劑',
      wadaCode: 'P1',
      description: '在特定需要精準度和穩定性的運動中被禁用。',
      mechanism: '降低心率、減少震顫、提高精準度。',
      risks: '心率過低、血壓下降、運動能力下降',
      examples: 'Propranolol、Atenolol、Metoprolol',
      detectability: '可在尿液中檢出',
      icon: '🎯',
      prohibitionType: '特定運動項目禁用',
      note: '僅在射箭、射擊、撞球等精準性運動中禁用'
    }
  ],
  
  // 50題測驗題庫（禁藥知識60%、經典案例20%、其他20%）
  quizzes: [
    // 禁藥知識類題目（30題，60%）
    {
      id: 1,
      category: '禁藥知識',
      question: 'WADA禁用清單中的S1類別是指什麼？',
      options: ['興奮劑', '合成代謝劑', 'EPO類', '利尿劑'],
      correctAnswer: 1,
      explanation: 'S1類別是合成代謝劑，包括外源性和內源性合成代謝雄激素類固醇。'
    },
    {
      id: 2,
      category: '禁藥知識',
      question: 'EPO的主要作用機制是什麼？',
      options: ['增加肌肉質量', '提高心率', '增加紅血球數量', '減少體重'],
      correctAnswer: 2,
      explanation: 'EPO（促紅血球生成素）主要作用是刺激骨髓產生更多紅血球，提高氧氣輸送能力。'
    },
    {
      id: 3,
      category: '禁藥知識',
      question: '以下哪種物質屬於S3類別？',
      options: ['Clenbuterol', 'Testosterone', 'EPO', 'Furosemide'],
      correctAnswer: 0,
      explanation: 'Clenbuterol屬於S3類別的Beta-2激動劑，具有支氣管擴張和潛在合成代謝效果。'
    },
    {
      id: 4,
      category: '禁藥知識',
      question: 'Meldonium屬於WADA分類中的哪一類？',
      options: ['S1: 合成代謝劑', 'S4.4: 代謝調節劑', 'S6: 興奮劑', 'S2: 肽類激素'],
      correctAnswer: 1,
      explanation: 'Meldonium屬於S4.4代謝調節劑，可以改善心血管功能和新陳代謝。'
    },
    {
      id: 5,
      category: '禁藥知識',
      question: 'TUE的全稱是什麼？',
      options: ['治療用途豁免', '檢測技術更新', '訓練使用例外', '臨時使用許可'],
      correctAnswer: 0,
      explanation: 'TUE是Therapeutic Use Exemption的縮寫，中文為治療用途豁免。'
    },
    {
      id: 6,
      category: '禁藥知識',
      question: '利尿劑在運動禁藥中主要被用作什麼？',
      options: ['增強力量', '提高耐力', '掩蔽劑', '減少疲勞'],
      correctAnswer: 2,
      explanation: '利尿劑主要被用作掩蔽劑，通過增加尿液產生來稀釋其他禁藥的濃度。'
    },
    {
      id: 7,
      category: '禁藥知識',
      question: '血液禁藥(M1)包括以下哪種方法？',
      options: ['服用類固醇', '注射EPO', '血液輸注', '使用興奮劑'],
      correctAnswer: 2,
      explanation: 'M1類別包括血液輸注、人工氧氣載體等直接操作血液的方法。'
    },
    {
      id: 8,
      category: '禁藥知識',
      question: '以下哪種物質只在比賽期間被禁用？',
      options: ['Testosterone', 'Cocaine', 'EPO', 'HGH'],
      correctAnswer: 1,
      explanation: 'Cocaine屬於S6興奮劑類，只在比賽期間被禁用。'
    },
    {
      id: 9,
      category: '禁藥知識',
      question: 'Beta阻斷劑(P1)主要在哪類運動中被禁用？',
      options: ['耐力運動', '力量運動', '精準性運動', '團體運動'],
      correctAnswer: 2,
      explanation: 'Beta阻斷劑在射箭、射擊等需要精準度的運動中被禁用，因為可以減少震顫。'
    },
    {
      id: 10,
      category: '禁藥知識',
      question: 'SARM屬於WADA分類中的哪一類？',
      options: ['S1: 合成代謝劑', 'S6: 興奮劑', 'S0: 未批准物質', 'S3: Beta-2激動劑'],
      correctAnswer: 0,
      explanation: 'SARM（選擇性雄激素受體調節劑）屬於S1.2其他合成代謝劑。'
    },
    {
      id: 11,
      category: '禁藥知識',
      question: '生長激素(HGH)屬於哪個WADA類別？',
      options: ['S1', 'S2.2', 'S4', 'S6'],
      correctAnswer: 1,
      explanation: '生長激素屬於S2.2肽類激素和釋放因子類別。'
    },
    {
      id: 12,
      category: '禁藥知識',
      question: '樣本替換屬於哪種禁用方法？',
      options: ['M1: 血液操作', 'M2: 化學物理操作', 'M3: 基因禁藥', 'S5: 掩蔽劑'],
      correctAnswer: 1,
      explanation: '樣本替換屬於M2化學和物理操作，是篡改樣本完整性的行為。'
    },
    {
      id: 13,
      category: '禁藥知識',
      question: '以下哪種物質的代謝物可以在體內保持最長時間？',
      options: ['可卡因', '大麻(THC)', '咖啡因', '酒精'],
      correctAnswer: 1,
      explanation: 'THC的代謝物可以在脂肪組織中儲存，在尿液中可檢出數週。'
    },
    {
      id: 14,
      category: '禁藥知識',
      question: 'IGF-1屬於WADA分類中的哪一類？',
      options: ['S1: 合成代謝劑', 'S2.3: 生長因子', 'S4: 代謝調節劑', 'S6: 興奮劑'],
      correctAnswer: 1,
      explanation: 'IGF-1（胰島素樣生長因子）屬於S2.3生長因子和調節劑類別。'
    },
    {
      id: 15,
      category: '禁藥知識',
      question: 'Stanozolol是哪種類型的禁藥？',
      options: ['興奮劑', '外源性合成代謝雄激素類固醇', 'EPO類', 'Beta-2激動劑'],
      correctAnswer: 1,
      explanation: 'Stanozolol是S1.1外源性合成代謝雄激素類固醇，是經典的口服類固醇。'
    },
    {
      id: 16,
      category: '禁藥知識',
      question: '糖皮質激素在什麼情況下被禁用？',
      options: ['永久禁用', '僅比賽期間禁用', '僅訓練期間禁用', '從不禁用'],
      correctAnswer: 1,
      explanation: '糖皮質激素(S9)僅在比賽期間被禁用，但局部使用除外。'
    },
    // TUE基礎知識題目
    {
      id: 17,
      category: 'TUE知識',
      question: 'TUE申請必須在什麼時候提交？',
      options: ['使用禁藥之前', '使用禁藥之後30天內', '被檢出後立即', '比賽結束後'],
      correctAnswer: 0,
      explanation: 'TUE申請必須在使用禁藥之前提交，除非是緊急醫療情況。'
    },
    {
      id: 18,
      category: 'TUE知識',
      question: '哪種情況可能需要申請TUE？',
      options: ['提高運動表現', '恢復疲勞', '治療糖尿病', '增加肌肉量'],
      correctAnswer: 2,
      explanation: '糖尿病患者可能需要使用胰島素治療，這需要申請TUE。'
    },
    {
      id: 19,
      category: 'TUE知識',
      question: 'TUE申請需要提供什麼資料？',
      options: ['教練推薦信', '完整醫療診斷和治療計劃', '運動成績證明', '贊助商同意書'],
      correctAnswer: 1,
      explanation: 'TUE申請需要提供完整的醫療診斷、治療必要性證明和治療計劃。'
    },
    {
      id: 20,
      category: 'TUE知識',
      question: '以下哪種藥物最常需要申請TUE？',
      options: ['維生素C', '胰島素', '維生素D', '蛋白粉'],
      correctAnswer: 1,
      explanation: '胰島素是禁藥，但糖尿病患者治療需要，是最常見的TUE申請藥物之一。'
    },
    {
      id: 21,
      category: 'TUE知識',
      question: 'TUE的有效期通常是多久？',
      options: ['終身有效', '1年', '根據醫療需要而定', '比賽期間有效'],
      correctAnswer: 2,
      explanation: 'TUE的有效期根據醫療需要和治療期間而定，會在批准時明確說明。'
    },
    // 基本禁藥知識題目
    {
      id: 22,
      category: '禁藥知識',
      question: 'WADA禁藥清單多久更新一次？',
      options: ['每月', '每季', '每年', '每兩年'],
      correctAnswer: 2,
      explanation: 'WADA禁藥清單每年更新一次，通常在1月1日生效。'
    },
    {
      id: 23,
      category: '禁藥知識',
      question: '運動員有義務了解什麼？',
      options: ['只需了解自己項目的規則', '所有WADA禁藥清單內容', '只需了解常用藥物', '只需聽教練指導'],
      correctAnswer: 1,
      explanation: '運動員有責任了解並遵守完整的WADA禁藥清單，無知不是辯護理由。'
    },
    {
      id: 24,
      category: '禁藥知識',
      question: '藥檢樣本可以是什麼？',
      options: ['只有尿液', '只有血液', '尿液和血液', '唾液'],
      correctAnswer: 2,
      explanation: '藥檢樣本主要包括尿液和血液，不同物質可能需要不同類型的樣本。'
    },
    {
      id: 25,
      category: '禁藥知識',
      question: '拒絕接受藥檢的後果是什麼？',
      options: ['警告', '罰款', '等同於陽性結果', '延後檢測'],
      correctAnswer: 2,
      explanation: '拒絕接受藥檢等同於藥檢陽性，會面臨相同的處罰。'
    },
    {
      id: 26,
      category: '禁藥知識',
      question: '營養補充劑的風險是什麼？',
      options: ['沒有風險', '可能含有未標示的禁藥成分', '只要是合法產品就安全', '只有便宜產品有風險'],
      correctAnswer: 1,
      explanation: '營養補充劑可能含有未標示的禁藥成分，運動員使用時需格外小心。'
    },
    {
      id: 27,
      category: '禁藥知識',
      question: 'Modafinil屬於哪種禁藥類別？',
      options: ['S1: 合成代謝劑', 'S6: 興奮劑', 'S4: 代謝調節劑', 'S7: 麻醉劑'],
      correctAnswer: 1,
      explanation: 'Modafinil是一種促智藥物，屬於S6興奮劑類別。'
    },
    // 更多基本禁藥知識題目
    {
      id: 28,
      category: '禁藥知識',
      question: '基因禁藥(M3)主要風險是什麼？',
      options: ['心律不整', '肝損傷', '未知長期風險', '腎功能損害'],
      correctAnswer: 2,
      explanation: '基因禁藥的主要風險是未知的長期健康風險和潛在的基因不穩定性。'
    },
    {
      id: 29,
      category: '禁藥知識',
      question: '運動員對什麼負有嚴格責任？',
      options: ['只對故意使用負責', '只對檢測結果負責', '對進入體內的所有物質負責', '只對處方藥負責'],
      correctAnswer: 2,
      explanation: '運動員對進入其體內的任何禁用物質負有嚴格責任，無論是否故意。'
    },
    {
      id: 30,
      category: '禁藥知識',
      question: 'Nandrolone的主要健康風險包括？',
      options: ['只有肝損傷', '心血管疾病和荷爾蒙失調', '只有情緒波動', '只有肌肉損傷'],
      correctAnswer: 1,
      explanation: 'Nandrolone可能導致心血管疾病、肝損傷、荷爾蒙失調等多種健康問題。'
    },
    // 更多TUE知識題目
    {
      id: 31,
      category: 'TUE知識',
      question: 'TUE委員會通常由哪些專業人士組成？',
      options: ['只有醫生', '醫生和藥劑師', '醫生、藥劑師和運動科學家', '運動員代表'],
      correctAnswer: 2,
      explanation: 'TUE委員會通常由醫生、藥劑師和運動科學專家組成，確保專業性。'
    },
    {
      id: 32,
      category: 'TUE知識',
      question: '以下哪種情況不能申請TUE？',
      options: ['治療哮喘', '提高運動表現', '治療糖尿病', '治療ADHD'],
      correctAnswer: 1,
      explanation: '純粹為了提高運動表現而使用禁藥不能申請TUE，TUE只用於醫療需要。'
    },
    {
      id: 33,
      category: 'TUE知識',
      question: 'TUE申請被拒絕後可以怎麼做？',
      options: ['無法申訴', '可以申訴或重新申請', '只能等待一年後重新申請', '自動禁賽'],
      correctAnswer: 1,
      explanation: 'TUE申請被拒絕後，運動員可以向上級機構申訴或在情況改變後重新申請。'
    },
    {
      id: 34,
      category: '禁藥知識',
      question: '以下哪個不是WADA的主要職責？',
      options: ['制定禁藥清單', '進行藥檢', '監督反禁藥工作', '處理違規案例'],
      correctAnswer: 1,
      explanation: 'WADA負責政策制定和監督，實際藥檢由各國反禁藥組織執行。'
    },
    {
      id: 35,
      category: '禁藥知識',
      question: 'A樣本檢測陽性後會怎麼處理？',
      options: ['立即宣布違規', '檢測B樣本確認', '警告運動員', '無需處理'],
      correctAnswer: 1,
      explanation: 'A樣本陽性後，會檢測B樣本進行確認，兩個都陽性才算違規。'
    },
    {
      id: 36,
      category: '禁藥知識',
      question: 'WADA每年更新禁用清單的時間是？',
      options: ['1月1日', '7月1日', '10月1日', '12月31日'],
      correctAnswer: 0,
      explanation: 'WADA禁用清單每年1月1日生效，通常在前一年的9月公佈。'
    },
    {
      id: 22,
      category: '禁藥知識',
      question: '人工氧氣載體屬於哪種禁用方法？',
      options: ['S2: 肽類激素', 'M1: 血液操作', 'S5: 掩蔽劑', 'M2: 化學操作'],
      correctAnswer: 1,
      explanation: '人工氧氣載體屬於M1血液和血液成分操作類別。'
    },
    {
      id: 23,
      category: '禁藥知識',
      question: '補充劑污染的責任歸屬是？',
      options: ['製造商負責', '銷售商負責', '運動員負責', '教練負責'],
      correctAnswer: 2,
      explanation: '即使是補充劑污染，運動員仍需對進入體內的禁用物質負責。'
    },
    {
      id: 24,
      category: '禁藥知識',
      question: 'Turinabol是什麼類型的禁藥？',
      options: ['興奮劑', '口服合成代謝類固醇', 'EPO類', 'Beta阻斷劑'],
      correctAnswer: 1,
      explanation: 'Turinabol是一種口服合成代謝類固醇，屬於S1.1類別。'
    },
    {
      id: 25,
      category: '禁藥知識',
      question: '血液禁藥檢測主要通過什麼方式？',
      options: ['尿液檢測', '血液檢測', '唾液檢測', '頭髮檢測'],
      correctAnswer: 1,
      explanation: '血液禁藥如EPO、血液輸注等主要需要通過血液檢測才能發現。'
    },
    {
      id: 26,
      category: '禁藥知識',
      question: 'CBD(大麻二酚)在WADA清單上的狀態是？',
      options: ['永久禁用', '比賽期間禁用', '不在禁用清單上', '僅特定運動禁用'],
      correctAnswer: 2,
      explanation: 'CBD不在WADA禁用清單上，但THC仍然被禁用。'
    },
    {
      id: 27,
      category: '禁藥知識',
      question: '生物護照(ABP)主要監控什麼？',
      options: ['行蹤信息', '生理指標變化', '比賽成績', '訓練強度'],
      correctAnswer: 1,
      explanation: '生物護照監控運動員血液和尿液中生理指標的長期變化模式。'
    },
    {
      id: 28,
      category: '禁藥知識',
      question: '運動員行蹤信息(ADAMS)的主要目的是？',
      options: ['監控訓練', '支持隨機檢測', '記錄比賽結果', '管理獎金'],
      correctAnswer: 1,
      explanation: 'ADAMS行蹤信息系統支持反禁藥機構進行隨機賽外檢測。'
    },
    {
      id: 29,
      category: '禁藥知識',
      question: 'Clostebol屬於哪種WADA類別？',
      options: ['S1.1: 外源性合成代謝雄激素類固醇', 'S6: 興奮劑', 'S3: Beta-2激動劑', 'S4: 代謝調節劑'],
      correctAnswer: 0,
      explanation: 'Clostebol是一種外源性合成代謝雄激素類固醇，屬於S1.1類別。'
    },
    {
      id: 30,
      category: '禁藥知識',
      question: '初次違規的標準禁賽期限是？',
      options: ['1年', '2年', '3年', '4年'],
      correctAnswer: 1,
      explanation: '根據WADA規定，初次故意違規的標準禁賽期限是2年。'
    },
    
    // 經典案例類題目（10題，20%）
    {
      id: 31,
      category: '經典案例',
      question: 'Ben Johnson在1988年奧運會因使用什麼物質被取消金牌？',
      options: ['EPO', 'Stanozolol', 'Nandrolone', 'Testosterone'],
      correctAnswer: 1,
      explanation: 'Ben Johnson被檢測出使用了Stanozolol（康力龍），一種合成代謝類固醇。'
    },
    {
      id: 32,
      category: '經典案例',
      question: 'Lance Armstrong主要使用的禁藥是什麼？',
      options: ['類固醇', 'EPO', '興奮劑', '利尿劑'],
      correctAnswer: 1,
      explanation: 'Lance Armstrong主要使用EPO來增加紅血球數量，提高耐力表現。'
    },
    {
      id: 33,
      category: '經典案例',
      question: 'BALCO醜聞中的核心禁藥THG屬於什麼類別？',
      options: ['興奮劑', '設計類固醇', 'EPO類', 'Beta-2激動劑'],
      correctAnswer: 1,
      explanation: 'THG是專門設計來逃避檢測的合成代謝類固醇，被稱為"設計類固醇"。'
    },
    {
      id: 34,
      category: '經典案例',
      question: '俄羅斯索契冬奧醜聞主要涉及什麼違規行為？',
      options: ['使用EPO', '樣本替換', '血液輸注', '基因禁藥'],
      correctAnswer: 1,
      explanation: '索契冬奧醜聞主要是系統性的樣本替換計劃，屬於M2化學物理操作。'
    },
    {
      id: 35,
      category: '經典案例',
      question: 'Maria Sharapova被禁賽是因為使用了什麼物質？',
      options: ['EPO', 'Meldonium', 'Cocaine', 'Stanozolol'],
      correctAnswer: 1,
      explanation: 'Maria Sharapova因使用Meldonium被禁賽，該物質2016年被加入禁用清單。'
    },
    {
      id: 36,
      category: '經典案例',
      question: '東德系統性禁藥主要使用什麼物質？',
      options: ['EPO', 'Oral-Turinabol', 'Cocaine', 'HGH'],
      correctAnswer: 1,
      explanation: '東德系統性禁藥計劃主要使用Oral-Turinabol等合成代謝類固醇。'
    },
    {
      id: 37,
      category: '經典案例',
      question: 'Festina車隊1998年環法賽醜聞涉及什麼禁藥？',
      options: ['類固醇', 'EPO', '興奮劑', 'HGH'],
      correctAnswer: 1,
      explanation: 'Festina車隊醜聞揭露了EPO在自行車運動中的系統性使用。'
    },
    {
      id: 38,
      category: '經典案例',
      question: 'Sun Yang被禁賽8年的主要原因是？',
      options: ['使用EPO', '拒絕檢測', '使用類固醇', '血液輸注'],
      correctAnswer: 1,
      explanation: 'Sun Yang因破壞檢測設備和拒絕配合檢測被禁賽8年。'
    },
    {
      id: 39,
      category: '經典案例',
      question: '哈薩克舉重隊在奧運重檢中主要被發現使用什麼？',
      options: ['EPO', 'Stanozolol', 'HGH', 'Cocaine'],
      correctAnswer: 1,
      explanation: '哈薩克舉重隊多名選手在奧運重檢中被發現使用Stanozolol。'
    },
    {
      id: 40,
      category: '經典案例',
      question: '中國1990年代游泳隊醜聞主要涉及什麼物質？',
      options: ['EPO', 'DHT', 'Stanozolol', 'HGH'],
      correctAnswer: 1,
      explanation: '1990年代中國游泳隊醜聞主要涉及DHT（雙氫睪固酮）的使用。'
    },
    
    // 其他類題目（10題，20%）
    {
      id: 41,
      category: '其他',
      question: 'WADA的總部設在哪裡？',
      options: ['洛桑', '蒙特利爾', '紐約', '倫敦'],
      correctAnswer: 1,
      explanation: 'WADA（世界反興奮劑機構）總部設在加拿大蒙特利爾。'
    },
    {
      id: 42,
      category: '其他',
      question: 'USADA是哪個國家的反禁藥機構？',
      options: ['英國', '澳洲', '美國', '德國'],
      correctAnswer: 2,
      explanation: 'USADA是美國反興奮劑機構(United States Anti-Doping Agency)。'
    },
    {
      id: 43,
      category: '其他',
      question: '奧運會檢測樣本可以保存多長時間？',
      options: ['2年', '4年', '8年', '10年'],
      correctAnswer: 3,
      explanation: '奧運會檢測樣本可以保存10年，允許使用新技術重新檢測。'
    },
    {
      id: 44,
      category: '其他',
      question: 'CAS是什麼機構？',
      options: ['國際奧委會', '國際體育仲裁法庭', '世界反興奮劑機構', '國際單項體育聯合會'],
      correctAnswer: 1,
      explanation: 'CAS是國際體育仲裁法庭(Court of Arbitration for Sport)。'
    },
    {
      id: 45,
      category: '其他',
      question: '運動員可以對禁藥檢測結果提出申訴的時限通常是？',
      options: ['7天', '14天', '21天', '30天'],
      correctAnswer: 2,
      explanation: '運動員通常有21天時間對禁藥檢測陽性結果提出申訴。'
    },
    {
      id: 46,
      category: '其他',
      question: '世界反興奮劑條例(WADC)多久更新一次？',
      options: ['每年', '每兩年', '每三年', '每四年'],
      correctAnswer: 2,
      explanation: '世界反興奮劑條例通常每三年進行一次重大修訂。'
    },
    {
      id: 47,
      category: '其他',
      question: '運動員錯過檢測的後果是什麼？',
      options: ['沒有後果', '警告', '計入違規記錄', '立即禁賽'],
      correctAnswer: 2,
      explanation: '12個月內三次錯過檢測或提供錯誤行蹤信息等同於違規。'
    },
    {
      id: 48,
      category: '其他',
      question: '檢測官員進行檢測時需要運動員提供什麼？',
      options: ['只需要樣本', '身分證明', '教練同意', '醫生證明'],
      correctAnswer: 1,
      explanation: '運動員需要提供有效的身分證明文件給檢測官員。'
    },
    {
      id: 49,
      category: '其他',
      question: '運動員在提供樣本前可以做什麼？',
      options: ['離開現場', '拒絕檢測', '延遲合理時間', '要求更換檢測官'],
      correctAnswer: 2,
      explanation: '運動員可以要求延遲合理時間完成比賽或處理緊急事務。'
    },
    {
      id: 50,
      category: '其他',
      question: '反禁藥教育的主要目的是什麼？',
      options: ['懲罰運動員', '預防違規', '增加檢測', '提高成績'],
      correctAnswer: 1,
      explanation: '反禁藥教育的主要目的是預防違規，提高運動員的反禁藥意識。'
    }
  ],
  
  // 各科專區內容
  specialties: [
    {
      id: 1,
      specialty: '復健科/運動醫學科',
      description: '復健科和運動醫學科醫師在治療運動傷害和疼痛時需要特別注意的禁用藥物',
      icon: '🏥',
      medications: [
        {
          category: '類固醇注射劑',
          wadaCategory: 'S9: 糖皮質激素',
          substances: [
            'Triamcinolone (Kenalog)',
            'Methylprednisolone (Depo-Medrol)', 
            'Dexamethasone',
            'Betamethasone'
          ],
          notes: '關節內注射、肌肉注射、軟組織注射在比賽期間需要TUE',
          alternatives: '物理治療、非類固醇抗發炎藥物、玻尿酸注射'
        },
        {
          category: '強效止痛劑',
          wadaCategory: 'S7: 麻醉劑',
          substances: [
            'Morphine',
            'Fentanyl',
            'Tramadol',
            'Codeine'
          ],
          notes: '比賽期間禁用，可能掩蓋嚴重傷害',
          alternatives: 'NSAIDs、局部麻醉劑、物理治療'
        },
        {
          category: '肌肉鬆弛劑',
          wadaCategory: '監控清單',
          substances: [
            'Diazepam',
            'Cyclobenzaprine',
            'Baclofen'
          ],
          notes: '某些含有禁用成分，需仔細檢查',
          alternatives: '物理治療、伸展運動、熱敷'
        }
      ]
    },
    {
      id: 2,
      specialty: '耳鼻喉科',
      description: '耳鼻喉科治療過敏性鼻炎、氣喘等疾病時常用的禁用藥物',
      icon: '👃',
      medications: [
        {
          category: '鼻噴劑類固醇',
          wadaCategory: 'S9: 糖皮質激素',
          substances: [
            'Beclomethasone (Beclomet)',
            'Fluticasone (Avamys)',
            'Mometasone (Nasonex)',
            'Budesonide (Rhinocort)'
          ],
          notes: '局部使用通常允許，但需要詳細記錄',
          alternatives: '生理食鹽水洗鼻、抗組織胺'
        },
        {
          category: '口服抗組織胺',
          wadaCategory: '一般允許',
          substances: [
            'Cetirizine (Zyrtec)',
            'Loratadine (Claritin)',
            'Fexofenadine (Allegra)'
          ],
          notes: '大多數抗組織胺是允許的',
          alternatives: '避免過敏原、鼻腔清洗'
        },
        {
          category: '支氣管擴張劑',
          wadaCategory: 'S3: Beta-2激動劑',
          substances: [
            'Salbutamol (需TUE)',
            'Formoterol (需TUE)',
            'Salmeterol (禁用)',
            'Terbutaline (需TUE)'
          ],
          notes: 'Salbutamol吸入劑需要TUE，但有劑量限制',
          alternatives: '避免過敏原、非藥物治療'
        }
      ]
    },
    {
      id: 3,
      specialty: '婦產科',
      description: '婦產科治療荷爾蒙失調、避孕等問題時需要注意的相關藥物',
      icon: '🤱',
      medications: [
        {
          category: '荷爾蒙治療',
          wadaCategory: 'S4: 激素調節劑',
          substances: [
            'Clomiphene (排卵藥)',
            'HCG (人類絨毛膜促性腺激素)',
            'Anastrozole (芳香酶抑制劑)',
            'Tamoxifen (抗雌激素)'
          ],
          notes: '這些藥物可能影響荷爾蒙平衡，屬於禁用物質',
          alternatives: '與婦產科醫師討論替代治療方案'
        },
        {
          category: '避孕藥',
          wadaCategory: '一般允許',
          substances: [
            '複合型口服避孕藥',
            '純黃體素避孕藥',
            '避孕器'
          ],
          notes: '一般避孕藥是允許的',
          alternatives: '非荷爾蒙避孕方法'
        },
        {
          category: '催產素類',
          wadaCategory: 'S2: 肽類激素',
          substances: [
            'Oxytocin',
            'Ergometrine'
          ],
          notes: '分娩相關藥物，需要醫療豁免',
          alternatives: '自然分娩、非藥物方法'
        }
      ]
    },
    {
      id: 4,
      specialty: '血液腫瘤科',
      description: '血液腫瘤科治療貧血、血液疾病時使用的相關禁用藥物',
      icon: '🩸',
      medications: [
        {
          category: '造血刺激劑',
          wadaCategory: 'S2.1: 促紅血球生成素類',
          substances: [
            'Epoetin alfa (EPO)',
            'Darbepoetin alfa',
            'Methoxy PEG-epoetin beta',
            'Epoetin beta'
          ],
          notes: '治療貧血的EPO類藥物是嚴格禁用的',
          alternatives: '鐵劑補充、輸血（在醫療監督下）'
        },
        {
          category: '生長因子',
          wadaCategory: 'S2.3: 生長因子',
          substances: [
            'G-CSF (顆粒球群落刺激因子)',
            'GM-CSF',
            'Thrombopoietin受體激動劑'
          ],
          notes: '用於刺激血球生成的因子可能被禁用',
          alternatives: '支持性療法、營養補充'
        },
        {
          category: '抗凝血劑',
          wadaCategory: '一般允許',
          substances: [
            'Warfarin',
            'Heparin',
            'Rivaroxaban',
            'Apixaban'
          ],
          notes: '抗凝血劑通常是允許的',
          alternatives: '物理預防方法'
        }
      ]
    },
    {
      id: 5,
      specialty: '內分泌科',
      description: '內分泌科治療糖尿病、甲狀腺疾病時需要注意的禁用藥物',
      icon: '🧬',
      medications: [
        {
          category: '胰島素',
          wadaCategory: 'S2.2: 肽類激素',
          substances: [
            '速效胰島素',
            '長效胰島素',
            '混合型胰島素'
          ],
          notes: '糖尿病患者使用胰島素需要TUE',
          alternatives: '飲食控制、運動、口服降血糖藥（部分）'
        },
        {
          category: '生長激素',
          wadaCategory: 'S2.2: 肽類激素',
          substances: [
            'Somatropin (HGH)',
            'Somatrem'
          ],
          notes: '治療生長激素缺乏症需要嚴格的TUE',
          alternatives: '營養支持、其他荷爾蒙替代'
        },
        {
          category: '甲狀腺藥物',
          wadaCategory: '一般允許',
          substances: [
            'Levothyroxine (T4)',
            'Liothyronine (T3)',
            '抗甲狀腺藥物'
          ],
          notes: '甲狀腺藥物通常是允許的',
          alternatives: '營養支持、生活方式調整'
        }
      ]
    },
    {
      id: 6,
      specialty: '心臟科',
      description: '心臟科治療高血壓、心律不整等疾病時的禁用藥物注意事項',
      icon: '❤️',
      medications: [
        {
          category: 'Beta阻斷劑',
          wadaCategory: 'P1: Beta阻斷劑',
          substances: [
            'Propranolol',
            'Atenolol',
            'Metoprolol',
            'Bisoprolol'
          ],
          notes: '在射箭、射擊等精準運動中禁用',
          alternatives: 'ACE抑制劑、鈣離子阻斷劑、利尿劑（非禁用類）'
        },
        {
          category: '利尿劑',
          wadaCategory: 'S5: 利尿劑和掩蔽劑',
          substances: [
            'Furosemide',
            'Hydrochlorothiazide',
            'Spironolactone',
            'Indapamide'
          ],
          notes: '所有利尿劑都是禁用的，因為可能用作掩蔽劑',
          alternatives: 'ACE抑制劑、鈣離子阻斷劑、Beta阻斷劑（非精準運動）'
        },
        {
          category: '硝酸鹽類',
          wadaCategory: '一般允許',
          substances: [
            'Nitroglycerin',
            'Isosorbide mononitrate'
          ],
          notes: '硝酸鹽類通常是允許的',
          alternatives: '鈣離子阻斷劑、其他血管擴張劑'
        }
      ]
    },
    {
      id: 7,
      specialty: '精神科',
      description: '精神科治療憂鬱症、焦慮症、ADHD等疾病時的禁用藥物',
      icon: '🧠',
      medications: [
        {
          category: 'ADHD治療藥物',
          wadaCategory: 'S6: 興奮劑',
          substances: [
            'Methylphenidate (Ritalin)',
            'Amphetamine (Adderall)',
            'Modafinil',
            'Lisdexamfetamine'
          ],
          notes: '比賽期間禁用，需要TUE才能使用',
          alternatives: '行為治療、非興奮劑類ADHD藥物'
        },
        {
          category: '抗憂鬱劑',
          wadaCategory: '一般允許',
          substances: [
            'SSRI類 (Fluoxetine, Sertraline)',
            'SNRI類 (Venlafaxine)',
            '三環抗憂鬱劑'
          ],
          notes: '大多數抗憂鬱劑是允許的',
          alternatives: '心理治療、認知行為治療'
        },
        {
          category: '抗焦慮藥物',
          wadaCategory: '監控清單',
          substances: [
            'Benzodiazepines',
            'Barbiturates'
          ],
          notes: '可能影響運動表現，需要謹慎使用',
          alternatives: '放鬆技巧、冥想、心理治療'
        }
      ]
    },
    {
      id: 8,
      specialty: '皮膚科',
      description: '皮膚科治療皮膚炎、感染等問題時使用的外用禁用藥物',
      icon: '🧴',
      medications: [
        {
          category: '外用類固醇',
          wadaCategory: 'S9: 糖皮質激素',
          substances: [
            'Hydrocortisone',
            'Betamethasone',
            'Clobetasol',
            'Triamcinolone'
          ],
          notes: '外用類固醇通常允許，但大面積使用需注意',
          alternatives: '保濕劑、非類固醇抗發炎藥膏'
        },
        {
          category: '免疫抑制劑',
          wadaCategory: '一般允許',
          substances: [
            'Tacrolimus',
            'Pimecrolimus',
            'Ciclosporin (外用)'
          ],
          notes: '外用免疫抑制劑通常是允許的',
          alternatives: '保濕、避免刺激物'
        }
      ]
    }
  ]
};

// Get all educational content
router.get('/', (req, res) => {
  res.json({
    substances: educationalContent.substances,
    quizzes: educationalContent.quizzes,
    specialties: educationalContent.specialties
  });
});

// Get substance information
router.get('/substances', (req, res) => {
  res.json(educationalContent.substances);
});

// Get quizzes (隨機排序50題)
router.get('/quizzes', (req, res) => {
  // 隨機打亂題目順序
  const shuffledQuizzes = [...educationalContent.quizzes].sort(() => Math.random() - 0.5);
  res.json(shuffledQuizzes);
});

// Submit quiz answer
router.post('/quizzes/:id/answer', (req, res) => {
  const quizId = parseInt(req.params.id);
  const { answer } = req.body;
  
  const quiz = educationalContent.quizzes.find(q => q.id === quizId);
  
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  const isCorrect = answer === quiz.correctAnswer;
  
  res.json({
    correct: isCorrect,
    correctAnswer: quiz.correctAnswer,
    explanation: quiz.explanation
  });
});

// Get specialties (各科專區)
router.get('/specialties', (req, res) => {
  res.json(educationalContent.specialties);
});

// Get single specialty
router.get('/specialties/:id', (req, res) => {
  const specialtyId = parseInt(req.params.id);
  const specialty = educationalContent.specialties.find(s => s.id === specialtyId);
  
  if (!specialty) {
    return res.status(404).json({ error: 'Specialty not found' });
  }
  
  res.json(specialty);
});

module.exports = router;