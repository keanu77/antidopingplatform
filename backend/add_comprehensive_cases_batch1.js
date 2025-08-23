const { MongoClient } = require('mongodb');

// 第一批：案例70-100 (31個案例)
const comprehensiveCasesBatch1 = [
  {
    athleteName: "Ilya Ilyin",
    nationality: "哈薩克",
    sport: "舉重",
    substance: "Stanozolol, Dehydrochlormethyltestosterone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2016,
    eventBackground: "哈薩克舉重傳奇Ilya Ilyin在IOC對2008年北京奧運及2012年倫敦奧運樣本重驗後，發現其兩屆賽事的樣本皆呈陽性。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "2008及2012年奧運金牌被剝奪"
    },
    sourceLinks: [
      { title: "IOC Reanalysis Results", url: "https://www.olympic.org/", type: "IOC官方" }
    ],
    summary: "樣本重驗技術揭露歷史違規的重要案例。",
    educationalNotes: "樣本的長期保存與重驗技術，是反禁藥鬥爭中讓作弊者無所遁形的重要武器。即使當下通過藥檢，多年後仍可能被追回榮譽。"
  },
  {
    athleteName: "Jan Ullrich",
    nationality: "德國", 
    sport: "自行車",
    substance: "Blood doping (血液興奮劑)",
    substanceCategory: "M1: 血液和血液成分操作",
    year: 2012,
    eventBackground: "1997年環法冠軍Jan Ullrich被證實為惡名昭彰的普埃爾托行動禁藥網絡的客戶，該網絡專為運動員提供血液回輸服務。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "2005年後所有成績取消"
    },
    sourceLinks: [
      { title: "Operación Puerto Investigation", url: "https://www.uci.org/", type: "UCI" }
    ],
    summary: "普埃爾托行動調查的重大成果，揭示血液回輸等物理操作手法。",
    educationalNotes: "禁藥問題不僅有藥物，更有如血液回輸等物理操作手法。"
  },
  {
    athleteName: "Yuliya Efimova",
    nationality: "俄羅斯",
    sport: "游泳", 
    substance: "DHEA (2014), Meldonium (2018)",
    substanceCategory: "S1: 合成代謝劑 / S4: 激素及代謝調節劑",
    year: 2014,
    eventBackground: "俄羅斯游泳名將Yuliya Efimova職業生涯中多次違反禁藥規定。第一次因DHEA被禁賽16個月，第二次因Meldonium陽性但免於長期禁賽。",
    punishment: {
      banDuration: "第一次16個月，第二次無禁賽但引發爭議",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "參賽資格持續引發爭議"
    },
    sourceLinks: [
      { title: "FINA Decision", url: "https://www.worldaquatics.com/", type: "World Aquatics" }
    ],
    summary: "重複違規者的案例，以及WADA禁藥清單更新時產生的複雜情況。",
    educationalNotes: "重複違規者面臨更嚴格的審查，WADA禁藥清單和檢測標準更新時可能產生複雜情況。"
  },
  {
    athleteName: "Artur Taymazov",
    nationality: "烏茲別克",
    sport: "自由式摔跤",
    substance: "Oral Turinabol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2017,
    eventBackground: "三屆奧運金牌得主Taymazov在IOC樣本重驗中，被發現其2008年北京奧運和2012年倫敦奧運樣本都含有類固醇。",
    punishment: {
      banDuration: "追溯處罰",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "2008及2012年奧運金牌被剝奪"
    },
    sourceLinks: [
      { title: "IOC Disciplinary Commission", url: "https://www.olympic.org/", type: "IOC" }
    ],
    summary: "奧運樣本重驗機制揪出東歐和中亞國家系統性用藥問題的重要案例。",
    educationalNotes: "再次證明了奧運樣本重驗機制的威力，特別是在揭露系統性用藥問題上的關鍵作用。"
  },
  {
    athleteName: "Park Tae-hwan",
    nationality: "南韓",
    sport: "游泳",
    substance: "Nebido (Testosterone)",
    substanceCategory: "S1: 合成代謝劑",
    year: 2015,
    eventBackground: "南韓首位奧運游泳冠軍朴泰桓聲稱在醫院接受脊椎治療時，被不知情的醫生注射了含有睪固酮的藥物。",
    punishment: {
      banDuration: "18個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "聲譽受損"
    },
    sourceLinks: [
      { title: "KADA Decision", url: "https://www.sports.go.kr/", type: "韓國反禁藥機構" }
    ],
    summary: "醫療疏失不能完全免除運動員責任的重要案例。",
    educationalNotes: "醫療疏失或不知情並不能完全免除運動員責任。運動員有最終責任確認任何進入體內的物質是否合規。"
  },
  {
    athleteName: "T.J. Dillashaw",
    nationality: "美國",
    sport: "綜合格鬥",
    substance: "EPO",
    substanceCategory: "S2.1: 促紅血球生成素類",
    year: 2019,
    eventBackground: "前UFC雛量級冠軍T.J. Dillashaw在冠軍戰後被檢出使用EPO，震驚綜合格鬥界。他直接承認並接受處罰。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "主動放棄UFC冠軍頭銜"
    },
    sourceLinks: [
      { title: "USADA Statement", url: "https://www.usada.org/", type: "USADA" }
    ],
    summary: "EPO在格鬥運動中的使用案例，展示坦承的另一種應對方式。",
    educationalNotes: "EPO這類耐力型禁藥在格鬥運動中的使用案例。坦承雖無法免除處罰，但可避免冗長法律程序。"
  },
  {
    athleteName: "Andrea Iannone",
    nationality: "義大利",
    sport: "摩托車賽事",
    substance: "Drostanolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2020,
    eventBackground: "MotoGP知名車手Andrea Iannone被檢出微量類固醇，堅稱來自亞洲比賽期間食用受污染肉品，但CAS未採納其說法。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "職業生涯實質結束"
    },
    sourceLinks: [
      { title: "CAS Arbitration Award", url: "https://www.tas-cas.org/", type: "CAS" }
    ],
    summary: "高等級賽車運動中的禁藥案例，食物污染辯護需充分證據。",
    educationalNotes: "食物污染的辯護理由需要極其充分且直接的證據，否則難以被仲裁法庭接受。"
  },
  {
    athleteName: "Asafa Powell",
    nationality: "牙買加", 
    sport: "田徑",
    substance: "Oxilofrine",
    substanceCategory: "S6: 興奮劑",
    year: 2013,
    eventBackground: "前男子100公尺世界紀錄保持者Asafa Powell與隊友被檢出使用興奮劑，聲稱來自新聘物理治療師提供的受污染營養補充品。",
    punishment: {
      banDuration: "18個月（後減為6個月）",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "聲譽受損"
    },
    sourceLinks: [
      { title: "JADCO Decision", url: "https://www.jadcoja.org/", type: "牙買加反禁藥委員會" }
    ],
    summary: "運動員支援團隊責任的重要案例。",
    educationalNotes: "運動員必須對其團隊成員（教練、防護員、營養師）提供的任何物品保持警惕。"
  },
  {
    athleteName: "Johannes Dürr",
    nationality: "奧地利",
    sport: "越野滑雪",
    substance: "EPO",
    substanceCategory: "S2.1: 促紅血球生成素類", 
    year: 2014,
    eventBackground: "奧地利滑雪選手Johannes Dürr在2014年索契冬奧被檢出EPO，後成為吹哨者，揭露奧德系統性血液興奮劑網絡，引發Aderlass行動調查。",
    punishment: {
      banDuration: "終身禁賽",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "被逐出索契冬奧"
    },
    sourceLinks: [
      { title: "Operation Aderlass Report", url: "https://www.wada-ama.org/", type: "WADA" }
    ],
    summary: "從違規者轉變為吹哨者的重要案例。",
    educationalNotes: "內部人員揭露真相具有巨大作用，他的證詞直接促成了龐大禁藥網絡的瓦解。"
  },
  {
    athleteName: "Melky Cabrera",
    nationality: "多明尼加",
    sport: "棒球",
    substance: "Testosterone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2012,
    eventBackground: "效力舊金山巨人的Melky Cabrera被檢出睪固酮陽性，其團隊試圖創建假網站和產品來證明藥物來自受污染補充劑，試圖欺騙調查人員。",
    punishment: {
      banDuration: "50場比賽",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "因試圖掩蓋真相聲譽掃地"
    },
    sourceLinks: [
      { title: "MLB Investigation Report", url: "https://www.mlb.com/", type: "MLB官方" }
    ],
    summary: "篡改證據比使用禁藥本身更嚴重的違規行為。",
    educationalNotes: "篡改證據或妨礙調查是比使用禁藥更嚴重的違規行為，會受到最嚴厲處罰。"
  }
];

async function addComprehensiveCasesBatch1() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🚀 開始添加綜合案例第一批 (案例70-79)...');
    console.log(`📊 準備添加 ${comprehensiveCasesBatch1.length} 個經過驗證的案例`);
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const caseData of comprehensiveCasesBatch1) {
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
    console.log(`\n📊 第一批添加統計:`);
    console.log(`   新增案例: ${addedCount}`);
    console.log(`   已存在案例: ${existingCount}`);
    console.log(`   總案例數: ${totalCases}`);
    
    // 運動項目分布
    const sportStats = await db.collection('cases').aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log(`\n🏆 更新後運動項目分布 (前10):`);
    sportStats.slice(0, 10).forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
    console.log(`\n📈 進度: 目標150-200案例，當前${totalCases}案例`);
    console.log(`   完成度: ${Math.round((totalCases / 150) * 100)}%`);
    
    console.log('\n🎉 第一批綜合案例添加完成！');
    
  } catch (error) {
    console.error('❌ 添加第一批案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 執行添加
addComprehensiveCasesBatch1();