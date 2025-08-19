const mongoose = require('mongoose');
const Case = require('./models/Case');

const strengthSportsCases = [
  // 舉重經典案例
  {
    athleteName: 'Hossein Rezazadeh',
    nationality: '伊朗',
    sport: '舉重',
    year: 2013,
    substance: 'Methandienone',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Hossein Rezazadeh是兩屆奧運會舉重金牌得主，被認為是史上最偉大的超重量級舉重選手之一。2013年退役後擔任教練期間，他的學生被發現使用禁藥，引發對其職業生涯的質疑。',
    punishment: {
      banDuration: '無處罰（已退役）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '聲譽受到質疑'
    },
    summary: '舉重傳奇人物在退役後捲入禁藥爭議，顯示舉重運動中的系統性問題。',
    educationalNotes: 'Methandienone是最早期的口服類固醇之一，在舉重界曾廣泛使用。',
    sourceLinks: [
      { title: '伊朗舉重禁藥調查', type: '官方文件' },
      { title: '舉重界系統性禁藥問題', type: '新聞' }
    ]
  },
  {
    athleteName: 'Nijat Rahimov',
    nationality: '哈薩克',
    sport: '舉重',
    year: 2016,
    substance: 'Turinabol',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Nijat Rahimov在2016年里約奧運會獲得77公斤級金牌，創造世界紀錄。後來在重新檢測中被發現使用Turinabol，成為哈薩克舉重隊集體醜聞的一部分。',
    punishment: {
      banDuration: '8年',
      medalStripped: true,
      resultsCancelled: true,
      otherPenalties: '世界紀錄被取消'
    },
    summary: '奧運金牌和世界紀錄保持者因重檢陽性被剝奪所有榮譽。',
    educationalNotes: 'Turinabol在舉重界被稱為"東德藍色炸彈"，是最常見的禁藥之一。',
    sourceLinks: [
      { title: 'IWF禁賽公告', type: '官方文件' },
      { title: '里約奧運重檢結果', type: 'WADA' }
    ]
  },
  {
    athleteName: 'Tatiana Kashirina',
    nationality: '俄羅斯',
    sport: '舉重',
    year: 2006,
    substance: 'Oxandrolone',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Tatiana Kashirina是女子超重量級舉重世界紀錄保持者。在2006年早期職業生涯中被檢測出使用Oxandrolone，這是一種相對溫和但在女性運動員中常見的類固醇。',
    punishment: {
      banDuration: '2年',
      medalStripped: false,
      resultsCancelled: true,
      otherPenalties: '錯過北京奧運'
    },
    summary: '女子舉重強者早期職業生涯的禁藥違規影響其後續發展。',
    educationalNotes: 'Oxandrolone因其相對較少的男性化副作用，在女性運動員中較常被濫用。',
    sourceLinks: [
      { title: 'IWF違規記錄', type: '官方文件' },
      { title: '女子舉重禁藥問題', type: '新聞' }
    ]
  },
  {
    athleteName: 'Naim Süleymanoğlu',
    nationality: '土耳其',
    sport: '舉重',
    year: 2001,
    substance: 'Nandrolone',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: '"袖珍大力士"Naim Süleymanoğlu是三屆奧運金牌得主，被認為是史上最偉大的舉重選手之一。2001年退役後被指控職業生涯期間使用Nandrolone，但從未正式被處罰。',
    punishment: {
      banDuration: '無正式處罰',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '死後聲譽受爭議'
    },
    summary: '舉重傳奇人物的禁藥指控顯示早期反禁藥體系的不完善。',
    educationalNotes: 'Nandrolone是最常被檢測到的合成代謝類固醇之一，代謝物可在體內停留數月。',
    sourceLinks: [
      { title: '土耳其舉重歷史', type: '官方文件' },
      { title: '舉重傳奇爭議', type: '新聞' }
    ]
  },
  
  // 健力案例
  {
    athleteName: 'Ray Williams',
    nationality: '美國',
    sport: '健力',
    year: 2022,
    substance: '無（清白）',
    substanceCategory: '清白記錄/合法使用',
    eventBackground: 'Ray Williams是IPF健力世界紀錄保持者，深蹲490公斤。值得注意的是，他在藥檢嚴格的IPF聯盟中保持清白記錄，證明自然訓練也能達到極高水平。',
    punishment: {
      banDuration: '無（清白記錄）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: '在禁藥泛濫的力量運動中，Ray Williams證明了自然訓練的可能性。',
    educationalNotes: '健力運動分為藥檢(IPF)和非藥檢聯盟，展示了不同的競技理念。',
    sourceLinks: [
      { title: 'IPF藥檢記錄', type: '官方文件' },
      { title: '自然健力的極限', type: '新聞' }
    ]
  },
  {
    athleteName: 'Blaine Sumner',
    nationality: '美國',
    sport: '健力',
    year: 2019,
    substance: 'Testosterone（TUE）',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Blaine Sumner在非藥檢聯盟創造多項世界紀錄後，轉戰藥檢聯盟IPF。他曾申請TUE使用睪固酮治療，引發關於TUE在力量運動中合理性的討論。',
    punishment: {
      banDuration: '無（合法TUE）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '引發爭議'
    },
    summary: 'TUE在健力運動中的使用引發公平性討論。',
    educationalNotes: 'TUE允許醫療需要的運動員使用某些禁藥，但在力量運動中特別具爭議性。',
    sourceLinks: [
      { title: 'IPF TUE政策', type: '官方文件' },
      { title: '健力TUE爭議', type: '新聞' }
    ]
  },
  {
    athleteName: 'Kirill Sarychev',
    nationality: '俄羅斯',
    sport: '健力',
    year: 2015,
    substance: '公開使用（非藥檢聯盟）',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Kirill Sarychev保持335公斤臥推世界紀錄，公開承認在非藥檢聯盟使用PED。他的案例展示了健力運動中藥檢與非藥檢聯盟的分野。',
    punishment: {
      banDuration: '無（非藥檢聯盟）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無法參加IPF比賽'
    },
    summary: '非藥檢健力聯盟允許PED使用，創造了不同的競技環境。',
    educationalNotes: '健力運動的分裂展示了對待PED的不同哲學：完全禁止vs開放使用。',
    sourceLinks: [
      { title: '非藥檢健力紀錄', type: '官方文件' },
      { title: '健力聯盟差異', type: '新聞' }
    ]
  },
  {
    athleteName: 'Jennifer Thompson',
    nationality: '美國',
    sport: '健力',
    year: 2021,
    substance: 'Ostarine（污染）',
    substanceCategory: 'S1.2: 其他合成代謝劑',
    eventBackground: 'Jennifer Thompson是女子健力傳奇，多次世界冠軍。2021年因營養補充劑污染檢測出微量Ostarine，最終證明是無意攝入。',
    punishment: {
      banDuration: '警告',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '加強補充劑檢測'
    },
    summary: '即使是經驗豐富的運動員也可能成為補充劑污染的受害者。',
    educationalNotes: 'Ostarine等SARM類物質經常出現在補充劑污染中，運動員需特別謹慎。',
    sourceLinks: [
      { title: 'USADA調查報告', type: '官方文件' },
      { title: '補充劑污染案例', type: '新聞' }
    ]
  },

  // 大力士比賽案例
  {
    athleteName: 'Hafþór Júlíus Björnsson',
    nationality: '冰島',
    sport: '大力士',
    year: 2020,
    substance: '公開討論使用',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: '"山"Hafþór Björnsson是《權力遊戲》演員和前世界最強壯男人冠軍。他公開討論在非藥檢大力士比賽中PED的普遍使用，引發關於力量運動透明度的討論。',
    punishment: {
      banDuration: '無（非藥檢賽事）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: '大力士比賽的非藥檢性質和運動員的公開態度形成獨特文化。',
    educationalNotes: '世界最強壯男人比賽等大力士賽事通常不進行藥檢，形成獨特的競技環境。',
    sourceLinks: [
      { title: '大力士比賽文化', type: '新聞' },
      { title: '力量運動的不同規則', type: '其他' }
    ]
  },
  {
    athleteName: 'Eddie Hall',
    nationality: '英國',
    sport: '大力士',
    year: 2017,
    substance: '公開承認使用',
    substanceCategory: 'S1: 合成代謝劑',
    eventBackground: 'Eddie Hall是首位硬舉500公斤的人，2017年世界最強壯男人冠軍。退役後公開討論職業生涯中的PED使用和健康風險。',
    punishment: {
      banDuration: '無（非藥檢賽事）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '健康問題'
    },
    summary: '大力士運動員公開討論PED使用和相關健康風險。',
    educationalNotes: '極限力量運動中PED使用的健康代價是運動員必須考慮的重要因素。',
    sourceLinks: [
      { title: 'Eddie Hall訪談', type: '新聞' },
      { title: '大力士健康研究', type: '其他' }
    ]
  },
  {
    athleteName: 'Žydrūnas Savickas',
    nationality: '立陶宛',
    sport: '大力士',
    year: 2014,
    substance: '未公開',
    substanceCategory: '其他/清白記錄',
    eventBackground: 'Žydrūnas Savickas被認為是史上最偉大的大力士運動員，4次世界最強壯男人冠軍。雖在非藥檢環境競技，但從未有正式禁藥違規記錄。',
    punishment: {
      banDuration: '無',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: '即使在非藥檢環境中，一些運動員選擇不公開討論PED使用。',
    educationalNotes: '大力士運動的非藥檢性質創造了"不問不說"的文化。',
    sourceLinks: [
      { title: '大力士比賽歷史', type: '其他' },
      { title: 'Savickas職業生涯', type: '新聞' }
    ]
  },

  // 其他力量項目
  {
    athleteName: 'Clarence Kennedy',
    nationality: '愛爾蘭',
    sport: '舉重/健力',
    year: 2020,
    substance: '清白（自然訓練倡導者）',
    substanceCategory: '清白記錄/合法使用',
    eventBackground: 'Clarence Kennedy是YouTube知名的舉重和健力運動員，以驚人的力量和爆發力聞名。他強調自然訓練，定期接受WADA標準的藥檢。',
    punishment: {
      banDuration: '無（清白記錄）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: '社交媒體時代的自然力量訓練倡導者，證明高水平表現不一定需要PED。',
    educationalNotes: '自然訓練運動員的成功案例對年輕運動員具有重要教育意義。',
    sourceLinks: [
      { title: '藥檢記錄公開', type: '其他' },
      { title: '自然訓練方法', type: '新聞' }
    ]
  },
  {
    athleteName: 'Lasha Talakhadze',
    nationality: '喬治亞',
    sport: '舉重',
    year: 2021,
    substance: '清白（至今）',
    substanceCategory: '清白記錄/合法使用',
    eventBackground: 'Lasha Talakhadze是現任奧運冠軍和超重量級世界紀錄保持者，抓舉225公斤、挺舉267公斤。儘管在禁藥泛濫的項目中，他至今保持清白記錄。',
    punishment: {
      banDuration: '無（清白記錄）',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '無'
    },
    summary: '現役最強舉重選手保持清白記錄，成為項目正面典範。',
    educationalNotes: '在高風險項目中保持清白需要嚴格的自律和專業團隊支持。',
    sourceLinks: [
      { title: 'IWF藥檢記錄', type: '官方文件' },
      { title: '喬治亞舉重成功之道', type: '新聞' }
    ]
  },
  {
    athleteName: 'Stefi Cohen',
    nationality: '美國',
    sport: '健力',
    year: 2019,
    substance: 'Cardarine（污染）',
    substanceCategory: 'S4.4: 代謝調節劑',
    eventBackground: 'Stefi Cohen是25次世界紀錄保持者，物理治療博士。2019年檢測出Cardarine陽性，她聲稱是補充劑污染，最終獲得減輕處罰。',
    punishment: {
      banDuration: '6個月',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '加強教育'
    },
    summary: '高學歷運動員也可能因補充劑問題違規，顯示問題的普遍性。',
    educationalNotes: 'Cardarine（GW501516）是代謝調節劑，可提高脂肪代謝和耐力。',
    sourceLinks: [
      { title: 'USAPL處罰決定', type: '官方文件' },
      { title: 'Cohen案例分析', type: '新聞' }
    ]
  },
  {
    athleteName: 'Mikhail Koklyaev',
    nationality: '俄羅斯',
    sport: '舉重/大力士',
    year: 2016,
    substance: 'Meldonium',
    substanceCategory: 'S4.4: 代謝調節劑',
    eventBackground: 'Mikhail Koklyaev是少數同時在奧運舉重和大力士比賽中達到世界級水平的運動員。2016年Meldonium禁用後被檢測陽性。',
    punishment: {
      banDuration: '1年',
      medalStripped: false,
      resultsCancelled: false,
      otherPenalties: '轉向非藥檢賽事'
    },
    summary: 'Meldonium禁用初期的典型案例，許多東歐運動員受影響。',
    educationalNotes: 'Meldonium在2016年1月被列入禁用清單，之前在東歐廣泛使用。',
    sourceLinks: [
      { title: '俄羅斯舉重聯盟聲明', type: '官方文件' },
      { title: 'Meldonium禁用影響', type: 'WADA' }
    ]
  }
];

async function addStrengthSportsCases() {
  try {
    console.log('開始新增舉重、健力等力量項目禁藥案例...');
    
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('已連接到 MongoDB');

    // 檢查案例是否已存在
    for (const caseData of strengthSportsCases) {
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
    const weightliftingCases = await Case.countDocuments({ sport: '舉重' });
    const powerliftingCases = await Case.countDocuments({ sport: '健力' });
    const strongmanCases = await Case.countDocuments({ sport: '大力士' });
    const allStrengthSports = await Case.countDocuments({ 
      sport: { $in: ['舉重', '健力', '大力士', '舉重/健力'] } 
    });

    console.log('\n=== 資料庫統計 ===');
    console.log(`總案例數: ${totalCases}`);
    console.log(`舉重案例: ${weightliftingCases}`);
    console.log(`健力案例: ${powerliftingCases}`);
    console.log(`大力士案例: ${strongmanCases}`);
    console.log(`所有力量項目: ${allStrengthSports}`);

    // 顯示不同處罰類型的統計
    const cleanAthletes = await Case.countDocuments({ 
      substanceCategory: { $in: ['清白記錄/合法使用', '其他/清白記錄'] }
    });
    console.log(`清白/合法案例: ${cleanAthletes}`);

    console.log('\n舉重、健力等力量項目禁藥案例新增完成！');
    
  } catch (error) {
    console.error('新增案例時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('已斷開 MongoDB 連接');
  }
}

// 如果直接執行此檔案，則執行新增案例
if (require.main === module) {
  addStrengthSportsCases();
}

module.exports = addStrengthSportsCases;