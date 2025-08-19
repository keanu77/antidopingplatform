const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

const sampleCases = [
  {
    athleteName: 'Ben Johnson',
    nationality: '加拿大',
    sport: '田徑',
    substance: 'Stanozolol',
    substanceCategory: '類固醇',
    year: 1988,
    eventBackground: '1988年漢城奧運會100公尺決賽，以9.79秒打破世界紀錄奪金，但賽後藥檢呈陽性反應。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '世界紀錄被取消'
    },
    sourceLinks: [
      {
        title: 'Olympics.com - Ben Johnson doping scandal',
        url: 'https://olympics.com/en/news/ben-johnson-doping-scandal-seoul-1988',
        type: '官方文件'
      }
    ],
    summary: '史上最著名的禁藥醜聞之一，改變了奧運會的藥檢制度。',
    educationalNotes: 'Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。'
  },
  {
    athleteName: 'Lance Armstrong',
    nationality: '美國',
    sport: '自行車',
    substance: 'EPO、睪固酮、皮質類固醇',
    substanceCategory: 'EPO',
    year: 2012,
    eventBackground: '七屆環法自行車賽冠軍，長期使用禁藥並領導團隊系統性作弊。',
    punishment: {
      banDuration: '終身禁賽',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '剝奪1998年後所有成績，包括7個環法冠軍'
    },
    sourceLinks: [
      {
        title: 'USADA Report on Lance Armstrong',
        url: 'https://www.usada.org/lance-armstrong/',
        type: 'WADA'
      }
    ],
    summary: '自行車史上最大的禁藥醜聞，揭露了職業自行車界的系統性問題。',
    educationalNotes: 'EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。'
  },
  {
    athleteName: 'Maria Sharapova',
    nationality: '俄羅斯',
    sport: '網球',
    substance: 'Meldonium',
    substanceCategory: '其他',
    year: 2016,
    eventBackground: '2016年澳網期間藥檢呈陽性，聲稱不知道Meldonium已被列入禁藥清單。',
    punishment: {
      banDuration: '15個月',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '失去多個贊助合約'
    },
    sourceLinks: [
      {
        title: 'ITF Statement on Maria Sharapova',
        url: 'https://www.itftennis.com/en/news-and-media/',
        type: '官方文件'
      }
    ],
    summary: '高知名度選手因未注意禁藥清單更新而違規的案例。',
    educationalNotes: 'Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。'
  },
  {
    athleteName: 'Marion Jones',
    nationality: '美國',
    sport: '田徑',
    substance: 'THG (Tetrahydrogestrinone)',
    substanceCategory: '類固醇',
    year: 2007,
    eventBackground: '2000年雪梨奧運會獲得5面獎牌，後承認使用禁藥。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '因作偽證被判入獄6個月'
    },
    sourceLinks: [
      {
        title: 'BALCO Scandal',
        url: 'https://www.wada-ama.org/',
        type: 'WADA'
      }
    ],
    summary: 'BALCO醜聞的核心人物之一，揭露了美國田徑界的禁藥問題。',
    educationalNotes: 'THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。'
  },
  {
    athleteName: 'Sun Yang',
    nationality: '中國',
    sport: '游泳',
    substance: 'Trimetazidine',
    substanceCategory: '興奮劑',
    year: 2014,
    eventBackground: '2014年全國游泳錦標賽藥檢陽性，後因破壞血檢樣本再次被禁賽。',
    punishment: {
      banDuration: '3個月（2014年）、8年（2020年）',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '2020年因破壞血檢樣本被重罰'
    },
    sourceLinks: [
      {
        title: 'CAS Decision on Sun Yang',
        url: 'https://www.tas-cas.org/',
        type: '官方文件'
      }
    ],
    summary: '中國游泳名將的爭議案例，涉及藥檢程序和運動員權利的討論。',
    educationalNotes: 'Trimetazidine是心臟病藥物，2014年被列為禁藥，可能提高運動表現。'
  },
  {
    athleteName: 'Tyson Gay',
    nationality: '美國',
    sport: '田徑',
    substance: '合成代謝類固醇',
    substanceCategory: '類固醇',
    year: 2013,
    eventBackground: '美國短跑名將，100公尺美國紀錄保持者，2013年藥檢陽性。',
    punishment: {
      banDuration: '1年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '失去2012年奧運會4x100公尺接力銀牌'
    },
    sourceLinks: [
      {
        title: 'USADA Tyson Gay Case',
        url: 'https://www.usada.org/',
        type: 'WADA'
      }
    ],
    summary: '美國短跑界的禁藥案例，顯示即使頂尖運動員也可能違規。',
    educationalNotes: '合成代謝類固醇能增加肌肉量和爆發力，但對心血管系統有嚴重副作用。'
  },
  {
    athleteName: 'Alberto Contador',
    nationality: '西班牙',
    sport: '自行車',
    substance: 'Clenbuterol',
    substanceCategory: '興奮劑',
    year: 2010,
    eventBackground: '2010年環法自行車賽期間檢測出微量Clenbuterol，聲稱是食用受污染的牛肉所致。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '失去2010年環法冠軍和2011年環義冠軍'
    },
    sourceLinks: [
      {
        title: 'CAS Alberto Contador Decision',
        url: 'https://www.tas-cas.org/',
        type: '官方文件'
      }
    ],
    summary: '「污染肉品」辯護的經典案例，引發對微量檢測的討論。',
    educationalNotes: 'Clenbuterol是支氣管擴張劑，也用於畜牧業，可能通過食物鏈進入人體。'
  },
  {
    athleteName: 'Justin Gatlin',
    nationality: '美國',
    sport: '田徑',
    substance: '睪固酮',
    substanceCategory: '類固醇',
    year: 2006,
    eventBackground: '2004年奧運會100公尺金牌得主，2006年第二次藥檢陽性。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '原判8年後減為4年'
    },
    sourceLinks: [
      {
        title: 'IAAF Justin Gatlin Case',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '爭議性的復出案例，禁賽期滿後繼續參賽並獲得佳績。',
    educationalNotes: '睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Case.deleteMany({});
    console.log('Cleared existing cases');

    // Insert sample data
    const insertedCases = await Case.insertMany(sampleCases);
    console.log(`Inserted ${insertedCases.length} sample cases`);

    // Update related cases (link similar cases)
    for (let i = 0; i < insertedCases.length; i++) {
      const currentCase = insertedCases[i];
      const relatedCases = insertedCases
        .filter((c, index) => index !== i && 
          (c.sport === currentCase.sport || c.substanceCategory === currentCase.substanceCategory))
        .slice(0, 3)
        .map(c => c._id);
      
      if (relatedCases.length > 0) {
        await Case.findByIdAndUpdate(currentCase._id, { relatedCases });
      }
    }
    console.log('Updated related cases');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();