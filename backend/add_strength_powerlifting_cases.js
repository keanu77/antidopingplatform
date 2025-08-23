const mongoose = require('mongoose');
const Case = require('./models/Case');

// 連接資料庫
mongoose.connect('mongodb://localhost:27017/antidoping')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 舉重與力量型項目補充案例（從用戶提供的列表中選取重要案例）
const strengthCases = [
  {
    athleteName: "Zlatan Vanev",
    nationality: "保加利亞",
    sport: "舉重",
    substance: "Stanozolol",
    substanceCategory: "S1: 合成代謝劑",
    year: 1984,
    eventBackground: "1984年保加利亞舉重選手Zlatan Vanev因使用Stanozolol被檢出陽性，是早期舉重禁藥案例之一。",
    punishment: {
      banDuration: "18個月",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "保加利亞舉重隊多名選手同批違規"
    },
    sourceLinks: [
      {
        title: "IWF Historical Records",
        url: "https://www.iwf.net/",
        type: "官方文件"
      }
    ],
    summary: "1980年代保加利亞舉重系統性使用禁藥的重要案例之一。",
    educationalNotes: "Stanozolol是強效合成代謝類固醇，能顯著增加力量和肌肉量，但對肝臟和心血管系統有嚴重副作用。"
  },
  {
    athleteName: "Mitko Grabnev",
    nationality: "保加利亞",
    sport: "舉重",
    substance: "Furosemide",
    substanceCategory: "S5: 利尿劑和掩蔽劑",
    year: 1988,
    eventBackground: "1988年首爾奧運，保加利亞舉重選手Mitko Grabnev因使用利尿劑Furosemide被檢出陽性。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "首爾奧運銅牌被取消"
    },
    sourceLinks: [
      {
        title: "IOC Official Report",
        url: "https://www.olympic.org/",
        type: "官方文件"
      }
    ],
    summary: "1988年首爾奧運舉重項目禁藥案例，展現了利尿劑作為掩蔽劑的使用。",
    educationalNotes: "利尿劑不僅可以快速減重，更重要的是能稀釋尿液中其他禁藥的濃度，因此被列為掩蔽劑。"
  },
  {
    athleteName: "Izabela Dragneva",
    nationality: "保加利亞",
    sport: "舉重",
    substance: "Furosemide",
    substanceCategory: "S5: 利尿劑和掩蔽劑",
    year: 2000,
    eventBackground: "2000年雪梨奧運，保加利亞女子舉重選手Izabela Dragneva因使用Furosemide被取消金牌。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "雪梨奧運金牌被取消"
    },
    sourceLinks: [
      {
        title: "IOC Disciplinary Report",
        url: "https://www.olympic.org/",
        type: "官方文件"
      }
    ],
    summary: "2000年奧運女子舉重金牌被取消的重大案例。",
    educationalNotes: "女子舉重項目中利尿劑的使用不僅是為了掩蔽，也可能用於快速降體重以符合量級要求。"
  },
  {
    athleteName: "Ferenc Gyurkovics",
    nationality: "匈牙利",
    sport: "舉重",
    substance: "Oxandrolone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2004,
    eventBackground: "2004年雅典奧運，匈牙利舉重選手Ferenc Gyurkovics因使用Oxandrolone被取消銀牌。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "雅典奧運銀牌被取消"
    },
    sourceLinks: [
      {
        title: "IOC Anti-Doping Report",
        url: "https://www.olympic.org/",
        type: "官方文件"
      }
    ],
    summary: "2004年雅典奧運舉重項目禁藥案例，Oxandrolone是溫和但有效的合成代謝類固醇。",
    educationalNotes: "Oxandrolone被認為是副作用較小的合成代謝類固醇，但仍能有效增加力量和肌肉品質。"
  },
  {
    athleteName: "Oleg Perepetchenov",
    nationality: "俄羅斯",
    sport: "舉重",
    substance: "合成代謝類固醇",
    substanceCategory: "S1: 合成代謝劑",
    year: 2004,
    eventBackground: "2004年雅典奧運，俄羅斯舉重選手Oleg Perepetchenov因使用合成代謝類固醇被取消銅牌。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "雅典奧運銅牌被取消"
    },
    sourceLinks: [
      {
        title: "IOC Disciplinary Commission",
        url: "https://www.olympic.org/",
        type: "官方文件"
      }
    ],
    summary: "2004年奧運俄羅斯舉重選手的禁藥案例。",
    educationalNotes: "俄羅斯在力量項目中長期存在禁藥問題，這個案例是冰山一角。"
  },
  {
    athleteName: "Andrei Rybakou",
    nationality: "白俄羅斯",
    sport: "舉重",
    substance: "Oral-Turinabol, Stanozolol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2008,
    eventBackground: "2008年北京奧運銀牌得主Andrei Rybakou在2016年IOC重檢中被發現使用多種合成代謝類固醇。",
    punishment: {
      banDuration: "終身禁賽",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "北京奧運銀牌被取消"
    },
    sourceLinks: [
      {
        title: "IOC Reanalysis Results",
        url: "https://www.olympic.org/",
        type: "官方文件"
      }
    ],
    summary: "IOC奧運樣本重檢發現的重要案例，展現了檢測技術進步的重要性。",
    educationalNotes: "Oral-Turinabol是東德國家禁藥計劃的主要藥物，現在仍被濫用於力量項目。"
  },
  {
    athleteName: "Irina Nekrasova",
    nationality: "哈薩克",
    sport: "舉重",
    substance: "Stanozolol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2008,
    eventBackground: "2008年北京奧運哈薩克女子舉重選手Irina Nekrasova在IOC重檢中被發現使用Stanozolol。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "北京奧運銀牌被取消"
    },
    sourceLinks: [
      {
        title: "IOC Disciplinary Report",
        url: "https://www.olympic.org/",
        type: "官方文件"
      }
    ],
    summary: "哈薩克女子舉重在奧運重檢中被發現的禁藥案例。",
    educationalNotes: "女子力量項目中Stanozolol的使用能顯著提升力量重量比，但會造成男性化副作用。"
  },
  {
    athleteName: "Oleksiy Torokhtiy",
    nationality: "烏克蘭",
    sport: "舉重",
    substance: "Turinabol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2012,
    eventBackground: "2012年倫敦奧運金牌得主Oleksiy Torokhtiy在IOC重檢中被發現使用Turinabol，金牌被取消。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "倫敦奧運金牌被取消"
    },
    sourceLinks: [
      {
        title: "CAS Arbitration Report",
        url: "https://www.tas-cas.org/",
        type: "官方文件"
      }
    ],
    summary: "2012年倫敦奧運舉重金牌被取消的重大案例，展現了奧運樣本重檢的重要性。",
    educationalNotes: "即使是奧運金牌得主，一旦發現使用禁藥，仍會面臨嚴厲制裁，包括取消所有榮譽。"
  }
];

async function addStrengthCases() {
  try {
    console.log(`準備添加 ${strengthCases.length} 個力量型項目案例...`);
    
    for (let i = 0; i < strengthCases.length; i++) {
      const caseData = strengthCases[i];
      
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
      console.log(`✅ 已添加: ${caseData.athleteName} (${caseData.year}) - ${caseData.sport} - ${caseData.nationality}`);
    }
    
    // 統計資料庫狀況
    const totalCases = await Case.countDocuments();
    const totalSports = await Case.distinct('sport');
    const totalCountries = await Case.distinct('nationality');
    const weightliftingCases = await Case.countDocuments({ sport: '舉重' });
    
    console.log('\n📊 資料庫更新後統計:');
    console.log(`   總案例數: ${totalCases}`);
    console.log(`   運動項目: ${totalSports.length}`);
    console.log(`   涵蓋國家: ${totalCountries.length}`);
    console.log(`   舉重案例: ${weightliftingCases}`);
    
  } catch (error) {
    console.error('添加力量型案例時發生錯誤:', error);
  } finally {
    mongoose.disconnect();
  }
}

addStrengthCases();