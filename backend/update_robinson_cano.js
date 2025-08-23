const { MongoClient } = require('mongodb');

// Robinson Cano 完整的兩次違規記錄
const updatedCanoCase = {
  athleteName: "Robinson Cano",
  nationality: "多明尼加",
  sport: "棒球",
  substance: "Furosemide (2018) + Stanozolol (2020)",
  substanceCategory: "S5: 利尿劑和掩蔽劑 / S1: 合成代謝劑",
  year: 2018, // 第一次違規年份
  eventBackground: "多明尼加籍大聯盟明星二壘手Robinson Cano有兩次MLB禁藥違規記錄：2018年因使用利尿劑furosemide被禁賽80場；2020年因使用合成代謝類固醇stanozolol被禁賽162場（整季），成為MLB重複違規的典型案例。",
  punishment: {
    banDuration: "第一次80場 + 第二次162場",
    resultsCancelled: false,
    medalStripped: false,
    otherPenalties: "兩次違規共損失約3600萬美元薪資，職業生涯受重創"
  },
  sourceLinks: [
    { title: "MLB 2018 Suspension", url: "https://www.mlb.com/", type: "MLB官方" },
    { title: "MLB 2020 Suspension", url: "https://www.mlb.com/", type: "MLB官方" },
    { title: "MLB Drug Policy", url: "https://www.mlb.com/", type: "MLB" }
  ],
  summary: "MLB史上重複違規的重要案例，展示了禁藥處罰的累進性和對職業生涯的毀滅性影響。",
  educationalNotes: "第一次使用furosemide（利尿劑，常作為掩蔽劑），第二次使用stanozolol（合成代謝類固醇）。此案例完美展示了MLB反禁藥政策的嚴格執行和重複違規的嚴厲後果。",
  additionalInfo: {
    firstViolation: {
      year: 2018,
      substance: "Furosemide",
      category: "S5: 利尿劑和掩蔽劑",
      suspension: "80場比賽"
    },
    secondViolation: {
      year: 2020,
      substance: "Stanozolol", 
      category: "S1: 合成代謝劑",
      suspension: "162場比賽（整季）"
    }
  },
  createdAt: new Date()
};

async function updateRobinsonCano() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🔄 更新Robinson Cano案例以包含兩次違規記錄...');
    
    const result = await db.collection('cases').replaceOne(
      { athleteName: "Robinson Cano" },
      updatedCanoCase
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ 已更新Robinson Cano案例，現包含完整的兩次違規記錄');
      console.log('   - 2018年: Furosemide (利尿劑/掩蔽劑)');
      console.log('   - 2020年: Stanozolol (合成代謝類固醇)');
    } else {
      console.log('⚠️  未找到Robinson Cano案例');
    }
    
    const totalCases = await db.collection('cases').countDocuments();
    console.log(`📊 總案例數: ${totalCases}`);
    
  } catch (error) {
    console.error('❌ 更新案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

updateRobinsonCano();