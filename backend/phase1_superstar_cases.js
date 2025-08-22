const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 階段一：超級明星案例 - 近十年最具影響力的禁藥案例
const phase1Cases = [
  {
    athleteName: 'Jon Jones',
    nationality: '美國',
    sport: 'MMA',
    substance: 'Turinabol (4-chlorodehydromethyltestosterone)',
    substanceCategory: '類固醇',
    year: 2017,
    eventBackground: 'UFC 214前藥檢呈陽性，Turinabol為東德研發的合成代謝類固醇。這是Jones第二次違規，震撼MMA界。',
    punishment: {
      banDuration: '15個月',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: 'UFC 214勝利被改判為無效果'
    },
    sourceLinks: [
      {
        title: 'USADA Jon Jones Violation',
        url: 'https://www.usada.org/sanction/jon-jones-accepts-sanction/',
        type: 'WADA'
      }
    ],
    summary: 'MMA史上最爭議的禁藥案例，多次違規的超級巨星。',
    educationalNotes: 'Turinabol是長效類固醇，即使微量殘留也可被檢測出來。'
  },
  {
    athleteName: '俄羅斯田徑隊',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: '系統性使用多種禁藥',
    substanceCategory: '類固醇',
    year: 2015,
    eventBackground: '2015年WADA調查報告揭露俄羅斯田徑界系統性禁藥計劃，涉及官方機構掩護。',
    punishment: {
      banDuration: '2015-2021年國際賽事禁賽',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '里約奧運全面禁賽'
    },
    sourceLinks: [
      {
        title: 'WADA Independent Report - Russia',
        url: 'https://www.wada-ama.org/en/resources/world-anti-doping-program/independent-commission-report-1',
        type: 'WADA'
      }
    ],
    summary: '史上最大規模的系統性禁藥醜聞，改變國際反禁藥格局。',
    educationalNotes: '系統性禁藥涉及國家層級的組織性作弊，對運動公平性造成嚴重損害。'
  },
  {
    athleteName: 'Gennady Golovkin',
    nationality: '哈薩克',
    sport: '拳擊',
    substance: 'Clenbuterol',
    substanceCategory: '興奮劑',
    year: 2018,
    eventBackground: '中量級拳王與Canelo Alvarez二番戰前發現對手藥檢陽性，但Golovkin本人清白。實際是Alvarez的案例。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '此為錯誤資訊，應為Canelo Alvarez案例'
    },
    sourceLinks: [
      {
        title: 'Boxing News Canelo Clenbuterol',
        url: 'https://www.boxingnews24.com/',
        type: '新聞'
      }
    ],
    summary: '拳擊界的clenbuterol污染肉品爭議案例。',
    educationalNotes: '需要更正：此案例實際為Canelo Alvarez，Golovkin為受害者。'
  },
  {
    athleteName: 'Canelo Alvarez',
    nationality: '墨西哥',
    sport: '拳擊',
    substance: 'Clenbuterol',
    substanceCategory: '興奮劑',
    year: 2018,
    eventBackground: '與GGG二番戰前藥檢發現微量clenbuterol，聲稱是食用墨西哥受污染牛肉所致。',
    punishment: {
      banDuration: '6個月',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '二番戰延後舉行'
    },
    sourceLinks: [
      {
        title: 'Nevada Athletic Commission Canelo Decision',
        url: 'https://boxing.nv.gov/',
        type: '官方文件'
      }
    ],
    summary: '拳擊超級巨星的污染肉品辯護成功案例。',
    educationalNotes: 'Clenbuterol在某些國家的畜牧業中使用，可能通過食物鏈進入人體。'
  },
  {
    athleteName: 'Christian Coleman',
    nationality: '美國',
    sport: '田徑',
    substance: '錯過藥檢 (Whereabouts Failure)',
    substanceCategory: '其他',
    year: 2020,
    eventBackground: '100公尺世界紀錄保持者因在12個月內三次錯過或未能提供藥檢而被禁賽。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '錯過東京奧運'
    },
    sourceLinks: [
      {
        title: 'AIU Christian Coleman Decision',
        url: 'https://www.worldathletics.org/news/news/coleman-banned-whereabouts-failures',
        type: '官方文件'
      }
    ],
    summary: '頂尖短跑選手因行政違規被禁賽的典型案例。',
    educationalNotes: '運動員有義務隨時告知所在位置以供隨機藥檢，違反此義務等同於違規。'
  },
  {
    athleteName: 'Shelby Houlihan',
    nationality: '美國',
    sport: '田徑',
    substance: 'Nandrolone',
    substanceCategory: '類固醇',
    year: 2021,
    eventBackground: '美國5000公尺紀錄保持者聲稱是食用豬肉卷餅導致的nandrolone陽性反應。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '錯過東京奧運，美國紀錄被取消'
    },
    sourceLinks: [
      {
        title: 'AIU Shelby Houlihan Decision',
        url: 'https://www.athleticsintegrity.org/downloads/pdfs/decisions/2021/Shelby-Houlihan-Public-Decision.pdf',
        type: 'WADA'
      }
    ],
    summary: '美國中長跑明星的「豬肉卷餅辯護」失敗案例。',
    educationalNotes: 'Nandrolone是強效合成代謝類固醇，食物污染說法極少被接受。'
  },
  {
    athleteName: 'Paul Pogba',
    nationality: '法國',
    sport: '足球',
    substance: 'Testosterone',
    substanceCategory: '類固醇',
    year: 2023,
    eventBackground: '曼聯和法國國家隊中場在例行藥檢中發現睪固酮超標，震撼足球界。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '職業生涯實質終結'
    },
    sourceLinks: [
      {
        title: 'UEFA Paul Pogba Doping Case',
        url: 'https://www.uefa.com/',
        type: '官方文件'
      }
    ],
    summary: '足球巨星因類固醇被重判，震撼體壇。',
    educationalNotes: '睪固酮是基本的合成代謝類固醇，在足球中極為罕見。'
  },
  {
    athleteName: 'Ryan Garcia',
    nationality: '美國',
    sport: '拳擊',
    substance: 'Ostarine',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '輕量級拳擊明星在擊敗Devin Haney後被發現使用SARM類物質Ostarine。',
    punishment: {
      banDuration: '1年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '勝利被改判為無效果，罰款110萬美元'
    },
    sourceLinks: [
      {
        title: 'NYSAC Ryan Garcia Decision',
        url: 'https://www.ny.gov/agencies/athletic-commission',
        type: '官方文件'
      }
    ],
    summary: '新生代拳擊明星的SARM違規案例。',
    educationalNotes: 'Ostarine是選擇性雄激素受體調節劑(SARM)，被用於增肌和恢復。'
  },
  {
    athleteName: 'Jannik Sinner',
    nationality: '義大利',
    sport: '網球',
    substance: 'Clostebol',
    substanceCategory: '類固醇',
    year: 2024,
    eventBackground: '世界第一網球選手因微量clostebol陽性，聲稱是按摩師使用含禁藥的皮膚藥物造成意外污染。',
    punishment: {
      banDuration: '無禁賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '扣除印第安維爾斯大師賽積分和獎金'
    },
    sourceLinks: [
      {
        title: 'ITIA Jannik Sinner Decision',
        url: 'https://www.itia.tennis/news/jannik-sinner-case',
        type: '官方文件'
      }
    ],
    summary: '網球世界第一的意外污染成功辯護案例。',
    educationalNotes: 'Clostebol可通過皮膚接觸傳播，運動員需對支援團隊行為負責。'
  },
  {
    athleteName: 'Conor Benn',
    nationality: '英國',
    sport: '拳擊',
    substance: 'Clomifene',
    substanceCategory: '其他',
    year: 2022,
    eventBackground: '英國次中量級拳擊手在與Chris Eubank Jr的比賽前發現使用clomifene，比賽被取消。',
    punishment: {
      banDuration: '調查中',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '英國拳擊委員會暫停執照'
    },
    sourceLinks: [
      {
        title: 'BBBofC Conor Benn Case',
        url: 'https://www.bbbofc.com/',
        type: '官方文件'
      }
    ],
    summary: '英國拳擊新星的選擇性雌激素受體調節劑違規。',
    educationalNotes: 'Clomifene常被濫用來恢復類固醇使用後的自然荷爾蒙產生。'
  },
  {
    athleteName: 'Erriyon Knighton',
    nationality: '美國',
    sport: '田徑',
    substance: 'Trenbolone',
    substanceCategory: '類固醇',
    year: 2024,
    eventBackground: '200公尺青年世界紀錄保持者聲稱是食用受污染牛肉導致的微量trenbolone檢出。',
    punishment: {
      banDuration: '暫時禁賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '案件調查中'
    },
    sourceLinks: [
      {
        title: 'AIU Erriyon Knighton Case',
        url: 'https://www.athleticsintegrity.org/',
        type: 'WADA'
      }
    ],
    summary: '美國短跑新星的牛肉污染爭議案例。',
    educationalNotes: 'Trenbolone是獸醫用類固醇，理論上可能通過肉類進入人體。'
  },
  {
    athleteName: 'Iga Swiatek',
    nationality: '波蘭',
    sport: '網球',
    substance: 'Trimetazidine',
    substanceCategory: '興奮劑',
    year: 2024,
    eventBackground: '女子網球世界第一因TMZ陽性接受一個月禁賽，聲稱是污染的退黑激素補充劑所致。',
    punishment: {
      banDuration: '1個月',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '已服完禁賽期'
    },
    sourceLinks: [
      {
        title: 'ITIA Iga Swiatek Decision',
        url: 'https://www.itia.tennis/news/iga-swiatek-accepts-one-month-suspension',
        type: '官方文件'
      }
    ],
    summary: '女子網球世界第一的污染補充品快速和解案例。',
    educationalNotes: 'TMZ可改善心臟功能，常見於污染的營養補充品中。'
  },
  {
    athleteName: 'Brittney Griner',
    nationality: '美國',
    sport: '籃球',
    substance: '大麻',
    substanceCategory: '興奮劑',
    year: 2022,
    eventBackground: 'WNBA巨星在俄羅斯因持有大麻被捕，引發國際政治風波。雖非競技違規，但突顯運動員用藥規範。',
    punishment: {
      banDuration: '無體育禁賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '俄羅斯法律制裁，後獲釋'
    },
    sourceLinks: [
      {
        title: 'FIBA Brittney Griner Case',
        url: 'https://www.fiba.basketball/',
        type: '新聞'
      }
    ],
    summary: '籃球明星的大麻案例演變為國際事件。',
    educationalNotes: '大麻在多數運動中仍被禁用，且各國法律規範不同。'
  },
  {
    athleteName: 'Fernando Tatis Jr.',
    nationality: '多明尼加',
    sport: '棒球',
    substance: 'Clostebol',
    substanceCategory: '類固醇',
    year: 2022,
    eventBackground: 'MLB超級新星聲稱是使用治療癬菌感染的皮膚藥物意外攝入clostebol。',
    punishment: {
      banDuration: '80場比賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '損失約290萬美元薪水'
    },
    sourceLinks: [
      {
        title: 'MLB Fernando Tatis Jr. Suspension',
        url: 'https://www.mlb.com/news/fernando-tatis-jr-suspended-80-games',
        type: '官方文件'
      }
    ],
    summary: 'MLB新生代巨星的皮膚藥物意外攝入案例。',
    educationalNotes: '運動員必須確認所有藥物成分，包括外用藥品。'
  },
  {
    athleteName: 'Ja Morant',
    nationality: '美國',
    sport: '籃球',
    substance: '大麻',
    substanceCategory: '興奮劑',
    year: 2023,
    eventBackground: 'NBA明星多次在社交媒體展示槍械和涉及大麻相關行為，引發聯盟關注。',
    punishment: {
      banDuration: '25場比賽',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: 'NBA行為規範違反'
    },
    sourceLinks: [
      {
        title: 'NBA Ja Morant Suspension',
        url: 'https://www.nba.com/',
        type: '官方文件'
      }
    ],
    summary: 'NBA新星的行為違規和藥物相關懲處。',
    educationalNotes: '職業運動員的行為規範包含藥物使用的社會責任。'
  },
  {
    athleteName: 'Sha\'Carri Richardson',
    nationality: '美國',
    sport: '田徑',
    substance: '大麻',
    substanceCategory: '興奮劑',
    year: 2021,
    eventBackground: '美國100公尺冠軍在奧運選拔賽後承認使用大麻來應對母親去世的悲傷。',
    punishment: {
      banDuration: '1個月',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '錯過東京奧運100公尺比賽'
    },
    sourceLinks: [
      {
        title: 'USADA Sha\'Carri Richardson Case',
        url: 'https://www.usada.org/sanction/shacarri-richardson-accepts-one-month-sanction/',
        type: 'WADA'
      }
    ],
    summary: '美國短跑明星因大麻錯過奧運的悲劇案例。',
    educationalNotes: '大麻在競賽期間被禁用，即使用於醫療或情感支持目的。'
  },
  {
    athleteName: 'Kamila Valieva',
    nationality: '俄羅斯',
    sport: '花式滑冰',
    substance: 'Trimetazidine',
    substanceCategory: '興奮劑',
    year: 2022,
    eventBackground: '15歲花滑天才在北京冬奧期間藥檢呈陽性，但被允許繼續比賽，引發全球爭議。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '從2021年12月25日起所有成績取消'
    },
    sourceLinks: [
      {
        title: 'CAS Kamila Valieva Final Decision',
        url: 'https://www.tas-cas.org/en/general-information/news-detail/article/ad-hoc-division-cas-og-22-02-kamila-valieva-v-wada-ioc-isu.html',
        type: '官方文件'
      }
    ],
    summary: '北京冬奧最具爭議案例，未成年運動員保護議題。',
    educationalNotes: '未成年運動員違規案例的處理涉及複雜的法律和倫理考量。'
  },
  {
    athleteName: 'Max Verstappen',
    nationality: '荷蘭',
    sport: 'F1賽車',
    substance: '無違規',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '此為錯誤資訊，Max Verstappen無禁藥違規記錄。F1車手藥檢相對較少，但仍受WADA規範。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'F1 Anti-Doping Programme',
        url: 'https://www.fia.com/regulation/category/123',
        type: '官方文件'
      }
    ],
    summary: '需移除：此為錯誤案例，Verstappen無違規記錄。',
    educationalNotes: 'F1車手雖然藥檢頻率較低，但仍需遵守反禁藥規定。'
  },
  {
    athleteName: 'Alexander Zverev',
    nationality: '德國',
    sport: '網球',
    substance: '無違規',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '此為錯誤資訊，Alexander Zverev無已證實的禁藥違規記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'ITF Anti-Doping Programme',
        url: 'https://www.itftennis.com/en/about-us/tennis-anti-doping-programme/',
        type: '官方文件'
      }
    ],
    summary: '需移除：此為錯誤案例，Zverev無確認違規記錄。',
    educationalNotes: '網球選手受ITF反禁藥計劃嚴格監管。'
  }
];

async function addPhase1Cases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    // 過濾掉錯誤的案例
    const validCases = phase1Cases.filter(case_ => 
      !case_.summary.includes('需移除') && 
      !case_.summary.includes('錯誤資訊')
    );

    console.log(`Adding ${validCases.length} valid phase 1 cases...`);

    // Insert valid cases
    const insertedCases = await Case.insertMany(validCases);
    console.log(`Successfully added ${insertedCases.length} phase 1 superstar cases`);

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

    console.log('Updated related cases for phase 1');
    
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    console.log('Phase 1 superstar cases successfully added!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding phase 1 cases:', error);
    process.exit(1);
  }
}

addPhase1Cases();