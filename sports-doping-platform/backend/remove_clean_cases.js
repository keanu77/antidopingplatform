const mongoose = require('mongoose');
const Case = require('./models/Case');

async function removeCleanCases() {
  try {
    console.log('開始刪除資料庫中清白記錄的個案...');
    
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('已連接到 MongoDB');

    // 統計刪除前的案例數量
    const totalBefore = await Case.countDocuments();
    console.log(`刪除前總案例數: ${totalBefore}`);

    // 找出清白記錄的案例
    const cleanCases = await Case.find({
      $or: [
        { substanceCategory: '其他/清白記錄' },
        { substanceCategory: '清白記錄/合法使用' },
        { substance: { $regex: /清白|無|自然訓練|清白記錄/ } },
        { 'punishment.banDuration': { $regex: /無.*清白|清白.*記錄|自然訓練/ } }
      ]
    });

    console.log(`\n找到 ${cleanCases.length} 個清白記錄案例：`);
    
    // 顯示將被刪除的案例
    cleanCases.forEach(caseItem => {
      console.log(`- ${caseItem.athleteName} (${caseItem.year}) - ${caseItem.sport} - ${caseItem.substanceCategory}`);
    });

    // 刪除清白記錄案例
    const deleteResult = await Case.deleteMany({
      $or: [
        { substanceCategory: '其他/清白記錄' },
        { substanceCategory: '清白記錄/合法使用' },
        { substance: { $regex: /清白|無|自然訓練|清白記錄/ } },
        { 'punishment.banDuration': { $regex: /無.*清白|清白.*記錄|自然訓練/ } }
      ]
    });

    // 統計刪除後的案例數量
    const totalAfter = await Case.countDocuments();
    
    console.log('\n=== 清理結果 ===');
    console.log(`已刪除清白案例: ${deleteResult.deletedCount} 個`);
    console.log(`刪除前案例數: ${totalBefore}`);
    console.log(`刪除後案例數: ${totalAfter}`);
    console.log(`實際減少: ${totalBefore - totalAfter} 個案例`);

    // 檢查剩餘案例的類型分布
    const remainingCategories = await Case.distinct('substanceCategory');
    console.log('\n剩餘案例類型:');
    for (const category of remainingCategories.sort()) {
      const count = await Case.countDocuments({ substanceCategory: category });
      console.log(`- ${category}: ${count} 個案例`);
    }

    console.log('\n清白記錄案例刪除完成！');
    
  } catch (error) {
    console.error('刪除清白案例時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('已斷開 MongoDB 連接');
  }
}

// 如果直接執行此檔案，則執行刪除
if (require.main === module) {
  removeCleanCases();
}

module.exports = removeCleanCases;