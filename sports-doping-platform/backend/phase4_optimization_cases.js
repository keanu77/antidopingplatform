const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 階段四：優化與整合案例 - 補充重要遺漏案例，完善資料庫
const phase4Cases = [
  {
    athleteName: 'BALCO案例群體',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG, EPO, 類固醇',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'Bay Area Laboratory Co-operative醜聞揭露設計類固醇THG，涉及多名頂尖運動員。',
    punishment: {
      banDuration: '各不相同',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '改變美國反禁藥歷史'
    },
    sourceLinks: [
      {
        title: 'USADA BALCO Investigation',
        url: 'https://www.usada.org/spirit-of-sport/education/balco-scandal/',
        type: 'WADA'
      }
    ],
    summary: '歷史轉折：BALCO醜聞改變反禁藥格局。',
    educationalNotes: '設計類固醇THG專門為了逃避檢測而開發，展現禁藥技術的演進。'
  },
  {
    athleteName: 'Michelle Smith',
    nationality: '愛爾蘭',
    sport: '游泳',
    substance: 'Androstenedione (疑似)',
    substanceCategory: '類固醇',
    year: 1998,
    eventBackground: '愛爾蘭游泳選手因提供被稀釋的尿液樣本被禁賽，1996年亞特蘭大奧運三金成就受質疑。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '奧運金牌保留但備受爭議'
    },
    sourceLinks: [
      {
        title: 'FINA Michelle Smith Case',
        url: 'https://www.fina.org/',
        type: '官方文件'
      }
    ],
    summary: '樣本操作：稀釋尿液的檢測逃避嘗試。',
    educationalNotes: '操作檢測樣本與使用禁藥同樣被視為嚴重違規行為。'
  },
  {
    athleteName: 'Justin Gatlin',
    nationality: '美國',
    sport: '田徑',
    substance: 'Testosterone',
    substanceCategory: '類固醇',
    year: 2006,
    eventBackground: '美國短跑選手第二次藥檢陽性，展現累犯的嚴厲處罰。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '複出後仍獲世錦賽金牌'
    },
    sourceLinks: [
      {
        title: 'IAAF Justin Gatlin Decision',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '累犯處罰：二次違規的加重處罰。',
    educationalNotes: '重複違規會面臨更嚴厲的處罰，最高可達終身禁賽。'
  },
  {
    athleteName: 'Carl Lewis',
    nationality: '美國',
    sport: '田徑',
    substance: 'Stimulants (微量)',
    substanceCategory: '興奮劑',
    year: 1988,
    eventBackground: '美國短跑傳奇在1988年美國選拔賽中檢出微量興奮劑，但被認定為非故意使用。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '2003年才公開此事'
    },
    sourceLinks: [
      {
        title: 'Carl Lewis 1988 Drug Test Documents',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '歷史爭議：傳奇運動員的微量檢出爭議。',
    educationalNotes: '即使是微量檢出，在現今標準下也可能構成違規。'
  },
  {
    athleteName: 'Dwain Chambers',
    nationality: '英國',
    sport: '田徑',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: '英國短跑選手承認使用BALCO提供的THG，成為歐洲BALCO案例代表。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '英國奧委會終身禁令（後撤銷）'
    },
    sourceLinks: [
      {
        title: 'UK Anti-Doping Dwain Chambers',
        url: 'https://www.ukad.org.uk/',
        type: '官方文件'
      }
    ],
    summary: 'BALCO歐洲：英國短跑的THG案例。',
    educationalNotes: 'THG是首個被發現的"設計類固醇"，專門設計來逃避檢測。'
  },
  {
    athleteName: 'Kelli White',
    nationality: '美國',
    sport: '田徑',
    substance: 'Modafinil',
    substanceCategory: '興奮劑',
    year: 2003,
    eventBackground: '美國短跑選手因使用modafinil被抓，後承認參與BALCO計劃。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '配合調查減刑'
    },
    sourceLinks: [
      {
        title: 'USADA Kelli White BALCO Case',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: 'Modafinil案例：促智藥物在運動中的濫用。',
    educationalNotes: 'Modafinil是促智藥物，可增強注意力和警覺性，在運動中被禁用。'
  },
  {
    athleteName: '東德游泳系統',
    nationality: '東德',
    sport: '游泳',
    substance: 'State-sponsored doping',
    substanceCategory: '類固醇',
    year: 1976,
    eventBackground: '東德國家支持的系統性禁藥計劃，特別影響女子游泳項目。',
    punishment: {
      banDuration: '歷史案例',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '政治制度崩解後曝光'
    },
    sourceLinks: [
      {
        title: 'East German Doping System Documentation',
        url: 'https://www.wada-ama.org/',
        type: 'WADA'
      }
    ],
    summary: '國家層級：東德系統性禁藥的歷史教訓。',
    educationalNotes: '國家支持的系統性禁藥對運動員健康造成長期傷害，特別是未成年運動員。'
  },
  {
    athleteName: 'Tim Montgomery',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG, EPO',
    substanceCategory: '類固醇',
    year: 2005,
    eventBackground: '前100公尺世界紀錄保持者承認使用BALCO提供的多種禁藥。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '世界紀錄被取消'
    },
    sourceLinks: [
      {
        title: 'USADA Tim Montgomery BALCO',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: 'BALCO核心：前世界紀錄保持者的墜落。',
    educationalNotes: '世界紀錄保持者也無法逃脫禁藥調查，成就最終被取消。'
  },
  {
    athleteName: 'Regina Jacobs',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: '美國中距離女王在職業生涯晚期被發現使用THG。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '終結輝煌職業生涯'
    },
    sourceLinks: [
      {
        title: 'USADA Regina Jacobs Decision',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '職業生涯晚期：老將的禁藥誘惑。',
    educationalNotes: '職業生涯末期的運動員可能因為成績下滑而選擇禁藥，但風險更高。'
  },
  {
    athleteName: 'CJ Hunter',
    nationality: '美國',
    sport: '田徑',
    substance: 'Nandrolone',
    substanceCategory: '類固醇',
    year: 2000,
    eventBackground: '美國鉛球選手、Marion Jones前夫，nandrolone陽性案例。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '職業生涯終結'
    },
    sourceLinks: [
      {
        title: 'IAAF CJ Hunter Case',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: 'Nandrolone經典：力量項目的類固醇使用。',
    educationalNotes: 'Nandrolone是經典的合成代謝類固醇，在力量項目中較常見。'
  },
  {
    athleteName: 'Jerome Young',
    nationality: '美國',
    sport: '田徑',
    substance: 'Nandrolone',
    substanceCategory: '類固醇',
    year: 1999,
    eventBackground: '美國4x400接力選手的陽性案例被隱瞞，直到2008年才公開。',
    punishment: {
      banDuration: '終身禁賽',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '美國接力隊失去奧運金牌'
    },
    sourceLinks: [
      {
        title: 'USADA Jerome Young Cover-up',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '隱瞒案例：反禁藥機構的系統失敗。',
    educationalNotes: '隱瞒陽性案例會導致更嚴重的後果，包括團體項目成績的取消。'
  },
  {
    athleteName: 'Antonio Pettigrew',
    nationality: '美國',
    sport: '田徑',
    substance: 'PED cocktail',
    substanceCategory: '類固醇',
    year: 2008,
    eventBackground: '美國4x400接力選手承認在2000年奧運期間使用禁藥。',
    punishment: {
      banDuration: '追溯性處罰',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '美國隊交回奧運金牌'
    },
    sourceLinks: [
      {
        title: 'USADA Antonio Pettigrew Admission',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '遲來的懺悔：退役後的違規承認。',
    educationalNotes: '運動員的違規承認可能導致團隊成績的追溯性取消。'
  }
];

async function addPhase4Cases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    console.log(`Adding ${phase4Cases.length} phase 4 optimization cases...`);

    // Insert phase 4 cases
    const insertedCases = await Case.insertMany(phase4Cases);
    console.log(`Successfully added ${insertedCases.length} phase 4 optimization cases`);

    // Update related cases for all existing cases
    const allCases = await Case.find({});
    console.log('Updating related cases for all entries...');

    for (let i = 0; i < allCases.length; i++) {
      const currentCase = allCases[i];
      
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

    console.log('Updated related cases for all entries');
    
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    // Generate summary statistics
    const sportStats = await Case.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const substanceStats = await Case.aggregate([
      { $group: { _id: '$substanceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const yearStats = await Case.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    console.log('\n=== DATABASE SUMMARY ===');
    console.log(`Total Cases: ${totalCases}`);
    console.log('\nTop Sports:');
    sportStats.slice(0, 5).forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} cases`);
    });

    console.log('\nSubstance Categories:');
    substanceStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} cases`);
    });

    console.log('\nRecent Years:');
    yearStats.slice(0, 10).forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} cases`);
    });

    console.log('\nPhase 4 optimization completed successfully!');
    console.log('Near-decade doping cases database is now complete with comprehensive coverage.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding phase 4 cases:', error);
    process.exit(1);
  }
}

addPhase4Cases();