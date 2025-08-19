const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// WADA 2024 禁用清單分類對照表
const substanceMapping = {
  // 現有分類 -> WADA分類
  '類固醇': 'S1: 合成代謝劑',
  'EPO': 'S2: 肽類激素、生長因子',
  '興奮劑': 'S6: 興奮劑',
  '利尿劑': 'S5: 利尿劑和掩蔽劑',
  '血液興奮劑': 'M1: 血液和血液成分操作',
  '其他': '其他/清白記錄'
};

// 特定物質的精確WADA分類
const specificSubstanceMapping = {
  'EPO': 'S2.1: 促紅血球生成素類',
  'Erythropoietin': 'S2.1: 促紅血球生成素類',
  'CERA': 'S2.1: 促紅血球生成素類',
  'Testosterone': 'S1.1: 外源性合成代謝雄激素類固醇',
  'Nandrolone': 'S1.1: 外源性合成代謝雄激素類固醇',
  'Stanozolol': 'S1.1: 外源性合成代謝雄激素類固醇',
  'THG': 'S1.1: 外源性合成代謝雄激素類固醇',
  'Oral-Turinabol': 'S1.1: 外源性合成代謝雄激素類固醇',
  'Clostebol': 'S1.1: 外源性合成代謝雄激素類固醇',
  'DHT': 'S1.1: 外源性合成代謝雄激素類固醇',
  'Methenolone': 'S1.1: 外源性合成代謝雄激素類固醇',
  'Turinabol': 'S1.1: 外源性合成代謝雄激素類固醇',
  'Boldenone': 'S1.1: 外源性合成代謝雄激素類固醇',
  'Trenbolone': 'S1.1: 外源性合成代謝雄激素類固醇',
  'HGH': 'S2.2: 生長激素',
  'Growth Hormone': 'S2.2: 生長激素',
  'IGF-1': 'S2.3: 生長因子',
  'Amphetamines': 'S6: 興奮劑',
  'Stimulants': 'S6: 興奮劑',
  'Modafinil': 'S6: 興奮劑',
  'Pseudoephedrine': 'S6: 興奮劑',
  'Ephedrine': 'S6: 興奮劑',
  'Phenylpropanolamine': 'S6: 興奮劑',
  'Cannabis': 'S8: 大麻類',
  'Marijuana': 'S8: 大麻類',
  'Furosemide': 'S5: 利尿劑和掩蔽劑',
  'Hydrochlorothiazide': 'S5: 利尿劑和掩蔽劑',
  'Clenbuterol': 'S3: Beta-2激動劑',
  'Salbutamol': 'S3: Beta-2激動劑',
  'Meldonium': 'S4.4: 代謝調節劑',
  'Trimetazidine': 'S4.4: 代謝調節劑',
  'Roxadustat': 'S2.1: 促紅血球生成素類',
  'Androstenedione': 'S1.2: 其他合成代謝劑',
  'DHEA': 'S1.2: 其他合成代謝劑',
  'Prohormones': 'S1.2: 其他合成代謝劑'
};

async function updateWADAClassification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    // 獲取所有案例
    const allCases = await Case.find({});
    console.log(`Found ${allCases.length} cases to update`);

    let updatedCount = 0;
    const updateSummary = {};

    for (const caseDoc of allCases) {
      let newCategory = null;
      
      // 首先檢查特定物質映射
      const substance = caseDoc.substance?.toLowerCase() || '';
      
      // 檢查是否有精確的物質匹配
      for (const [specificSubstance, wadaCategory] of Object.entries(specificSubstanceMapping)) {
        if (substance.includes(specificSubstance.toLowerCase()) || 
            substance.includes(specificSubstance.replace(/[^a-zA-Z]/g, '').toLowerCase())) {
          newCategory = wadaCategory;
          break;
        }
      }
      
      // 如果沒有精確匹配，使用一般分類映射
      if (!newCategory) {
        newCategory = substanceMapping[caseDoc.substanceCategory] || '其他/清白記錄';
      }
      
      // 特殊處理
      if (caseDoc.substance?.includes('清白') || caseDoc.substance?.includes('Clean') || 
          caseDoc.substance?.includes('TUE') || caseDoc.substance?.includes('合法')) {
        newCategory = '清白記錄/合法使用';
      }
      
      if (caseDoc.substance?.includes('拒絕檢測') || caseDoc.substance?.includes('錯過檢測') ||
          caseDoc.substance?.includes('樣本操作') || caseDoc.substance?.includes('破壞檢測')) {
        newCategory = 'M2: 化學和物理操作';
      }
      
      if (caseDoc.substance?.includes('血液') || caseDoc.substance?.includes('Blood') ||
          caseDoc.substance?.includes('輸血')) {
        newCategory = 'M1: 血液和血液成分操作';
      }

      // 更新案例
      if (newCategory !== caseDoc.substanceCategory) {
        await Case.findByIdAndUpdate(caseDoc._id, { 
          substanceCategory: newCategory 
        });
        updatedCount++;
        
        // 統計更新摘要
        const oldCategory = caseDoc.substanceCategory || '未分類';
        if (!updateSummary[oldCategory]) {
          updateSummary[oldCategory] = {};
        }
        if (!updateSummary[oldCategory][newCategory]) {
          updateSummary[oldCategory][newCategory] = 0;
        }
        updateSummary[oldCategory][newCategory]++;
      }
    }

    console.log(`\n=== WADA分類更新完成 ===`);
    console.log(`總更新案例數: ${updatedCount}`);
    
    console.log('\n📊 更新摘要:');
    for (const [oldCategory, newCategories] of Object.entries(updateSummary)) {
      console.log(`\n從 "${oldCategory}" 更新為:`);
      for (const [newCategory, count] of Object.entries(newCategories)) {
        console.log(`  -> ${newCategory}: ${count} 案例`);
      }
    }

    // 生成最終統計
    const finalStats = await Case.aggregate([
      { $group: { _id: '$substanceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🎯 最終WADA分類統計:');
    finalStats.forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat._id}: ${stat.count} 案例`);
    });

    console.log('\n✅ WADA分類更新成功完成！');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating WADA classification:', error);
    process.exit(1);
  }
}

updateWADAClassification();