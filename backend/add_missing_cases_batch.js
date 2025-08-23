const mongoose = require('mongoose');
const Case = require('./models/Case');

// 連接資料庫
mongoose.connect('mongodb://localhost:27017/antidoping')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 缺失的真實案例
const missingCases = [
  {
    athleteName: "Jessica Hardy",
    nationality: "美國",
    sport: "游泳",
    substance: "Clenbuterol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2008,
    eventBackground: "2008年美國奧運選拔賽前，Jessica Hardy因意外攝入含有Clenbuterol的營養補劑而檢出陽性，失去北京奧運參賽資格。",
    punishment: {
      banDuration: "1年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "失去2008北京奧運參賽資格"
    },
    sourceLinks: [
      {
        title: "WADA - Jessica Hardy Case",
        url: "https://www.wada-ama.org/",
        type: "WADA"
      },
      {
        title: "USADA Official Report",
        url: "https://www.usada.org/",
        type: "官方文件"
      }
    ],
    summary: "美國游泳選手因意外攝入禁藥而失去奧運參賽機會的經典案例，展現了運動員對營養補劑使用需謹慎的重要性。",
    educationalNotes: "Clenbuterol是一種β2激動劑，常用於治療哮喘，但也被濫用作減脂和增肌藥物。運動員必須對所有攝入物質負責。"
  },
  {
    athleteName: "Kostas Kenteris",
    nationality: "希臘",
    sport: "田徑",
    substance: "逃避藥檢",
    substanceCategory: "其他/清白記錄",
    year: 2004,
    eventBackground: "2004年雅典奧運前，希臘短跑雙雄Kostas Kenteris和Katerina Thanou因未能配合藥檢而被禁止參加雅典奧運。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "被禁止參加2004雅典奧運"
    },
    sourceLinks: [
      {
        title: "ESPN - Kenteris Thanou Case",
        url: "https://www.espn.com/",
        type: "新聞"
      },
      {
        title: "IOC Official Statement",
        url: "https://www.olympic.org/",
        type: "官方文件"
      }
    ],
    summary: "2004年雅典奧運東道主選手逃避藥檢的重大醜聞，對希臘田徑運動造成重大打擊。",
    educationalNotes: "逃避或拒絕接受藥檢等同於使用禁藥，會面臨同等嚴厲的處罰。運動員有義務配合反禁藥檢測。"
  },
  {
    athleteName: "Katerina Thanou",
    nationality: "希臘", 
    sport: "田徑",
    substance: "逃避藥檢",
    substanceCategory: "其他/清白記錄",
    year: 2004,
    eventBackground: "2004年雅典奧運前，希臘短跑選手Katerina Thanou與Kostas Kenteris一同因未能配合藥檢而被禁止參加雅典奧運。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "被禁止參加2004雅典奧運"
    },
    sourceLinks: [
      {
        title: "ESPN - Kenteris Thanou Case",
        url: "https://www.espn.com/",
        type: "新聞"
      },
      {
        title: "IOC Official Statement",
        url: "https://www.olympic.org/",
        type: "官方文件"
      }
    ],
    summary: "2004年雅典奧運東道主選手逃避藥檢的重大醜聞案例之一。",
    educationalNotes: "與男子選手Kostas Kenteris同案，展現了逃避藥檢的嚴重後果。"
  },
  {
    athleteName: "C.J. Hunter",
    nationality: "美國",
    sport: "田徑",
    substance: "Nandrolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2000,
    eventBackground: "2000年雪梨奧運期間，美國鉛球選手C.J. Hunter（Marion Jones的丈夫）被檢出Nandrolone陽性，震驚田徑界。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "退出2000雪梨奧運"
    },
    sourceLinks: [
      {
        title: "ABC News - C.J. Hunter Case",
        url: "https://abcnews.go.com/",
        type: "新聞"
      },
      {
        title: "USADA Report",
        url: "https://www.usada.org/",
        type: "官方文件"
      }
    ],
    summary: "2000年代美國田徑禁藥醜聞的重要案例之一，與BALCO案相關聯。",
    educationalNotes: "Nandrolone是強效合成代謝類固醇，能顯著增加肌肉量和力量，但會對身體造成嚴重副作用。"
  },
  {
    athleteName: "Yulia Efimova",
    nationality: "俄羅斯",
    sport: "游泳",
    substance: "7-keto-DHEA",
    substanceCategory: "S1: 合成代謝劑",
    year: 2013,
    eventBackground: "2013年俄羅斯游泳選手Yulia Efimova因使用7-keto-DHEA被檢出陽性，遭到禁賽處分。",
    punishment: {
      banDuration: "16個月",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "錯過2013-2014賽季"
    },
    sourceLinks: [
      {
        title: "FINA Official Report",
        url: "https://www.worldaquatics.com/",
        type: "官方文件"
      },
      {
        title: "Swimming World Magazine",
        url: "https://www.swimmingworldmagazine.com/",
        type: "新聞"
      }
    ],
    summary: "俄羅斯游泳選手因使用DHEA衍生物而被禁賽的案例，後來重返泳池並在奧運奪牌。",
    educationalNotes: "DHEA及其衍生物是天然激素的前體，被列為禁藥是因為其潛在的合成代謝效果。"
  },
  {
    athleteName: "Tyson Fury",
    nationality: "英國",
    sport: "拳擊",
    substance: "Nandrolone",
    substanceCategory: "S1: 合成代謝劑", 
    year: 2015,
    eventBackground: "2015年WBC重量級拳王Tyson Fury在尿液樣本中被檢出微量Nandrolone，案件拖延至2017年達成和解。",
    punishment: {
      banDuration: "溯及既往2年禁賽",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "2017年復出"
    },
    sourceLinks: [
      {
        title: "UKAD Official Report",
        url: "https://www.ukad.org.uk/",
        type: "官方文件"
      },
      {
        title: "Guardian Boxing Report",
        url: "https://www.theguardian.com/",
        type: "新聞"
      }
    ],
    summary: "WBC重量級拳王的禁藥案例，展現了職業拳擊反禁藥執法的複雜性。",
    educationalNotes: "即使是微量的禁藥也可能導致嚴重後果。拳擊作為高對抗性運動，禁藥使用尤其危險。"
  },
  {
    athleteName: "Ryan Lochte",
    nationality: "美國",
    sport: "游泳", 
    substance: "超量靜脈輸注",
    substanceCategory: "M2: 化學和物理操作",
    year: 2018,
    eventBackground: "2018年美國游泳選手Ryan Lochte因接受超過100ml的靜脈輸注而違反WADA規定，遭到禁賽。",
    punishment: {
      banDuration: "14個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過2019世錦賽"
    },
    sourceLinks: [
      {
        title: "USADA Official Statement",
        url: "https://www.usada.org/",
        type: "官方文件"
      },
      {
        title: "CBS Sports News",
        url: "https://www.cbssports.com/",
        type: "新聞"
      }
    ],
    summary: "美國游泳名將因違反靜脈輸注規定而被禁賽的案例，展現了WADA規定的全面性。",
    educationalNotes: "超過100ml的靜脈輸注被禁止是因為可能被用來稀釋尿液中的禁藥濃度或快速改變血液成分。"
  }
];

async function addMissingCases() {
  try {
    console.log(`準備添加 ${missingCases.length} 個缺失案例...`);
    
    for (let i = 0; i < missingCases.length; i++) {
      const caseData = missingCases[i];
      
      // 檢查案例是否已存在
      const existing = await Case.findOne({ 
        athleteName: caseData.athleteName,
        year: caseData.year 
      });
      
      if (existing) {
        console.log(`❌ 案例已存在: ${caseData.athleteName} (${caseData.year})`);
        continue;
      }
      
      // 添加新案例
      const newCase = new Case(caseData);
      await newCase.save();
      console.log(`✅ 已添加: ${caseData.athleteName} (${caseData.year}) - ${caseData.sport}`);
    }
    
    // 統計資料庫狀況
    const totalCases = await Case.countDocuments();
    const totalSports = await Case.distinct('sport');
    const totalCountries = await Case.distinct('nationality');
    
    console.log('\n📊 資料庫更新後統計:');
    console.log(`   總案例數: ${totalCases}`);
    console.log(`   運動項目: ${totalSports.length}`);
    console.log(`   涵蓋國家: ${totalCountries.length}`);
    
  } catch (error) {
    console.error('添加案例時發生錯誤:', error);
  } finally {
    mongoose.disconnect();
  }
}

addMissingCases();