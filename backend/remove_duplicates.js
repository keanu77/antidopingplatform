const mongoose = require('mongoose');
const Case = require('./models/Case');

async function removeDuplicates() {
  try {
    console.log('開始檢查和刪除重複案例...');
    
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('已連接到 MongoDB');

    // 找出重複案例 (基於 athleteName + year)
    const duplicates = await Case.aggregate([
      {
        $group: {
          _id: {
            athleteName: '$athleteName',
            year: '$year'
          },
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`\n找到 ${duplicates.length} 組重複案例：`);
    
    let totalRemoved = 0;
    
    for (const duplicate of duplicates) {
      const { athleteName, year } = duplicate._id;
      const ids = duplicate.ids;
      
      console.log(`\n重複案例: ${athleteName} (${year}) - ${duplicate.count} 個重複`);
      
      // 保留第一個，刪除其他
      const idsToRemove = ids.slice(1);
      
      for (const id of idsToRemove) {
        await Case.findByIdAndDelete(id);
        console.log(`  - 已刪除重複案例 ID: ${id}`);
        totalRemoved++;
      }
    }

    // 檢查相似案例 (基於 athleteName 的相似性)
    const allCases = await Case.find({}, 'athleteName year sport');
    console.log(`\n檢查相似案例...`);
    
    const similarCases = [];
    for (let i = 0; i < allCases.length; i++) {
      for (let j = i + 1; j < allCases.length; j++) {
        const case1 = allCases[i];
        const case2 = allCases[j];
        
        // 檢查是否為相似名稱但不同年份
        const similarity = calculateSimilarity(case1.athleteName, case2.athleteName);
        if (similarity > 0.8 && case1.year !== case2.year && case1.sport === case2.sport) {
          similarCases.push({ case1, case2, similarity });
        }
      }
    }

    if (similarCases.length > 0) {
      console.log(`\n找到 ${similarCases.length} 組可能相似的案例（需要手動確認）：`);
      similarCases.forEach(({ case1, case2, similarity }) => {
        console.log(`  - ${case1.athleteName} (${case1.year}) vs ${case2.athleteName} (${case2.year}) - 相似度: ${(similarity * 100).toFixed(1)}%`);
      });
    }

    // 顯示統計資訊
    const finalCount = await Case.countDocuments();
    
    console.log('\n=== 清理結果 ===');
    console.log(`已刪除重複案例: ${totalRemoved} 個`);
    console.log(`清理後總案例數: ${finalCount}`);
    
    console.log('\n重複案例清理完成！');
    
  } catch (error) {
    console.error('清理重複案例時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('已斷開 MongoDB 連接');
  }
}

// 計算字符串相似度 (使用 Levenshtein 距離)
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// 如果直接執行此檔案，則執行清理
if (require.main === module) {
  removeDuplicates();
}

module.exports = removeDuplicates;