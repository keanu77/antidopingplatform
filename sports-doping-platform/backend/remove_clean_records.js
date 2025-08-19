const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

async function removeCleanRecords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    // 首先統計將要刪除的案例
    const cleanCases = await Case.find({
      $or: [
        { substanceCategory: '清白記錄/合法使用' },
        { substanceCategory: '其他/清白記錄' },
        { substance: { $regex: /清白|Clean|clean|無違規|TUE使用|合法/i } },
        { eventBackground: { $regex: /清白|保持清白|Clean|clean/i } }
      ]
    });

    console.log(`\n=== 準備刪除清白記錄案例 ===`);
    console.log(`找到 ${cleanCases.length} 個清白記錄案例`);

    // 顯示將被刪除的案例摘要
    const cleanCategoryStats = {};
    cleanCases.forEach(c => {
      const category = c.substanceCategory || '未分類';
      cleanCategoryStats[category] = (cleanCategoryStats[category] || 0) + 1;
    });

    console.log('\n📊 清白案例分類統計:');
    Object.entries(cleanCategoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 案例`);
    });

    console.log('\n🗑️  部分將被刪除的案例:');
    cleanCases.slice(0, 10).forEach(c => {
      console.log(`  - ${c.athleteName} (${c.nationality}, ${c.sport}): ${c.substance}`);
    });
    if (cleanCases.length > 10) {
      console.log(`  ... 以及其他 ${cleanCases.length - 10} 個案例`);
    }

    // 獲取刪除前的總統計
    const beforeTotal = await Case.countDocuments();
    const beforeStats = await Case.aggregate([
      { $group: { _id: '$substanceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`\n📈 刪除前總案例數: ${beforeTotal}`);

    // 執行刪除操作
    const deleteResult = await Case.deleteMany({
      $or: [
        { substanceCategory: '清白記錄/合法使用' },
        { substanceCategory: '其他/清白記錄' },
        { substance: { $regex: /清白|Clean|clean|無違規|TUE使用|合法/i } },
        { eventBackground: { $regex: /清白|保持清白|Clean|clean/i } }
      ]
    });

    console.log(`\n✅ 成功刪除 ${deleteResult.deletedCount} 個清白記錄案例`);

    // 獲取刪除後的統計
    const afterTotal = await Case.countDocuments();
    const afterStats = await Case.aggregate([
      { $group: { _id: '$substanceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`\n=== 刪除後資料庫狀態 ===`);
    console.log(`📉 剩餘案例總數: ${afterTotal}`);
    console.log(`🗂️  減少案例數: ${beforeTotal - afterTotal}`);

    console.log('\n🎯 更新後WADA分類統計:');
    afterStats.forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat._id}: ${stat.count} 案例`);
    });

    // 重新更新相關案例連結
    console.log('\n🔄 重新計算相關案例連結...');
    const allRemainingCases = await Case.find({});
    
    for (let i = 0; i < allRemainingCases.length; i++) {
      const currentCase = allRemainingCases[i];
      
      const relatedCases = await Case.find({
        _id: { $ne: currentCase._id },
        $or: [
          { sport: currentCase.sport },
          { substanceCategory: currentCase.substanceCategory },
          { nationality: currentCase.nationality }
        ]
      }).limit(3);
      
      if (relatedCases.length > 0) {
        await Case.findByIdAndUpdate(currentCase._id, { 
          relatedCases: relatedCases.map(c => c._id) 
        });
      }
    }

    console.log('✅ 相關案例連結更新完成');

    // 生成最終統計報告
    const sportStats = await Case.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const nationalityStats = await Case.aggregate([
      { $group: { _id: '$nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 最終運動項目統計:');
    sportStats.slice(0, 8).forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat._id}: ${stat.count} 案例`);
    });

    console.log('\n🌍 最終國家統計:');
    nationalityStats.slice(0, 10).forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat._id}: ${stat.count} 案例`);
    });

    console.log('\n🎉 清白記錄刪除完成！');
    console.log('🎯 資料庫現在專注於實際禁藥違規案例，提供更有針對性的教育內容。');
    
    process.exit(0);
  } catch (error) {
    console.error('Error removing clean records:', error);
    process.exit(1);
  }
}

removeCleanRecords();