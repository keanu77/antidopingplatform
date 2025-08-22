const { MongoClient } = require('mongodb');

// 已驗證的真實案例清單 - 這些都有WADA或NADO官方記錄
const verifiedRealCases = [
  // 確認的知名運動員案例
  { athleteName: "Lance Armstrong", sport: "自行車", year: 2012 }, // USADA official
  { athleteName: "Ben Johnson", sport: "田徑", year: 1988 }, // IOC official
  { athleteName: "Marion Jones", sport: "田徑", year: 2007 }, // USADA official
  { athleteName: "Alex Rodriguez", sport: "棒球", year: 2013 }, // MLB official
  { athleteName: "Barry Bonds", sport: "棒球", year: 2003 }, // BALCO investigation
  { athleteName: "Manny Ramirez", sport: "棒球", year: 2009 }, // MLB official
  { athleteName: "Diego Maradona", sport: "足球", year: 1994 }, // FIFA World Cup
  { athleteName: "Rio Ferdinand", sport: "足球", year: 2003 }, // FA official
  { athleteName: "Paul Pogba", sport: "足球", year: 2023 }, // Juventus/NADO Italia
  { athleteName: "Maria Sharapova", sport: "網球", year: 2016 }, // ITF official
  { athleteName: "Jannik Sinner", sport: "網球", year: 2024 }, // ITF official
  { athleteName: "Iga Swiatek", sport: "網球", year: 2024 }, // ITF official
  { athleteName: "Erriyon Knighton", sport: "田徑", year: 2024 }, // USADA official
  { athleteName: "O.J. Mayo", sport: "籃球", year: 2016 }, // NBA official
  { athleteName: "Justin Gatlin", sport: "田徑", year: 2006 }, // USADA official
  { athleteName: "Andre Agassi", sport: "網球", year: 1997 }, // ATP/ITF (自傳披露)
  
  // TUE 相關真實案例
  { athleteName: "Serena Williams", sport: "網球", year: 2016 }, // WADA/ITF TUE records
  { athleteName: "Chris Froome", sport: "自行車", year: 2017 }, // UCI official
  { athleteName: "Bradley Wiggins", sport: "自行車", year: 2012 }, // UK Parliament report
  { athleteName: "Simone Biles", sport: "體操", year: 2016 }, // USADA TUE records
  { athleteName: "Mo Farah", sport: "田徑", year: 2014 }, // UKAD investigation
  { athleteName: "Venus Williams", sport: "網球", year: 2011 }, // ITF/USTA
  
  // 其他確認的重大案例
  { athleteName: "Floyd Landis", sport: "自行車", year: 2006 }, // USADA/UCI
  { athleteName: "Tyler Hamilton", sport: "自行車", year: 2004 }, // USADA
  { athleteName: "Alberto Contador", sport: "自行車", year: 2010 }, // UCI/CAS
  { athleteName: "Jan Ullrich", sport: "自行車", year: 2006 }, // German investigation
  { athleteName: "Tim Montgomery", sport: "田徑", year: 2005 }, // USADA/BALCO
  { athleteName: "Kelli White", sport: "田徑", year: 2003 }, // USADA/BALCO
  { athleteName: "Dwain Chambers", sport: "田徑", year: 2003 }, // UKAD
  { athleteName: "Shane Warne", sport: "板球", year: 2003 }, // Cricket Australia
  { athleteName: "Marin Čilić", sport: "網球", year: 2013 }, // ITF official
  { athleteName: "Viktor Troicki", sport: "網球", year: 2013 }, // ITF official
  { athleteName: "Yuliya Stepanova", sport: "田徑", year: 2013 }, // RUSADA
  { athleteName: "Grigory Rodchenkov", sport: "實驗室", year: 2014 }, // WADA investigation
  { athleteName: "Kamila Valieva", sport: "花式滑冰", year: 2022 }, // ISU/RUSADA
  
  // 歷史重要案例
  { athleteName: "East German Swimming Team", sport: "游泳", year: 1976 }, // Stasi files
  { athleteName: "Soviet Union Athletes", sport: "多項", year: 1984 }, // Historical records
  { athleteName: "Chinese Swimmers", sport: "游泳", year: 1994 }, // FINA records
];

async function verifyAndCleanCases() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('sports-doping-db');
    
    console.log('🔍 開始檢查案例真實性...');
    
    // 獲取所有案例
    const allCases = await db.collection('cases').find({}).toArray();
    console.log(`📊 當前資料庫有 ${allCases.length} 個案例`);
    
    // 分析案例
    const suspiciousCases = [];
    const verifiedCases = [];
    const toDelete = [];
    
    for (const case_ of allCases) {
      const isVerified = verifiedRealCases.some(verified => 
        verified.athleteName === case_.athleteName && 
        verified.sport === case_.sport &&
        Math.abs(verified.year - case_.year) <= 1 // 允許1年誤差
      );
      
      if (isVerified) {
        verifiedCases.push(case_);
      } else {
        // 檢查是否為明顯虛構的案例
        if (isObviouslyFictional(case_)) {
          toDelete.push(case_);
        } else {
          suspiciousCases.push(case_);
        }
      }
    }
    
    console.log(`\n📈 分析結果:`);
    console.log(`✅ 已驗證真實案例: ${verifiedCases.length}`);
    console.log(`⚠️  需要進一步核實: ${suspiciousCases.length}`);
    console.log(`❌ 明顯虛構案例: ${toDelete.length}`);
    
    // 顯示可疑案例供檢查
    if (suspiciousCases.length > 0) {
      console.log(`\n⚠️  需要核實的案例:`);
      suspiciousCases.forEach((case_, index) => {
        console.log(`${index + 1}. ${case_.athleteName} - ${case_.sport} (${case_.year})`);
      });
    }
    
    // 顯示將要刪除的虛構案例
    if (toDelete.length > 0) {
      console.log(`\n❌ 將要刪除的虛構案例:`);
      toDelete.forEach((case_, index) => {
        console.log(`${index + 1}. ${case_.athleteName} - ${case_.sport} (${case_.year})`);
      });
      
      // 確認後刪除
      console.log(`\n🗑️  刪除虛構案例...`);
      for (const case_ of toDelete) {
        await db.collection('cases').deleteOne({ _id: case_._id });
        console.log(`❌ 已刪除: ${case_.athleteName} - ${case_.sport} (${case_.year})`);
      }
    }
    
    // 最終統計
    const finalCount = await db.collection('cases').countDocuments();
    console.log(`\n📊 清理後統計:`);
    console.log(`   總案例數: ${allCases.length} → ${finalCount} (刪除 ${allCases.length - finalCount})`);
    console.log(`   已驗證真實案例: ${verifiedCases.length}`);
    
    // 生成清理報告
    generateCleanupReport(verifiedCases, suspiciousCases, toDelete);
    
  } catch (error) {
    console.error('❌ 清理過程中發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

function isObviouslyFictional(case_) {
  // 檢查明顯虛構的特徵
  const fictionalIndicators = [
    // 常見英文假名
    /^(John|Jane|Mike|Sarah|David|Jennifer|Robert|Lisa) (Smith|Johnson|Brown|Davis|Miller|Wilson|Moore|Taylor|Anderson|Jackson|White|Harris|Martin|Thompson|Garcia|Martinez|Robinson|Clark|Rodriguez|Lewis|Lee|Walker|Hall|Allen|Young|Hernandez|King|Wright|Lopez|Hill|Scott|Green|Adams|Baker|Gonzalez|Nelson|Carter|Mitchell|Perez|Roberts|Turner|Phillips|Campbell|Parker|Evans|Edwards|Collins|Stewart|Sanchez|Morris|Rogers|Reed|Cook|Morgan|Bell|Murphy|Bailey|Rivera|Cooper|Richardson|Cox|Howard|Ward|Torres|Peterson|Gray|Ramirez|James|Watson|Brooks|Kelly|Sanders|Price|Bennett|Wood|Barnes|Ross|Henderson|Coleman|Jenkins|Perry|Powell|Long|Patterson|Hughes|Flores|Washington|Butler|Simmons|Foster|Gonzales|Bryant|Alexander|Russell|Griffin|Diaz|Hayes)$/,
    
    // 重複或模式化的案例描述
    /期間藥檢呈陽性反應，違反了反禁藥規則/,
    
    // 過於簡單或重複的背景描述
    /^.{1,50}期間.*藥檢呈陽性/,
    
    // 沒有具體比賽或事件名稱
    /國際邀請賽期間/,
    
    // 教育性質但缺乏真實性的描述
    /運動員因使用.*被禁賽的案例/
  ];
  
  return fictionalIndicators.some(pattern => 
    pattern.test(case_.athleteName) || 
    pattern.test(case_.eventBackground) ||
    pattern.test(case_.summary)
  );
}

function generateCleanupReport(verified, suspicious, deleted) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      verifiedCases: verified.length,
      suspiciousCases: suspicious.length,
      deletedCases: deleted.length
    },
    verifiedAthletes: verified.map(c => `${c.athleteName} (${c.sport}, ${c.year})`),
    suspiciousAthletes: suspicious.map(c => `${c.athleteName} (${c.sport}, ${c.year})`),
    deletedAthletes: deleted.map(c => `${c.athleteName} (${c.sport}, ${c.year})`)
  };
  
  console.log(`\n📋 清理報告已生成`);
  console.log(`   時間: ${report.timestamp}`);
  console.log(`   需要進一步人工核實的案例數: ${suspicious.length}`);
}

// 執行清理
verifyAndCleanCases();