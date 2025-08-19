const express = require('express');
const router = express.Router();

// TUE 完整內容數據
const tueContent = {
  basicInfo: [
    {
      id: 1,
      title: '什麼是治療用途豁免(TUE)？',
      content: 'TUE是Therapeutic Use Exemption的縮寫，即治療用途豁免。當運動員因健康需要必須使用WADA禁用清單上的物質或方法時，可以通過TUE申請程序獲得使用許可。',
      points: [
        '僅適用於醫療必需的治療',
        '必須符合嚴格的申請條件',
        '需要經過專業醫療委員會審查',
        '有明確的有效期限'
      ]
    },
    {
      id: 2,
      title: 'TUE申請的基本條件',
      content: '運動員申請TUE必須同時滿足以下四個條件，缺一不可：',
      points: [
        '該物質/方法對治療運動員的急性或慢性疾病具有醫療必需性',
        '停止使用該物質/方法可能對運動員的健康產生重大不利影響',
        '使用該物質/方法不會產生超出治療所需的額外運動表現提升效果',
        '沒有合理的替代治療方法'
      ]
    },
    {
      id: 3,
      title: 'TUE的適用範圍',
      content: '不同級別的運動員需要向不同的組織申請TUE：',
      points: [
        '國際級運動員：向相關國際單項體育組織申請',
        '國家級運動員：向國家反禁藥組織申請',
        '地方級運動員：向地方反禁藥組織申請',
        '特殊情況下可能需要追溯性TUE'
      ]
    },
    {
      id: 4,
      title: '申請時機與期限',
      content: 'TUE申請有明確的時間要求，運動員應提前規劃：',
      points: [
        '建議在需要使用前至少30天提出申請',
        '緊急醫療情況可申請追溯性TUE',
        '申請結果通常在21個工作天內公布',
        'TUE有效期根據醫療需要而定，最長通常不超過4年'
      ]
    }
  ],
  applicationGuide: {
    steps: [
      {
        title: '準備醫療文件',
        description: '收集完整的醫療診斷和治療建議文件',
        documents: [
          '完整的醫療診斷報告',
          '治療計劃和用藥建議',
          '相關檢測報告和影像資料',
          '過往治療記錄'
        ]
      },
      {
        title: '填寫申請表',
        description: '下載並完整填寫TUE申請表格',
        documents: [
          'TUE申請表',
          '醫師證明書',
          '藥物使用說明'
        ]
      },
      {
        title: '醫師簽名確認',
        description: '由具資格的醫師審核並簽名確認申請內容',
        documents: [
          '醫師執照副本',
          '醫師簽名確認書'
        ]
      },
      {
        title: '提交申請',
        description: '將完整申請文件提交至相關反禁藥組織',
        documents: [
          '所有文件的正本或認證副本',
          '申請費用繳費證明（如適用）'
        ]
      },
      {
        title: '等待審查',
        description: '專業醫療委員會審查申請，可能要求補充資料',
        documents: [
          '補充醫療資料（如要求）',
          '回應審查委員會提問'
        ]
      },
      {
        title: '獲得決定',
        description: '收到TUE決定通知，如獲批准則可開始使用',
        documents: [
          'TUE證書（如獲批准）',
          '駁回理由說明（如被拒絕）'
        ]
      }
    ],
    documents: [
      {
        name: 'TUE申請表',
        description: '標準TUE申請表格',
        url: '#',
        fileSize: '2.1 MB'
      },
      {
        name: '醫師證明書範本',
        description: '醫師填寫的標準證明格式',
        url: '#',
        fileSize: '1.5 MB'
      },
      {
        name: 'TUE申請指南',
        description: '詳細申請流程說明',
        url: '#',
        fileSize: '3.2 MB'
      },
      {
        name: '常見疾病TUE範例',
        description: '氣喘、糖尿病等常見疾病的申請範例',
        url: '#',
        fileSize: '4.7 MB'
      }
    ]
  },
  diseaseGuides: [
    {
      id: 1,
      name: '氣喘 (Asthma)',
      description: '氣喘是最常見需要申請TUE的疾病之一。運動引起的支氣管收縮需要使用Beta-2激動劑治療。',
      commonMedications: [
        'Salbutamol (吸入劑)',
        'Formoterol',
        'Salmeterol',
        'Terbutaline'
      ],
      tuePoints: [
        '需要提供明確的氣喘診斷證據',
        '運動誘發性氣喘需要運動激發試驗',
        'Salbutamol吸入劑有劑量限制（24小時內不超過1600微克）',
        '需要定期評估治療效果',
        '口服Beta-2激動劑通常不被批准'
      ],
      alternatives: '非藥物治療包括：避免過敏原、呼吸技巧訓練、環境控制等。某些情況下可考慮抗白三烯素類藥物。'
    },
    {
      id: 2,
      name: '糖尿病 (Diabetes)',
      description: '第一型糖尿病患者需要使用胰島素維持血糖控制，這是生命必需的治療。',
      commonMedications: [
        '速效胰島素',
        '長效胰島素',
        '混合型胰島素',
        'Glucagon'
      ],
      tuePoints: [
        '需要內分泌科醫師的診斷證明',
        '提供血糖監測記錄',
        '說明胰島素使用的必要性',
        '定期評估血糖控制狀況',
        '緊急情況下的處理計劃'
      ],
      alternatives: '第一型糖尿病沒有替代治療方法，胰島素是生命必需品。第二型糖尿病可考慮飲食控制、運動療法和其他口服藥物。'
    },
    {
      id: 3,
      name: '注意力缺陷過動症 (ADHD)',
      description: 'ADHD患者可能需要使用興奮劑類藥物來改善專注力和行為控制。',
      commonMedications: [
        'Methylphenidate (利他林)',
        'Amphetamine',
        'Modafinil',
        'Atomoxetine (非興奮劑)'
      ],
      tuePoints: [
        '需要精神科或神經科醫師診斷',
        '提供詳細的症狀評估記錄',
        '證明藥物治療的必要性',
        '考慮非藥物治療的效果',
        '定期評估藥物效果和副作用'
      ],
      alternatives: '行為治療、認知行為療法、環境調整、時間管理技巧等非藥物方法。Atomoxetine等非興奮劑類藥物可能是選擇。'
    },
    {
      id: 4,
      name: '心血管疾病',
      description: '心血管疾病患者可能需要使用Beta阻斷劑或利尿劑等禁用藥物。',
      commonMedications: [
        'Propranolol',
        'Atenolol',
        'Metoprolol',
        'Furosemide',
        'Hydrochlorothiazide'
      ],
      tuePoints: [
        '心臟科醫師的詳細診斷',
        '心電圖、超音波等檢查結果',
        '證明藥物治療的醫療必要性',
        '評估對運動表現的潜在影響',
        '定期心臟功能評估'
      ],
      alternatives: 'ACE抑制劑、鈣離子阻斷劑等非禁用藥物，生活方式調整，心臟復健計劃。'
    },
    {
      id: 5,
      name: '焦慮症',
      description: '嚴重焦慮症患者可能需要使用鎮靜劑，但在運動中使用需要謹慎評估。',
      commonMedications: [
        'Benzodiazepines',
        'Beta阻斷劑 (off-label)',
        'SSRI抗憂鬱劑'
      ],
      tuePoints: [
        '精神科醫師的詳細評估',
        '證明焦慮症對生活的嚴重影響',
        '評估藥物對運動表現的影響',
        '考慮非藥物治療的效果',
        '定期評估治療需求'
      ],
      alternatives: '認知行為療法、放鬆技巧、冥想、運動療法、非禁用的抗焦慮藥物。'
    },
    {
      id: 6,
      name: '慢性疼痛',
      description: '慢性疼痛患者可能需要使用麻醉劑類止痛藥，但必須證明醫療必要性。',
      commonMedications: [
        'Morphine',
        'Codeine',
        'Tramadol',
        'Fentanyl'
      ],
      tuePoints: [
        '疼痛科或相關專科醫師診斷',
        '詳細的疼痛評估和病史',
        '證明其他止痛方法無效',
        '評估成癮風險',
        '定期評估疼痛控制效果'
      ],
      alternatives: '非類固醇抗發炎藥物(NSAIDs)、物理治療、針灸、神經阻斷術、心理治療等綜合疼痛管理方法。'
    }
  ],
  tools: {
    checklist: [
      {
        title: '診斷文件完整性',
        description: '確保有完整的醫療診斷報告，包括診斷依據、檢查結果等'
      },
      {
        title: '治療必要性證明',
        description: '醫師需明確說明為何該藥物/方法對治療是必需的'
      },
      {
        title: '替代方案評估',
        description: '證明已考慮過其他非禁用的治療選項，但均不適合或無效'
      },
      {
        title: '劑量合理性',
        description: '使用劑量應符合醫療需求，不超過治療所需'
      },
      {
        title: '醫師資格確認',
        description: '開具證明的醫師應具備相關專科資格'
      },
      {
        title: '申請表完整填寫',
        description: '所有必填欄位都已正確填寫，沒有遺漏'
      },
      {
        title: '文件簽名確認',
        description: '所有需要簽名的文件都已由相關人員簽名確認'
      },
      {
        title: '時效性檢查',
        description: '所有醫療文件都在有效期限內，診斷證明不超過一年'
      }
    ]
  }
};

// WADA禁藥數據庫 (簡化版)
const wadaSubstances = {
  // Beta-2激動劑
  'salbutamol': { needsTUE: true, category: 'S3: Beta-2激動劑', note: '吸入劑需要TUE，有劑量限制' },
  'formoterol': { needsTUE: true, category: 'S3: Beta-2激動劑', note: '需要TUE申請' },
  'clenbuterol': { needsTUE: false, category: 'S3: Beta-2激動劑', note: '完全禁用，不可申請TUE' },
  
  // 胰島素
  'insulin': { needsTUE: true, category: 'S2.2: 肽類激素', note: '糖尿病患者可申請TUE' },
  'glucagon': { needsTUE: true, category: 'S2.2: 肽類激素', note: '緊急情況下可使用' },
  
  // 興奮劑
  'methylphenidate': { needsTUE: true, category: 'S6: 興奮劑', note: 'ADHD患者可申請TUE，僅比賽期間禁用' },
  'amphetamine': { needsTUE: true, category: 'S6: 興奮劑', note: 'ADHD患者可申請TUE，僅比賽期間禁用' },
  'modafinil': { needsTUE: true, category: 'S6: 興奮劑', note: '嗜睡症患者可申請TUE' },
  'cocaine': { needsTUE: false, category: 'S6: 興奮劑', note: '完全禁用，不可申請TUE' },
  
  // Beta阻斷劑
  'propranolol': { needsTUE: true, category: 'P1: Beta阻斷劑', note: '僅在特定精準運動項目中需要TUE' },
  'atenolol': { needsTUE: true, category: 'P1: Beta阻斷劑', note: '僅在特定精準運動項目中需要TUE' },
  
  // 利尿劑
  'furosemide': { needsTUE: true, category: 'S5: 利尿劑', note: '心臟病患者可申請TUE' },
  'hydrochlorothiazide': { needsTUE: true, category: 'S5: 利尿劑', note: '高血壓患者可申請TUE' },
  
  // 麻醉劑
  'morphine': { needsTUE: true, category: 'S7: 麻醉劑', note: '慢性疼痛患者可申請TUE，僅比賽期間禁用' },
  'codeine': { needsTUE: true, category: 'S7: 麻醉劑', note: '疼痛治療可申請TUE，僅比賽期間禁用' },
  'tramadol': { needsTUE: true, category: 'S7: 麻醉劑', note: '疼痛治療可申請TUE，僅比賽期間禁用' },
  
  // 糖皮質激素
  'prednisolone': { needsTUE: true, category: 'S9: 糖皮質激素', note: '口服或注射需要TUE，外用通常允許' },
  'dexamethasone': { needsTUE: true, category: 'S9: 糖皮質激素', note: '口服或注射需要TUE' },
  'hydrocortisone': { needsTUE: false, category: 'S9: 糖皮質激素', note: '外用通常允許' },
  
  // 合成代謝劑
  'testosterone': { needsTUE: false, category: 'S1: 合成代謝劑', note: '完全禁用，不可申請TUE' },
  'nandrolone': { needsTUE: false, category: 'S1: 合成代謝劑', note: '完全禁用，不可申請TUE' },
  
  // 一般允許的藥物
  'paracetamol': { needsTUE: false, category: '允許使用', note: '一般止痛藥，無需TUE' },
  'ibuprofen': { needsTUE: false, category: '允許使用', note: '非類固醇抗發炎藥，無需TUE' },
  'aspirin': { needsTUE: false, category: '允許使用', note: '一般解熱鎮痛藥，無需TUE' },
  'cetirizine': { needsTUE: false, category: '允許使用', note: '抗組織胺，無需TUE' },
  'loratadine': { needsTUE: false, category: '允許使用', note: '抗組織胺，無需TUE' }
};

// Get all TUE content
router.get('/', (req, res) => {
  res.json(tueContent);
});

// Get basic information
router.get('/basic', (req, res) => {
  res.json(tueContent.basicInfo);
});

// Get application guide
router.get('/application', (req, res) => {
  res.json(tueContent.applicationGuide);
});

// Get disease guides
router.get('/diseases', (req, res) => {
  res.json(tueContent.diseaseGuides);
});

// Get tools
router.get('/tools', (req, res) => {
  res.json(tueContent.tools);
});

// Drug TUE check
router.post('/check', (req, res) => {
  const { drugName } = req.body;
  
  if (!drugName) {
    return res.status(400).json({ error: '請提供藥物名稱' });
  }
  
  const normalizedDrugName = drugName.toLowerCase().trim();
  const drugInfo = wadaSubstances[normalizedDrugName];
  
  if (drugInfo) {
    res.json({
      drugName: drugName,
      needsTUE: drugInfo.needsTUE,
      wadaCategory: drugInfo.category,
      explanation: drugInfo.note
    });
  } else {
    // 未找到藥物資訊
    res.json({
      drugName: drugName,
      needsTUE: null,
      wadaCategory: '未知',
      explanation: `未找到 "${drugName}" 的資訊。建議：1) 檢查藥物名稱是否正確 2) 諮詢醫療專業人員 3) 查閱最新WADA禁用清單 4) 聯繫相關反禁藥組織確認`
    });
  }
});

module.exports = router;