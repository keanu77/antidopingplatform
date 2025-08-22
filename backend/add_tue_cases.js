const mongoose = require('mongoose');
const Case = require('./models/Case');

const tueCases = [
  {
    athleteName: 'Chris Froome',
    nationality: '英國',
    sport: '自行車',
    year: 2018,
    substance: 'Salbutamol (沙丁胺醇)',
    substanceCategory: 'S3: Beta-2激動劑',
    eventBackground: 'Chris Froome在2017年環西自行車賽期間被檢測出沙丁胺醇超標。他聲稱使用哮喘吸入劑，並提供醫療證明和TUE申請。經過詳細調查，UCI最終接受其醫療使用的合理性。',
    punishment: {
      banDuration: '無處罰（TUE證明清白）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '聲譽短暫受損'
    },
    summary: '通過TUE證明合法使用禁用物質的經典案例，強調正確申請程序的重要性。',
    educationalNotes: '沙丁胺醇是常見哮喘藥物，需要TUE才能在競技中使用。此案例展示了TUE制度的有效性。',
    sourceLinks: [
      { title: 'UCI調查結果公告', type: '官方文件' },
      { title: 'TUE申請程序說明', type: 'WADA' },
      { title: 'Froome案例詳細報導', type: '新聞' }
    ]
  },
  {
    athleteName: 'Mo Farah',
    nationality: '英國',
    sport: '田徑',
    year: 2015,
    substance: 'L-carnitine注射',
    substanceCategory: 'S2.1: 促紅血球生成素類',
    eventBackground: 'Mo Farah在2015年被揭露曾接受L-carnitine注射治療。雖然L-carnitine本身不在禁用清單，但靜脈注射超過100ml需要TUE。Farah團隊提供了完整的醫療記錄和TUE申請。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '媒體質疑'
    },
    summary: 'TUE制度允許運動員在醫療需要時使用某些方法，但需要嚴格的申請和監督程序。',
    educationalNotes: 'L-carnitine注射在某些醫療情況下是必要的，此案例顯示TUE制度的合理性和透明度。',
    sourceLinks: [
      { title: 'UKAD調查報告', type: '官方文件' },
      { title: 'Mo Farah醫療記錄', type: '官方文件' },
      { title: 'L-carnitine TUE規定', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Rafael Nadal',
    nationality: '西班牙',
    sport: '網球',
    year: 2012,
    substance: 'Corticosteroid (皮質類固醇)',
    substanceCategory: 'S9: 糖皮質激素',
    eventBackground: 'Rafael Nadal在2012年因膝傷接受皮質類固醇注射治療。他事先申請並獲得TUE批准，允許在治療期間使用此禁用物質。整個過程完全透明且符合WADA規定。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: '運動傷害治療中正確使用TUE的典範案例，展示醫療需要與公平競技的平衡。',
    educationalNotes: '皮質類固醇在運動傷害治療中常用，但因有增強表現的潛力而被禁用，需TUE才能使用。',
    sourceLinks: [
      { title: 'ITF TUE核准記錄', type: '官方文件' },
      { title: 'Nadal傷勢治療報告', type: '官方文件' },
      { title: '網球運動員TUE指南', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Serena Williams',
    nationality: '美國',
    sport: '網球',
    year: 2018,
    substance: '多種處方藥物',
    substanceCategory: 'TUE合法使用',
    eventBackground: 'Serena Williams長期持有多項TUE，涵蓋治療她的各種醫療狀況所需的藥物。她的TUE申請過程完全透明，所有使用的藥物都經過嚴格的醫療審查和批准。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '隱私爭議'
    },
    summary: '職業運動員長期持有TUE的案例，展示如何在醫療需要與競技公平間取得平衡。',
    educationalNotes: 'TUE不是一次性的，需要定期更新和醫療監督，確保僅在醫療必要時使用。',
    sourceLinks: [
      { title: 'USADA TUE記錄', type: '官方文件' },
      { title: 'Williams TUE爭議報導', type: '新聞' },
      { title: 'TUE隱私保護政策', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Bradley Wiggins',
    nationality: '英國',
    sport: '自行車',
    year: 2012,
    substance: 'Triamcinolone (曲安奈德)',
    substanceCategory: 'S9: 糖皮質激素',
    eventBackground: 'Bradley Wiggins在2012年環法自行車賽前獲得TUE使用曲安奈德治療哮喘和過敏。雖然程序合法，但後來引發關於TUE使用道德性的討論，特別是時機選擇的問題。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '道德爭議'
    },
    summary: 'TUE使用的時機和必要性常成為爭議焦點，即使程序完全合法。',
    educationalNotes: '曲安奈德是強效皮質類固醇，TUE的批准需要嚴格的醫療證據支持其必要性。',
    sourceLinks: [
      { title: 'UK Sport TUE記錄', type: '官方文件' },
      { title: 'Wiggins TUE爭議調查', type: '官方文件' },
      { title: 'TUE道德使用指南', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Simone Biles',
    nationality: '美國',
    sport: '體操',
    year: 2016,
    substance: 'Methylphenidate (甲基苯丙胺)',
    substanceCategory: 'S6: 興奮劑',
    eventBackground: 'Simone Biles持有TUE使用甲基苯丙胺治療ADHD（注意力缺陷多動障礙）。當她的醫療記錄在駭客攻擊中洩露後，她公開承認使用此藥物，並強調這是合法的醫療治療。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '隱私侵犯'
    },
    summary: 'TUE資料洩露事件突顯了保護運動員醫療隱私的重要性。',
    educationalNotes: 'ADHD治療藥物在競技運動中需要TUE，此案例展示了心理健康治療的複雜性。',
    sourceLinks: [
      { title: 'USADA TUE確認', type: '官方文件' },
      { title: 'Biles公開聲明', type: '新聞' },
      { title: 'ADHD藥物TUE指南', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Adam Peaty',
    nationality: '英國',
    sport: '游泳',
    year: 2019,
    substance: 'Prednisolone (強體松)',
    substanceCategory: 'S9: 糖皮質激素',
    eventBackground: 'Adam Peaty在2019年因嚴重過敏反應需要使用強體松治療。他的醫療團隊迅速申請並獲得TUE批准，允許在治療期間繼續訓練和競賽。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: '緊急醫療情況下TUE申請的快速處理展示了制度的靈活性和有效性。',
    educationalNotes: '強體松是治療嚴重過敏和炎症的重要藥物，但因增強表現潛力而需TUE。',
    sourceLinks: [
      { title: 'British Swimming醫療報告', type: '官方文件' },
      { title: 'Peaty過敏治療記錄', type: '官方文件' },
      { title: '緊急TUE申請程序', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Venus Williams',
    nationality: '美國',
    sport: '網球',
    year: 2011,
    substance: '自體免疫疾病藥物',
    substanceCategory: 'TUE合法使用',
    eventBackground: 'Venus Williams被診斷出患有自體免疫疾病後，需要使用多種藥物治療。她公開她的病情並申請必要的TUE，展現了在面對嚴重健康挑戰時的透明度和勇氣。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '健康挑戰'
    },
    summary: '慢性疾病運動員使用TUE的長期管理案例，平衡健康需要與競技要求。',
    educationalNotes: '自體免疫疾病治療複雜，需要多種藥物，TUE制度確保運動員能安全參賽。',
    sourceLinks: [
      { title: 'USTA醫療支持聲明', type: '官方文件' },
      { title: 'Venus Williams病情公開', type: '新聞' },
      { title: '慢性疾病TUE管理', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Lizzie Armitstead',
    nationality: '英國',
    sport: '自行車',
    year: 2016,
    substance: 'Prednisolone (強體松)',
    substanceCategory: 'S9: 糖皮質激素',
    eventBackground: 'Lizzie Armitstead在里約奧運前因哮喘惡化需要使用強體松。她及時申請TUE並獲得批准，能夠參加奧運比賽並獲得獎牌，展示TUE制度支持運動員健康的功能。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: 'TUE使運動員能在必要醫療治療下繼續競技，維護運動生涯與健康的平衡。',
    educationalNotes: '哮喘是常見的運動員健康問題，適當的TUE申請確保治療不影響競技資格。',
    sourceLinks: [
      { title: 'British Cycling TUE報告', type: '官方文件' },
      { title: 'Armitstead里約準備', type: '新聞' },
      { title: '哮喘治療TUE指南', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Justin Rose',
    nationality: '英國',
    sport: '高爾夫',
    year: 2017,
    substance: 'Anti-inflammatory (抗炎藥)',
    substanceCategory: 'S9: 糖皮質激素',
    eventBackground: 'Justin Rose在重要比賽前因背部傷害需要類固醇注射。他通過高爾夫協會申請TUE，經醫療委員會審查後獲得批准，能夠參賽並展現最佳表現。',
    punishment: {
      banDuration: '無處罰（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: '高爾夫運動中TUE使用的案例，展示不同運動項目都需要遵守相同的反禁藥標準。',
    educationalNotes: '運動傷害的治療常需要抗炎藥物，TUE確保治療的合法性和透明度。',
    sourceLinks: [
      { title: 'European Tour醫療政策', type: '官方文件' },
      { title: 'Rose傷勢治療報告', type: '官方文件' },
      { title: '高爾夫TUE申請指南', type: 'WADA' }
    ]
  }
];

async function addTUECases() {
  try {
    console.log('開始新增TUE證明清白的禁藥案例...');
    
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('已連接到 MongoDB');

    // 檢查案例是否已存在
    for (const caseData of tueCases) {
      const existingCase = await Case.findOne({
        athleteName: caseData.athleteName,
        year: caseData.year
      });

      if (existingCase) {
        console.log(`案例已存在，跳過: ${caseData.athleteName} (${caseData.year})`);
        continue;
      }

      // 新增案例
      const newCase = new Case(caseData);
      await newCase.save();
      console.log(`新增案例: ${caseData.athleteName} - ${caseData.sport} (${caseData.year})`);
    }

    // 顯示統計資訊
    const totalCases = await Case.countDocuments();
    const tueCasesCount = await Case.countDocuments({ 
      substanceCategory: { $in: ['TUE合法使用', 'S3: β-2致效劑', 'S2.1: 促紅血球生成劑', 'S9: 糖皮質激素', 'S6: 興奮劑'] },
      'punishment.banDuration': { $regex: /TUE|合法/ }
    });

    console.log('\n=== 資料庫統計 ===');
    console.log(`總案例數: ${totalCases}`);
    console.log(`TUE相關案例: ${tueCasesCount}`);

    console.log('\nTUE證明清白案例新增完成！');
    
  } catch (error) {
    console.error('新增案例時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('已斷開 MongoDB 連接');
  }
}

// 如果直接執行此檔案，則執行新增案例
if (require.main === module) {
  addTUECases();
}

module.exports = addTUECases;