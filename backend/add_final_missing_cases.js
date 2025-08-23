const { MongoClient } = require('mongodb');

// 最終檢查發現的其他重要案例
const finalMissingCases = [
  {
    athleteName: "Erriyon Knighton",
    nationality: "美國",
    sport: "田徑",
    substance: "Trenbolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2024,
    eventBackground: "美國19歲短跑新星Erriyon Knighton在2024年因trenbolone檢測陽性被暫時禁賽，但隨後獲得減免，原因是可能來自污染肉類。",
    punishment: {
      banDuration: "無禁賽（污染裁決）",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "暫時禁賽期間錯過部分比賽"
    },
    sourceLinks: [
      { title: "USADA Decision", url: "https://www.usada.org/", type: "USADA" },
      { title: "World Athletics Statement", url: "https://www.worldathletics.org/", type: "世界田徑" }
    ],
    summary: "年輕運動員面臨食物污染風險的重要案例。",
    educationalNotes: "Trenbolone是獸用類固醇，此案例展示了食物鏈污染對運動員的潛在風險。"
  },
  {
    athleteName: "Christian Coleman",
    nationality: "美國",
    sport: "田徑",
    substance: "Whereabouts failures",
    substanceCategory: "M2: 化學和物理操作",
    year: 2020,
    eventBackground: "美國短跑選手Christian Coleman因三次行蹤申報失誤被禁賽18個月，錯過東京奧運。",
    punishment: {
      banDuration: "18個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過東京奧運"
    },
    sourceLinks: [
      { title: "AIU Decision", url: "https://www.worldathletics.org/", type: "世界田徑誠信組織" },
      { title: "USADA Statement", url: "https://www.usada.org/", type: "USADA" }
    ],
    summary: "行蹤申報失誤導致禁賽的重要案例。",
    educationalNotes: "展示了反禁藥檢測中行蹤申報的重要性，三次失誤等同於陽性結果。"
  },
  {
    athleteName: "Shelby Houlihan",
    nationality: "美國",
    sport: "田徑",
    substance: "Nandrolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2021,
    eventBackground: "美國中長跑選手Shelby Houlihan因nandrolone檢測陽性被禁賽4年，聲稱來自豬肉玉米餅污染。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "職業生涯實質結束"
    },
    sourceLinks: [
      { title: "CAS Arbitration", url: "https://www.tas-cas.org/", type: "CAS" },
      { title: "AIU Decision", url: "https://www.worldathletics.org/", type: "世界田徑誠信組織" }
    ],
    summary: "聲稱食物污染但未被接受的重要案例。",
    educationalNotes: "展示了運動員絕對責任原則，即使聲稱污染也需要充分證據。"
  },
  {
    athleteName: "Ryan Lochte",
    nationality: "美國",
    sport: "游泳",
    substance: "Furosemide (IV)",
    substanceCategory: "S5: 利尿劑和掩蔽劑",
    year: 2018,
    eventBackground: "美國游泳名將Ryan Lochte因靜脈注射利尿劑furosemide被禁賽14個月，聲稱是醫療治療需要。",
    punishment: {
      banDuration: "14個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過2019世界游泳錦標賽"
    },
    sourceLinks: [
      { title: "USADA Decision", url: "https://www.usada.org/", type: "USADA" },
      { title: "World Aquatics Statement", url: "https://www.worldaquatics.com/", type: "World Aquatics" }
    ],
    summary: "靜脈注射利尿劑的醫療使用爭議案例。",
    educationalNotes: "展示了靜脈注射利尿劑在醫療使用中也需要嚴格的TUE程序。"
  },
  {
    athleteName: "CJ Ujah",
    nationality: "英國",
    sport: "田徑",
    substance: "Ostarine and S-23",
    substanceCategory: "S1: 合成代謝劑",
    year: 2021,
    eventBackground: "英國短跑選手CJ Ujah在東京奧運4x100公尺接力奪銀後被檢出SARM類物質，導致英國隊銀牌被收回。",
    punishment: {
      banDuration: "22個月",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "英國接力隊奧運銀牌被收回"
    },
    sourceLinks: [
      { title: "AIU Decision", url: "https://www.worldathletics.org/", type: "世界田徑誠信組織" },
      { title: "IOC Statement", url: "https://www.olympic.org/", type: "IOC" }
    ],
    summary: "SARM類物質使用導致團隊獎牌被收回的案例。",
    educationalNotes: "Ostarine和S-23是選擇性雄激素受體調節劑(SARM)，此案例展示了新型禁藥的檢測。"
  },
  {
    athleteName: "Nijel Amos",
    nationality: "波札那",
    sport: "田徑",
    substance: "Methylhexaneamine",
    substanceCategory: "S6: 興奮劑",
    year: 2022,
    eventBackground: "波札那800公尺選手Nijel Amos因methylhexaneamine檢測陽性被禁賽3年，影響其職業生涯後期。",
    punishment: {
      banDuration: "3年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "無法參加重要國際比賽"
    },
    sourceLinks: [
      { title: "AIU Decision", url: "https://www.worldathletics.org/", type: "世界田徑誠信組織" },
      { title: "Botswana Athletics Statement", url: "https://www.worldathletics.org/", type: "波札那田徑" }
    ],
    summary: "非洲田徑明星的興奮劑使用案例。",
    educationalNotes: "Methylhexaneamine是興奮劑，常存在於某些膳食補充劑中。"
  }
];

async function addFinalMissingCases() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🔍 開始最終遺漏案例檢查與添加...');
    console.log(`📊 準備檢查 ${finalMissingCases.length} 個最終案例`);
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const caseData of finalMissingCases) {
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
    console.log(`\n📊 最終添加統計:`);
    console.log(`   新增案例: ${addedCount}`);
    console.log(`   已存在案例: ${existingCount}`);
    console.log(`   總案例數: ${totalCases}`);
    
    // 運動項目最終分布
    const sportStats = await db.collection('cases').aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log(`\n🏆 最終運動項目分布:`);
    sportStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
    // 年份分布檢查
    const recentCases = await db.collection('cases').aggregate([
      { $match: { year: { $gte: 2020 } } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]).toArray();
    
    console.log(`\n📅 近5年案例分布 (2020-2024):`);
    recentCases.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} 案例`);
    });
    
    // 完整覆蓋檢查
    const coverageAnalysis = {
      totalSports: sportStats.length,
      majorSports: sportStats.filter(s => s.count >= 3).length,
      countriesCount: (await db.collection('cases').distinct('nationality')).length,
      timeSpan: await db.collection('cases').aggregate([
        { $group: { _id: null, minYear: { $min: '$year' }, maxYear: { $max: '$year' } } }
      ]).toArray()
    };
    
    console.log(`\n📈 完整覆蓋分析:`);
    console.log(`   總運動項目: ${coverageAnalysis.totalSports}`);
    console.log(`   主要運動項目 (≥3案例): ${coverageAnalysis.majorSports}`);
    console.log(`   涵蓋國家: ${coverageAnalysis.countriesCount}`);
    if (coverageAnalysis.timeSpan.length > 0) {
      const span = coverageAnalysis.timeSpan[0];
      console.log(`   時間跨度: ${span.minYear} - ${span.maxYear} (${span.maxYear - span.minYear + 1}年)`);
    }
    
    console.log('\n🎉 最終遺漏案例檢查完成！');
    console.log('✨ 資料庫現在擁有極其全面的運動禁藥案例覆蓋！');
    console.log('📚 涵蓋從1960年代到2024年的重要歷史案例！');
    
  } catch (error) {
    console.error('❌ 添加最終案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 執行最終添加
addFinalMissingCases();