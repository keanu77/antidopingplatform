const { MongoClient } = require('mongodb');

// 用戶提供的經過驗證的真實案例
const comprehensiveVerifiedCases = [
  {
    athleteName: "Kelli White",
    nationality: "美國",
    sport: "田徑",
    substance: "Modafinil",
    substanceCategory: "S6: 興奮劑",
    year: 2003,
    eventBackground: "美國短跑選手Kelli White在2003年巴黎世錦賽奪得100公尺和200公尺雙料冠軍，但隨後被檢出使用Modafinil，這是一種用於治療嗜睡症的興奮劑。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "2003年巴黎世錦賽金牌被剝奪"
    },
    sourceLinks: [
      { title: "SFGATE", url: "https://www.sfgate.com/", type: "媒體報導" },
      { title: "CBS News", url: "https://www.cbsnews.com/", type: "CBS新聞" },
      { title: "Los Angeles Times", url: "https://www.latimes.com/", type: "洛杉磯時報" }
    ],
    summary: "Modafinil使用的重要案例。",
    educationalNotes: "Modafinil是一種處方藥，常用於治療嗜睡症，但在運動中被列為興奮劑。"
  },
  {
    athleteName: "C.J. Hunter",
    nationality: "美國",
    sport: "田徑",
    substance: "Nandrolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2000,
    eventBackground: "美國鉛球選手C.J. Hunter（Marion Jones的丈夫）在2000年雪梨奧運前被檢出諾龍酮陽性，被迫退出奧運比賽。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "退出雪梨奧運"
    },
    sourceLinks: [
      { title: "ABC News", url: "https://abcnews.go.com/", type: "ABC新聞" },
      { title: "Los Angeles Times", url: "https://www.latimes.com/", type: "洛杉磯時報" },
      { title: "Washington Post", url: "https://www.washingtonpost.com/", type: "華盛頓郵報" }
    ],
    summary: "高調運動員家庭的禁藥案例。",
    educationalNotes: "此案例與Marion Jones案件相關，展示了禁藥問題對運動員家庭的影響。"
  },
  {
    athleteName: "Jessica Hardy",
    nationality: "美國",
    sport: "游泳",
    substance: "Clenbuterol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2008,
    eventBackground: "美國游泳選手Jessica Hardy在2008年北京奧運前夕被檢出克倫特羅陽性，聲稱來自污染的營養補充劑。",
    punishment: {
      banDuration: "1年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過2008年北京奧運"
    },
    sourceLinks: [
      { title: "WADA", url: "https://www.wada-ama.org/", type: "WADA官方" },
      { title: "USADA", url: "https://www.usada.org/", type: "USADA" },
      { title: "Los Angeles Times", url: "https://www.latimes.com/", type: "洛杉磯時報" }
    ],
    summary: "補充劑污染的游泳案例。",
    educationalNotes: "Hardy的案例展示了補充劑污染風險，她後來成功復出並贏得奧運獎牌。"
  },
  {
    athleteName: "LaShawn Merritt",
    nationality: "美國",
    sport: "田徑",
    substance: "DHEA/Pregnenolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2010,
    eventBackground: "2008年北京奧運400公尺金牌得主LaShawn Merritt因服用含有DHEA的非處方藥物被禁賽21個月。",
    punishment: {
      banDuration: "21個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過重要比賽期間"
    },
    sourceLinks: [
      { title: "USADA", url: "https://www.usada.org/", type: "USADA" },
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" },
      { title: "ESPN", url: "https://www.espn.com/", type: "ESPN" }
    ],
    summary: "非處方藥含禁藥成分的案例。",
    educationalNotes: "奧運冠軍因不知情使用含禁藥成分的非處方藥而被禁賽。"
  },
  {
    athleteName: "Rita Jeptoo",
    nationality: "肯亞",
    sport: "田徑",
    substance: "EPO",
    substanceCategory: "S2: 胜肽激素、生長因子、相關物質及擬劑",
    year: 2014,
    eventBackground: "肯亞馬拉松名將Rita Jeptoo在2014年贏得波士頓馬拉松和芝加哥馬拉松後被檢出EPO陽性，CAS將原本2年禁賽加重至4年。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "2014年波馬、芝馬成績取消"
    },
    sourceLinks: [
      { title: "CAS", url: "https://www.tas-cas.org/", type: "CAS" },
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" },
      { title: "WBUR", url: "https://www.wbur.org/", type: "WBUR" }
    ],
    summary: "肯亞長跑選手EPO使用案例。",
    educationalNotes: "展示了東非長跑選手中EPO使用的問題，對肯亞田徑聲譽造成重大影響。"
  },
  {
    athleteName: "Asbel Kiprop",
    nationality: "肯亞",
    sport: "田徑",
    substance: "EPO",
    substanceCategory: "S2: 胜肽激素、生長因子、相關物質及擬劑",
    year: 2019,
    eventBackground: "三屆世錦賽1500公尺冠軍Asbel Kiprop被檢出EPO陽性，被禁賽4年，職業生涯實質結束。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "職業生涯結束"
    },
    sourceLinks: [
      { title: "AIU", url: "https://www.worldathletics.org/", type: "田徑誠信單位" },
      { title: "AP News", url: "https://apnews.com/", type: "美聯社" },
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" }
    ],
    summary: "世界冠軍級中距離跑者的EPO案例。",
    educationalNotes: "又一位肯亞頂級中距離跑者因EPO被禁賽，進一步損害肯亞田徑聲譽。"
  },
  {
    athleteName: "Wilson Kipsang",
    nationality: "肯亞",
    sport: "田徑",
    substance: "行蹤申報失誤",
    substanceCategory: "M2: 化學和物理操作",
    year: 2020,
    eventBackground: "前世界紀錄保持者Wilson Kipsang因行蹤申報失誤和妨礙調查被AIU禁賽4年。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "職業生涯實質結束"
    },
    sourceLinks: [
      { title: "AIU", url: "https://www.worldathletics.org/", type: "田徑誠信單位" },
      { title: "Reuters", url: "https://www.reuters.com/", type: "路透社" }
    ],
    summary: "行蹤申報違規的馬拉松案例。",
    educationalNotes: "展示了行蹤申報系統的重要性，違規會導致嚴重後果。"
  },
  {
    athleteName: "Alejandro Valverde",
    nationality: "西班牙",
    sport: "自行車",
    substance: "血液操作",
    substanceCategory: "M1: 血液和血液成分操作",
    year: 2010,
    eventBackground: "西班牙自行車手Alejandro Valverde因與普埃爾托行動（Operación Puerto）相關被CONI禁賽2年。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "禁止在義大利比賽"
    },
    sourceLinks: [
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" },
      { title: "WADA", url: "https://www.wada-ama.org/", type: "WADA" }
    ],
    summary: "普埃爾托行動涉案的重要人物。",
    educationalNotes: "Valverde雖被禁賽但後來復出並贏得世錦賽和環義冠軍。"
  },
  {
    athleteName: "Riccardo Riccò",
    nationality: "義大利",
    sport: "自行車",
    substance: "CERA/自體輸血",
    substanceCategory: "S2/M1: EPO類似物和血液操作",
    year: 2011,
    eventBackground: "義大利自行車手Riccardo Riccò先因CERA被禁賽2年，後因自體輸血被終身禁賽。",
    punishment: {
      banDuration: "終身禁賽",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "職業生涯終結"
    },
    sourceLinks: [
      { title: "Velo", url: "https://velo.outsideonline.com/", type: "Velo雜誌" }
    ],
    summary: "重複違規導致終身禁賽的案例。",
    educationalNotes: "展示了重複違規的嚴重後果，Riccò的自體輸血甚至危及生命。"
  },
  {
    athleteName: "Danilo Di Luca",
    nationality: "義大利",
    sport: "自行車",
    substance: "EPO",
    substanceCategory: "S2: 胜肽激素、生長因子、相關物質及擬劑",
    year: 2013,
    eventBackground: "2007年環義冠軍Danilo Di Luca因第二次EPO違規被終身禁賽。",
    punishment: {
      banDuration: "終身禁賽",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "職業生涯終結"
    },
    sourceLinks: [
      { title: "ESPN", url: "https://www.espn.com/", type: "ESPN" },
      { title: "Velo", url: "https://velo.outsideonline.com/", type: "Velo雜誌" },
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" }
    ],
    summary: "環義冠軍重複違規終身禁賽。",
    educationalNotes: "重複違規者面臨終身禁賽，Di Luca成為義大利自行車黑暗時期的象徵。"
  },
  {
    athleteName: "Alexander Vinokourov",
    nationality: "哈薩克",
    sport: "自行車",
    substance: "同種異體輸血",
    substanceCategory: "M1: 血液和血液成分操作",
    year: 2007,
    eventBackground: "哈薩克自行車手Alexander Vinokourov在2007年環法賽被檢出同種異體輸血，震驚自行車界。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "Astana車隊被禁止參加2008年環法"
    },
    sourceLinks: [
      { title: "Times of Malta", url: "https://timesofmalta.com/", type: "馬爾他時報" },
      { title: "Cycling Weekly", url: "https://www.cyclingweekly.com/", type: "自行車週刊" }
    ],
    summary: "同種異體輸血檢測的重要案例。",
    educationalNotes: "Vinokourov的案例展示了血液興奮劑檢測技術的進步。"
  },
  {
    athleteName: "Samir Nasri",
    nationality: "法國",
    sport: "足球",
    substance: "超量靜脈輸注",
    substanceCategory: "M2: 化學和物理操作",
    year: 2018,
    eventBackground: "前法國國家隊中場Samir Nasri因在西班牙診所接受超過100ml的靜脈輸注被禁賽18個月。",
    punishment: {
      banDuration: "18個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "職業生涯中斷"
    },
    sourceLinks: [
      { title: "ESPN", url: "https://www.espn.com/", type: "ESPN" },
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" },
      { title: "Euronews", url: "https://www.euronews.com/", type: "歐洲新聞台" }
    ],
    summary: "足球界靜脈輸注違規案例。",
    educationalNotes: "超過100ml的靜脈輸注被視為違規方法，因為可能用來稀釋禁藥或快速恢復。"
  },
  {
    athleteName: "Shane Warne",
    nationality: "澳洲",
    sport: "板球",
    substance: "利尿劑",
    substanceCategory: "S5: 利尿劑和掩蔽劑",
    year: 2003,
    eventBackground: "澳洲板球傳奇Shane Warne因使用利尿劑被禁賽12個月，聲稱是為了改善外觀而服用母親的減肥藥。",
    punishment: {
      banDuration: "12個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過2003年世界盃"
    },
    sourceLinks: [
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" },
      { title: "ESPNCricinfo", url: "https://www.espncricinfo.com/", type: "ESPN板球" }
    ],
    summary: "板球界利尿劑使用案例。",
    educationalNotes: "即使是為了美容目的使用利尿劑也會導致禁賽，提醒運動員要謹慎用藥。"
  },
  {
    athleteName: "Yohan Blake",
    nationality: "牙買加",
    sport: "田徑",
    substance: "Methylhexanamine",
    substanceCategory: "S6: 興奮劑",
    year: 2009,
    eventBackground: "牙買加短跑選手Yohan Blake在2009年因使用含有興奮劑的營養補充劑被禁賽3個月。",
    punishment: {
      banDuration: "3個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "短期職業中斷"
    },
    sourceLinks: [
      { title: "ESPN", url: "https://www.espn.com/", type: "ESPN" },
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" },
      { title: "JADCO", url: "https://jadcoja.org/", type: "牙買加反禁藥委員會" }
    ],
    summary: "營養補充劑興奮劑污染案例。",
    educationalNotes: "Blake後來成為世界冠軍，此案例展示了年輕運動員的學習經驗。"
  },
  {
    athleteName: "Alex Rodriguez",
    nationality: "美國",
    sport: "棒球",
    substance: "PED違規",
    substanceCategory: "S1: 合成代謝劑",
    year: 2014,
    eventBackground: "MLB巨星Alex Rodriguez因Biogenesis醜聞被仲裁裁決停賽整個2014賽季（162場）。",
    punishment: {
      banDuration: "162場（整季）",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "損失巨額薪水和聲譽"
    },
    sourceLinks: [
      { title: "ESPN", url: "https://www.espn.com/", type: "ESPN" },
      { title: "MLB.com", url: "https://www.mlb.com/", type: "MLB官方" }
    ],
    summary: "MLB Biogenesis醜聞的核心人物。",
    educationalNotes: "A-Rod案例是MLB現代禁藥政策嚴格執行的標誌性案例。"
  },
  {
    athleteName: "寧澤濤",
    nationality: "中國",
    sport: "游泳",
    substance: "Clenbuterol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2011,
    eventBackground: "中國游泳選手寧澤濤因克倫特羅檢測陽性被中國游泳協會禁賽1年。",
    punishment: {
      banDuration: "1年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "職業生涯早期挫折"
    },
    sourceLinks: [
      { title: "Reuters", url: "https://www.reuters.com/", type: "路透社" },
      { title: "South China Morning Post", url: "https://www.scmp.com/", type: "南華早報" }
    ],
    summary: "中國游泳選手克倫特羅案例。",
    educationalNotes: "寧澤濤後來復出並在2014年亞運會大放異彩，展示了從錯誤中學習的重要性。"
  },
  {
    athleteName: "Pavel Kulizhnikov",
    nationality: "俄羅斯",
    sport: "速度滑冰",
    substance: "Methylhexanamine",
    substanceCategory: "S6: 興奮劑",
    year: 2012,
    eventBackground: "俄羅斯速度滑冰選手Pavel Kulizhnikov因使用興奮劑被禁賽2年（另有2016年美屈肼案件）。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過重要比賽"
    },
    sourceLinks: [
      { title: "Inside the Games", url: "https://www.insidethegames.biz/", type: "Inside the Games" },
      { title: "ESPN", url: "https://www.espn.com/", type: "ESPN" }
    ],
    summary: "俄羅斯速滑選手重複違規案例。",
    educationalNotes: "Kulizhnikov多次違規展示了俄羅斯系統性禁藥問題的嚴重性。"
  },
  {
    athleteName: "Martin Johnsrud Sundby",
    nationality: "挪威",
    sport: "越野滑雪",
    substance: "Salbutamol超閾",
    substanceCategory: "S3: β2刺激劑",
    year: 2016,
    eventBackground: "挪威越野滑雪選手Martin Johnsrud Sundby因Salbutamol超出閾值被CAS禁賽2個月並褫奪2014/15賽季總冠軍。",
    punishment: {
      banDuration: "2個月",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "2014/15總冠軍與巡迴賽冠軍被褫奪"
    },
    sourceLinks: [
      { title: "CAS", url: "https://www.tas-cas.org/", type: "CAS" },
      { title: "FasterSkier", url: "https://fasterskier.com/", type: "FasterSkier" }
    ],
    summary: "氣喘藥物超閾值的案例。",
    educationalNotes: "即使是合法的氣喘藥物，超過閾值也會被視為違規。"
  },
  {
    athleteName: "Tyson Fury",
    nationality: "英國",
    sport: "拳擊",
    substance: "Nandrolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2017,
    eventBackground: "英國重量級拳王Tyson Fury因2015年諾龍酮檢測陽性被UKAD溯及既往禁賽2年。",
    punishment: {
      banDuration: "2年（溯及既往）",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "拳王頭銜被剝奪"
    },
    sourceLinks: [
      { title: "AP News", url: "https://apnews.com/", type: "美聯社" },
      { title: "The Guardian", url: "https://www.theguardian.com/", type: "衛報" },
      { title: "UK Anti-Doping", url: "https://www.ukad.org.uk/", type: "英國反禁藥機構" }
    ],
    summary: "拳擊界諾龍酮使用案例。",
    educationalNotes: "Fury聲稱污染來自未閹割的野豬肉，展示了食物污染辯護的複雜性。"
  }
];

async function addComprehensiveVerifiedCases() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🚀 開始添加用戶提供的經過驗證案例...');
    console.log(`📊 準備添加 ${comprehensiveVerifiedCases.length} 個經過驗證的案例`);
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const caseData of comprehensiveVerifiedCases) {
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
    console.log(`\n📊 添加統計:`);
    console.log(`   新增案例: ${addedCount}`);
    console.log(`   已存在案例: ${existingCount}`);
    console.log(`   總案例數: ${totalCases}`);
    
    // 運動項目分布
    const sportStats = await db.collection('cases').aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    console.log(`\n🏆 前10大運動項目:`);
    sportStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} 案例`);
    });
    
    // 年代分布
    const decadeStats = await db.collection('cases').aggregate([
      { 
        $addFields: {
          decade: { 
            $concat: [
              { $toString: { $multiply: [{ $floor: { $divide: ['$year', 10] } }, 10] } },
              "s"
            ]
          }
        }
      },
      { $group: { _id: '$decade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log(`\n📅 年代分布:`);
    decadeStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} 案例`);
    });
    
    console.log(`\n🎯 資料庫擴展完成！`);
    console.log(`✨ 現在擁有 ${totalCases} 個經過嚴格驗證的真實運動禁藥案例`);
    
  } catch (error) {
    console.error('❌ 添加案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 執行添加
addComprehensiveVerifiedCases();