const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 階段三：趨勢與平衡案例 - 新型禁藥、地域平衡、運動項目多樣性
const phase3Cases = [
  {
    athleteName: 'Ryan Crouser',
    nationality: '美國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國鉛球世界紀錄保持者在力量項目中保持清白，證明自然訓練的可能性。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Clean Sport',
        url: 'https://www.worldathletics.org/integrity-unit/clean-sport',
        type: 'WADA'
      }
    ],
    summary: '力量項目典範：在高風險項目中的清白競技。',
    educationalNotes: '即使在類固醇使用盛行的力量項目，仍有運動員堅持自然訓練。'
  },
  {
    athleteName: 'Mikaela Shiffrin',
    nationality: '美國',
    sport: '高山滑雪',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國高山滑雪巨星在整個職業生涯保持清白，成為冬季運動典範。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'FIS Anti-Doping Programme',
        url: 'https://www.fis-ski.com/en/inside-fis/integrity/anti-doping',
        type: '官方文件'
      }
    ],
    summary: '冬季運動典範：高山滑雪的清白代表。',
    educationalNotes: '技術性冬季運動項目的清白競技典範。'
  },
  {
    athleteName: 'Kelvin Kiptum',
    nationality: '肯亞',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '已故肯亞馬拉松世界紀錄保持者在短暫但輝煌的生涯中保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Kelvin Kiptum',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '非洲典範：肯亞馬拉松的清白傳奇。',
    educationalNotes: '東非長跑運動員可以在不使用EPO的情況下創造世界紀錄。'
  },
  {
    athleteName: 'Katie Ledecky',
    nationality: '美國',
    sport: '游泳',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國游泳傳奇在長期統治地位中保持清白，面對各種質疑仍堅持誠信。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'USA Swimming Clean Sport',
        url: 'https://www.usaswimming.org/safe-sport/clean-sport',
        type: '官方文件'
      }
    ],
    summary: '游泳統治者：長期保持清白的統治地位。',
    educationalNotes: '在游泳等耐力項目中，清白運動員仍可達到前所未有的統治地位。'
  },
  {
    athleteName: 'Tadej Pogačar',
    nationality: '斯洛維尼亞',
    sport: '自行車',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '斯洛維尼亞自行車手在EPO陰霾籠罩的運動中保持清白，重新定義現代自行車競技。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'UCI Anti-Doping Programme',
        url: 'https://www.uci.org/inside-uci/clean-sport',
        type: '官方文件'
      }
    ],
    summary: '自行車新時代：後EPO時代的清白統治者。',
    educationalNotes: '現代自行車運動可以在嚴格反禁藥監管下達到新的競技高峰。'
  },
  {
    athleteName: 'Novak Djokovic',
    nationality: '塞爾維亞',
    sport: '網球',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '網球GOAT候選人在整個職業生涯保持清白，但曾因反疫苗立場引發爭議。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'ITF Tennis Anti-Doping Programme',
        url: 'https://www.itftennis.com/en/about-us/tennis-anti-doping-programme/',
        type: '官方文件'
      }
    ],
    summary: '網球傳奇：職業網球的清白典範。',
    educationalNotes: '頂級網球運動員的清白職業生涯展現個人品格的重要性。'
  },
  {
    athleteName: 'Armand Duplantis',
    nationality: '瑞典',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '瑞典撐竿跳世界紀錄保持者在技術性項目中保持清白，不斷突破人類極限。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Mondo Duplantis',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '技術項目典範：撐竿跳的清白天才。',
    educationalNotes: '技術性田徑項目的成功更多依賴技術和天賦而非禁藥。'
  },
  {
    athleteName: 'Eliud Kipchoge',
    nationality: '肯亞',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '馬拉松傳奇在破2小時壯舉和多次奧運勝利中保持清白，成為人類極限的象徵。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Eliud Kipchoge',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '馬拉松之神：人類極限的清白追求者。',
    educationalNotes: '人類運動極限的突破可以通過清白的訓練和競技實現。'
  },
  {
    athleteName: 'Caeleb Dressel',
    nationality: '美國',
    sport: '游泳',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國短距離游泳之王在東京奧運五金輝煌中保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'USA Swimming Anti-Doping',
        url: 'https://www.usaswimming.org/',
        type: '官方文件'
      }
    ],
    summary: '短距離游泳：爆發力項目的清白統治者。',
    educationalNotes: '短距離游泳的成功主要依賴天賦、技術和訓練，而非禁藥。'
  },
  {
    athleteName: 'Karsten Warholm',
    nationality: '挪威',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '挪威400公尺跨欄世界紀錄保持者在突破人類極限時保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Karsten Warholm',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '跨欄革命：技術創新與清白競技的結合。',
    educationalNotes: '技術創新和訓練方法革新可以在清白狀態下創造驚人成績。'
  },
  {
    athleteName: 'Sydney McLaughlin-Levrone',
    nationality: '美國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國女子400公尺跨欄世界紀錄保持者在多次破紀錄中保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'USADA Sydney McLaughlin',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '女子跨欄：年輕世代的清白典範。',
    educationalNotes: '年輕運動員可以從職業生涯開始就建立清白競技的基礎。'
  },
  {
    athleteName: 'Gianmarco Tamberi',
    nationality: '義大利',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '義大利跳高奧運冠軍在技術性項目中保持清白，展現歐洲田徑的復興。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'European Athletics Integrity',
        url: 'https://www.european-athletics.com/',
        type: '官方文件'
      }
    ],
    summary: '歐洲復興：義大利田徑的清白代表。',
    educationalNotes: '歐洲田徑在嚴格反禁藥制度下重新崛起。'
  },
  {
    athleteName: 'Faith Kipyegon',
    nationality: '肯亞',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '肯亞女子1500公尺世界紀錄保持者在中長距離統治中保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'Athletics Kenya Anti-Doping',
        url: 'https://athleticskenya.or.ke/',
        type: '官方文件'
      }
    ],
    summary: '肯亞女子中距離：東非女性運動員的清白典範。',
    educationalNotes: '非洲女子中長跑運動員展現自然天賦與清白競技的結合。'
  },
  {
    athleteName: 'Lasha Talakhadze',
    nationality: '喬治亞',
    sport: '舉重',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '喬治亞舉重巨星在禁藥盛行的項目中保持相對清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'IWF Anti-Doping Programme',
        url: 'https://iwf.sport/anti-doping/',
        type: '官方文件'
      }
    ],
    summary: '舉重清流：高風險項目中的相對清白。',
    educationalNotes: '即使在舉重等高風險項目，仍有運動員努力保持清白。'
  },
  {
    athleteName: 'Jakob Ingebrigtsen',
    nationality: '挪威',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '挪威中距離天才在1500公尺和5000公尺項目中保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Jakob Ingebrigtsen',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '北歐中距離：挪威長跑的新時代。',
    educationalNotes: '北歐國家在中長距離項目中展現清白競技的可能性。'
  },
  {
    athleteName: 'Bobby Finke',
    nationality: '美國',
    sport: '游泳',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國長距離游泳選手在1500公尺自由式中保持清白統治地位。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'USA Swimming Clean Sport',
        url: 'https://www.usaswimming.org/',
        type: '官方文件'
      }
    ],
    summary: '長距離游泳：耐力項目的清白競技。',
    educationalNotes: '長距離游泳項目證明耐力運動可以不依賴EPO等禁藥。'
  },
  {
    athleteName: 'Nathan Chen',
    nationality: '美國',
    sport: '花式滑冰',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國男子花式滑冰奧運冠軍在技術革命中保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'ISU Anti-Doping Rules',
        url: 'https://www.isu.org/inside-isu/rules-regulations/anti-doping',
        type: '官方文件'
      }
    ],
    summary: '花滑技術革命：藝術與體能的清白結合。',
    educationalNotes: '花式滑冰等藝術性運動項目的清白競技典範。'
  },
  {
    athleteName: 'Simone Biles',
    nationality: '美國',
    sport: '體操',
    substance: 'TUE使用',
    substanceCategory: '其他',
    year: 2016,
    eventBackground: '美國體操女王因ADHD使用Ritalin，通過合法TUE程序獲得豁免。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '合法TUE使用'
    },
    sourceLinks: [
      {
        title: 'WADA TUE Information Simone Biles',
        url: 'https://www.wada-ama.org/en/questions-answers/therapeutic-use-exemptions-tue',
        type: 'WADA'
      }
    ],
    summary: 'TUE典範：治療用途豁免的正確使用典型。',
    educationalNotes: '運動員可以通過TUE合法使用醫療必需的被禁物質。'
  },
  {
    athleteName: 'LeBron James',
    nationality: '美國',
    sport: '籃球',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: 'NBA巨星在20年職業生涯中保持清白，成為職業體育長壽的典範。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'NBA Anti-Drug Programme',
        url: 'https://www.nba.com/',
        type: '官方文件'
      }
    ],
    summary: '職業體育長壽：20年清白職業生涯的典範。',
    educationalNotes: '職業運動員可以通過清白競技保持長期的高水平表現。'
  },
  {
    athleteName: 'Serena Williams',
    nationality: '美國',
    sport: '網球',
    substance: 'TUE使用',
    substanceCategory: '其他',
    year: 2018,
    eventBackground: '網球傳奇因醫療需要合法使用被禁物質，展現TUE制度的重要性。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '合法醫療使用'
    },
    sourceLinks: [
      {
        title: 'ITF TUE Programme',
        url: 'https://www.itftennis.com/',
        type: '官方文件'
      }
    ],
    summary: 'TUE醫療：職業運動員的合法醫療需求。',
    educationalNotes: 'TUE制度平衡了運動員的醫療需求和競技公平性。'
  }
];

async function addPhase3Cases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    console.log(`Adding ${phase3Cases.length} phase 3 trend and balance cases...`);

    // Insert phase 3 cases
    const insertedCases = await Case.insertMany(phase3Cases);
    console.log(`Successfully added ${insertedCases.length} phase 3 trend and balance cases`);

    // Update related cases
    for (let i = 0; i < insertedCases.length; i++) {
      const currentCase = insertedCases[i];
      
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

    console.log('Updated related cases for phase 3');
    
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    console.log('Phase 3 trend and balance cases successfully added!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding phase 3 cases:', error);
    process.exit(1);
  }
}

addPhase3Cases();