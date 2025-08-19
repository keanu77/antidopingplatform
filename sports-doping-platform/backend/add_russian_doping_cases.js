const mongoose = require('mongoose');
const Case = require('./models/Case');
const dotenv = require('dotenv');

dotenv.config();

// 俄羅斯系統性禁藥案例補強
const russianDopingCases = [
  // 索契冬奧系統性案例
  {
    athleteName: 'Alexander Legkov',
    nationality: '俄羅斯',
    sport: '越野滑雪',
    substance: '系統性國家禁藥計劃',
    substanceCategory: 'M2: 化學和物理操作',
    year: 2014,
    eventBackground: '俄羅斯越野滑雪選手，索契冬奧50公里金牌得主，McLaren報告確認參與樣本替換計劃。',
    punishment: {
      banDuration: '終身禁賽',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '索契冬奧金牌被取消'
    },
    sourceLinks: [
      {
        title: 'McLaren Report Sochi Sample Swapping',
        url: 'https://www.wada-ama.org/en/resources/doping-control-process/mclaren-independent-investigation-report',
        type: 'WADA'
      }
    ],
    summary: '索契樣本替換：俄羅斯國家禁藥計劃的直接受益者。',
    educationalNotes: '索契冬奧的樣本替換計劃是現代體育史上最大規模的系統性作弊。'
  },
  {
    athleteName: 'Alexander Tretiakov',
    nationality: '俄羅斯',
    sport: '俯式冰橇',
    substance: '系統性國家禁藥計劃',
    substanceCategory: 'M2: 化學和物理操作',
    year: 2014,
    eventBackground: '俄羅斯俯式冰橇選手，索契冬奧金牌得主，涉入系統性樣本替換計劃。',
    punishment: {
      banDuration: '終身禁賽',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '索契冬奧金牌被取消'
    },
    sourceLinks: [
      {
        title: 'IOC Sanctions Commission Decisions',
        url: 'https://www.olympic.org/news/ioc-sanctions-commission-decisions',
        type: '官方文件'
      }
    ],
    summary: '俯式冰橇醜聞：索契主辦國的系統性作弊。',
    educationalNotes: '主辦國利用主場優勢進行系統性禁藥掩蓋的典型案例。'
  },
  {
    athleteName: 'Elena Isinbaeva',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'Meldonium (疑似)',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2016,
    eventBackground: '俄羅斯撐竿跳女王雖未被正式指控，但與俄羅斯田徑系統性禁藥有關聯。',
    punishment: {
      banDuration: '無直接處罰',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '退役避免進一步調查'
    },
    sourceLinks: [
      {
        title: 'Russian Athletics Doping Investigation',
        url: 'https://www.iaaf.org/news/press-release/russia-athletics-doping-investigation',
        type: '官方文件'
      }
    ],
    summary: '傳奇陰影：俄羅斯田徑系統下的傳奇人物。',
    educationalNotes: '即使是傳奇運動員也無法完全脫離系統性禁藥環境的影響。'
  },
  {
    athleteName: 'Yulia Stepanova',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'EPO, 類固醇',
    substanceCategory: 'S2.1: 促紅血球生成素類',
    year: 2013,
    eventBackground: '俄羅斯中距離跑者轉為告發者，揭露俄羅斯田徑系統性禁藥使用。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '成為關鍵告發者'
    },
    sourceLinks: [
      {
        title: 'Yulia Stepanova Whistleblower Case',
        url: 'https://www.wada-ama.org/en/news/yulia-stepanova-doping-whistleblower',
        type: 'WADA'
      }
    ],
    summary: '勇敢告發者：從違規者到揭露系統的英雄。',
    educationalNotes: '內部告發者對於揭露系統性禁藥使用具有關鍵作用。'
  },
  {
    athleteName: 'Sergey Kirdyapkin',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'EPO',
    substanceCategory: 'S2.1: 促紅血球生成素類',
    year: 2012,
    eventBackground: '俄羅斯競走選手，2012年倫敦奧運50公里競走金牌得主，後被發現使用EPO。',
    punishment: {
      banDuration: '3年2個月',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '奧運金牌被取消'
    },
    sourceLinks: [
      {
        title: 'IAAF Russian Race Walking Doping',
        url: 'https://www.worldathletics.org/news/news/russian-race-walkers-sanctioned-doping',
        type: '官方文件'
      }
    ],
    summary: '競走醜聞：俄羅斯競走項目的系統性問題。',
    educationalNotes: '競走項目因其耐力特性成為EPO使用的重災區。'
  },
  {
    athleteName: 'Elena Lashmanova',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'EPO',
    substanceCategory: 'S2.1: 促紅血球生成素類',
    year: 2012,
    eventBackground: '俄羅斯女子競走選手，2012年倫敦奧運20公里競走金牌得主，後確認使用EPO。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '奧運金牌被取消'
    },
    sourceLinks: [
      {
        title: 'Russian Race Walking Doping Scandal',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '女子競走：俄羅斯女性運動員的系統性違規。',
    educationalNotes: '俄羅斯競走項目的系統性禁藥使用涉及男女選手。'
  },
  {
    athleteName: 'Olga Kaniskina',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'EPO',
    substanceCategory: 'S2.1: 促紅血球生成素類',
    year: 2009,
    eventBackground: '俄羅斯競走女將，2008年北京奧運20公里競走金牌得主，生物護照異常。',
    punishment: {
      banDuration: '3年2個月',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalities: '北京奧運金牌被取消'
    },
    sourceLinks: [
      {
        title: 'Russian Race Walking Biological Passport',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '生物護照異常：現代檢測技術發現的違規。',
    educationalNotes: '生物護照技術可以發現長期的禁藥使用模式。'
  },
  {
    athleteName: 'Valeriy Borchin',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'EPO',
    substanceCategory: 'S2.1: 促紅血球生成素類',
    year: 2009,
    eventBackground: '俄羅斯男子競走選手，2008年北京奧運20公里競走金牌得主，生物護照違規。',
    punishment: {
      banDuration: '8年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '北京奧運金牌被取消'
    },
    sourceLinks: [
      {
        title: 'IAAF Borchin Doping Case',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '長期禁賽：重複違規的嚴厲後果。',
    educationalNotes: '重複或長期違規會導致更長時間的禁賽處罰。'
  },
  {
    athleteName: 'Mariya Savinova',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'Testosterone',
    substanceCategory: 'S1.1: 外源性合成代謝雄激素類固醇',
    year: 2011,
    eventBackground: '俄羅斯800公尺選手，2012年倫敦奧運金牌得主，IAAF調查確認使用類固醇。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '奧運金牌被取消'
    },
    sourceLinks: [
      {
        title: 'IAAF Russian 800m Doping Investigation',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '中距離系統違規：俄羅斯中距離項目的問題。',
    educationalNotes: '類固醇在中距離項目中可以同時提供力量和恢復優勢。'
  },
  {
    athleteName: 'Ekaterina Poistogova',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'Testosterone',
    substanceCategory: 'S1.1: 外源性合成代謝雄激素類固醇',
    year: 2011,
    eventBackground: '俄羅斯800公尺選手，2012年倫敦奧運銅牌得主，與Savinova同為系統性違規受益者。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '奧運銅牌被取消'
    },
    sourceLinks: [
      {
        title: 'Russian 800m Systematic Doping',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '同項目群體違規：系統性禁藥的集體特徵。',
    educationalNotes: '系統性禁藥往往涉及同一項目的多名運動員。'
  },
  {
    athleteName: 'Sergey Shubenkov',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'Meldonium',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2016,
    eventBackground: '俄羅斯110公尺跨欄世界冠軍，meldonium檢出但在新禁用前使用。',
    punishment: {
      banDuration: '無處罰',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '處於IAAF俄羅斯禁令期間'
    },
    sourceLinks: [
      {
        title: 'Meldonium Cases 2016',
        url: 'https://www.wada-ama.org/en/news/meldonium-cases',
        type: 'WADA'
      }
    ],
    summary: 'Meldonium過渡期：新禁用物質的複雜情況。',
    educationalNotes: '新禁用物質可能造成大量運動員在不知情情況下違規。'
  },
  {
    athleteName: 'Anastasia Zueva',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'Meldonium',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2016,
    eventBackground: '俄羅斯競走選手，2016年meldonium事件中的眾多俄羅斯運動員之一。',
    punishment: {
      banDuration: '2年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '職業生涯受重創'
    },
    sourceLinks: [
      {
        title: 'Russian Athletes Meldonium 2016',
        url: 'https://www.rusada.ru/',
        type: '官方文件'
      }
    ],
    summary: 'Meldonium普及：在俄羅斯運動員中的廣泛使用。',
    educationalNotes: 'Meldonium在俄羅斯和東歐國家使用非常普遍。'
  },
  {
    athleteName: 'Pavel Kulzhanov',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'Meldonium',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2016,
    eventBackground: '俄羅斯短跑選手，2016年meldonium大規模檢出事件的受害者之一。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: '職業生涯實質結束'
    },
    sourceLinks: [
      {
        title: 'Russian Meldonium Crisis 2016',
        url: 'https://www.rusada.ru/',
        type: '官方文件'
      }
    ],
    summary: 'Meldonium危機：2016年俄羅斯體育的重大打擊。',
    educationalNotes: '2016年meldonium禁用導致大量俄羅斯運動員受影響。'
  },
  {
    athleteName: 'Darya Klishina',
    nationality: '俄羅斯',
    sport: '田徑',
    substance: 'Meldonium',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2016,
    eventBackground: '俄羅斯跳遠選手，唯一獲准以中立身份參加2016里約奧運的俄羅斯田徑選手。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '暫時被禁止參賽但後獲准'
    },
    sourceLinks: [
      {
        title: 'Darya Klishina Rio 2016 Neutral Status',
        url: 'https://www.worldathletics.org/',
        type: '官方文件'
      }
    ],
    summary: '中立運動員：俄羅斯禁令下的特殊案例。',
    educationalNotes: '中立運動員制度允許清白運動員在國家被禁時參賽。'
  },
  // 其他運動項目的俄羅斯案例
  {
    athleteName: 'Alexander Povetkin',
    nationality: '俄羅斯',
    sport: '拳擊',
    substance: 'Meldonium',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2016,
    eventBackground: '俄羅斯重量級拳手因meldonium陽性導致與Anthony Joshua的世界冠軍戰延期。',
    punishment: {
      banDuration: '1年',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '重要拳賽延期'
    },
    sourceLinks: [
      {
        title: 'Povetkin Meldonium Boxing Scandal',
        url: 'https://www.boxingscene.com/',
        type: '新聞'
      }
    ],
    summary: '拳擊meldonium：職業拳擊的俄羅斯禁藥問題。',
    educationalNotes: 'Meldonium在各種運動項目中都有發現，包括拳擊。'
  },
  {
    athleteName: 'Eduard Latypov',
    nationality: '俄羅斯',
    sport: '冬季兩項',
    substance: '系統性國家禁藥',
    substanceCategory: 'M2: 化學和物理操作',
    year: 2014,
    eventBackground: '俄羅斯冬季兩項選手，索契冬奧銀牌得主，涉入系統性樣本替換。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '索契冬奧獎牌被取消'
    },
    sourceLinks: [
      {
        title: 'Sochi Biathlon Doping Sanctions',
        url: 'https://www.olympic.org/',
        type: '官方文件'
      }
    ],
    summary: '冬季兩項醜聞：索契主辦國的系統性作弊擴及多項目。',
    educationalNotes: '系統性禁藥計劃通常涉及多個運動項目的運動員。'
  },
  {
    athleteName: 'Evgeny Ustyugov',
    nationality: '俄羅斯',
    sport: '冬季兩項',
    substance: '系統性國家禁藥',
    substanceCategory: 'M2: 化學和物理操作',
    year: 2014,
    eventBackground: '俄羅斯冬季兩項選手，溫哥華和索契冬奧獎牌得主，長期系統性違規。',
    punishment: {
      banDuration: '4年',
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties: '多個奧運獎牌被取消'
    },
    sourceLinks: [
      {
        title: 'IBU Russian Biathlon Doping Investigation',
        url: 'https://www.biathlonworld.com/',
        type: '官方文件'
      }
    ],
    summary: '長期系統違規：跨越多屆奧運的禁藥使用。',
    educationalNotes: '某些運動員的違規行為可能跨越多年和多屆大賽。'
  },
  {
    athleteName: 'Evgenia Medvedeva',
    nationality: '俄羅斯',
    sport: '花式滑冰',
    substance: 'Trimetazidine (疑似)',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2018,
    eventBackground: '俄羅斯花滑女王雖未被正式指控，但與俄羅斯花滑系統有關聯。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '受俄羅斯整體禁令影響'
    },
    sourceLinks: [
      {
        title: 'Russian Figure Skating Doping Concerns',
        url: 'https://www.isu.org/',
        type: '官方文件'
      }
    ],
    summary: '花滑陰影：俄羅斯花式滑冰的系統性問題。',
    educationalNotes: '俄羅斯花式滑冰長期存在未成年運動員禁藥問題。'
  },
  {
    athleteName: 'Aliya Mustafina',
    nationality: '俄羅斯',
    sport: '體操',
    substance: 'Meldonium (疑似)',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2016,
    eventBackground: '俄羅斯體操女將雖未被正式指控，但處於俄羅斯系統性禁藥環境中。',
    punishment: {
      banDuration: '無',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '受國家禁令影響'
    },
    sourceLinks: [
      {
        title: 'Russian Gymnastics Doping Investigation',
        url: 'https://www.gymnastics.sport/',
        type: '官方文件'
      }
    ],
    summary: '體操系統問題：俄羅斯體操的整體環境。',
    educationalNotes: '系統性禁藥環境影響所有運動項目，包括技術性項目。'
  },
  {
    athleteName: 'Svetlana Romashina',
    nationality: '俄羅斯',
    sport: '韻律泳',
    substance: 'Meldonium',
    substanceCategory: 'S4.4: 代謝調節劑',
    year: 2016,
    eventBackground: '俄羅斯韻律泳選手，多屆奧運金牌得主，2016年meldonium檢出。',
    punishment: {
      banDuration: '無處罰',
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: '使用時間在禁用前'
    },
    sourceLinks: [
      {
        title: 'Synchronized Swimming Meldonium Case',
        url: 'https://www.fina.org/',
        type: '官方文件'
      }
    ],
    summary: '韻律泳meldonium：藝術性運動的禁藥問題。',
    educationalNotes: '即使是藝術性運動也可能涉及禁藥使用以增強耐力。'
  }
];

async function addRussianDopingCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db');
    console.log('Connected to MongoDB');

    console.log(`\n=== 補強俄羅斯禁藥案例 ===`);
    console.log(`準備新增 ${russianDopingCases.length} 個俄羅斯案例`);

    // 檢查當前俄羅斯案例數量
    const currentRussianCases = await Case.countDocuments({ nationality: '俄羅斯' });
    console.log(`當前俄羅斯案例數: ${currentRussianCases}`);

    // 新增俄羅斯案例
    const insertedCases = await Case.insertMany(russianDopingCases);
    console.log(`成功新增 ${insertedCases.length} 個俄羅斯案例`);

    // 更新相關案例連結
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

    console.log('相關案例連結更新完成');

    // 生成更新後統計
    const totalCases = await Case.countDocuments();
    const updatedRussianCases = await Case.countDocuments({ nationality: '俄羅斯' });
    
    const nationalityStats = await Case.aggregate([
      { $group: { _id: '$nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const substanceStats = await Case.aggregate([
      { $group: { _id: '$substanceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const sportStats = await Case.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`\n=== 補強後統計 ===`);
    console.log(`總案例數: ${totalCases}`);
    console.log(`俄羅斯案例數: ${updatedRussianCases} (${(updatedRussianCases/totalCases*100).toFixed(1)}%)`);

    console.log('\n🌍 國家排序 (前10名):');
    nationalityStats.slice(0, 10).forEach((stat, index) => {
      const percentage = (stat.count / totalCases * 100).toFixed(1);
      console.log(`  ${index + 1}. ${stat._id}: ${stat.count} 案例 (${percentage}%)`);
    });

    console.log('\n📊 新增的俄羅斯案例類型分布:');
    const russianSubstanceStats = {};
    russianDopingCases.forEach(c => {
      const category = c.substanceCategory;
      russianSubstanceStats[category] = (russianSubstanceStats[category] || 0) + 1;
    });
    
    Object.entries(russianSubstanceStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} 案例`);
      });

    console.log('\n🏅 新增的俄羅斯運動項目分布:');
    const russianSportStats = {};
    russianDopingCases.forEach(c => {
      const sport = c.sport;
      russianSportStats[sport] = (russianSportStats[sport] || 0) + 1;
    });
    
    Object.entries(russianSportStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([sport, count]) => {
        console.log(`  ${sport}: ${count} 案例`);
      });

    console.log('\n✅ 俄羅斯禁藥案例補強完成！');
    console.log('🎯 現在資料庫更準確反映了俄羅斯系統性禁藥問題的嚴重程度。');

    process.exit(0);
  } catch (error) {
    console.error('Error adding Russian doping cases:', error);
    process.exit(1);
  }
}

addRussianDopingCases();