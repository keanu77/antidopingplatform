const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

const newCases = [
  {
    athleteName: 'Anderson Silva',
    nationality: '巴西',
    sport: 'MMA',
    substance: 'Drostanolone',
    substanceCategory: '類固醇',
    year: 2015,
    eventBackground: 'UFC 183賽後藥檢呈陽性，後續還發現使用安非他命類物質。',
    punishment: {
      banDuration: '1年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '罰款18萬美元'
    },
    sourceLinks: [
      {
        title: 'UFC Anderson Silva Drug Test Results',
        url: 'https://www.ufc.com/',
        type: '官方文件'
      }
    ],
    summary: 'UFC傳奇選手的禁藥醜聞，震撼格鬥界。',
    educationalNotes: 'Drostanolone是合成代謝類固醇，可增加肌肉密度和力量。'
  },
  {
    athleteName: 'Shane Warne',
    nationality: '澳洲',
    sport: '板球',
    substance: 'Diuretic',
    substanceCategory: '利尿劑',
    year: 2003,
    eventBackground: '2003年世界盃前夕藥檢發現利尿劑，聲稱是為了外觀而服用母親的減肥藥。',
    punishment: {
      banDuration: '12個月',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '錯過2003年世界盃'
    },
    sourceLinks: [
      {
        title: 'Cricket Australia Shane Warne Ban',
        url: 'https://www.cricket.com.au/',
        type: '官方文件'
      }
    ],
    summary: '板球傳奇因為「美容目的」使用利尿劑被禁賽。',
    educationalNotes: '利尿劑不僅用於掩蓋其他藥物，也被誤用於快速減重。'
  },
  {
    athleteName: 'Manny Ramirez',
    nationality: '多明尼加',
    sport: '棒球',
    substance: 'HCG (人類絨毛膜促性腺激素)',
    substanceCategory: '其他',
    year: 2009,
    eventBackground: 'MLB球員因使用女性不孕症治療藥物HCG被發現，該物質常被用來恢復類固醇使用後的荷爾蒙水平。',
    punishment: {
      banDuration: '50場比賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '損失薪水約770萬美元'
    },
    sourceLinks: [
      {
        title: 'MLB Manny Ramirez Suspension',
        url: 'https://www.mlb.com/',
        type: '官方文件'
      }
    ],
    summary: 'MLB明星球員使用禁藥恢復荷爾蒙水平被抓包。',
    educationalNotes: 'HCG常被濫用來掩蓋類固醇使用的副作用。'
  },
  {
    athleteName: 'Kamila Valieva',
    nationality: '俄羅斯',
    sport: '花式滑冰',
    substance: 'Trimetazidine',
    substanceCategory: '興奮劑',
    year: 2022,
    eventBackground: '2022北京冬奧期間，15歲的花滑選手藥檢呈陽性，引發國際爭議。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '從2021年12月25日起成績被取消'
    },
    sourceLinks: [
      {
        title: 'CAS Kamila Valieva Decision',
        url: 'https://www.tas-cas.org/',
        type: '官方文件'
      }
    ],
    summary: '北京冬奧最具爭議的禁藥案例，涉及未成年運動員。',
    educationalNotes: 'Trimetazidine可改善心臟功能，提高耐力表現。'
  },
  {
    athleteName: 'Alex Rodriguez',
    nationality: '美國',
    sport: '棒球',
    substance: '睪固酮、HGH',
    substanceCategory: '類固醇',
    year: 2014,
    eventBackground: 'MLB超級球星承認長期使用禁藥，涉及Biogenesis診所醜聞。',
    punishment: {
      banDuration: '整個2014球季',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '損失2400萬美元薪水'
    },
    sourceLinks: [
      {
        title: 'MLB Alex Rodriguez Biogenesis',
        url: 'https://www.mlb.com/',
        type: '官方文件'
      }
    ],
    summary: '棒球史上最大禁藥醜聞之一，A-Rod的墜落。',
    educationalNotes: '組合使用多種禁藥會大幅增加健康風險。'
  },
  {
    athleteName: 'Shayna Jack',
    nationality: '澳洲',
    sport: '游泳',
    substance: 'Ligandrol',
    substanceCategory: '其他',
    year: 2019,
    eventBackground: '澳洲游泳選手在2019年世錦標賽前藥檢呈陽性，聲稱是意外攝入。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '錯過2019世錦標賽和東京奧運'
    },
    sourceLinks: [
      {
        title: 'Swimming Australia Shayna Jack Case',
        url: 'https://www.swimming.org.au/',
        type: '官方文件'
      }
    ],
    summary: '澳洲游泳新星因SARM類物質被禁賽。',
    educationalNotes: 'Ligandrol是SARM(選擇性雄激素受體調節劑)，被用來增肌。'
  },
  {
    athleteName: 'Rashard Lewis',
    nationality: '美國',
    sport: '籃球',
    substance: '睪固酮',
    substanceCategory: '類固醇',
    year: 2009,
    eventBackground: 'NBA球員聲稱使用含有禁藥的營養補充品治療勃起功能障礙。',
    punishment: {
      banDuration: '10場比賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '成為NBA首位因類固醇被禁賽的球員'
    },
    sourceLinks: [
      {
        title: 'NBA Rashard Lewis Suspension',
        url: 'https://www.nba.com/',
        type: '官方文件'
      }
    ],
    summary: 'NBA史上首位因類固醇被禁賽的球員。',
    educationalNotes: '運動員必須對所有攝入物質負責，包括補充品。'
  },
  {
    athleteName: 'Darya Klishina',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'Meldonium',
    substanceCategory: '其他',
    year: 2016,
    eventBackground: '俄羅斯跳遠選手因meldonium陽性反應，但後來證明是在禁用前使用。',
    punishment: {
      banDuration: '暫時禁賽後撤銷',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '清白後恢復比賽資格'
    },
    sourceLinks: [
      {
        title: 'IAAF Darya Klishina Case',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: 'Meldonium案例中少數成功翻案的例子。',
    educationalNotes: '藥物在體內的殘留時間可能超出預期。'
  },
  {
    athleteName: 'Josh Gordon',
    nationality: '美國',
    sport: '美式足球',
    substance: '大麻、酒精',
    substanceCategory: '興奮劑',
    year: 2019,
    eventBackground: 'NFL球員多次違反藥物政策，包括大麻和酒精濫用。',
    punishment: {
      banDuration: '無限期停賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '多次復出又被禁賽'
    },
    sourceLinks: [
      {
        title: 'NFL Josh Gordon Suspensions',
        url: 'https://www.nfl.com/',
        type: '官方文件'
      }
    ],
    summary: 'NFL天才接球員因藥物濫用毀掉職業生涯。',
    educationalNotes: '大麻在許多運動中仍被視為禁用物質。'
  },
  {
    athleteName: 'Simona Halep',
    nationality: '羅馬尼亞',
    sport: '網球',
    substance: 'Roxadustat',
    substanceCategory: '血液興奮劑',
    year: 2022,
    eventBackground: '前世界第一在2022年美網期間藥檢呈陽性，聲稱是污染補充品。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '2022年7月起成績被取消'
    },
    sourceLinks: [
      {
        title: 'ITF Simona Halep Decision',
        url: 'https://www.itftennis.com/',
        type: '官方文件'
      }
    ],
    summary: '網球大滿貫冠軍因血液興奮劑被重罰。',
    educationalNotes: 'Roxadustat用於治療貧血，可增加紅血球生成。'
  }
];

async function addNewCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    // Insert new cases
    const insertedCases = await Case.insertMany(newCases);
    console.log(`Successfully added ${insertedCases.length} new cases`);

    // Update related cases for new entries
    for (let i = 0; i < insertedCases.length; i++) {
      const currentCase = insertedCases[i];
      
      // Find related cases based on sport or substance category
      const relatedCases = await Case.find({
        _id: { $ne: currentCase._id },
        $or: [
          { sport: currentCase.sport },
          { substanceCategory: currentCase.substanceCategory }
        ]
      }).limit(3);
      
      if (relatedCases.length > 0) {
        await Case.findByIdAndUpdate(currentCase._id, { 
          relatedCases: relatedCases.map(c => c._id) 
        });
      }
    }

    console.log('Updated related cases for new entries');
    
    // Get total count
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    console.log('Successfully added new cases!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding new cases:', error);
    process.exit(1);
  }
}

addNewCases();