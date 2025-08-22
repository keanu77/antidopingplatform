const { MongoClient } = require('mongodb');

const famousAthletesCases = [
  // MLB 知名案例
  {
    athleteName: "Alex Rodriguez",
    nationality: "美國", 
    sport: "棒球",
    substance: "Testosterone, Human Growth Hormone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2013,
    eventBackground: "MLB 超級巨星 A-Rod 因使用多種禁藥被查獲，震撼職業棒球界。作為MLB薪資最高的球員之一，其禁藥醜聞成為體壇重大事件。",
    punishment: {
      banDuration: "211場比賽",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "失去2014年整個球季，薪資損失約2,500萬美元"
    },
    sourceLinks: [
      {
        title: "MLB Official Statement",
        url: "https://www.mlb.com/",
        type: "官方文件"
      }
    ],
    summary: "MLB超級巨星因系統性使用禁藥被重罰的重大案例，顯示即使是頂級運動員也無法逃脫反禁藥制裁。",
    educationalNotes: "此案例說明長期系統性使用多種禁藥的嚴重後果，不僅影響運動生涯，也對個人聲譽造成永久損害。"
  },
  {
    athleteName: "Barry Bonds",
    nationality: "美國",
    sport: "棒球", 
    substance: "BALCO Steroids (THG, Trenbolone)",
    substanceCategory: "S1: 合成代謝劑",
    year: 2003,
    eventBackground: "MLB全壘打王Barry Bonds捲入BALCO禁藥醜聞，雖然聲稱不知情使用，但其驚人的後期表現引發廣泛質疑。",
    punishment: {
      banDuration: "無正式禁賽",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "名聲受損，入選名人堂困難"
    },
    sourceLinks: [
      {
        title: "BALCO Investigation Report",
        url: "https://www.usada.org/",
        type: "調查報告"
      }
    ],
    summary: "MLB史上最具爭議的禁藥案例，涉及設計類固醇THG的使用。",
    educationalNotes: "BALCO醜聞揭露了設計類固醇的危險性，這些物質故意設計來逃避檢測。"
  },
  {
    athleteName: "Manny Ramirez", 
    nationality: "多明尼加",
    sport: "棒球",
    substance: "Human Chorionic Gonadotropin (HCG)",
    substanceCategory: "S4: 激素及代謝調節劑", 
    year: 2009,
    eventBackground: "MLB明星球員Manny Ramirez因使用HCG被抓獲，HCG常被用來掩蔽類固醇使用的副作用。",
    punishment: {
      banDuration: "50場比賽",
      resultsCancelled: false, 
      medalStripped: false,
      otherPenalties: "職業生涯後期聲譽受損"
    },
    sourceLinks: [
      {
        title: "MLB Drug Policy",
        url: "https://www.mlb.com/",
        type: "官方政策"
      }
    ],
    summary: "MLB首批被抓獲的大牌球星之一，展示了掩蔽劑的使用模式。",
    educationalNotes: "HCG作為掩蔽劑的教育案例，顯示運動員如何試圖隱藏類固醇使用。"
  },

  // NBA 知名案例
  {
    athleteName: "O.J. Mayo",
    nationality: "美國",
    sport: "籃球", 
    substance: "Dehydroepiandrosterone (DHEA)",
    substanceCategory: "S1: 合成代謝劑",
    year: 2016,
    eventBackground: "NBA球員O.J. Mayo因使用DHEA被NBA禁賽兩年，成為NBA近年來禁藥制裁最嚴重的案例之一。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "職業生涯實質結束"
    },
    sourceLinks: [
      {
        title: "NBA Anti-Drug Policy",
        url: "https://www.nba.com/",
        type: "官方政策"
      }
    ],
    summary: "NBA近年來最嚴重的禁藥制裁案例，展示了聯盟對禁藥零容忍的態度。",
    educationalNotes: "DHEA雖然在某些地區可合法購買，但在運動中被嚴格禁止，因為它可以轉化為睪固酮。"
  },

  // 網球知名案例 (已有 Iga Swiatek, Jannik Sinner，添加更多)
  {
    athleteName: "Maria Sharapova",
    nationality: "俄羅斯",
    sport: "網球",
    substance: "Meldonium", 
    substanceCategory: "S4: 激素及代謝調節劑",
    year: 2016,
    eventBackground: "五屆大滿貫得主Maria Sharapova因使用Meldonium被禁賽，該藥物在2016年1月才被列入禁用清單，但Sharapova未注意到這一變化。",
    punishment: {
      banDuration: "15個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "失去多項贊助合約，總損失估計超過4,000萬美元"
    },
    sourceLinks: [
      {
        title: "ITF Decision",
        url: "https://www.itftennis.com/",
        type: "官方裁決"
      },
      {
        title: "WADA Meldonium Information", 
        url: "https://www.wada-ama.org/",
        type: "WADA"
      }
    ],
    summary: "網球界最震撼的禁藥案例，展示了新禁用物質的適應期問題。",
    educationalNotes: "此案例提醒運動員必須持續關注WADA禁用清單的更新，無知不能成為違規的藉口。"
  },
  {
    athleteName: "Andre Agassi",
    nationality: "美國", 
    sport: "網球",
    substance: "Methamphetamine",
    substanceCategory: "S6: 興奮劑",
    year: 1997,
    eventBackground: "網球傳奇Andre Agassi在其自傳中承認1997年曾使用甲基安非他命，但當時成功申請TUE並避免了制裁。此案例在2009年自傳出版後才被公開。",
    punishment: {
      banDuration: "無（成功申請TUE）",
      resultsCancelled: false,
      medalStripped: false, 
      otherPenalties: "聲譽在自傳出版後受損"
    },
    sourceLinks: [
      {
        title: "Andre Agassi Autobiography",
        url: "https://www.itftennis.com/", 
        type: "自傳披露"
      }
    ],
    summary: "網球界最具爭議的歷史案例，展示了TUE制度的複雜性。",
    educationalNotes: "此案例引發了關於TUE制度透明度和公平性的廣泛討論。"
  },

  // 足球知名案例
  {
    athleteName: "Paul Pogba",
    nationality: "法國",
    sport: "足球",
    substance: "Testosterone", 
    substanceCategory: "S1: 合成代謝劑",
    year: 2023,
    eventBackground: "法國國家隊和尤文圖斯中場球星Paul Pogba因睪固酮檢測呈陽性被暫時禁賽，案例仍在調查中。作為世界盃冠軍隊成員，此案引起全球關注。",
    punishment: {
      banDuration: "暫時禁賽（調查中）",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "與尤文圖斯的合約可能受影響"
    },
    sourceLinks: [
      {
        title: "UEFA Anti-Doping", 
        url: "https://www.uefa.com/",
        type: "UEFA"
      },
      {
        title: "FIFA Anti-Doping Code",
        url: "https://www.fifa.com/",
        type: "FIFA"
      }
    ],
    summary: "當前足球界最受關注的禁藥案例，涉及世界級明星球員。",
    educationalNotes: "案例展示了現代足球反禁藥檢測的嚴格性，即使是頂級球星也無法倖免。"
  },
  {
    athleteName: "Rio Ferdinand",
    nationality: "英國", 
    sport: "足球",
    substance: "錯過藥檢",
    substanceCategory: "M2: 化學和物理操作",
    year: 2003,
    eventBackground: "英格蘭國家隊隊長Rio Ferdinand因錯過強制性藥檢被FIFA禁賽8個月，錯過了2004年歐洲國家盃。此案例強調了配合藥檢的重要性。",
    punishment: {
      banDuration: "8個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過2004年歐洲國家盃"
    },
    sourceLinks: [
      {
        title: "FA Decision",
        url: "https://www.thefa.com/", 
        type: "英格蘭足總"
      }
    ],
    summary: "足球界著名的錯過藥檢案例，展示了配合反禁藥工作的重要性。",
    educationalNotes: "錯過或拒絕藥檢與使用禁藥同樣嚴重，運動員有義務配合所有反禁藥程序。"
  },
  {
    athleteName: "Diego Maradona",
    nationality: "阿根廷",
    sport: "足球", 
    substance: "Ephedrine",
    substanceCategory: "S6: 興奮劑",
    year: 1994,
    eventBackground: "足球史上最偉大的球員之一Diego Maradona在1994年世界盃因使用麻黃素被驅逐出比賽，結束了他的世界盃生涯。這是足球史上最震撼的禁藥事件。",
    punishment: {
      banDuration: "15個月", 
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "被踢出1994年世界盃"
    },
    sourceLinks: [
      {
        title: "FIFA World Cup 1994",
        url: "https://www.fifa.com/",
        type: "FIFA"
      }
    ],
    summary: "足球史上最著名的禁藥案例，涉及史上最偉大的球員之一。",
    educationalNotes: "即使是足球傳奇也無法逃脫禁藥制裁，展示了反禁藥規則對所有人的平等適用。"
  },

  // 額外的重要案例
  {
    athleteName: "Justin Gatlin", 
    nationality: "美國",
    sport: "田徑",
    substance: "Testosterone",
    substanceCategory: "S1: 合成代謝劑", 
    year: 2006,
    eventBackground: "奧運金牌得主Justin Gatlin因第二次禁藥違規被禁賽4年，後減至2年。作為Usain Bolt的主要競爭對手，其復出後的表現持續引發爭議。",
    punishment: {
      banDuration: "4年（後減至2年）",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "失去多項贊助合約"
    },
    sourceLinks: [
      {
        title: "USADA Decision",
        url: "https://www.usada.org/", 
        type: "USADA"
      },
      {
        title: "World Athletics",
        url: "https://www.worldathletics.org/",
        type: "世界田徑"
      }
    ],
    summary: "田徑界重複違規的重要案例，展示了二次違規的嚴重後果。",
    educationalNotes: "重複違規顯示禁藥問題的頑固性，以及更嚴厲制裁的必要性。"
  }
];

async function addFamousAthletesCases() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('開始添加知名運動員禁藥案例...');
    
    for (const caseData of famousAthletesCases) {
      // 檢查是否已存在相同案例
      const existing = await db.collection('cases').findOne({
        athleteName: caseData.athleteName,
        year: caseData.year
      });
      
      if (existing) {
        console.log(`⚠️  案例已存在: ${caseData.athleteName} (${caseData.year})`);
        continue;
      }
      
      // 添加時間戳
      caseData.createdAt = new Date();
      
      // 插入案例
      const result = await db.collection('cases').insertOne(caseData);
      console.log(`✅ 已添加: ${caseData.athleteName} - ${caseData.sport} (${caseData.year})`);
    }
    
    // 顯示統計資訊
    const totalCases = await db.collection('cases').countDocuments();
    console.log(`\n📊 數據庫統計:`);
    console.log(`   總案例數: ${totalCases}`);
    
    const sportStats = await db.collection('cases').aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log(`\n🏆 各運動項目案例數:`);
    sportStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
    console.log('\n🎉 知名運動員案例添加完成！');
    
  } catch (error) {
    console.error('❌ 添加案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 執行腳本
addFamousAthletesCases();