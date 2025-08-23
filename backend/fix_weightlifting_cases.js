const mongoose = require('mongoose');
const Case = require('./models/Case');

// 連接資料庫
mongoose.connect('mongodb://localhost:27017/antidoping')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function fixWeightliftingCases() {
  try {
    console.log('🏋️‍♀️ 開始修正舉重案例的年份和資訊問題...\n');
    
    let removedCount = 0;
    let updatedCount = 0;
    
    // Oxana Slivenko 案例修正
    let oxanaCase = await Case.findOne({ athleteName: "Oxana Slivenko", year: 2008 });
    if (oxanaCase) {
      console.log('❌ 移除 Oxana Slivenko (2008) - 年份和物質錯誤，實際為2018-2020期間LIMS違規');
      await Case.deleteOne({ athleteName: "Oxana Slivenko", year: 2008 });
      removedCount++;
    }
    
    // Apti Aukhadov 案例修正 - 更新為正確的年份和信息
    let aptiCase = await Case.findOne({ athleteName: "Apti Aukhadov", year: 2008 });
    if (aptiCase) {
      console.log('🔧 修正 Apti Aukhadov 案例 - 從2008更正為2012倫敦奧運樣本重檢');
      await Case.updateOne(
        { _id: aptiCase._id },
        {
          $set: {
            year: 2012,
            substance: "DHCMT (Turinabol), Drostanolone",
            substanceCategory: "S1: 合成代謝劑",
            eventBackground: "2012年倫敦奧運銀牌得主Apti Aukhadov在2016年公布的IOC樣本重檢中被發現使用DHCMT (Turinabol)和Drostanolone。",
            punishment: {
              banDuration: "終身禁賽",
              resultsCancelled: true,
              medalStripped: true,
              otherPenalties: "倫敦奧運銀牌被取消（2016年公布）"
            },
            summary: "倫敦奧運舉重銀牌得主通過IOC樣本重檢被發現使用多種合成代謝類固醇的案例。",
            educationalNotes: "此案展現了奧運樣本重檢的重要性，即使多年後仍能發現當時的違規行為。"
          }
        }
      );
      updatedCount++;
    }
    
    console.log(`✅ 舉重案例修正完成\\n`);
    
    // 統計結果
    const totalCases = await Case.countDocuments();
    const weightliftingCases = await Case.countDocuments({ sport: '舉重' });
    
    console.log('📊 舉重案例修正結果統計:');
    console.log(`   移除案例: ${removedCount}`);
    console.log(`   修正案例: ${updatedCount}`);
    console.log(`   總案例數: ${totalCases}`);
    console.log(`   舉重案例數: ${weightliftingCases}`);
    
    console.log('\\n✅ 舉重案例品質改善完成！');
    
  } catch (error) {
    console.error('修正舉重案例時發生錯誤:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixWeightliftingCases();