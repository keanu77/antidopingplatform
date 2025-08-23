const mongoose = require('mongoose');
const Case = require('./models/Case');
const fs = require('fs');

// 從git提取的原始案例資料
const originalApiContent = fs.readFileSync('/tmp/original_cases.js', 'utf8');

// 提取案例資料
function extractCasesFromApiFile(content) {
  // 找到 mockData.cases 數組的開始
  const casesStart = content.indexOf('cases: [');
  if (casesStart === -1) {
    throw new Error('找不到 cases 數組');
  }
  
  // 找到對應的結束位置
  let bracketCount = 0;
  let arrayStart = content.indexOf('[', casesStart);
  let i = arrayStart;
  
  while (i < content.length) {
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') bracketCount--;
    if (bracketCount === 0) break;
    i++;
  }
  
  const casesArrayStr = content.slice(arrayStart, i + 1);
  
  try {
    // 將JavaScript物件字面量轉換為JSON
    const cleanedStr = casesArrayStr
      .replace(/(\w+):/g, '"$1":')  // 為屬性名加上引號
      .replace(/'/g, '"')           // 將單引號改為雙引號
      .replace(/,(\s*[}\]])/g, '$1'); // 移除多餘的逗號
    
    return JSON.parse(cleanedStr);
  } catch (error) {
    console.error('JSON解析錯誤:', error);
    // 如果JSON解析失敗，嘗試用eval（較不安全但可能有效）
    try {
      const cases = eval(casesArrayStr);
      return cases;
    } catch (evalError) {
      console.error('eval解析也失敗:', evalError);
      throw error;
    }
  }
}

async function importOriginalCases() {
  try {
    console.log('連接到 MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/antidoping');
    
    console.log('清除現有案例...');
    await Case.deleteMany({});
    
    console.log('解析原始案例資料...');
    const cases = extractCasesFromApiFile(originalApiContent);
    
    console.log(`找到 ${cases.length} 個案例`);
    
    // 處理每個案例，確保符合schema要求
    const processedCases = cases.map(caseData => {
      // 移除 _id 欄位，讓 MongoDB 自動生成
      const { _id, ...caseWithoutId } = caseData;
      
      // 確保必要欄位存在
      if (!caseWithoutId.eventBackground) {
        caseWithoutId.eventBackground = caseData.summary || '詳細案例背景待補充';
      }
      
      if (!caseWithoutId.punishment || !caseWithoutId.punishment.banDuration) {
        caseWithoutId.punishment = {
          banDuration: caseData.punishment?.banDuration || '處罰詳情待補充',
          resultsCancelled: caseData.punishment?.resultsCancelled || false,
          medalStripped: caseData.punishment?.medalStripped || false,
          otherPenalties: caseData.punishment?.otherPenalties || ''
        };
      }
      
      return caseWithoutId;
    });
    
    console.log('導入案例到資料庫...');
    const insertedCases = await Case.insertMany(processedCases);
    
    console.log(`✅ 成功導入 ${insertedCases.length} 個真實案例`);
    
    // 顯示一些統計資訊
    const sportStats = await Case.aggregate([
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('\n🏃 運動項目統計 (前10名):');
    sportStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 案例`);
    });
    
    // 顯示一些知名案例
    const famousCases = await Case.find({
      athleteName: { $in: ['Jannik Sinner', 'Iga Swiatek', 'Erriyon Knighton', 'Paul Pogba', 'Simone Biles'] }
    }, 'athleteName nationality sport year substance').sort({year: -1});
    
    console.log('\n🌟 知名真實案例:');
    famousCases.forEach(c => {
      console.log(`  - ${c.athleteName} (${c.nationality}, ${c.year}) - ${c.sport} - ${c.substance}`);
    });
    
    await mongoose.disconnect();
    console.log('\n🎉 原始真實案例導入完成！');
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

importOriginalCases();