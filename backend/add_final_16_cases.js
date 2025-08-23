const mongoose = require('mongoose');
const Case = require('./models/Case');

// 連接MongoDB
mongoose.connect('mongodb://localhost:27017/antidoping')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 添加最後16個案例達到182個目標
const finalCases = [
  {
    athleteName: 'Barry Bonds',
    nationality: '美國',
    sport: '棒球',
    substanceCategory: 'S1: 合成代謝劑',
    substance: 'THG (The Clear)',
    year: 2003,
    eventBackground: 'MLB史上全壘打王，涉及BALCO醜聞，使用設計師類固醇THG',
    punishment: {
      banDuration: '職業生涯受影響',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '國會聽證'
    },
    summary: '展示高水準運動員使用新型禁藥的風險',
    educationalNotes: 'BALCO醜聞是反禁藥史上重要案例'
  },
  {
    athleteName: 'Tyson Gay',
    nationality: '美國',
    sport: '田徑',
    substanceCategory: 'S1: 合成代謝劑',
    substance: '雄激素類固醇',
    year: 2013,
    eventBackground: '前世界100公尺紀錄保持者，在世錦賽前被檢出禁藥',
    punishment: {
      banDuration: '1年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '成績被取消'
    },
    summary: '說明頂尖短跑選手使用類固醇的後果',
    educationalNotes: '展示即使頂尖運動員也無法逃避檢測'
  },
  {
    athleteName: 'Sun Yang',
    nationality: '中國',
    sport: '游泳',
    substanceCategory: 'M2: 化學和物理操作',
    substance: '拒絕配合檢測',
    year: 2018,
    eventBackground: '奧運冠軍拒絕配合反禁藥檢測，破壞血液樣本',
    punishment: {
      banDuration: '8年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '多項成績被質疑'
    },
    summary: '強調配合反禁藥檢測的重要性',
    educationalNotes: '拒絕配合檢測等同於陽性結果'
  },
  {
    athleteName: 'Alberto Contador',
    nationality: '西班牙',
    sport: '自行車',
    substanceCategory: 'S1: 合成代謝劑',
    substance: 'Clenbuterol',
    year: 2010,
    eventBackground: '環法冠軍在2010年環法賽中被檢出極微量瘦肉精',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '失去2010、2011年環法冠軍'
    },
    summary: '展示食物污染辯護的複雜性',
    educationalNotes: '微量檢出仍可構成違規'
  },
  {
    athleteName: 'Floyd Landis',
    nationality: '美國',
    sport: '自行車',
    substanceCategory: 'S1: 合成代謝劑',
    substance: '睪固酮',
    year: 2006,
    eventBackground: '2006年環法冠軍，在關鍵賽段後被檢出睪固酮比例異常',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '失去環法冠軍頭銜'
    },
    summary: '說明睪固酮檢測的科學原理',
    educationalNotes: '睪固酮/表睪固酮比例是重要檢測指標'
  },
  {
    athleteName: 'Kostas Kenteris',
    nationality: '希臘',
    sport: '田徑',
    substanceCategory: 'M2: 化學和物理操作',
    substance: '逃避檢測',
    year: 2004,
    eventBackground: '雅典奧運前夕，希臘短跑明星因逃避檢測而退出奧運',
    punishment: {
      banDuration: '2年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '錯失主場奧運'
    },
    summary: '強調運動員接受檢測的義務',
    educationalNotes: '逃避檢測是嚴重的反禁藥違規'
  },
  {
    athleteName: 'Dwain Chambers',
    nationality: '英國',
    sport: '田徑',
    substanceCategory: 'S1: 合成代謝劑',
    substance: 'THG',
    year: 2003,
    eventBackground: '英國短跑選手，BALCO醜聞中的受害者，使用設計師類固醇',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '後復出參賽'
    },
    summary: '展示運動員重新開始的可能性',
    educationalNotes: '真誠悔改可獲得第二次機會'
  },
  {
    athleteName: 'Manny Ramirez',
    nationality: '多明尼加',
    sport: '棒球',
    substanceCategory: 'S1: 合成代謝劑',
    substance: 'HCG',
    year: 2009,
    eventBackground: 'MLB明星球員，被檢出人類絨毛膜促性腺激素',
    punishment: {
      banDuration: '50場',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: 'MLB暫停出賽'
    },
    summary: '說明掩蔽劑的使用和檢測',
    educationalNotes: 'HCG常用作類固醇使用後的掩蔽劑'
  },
  {
    athleteName: 'Tim Montgomery',
    nationality: '美國',
    sport: '田徑',
    substanceCategory: 'S1: 合成代謝劑',
    substance: 'THG, EPO',
    year: 2005,
    eventBackground: '前100公尺世界紀錄保持者，BALCO醜聞主要涉案人員',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '世界紀錄被取消'
    },
    summary: '展示系統性禁藥使用的後果',
    educationalNotes: 'BALCO案例揭露了系統性禁藥供應網絡'
  },
  {
    athleteName: 'Tyler Hamilton',
    nationality: '美國',
    sport: '自行車',
    substanceCategory: 'M1: 血液和血液成分操作',
    substance: '血液輸注',
    year: 2004,
    eventBackground: '奧運金牌得主，使用血液輸注提升表現',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '奧運金牌被收回'
    },
    summary: '說明血液禁藥的檢測技術',
    educationalNotes: '血液輸注檢測是反禁藥技術的重大突破'
  },
  {
    athleteName: 'David Millar',
    nationality: '英國',
    sport: '自行車',
    substanceCategory: 'S2.1: 促紅血球生成素類',
    substance: 'EPO',
    year: 2004,
    eventBackground: '英國自行車選手，主動承認使用EPO',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '後成為反禁藥倡導者'
    },
    summary: '展示誠實面對錯誤的重要性',
    educationalNotes: '主動承認違規可獲得較輕處罰'
  },
  {
    athleteName: 'Lydia Valentin',
    nationality: '西班牙',
    sport: '舉重',
    substanceCategory: 'S1: 合成代謝劑',
    substance: '雄激素類固醇',
    year: 2017,
    eventBackground: '舉重奧運獎牌得主，在重檢中被檢出禁藥',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '多項獎牌被收回'
    },
    summary: '說明樣本重檢的重要性',
    educationalNotes: '樣本可保存8-10年供重新檢測'
  },
  {
    athleteName: 'Asafa Powell',
    nationality: '牙買加',
    sport: '田徑',
    substanceCategory: 'S6: 興奮劑',
    substance: 'Oxilofrine',
    year: 2013,
    eventBackground: '前100公尺世界紀錄保持者，因營養補劑污染被檢出禁藥',
    punishment: {
      banDuration: '18個月',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '減刑因污染'
    },
    summary: '強調營養補劑安全性的重要',
    educationalNotes: '營養補劑污染是常見的無意違規原因'
  },
  {
    athleteName: 'Sherone Simpson',
    nationality: '牙買加',
    sport: '田徑',
    substanceCategory: 'S6: 興奮劑',
    substance: 'Oxilofrine',
    year: 2013,
    eventBackground: '奧運獎牌得主，與Asafa Powell同時被檢出相同物質',
    punishment: {
      banDuration: '18個月',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '減刑因污染'
    },
    summary: '說明團隊環境中的禁藥風險',
    educationalNotes: '團隊使用相同補劑可能導致集體違規'
  },
  {
    athleteName: 'Ryan Braun',
    nationality: '美國',
    sport: '棒球',
    substanceCategory: 'S1: 合成代謝劑',
    substance: '睪固酮',
    year: 2011,
    eventBackground: 'MLB MVP得主，因技術問題成功上訴後再次被查出使用禁藥',
    punishment: {
      banDuration: '65場',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: 'MLB暫停出賽'
    },
    summary: '展示法律程序在反禁藥中的複雜性',
    educationalNotes: '程序瑕疵可能影響處罰結果'
  },
  {
    athleteName: 'Nelson Cruz',
    nationality: '多明尼加',
    sport: '棒球',
    substanceCategory: 'S1: 合成代謝劑',
    substance: 'Biogenesis相關物質',
    year: 2013,
    eventBackground: 'MLB全明星球員，涉及Biogenesis診所醜聞',
    punishment: {
      banDuration: '50場',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: 'MLB暫停出賽'
    },
    summary: '說明系統性禁藥供應網絡的危害',
    educationalNotes: 'Biogenesis案例揭露職業運動的禁藥問題'
  }
];

async function addFinalCases() {
  try {
    console.log('正在添加最後16個案例...');
    
    const insertedCases = await Case.insertMany(finalCases);
    console.log(`✅ 成功添加 ${insertedCases.length} 個案例`);

    // 檢查總數
    const totalCount = await Case.countDocuments();
    console.log(`📊 資料庫總案例數: ${totalCount}`);

    // 統計分析
    const substanceStats = await Case.aggregate([
      {
        $group: {
          _id: '$substanceCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const sportStats = await Case.aggregate([
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🏷️ 物質類別統計:');
    substanceStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 案例`);
    });

    console.log('\n🏃 運動項目統計 (前10名):');
    sportStats.slice(0, 10).forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 案例`);
    });

    mongoose.disconnect();
    console.log('\n✅ 案例添加完成！達到182個目標！');

  } catch (error) {
    console.error('❌ 錯誤:', error);
    mongoose.disconnect();
  }
}

addFinalCases();