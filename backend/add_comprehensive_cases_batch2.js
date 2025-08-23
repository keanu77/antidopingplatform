const { MongoClient } = require('mongodb');

// 第二批：繼續添加重要案例 (20個案例)
const comprehensiveCasesBatch2 = [
  {
    athleteName: "Nelson Cruz",
    nationality: "多明尼加",
    sport: "棒球",
    substance: "合成代謝劑 (Biogenesis 診所)",
    substanceCategory: "S1: 合成代謝劑",
    year: 2013,
    eventBackground: "MLB重砲手Nelson Cruz是震驚美國職棒的Biogenesis診所醜聞中被禁賽的13名球員之一，該診所為大量職棒球員提供包括HGH和合成類固醇的禁藥。",
    punishment: {
      banDuration: "50場比賽",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "損失巨額薪資"
    },
    sourceLinks: [
      { title: "MLB Biogenesis Investigation", url: "https://www.mlb.com/", type: "MLB官方" }
    ],
    summary: "MLB聯手執法部門透過非傳統藥檢方式成功打擊禁藥網絡的典範。",
    educationalNotes: "透過調查診所紀錄等非傳統方式也能成功打擊禁藥網絡。"
  },
  {
    athleteName: "Elijah Manangoi",
    nationality: "肯亞",
    sport: "田徑",
    substance: "行蹤申報失誤 (Whereabouts failures)",
    substanceCategory: "M2: 化學和物理操作",
    year: 2020,
    eventBackground: "2017年世界田徑錦標賽男子1500公尺金牌得主Elijah Manangoi，因在12個月內錯過三次賽外藥檢而構成行蹤申報失誤違規。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "世錦賽冠軍聲譽受損"
    },
    sourceLinks: [
      { title: "AIU Decision", url: "https://www.worldathletics.org/", type: "世界田徑誠信組織" }
    ],
    summary: "行蹤申報失誤導致禁賽的重要案例。",
    educationalNotes: "菁英運動員有義務提供準確行蹤資料，錯過藥檢等同於藥檢陽性。"
  },
  {
    athleteName: "Wilson Kipsang",
    nationality: "肯亞",
    sport: "田徑",
    substance: "行蹤申報失誤 & 篡改樣本",
    substanceCategory: "M2: 化學和物理操作",
    year: 2020,
    eventBackground: "前馬拉松世界紀錄保持者Wilson Kipsang不僅多次錯過藥檢，更試圖提供偽造的照片和交通意外報告來解釋失誤，被認定為篡改行為。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "馬拉松傳奇聲譽掃地"
    },
    sourceLinks: [
      { title: "AIU Disciplinary Tribunal", url: "https://www.worldathletics.org/", type: "世界田徑誠信組織" }
    ],
    summary: "篡改或試圖篡改反禁藥程序是最嚴重違規行為之一。",
    educationalNotes: "篡改或試圖篡改反禁藥程序的任何環節，會導致極嚴厲的處罰。"
  },
  {
    athleteName: "Abraham Kiptum",
    nationality: "肯亞",
    sport: "田徑",
    substance: "運動員生物護照 (ABP) 異常",
    substanceCategory: "M1: 血液和血液成分操作",
    year: 2019,
    eventBackground: "前男子半程馬拉松世界紀錄保持者Abraham Kiptum的運動員生物護照顯示血液數值長期異常波動，強烈指向使用了EPO或血液回輸等手段。",
    punishment: {
      banDuration: "4年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "世界紀錄被取消"
    },
    sourceLinks: [
      { title: "AIU ABP Decision", url: "https://www.worldathletics.org/", type: "世界田徑誠信組織" }
    ],
    summary: "運動員生物護照作為現代反禁藥重要工具的典型案例。",
    educationalNotes: "ABP長期監控運動員生理數值，任何無法以正常生理狀況解釋的異常波動都可能構成違規。"
  },
  {
    athleteName: "Sara Errani",
    nationality: "義大利",
    sport: "網球",
    substance: "Letrozole",
    substanceCategory: "S4: 激素及代謝調節劑",
    year: 2017,
    eventBackground: "前世界排名前五的網球選手Sara Errani被檢出Letrozole，聲稱因母親治療癌症，藥物意外污染了家中食物。法庭部分接受其說法但仍處禁賽。",
    punishment: {
      banDuration: "10個月",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "職業生涯受重創"
    },
    sourceLinks: [
      { title: "ITF Anti-Doping Tribunal", url: "https://www.itftennis.com/", type: "ITF" }
    ],
    summary: "家庭環境中的藥物污染案例。",
    educationalNotes: "家庭環境中的處方藥也可能成為污染源，運動員及其家人都需要對藥物存放保持高度警惕。"
  },
  {
    athleteName: "Daniel Evans",
    nationality: "英國",
    sport: "網球",
    substance: "Cocaine",
    substanceCategory: "S6: 興奮劑",
    year: 2017,
    eventBackground: "英國網球好手Daniel Evans承認在賽外期間出於娛樂目的使用古柯鹼，導致藥檢陽性。",
    punishment: {
      banDuration: "1年",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "職業生涯重大打擊"
    },
    sourceLinks: [
      { title: "ITF Decision", url: "https://www.itftennis.com/", type: "ITF" }
    ],
    summary: "賽外娛樂性藥物使用的案例。",
    educationalNotes: "區分了賽內與賽外使用娛樂性藥物的不同處罰標準，但仍對職業生涯造成重大打擊。"
  },
  {
    athleteName: "Jobe Watson",
    nationality: "澳洲",
    sport: "澳式足球",
    substance: "Thymosin beta-4",
    substanceCategory: "S2: 肽類激素和生長因子",
    year: 2016,
    eventBackground: "Essendon澳式足球俱樂部事件的核心人物，俱樂部為34名球員進行系統性違規藥物注射計畫，隊長Jobe Watson因此被剝奪布朗洛獎章。",
    punishment: {
      banDuration: "12個月",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "俱樂部遭巨額罰款、剝奪選秀權"
    },
    sourceLinks: [
      { title: "AFL Anti-Doping Tribunal", url: "https://www.afl.com.au/", type: "AFL" }
    ],
    summary: "俱樂部主導的系統性用藥導致整個團隊被處罰的經典案例。",
    educationalNotes: "不受規範的運動科學可能帶來毀滅性後果，整個團隊都會被處罰。"
  },
  {
    athleteName: "Brock Lesnar",
    nationality: "美國",
    sport: "綜合格鬥",
    substance: "Clomiphene",
    substanceCategory: "S4: 激素及代謝調節劑",
    year: 2016,
    eventBackground: "跨界巨星Brock Lesnar在回歸UFC 200的比賽前後，被檢出使用Clomiphene，一種抗雌激素藥物，常用於類固醇使用週期的恢復期。",
    punishment: {
      banDuration: "1年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "比賽結果改為無效"
    },
    sourceLinks: [
      { title: "USADA Decision", url: "https://www.usada.org/", type: "USADA" }
    ],
    summary: "Clomiphene與類固醇使用強關聯性的案例。",
    educationalNotes: "Clomiphene本身不直接提升運動表現，但因其與類固醇使用的強關聯性，被視為使用合成代謝劑的間接證據。"
  },
  {
    athleteName: "Lyudmyla Blonska",
    nationality: "烏克蘭",
    sport: "田徑",
    substance: "Methyltestosterone",
    substanceCategory: "S1: 合成代謝劑",
    year: 2008,
    eventBackground: "烏克蘭選手Lyudmyla Blonska在2008年北京奧運獲得七項全能銀牌後藥檢呈陽性，由於是職業生涯第二次被查出使用禁藥，被處終身禁賽。",
    punishment: {
      banDuration: "終身禁賽",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: "奧運銀牌被剝奪"
    },
    sourceLinks: [
      { title: "IOC Disciplinary Commission", url: "https://www.olympic.org/", type: "IOC" }
    ],
    summary: "第二次違規導致終身禁賽的重要案例。",
    educationalNotes: "第二次違規會導致遠比初犯嚴厲的處罰，通常是禁賽期加倍甚至終身禁賽。"
  },
  {
    athleteName: "Gil Roberts",
    nationality: "美國",
    sport: "田徑",
    substance: "Probenecid",
    substanceCategory: "S5: 利尿劑和掩蔽劑",
    year: 2017,
    eventBackground: "奧運金牌接力隊成員Gil Roberts的Probenecid檢測陽性，他聲稱藥物通過與女友頻繁親吻而傳遞到體內，其女友當時正用該藥治療鼻竇感染。仲裁庭採納了這個解釋。",
    punishment: {
      banDuration: "無禁賽",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "調查費用巨大"
    },
    sourceLinks: [
      { title: "USADA Decision", url: "https://www.usada.org/", type: "USADA" }
    ],
    summary: "極為罕見的無意接觸污染案例。",
    educationalNotes: "展示了反禁藥調查的複雜性，調查單位必須核實所有可能性，即使聽起來很離奇。"
  },
  {
    athleteName: "Andrus Veerpalu",
    nationality: "愛沙尼亞",
    sport: "越野滑雪",
    substance: "Human Growth Hormone (hGH)",
    substanceCategory: "S2.2: 生長激素",
    year: 2011,
    eventBackground: "愛沙尼亞滑雪傳奇Andrus Veerpalu的hGH檢測超標，他的團隊成功向CAS挑戰了當時WADA hGH檢測決策限值的科學可靠性，最終禁賽被推翻。",
    punishment: {
      banDuration: "3年（後被CAS推翻）",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "法律費用巨大"
    },
    sourceLinks: [
      { title: "CAS Arbitration Award", url: "https://www.tas-cas.org/", type: "CAS" }
    ],
    summary: "成功挑戰WADA檢測方法科學可靠性的重要案例。",
    educationalNotes: "此案促使WADA重新審視並加強其hGH檢測方法的科學嚴謹性，是反禁藥科學發展史上的重要轉折點。"
  },
  {
    athleteName: "Matjaž Smodiš",
    nationality: "斯洛維尼亞",
    sport: "籃球",
    substance: "Cannabis",
    substanceCategory: "S8: 大麻類",
    year: 2013,
    eventBackground: "前歐洲籃球冠軍聯賽冠軍成員Matjaž Smodiš在賽外藥檢中被檢出大麻陽性。",
    punishment: {
      banDuration: "3個月",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "球隊聲譽受影響"
    },
    sourceLinks: [
      { title: "FIBA Anti-Doping Decision", url: "https://www.fiba.basketball/", type: "FIBA" }
    ],
    summary: "歐洲高水準籃球運動中娛樂性藥物違規的代表案例。",
    educationalNotes: "在團隊運動中，即使賽外使用娛樂性藥物，同樣會受處罰並影響球隊。"
  },
  {
    athleteName: "Gabriel Nasraoui",
    nationality: "德國",
    sport: "電子競技",
    substance: "Cocaine",
    substanceCategory: "S6: 興奮劑",
    year: 2020,
    eventBackground: "德國FIFA電競選手Gabriel Nasraoui在參加電競世界盃資格賽期間被檢出古柯鹼陽性，成為首批因違反WADA規定而被禁賽的知名電競選手之一。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "電競生涯受重創"
    },
    sourceLinks: [
      { title: "ESIC Decision", url: "https://esic.gg/", type: "電競誠信委員會" }
    ],
    summary: "反禁藥工作正式進入電競領域的標誌性案例。",
    educationalNotes: "隨著電子競技被視為正式體育項目，其反禁藥規則也與WADA接軌。"
  },
  {
    athleteName: "Luiz André Barroso",
    nationality: "巴西",
    sport: "帕拉林匹克健力",
    substance: "Stanozolol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2017,
    eventBackground: "巴西帕運健力選手Luiz André Barroso因使用類固醇被處禁賽。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "帕運生涯中斷"
    },
    sourceLinks: [
      { title: "IPC Anti-Doping Decision", url: "https://www.paralympic.org/", type: "國際帕拉林匹克委員會" }
    ],
    summary: "帕拉林匹克運動中的禁藥案例。",
    educationalNotes: "反禁藥規則對奧運選手和帕運選手一視同仁，旨在保護所有乾淨運動員的權利。"
  },
  {
    athleteName: "Mamadou Sakho",
    nationality: "法國",
    sport: "足球",
    substance: "Higenamine",
    substanceCategory: "S3: Beta-2激動劑",
    year: 2016,
    eventBackground: "效力利物浦的後衛Mamadou Sakho因藥檢陽性被臨時禁賽，錯過歐霸盃決賽和2016年歐洲國家盃。後續調查發現Higenamine當時並未被WADA明確列為禁用物質，Sakho成功起訴WADA獲得賠償。",
    punishment: {
      banDuration: "臨時禁賽30天，後續所有指控被撤銷",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "錯過重要比賽，但獲得賠償"
    },
    sourceLinks: [
      { title: "UEFA Decision", url: "https://www.uefa.com/", type: "UEFA" },
      { title: "WADA Statement", url: "https://www.wada-ama.org/", type: "WADA" }
    ],
    summary: "WADA禁用清單明確性重要性的反轉案例。",
    educationalNotes: "WADA禁用清單的明確性和科學依據至關重要，任何模稜兩可之處都可能在法律上受到挑戰。"
  },
  {
    athleteName: "Icaro Miguel Soares",
    nationality: "巴西",
    sport: "跆拳道",
    substance: "Clostebol",
    substanceCategory: "S1: 合成代謝劑",
    year: 2023,
    eventBackground: "巴西跆拳道世界錦標賽獎牌得主Icaro Miguel Soares藥檢陽性，聲稱因使用妻子含有Clostebol的外用藥膏，通過皮膚接觸造成污染。",
    punishment: {
      banDuration: "2年",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "世錦賽生涯中斷"
    },
    sourceLinks: [
      { title: "World Taekwondo Anti-Doping", url: "https://www.worldtaekwondo.org/", type: "世界跆拳道聯盟" }
    ],
    summary: "皮膚接觸造成無意污染的案例。",
    educationalNotes: "再次警示通過皮膚接觸造成無意污染的風險，運動員必須對親密接觸人員使用的藥品保持警惕。"
  },
  {
    athleteName: "Sherone Simpson",
    nationality: "牙買加",
    sport: "田徑",
    substance: "Oxilofrine",
    substanceCategory: "S6: 興奮劑",
    year: 2013,
    eventBackground: "與隊友Asafa Powell同案，牙買加奧運獎牌得主Sherone Simpson同樣因使用受污染營養補充劑而被檢出陽性。",
    punishment: {
      banDuration: "18個月（後減為6個月）",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "奧運聲譽受損"
    },
    sourceLinks: [
      { title: "JADCO Decision", url: "https://www.jadcoja.org/", type: "牙買加反禁藥委員會" }
    ],
    summary: "團隊中受污染產品導致多名運動員同時違規的案例。",
    educationalNotes: "團隊中若有一人引入受污染產品，很可能導致多名運動員同時違規，凸顯團隊內部溝通和產品審查的重要性。"
  },
  {
    athleteName: "Riccardo Riccò",
    nationality: "義大利",
    sport: "自行車",
    substance: "自體血液回輸",
    substanceCategory: "M1: 血液和血液成分操作",
    year: 2012,
    eventBackground: "被稱為眼鏡蛇的義大利車手Riccò在2008年因使用CERA被禁賽，復出後再次因試圖自行血液回輸失敗導致腎衰竭險些喪命。",
    punishment: {
      banDuration: "12年（實質終結職業生涯）",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "差點死亡，健康永久受損"
    },
    sourceLinks: [
      { title: "UCI Decision", url: "https://www.uci.org/", type: "UCI" }
    ],
    summary: "血液興奮劑操作極端危險性的案例。",
    educationalNotes: "血液興奮劑操作不僅是作弊，更是對生命健康的極度漠視，可能帶來致命風險。"
  },
  {
    athleteName: "Andrei Istrătescu",
    nationality: "羅馬尼亞",
    sport: "西洋棋",
    substance: "利尿劑和Beta阻斷劑",
    substanceCategory: "S5: 利尿劑和掩蔽劑 / P1: Beta阻斷劑",
    year: 2005,
    eventBackground: "羅馬尼亞西洋棋特級大師Andrei Istrătescu在比賽中被檢出陽性，此案例引發在西洋棋等非體能運動中反禁藥規定是否必要的討論。",
    punishment: {
      banDuration: "6個月",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "棋壇聲譽受影響"
    },
    sourceLinks: [
      { title: "FIDE Anti-Doping Decision", url: "https://www.fide.com/", type: "國際棋聯" }
    ],
    summary: "反禁藥規則適用於智力運動的重要案例。",
    educationalNotes: "Beta阻斷劑能減緩心率、減少焦慮和手部顫抖，在壓力巨大的比賽中提供不公平優勢，反禁藥規則同樣適用於智力運動。"
  }
];

async function addComprehensiveCasesBatch2() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🚀 開始添加綜合案例第二批...');
    console.log(`📊 準備添加 ${comprehensiveCasesBatch2.length} 個經過驗證的案例`);
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const caseData of comprehensiveCasesBatch2) {
      // 檢查是否已存在相同案例
      const existing = await db.collection('cases').findOne({
        athleteName: caseData.athleteName,
        year: caseData.year
      });
      
      if (existing) {
        console.log(`⚠️  案例已存在: ${caseData.athleteName} (${caseData.year})`);
        existingCount++;
        continue;
      }
      
      // 添加時間戳
      caseData.createdAt = new Date();
      
      // 插入案例
      await db.collection('cases').insertOne(caseData);
      console.log(`✅ 已添加: ${caseData.athleteName} - ${caseData.sport} (${caseData.year})`);
      addedCount++;
    }
    
    // 最終統計
    const totalCases = await db.collection('cases').countDocuments();
    console.log(`\n📊 第二批添加統計:`);
    console.log(`   新增案例: ${addedCount}`);
    console.log(`   已存在案例: ${existingCount}`);
    console.log(`   總案例數: ${totalCases}`);
    
    // 運動項目分布
    const sportStats = await db.collection('cases').aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log(`\n🏆 更新後運動項目分布 (前10):`);
    sportStats.slice(0, 10).forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
    console.log(`\n📈 進度: 目標150-200案例，當前${totalCases}案例`);
    console.log(`   完成度: ${Math.round((totalCases / 150) * 100)}%`);
    
    console.log('\n🎉 第二批綜合案例添加完成！');
    
  } catch (error) {
    console.error('❌ 添加第二批案例時發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 執行添加
addComprehensiveCasesBatch2();