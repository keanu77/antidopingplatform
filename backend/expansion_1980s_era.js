const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 階段一：1980年代經典時代 - 禁藥史的奠基時期
const era1980sCases = [
  {
    athleteName: '東德女子游泳隊',
    nationality: '東德',
    sport: '游泳',
    substance: 'Oral-Turinabol, 睪固酮',
    substanceCategory: '類固醇',
    year: 1988,
    eventBackground: '東德系統性國家禁藥計劃的核心，特別針對女子游泳項目，使用未被檢測的合成代謝類固醇。',
    punishment: {
      banDuration: '歷史案例',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '1990年德國統一後才曝光，無法追溯處罰'
    },
    sourceLinks: [
      {
        title: 'East German Doping System Documentation',
        url: 'https://www.wada-ama.org/en/what-we-do/science-medical/prohibited-list/history',
        type: 'WADA'
      }
    ],
    summary: '國家級系統性禁藥：東德模式的典型代表。',
    educationalNotes: '國家支持的系統性禁藥對運動員造成長期健康損害，特別是女性運動員的男性化副作用。'
  },
  {
    athleteName: 'Petra Schneider',
    nationality: '東德',
    sport: '游泳',
    substance: 'Oral-Turinabol',
    substanceCategory: '類固醇',
    year: 1980,
    eventBackground: '東德女子400公尺個人混合式世界紀錄保持者，後來承認被迫使用禁藥。',
    punishment: {
      banDuration: '無 (當時未檢出)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '健康受到永久損害'
    },
    sourceLinks: [
      {
        title: 'East German Swimming Doping Victims',
        url: 'https://www.swimswam.com/east-german-doping-victims/',
        type: '新聞'
      }
    ],
    summary: '受害者典型：被迫使用禁藥的運動員。',
    educationalNotes: '許多東德運動員是國家禁藥制度的受害者，在不知情的情況下被迫使用禁藥。'
  },
  {
    athleteName: 'Rica Reinisch',
    nationality: '東德',
    sport: '游泳',
    substance: 'Oral-Turinabol',
    substanceCategory: '類固醇',
    year: 1980,
    eventBackground: '1980年莫斯科奧運會三金得主，15歲就被納入東德禁藥系統。',
    punishment: {
      banDuration: '無 (當時未檢出)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '後來公開譴責東德制度'
    },
    sourceLinks: [
      {
        title: 'Rica Reinisch Doping Testimony',
        url: 'https://www.olympic.org/rica-reinisch',
        type: '官方文件'
      }
    ],
    summary: '未成年受害者：最年輕的系統性禁藥受害者之一。',
    educationalNotes: '未成年運動員更容易成為系統性禁藥的受害者，對身心發展造成嚴重影響。'
  },
  {
    athleteName: 'Marita Koch',
    nationality: '東德',
    sport: '田徑',
    substance: 'Oral-Turinabol (疑似)',
    substanceCategory: '類固醇',
    year: 1985,
    eventBackground: '女子400公尺世界紀錄保持者至今，其紀錄因東德禁藥背景而備受質疑。',
    punishment: {
      banDuration: '無證據確鑿',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '紀錄合法性永久受質疑'
    },
    sourceLinks: [
      {
        title: 'Marita Koch 400m World Record Controversy',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '爭議紀錄：至今仍存在的可疑世界紀錄。',
    educationalNotes: '某些在系統性禁藥時代創造的紀錄至今仍然存在，其合法性備受質疑。'
  },
  {
    athleteName: 'Jarmila Kratochvílová',
    nationality: '捷克斯洛伐克',
    sport: '田徑',
    substance: '類固醇 (疑似)',
    substanceCategory: '類固醇',
    year: 1983,
    eventBackground: '女子800公尺世界紀錄保持者至今，1983年創造的紀錄被認為幾乎不可能被超越。',
    punishment: {
      banDuration: '無確鑿證據',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '紀錄的真實性備受爭議'
    },
    sourceLinks: [
      {
        title: 'Jarmila Kratochvilova 800m World Record',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '不可能的紀錄：40年來無人能接近的紀錄。',
    educationalNotes: '某些在1980年代創造的紀錄因其"超人"性質而被懷疑與禁藥有關。'
  },
  {
    athleteName: 'Tamara Press',
    nationality: '蘇聯',
    sport: '田徑',
    substance: '睪固酮 (疑似)',
    substanceCategory: '類固醇',
    year: 1966,
    eventBackground: '蘇聯投擲選手在1966年性別檢測開始後神秘退役，引發禁藥使用猜測。',
    punishment: {
      banDuration: '無 (自行退役)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '避開性別檢測'
    },
    sourceLinks: [
      {
        title: 'Soviet Athletics Gender Testing Era',
        url: 'https://www.iaaf.org/heritage',
        type: '官方文件'
      }
    ],
    summary: '性別檢測時代：早期禁藥使用的間接證據。',
    educationalNotes: '性別檢測的引入間接揭露了早期類固醇使用對女性運動員外觀的影響。'
  },
  {
    athleteName: 'Irina Press',
    nationality: '蘇聯',
    sport: '田徑',
    substance: '睪固酮 (疑似)',
    substanceCategory: '類固醇',
    year: 1966,
    eventBackground: '蘇聯五項全能和80公尺跨欄選手，與姊姊Tamara同時在性別檢測前退役。',
    punishment: {
      banDuration: '無 (自行退役)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: 'Press姊妹現象'
    },
    sourceLinks: [
      {
        title: 'Press Sisters Olympic Legacy',
        url: 'https://www.olympic.org/',
        type: '官方文件'
      }
    ],
    summary: '姊妹檔疑雲：早期系統性使用的典型案例。',
    educationalNotes: '蘇聯時代的運動員經常以"家族"形式參與禁藥使用，反映制度性問題。'
  },
  {
    athleteName: 'Evelyn Ashford',
    nationality: '美國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 1988,
    eventBackground: '美國短跑選手在Ben Johnson事件後成為清白競技的象徵，多次接受額外檢測證明清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'Evelyn Ashford Clean Athletics',
        url: 'https://www.usatf.org/',
        type: '官方文件'
      }
    ],
    summary: '清白典範：1980年代的誠信競技代表。',
    educationalNotes: '在禁藥盛行的年代，仍有運動員堅持清白競技，成為正面典範。'
  },
  {
    athleteName: 'Florence Griffith-Joyner',
    nationality: '美國',
    sport: '田徑',
    substance: '爭議性清白',
    substanceCategory: '其他',
    year: 1988,
    eventBackground: '美國短跑女王創造至今未破的100m和200m世界紀錄，但突然的成績提升引發質疑。',
    punishment: {
      banDuration: '無 (未證實)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '終身受到質疑'
    },
    sourceLinks: [
      {
        title: 'Florence Griffith Joyner Doping Allegations',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '爭議傳奇：清白但備受質疑的超級成績。',
    educationalNotes: '即使沒有陽性檢測，突然的成績躍升也會引發禁藥使用的質疑。'
  },
  {
    athleteName: 'Carl Lewis',
    nationality: '美國',
    sport: '田徑',
    substance: 'Pseudoephedrine, Ephedrine, Phenylpropanolamine',
    substanceCategory: '興奮劑',
    year: 1988,
    eventBackground: '1988年美國選拔賽檢出微量興奮劑，但被認定為感冒藥物的非故意使用。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '2003年才公開此事'
    },
    sourceLinks: [
      {
        title: 'Carl Lewis 1988 Positive Test Documents',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '隱藏的陽性：15年後才曝光的檢測結果。',
    educationalNotes: '感冒藥物可能含有禁用物質，運動員需要謹慎使用所有藥物。'
  },
  {
    athleteName: 'Joachim Kunz',
    nationality: '東德',
    sport: '田徑',
    substance: 'Oral-Turinabol',
    substanceCategory: '類固醇',
    year: 1980,
    eventBackground: '東德標槍選手，東德男子田徑禁藥系統的代表人物。',
    punishment: {
      banDuration: '無 (當時未檢出)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '1990年後承認使用禁藥'
    },
    sourceLinks: [
      {
        title: 'East German Athletics Doping Program',
        url: 'https://www.iaaf.org/',
        type: '官方文件'
      }
    ],
    summary: '東德男子田徑：系統性禁藥的男子代表。',
    educationalNotes: '東德的禁藥系統不僅針對女性運動員，男性運動員也是受害者。'
  },
  {
    athleteName: 'Renaldo Nehemiah',
    nationality: '美國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 1981,
    eventBackground: '美國110公尺跨欄世界紀錄保持者，在1980年代保持清白競技典範。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'Renaldo Nehemiah Clean Records',
        url: 'https://www.usatf.org/',
        type: '官方文件'
      }
    ],
    summary: '技術典範：跨欄技術革新的清白代表。',
    educationalNotes: '技術革新可以在不使用禁藥的情況下大幅提升成績。'
  },
  {
    athleteName: 'Edwin Moses',
    nationality: '美國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 1988,
    eventBackground: '400公尺跨欄傳奇，122場連勝紀錄，積極推動反禁藥運動。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '反禁藥運動先驅'
    },
    sourceLinks: [
      {
        title: 'Edwin Moses Anti-Doping Advocacy',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '反禁藥先驅：運動員中的反禁藥倡導者。',
    educationalNotes: '運動員可以成為反禁藥運動的積極推動者和倡導者。'
  },
  {
    athleteName: 'Sebastian Coe',
    nationality: '英國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 1986,
    eventBackground: '英國中距離傳奇，1500公尺和800公尺世界紀錄創造者，終身保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'Sebastian Coe Clean Athletics Legacy',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '英倫典範：英國田徑的清白象徵。',
    educationalNotes: '歐洲運動員在1980年代展現了清白競技的可能性。'
  },
  {
    athleteName: 'Steve Cram',
    nationality: '英國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 1985,
    eventBackground: '英國中距離跑者，1500公尺前世界紀錄保持者，與Coe和Ovett形成清白競爭。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'Steve Cram Middle Distance Legacy',
        url: 'https://www.britishathletics.org.uk/',
        type: '官方文件'
      }
    ],
    summary: '中距離三傑：英國中距離的黃金時代。',
    educationalNotes: '競爭激烈的項目中，運動員仍可保持清白並創造優異成績。'
  },
  {
    athleteName: 'Steve Ovett',
    nationality: '英國',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 1980,
    eventBackground: '英國中距離跑者，800公尺奧運金牌得主，英國中距離黃金三角之一。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'Steve Ovett Olympic Champion',
        url: 'https://www.olympic.org/',
        type: '官方文件'
      }
    ],
    summary: '奧運傳奇：1980年代英國田徑的榮光。',
    educationalNotes: '英國中距離三傑證明了清白競技可以達到世界頂峰。'
  },
  {
    athleteName: 'Daley Thompson',
    nationality: '英國',
    sport: '田徑',
    substance: '微量Methenolone',
    substanceCategory: '類固醇',
    year: 1988,
    eventBackground: '英國十項全能傳奇在1988年奧運會檢出微量類固醇，但濃度過低未被處罰。',
    punishment: {
      banDuration: '無 (濃度過低)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '1999年才公開此事'
    },
    sourceLinks: [
      {
        title: 'Daley Thompson 1988 Drug Test',
        url: 'https://www.iaaf.org/',
        type: '官方文件'
      }
    ],
    summary: '微量檢出：1980年代檢測標準的爭議。',
    educationalNotes: '1980年代的檢測標準與現在不同，微量檢出不一定構成違規。'
  },
  {
    athleteName: 'Jürgen Schult',
    nationality: '東德',
    sport: '田徑',
    substance: 'Oral-Turinabol (疑似)',
    substanceCategory: '類固醇',
    year: 1986,
    eventBackground: '鐵餅世界紀錄保持者至今，其紀錄在東德禁藥背景下備受質疑。',
    punishment: {
      banDuration: '無確鑿證據',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '紀錄合法性受質疑'
    },
    sourceLinks: [
      {
        title: 'Jurgen Schult Discus World Record',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '不朽紀錄：38年來無人能破的投擲紀錄。',
    educationalNotes: '某些在東德時代創造的投擲紀錄至今仍然存在，引發持續爭議。'
  },
  {
    athleteName: 'Ulf Timmermann',
    nationality: '東德',
    sport: '田徑',
    substance: 'Oral-Turinabol (疑似)',
    substanceCategory: '類固醇',
    year: 1988,
    eventBackground: '鉛球世界紀錄保持者，1988年奧運金牌得主，東德投擲項目的代表。',
    punishment: {
      banDuration: '無確鑿證據',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '成績真實性受質疑'
    },
    sourceLinks: [
      {
        title: 'Ulf Timmermann Shot Put Record',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '力量項目疑雲：東德投擲的系統性問題。',
    educationalNotes: '力量項目是類固醇使用的重災區，東德在這些項目上的統治地位令人懷疑。'
  },
  {
    athleteName: 'Petra Felke',
    nationality: '東德',
    sport: '田徑',
    substance: 'Oral-Turinabol (疑似)',
    substanceCategory: '類固醇',
    year: 1988,
    eventBackground: '女子標槍世界紀錄保持者，東德女子投擲項目的典型代表。',
    punishment: {
      banDuration: '無確鑿證據',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '紀錄至今有效但備受爭議'
    },
    sourceLinks: [
      {
        title: 'Petra Felke Javelin World Record',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '女子投擲疑雲：至今未破的爭議紀錄。',
    educationalNotes: '東德女子投擲選手的紀錄至今難以超越，反映當時可能的系統性問題。'
  }
];

async function addEra1980sCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    console.log(`Adding ${era1980sCases.length} 1980s era cases...`);

    // Insert 1980s era cases
    const insertedCases = await Case.insertMany(era1980sCases);
    console.log(`Successfully added ${insertedCases.length} 1980s era cases`);

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

    console.log('Updated related cases for 1980s era');
    
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    console.log('1980s era cases successfully added!');
    console.log('Progress: Stage 1 of 4 completed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding 1980s era cases:', error);
    process.exit(1);
  }
}

addEra1980sCases();