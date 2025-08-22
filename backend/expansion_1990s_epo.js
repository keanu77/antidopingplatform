const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 階段二：1990年代EPO革命 - 耐力運動禁藥的轉捩點
const era1990sCases = [
  {
    athleteName: 'Festina車隊',
    nationality: '法國',
    sport: '自行車',
    substance: 'EPO, 生長激素, 類固醇',
    substanceCategory: 'EPO',
    year: 1998,
    eventBackground: '1998年環法賽最大醜聞，Festina車隊按摩師被發現攜帶大量EPO等禁藥，震撼自行車界。',
    punishment: {
      banDuration: '車隊解散',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '改變環法賽歷史'
    },
    sourceLinks: [
      {
        title: 'Festina Affair 1998 Tour de France',
        url: 'https://www.uci.org/inside-uci/clean-sport/festina-affair',
        type: '官方文件'
      }
    ],
    summary: 'EPO革命開始：現代自行車禁藥時代的開端。',
    educationalNotes: 'EPO（促紅血球生成素）革命性地改變了耐力運動，但也開啟了禁藥軍備競賽。'
  },
  {
    athleteName: '中國女子游泳隊',
    nationality: '中國',
    sport: '游泳',
    substance: 'DHT (雙氫睪固酮)',
    substanceCategory: '類固醇',
    year: 1994,
    eventBackground: '1994年羅馬世錦賽和廣島亞運會，中國女泳大幅進步引發質疑，多名選手藥檢陽性。',
    punishment: {
      banDuration: '2-4年不等',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '中國游泳聲譽重創'
    },
    sourceLinks: [
      {
        title: 'China Swimming Doping Scandal 1990s',
        url: 'https://www.fina.org/news/china-swimming-doping-1990s',
        type: '官方文件'
      }
    ],
    summary: '亞洲游泳醜聞：1990年代最大的游泳禁藥事件。',
    educationalNotes: '系統性使用DHT等類固醇可以快速提升游泳成績，但會被現代檢測技術發現。'
  },
  {
    athleteName: 'Yuan Yuan',
    nationality: '中國',
    sport: '游泳',
    substance: 'DHT',
    substanceCategory: '類固醇',
    year: 1994,
    eventBackground: '中國女子400公尺個人混合式選手，1994年世錦賽金牌得主，後藥檢陽性。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '世錦賽金牌被取消'
    },
    sourceLinks: [
      {
        title: 'Yuan Yuan Swimming Doping Case',
        url: 'https://www.fina.org/',
        type: '官方文件'
      }
    ],
    summary: '個人悲劇：系統性禁藥下的個人犧牲品。',
    educationalNotes: 'DHT是睪固酮的代謝產物，使用後會顯著改變運動員的外觀和聲音。'
  },
  {
    athleteName: 'Lu Bin',
    nationality: '中國',
    sport: '游泳',
    substance: 'DHT',
    substanceCategory: '類固醇',
    year: 1994,
    eventBackground: '中國女子100公尺和200公尺蝶式選手，1994年亞運會多金得主後被發現使用禁藥。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '亞運會成績全部取消'
    },
    sourceLinks: [
      {
        title: 'Chinese Swimming Team 1994 Scandal',
        url: 'https://www.olympic.org/',
        type: '官方文件'
      }
    ],
    summary: '蝶式女王隕落：技術性項目的禁藥影響。',
    educationalNotes: '即使是技術性較強的蝶式項目，類固醇仍能提供顯著的力量優勢。'
  },
  {
    athleteName: 'Bjarne Riis',
    nationality: '丹麥',
    sport: '自行車',
    substance: 'EPO',
    substanceCategory: 'EPO',
    year: 1996,
    eventBackground: '1996年環法賽冠軍，2007年承認在整個職業生涯中使用EPO，包括冠軍年。',
    punishment: {
      banDuration: '追溯性道德譴責',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '保留環法冠軍但受道德質疑'
    },
    sourceLinks: [
      {
        title: 'Bjarne Riis EPO Admission 2007',
        url: 'https://www.cyclingnews.com/news/riis-admits-epo-use/',
        type: '新聞'
      }
    ],
    summary: '遲來的懺悔：退役後承認的EPO使用。',
    educationalNotes: 'EPO在1990年代無法被檢測，許多車手在這個時期大量使用。'
  },
  {
    athleteName: 'Jan Ullrich',
    nationality: '德國',
    sport: '自行車',
    substance: 'EPO, 血液禁藥',
    substanceCategory: 'EPO',
    year: 1997,
    eventBackground: '1997年環法賽冠軍，後來在Operation Puerto中被發現與Fuentes醫生有關聯。',
    punishment: {
      banDuration: '2年 (2006年)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '職業生涯蒙陰影'
    },
    sourceLinks: [
      {
        title: 'Jan Ullrich Operation Puerto',
        url: 'https://www.uci.org/',
        type: '官方文件'
      }
    ],
    summary: '德國之星：EPO時代的受害者兼加害者。',
    educationalNotes: 'Operation Puerto揭露了1990年代後期自行車界血液禁藥的普遍使用。'
  },
  {
    athleteName: 'Marco Pantani',
    nationality: '義大利',
    sport: '自行車',
    substance: 'EPO (疑似)',
    substanceCategory: 'EPO',
    year: 1999,
    eventBackground: '義大利爬坡王因血比容值過高被驅逐出1999年環義賽，職業生涯從此一落千丈。',
    punishment: {
      banDuration: '無正式禁賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '職業生涯毀滅，後來早逝'
    },
    sourceLinks: [
      {
        title: 'Marco Pantani Hematocrit Scandal',
        url: 'https://www.gazzetta.it/Ciclismo/',
        type: '新聞'
      }
    ],
    summary: '悲劇英雄：EPO時代最悲劇的人物。',
    educationalNotes: '血比容值檢測是1990年代末對抗EPO使用的重要手段。'
  },
  {
    athleteName: 'Richard Virenque',
    nationality: '法國',
    sport: '自行車',
    substance: 'EPO',
    substanceCategory: 'EPO',
    year: 1998,
    eventBackground: 'Festina車隊核心成員，1998年環法賽爬坡王，長期否認後最終承認使用EPO。',
    punishment: {
      banDuration: '9個月',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '法國英雄形象破滅'
    },
    sourceLinks: [
      {
        title: 'Richard Virenque Festina Scandal',
        url: 'https://www.lequipe.fr/',
        type: '新聞'
      }
    ],
    summary: '法國英雄的墜落：Festina事件的象徵人物。',
    educationalNotes: '即使是國民英雄級的運動員也無法逃脫禁藥調查的追究。'
  },
  {
    athleteName: 'Alex Zülle',
    nationality: '瑞士',
    sport: '自行車',
    substance: 'EPO',
    substanceCategory: 'EPO',
    year: 1998,
    eventBackground: 'Festina車隊副將，瑞士計時賽高手，在Festina事件中坦承使用EPO。',
    punishment: {
      banDuration: '7個月',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '提早承認獲減刑'
    },
    sourceLinks: [
      {
        title: 'Alex Zulle EPO Confession',
        url: 'https://www.uci.org/',
        type: '官方文件'
      }
    ],
    summary: '坦承的勇氣：Festina事件中最早承認的車手。',
    educationalNotes: '主動承認違規並配合調查通常可以獲得減刑處理。'
  },
  {
    athleteName: 'Laurent Brochard',
    nationality: '法國',
    sport: '自行車',
    substance: 'EPO',
    substanceCategory: 'EPO',
    year: 1998,
    eventBackground: 'Festina車隊成員，1997年世界冠軍，在Festina醜聞中承認使用EPO。',
    punishment: {
      banDuration: '6個月',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '世界冠軍頭銜保留'
    },
    sourceLinks: [
      {
        title: 'Laurent Brochard World Champion EPO',
        url: 'https://www.uci.org/',
        type: '官方文件'
      }
    ],
    summary: '世界冠軍的陰影：EPO時代的世界冠軍。',
    educationalNotes: '1990年代的世界冠軍和重大勝利都籠罩在EPO使用的陰影下。'
  },
  {
    athleteName: 'Christophe Bassons',
    nationality: '法國',
    sport: '自行車',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 1999,
    eventBackground: '法國車手公開反對禁藥使用，在1999年環法賽中被同伴孤立，成為清白競技的象徵。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '被車隊和同伴排斥'
    },
    sourceLinks: [
      {
        title: 'Christophe Bassons Clean Cycling Whistleblower',
        url: 'https://www.procycling.com/',
        type: '新聞'
      }
    ],
    summary: '孤獨的戰士：1990年代自行車界的清白聲音。',
    educationalNotes: '在禁藥盛行的環境中堅持清白往往需要巨大的勇氣和犧牲。'
  },
  {
    athleteName: 'Miguel Induráin',
    nationality: '西班牙',
    sport: '自行車',
    substance: '清白記錄 (爭議)',
    substanceCategory: '其他',
    year: 1995,
    eventBackground: '西班牙自行車傳奇，五屆環法冠軍，雖未被證實使用禁藥但處於EPO時代。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '成就受時代背景質疑'
    },
    sourceLinks: [
      {
        title: 'Miguel Indurain Tour de France Legacy',
        url: 'https://www.letour.fr/',
        type: '官方文件'
      }
    ],
    summary: '時代英雄：EPO時代前的最後清白冠軍？',
    educationalNotes: '即使沒有確鑿證據，在禁藥盛行時代的成就也會受到質疑。'
  },
  {
    athleteName: 'Luc Leblanc',
    nationality: '法國',
    sport: '自行車',
    substance: 'Amphetamines',
    substanceCategory: '興奮劑',
    year: 1994,
    eventBackground: '法國車手，1994年世界冠軍，後來承認在職業生涯中使用安非他命。',
    punishment: {
      banDuration: '追溯性道德譴責',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '退役後承認'
    },
    sourceLinks: [
      {
        title: 'Luc Leblanc Amphetamine Admission',
        url: 'https://www.lequipe.fr/',
        type: '新聞'
      }
    ],
    summary: '安非他命時代：EPO前的興奮劑使用。',
    educationalNotes: '在EPO出現前，自行車界主要使用安非他命等傳統興奮劑。'
  },
  {
    athleteName: 'Erwan Menthéour',
    nationality: '法國',
    sport: '自行車',
    substance: 'EPO, 類固醇',
    substanceCategory: 'EPO',
    year: 1996,
    eventBackground: '法國車手退役後成為反禁藥倡導者，揭露1990年代自行車界的系統性禁藥使用。',
    punishment: {
      banDuration: '無 (退役後承認)',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '成為反禁藥教育者'
    },
    sourceLinks: [
      {
        title: 'Erwan Mentheour Cycling Doping Confession',
        url: 'https://www.humankinetics.com/',
        type: '新聞'
      }
    ],
    summary: '覺醒的告發者：從使用者到教育者的轉變。',
    educationalNotes: '前禁藥使用者可以成為最有效的反禁藥教育者和倡導者。'
  },
  {
    athleteName: 'Jesus Manzano',
    nationality: '西班牙',
    sport: '自行車',
    substance: 'EPO, 類固醇',
    substanceCategory: 'EPO',
    year: 1999,
    eventBackground: '西班牙車手，Kelme車隊成員，後來成為Operation Puerto案的關鍵證人。',
    punishment: {
      banDuration: '無正式處罰',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '成為告發者'
    },
    sourceLinks: [
      {
        title: 'Jesus Manzano Operation Puerto Witness',
        url: 'https://www.cyclingnews.com/',
        type: '新聞'
      }
    ],
    summary: '內部告發者：揭露西班牙自行車禁藥網絡。',
    educationalNotes: '內部告發者對於揭露系統性禁藥使用起到關鍵作用。'
  },
  {
    athleteName: 'Willy Voet',
    nationality: '比利時',
    sport: '自行車',
    substance: '禁藥供應者',
    substanceCategory: '其他',
    year: 1998,
    eventBackground: 'Festina車隊按摩師，因攜帶禁藥被逮捕引發Festina醜聞，後來寫書揭露內幕。',
    punishment: {
      banDuration: '法律制裁',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '成為反禁藥教育者'
    },
    sourceLinks: [
      {
        title: 'Willy Voet Breaking the Chain Book',
        url: 'https://www.amazon.com/Breaking-Chain-Drugs-Cycling-Festina/dp/0224060066',
        type: '新聞'
      }
    ],
    summary: '揭露者：Festina醜聞的關鍵人物。',
    educationalNotes: '支援人員在運動員禁藥使用中扮演關鍵角色，也需要承擔法律責任。'
  },
  {
    athleteName: 'Francesco Conconi',
    nationality: '義大利',
    sport: '科學支援',
    substance: 'EPO研發應用',
    substanceCategory: 'EPO',
    year: 1990,
    eventBackground: '義大利運動醫學專家，被指控將EPO技術應用於運動員，包括Marco Pantani等。',
    punishment: {
      banDuration: '學術聲譽受損',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '被體育界封殺'
    },
    sourceLinks: [
      {
        title: 'Francesco Conconi EPO Research Controversy',
        url: 'https://www.nature.com/articles/nm0702-657',
        type: '官方文件'
      }
    ],
    summary: 'EPO之父：將醫學研究用於禁藥的科學家。',
    educationalNotes: '醫學研究的濫用可能為運動禁藥提供新的技術手段。'
  },
  {
    athleteName: 'Michele Ferrari',
    nationality: '義大利',
    sport: '科學支援',
    substance: 'EPO, 血液禁藥',
    substanceCategory: 'EPO',
    year: 1995,
    eventBackground: '義大利運動醫師，被稱為"EPO醫生"，為多名頂尖自行車手提供禁藥支援。',
    punishment: {
      banDuration: '終身禁入體育界',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '多次法律訴訟'
    },
    sourceLinks: [
      {
        title: 'Michele Ferrari EPO Doctor',
        url: 'https://www.uci.org/',
        type: '官方文件'
      }
    ],
    summary: 'EPO教父：1990年代禁藥技術的推手。',
    educationalNotes: '某些醫療專業人員濫用專業知識為運動員提供高科技禁藥方案。'
  },
  {
    athleteName: 'Emma O\'Reilly',
    nationality: '愛爾蘭',
    sport: '支援人員',
    substance: '告發者',
    substanceCategory: '其他',
    year: 1999,
    eventBackground: 'US Postal車隊按摩師，後來成為Lance Armstrong禁藥案的關鍵證人。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '遭受法律威脅和人身攻擊'
    },
    sourceLinks: [
      {
        title: 'Emma O\'Reilly Lance Armstrong Whistleblower',
        url: 'https://www.theguardian.com/sport/emma-oreilly',
        type: '新聞'
      }
    ],
    summary: '勇敢的告發者：支援人員的良知覺醒。',
    educationalNotes: '支援人員的證詞對於揭露系統性禁藥使用具有重要價值。'
  },
  {
    athleteName: 'Greg LeMond',
    nationality: '美國',
    sport: '自行車',
    substance: '清白倡導者',
    substanceCategory: '其他',
    year: 1990,
    eventBackground: '美國三屆環法冠軍，EPO時代的清白競技倡導者，公開質疑同時代車手的成績。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '遭受業界排斥'
    },
    sourceLinks: [
      {
        title: 'Greg LeMond Anti-Doping Advocacy',
        url: 'https://www.procycling.com/',
        type: '新聞'
      }
    ],
    summary: '清白鬥士：對抗EPO時代的孤獨聲音。',
    educationalNotes: '退役的清白運動員可以成為反禁藥運動的重要倡導者。'
  }
];

async function addEra1990sCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    console.log(`Adding ${era1990sCases.length} 1990s EPO era cases...`);

    // Insert 1990s era cases
    const insertedCases = await Case.insertMany(era1990sCases);
    console.log(`Successfully added ${insertedCases.length} 1990s EPO era cases`);

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

    console.log('Updated related cases for 1990s EPO era');
    
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    console.log('1990s EPO era cases successfully added!');
    console.log('Progress: Stage 2 of 4 completed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding 1990s EPO era cases:', error);
    process.exit(1);
  }
}

addEra1990sCases();