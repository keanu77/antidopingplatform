const { MongoClient } = require('mongodb');

async function updateCaseYears() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🔄 更新案例年份以符合用戶提供的準確信息...');
    
    // 更新Sun Yang年份從2018到2021 (CAS最終決定年份)
    const sunYangResult = await db.collection('cases').updateOne(
      { athleteName: "Sun Yang" },
      { 
        $set: { 
          year: 2021,
          eventBackground: "中國游泳巨星孫楊因拒絕配合藥檢並破壞血液樣本，2021年被CAS最終判決禁賽4年3個月。"
        }
      }
    );
    
    if (sunYangResult.matchedCount > 0) {
      console.log('✅ 已更新Sun Yang案例年份: 2018 → 2021');
    }
    
    // 更新Paul Pogba年份從2023到2024
    const pogbaResult = await db.collection('cases').updateOne(
      { athleteName: "Paul Pogba" },
      { 
        $set: { 
          year: 2024,
          eventBackground: "法國國家隊和尤文圖斯中場球星Paul Pogba因DHEA/睪固酮檢測呈陽性，2024年初判4年後CAS減為18個月禁賽。",
          punishment: {
            banDuration: "18個月（CAS減刑後）",
            resultsCancelled: false,
            medalStripped: false,
            otherPenalties: "與尤文圖斯的合約終止"
          }
        }
      }
    );
    
    if (pogbaResult.matchedCount > 0) {
      console.log('✅ 已更新Paul Pogba案例年份: 2023 → 2024');
    }
    
    console.log('\n📊 案例年份更新完成！');
    
    const totalCases = await db.collection('cases').countDocuments();
    console.log(`   總案例數: ${totalCases}`);
    
  } catch (error) {
    console.error('❌ 更新年份時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

updateCaseYears();