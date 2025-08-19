const mongoose = require('mongoose');
const Case = require('./models/Case');

const MLB_NBA_cases = [
  // MLB 經典案例
  {
    athleteName: 'Barry Bonds',
    nationality: '美國',
    sport: '棒球',
    year: 2003,
    substance: 'THG (The Clear)',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Barry Bonds是MLB歷史上最具爭議的球員之一。在BALCO醜聞中，證據顯示他曾使用未檢測的類固醇THG。雖然從未正式被MLB禁賽，但他的73支全壘打紀錄一直備受質疑。',
    punishment: {
      banDuration: '無正式禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '聲譽受損，未能入選名人堂多年'
    },
    summary: 'BALCO醜聞的核心人物，使用設計類固醇THG，雖無正式處罰但嚴重影響其棒球生涯後期聲譽。',
    educationalNotes: 'THG是專門設計來逃避檢測的類固醇，屬於S1類合成代謝劑，現已被WADA禁用。',
    sourceLinks: [
      { title: 'BALCO類固醇醜聞調查報告', type: '官方文件' },
      { title: 'MLB類固醇時代回顧', type: '新聞' }
    ]
  },
  {
    athleteName: 'Alex Rodriguez (A-Rod)',
    nationality: '美國',
    sport: '棒球',
    year: 2014,
    substance: 'Testosterone等多種',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'A-Rod在Biogenesis醜聞中被發現與反老化診所有關聯，該診所向多名MLB球員提供禁藥。他最初否認指控，但後來承認使用PED。',
    punishment: {
      banDuration: '整個2014年球季 (211場)',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '損失約2500萬美元薪水'
    },
    summary: 'MLB史上最嚴重的禁藥處罰之一，A-Rod錯過整個球季並承認長期使用PED。',
    educationalNotes: 'Testosterone屬於內源性合成代謝雄激素類固醇，是WADA S1.1類禁用物質。',
    sourceLinks: [
      { title: 'MLB Biogenesis調查', type: '官方文件' },
      { title: 'A-Rod禁賽判決', type: '官方文件' }
    ]
  },
  {
    athleteName: 'Ryan Braun',
    nationality: '美國',
    sport: '棒球',
    year: 2013,
    substance: 'Testosterone',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: '2011年NL MVP得主Ryan Braun在Biogenesis醜聞中被發現，最初他強烈否認並成功推翻檢測結果，但後來證據確鿿他確實使用了PED。',
    punishment: {
      banDuration: '65場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '放棄剩餘薪水約300萬美元'
    },
    summary: '從否認到承認的轉變成為MLB反禁藥政策改革的重要轉捩點。',
    educationalNotes: 'Testosterone檢測需要T/E比值分析，正常範圍通常在4:1以下。',
    sourceLinks: [
      { title: 'Ryan Braun禁賽聲明', type: '官方文件' },
      { title: 'Biogenesis醜聞詳細報導', type: '新聞' }
    ]
  },
  {
    athleteName: 'Manny Ramirez',
    nationality: '多明尼加',
    sport: '棒球',
    year: 2009,
    substance: 'HCG (人類絨毛膜促性腺激素)',
    substanceCategory: 'S2.2: 生長激素',
    eventBackground: '名人堂級打者Manny Ramirez在2009年被發現使用HCG，這是一種女性生育藥物，常被類固醇使用者用來恢復自然睾固酮產生。',
    punishment: {
      banDuration: '50場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '第二次違規後退休'
    },
    summary: 'MLB明星球員首批因新藥物政策被禁賽的重要案例。',
    educationalNotes: 'HCG屬於S2.2肽類激素，常被用作類固醇週期後恢復治療，但本身也是禁用物質。',
    sourceLinks: [
      { title: 'Manny Ramirez PED禁賽', type: '官方文件' },
      { title: 'HCG在運動中的使用', type: '官方文件' }
    ]
  },
  {
    athleteName: 'Nelson Cruz',
    nationality: '多明尼加',
    sport: '棒球',
    year: 2013,
    substance: 'Testosterone',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Nelson Cruz是Biogenesis醜聞中被禁賽的13名球員之一，他承認使用PED並接受處罰，後來成功重建職業生涯。',
    punishment: {
      banDuration: '50場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '錯過季後賽'
    },
    summary: '展示了球員如何在PED醜聞後重建職業生涯的正面例子。',
    educationalNotes: 'Biogenesis案例推動了MLB與球員工會加強反禁藥政策的合作。',
    sourceLinks: [
      { title: 'Biogenesis醜聞處罰名單', type: '官方文件' },
      { title: 'Nelson Cruz重返球場', type: '新聞' }
    ]
  },

  // NBA 經典案例  
  {
    athleteName: 'OJ Mayo',
    nationality: '美國',
    sport: '籃球',
    year: 2016,
    substance: '未公開禁藥',
    substanceCategory: '其他/清白記錄',
    eventBackground: 'OJ Mayo因違反NBA反禁藥政策被永久禁賽，這是NBA歷史上罕見的永久禁賽案例。NBA從未公開具體使用的物質。',
    punishment: {
      banDuration: '永久禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '職業生涯結束'
    },
    summary: 'NBA歷史上最嚴厲的禁藥處罰，顯示聯盟對重複違規的零容忍態度。',
    educationalNotes: 'NBA的藥物政策對重複違規者採取遞增處罰，第三次違規可能面臨永久禁賽。',
    sourceLinks: [
      { title: 'OJ Mayo永久禁賽公告', type: '官方文件' },
      { title: 'NBA反禁藥政策', type: '官方文件' }
    ]
  },
  {
    athleteName: 'Joakim Noah',
    nationality: '美國',
    sport: '籃球',
    year: 2017,
    substance: 'Ligandrol (LGD-4033)',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Joakim Noah在尼克隊效力期間被檢測出使用SARM類物質Ligandrol，他聲稱是意外攝入的營養補充劑污染。',
    punishment: {
      banDuration: '20場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '薪水損失'
    },
    summary: '營養補充劑污染的典型案例，強調運動員對攝入物質的嚴格責任。',
    educationalNotes: 'Ligandrol屬於SARM (選擇性雄激素受體調節劑)，被歸類為S1.2其他合成代謝劑。',
    sourceLinks: [
      { title: 'Joakim Noah禁賽聲明', type: '官方文件' },
      { title: 'SARM類物質介紹', type: '官方文件' }
    ]
  },
  {
    athleteName: 'Wilson Chandler',
    nationality: '美國',
    sport: '籃球',
    year: 2019,
    substance: 'Ipamorelin',
    substanceCategory: 'S2.2: 生長激素',
    eventBackground: 'Wilson Chandler在76人隊效力期間使用Ipamorelin，這是一種生長激素釋放肽，他承認使用並接受處罰。',
    punishment: {
      banDuration: '25場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無薪假期'
    },
    summary: '生長激素相關物質使用的案例，顯示NBA對肽類激素的嚴格監管。',
    educationalNotes: 'Ipamorelin是生長激素分泌促進劑，屬於S2.2肽類激素和釋放因子類別。',
    sourceLinks: [
      { title: 'Wilson Chandler禁賽公告', type: '官方文件' },
      { title: '生長激素釋放肽說明', type: '官方文件' }
    ]
  },
  {
    athleteName: 'Deandre Ayton',
    nationality: '美國',
    sport: '籃球',
    year: 2019,
    substance: '利尿劑',
    substanceCategory: 'S5: 利尿劑和掩蔽劑',
    eventBackground: 'Deandre Ayton在太陽隊的第二個賽季被檢測出使用利尿劑，他聲稱是無意中攝入，但仍然接受處罰。',
    punishment: {
      banDuration: '25場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '影響球隊戰績'
    },
    summary: '年輕球員的禁藥案例，強調教育和預防的重要性。',
    educationalNotes: '利尿劑被禁用主要因為可能用作掩蔽劑，稀釋其他禁用物質的濃度。',
    sourceLinks: [
      { title: 'Deandre Ayton禁賽處分', type: '官方文件' },
      { title: '利尿劑作為掩蔽劑', type: '官方文件' }
    ]
  },
  {
    athleteName: 'John Collins',
    nationality: '美國',
    sport: '籃球',
    year: 2019,
    substance: 'Growth Hormone Releasing Peptide-2',
    substanceCategory: 'S2.2: 生長激素',
    eventBackground: 'John Collins在老鷹隊效力期間被發現使用生長激素釋放肽-2，他表示是營養補充劑污染造成的意外攝入。',
    punishment: {
      banDuration: '25場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '錯過關鍵比賽'
    },
    summary: '另一個補充劑污染案例，凸顯運動員選擇營養品時需要格外謹慎。',
    educationalNotes: 'GHRP-2屬於S2.2類肽類激素，能刺激生長激素釋放，被WADA嚴格禁用。',
    sourceLinks: [
      { title: 'John Collins禁賽聲明', type: '官方文件' },
      { title: 'GHRP類物質說明', type: '官方文件' }
    ]
  },

  // 其他美國職業運動案例
  {
    athleteName: 'Tom Brady',
    nationality: '美國',
    sport: '美式足球',
    year: 2016,
    substance: '無 (設備竄改)',
    substanceCategory: '其他/清白記錄',
    eventBackground: '洩氣門事件中，Tom Brady被指控知情並參與竄改比賽用球的氣壓。雖然不是禁藥案例，但涉及比賽操控。',
    punishment: {
      banDuration: '4場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '球隊被罰款100萬美元'
    },
    summary: '雖非禁藥案例，但展示了職業運動對比賽公正性的嚴格要求。',
    educationalNotes: '比賽設備竄改雖非WADA管轄，但體現了反禁藥精神中的公平競爭原則。',
    sourceLinks: [
      { title: 'NFL洩氣門調查報告', type: '官方文件' },
      { title: 'Tom Brady禁賽爭議', type: '新聞' }
    ]
  },
  {
    athleteName: 'Peyton Manning',
    nationality: '美國',
    sport: '美式足球',
    year: 2015,
    substance: 'HGH (指控)',
    substanceCategory: 'S2.2: 生長激素',
    eventBackground: 'Peyton Manning被指控接受HGH治療，但他否認指控並聲稱是為妻子治療。NFL調查後未發現足夠證據。',
    punishment: {
      banDuration: '無處罰',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '聲譽受到質疑'
    },
    summary: '高知名度運動員面臨PED指控但最終獲得清白的案例。',
    educationalNotes: 'HGH屬於S2.2肽類激素，需要醫療必要性才能申請TUE使用。',
    sourceLinks: [
      { title: 'NFL HGH調查', type: '官方文件' },
      { title: 'Peyton Manning回應', type: '新聞' }
    ]
  },
  {
    athleteName: 'Dee Gordon',
    nationality: '美國',
    sport: '棒球',
    year: 2016,
    substance: 'Testosterone和Clostebol',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Dee Gordon在馬林魚隊效力期間被檢測出使用兩種不同的類固醇，他承認違規並表示深感後悔。',
    punishment: {
      banDuration: '80場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '全明星資格被取消'
    },
    summary: '多重類固醇使用的案例，顯示MLB對違規行為的嚴厲處罰。',
    educationalNotes: 'Clostebol是外源性合成代謝雄激素類固醇，屬於S1.1類禁用物質。',
    sourceLinks: [
      { title: 'Dee Gordon禁賽公告', type: '官方文件' },
      { title: 'Clostebol類固醇介紹', type: '官方文件' }
    ]
  },
  {
    athleteName: 'Robinson Cano',
    nationality: '多明尼加',
    sport: '棒球',
    year: 2018,
    substance: 'Furosemide',
    substanceCategory: 'S5: 利尿劑和掩蔽劑',
    eventBackground: 'Robinson Cano被檢測出使用利尿劑Furosemide，這是他第一次PED違規。他接受處罰並在復出後繼續職業生涯。',
    punishment: {
      banDuration: '80場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '薪水損失約1200萬美元'
    },
    summary: '資深明星球員的首次違規案例，顯示任何球員都不能免於檢測。',
    educationalNotes: 'Furosemide是強效利尿劑，除醫療必要外被禁用，可能用作掩蔽其他禁藥。',
    sourceLinks: [
      { title: 'Robinson Cano禁賽處分', type: '官方文件' },
      { title: '利尿劑在運動中的風險', type: '官方文件' }
    ]
  },
  {
    athleteName: 'Fernando Tatis Jr.',
    nationality: '多明尼加',
    sport: '棒球',
    year: 2022,
    substance: 'Clostebol',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: '年輕明星Fernando Tatis Jr.在教士隊效力期間被檢測出Clostebol，他聲稱是治療皮膚感染的藥物污染。',
    punishment: {
      banDuration: '80場禁賽',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '錯過季後賽'
    },
    summary: '年輕超級巨星的禁藥案例，對其職業生涯和球隊造成重大影響。',
    educationalNotes: 'Clostebol常見於某些皮膚藥膏中，運動員使用任何藥物前都應該檢查成分。',
    sourceLinks: [
      { title: 'Tatis Jr.禁賽聲明', type: '官方文件' },
      { title: 'Clostebol藥物污染風險', type: '官方文件' }
    ]
  }
];

async function addMLBNBACases() {
  try {
    console.log('開始新增MLB和NBA禁藥案例...');
    
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('已連接到 MongoDB');

    // 檢查案例是否已存在
    for (const caseData of MLB_NBA_cases) {
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
    const mlbCases = await Case.countDocuments({ sport: '棒球' });
    const nbaCases = await Case.countDocuments({ sport: '籃球' });
    const nflCases = await Case.countDocuments({ sport: '美式足球' });

    console.log('\n=== 資料庫統計 ===');
    console.log(`總案例數: ${totalCases}`);
    console.log(`棒球案例: ${mlbCases}`);
    console.log(`籃球案例: ${nbaCases}`);
    console.log(`美式足球案例: ${nflCases}`);

    console.log('\nMLB、NBA等美國職業運動禁藥案例新增完成！');
    
  } catch (error) {
    console.error('新增案例時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('已斷開 MongoDB 連接');
  }
}

// 如果直接執行此檔案，則執行新增案例
if (require.main === module) {
  addMLBNBACases();
}

module.exports = addMLBNBACases;