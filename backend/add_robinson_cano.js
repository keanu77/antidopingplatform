const { MongoClient } = require('mongodb');

// Robinson Cano 禁藥案例
const robinsonCanoCase = {
  athleteName: "Robinson Cano",
  nationality: "多明尼加",
  sport: "棒球",
  substance: "Stanozolol",
  substanceCategory: "S1: 合成代謝劑",
  year: 2018,
  eventBackground: "多明尼加籍大聯盟明星二壘手Robinson Cano在西雅圖水手隊效力期間因使用stanozolol被MLB禁賽80場，這是他第二次違反MLB禁藥政策。",
  punishment: {
    banDuration: "80場比賽",
    resultsCancelled: false,
    medalStripped: false,
    otherPenalties: "損失約1200萬美元薪資"
  },
  sourceLinks: [
    { title: "MLB Official Suspension", url: "https://www.mlb.com/", type: "MLB官方" },
    { title: "MLB Drug Policy", url: "https://www.mlb.com/", type: "MLB" }
  ],
  summary: "MLB史上知名的類固醇使用案例，顯示即使是明星球員也難逃禁藥檢測。",
  educationalNotes: "Stanozolol是經典的合成代謝類固醇，常被運動員非法使用來增強肌肉量和力量。此案例展示了MLB反禁藥政策的嚴格執行。",
  createdAt: new Date()
};

async function addRobinsonCano() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🔍 檢查Robinson Cano是否已存在...');
    
    const existing = await db.collection('cases').findOne({
      athleteName: "Robinson Cano"
    });
    
    if (existing) {
      console.log('⚠️  Robinson Cano案例已存在');
      return;
    }
    
    await db.collection('cases').insertOne(robinsonCanoCase);
    console.log('✅ 已添加Robinson Cano案例');
    
    const totalCases = await db.collection('cases').countDocuments();
    console.log(`📊 總案例數: ${totalCases}`);
    
  } catch (error) {
    console.error('❌ 添加案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

addRobinsonCano();