const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 階段二：教育價值案例 - 不同禁藥類型、處罰程度和特殊情況的代表性案例
const phase2Cases = [
  {
    athleteName: 'Neeraj Chopra',
    nationality: '印度',
    sport: '田徑',
    substance: '清白',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '印度標槍奧運冠軍始終保持清白記錄，成為亞洲反禁藥典範運動員。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Clean Athlete Programme',
        url: 'https://www.worldathletics.org/integrity-unit/clean-sport',
        type: 'WADA'
      }
    ],
    summary: '積極典範：印度首位田徑奧運冠軍的清白典範。',
    educationalNotes: '展示運動員如何在高水平競技中保持清白，成為反禁藥教育的正面典範。'
  },
  {
    athleteName: 'Lizzie Deignan',
    nationality: '英國',
    sport: '自行車',
    substance: 'Whereabouts Failure (後翻案)',
    substanceCategory: '其他',
    year: 2016,
    eventBackground: '英國自行車選手因錯過三次藥檢被禁賽，但成功上訴證明其中一次記錄有誤。',
    punishment: {
      banDuration: '2年 (後撤銷)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '成功翻案，恢復所有資格'
    },
    sourceLinks: [
      {
        title: 'CAS Lizzie Deignan Decision',
        url: 'https://www.tas-cas.org/',
        type: '官方文件'
      }
    ],
    summary: '成功翻案：whereabouts違規的申訴成功案例。',
    educationalNotes: '展示運動員申訴權利的重要性，錯誤指控可以被糾正。'
  },
  {
    athleteName: 'Therese Johaug',
    nationality: '挪威',
    sport: '越野滑雪',
    substance: 'Clostebol',
    substanceCategory: '類固醇',
    year: 2016,
    eventBackground: '挪威越野滑雪女王因使用隊醫提供的唇部藥膏意外攝入clostebol，展現支援團隊責任。',
    punishment: {
      banDuration: '18個月',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '錯過平昌冬奧'
    },
    sourceLinks: [
      {
        title: 'FIS Therese Johaug Decision',
        url: 'https://www.fis-ski.com/en/inside-fis/news-multimedia/news/therese-johaug-suspension',
        type: '官方文件'
      }
    ],
    summary: '支援團隊責任：醫療人員失誤導致的違規。',
    educationalNotes: '運動員對支援團隊提供的所有物質負最終責任，包括看似無害的外用藥品。'
  },
  {
    athleteName: 'Gil Roberts',
    nationality: '美國',
    sport: '田徑',
    substance: 'Probenecid',
    substanceCategory: '利尿劑',
    year: 2016,
    eventBackground: '美國4x400公尺接力選手因使用處方藥治療痛風，但該藥含有禁用的利尿劑成分。',
    punishment: {
      banDuration: '無 (獲得TUE)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '後續獲得治療用途豁免'
    },
    sourceLinks: [
      {
        title: 'USADA Gil Roberts TUE Case',
        url: 'https://www.usada.org/news/gil-roberts-receives-no-fault-finding/',
        type: 'WADA'
      }
    ],
    summary: 'TUE教育：治療用途豁免的正確使用。',
    educationalNotes: '合法的醫療需求可通過TUE(治療用途豁免)來平衡競技公平和健康需要。'
  },
  {
    athleteName: 'Kenenisa Bekele',
    nationality: '衣索比亞',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '長跑傳奇在整個職業生涯保持清白記錄，證明頂尖耐力運動可不依賴禁藥。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Integrity Unit',
        url: 'https://www.athleticsintegrity.org/',
        type: 'WADA'
      }
    ],
    summary: '清白典範：頂尖耐力運動員的誠信典範。',
    educationalNotes: '在EPO濫用普遍的耐力項目中，仍有運動員堅持清白競技。'
  },
  {
    athleteName: 'Blessing Okagbare',
    nationality: '奈及利亞',
    sport: '田徑',
    substance: 'EPO, HGH',
    substanceCategory: 'EPO',
    year: 2021,
    eventBackground: '奈及利亞短跑選手在東京奧運期間被發現使用多種禁藥，包括EPO和生長激素。',
    punishment: {
      banDuration: '10年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '職業生涯實質終結'
    },
    sourceLinks: [
      {
        title: 'AIU Blessing Okagbare Decision',
        url: 'https://www.athleticsintegrity.org/news/blessing-okagbare-banned-for-10-years',
        type: 'WADA'
      }
    ],
    summary: '重罰案例：組合使用多種禁藥的嚴厲後果。',
    educationalNotes: '同時使用多種不同類型禁藥會導致最嚴厲的處罰。'
  },
  {
    athleteName: 'Park Tae-hwan',
    nationality: '南韓',
    sport: '游泳',
    substance: 'Testosterone',
    substanceCategory: '類固醇',
    year: 2014,
    eventBackground: '韓國游泳巨星聲稱是在中國接受針灸治療時意外攝入睪固酮。',
    punishment: {
      banDuration: '18個月',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '幾乎錯過里約奧運'
    },
    sourceLinks: [
      {
        title: 'FINA Park Tae-hwan Decision',
        url: 'https://www.fina.org/',
        type: '官方文件'
      }
    ],
    summary: '針灸治療：傳統醫學中的意外違規風險。',
    educationalNotes: '傳統醫學治療可能含有未知的禁用物質，運動員需格外謹慎。'
  },
  {
    athleteName: 'Claudia Pechstein',
    nationality: '德國',
    sport: '競速滑冰',
    substance: 'Blood Doping (指控)',
    substanceCategory: '血液興奮劑',
    year: 2009,
    eventBackground: '德國競速滑冰傳奇因血液數值異常被懷疑血液興奮劑，但始終否認並聲稱是遺傳因素。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '損失2010溫哥華冬奧'
    },
    sourceLinks: [
      {
        title: 'ISU Claudia Pechstein Case',
        url: 'https://www.isu.org/',
        type: '官方文件'
      }
    ],
    summary: '生物護照：血液數值異常的爭議判決。',
    educationalNotes: '生物護照系統監測運動員長期生理數值變化，異常波動可能被視為禁藥使用證據。'
  },
  {
    athleteName: 'Adam Peaty',
    nationality: '英國',
    sport: '游泳',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '英國蛙式世界紀錄保持者積極倡導反禁藥，公開支持更嚴格的檢測制度。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'Swimming Clean Sport Initiative',
        url: 'https://www.fina.org/content/clean-swimming',
        type: '官方文件'
      }
    ],
    summary: '反禁藥倡導者：運動員主動推動清白競技。',
    educationalNotes: '頂尖運動員可以成為反禁藥運動的積極推動者和倡導者。'
  },
  {
    athleteName: 'Dennis Mitchell',
    nationality: '美國',
    sport: '田徑',
    substance: 'Testosterone (歷史案例)',
    substanceCategory: '類固醇',
    year: 1998,
    eventBackground: '前美國短跑選手聲稱睪固酮升高是因為"大量啤酒和性行為"導致，成為荒謬辯護的典型例子。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '辯護被廣泛嘲笑'
    },
    sourceLinks: [
      {
        title: 'IAAF Dennis Mitchell Case',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '荒謬辯護：不可信辯護的典型案例。',
    educationalNotes: '不切實際的辯護會被科學證據反駁，誠實面對違規更有利於減輕處罰。'
  },
  {
    athleteName: 'LaShawn Merritt',
    nationality: '美國',
    sport: '田徑',
    substance: 'DHEA, Pregnenolone',
    substanceCategory: '類固醇',
    year: 2010,
    eventBackground: '美國400公尺奧運冠軍因使用男性增強產品意外攝入DHEA等荷爾蒙前驅物。',
    punishment: {
      banDuration: '21個月',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '減刑因配合調查'
    },
    sourceLinks: [
      {
        title: 'USADA LaShawn Merritt Decision',
        url: 'https://www.usada.org/news/lashawn-merritt-accepts-21-month-sanction/',
        type: 'WADA'
      }
    ],
    summary: '補充品風險：男性增強產品的隱藏禁藥。',
    educationalNotes: '性功能增強產品常含有未標示的荷爾蒙類禁用物質。'
  },
  {
    athleteName: 'Yohan Blake',
    nationality: '牙買加',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '牙買加短跑選手在同期多位隊友違規的情況下保持清白，展現個人品格的重要性。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'JADCO Clean Athlete Programme',
        url: 'https://www.jadcoard.com/',
        type: '官方文件'
      }
    ],
    summary: '環境抗壓：在高風險環境中保持清白。',
    educationalNotes: '即使在禁藥使用普遍的環境中，運動員仍可選擇保持清白。'
  },
  {
    athleteName: 'Cecilia Brækhus',
    nationality: '挪威',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '女子拳擊統一冠軍在整個職業生涯保持清白，成為女性運動員的典範。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'IBF Clean Boxing Initiative',
        url: 'https://www.ibf-usba-boxing.com/',
        type: '官方文件'
      }
    ],
    summary: '女性典範：女子拳擊的清白典範。',
    educationalNotes: '女性運動員在男性主導的運動中也能堅持清白競技原則。'
  },
  {
    athleteName: 'Mo Farah',
    nationality: '英國',
    sport: '田徑',
    substance: '清白 (但涉入爭議)',
    substanceCategory: '其他',
    year: 2017,
    eventBackground: '英國長跑巨星雖然本人清白，但因與涉藥教練Alberto Salazar的關係而受到質疑。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '道德質疑但無法律後果'
    },
    sourceLinks: [
      {
        title: 'UK Anti-Doping Mo Farah Investigation',
        url: 'https://www.ukad.org.uk/',
        type: '官方文件'
      }
    ],
    summary: '關聯風險：與涉藥人員的關聯風險。',
    educationalNotes: '運動員需謹慎選擇教練和支援團隊，避免與有問題人員的關聯。'
  },
  {
    athleteName: 'Allyson Felix',
    nationality: '美國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國短跑傳奇在整個職業生涯保持清白，退役後積極推動反禁藥教育。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'USADA Allyson Felix Clean Sport Ambassador',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '退役倡導：退役運動員的反禁藥教育貢獻。',
    educationalNotes: '清白的退役運動員可以成為下一代的重要反禁藥教育者。'
  }
];

async function addPhase2Cases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    console.log(`Adding ${phase2Cases.length} phase 2 educational cases...`);

    // Insert phase 2 cases
    const insertedCases = await Case.insertMany(phase2Cases);
    console.log(`Successfully added ${insertedCases.length} phase 2 educational cases`);

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

    console.log('Updated related cases for phase 2');
    
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    console.log('Phase 2 educational cases successfully added!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding phase 2 cases:', error);
    process.exit(1);
  }
}

addPhase2Cases();