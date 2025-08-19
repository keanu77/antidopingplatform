const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 階段四：2010-2024現代禁藥時代最終擴展 - 新型禁藥技術與全球化
const modern2010s2020sCases = [
  {
    athleteName: 'Russian State Doping System',
    nationality: '俄羅斯',
    sport: '多項目',
    substance: '系統性國家禁藥',
    substanceCategory: '類固醇',
    year: 2014,
    eventBackground: '俄羅斯索契冬奧系統性國家禁藥醜聞，涉及樣本替換和大規模掩蓋。',
    punishment: {
      banDuration: '4年集體禁賽',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '國際體育聲譽重創'
    },
    sourceLinks: [
      {
        title: 'McLaren Report on Russian State Doping',
        url: 'https://www.wada-ama.org/en/resources/doping-control-process/mclaren-independent-investigation-report-part-ii',
        type: 'WADA'
      }
    ],
    summary: '現代國家禁藥：21世紀最大規模的系統性禁藥案例。',
    educationalNotes: '現代技術條件下的國家級禁藥掩蓋仍會被國際調查發現。'
  },
  {
    athleteName: 'Maria Sharapova',
    nationality: '俄羅斯',
    sport: '網球',
    substance: 'Meldonium',
    substanceCategory: '其他',
    year: 2016,
    eventBackground: '俄羅斯網球女王因使用新禁用物質Meldonium被禁賽，聲稱不知該物質被禁用。',
    punishment: {
      banDuration: '15個月',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '職業生涯重大打擊'
    },
    sourceLinks: [
      {
        title: 'ITF Maria Sharapova Meldonium Case',
        url: 'https://www.itftennis.com/en/news-and-media/articles/maria-sharapova-banned-for-two-years/',
        type: '官方文件'
      }
    ],
    summary: 'Meldonium案例：新禁用物質的典型案例。',
    educationalNotes: 'Meldonium是心血管藥物，2016年被加入禁用清單後造成大量違規。'
  },
  {
    athleteName: 'Sun Yang',
    nationality: '中國',
    sport: '游泳',
    substance: '拒絕檢測',
    substanceCategory: '其他',
    year: 2018,
    eventBackground: '中國游泳巨星因暴力破壞檢測設備和拒絕配合檢測被禁賽8年。',
    punishment: {
      banDuration: '8年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '職業生涯實質結束'
    },
    sourceLinks: [
      {
        title: 'CAS Sun Yang Doping Violation',
        url: 'https://www.tas-cas.org/en/general-information/news-overview/article/swimming-fina-v-mack-horton-aus-swimming-australia-v-sun-yang-chn-wada.html',
        type: '官方文件'
      }
    ],
    summary: '拒絕檢測：破壞檢測的嚴重後果。',
    educationalNotes: '拒絕或阻撓檢測與使用禁藥同樣被視為嚴重違規。'
  },
  {
    athleteName: 'Alberto Salazar',
    nationality: '美國',
    sport: '教練',
    substance: '教練違規',
    substanceCategory: '其他',
    year: 2019,
    eventBackground: '俄勒岡計劃主教練因協助運動員違規和濫用處方藥被禁4年。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: 'Nike Oregon Project解散'
    },
    sourceLinks: [
      {
        title: 'USADA Alberto Salazar Decision',
        url: 'https://www.usada.org/news/usada-announces-4-year-sanctions-alberto-salazar-jeffrey-brown/',
        type: 'WADA'
      }
    ],
    summary: '教練責任：支援人員的嚴厲處罰。',
    educationalNotes: '教練和醫療人員在運動員違規中承擔重要責任。'
  },
  {
    athleteName: 'Christian Coleman',
    nationality: '美國',
    sport: '田徑',
    substance: '錯過檢測',
    substanceCategory: '其他',
    year: 2020,
    eventBackground: '美國短跑選手因12個月內三次錯過檢測被禁賽2年。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '錯過東京奧運會'
    },
    sourceLinks: [
      {
        title: 'AIU Christian Coleman Whereabouts Failures',
        url: 'https://www.worldathletics.org/news/press-release/coleman-suspension-whereabouts-failures',
        type: '官方文件'
      }
    ],
    summary: '行蹤錯誤：現代反禁藥監管的嚴格要求。',
    educationalNotes: '運動員必須準確提供行蹤信息以配合隨機檢測。'
  },
  {
    athleteName: 'Shelby Houlihan',
    nationality: '美國',
    sport: '田徑',
    substance: 'Nandrolone',
    substanceCategory: '類固醇',
    year: 2021,
    eventBackground: '美國中長距離選手因nandrolone陽性被禁4年，聲稱來自豬肉污染。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '錯過東京奧運會'
    },
    sourceLinks: [
      {
        title: 'USADA Shelby Houlihan Decision',
        url: 'https://www.usada.org/news/athlete-test-results/shelby-houlihan-receives-4-year-sanction/',
        type: 'WADA'
      }
    ],
    summary: '食物污染爭議：Nandrolone的現代案例。',
    educationalNotes: '食物污染辯護在現代反禁藥中很難被接受。'
  },
  {
    athleteName: 'Kamila Valieva',
    nationality: '俄羅斯',
    sport: '花式滑冰',
    substance: 'Trimetazidine',
    substanceCategory: '其他',
    year: 2022,
    eventBackground: '15歲俄羅斯花滑選手在北京冬奧前被檢出心臟藥物，引發未成年保護爭議。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '北京冬奧成績取消'
    },
    sourceLinks: [
      {
        title: 'CAS Kamila Valieva Beijing 2022 Case',
        url: 'https://www.tas-cas.org/en/general-information/news-overview/article/ad-hoc-division-kamila-valieva-roc-v-international-testing-agency-ita.html',
        type: '官方文件'
      }
    ],
    summary: '未成年禁藥：保護措施與懲罰的平衡。',
    educationalNotes: '未成年運動員的禁藥案例涉及更複雜的責任歸屬問題。'
  },
  {
    athleteName: 'Paul Pogba',
    nationality: '法國',
    sport: '足球',
    substance: 'Testosterone',
    substanceCategory: '類固醇',
    year: 2023,
    eventBackground: '法國足球巨星因睪固酮陽性被禁賽4年，震驚足球界。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '職業生涯重大打擊'
    },
    sourceLinks: [
      {
        title: 'NADO Italia Paul Pogba Case',
        url: 'https://www.figc.it/it/federazione/procura-federale/',
        type: '官方文件'
      }
    ],
    summary: '足球巨星：現代足球的禁藥震撼。',
    educationalNotes: '即使在檢測相對寬鬆的足球項目，嚴重違規仍會被發現。'
  },
  {
    athleteName: 'Jannik Sinner',
    nationality: '義大利',
    sport: '網球',
    substance: 'Clostebol (微量)',
    substanceCategory: '類固醇',
    year: 2024,
    eventBackground: '義大利網球新星因按摩師使用含禁藥軟膏導致微量檢出，但被認定無過錯。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '積分和獎金暫時扣除後歸還'
    },
    sourceLinks: [
      {
        title: 'ITIA Jannik Sinner Clostebol Case',
        url: 'https://www.itftennis.com/en/news-and-media/articles/sinner-independent-tribunal-decision/',
        type: '官方文件'
      }
    ],
    summary: '無過錯污染：現代檢測的精確性與挑戰。',
    educationalNotes: '微量檢出可能來自無意污染，需要詳細調查確定責任。'
  },
  {
    athleteName: 'Erling Haaland',
    nationality: '挪威',
    sport: '足球',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '挪威足球超級巨星在現代足球最高水平保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'UEFA Anti-Doping Programme',
        url: 'https://www.uefa.com/insideuefa/football-development/anti-doping/',
        type: '官方文件'
      }
    ],
    summary: '現代足球典範：新世代的清白競技代表。',
    educationalNotes: '現代足球巨星可以在清白狀態下達到前所未有的成就。'
  },
  {
    athleteName: 'Shelly-Ann Fraser-Pryce',
    nationality: '牙買加',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '牙買加短跑女王在15年職業生涯中保持清白，成為加勒比海地區典範。',
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
    summary: '加勒比海典範：牙買加短跑的清白傳奇。',
    educationalNotes: '加勒比海國家展現了短跑項目的自然天賦與清白競技。'
  },
  {
    athleteName: 'Sha\'Carri Richardson',
    nationality: '美國',
    sport: '田徑',
    substance: 'Cannabis',
    substanceCategory: '其他',
    year: 2021,
    eventBackground: '美國短跑新星因使用大麻錯過東京奧運會，引發規則合理性討論。',
    punishment: {
      banDuration: '1個月',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '錯過東京奧運會'
    },
    sourceLinks: [
      {
        title: 'USADA Sha\'Carri Richardson Cannabis Case',
        url: 'https://www.usada.org/news/athlete-test-results/richardson-accepts-one-month-suspension/',
        type: 'WADA'
      }
    ],
    summary: '大麻案例：社會觀念變化與禁藥規則的衝突。',
    educationalNotes: '大麻在比賽中被禁用，但社會接受度的變化引發規則討論。'
  },
  {
    athleteName: 'Galen Rupp',
    nationality: '美國',
    sport: '田徑',
    substance: '清白記錄 (爭議)',
    substanceCategory: '其他',
    year: 2019,
    eventBackground: 'Oregon Project核心成員在教練Salazar被禁後保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '受教練醜聞影響聲譽'
    },
    sourceLinks: [
      {
        title: 'Oregon Project Investigation Findings',
        url: 'https://www.usada.org/news/usada-announces-4-year-sanctions-alberto-salazar-jeffrey-brown/',
        type: 'WADA'
      }
    ],
    summary: '教練陰影：清白運動員受教練違規影響。',
    educationalNotes: '運動員需要謹慎選擇教練和訓練環境以避免違規風險。'
  },
  {
    athleteName: 'Mo Farah',
    nationality: '英國',
    sport: '田徑',
    substance: '清白記錄 (爭議)',
    substanceCategory: '其他',
    year: 2019,
    eventBackground: '英國長跑傳奇曾與Salazar合作但未被發現違規，保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '受教練醜聞質疑'
    },
    sourceLinks: [
      {
        title: 'Mo Farah Salazar Connection Investigation',
        url: 'https://www.bbc.com/sport/athletics/49809847',
        type: '新聞'
      }
    ],
    summary: '關聯清白：與問題教練合作但保持清白。',
    educationalNotes: '運動員即使與違規教練有關聯，若無直接證據仍可保持清白。'
  },
  {
    athleteName: 'Caster Semenya',
    nationality: '南非',
    sport: '田徑',
    substance: '生理爭議',
    substanceCategory: '其他',
    year: 2019,
    eventBackground: '南非中距離選手因DSD條例被要求降低睪固酮水平引發性別爭議。',
    punishment: {
      banDuration: '條件限制',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無法參加特定距離比賽'
    },
    sourceLinks: [
      {
        title: 'CAS Caster Semenya DSD Regulations',
        url: 'https://www.tas-cas.org/en/general-information/news-overview/article/cas-decision-in-caster-semenya-athletics-south-africa-and-iaaf-matter-an-executive-summary.html',
        type: '官方文件'
      }
    ],
    summary: 'DSD爭議：生理差異與競技公平的複雜問題。',
    educationalNotes: 'DSD條例涉及生物性別與競技公平的複雜倫理問題。'
  },
  {
    athleteName: 'Joshua Cheptegei',
    nationality: '烏干達',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '烏干達長跑之王在5000m和10000m世界紀錄中保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Joshua Cheptegei',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '東非長跑：烏干達的清白世界紀錄保持者。',
    educationalNotes: '東非長跑運動員展現自然天賦在清白狀態下的極限。'
  },
  {
    athleteName: 'Letesenbet Gidey',
    nationality: '衣索比亞',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '衣索比亞女子長跑選手在5000m、10000m和半馬保持世界紀錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Letesenbet Gidey',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '衣索比亞女將：東非女子長跑的清白統治者。',
    educationalNotes: '非洲女子長跑運動員的自然優勢與清白競技的結合。'
  },
  {
    athleteName: 'Yulimar Rojas',
    nationality: '委內瑞拉',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '委內瑞拉三級跳世界紀錄保持者在南美洲代表清白競技典範。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Yulimar Rojas',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '南美典範：委內瑞拉的清白世界紀錄保持者。',
    educationalNotes: '南美洲運動員在技術性項目中的清白成就。'
  },
  {
    athleteName: 'Neeraj Chopra',
    nationality: '印度',
    sport: '田徑',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '印度標槍奧運冠軍成為南亞地區清白競技的代表。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'World Athletics Neeraj Chopra',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '南亞突破：印度田徑的歷史性清白成就。',
    educationalNotes: '南亞運動員在田徑項目中的清白突破具有重要象徵意義。'
  },
  {
    athleteName: 'Ryan Murphy',
    nationality: '美國',
    sport: '游泳',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國仰泳之王在多屆奧運會中保持清白統治地位。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'USA Swimming Clean Sport Programme',
        url: 'https://www.usaswimming.org/',
        type: '官方文件'
      }
    ],
    summary: '仰泳統治者：專項游泳的清白典範。',
    educationalNotes: '專項游泳運動員的清白競技可以達到長期統治地位。'
  },
  {
    athleteName: 'Adam Peaty',
    nationality: '英國',
    sport: '游泳',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '英國蛙泳之王在50m和100m蛙泳中的長期統治。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'British Swimming Anti-Doping',
        url: 'https://www.swimming.org/britishswimming/',
        type: '官方文件'
      }
    ],
    summary: '英國蛙王：歐洲游泳的清白代表。',
    educationalNotes: '歐洲游泳運動員在嚴格監管下的清白成就。'
  },
  {
    athleteName: 'Ariarne Titmus',
    nationality: '澳洲',
    sport: '游泳',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '澳洲自由式女王在中距離自由式項目中挑戰美國霸權。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'Swimming Australia Anti-Doping',
        url: 'https://www.swimming.org.au/',
        type: '官方文件'
      }
    ],
    summary: '澳洲游泳：南半球游泳強國的清白代表。',
    educationalNotes: '澳洲游泳在嚴格反禁藥文化下培養出世界級選手。'
  },
  {
    athleteName: 'Caeleb Dressel',
    nationality: '美國',
    sport: '游泳',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2023,
    eventBackground: '美國短距離游泳之王在東京奧運會創下多項佳績。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'USA Swimming Anti-Doping Programme',
        url: 'https://www.usaswimming.org/',
        type: '官方文件'
      }
    ],
    summary: '短距離游泳王：美國游泳的新世代代表。',
    educationalNotes: '新世代游泳運動員在嚴格監管下的清白成就。'
  },
  {
    athleteName: 'Kylian Mbappé',
    nationality: '法國',
    sport: '足球',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '法國足球超級巨星在世界盃和歐洲盃中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'FIFA Anti-Doping Programme',
        url: 'https://www.fifa.com/about-fifa/who-we-are/news/fifa-anti-doping-programme',
        type: '官方文件'
      }
    ],
    summary: '足球新世代：現代足球的清白超級巨星。',
    educationalNotes: '現代足球巨星可以在清白狀態下達到世界頂峰。'
  },
  {
    athleteName: 'Lionel Messi',
    nationality: '阿根廷',
    sport: '足球',
    substance: 'HGH治療 (合法)',
    substanceCategory: '其他',
    year: 2005,
    eventBackground: '阿根廷足球傳奇少年時期因生長激素缺乏接受合法HGH治療。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '合法醫療治療'
    },
    sourceLinks: [
      {
        title: 'Messi Growth Hormone Treatment History',
        url: 'https://www.fifa.com/',
        type: '官方文件'
      }
    ],
    summary: '合法治療：醫療需求與競技運動的平衡。',
    educationalNotes: '合法的醫療治療與禁藥使用有明確區別和嚴格監管。'
  },
  {
    athleteName: 'Max Verstappen',
    nationality: '荷蘭',
    sport: 'F1賽車',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: 'F1世界冠軍在賽車運動中保持清白記錄，展現技術運動的純粹性。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'FIA Anti-Doping Programme',
        url: 'https://www.fia.com/anti-doping',
        type: '官方文件'
      }
    ],
    summary: 'F1典範：技術運動中的清白競技。',
    educationalNotes: '技術主導的運動項目中，清白競技是成功的基礎。'
  },
  {
    athleteName: 'Naomi Osaka',
    nationality: '日本',
    sport: '網球',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '日本網球巨星在大滿貫賽事中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'ITF Tennis Anti-Doping Programme',
        url: 'https://www.itftennis.com/',
        type: '官方文件'
      }
    ],
    summary: '亞洲網球：日本網球的清白代表。',
    educationalNotes: '亞洲網球運動員在國際舞台上的清白成就。'
  },
  {
    athleteName: 'Steph Curry',
    nationality: '美國',
    sport: '籃球',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: 'NBA超級巨星在15年職業生涯中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'NBA Anti-Drug Agreement',
        url: 'https://www.nba.com/',
        type: '官方文件'
      }
    ],
    summary: 'NBA典範：職業籃球的清白超級巨星。',
    educationalNotes: 'NBA頂級球員的清白職業生涯展現個人品格的重要性。'
  },
  {
    athleteName: 'Simona Halep',
    nationality: '羅馬尼亞',
    sport: '網球',
    substance: 'Roxadustat',
    substanceCategory: '其他',
    year: 2022,
    eventBackground: '前世界第一因檢出血液增強劑被禁賽4年，聲稱來自污染補充劑。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '職業生涯重大打擊'
    },
    sourceLinks: [
      {
        title: 'ITIA Simona Halep Roxadustat Case',
        url: 'https://www.itftennis.com/en/news-and-media/articles/halep-charged-with-anti-doping-rule-violation/',
        type: '官方文件'
      }
    ],
    summary: '補充劑污染：現代網球的禁藥震撼。',
    educationalNotes: '補充劑污染是運動員需要特別注意的風險。'
  },
  {
    athleteName: 'Anderson Silva',
    nationality: '巴西',
    sport: 'MMA/UFC',
    substance: 'Multiple steroids',
    substanceCategory: '類固醇',
    year: 2015,
    eventBackground: '巴西MMA傳奇因多種類固醇陽性被禁賽，格鬥運動禁藥問題的代表案例。',
    punishment: {
      banDuration: '1年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: 'UFC生涯受重創'
    },
    sourceLinks: [
      {
        title: 'USADA Anderson Silva Multiple Violations',
        url: 'https://www.usada.org/news/athlete-test-results/anderson-silva-receives-one-year-sanction/',
        type: 'WADA'
      }
    ],
    summary: 'MMA禁藥：格鬥運動的類固醇問題。',
    educationalNotes: '格鬥運動中類固醇使用不僅違規，也增加對手受傷風險。'
  },
  {
    athleteName: 'Jon Jones',
    nationality: '美國',
    sport: 'MMA/UFC',
    substance: 'Turinabol metabolites',
    substanceCategory: '類固醇',
    year: 2017,
    eventBackground: '美國MMA巨星多次檢出類固醇代謝物，UFC史上最複雜的禁藥案例。',
    punishment: {
      banDuration: '15個月',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '多次比賽取消'
    },
    sourceLinks: [
      {
        title: 'USADA Jon Jones Complex Case',
        url: 'https://www.usada.org/news/athlete-test-results/jon-jones-receives-15-month-sanction/',
        type: 'WADA'
      }
    ],
    summary: 'UFC複雜案例：長期代謝物檢出的科學爭議。',
    educationalNotes: '類固醇代謝物可能在體內殘留很長時間，造成複雜的檢測問題。'
  },
  {
    athleteName: 'TJ Dillashaw',
    nationality: '美國',
    sport: 'MMA/UFC',
    substance: 'EPO',
    substanceCategory: 'EPO',
    year: 2019,
    eventBackground: '美國UFC前冠軍承認使用EPO，格鬥運動中少見的EPO案例。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '主動交回冠軍腰帶'
    },
    sourceLinks: [
      {
        title: 'USADA TJ Dillashaw EPO Admission',
        url: 'https://www.usada.org/news/athlete-test-results/dillashaw-accepts-two-year-sanction/',
        type: 'WADA'
      }
    ],
    summary: 'UFC EPO：格鬥運動中的耐力增強劑使用。',
    educationalNotes: 'EPO在格鬥運動中可以增強心肺功能和恢復能力。'
  },
  {
    athleteName: 'Conor McGregor',
    nationality: '愛爾蘭',
    sport: 'MMA/UFC',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '愛爾蘭MMA巨星在職業生涯中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'USADA Testing Pool McGregor',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: 'UFC清白：格鬥運動中的清白巨星。',
    educationalNotes: '即使在高風險的格鬥運動中，頂級選手仍可保持清白。'
  },
  {
    athleteName: 'Israel Adesanya',
    nationality: '奈及利亞',
    sport: 'MMA/UFC',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '奈及利亞UFC冠軍在激烈競爭中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'UFC Anti-Doping Policy',
        url: 'https://www.ufc.com/athlete-conduct-policy',
        type: '官方文件'
      }
    ],
    summary: '非洲UFC：非洲選手的清白成就。',
    educationalNotes: '非洲格鬥選手在國際舞台上的清白競技典範。'
  },
  {
    athleteName: 'Canelo Alvarez',
    nationality: '墨西哥',
    sport: '拳擊',
    substance: 'Clenbuterol (微量)',
    substanceCategory: '其他',
    year: 2018,
    eventBackground: '墨西哥拳擊巨星因微量clenbuterol檢出被暫停，聲稱來自污染牛肉。',
    punishment: {
      banDuration: '6個月',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '重要比賽延期'
    },
    sourceLinks: [
      {
        title: 'NSAC Canelo Clenbuterol Case',
        url: 'https://www.boxingscene.com/canelo-suspension-lifted-nsac--127403',
        type: '新聞'
      }
    ],
    summary: '拳擊污染案：墨西哥牛肉污染的經典案例。',
    educationalNotes: '某些地區的食物污染問題需要運動員特別注意。'
  },
  {
    athleteName: 'Anthony Joshua',
    nationality: '英國',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '英國重量級拳王在職業生涯中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'BBBofC Anti-Doping Policy',
        url: 'https://www.bbbofc.com/',
        type: '官方文件'
      }
    ],
    summary: '英國重拳：拳擊運動的清白冠軍。',
    educationalNotes: '拳擊運動中的清白競技對選手安全和運動形象都很重要。'
  },
  {
    athleteName: 'Tyson Fury',
    nationality: '英國',
    sport: '拳擊',
    substance: 'Nandrolone (爭議)',
    substanceCategory: '類固醇',
    year: 2015,
    eventBackground: '英國重量級拳手的nandrolone案例經過長期法律程序最終和解。',
    punishment: {
      banDuration: '追溯至2015年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '2年實質禁賽'
    },
    sourceLinks: [
      {
        title: 'UKAD Tyson Fury Settlement',
        url: 'https://www.ukad.org.uk/news/article/ukad-statement-fury-hughie-fury',
        type: '官方文件'
      }
    ],
    summary: '拳擊爭議案：複雜的法律和科學爭議。',
    educationalNotes: '禁藥案例有時涉及複雜的法律程序和科學證據評估。'
  },
  {
    athleteName: 'Floyd Mayweather',
    nationality: '美國',
    sport: '拳擊',
    substance: 'TUE使用爭議',
    substanceCategory: '其他',
    year: 2015,
    eventBackground: '美國拳擊傳奇的TUE使用引發程序爭議但未構成違規。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '程序爭議'
    },
    sourceLinks: [
      {
        title: 'USADA Mayweather TUE Controversy',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: 'TUE程序：治療用途豁免的程序重要性。',
    educationalNotes: 'TUE的申請和批准程序必須嚴格遵守時間要求。'
  },
  {
    athleteName: 'Manny Pacquiao',
    nationality: '菲律賓',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2019,
    eventBackground: '菲律賓拳擊傳奇在長期職業生涯中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'WBO Anti-Doping Policy',
        url: 'https://www.wboboxing.com/',
        type: '官方文件'
      }
    ],
    summary: '亞洲拳王：菲律賓拳擊的清白傳奇。',
    educationalNotes: '亞洲拳擊選手在國際舞台上的清白成就典範。'
  },
  {
    athleteName: 'Gennady Golovkin',
    nationality: '哈薩克',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '哈薩克中量級拳王在職業生涯中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'IBF Anti-Doping Programme',
        url: 'https://www.ibf-usba-boxing.com/',
        type: '官方文件'
      }
    ],
    summary: '中亞拳擊：哈薩克的清白世界冠軍。',
    educationalNotes: '中亞拳擊選手在國際拳壇的清白競技典範。'
  },
  {
    athleteName: 'Katie Taylor',
    nationality: '愛爾蘭',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '愛爾蘭女子拳擊巨星在職業和業餘生涯中保持清白。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'AIBA Anti-Doping Programme',
        url: 'https://www.iba.sport/',
        type: '官方文件'
      }
    ],
    summary: '女子拳擊：愛爾蘭女拳的清白統治者。',
    educationalNotes: '女子拳擊運動的清白競技典範和運動發展。'
  },
  {
    athleteName: 'Claressa Shields',
    nationality: '美國',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '美國女子拳擊巨星在多個級別保持清白統治地位。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'WBC Anti-Doping Policy',
        url: 'https://www.wbcboxing.com/',
        type: '官方文件'
      }
    ],
    summary: '美國女拳：多級別的清白統治者。',
    educationalNotes: '美國女子拳擊在清白競技下的快速發展。'
  },
  {
    athleteName: 'Terence Crawford',
    nationality: '美國',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '美國次中量級拳王在職業生涯中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'WBO Anti-Doping Policy',
        url: 'https://www.wboboxing.com/',
        type: '官方文件'
      }
    ],
    summary: '美國拳擊：現代拳擊的清白代表。',
    educationalNotes: '現代美國拳擊在嚴格監管下的清白競技水準。'
  },
  {
    athleteName: 'Errol Spence Jr.',
    nationality: '美國',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '美國次中量級拳手在頂級競爭中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'IBF Anti-Doping Programme',
        url: 'https://www.ibf-usba-boxing.com/',
        type: '官方文件'
      }
    ],
    summary: '次中量級：美國拳擊的清白競爭。',
    educationalNotes: '激烈的拳擊競爭中仍可保持清白競技水準。'
  },
  {
    athleteName: 'Oleksandr Usyk',
    nationality: '烏克蘭',
    sport: '拳擊',
    substance: '清白記錄',
    substanceCategory: '其他',
    year: 2024,
    eventBackground: '烏克蘭重量級統一冠軍在職業生涯中保持清白記錄。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '無違規記錄'
    },
    sourceLinks: [
      {
        title: 'WBA Anti-Doping Policy',
        url: 'https://www.wbaboxing.com/',
        type: '官方文件'
      }
    ],
    summary: '東歐拳擊：烏克蘭的清白重量級王者。',
    educationalNotes: '東歐拳擊選手在國際拳壇的清白競技成就。'
  }
];

async function addModern2010s2020sCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    console.log(`Adding ${modern2010s2020sCases.length} modern 2010s-2020s cases...`);

    // Insert modern era cases
    const insertedCases = await Case.insertMany(modern2010s2020sCases);
    console.log(`Successfully added ${insertedCases.length} modern 2010s-2020s cases`);

    // Update related cases for all existing cases
    console.log('Updating related cases for all entries...');
    const allCases = await Case.find({});
    
    for (let i = 0; i < allCases.length; i++) {
      const currentCase = allCases[i];
      
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

    console.log('Updated related cases for all entries');
    
    const totalCases = await Case.countDocuments();
    console.log(`Total cases in database: ${totalCases}`);

    // Generate comprehensive statistics
    const sportStats = await Case.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const substanceStats = await Case.aggregate([
      { $group: { _id: '$substanceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const nationalityStats = await Case.aggregate([
      { $group: { _id: '$nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const decadeStats = await Case.aggregate([
      { 
        $addFields: { 
          decade: { 
            $concat: [
              { $toString: { $multiply: [{ $floor: { $divide: ['$year', 10] } }, 10] } },
              's'
            ]
          } 
        }
      },
      { $group: { _id: '$decade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n=== FINAL DATABASE COMPREHENSIVE SUMMARY ===');
    console.log(`🎯 TOTAL CASES: ${totalCases}`);
    console.log('\n📊 TOP SPORTS:');
    sportStats.slice(0, 10).forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat._id}: ${stat.count} cases`);
    });

    console.log('\n💊 SUBSTANCE CATEGORIES:');
    substanceStats.forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat._id}: ${stat.count} cases`);
    });

    console.log('\n🌍 TOP COUNTRIES:');
    nationalityStats.slice(0, 15).forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat._id}: ${stat.count} cases`);
    });

    console.log('\n📅 BY DECADE:');
    decadeStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} cases`);
    });

    console.log('\n🎉 FINAL EXPANSION COMPLETED SUCCESSFULLY!');
    console.log('📚 40-year comprehensive sports doping cases database is now complete.');
    console.log('🔍 Coverage: 1980s to 2024, spanning multiple sports, countries, and substance types.');
    console.log('✅ Educational value: Historical progression, clean athletes, controversial cases, and modern challenges.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding modern 2010s-2020s cases:', error);
    process.exit(1);
  }
}

addModern2010s2020sCases();