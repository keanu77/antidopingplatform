// 導入所有案例資料到Zeabur MongoDB
require('dotenv').config();

// 設置Zeabur MongoDB連接
process.env.MONGODB_URI = 'mongodb://mongo:6sREmb4qe9Y0Iprc8jLDKa237g5XU1Fn@tpe1.clusters.zeabur.com:31411/sports-doping-db?authSource=admin';

const mongoose = require('mongoose');

async function importAllData() {
  try {
    // 連接到Zeabur MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Zeabur MongoDB');

    // 執行所有導入腳本
    const scripts = [
      './backend/seedData.js',
      './backend/add_comprehensive_cases_batch1.js',
      './backend/add_comprehensive_cases_batch2.js',
      './backend/add_comprehensive_cases_batch3.js',
      './backend/add_comprehensive_verified_cases.js',
      './backend/add_final_19_cases.js',
      './backend/add_final_5_cases.js',
      './backend/add_verified_55_cases.js',
      './backend/add_weightlifting_cases.js'
    ];

    for (const script of scripts) {
      console.log(`執行 ${script}...`);
      delete require.cache[require.resolve(script)];
      require(script);
      // 等待一下確保資料寫入
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('所有資料導入完成！');
    
    // 檢查案例數
    const Case = require('./backend/models/Case');
    const count = await Case.countDocuments();
    console.log(`總共導入 ${count} 個案例`);
    
    process.exit(0);
  } catch (error) {
    console.error('導入失敗:', error);
    process.exit(1);
  }
}

importAllData();