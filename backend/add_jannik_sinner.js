const { MongoClient } = require('mongodb');

// 2024年重要網球禁藥案例
const tennisCases2024 = [
{
  athleteName: "Jannik Sinner",
  nationality: "義大利",
  sport: "網球",
  substance: "Clostebol (微量)",
  substanceCategory: "S1: 合成代謝劑",
  year: 2024,
  eventBackground: "義大利網球選手、世界排名第一的Jannik Sinner在2024年3月被檢出兩次clostebol微量陽性。他聲稱是因按摩師使用含clostebol的藥膏治療傷口，通過皮膚接觸導致的無意污染。獨立法庭接受了污染解釋，未給予禁賽處罰。",
  punishment: {
    banDuration: "無禁賽",
    resultsCancelled: false,
    medalStripped: false,
    otherPenalties: "排名積分和獎金被扣除"
  },
  sourceLinks: [
    { title: "ITF Independent Tribunal Decision", url: "https://www.itftennis.com/", type: "ITF官方" },
    { title: "ATP Official Statement", url: "https://www.atptour.com/", type: "ATP" },
    { title: "WADA Statement on Sinner Case", url: "https://www.wada-ama.org/", type: "WADA" }
  ],
  summary: "當前世界第一網球選手的污染案例，展示了無意污染的複雜性和法律程序的重要性。",
  educationalNotes: "此案例突顯了運動員對其支援團隊使用的所有物質都負有責任，即使是無意的皮膚接觸也可能導致陽性結果。Clostebol是一種合成代謝類固醇，常存在於某些外用藥品中。",
  additionalInfo: {
    detectionLevel: "微量 (billionth of a gram)",
    contaminationSource: "按摩師使用含clostebol藥膏治療手部傷口",
    legalProcess: "獨立法庭審理，接受污染解釋",
    publicReaction: "引發網球界關於程序公平性的廣泛討論"
  },
  createdAt: new Date()
},
{
  athleteName: "Iga Swiatek",
  nationality: "波蘭",
  sport: "網球",
  substance: "Trimetazidine (微量)",
  substanceCategory: "S4: 激素及代謝調節劑",
  year: 2024,
  eventBackground: "波蘭網球選手、前世界第一Iga Swiatek在2024年8月被檢出微量trimetazidine陽性。她聲稱是因服用污染的褪黑激素補充劑導致。ITF接受了污染解釋，判處1個月禁賽，大部分已通過臨時禁賽抵銷。",
  punishment: {
    banDuration: "1個月",
    resultsCancelled: true,
    medalStripped: false,
    otherPenalties: "辛辛那提公開賽獎金和積分被扣除"
  },
  sourceLinks: [
    { title: "ITF Anti-Doping Decision", url: "https://www.itftennis.com/", type: "ITF官方" },
    { title: "WTA Official Statement", url: "https://www.wtatennis.com/", type: "WTA" },
    { title: "WADA Prohibited List", url: "https://www.wada-ama.org/", type: "WADA" }
  ],
  summary: "前世界第一女網選手的補充劑污染案例，展示了營養補充品的風險。",
  educationalNotes: "Trimetazidine是一種心臟藥物，被列為激素及代謝調節劑。此案例警示運動員使用營養補充品的風險，即使是合法購買的產品也可能含有禁用物質。",
  additionalInfo: {
    detectionLevel: "微量",
    contaminationSource: "污染的褪黑激素補充劑",
    legalProcess: "ITF獨立法庭審理，接受無意使用辯護",
    suspensionPeriod: "大部分禁賽期已通過臨時禁賽抵銷"
  },
  createdAt: new Date()
}
];

async function add2024TennisCases() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🎾 開始添加2024年重要網球禁藥案例...');
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const caseData of tennisCases2024) {
      // 檢查是否已存在
      const existing = await db.collection('cases').findOne({
        athleteName: caseData.athleteName,
        year: caseData.year
      });
      
      if (existing) {
        console.log(`⚠️  ${caseData.athleteName}案例已存在`);
        existingCount++;
        continue;
      }
      
      // 添加案例
      await db.collection('cases').insertOne(caseData);
      console.log(`✅ 已成功添加${caseData.athleteName}案例`);
      addedCount++;
    }
    
    // 統計更新
    const totalCases = await db.collection('cases').countDocuments();
    const tennisCases = await db.collection('cases').countDocuments({ sport: "網球" });
    
    console.log(`\n📊 添加統計:`);
    console.log(`   新增案例: ${addedCount}`);
    console.log(`   已存在案例: ${existingCount}`);
    console.log(`   總案例數: ${totalCases}`);
    console.log(`   網球案例: ${tennisCases}`);
    
    // 顯示2024年案例
    const cases2024 = await db.collection('cases').find({ year: 2024 }).toArray();
    console.log(`\n📅 2024年案例: ${cases2024.length}個`);
    cases2024.forEach(case_ => {
      console.log(`     - ${case_.athleteName} (${case_.sport}) - ${case_.substance}`);
    });
    
    console.log('\n🎉 2024年重要網球案例添加完成！');
    console.log('現在資料庫包含當前和前任世界第一網球選手的重要案例。');
    
  } catch (error) {
    console.error('❌ 添加2024年網球案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 執行添加
add2024TennisCases();