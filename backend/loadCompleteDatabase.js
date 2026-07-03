const mongoose = require("mongoose");
const Case = require("./models/Case");
const dotenv = require("dotenv");

dotenv.config();

// 生成完整的166個案例
function generateCompleteCaseList() {
  const baseYear = 1980;
  const endYear = 2024;
  const totalCases = 166;

  const substances = {
    "S1: 合成代謝劑": ["睪固酮", "大力補", "Stanozolol", "Nandrolone"],
    "S1.1: 外源性合成代謝雄激素類固醇": [
      "睪固酮",
      "THG",
      "Stanozolol",
      "Trenbolone",
    ],
    "S2.1: 促紅血球生成素類": ["EPO", "CERA", "Darbepoetin", "Roxadustat"],
    "S2.2: 生長激素": ["人類生長激素", "IGF-1", "Mechano Growth Factor"],
    "S3: Beta-2激動劑": ["Clenbuterol", "Salbutamol", "Terbutaline"],
    "S4.4: 代謝調節劑": ["Meldonium", "Trimetazidine"],
    "S5: 利尿劑和掩蔽劑": [
      "Furosemide",
      "Hydrochlorothiazide",
      "Spironolactone",
    ],
    "S6: 興奮劑": ["安非他命", "Modafinil", "Ephedrine", "Cocaine"],
    "S7: 麻醉劑": ["Morphine", "Oxycodone", "Tramadol"],
    "S8: 大麻類": ["大麻", "THC"],
    "S9: 糖皮質激素": ["Prednisolone", "Triamcinolone"],
    "M1: 血液和血液成分操作": ["血液輸注", "人工血液"],
    "M2: 化學和物理操作": ["樣本調換", "尿液稀釋"],
    "P1: Beta阻斷劑": ["Propranolol", "Atenolol"],
  };

  const sports = [
    "田徑",
    "游泳",
    "自行車",
    "舉重",
    "拳擊",
    "摔跤",
    "划船",
    "網球",
    "足球",
    "棒球",
    "籃球",
    "冰球",
    "速度滑冰",
    "滑雪",
    "射箭",
    "射擊",
    "體操",
    "跳水",
    "帆船",
    "馬術",
    "現代五項",
    "鐵人三項",
    "柔道",
    "跆拳道",
  ];

  const countries = [
    "美國",
    "俄羅斯",
    "中國",
    "德國",
    "英國",
    "法國",
    "意大利",
    "加拿大",
    "澳大利亞",
    "日本",
    "韓國",
    "巴西",
    "荷蘭",
    "西班牙",
    "瑞典",
    "挪威",
    "丹麥",
    "芬蘭",
    "波蘭",
    "匈牙利",
    "羅馬尼亞",
    "保加利亞",
    "捷克",
    "斯洛伐克",
    "克羅地亞",
    "塞爾維亞",
    "希臘",
    "土耳其",
    "南非",
    "牙買加",
  ];

  const cases = [];

  // 先添加知名案例
  const famousCases = [
    {
      athleteName: "Ben Johnson",
      nationality: "加拿大",
      sport: "田徑",
      substance: "Stanozolol",
      substanceCategory: "S1.1: 外源性合成代謝雄激素類固醇",
      year: 1988,
      eventBackground:
        "1988年漢城奧運會100公尺決賽，以9.79秒打破世界紀錄奪金，但賽後藥檢呈陽性反應。",
      punishment: {
        banDuration: "2年",
        resultsCancelled: true,
        medalStripped: true,
        otherPenalties: "世界紀錄被取消",
      },
      summary: "史上最著名的禁藥醜聞之一，改變了奧運會的藥檢制度。",
      educationalNotes:
        "Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。",
    },
    {
      athleteName: "Lance Armstrong",
      nationality: "美國",
      sport: "自行車",
      substance: "EPO、睪固酮、皮質類固醇",
      substanceCategory: "S2.1: 促紅血球生成素類",
      year: 2012,
      eventBackground:
        "七屆環法自行車賽冠軍，長期使用禁藥並領導團隊系統性作弊。",
      punishment: {
        banDuration: "終身禁賽",
        resultsCancelled: true,
        medalStripped: true,
        otherPenalties: "剝奪1998年後所有成績，包括7個環法冠軍",
      },
      summary: "自行車史上最大的禁藥醜聞，揭露了職業自行車界的系統性問題。",
      educationalNotes:
        "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。",
    },
    {
      athleteName: "Maria Sharapova",
      nationality: "俄羅斯",
      sport: "網球",
      substance: "Meldonium",
      substanceCategory: "S4.4: 代謝調節劑",
      year: 2016,
      eventBackground:
        "2016年澳網期間藥檢呈陽性，聲稱不知道Meldonium已被列入禁藥清單。",
      punishment: {
        banDuration: "15個月",
        resultsCancelled: false,
        medalStripped: false,
        otherPenalties: "失去多個贊助合約",
      },
      summary: "高知名度選手因未注意禁藥清單更新而違規的案例。",
      educationalNotes:
        "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。",
    },
  ];

  cases.push(...famousCases);

  // 生成其他案例
  const maleNames = [
    "Michael",
    "David",
    "Robert",
    "John",
    "James",
    "William",
    "Richard",
    "Charles",
    "Thomas",
    "Christopher",
    "Daniel",
    "Matthew",
    "Anthony",
    "Mark",
    "Donald",
    "Steven",
    "Paul",
    "Andrew",
    "Joshua",
    "Kenneth",
    "Kevin",
    "Brian",
    "George",
    "Timothy",
    "Ronald",
    "Jason",
    "Edward",
    "Jeffrey",
    "Ryan",
    "Jacob",
  ];

  const femaleNames = [
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
    "Nancy",
    "Lisa",
    "Betty",
    "Helen",
    "Sandra",
    "Donna",
    "Carol",
    "Ruth",
    "Sharon",
    "Michelle",
    "Laura",
    "Sarah",
    "Kimberly",
    "Deborah",
    "Dorothy",
    "Amy",
    "Angela",
    "Ashley",
    "Brenda",
    "Emma",
  ];

  const surnames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
  ];

  for (let i = cases.length; i < totalCases; i++) {
    const isFemale = Math.random() > 0.6;
    const firstName = isFemale
      ? femaleNames[Math.floor(Math.random() * femaleNames.length)]
      : maleNames[Math.floor(Math.random() * maleNames.length)];
    const lastName = surnames[Math.floor(Math.random() * surnames.length)];

    const sport = sports[Math.floor(Math.random() * sports.length)];
    const nationality = countries[Math.floor(Math.random() * countries.length)];
    const year =
      baseYear + Math.floor(Math.random() * (endYear - baseYear + 1));

    const substanceCategories = Object.keys(substances);
    const category =
      substanceCategories[
        Math.floor(Math.random() * substanceCategories.length)
      ];
    const substance =
      substances[category][
        Math.floor(Math.random() * substances[category].length)
      ];

    const banDurations = [
      "6個月",
      "1年",
      "2年",
      "3年",
      "4年",
      "8年",
      "終身禁賽",
    ];
    const banDuration =
      banDurations[Math.floor(Math.random() * banDurations.length)];

    const resultsEvents = [
      "世界錦標賽",
      "奧運會",
      "亞運會",
      "歐洲錦標賽",
      "泛美運動會",
      "大獎賽",
      "國際邀請賽",
      "國內錦標賽",
      "職業聯賽",
      "世界盃",
    ];

    const event =
      resultsEvents[Math.floor(Math.random() * resultsEvents.length)];

    cases.push({
      athleteName: `${firstName} ${lastName}`,
      nationality: nationality,
      sport: sport,
      substance: substance,
      substanceCategory: category,
      year: year,
      eventBackground: `${year}年${event}期間藥檢呈陽性反應，違反了反禁藥規則。`,
      punishment: {
        banDuration: banDuration,
        resultsCancelled: Math.random() > 0.3,
        medalStripped: Math.random() > 0.4,
        otherPenalties: Math.random() > 0.5 ? "罰款和取消贊助" : "無其他處罰",
      },
      summary: `${sport}運動員因使用${substance}被禁賽的案例。`,
      educationalNotes: `${substance}可能提高運動表現，但對健康有害。運動員應避免使用任何被WADA列為禁藥的物質。`,
    });
  }

  return cases;
}

async function loadCompleteDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/sports-doping-db",
    );
    console.log("Connected to MongoDB");

    // 清除現有數據
    await Case.deleteMany({});
    console.log("Cleared existing cases");

    // 生成並插入案例
    const allCases = generateCompleteCaseList();
    const insertedCases = await Case.insertMany(allCases);
    console.log(`Successfully loaded ${insertedCases.length} cases`);

    // 統計
    const stats = {};
    const yearStats = {};
    const sportStats = {};

    insertedCases.forEach((c) => {
      stats[c.substanceCategory] = (stats[c.substanceCategory] || 0) + 1;
      yearStats[c.year] = (yearStats[c.year] || 0) + 1;
      sportStats[c.sport] = (sportStats[c.sport] || 0) + 1;
    });

    console.log(`\n📊 總共載入 ${insertedCases.length} 個案例`);
    console.log("\n🏷️ 物質類別統計:");
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 案例`);
    });

    console.log("\n🏃 運動項目統計 (前10名):");
    const topSports = Object.entries(sportStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    topSports.forEach(([sport, count]) => {
      console.log(`  ${sport}: ${count} 案例`);
    });

    console.log("\n✅ 完整資料庫載入完成!");
    process.exit(0);
  } catch (error) {
    console.error("Error loading database:", error);
    process.exit(1);
  }
}

// ⚠️ 安全鎖：本腳本會 deleteMany({}) 清空 cases，再用 Math.random() 灌入約 163 筆「虛構」案例。
// 這是已知的假資料來源，預設停用，避免被誤跑。若真要重新灌合成資料，須顯式加 --force-fabricate。
// 目的若是「清除」虛構案例，請改用 backend/clean-fabricated-cases.js。
if (process.argv.includes("--force-fabricate")) {
  loadCompleteDatabase();
} else {
  console.error("⛔ 已停用：此腳本會清空 cases 並灌入亂數生成的虛構案例。");
  console.error("   清除虛構案例請用：node backend/clean-fabricated-cases.js");
  console.error(
    "   若你確定要重新生成合成資料，請加旗標：node backend/loadCompleteDatabase.js --force-fabricate",
  );
  process.exit(1);
}
