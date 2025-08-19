const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 階段三：2000年代BALCO時代 - 設計類固醇與現代反禁藥的開端
const era2000sCases = [
  {
    athleteName: 'Victor Conte',
    nationality: '美國',
    sport: '禁藥供應',
    substance: 'BALCO創辦人',
    substanceCategory: '其他',
    year: 2003,
    eventBackground: 'BALCO實驗室創辦人，為眾多頂尖運動員提供未檢測的設計類固醇THG等禁藥。',
    punishment: {
      banDuration: '4個月監禁',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '改變美國反禁藥歷史'
    },
    sourceLinks: [
      {
        title: 'Victor Conte BALCO Scandal',
        url: 'https://www.usada.org/balco-scandal/',
        type: 'WADA'
      }
    ],
    summary: 'BALCO教父：現代設計類固醇的始作俑者。',
    educationalNotes: 'BALCO醜聞揭露了如何利用科技漏洞創造無法檢測的禁藥。'
  },
  {
    athleteName: 'Patrick Arnold',
    nationality: '美國',
    sport: '化學家',
    substance: 'THG設計者',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: '化學家，THG（The Clear）的發明者，專門設計無法被檢測的類固醇。',
    punishment: {
      banDuration: '3個月監禁',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '禁藥化學設計的里程碑'
    },
    sourceLinks: [
      {
        title: 'Patrick Arnold THG Creator',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '設計類固醇之父：THG的化學設計者。',
    educationalNotes: 'THG是第一個被發現的"設計類固醇"，專門為逃避檢測而創造。'
  },
  {
    athleteName: 'Greg Anderson',
    nationality: '美國',
    sport: '教練/供應者',
    substance: 'BALCO供應商',
    substanceCategory: '其他',
    year: 2003,
    eventBackground: 'Barry Bonds的私人教練，BALCO禁藥的主要分發者之一。',
    punishment: {
      banDuration: '3個月監禁',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '拒絕作證多次入獄'
    },
    sourceLinks: [
      {
        title: 'Greg Anderson BALCO Trainer',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: 'BALCO分發者：連接實驗室與運動員的橋樑。',
    educationalNotes: '私人教練和經紀人在禁藥供應鏈中扮演關鍵角色。'
  },
  {
    athleteName: 'Barry Bonds',
    nationality: '美國',
    sport: '棒球',
    substance: 'THG, The Cream',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'MLB全壘打王，BALCO案核心人物，聲稱不知情使用THG和"The Cream"。',
    punishment: {
      banDuration: '無官方禁賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '名人堂入選受阻'
    },
    sourceLinks: [
      {
        title: 'Barry Bonds BALCO Investigation',
        url: 'https://www.mlb.com/',
        type: '官方文件'
      }
    ],
    summary: '全壘打王陰影：史上最偉大打者的禁藥疑雲。',
    educationalNotes: '即使是體育史上的傳奇人物也無法避免禁藥爭議的影響。'
  },
  {
    athleteName: 'Jason Giambi',
    nationality: '美國',
    sport: '棒球',
    substance: 'THG, 類固醇',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'MLB明星一壘手，在大陪審團前承認使用BALCO提供的類固醇。',
    punishment: {
      banDuration: '無官方禁賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '公開道歉'
    },
    sourceLinks: [
      {
        title: 'Jason Giambi BALCO Testimony',
        url: 'https://www.mlb.com/',
        type: '官方文件'
      }
    ],
    summary: '勇敢承認：BALCO案中主動承認的少數球員。',
    educationalNotes: '主動承認使用禁藥並道歉可能獲得公眾諒解。'
  },
  {
    athleteName: 'Gary Sheffield',
    nationality: '美國',
    sport: '棒球',
    substance: 'THG (聲稱不知情)',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'MLB全明星外野手，聲稱不知情使用了BALCO提供的"營養補品"。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '聲譽受損'
    },
    sourceLinks: [
      {
        title: 'Gary Sheffield BALCO Unknowing Use',
        url: 'https://www.espn.com/',
        type: '新聞'
      }
    ],
    summary: '不知情使用：BALCO案的典型辯護。',
    educationalNotes: '運動員聲稱"不知情使用"在法律上可能成立，但道德上仍有爭議。'
  },
  {
    athleteName: 'Jeremy Giambi',
    nationality: '美國',
    sport: '棒球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'MLB外野手，Jason Giambi的弟弟，同樣涉入BALCO醜聞。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '職業生涯提早結束'
    },
    sourceLinks: [
      {
        title: 'Jeremy Giambi BALCO Connection',
        url: 'https://www.mlb.com/',
        type: '官方文件'
      }
    ],
    summary: '兄弟檔醜聞：家族式的禁藥使用。',
    educationalNotes: 'BALCO案顯示禁藥使用常常以社交網絡形式傳播。'
  },
  {
    athleteName: 'Armando Rios',
    nationality: '美國',
    sport: '棒球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'MLB外野手，BALCO客戶名單中的球員之一。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '職業生涯影響'
    },
    sourceLinks: [
      {
        title: 'Armando Rios BALCO List',
        url: 'https://www.sfgate.com/',
        type: '新聞'
      }
    ],
    summary: 'BALCO名單：眾多涉入球員之一。',
    educationalNotes: 'BALCO客戶名單涵蓋多個運動項目的眾多運動員。'
  },
  {
    athleteName: 'Benito Santiago',
    nationality: '波多黎各',
    sport: '棒球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'MLB捕手，BALCO案涉及的波多黎各球員。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '聲譽受損'
    },
    sourceLinks: [
      {
        title: 'Benito Santiago BALCO Case',
        url: 'https://www.mlb.com/',
        type: '官方文件'
      }
    ],
    summary: '國際影響：BALCO的國際擴散。',
    educationalNotes: 'BALCO案顯示美國的禁藥網絡影響到國際運動員。'
  },
  {
    athleteName: 'Bobby Estalella',
    nationality: '美國',
    sport: '棒球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'MLB捕手，BALCO客戶之一，職業生涯後期球員。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '職業生涯結束'
    },
    sourceLinks: [
      {
        title: 'Bobby Estalella BALCO',
        url: 'https://www.baseball-reference.com/',
        type: '新聞'
      }
    ],
    summary: '職業末期誘惑：年長球員的禁藥選擇。',
    educationalNotes: '職業生涯末期的運動員可能因為成績下滑而選擇禁藥。'
  },
  {
    athleteName: 'Marvin Benard',
    nationality: '美國',
    sport: '棒球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'MLB外野手，舊金山巨人隊球員，BALCO案的邊緣人物。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '有限影響'
    },
    sourceLinks: [
      {
        title: 'Marvin Benard Giants BALCO',
        url: 'https://www.sfgate.com/',
        type: '新聞'
      }
    ],
    summary: '邊緣球員：非明星球員的禁藥使用。',
    educationalNotes: '不僅超級巨星，普通球員也會使用禁藥試圖提升表現。'
  },
  {
    athleteName: 'Bill Romanowski',
    nationality: '美國',
    sport: '美式足球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'NFL線衛，四屆超級盃冠軍，BALCO案中的美式足球代表。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '退役後承認'
    },
    sourceLinks: [
      {
        title: 'Bill Romanowski BALCO NFL',
        url: 'https://www.nfl.com/',
        type: '官方文件'
      }
    ],
    summary: '美式足球染指：BALCO擴散到NFL。',
    educationalNotes: 'BALCO案影響不僅限於棒球和田徑，也擴及美式足球。'
  },
  {
    athleteName: 'Dana Stubblefield',
    nationality: '美國',
    sport: '美式足球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'NFL防守球員，前年度最佳防守球員，BALCO案中的NFL明星。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '獎項受質疑'
    },
    sourceLinks: [
      {
        title: 'Dana Stubblefield BALCO',
        url: 'https://www.pro-football-reference.com/',
        type: '新聞'
      }
    ],
    summary: '年度最佳的陰影：獲獎年度的禁藥使用。',
    educationalNotes: '在獲獎年度使用禁藥會對該獎項的合法性造成質疑。'
  },
  {
    athleteName: 'Tyrone Wheatley',
    nationality: '美國',
    sport: '美式足球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'NFL跑衛，BALCO案中涉及的另一位NFL球員。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '職業聲譽受損'
    },
    sourceLinks: [
      {
        title: 'Tyrone Wheatley BALCO NFL',
        url: 'https://www.nfl.com/',
        type: '官方文件'
      }
    ],
    summary: 'NFL普及：美式足球界的禁藥使用。',
    educationalNotes: 'NFL在BALCO時代也面臨嚴重的禁藥問題。'
  },
  {
    athleteName: 'Barrett Robbins',
    nationality: '美國',
    sport: '美式足球',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: 'NFL中鋒，BALCO案中的NFL線鋒代表。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '職業生涯困擾'
    },
    sourceLinks: [
      {
        title: 'Barrett Robbins BALCO',
        url: 'https://www.raiders.com/',
        type: '新聞'
      }
    ],
    summary: '線鋒位置：力量位置的禁藥誘惑。',
    educationalNotes: '需要力量的位置（如線鋒）特別容易受到類固醇的誘惑。'
  },
  {
    athleteName: 'Chris Cooper',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: '美國田徑選手，BALCO案中涉及的田徑運動員之一。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '職業生涯終結'
    },
    sourceLinks: [
      {
        title: 'Chris Cooper BALCO Track',
        url: 'https://www.usatf.org/',
        type: '官方文件'
      }
    ],
    summary: 'BALCO田徑：田徑項目的受害者。',
    educationalNotes: '田徑運動員在BALCO案中受到最嚴厲的處罰。'
  },
  {
    athleteName: 'Chryste Gaines',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: '美國女子短跑選手，2000年奧運4x100公尺接力金牌成員。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '奧運金牌被取消'
    },
    sourceLinks: [
      {
        title: 'Chryste Gaines BALCO Olympic',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '奧運金牌代價：BALCO導致的奧運成績取消。',
    educationalNotes: '個人使用禁藥可能導致整個接力隊的成績被取消。'
  },
  {
    athleteName: 'Michelle Collins',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG, EPO',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: '美國中距離跑者，1500公尺和5000公尺選手，BALCO多種禁藥使用者。',
    punishment: {
      banDuration: '8年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '職業生涯實質終結'
    },
    sourceLinks: [
      {
        title: 'Michelle Collins BALCO Multiple Drugs',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '多重禁藥：同時使用多種禁藥的嚴重後果。',
    educationalNotes: '同時使用類固醇和EPO會導致最嚴厲的處罰。'
  },
  {
    athleteName: 'Alvin Harrison',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: '美國400公尺選手，2000年奧運4x400公尺接力金牌成員。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '接力隊金牌被取消'
    },
    sourceLinks: [
      {
        title: 'Alvin Harrison BALCO Relay',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '接力隊影響：個人違規的團體後果。',
    educationalNotes: '接力隊成員的違規會影響整個團隊的成績。'
  },
  {
    athleteName: 'Calvin Harrison',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG',
    substanceCategory: '類固醇',
    year: 2003,
    eventBackground: '美國400公尺選手，Alvin Harrison的雙胞胎弟弟，同為奧運接力金牌成員。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '兄弟檔同時違規'
    },
    sourceLinks: [
      {
        title: 'Calvin Harrison BALCO Twin',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '雙胞胎違規：家族式禁藥使用模式。',
    educationalNotes: 'BALCO案中出現多組家族成員同時違規的情況。'
  }
];

async function addEra2000sCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    console.log(`Adding ${era2000sCases.length} 2000s BALCO era cases...`);

    // Insert 2000s era cases
    const insertedCases = await Case.insertMany(era2000sCases);
    console.log(`Successfully added ${insertedCases.length} 2000s BALCO era cases`);

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

    console.log('Updated related cases for 2000s BALCO era');
    
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    console.log('2000s BALCO era cases successfully added!');
    console.log('Progress: Stage 3 of 4 completed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding 2000s BALCO era cases:', error);
    process.exit(1);
  }
}

addEra2000sCases();