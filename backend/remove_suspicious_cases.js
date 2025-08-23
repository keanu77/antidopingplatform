const mongoose = require('mongoose');
const Case = require('./models/Case');

// 連接資料庫
mongoose.connect('mongodb://localhost:27017/antidoping')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 需要移除的可疑案例
const suspiciousCases = [
  {
    athleteName: "Evgenia Medvedeva",
    year: 2018,
    reason: "無任何官方違規裁決紀錄，2018平昌的俄羅斯禁藥案件與她無關"
  },
  {
    athleteName: "Darya Klishina", 
    year: 2016,
    reason: "她是被允許以中立身份參賽的選手，並非陽性，後續無meldonium裁決紀錄"
  },
  {
    athleteName: "Hossein Rezazadeh",
    year: 2006,
    reason: "2006年伊朗舉重隊多人違規，但Rezazadeh不在其中"
  },
  {
    athleteName: "Pyrros Dimas",
    year: 2008, 
    reason: "無可信來源顯示其有違規裁決"
  }
];

async function removeSuspiciousCases() {
  try {
    console.log('🔍 開始檢查並移除可疑案例...\n');
    
    let removedCount = 0;
    let notFoundCount = 0;
    
    for (let i = 0; i < suspiciousCases.length; i++) {
      const suspiciousCase = suspiciousCases[i];
      
      // 查找案例
      const existingCase = await Case.findOne({
        athleteName: suspiciousCase.athleteName,
        year: suspiciousCase.year
      });
      
      if (existingCase) {
        // 顯示即將移除的案例資訊
        console.log(`❌ 移除案例: ${suspiciousCase.athleteName} (${suspiciousCase.year})`);
        console.log(`   運動項目: ${existingCase.sport}`);
        console.log(`   物質: ${existingCase.substance}`);
        console.log(`   移除原因: ${suspiciousCase.reason}`);
        
        // 移除案例
        await Case.deleteOne({
          athleteName: suspiciousCase.athleteName,
          year: suspiciousCase.year
        });
        
        removedCount++;
        console.log(`   ✅ 已移除\n`);
      } else {
        console.log(`⚠️  案例不存在: ${suspiciousCase.athleteName} (${suspiciousCase.year})\n`);
        notFoundCount++;
      }
    }
    
    // 統計移除後的資料庫狀況
    const totalCases = await Case.countDocuments();
    const totalSports = await Case.distinct('sport');
    const totalCountries = await Case.distinct('nationality');
    
    console.log('📊 清理結果統計:');
    console.log(`   已移除案例: ${removedCount}`);
    console.log(`   未找到案例: ${notFoundCount}`);
    console.log(`   總處理案例: ${suspiciousCases.length}`);
    console.log('');
    console.log('📊 清理後資料庫統計:');
    console.log(`   總案例數: ${totalCases}`);
    console.log(`   運動項目: ${totalSports.length}`);
    console.log(`   涵蓋國家: ${totalCountries.length}`);
    
    if (removedCount > 0) {
      console.log('\n✅ 資料庫清理完成！已移除不可靠的案例，提升資料品質。');
    }
    
  } catch (error) {
    console.error('移除可疑案例時發生錯誤:', error);
  } finally {
    mongoose.disconnect();
  }
}

removeSuspiciousCases();