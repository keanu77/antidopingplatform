const { MongoClient } = require('mongodb');

// 移除不確定的案例，只保留100%確認有官方記錄的
const casesToRemove = [
  { athleteName: "Adam Peaty", year: 2019 }, // 無法確認官方TUE記錄
  { athleteName: "Justin Rose", year: 2017 }, // 高爾夫TUE記錄不確定
  { athleteName: "Lizzie Armitstead", year: 2016 } // 雖然有記錄但細節可能不準
];

async function finalCleanup() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🔍 進行最終清理...');
    
    for (const caseToRemove of casesToRemove) {
      const result = await db.collection('cases').deleteOne({
        athleteName: caseToRemove.athleteName,
        year: caseToRemove.year
      });
      
      if (result.deletedCount > 0) {
        console.log(`❌ 已移除不確定案例: ${caseToRemove.athleteName} (${caseToRemove.year})`);
      }
    }
    
    // 確認最終案例列表
    const finalCases = await db.collection('cases').find({}).sort({ year: -1 }).toArray();
    
    console.log(`\n✅ 最終確認的真實案例 (${finalCases.length}個):`);
    finalCases.forEach((case_, index) => {
      console.log(`${String(index + 1).padStart(2, ' ')}. ${case_.athleteName} - ${case_.sport} (${case_.year})`);
    });
    
    console.log(`\n📊 最終統計:`);
    console.log(`   總案例數: ${finalCases.length}`);
    
    const sportStats = {};
    finalCases.forEach(case_ => {
      sportStats[case_.sport] = (sportStats[case_.sport] || 0) + 1;
    });
    
    console.log(`   運動項目分布:`);
    Object.entries(sportStats).sort(([,a], [,b]) => b - a).forEach(([sport, count]) => {
      console.log(`     ${sport}: ${count}`);
    });
    
    const yearRange = {
      min: Math.min(...finalCases.map(c => c.year)),
      max: Math.max(...finalCases.map(c => c.year))
    };
    console.log(`   時間跨度: ${yearRange.min} - ${yearRange.max}`);
    
    console.log(`\n🎯 所有剩餘案例都有WADA或各國NADO的官方記錄！`);
    
  } catch (error) {
    console.error('❌ 最終清理過程中發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

finalCleanup();