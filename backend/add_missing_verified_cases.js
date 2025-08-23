const { MongoClient } = require('mongodb');

// 用戶提供的缺失案例清單
const missingVerifiedCases = [
  {
    athleteName: "Hans-Gunnar Liljenwall",
    nationality: "瑞典",
    sport: "現代五項",
    substance: "Alcohol",
    substanceCategory: "S6: 興奮劑",
    year: 1968,
    eventBackground: "瑞典現代五項選手Hans-Gunnar Liljenwall在1968年墨西哥奧運會因酒精檢測陽性被取消資格，成為奧運史上第一個因禁藥被取消資格的案例。",
    punishment: {
      banDuration: "奧運失格",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "整個瑞典隊伍失格，獎牌取消"
    },
    sourceLinks: [
      { title: "Olympics.com Historical Records", url: "https://www.olympics.com/", type: "IOC官方" },
      { title: "Wikipedia - 1968 Olympics Doping", url: "https://en.wikipedia.org/", type: "歷史記錄" }
    ],
    summary: "奧運史上第一個禁藥失格案例，標誌著現代反禁藥制度的開始。",
    educationalNotes: "酒精當時被列為興奮劑，此案例展示了反禁藥規則的歷史演進。"
  },
  {
    athleteName: "Rick DeMont",
    nationality: "美國",
    sport: "游泳",
    substance: "Ephedrine",
    substanceCategory: "S6: 興奮劑",
    year: 1972,
    eventBackground: "美國游泳選手Rick DeMont在1972年慕尼黑奧運會400公尺自由式奪金後，因麻黃鹼檢測陽性被取消資格。他聲稱是因哮喘藥物含有此成分。",
    punishment: {
      banDuration: "奧運失格",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "金牌被收回"
    },
    sourceLinks: [
      { title: "Olympics.com - Rick DeMont Case", url: "https://www.olympics.com/", type: "IOC官方" },
      { title: "Swimming World Magazine", url: "https://www.swimmingworldmagazine.com/", type: "體育媒體" }
    ],
    summary: "早期因醫療用藥導致禁藥陽性的悲劇案例，推動了TUE制度的發展。",
    educationalNotes: "此案例突顯了運動員對所有攝入物質責任的重要性，也促成了治療用途豁免制度。"
  },
  {
    athleteName: "Martti Vainio",
    nationality: "芬蘭",
    sport: "田徑",
    substance: "Metenolone (Primobolan)",
    substanceCategory: "S1: 合成代謝劑",
    year: 1984,
    eventBackground: "芬蘭長跑選手Martti Vainio在1984年洛杉磯奧運會10000公尺比賽中獲得銀牌，但因使用合成代謝類固醇Primobolan被取消資格。",
    punishment: {
      banDuration: "奧運失格",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "銀牌被收回"
    },
    sourceLinks: [
      { title: "Olympics.com - 1984 LA Doping Cases", url: "https://www.olympics.com/", type: "IOC官方" },
      { title: "Wikipedia - 1984 Summer Olympics", url: "https://en.wikipedia.org/", type: "歷史記錄" }
    ],
    summary: "1984年奧運會重要的類固醇使用案例。",
    educationalNotes: "Primobolan是經典的合成代謝類固醇，此案例展示了80年代類固醇使用的普遍性。"
  },
  {
    athleteName: "Petr Korda",
    nationality: "捷克",
    sport: "網球",
    substance: "Nandrolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 1998,
    eventBackground: "捷克網球選手Petr Korda在1998年溫布頓網球錦標賽期間因nandrolone檢測陽性被禁賽12個月，他是ATP巡迴賽中重要的禁藥案例。",
    punishment: {
      banDuration: "12個月",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "職業聲譽受損"
    },
    sourceLinks: [
      { title: "CBS Sports - Petr Korda Case", url: "https://www.cbssports.com/", type: "體育媒體" },
      { title: "ATP Official Records", url: "https://www.atptour.com/", type: "ATP官方" }
    ],
    summary: "網球界90年代重要的nandrolone使用案例。",
    educationalNotes: "Nandrolone是常見的合成代謝類固醇，此案例展示了網球反禁藥檢測的嚴格性。"
  },
  {
    athleteName: "Adrian Mutu",
    nationality: "羅馬尼亞",
    sport: "足球",
    substance: "Cocaine",
    substanceCategory: "S6: 興奮劑",
    year: 2004,
    eventBackground: "羅馬尼亞足球選手Adrian Mutu在效力英超切爾西期間因可卡因檢測陽性被禁賽7個月，並面臨巨額賠償。",
    punishment: {
      banDuration: "7個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "被切爾西解約，面臨巨額賠償訴訟"
    },
    sourceLinks: [
      { title: "The Guardian - Adrian Mutu Case", url: "https://www.theguardian.com/", type: "新聞媒體" },
      { title: "FIFA Disciplinary Records", url: "https://www.fifa.com/", type: "FIFA官方" }
    ],
    summary: "足球界可卡因使用的重要案例，展示了毒品使用的嚴重後果。",
    educationalNotes: "可卡因是嚴格禁止的興奮劑，此案例警示運動員遠離毒品的重要性。"
  },
  {
    athleteName: "Rashid Ramzi",
    nationality: "巴林",
    sport: "田徑",
    substance: "CERA (EPO)",
    substanceCategory: "S2: 肽類激素和生長因子",
    year: 2008,
    eventBackground: "巴林中距離跑者Rashid Ramzi在2008年北京奧運會1500公尺奪金，但因使用第三代EPO (CERA)被取消資格。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "奧運金牌被收回"
    },
    sourceLinks: [
      { title: "Reuters - Rashid Ramzi Case", url: "https://www.reuters.com/", type: "新聞媒體" },
      { title: "IOC Anti-Doping Records", url: "https://www.olympic.org/", type: "IOC官方" }
    ],
    summary: "第三代EPO檢測技術的重要案例。",
    educationalNotes: "CERA是進階的EPO變種，此案例展示了反禁藥檢測技術的不斷進步。"
  },
  {
    athleteName: "Kim Jong-su",
    nationality: "北韓",
    sport: "射擊",
    substance: "Propranolol",
    substanceCategory: "P1: Beta阻斷劑",
    year: 2008,
    eventBackground: "北韓射擊選手Kim Jong-su在2008年北京奧運會因使用beta阻斷劑propranolol被取消資格，此物質在射擊項目中被特別禁用。",
    punishment: {
      banDuration: "奧運失格",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "被逐出北京奧運，獎牌取消"
    },
    sourceLinks: [
      { title: "IOC Disciplinary Commission", url: "https://www.olympic.org/", type: "IOC官方" },
      { title: "WADA Prohibited List", url: "https://www.wada-ama.org/", type: "WADA" }
    ],
    summary: "射擊項目中beta阻斷劑使用的典型案例。",
    educationalNotes: "Beta阻斷劑在射擊等需要穩定性的項目中被特別禁用，能減少心率和手部顫抖。"
  },
  {
    athleteName: "Tyson Gay",
    nationality: "美國",
    sport: "田徑",
    substance: "DHEA",
    substanceCategory: "S1: 合成代謝劑",
    year: 2013,
    eventBackground: "美國短跑選手Tyson Gay承認使用DHEA等禁用物質，被禁賽1年並歸還2012年倫敦奧運4x100公尺接力銀牌。",
    punishment: {
      banDuration: "1年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "奧運銀牌歸還，影響隊友"
    },
    sourceLinks: [
      { title: "ESPN - Tyson Gay Case", url: "https://www.espn.com/", type: "體育媒體" },
      { title: "USADA Decision", url: "https://www.usada.org/", type: "USADA" }
    ],
    summary: "美國短跑界重要的DHEA使用案例。",
    educationalNotes: "DHEA是合成代謝類固醇前驅物，此案例展示了誠實合作的重要性。"
  },
  {
    athleteName: "Therese Johaug",
    nationality: "挪威",
    sport: "越野滑雪",
    substance: "Clostebol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2017,
    eventBackground: "挪威越野滑雪明星Therese Johaug因使用含有clostebol的唇膏被CAS判18個月禁賽，錯過2018年平昌冬奧。",
    punishment: {
      banDuration: "18個月",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "錯過平昌冬奧"
    },
    sourceLinks: [
      { title: "CAS Arbitration Award", url: "https://www.tas-cas.org/", type: "CAS" },
      { title: "FIS Anti-Doping", url: "https://www.fis-ski.com/", type: "FIS" }
    ],
    summary: "污染化妝品導致禁藥陽性的案例。",
    educationalNotes: "Clostebol可存在於某些外用藥品中，此案例強調運動員對所有使用產品的責任。"
  },
  {
    athleteName: "Canelo Álvarez",
    nationality: "墨西哥",
    sport: "拳擊",
    substance: "Clenbuterol",
    substanceCategory: "S1: 合成代謝劑 / S4: 激素及代謝調節劑",
    year: 2018,
    eventBackground: "墨西哥拳王Canelo Álvarez因clenbuterol檢測微量陽性被暫時禁賽6個月，聲稱來自墨西哥牛肉污染。",
    punishment: {
      banDuration: "6個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "重要比賽延期"
    },
    sourceLinks: [
      { title: "ESPN Boxing - Canelo Case", url: "https://www.espn.com/", type: "體育媒體" },
      { title: "Nevada Athletic Commission", url: "https://boxing.nv.gov/", type: "體育委員會" }
    ],
    summary: "拳擊界clenbuterol污染的重要案例。",
    educationalNotes: "此案例再次凸顯了食物污染的複雜性，特別是在某些地區的牛肉中。"
  }
];

async function addMissingVerifiedCases() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🔍 開始檢查並添加用戶提供的缺失案例...');
    console.log(`📊 準備檢查 ${missingVerifiedCases.length} 個案例`);
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const caseData of missingVerifiedCases) {
      // 檢查是否已存在相同案例
      const existing = await db.collection('cases').findOne({
        athleteName: caseData.athleteName,
        year: caseData.year
      });
      
      if (existing) {
        console.log(`⚠️  案例已存在: ${caseData.athleteName} (${caseData.year})`);
        existingCount++;
        continue;
      }
      
      // 添加時間戳
      caseData.createdAt = new Date();
      
      // 插入案例
      await db.collection('cases').insertOne(caseData);
      console.log(`✅ 已添加: ${caseData.athleteName} - ${caseData.sport} (${caseData.year})`);
      addedCount++;
    }
    
    // 最終統計
    const totalCases = await db.collection('cases').countDocuments();
    console.log(`\n📊 添加完成統計:`);
    console.log(`   新增案例: ${addedCount}`);
    console.log(`   已存在案例: ${existingCount}`);
    console.log(`   總案例數: ${totalCases}`);
    
    // 詳細統計
    const [sportStats, yearStats] = await Promise.all([
      db.collection('cases').aggregate([
        { $group: { _id: '$sport', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      db.collection('cases').aggregate([
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray()
    ]);
    
    console.log(`\n🏆 更新後運動項目分布:`);
    sportStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
    const yearRange = await db.collection('cases').aggregate([
      { $group: { _id: null, minYear: { $min: '$year' }, maxYear: { $max: '$year' } } }
    ]).toArray();
    
    if (yearRange.length > 0) {
      console.log(`\n⏰ 時間跨度: ${yearRange[0].minYear} - ${yearRange[0].maxYear} (${yearRange[0].maxYear - yearRange[0].minYear + 1}年)`);
    }
    
    console.log('\n🎉 用戶提供的案例檢查與添加完成！');
    
  } catch (error) {
    console.error('❌ 添加案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 執行添加
addMissingVerifiedCases();