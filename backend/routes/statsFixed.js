const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

let db;

// 初始化資料庫連接
MongoClient.connect('mongodb://localhost:27017')
  .then(client => {
    db = client.db('antidoping');
    console.log('Stats route connected to MongoDB');
  })
  .catch(err => console.error('Stats route DB error:', err));

// Get basic stats for API root
router.get('/', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Get basic counts
    const [
      totalCases,
      uniqueSports,
      uniqueCountries,
      uniqueSubstances
    ] = await Promise.all([
      db.collection('cases').countDocuments(),
      db.collection('cases').distinct('sport'),
      db.collection('cases').distinct('nationality'),
      db.collection('cases').distinct('substance')
    ]);

    res.json({
      totalCases,
      uniqueSports: uniqueSports.length,
      uniqueCountries: uniqueCountries.length,
      uniqueSubstances: uniqueSubstances.length
    });

  } catch (error) {
    console.error('Basic stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get overview stats for home page (same as root but different endpoint)
router.get('/overview', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Get basic counts
    const [
      totalCases,
      uniqueSports,
      uniqueCountries
    ] = await Promise.all([
      db.collection('cases').countDocuments(),
      db.collection('cases').distinct('sport'),
      db.collection('cases').distinct('nationality')
    ]);

    res.json({
      totalCases,
      totalSports: uniqueSports.length,
      totalCountries: uniqueCountries.length
    });

  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get yearly trends
router.get('/yearly-trends', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const yearlyStats = await db.collection('cases').aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json(yearlyStats.map(stat => ({
      year: stat._id,
      count: stat.count
    })));
  } catch (error) {
    console.error('Yearly trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sport distribution
router.get('/sport-distribution', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const sportStats = await db.collection('cases').aggregate([
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    res.json(sportStats.map(stat => ({
      sport: stat._id,
      count: stat.count
    })));
  } catch (error) {
    console.error('Sport distribution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get substance category distribution
router.get('/substance-distribution', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const substanceStats = await db.collection('cases').aggregate([
      {
        $addFields: {
          // 將 S1.1 合併到 S1，其他子分類也合併到主分類
          normalizedCategory: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: '$substanceCategory', regex: '^S1\\.1' } }, then: 'S1: 合成代謝劑' },
                { case: { $regexMatch: { input: '$substanceCategory', regex: '^S1[^0-9]' } }, then: 'S1: 合成代謝劑' },
                { case: { $regexMatch: { input: '$substanceCategory', regex: '^S2\\.1' } }, then: 'S2: 胜肽激素、生長因子、相關物質及擬劑' },
                { case: { $regexMatch: { input: '$substanceCategory', regex: '^S2\\.2' } }, then: 'S2: 胜肽激素、生長因子、相關物質及擬劑' },
                { case: { $regexMatch: { input: '$substanceCategory', regex: '^S4\\.4' } }, then: 'S4: 激素及代謝調節劑' }
              ],
              default: '$substanceCategory'
            }
          }
        }
      },
      {
        $group: {
          _id: '$normalizedCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    res.json(substanceStats.map(stat => ({
      category: stat._id,
      count: stat.count
    })));
  } catch (error) {
    console.error('Substance distribution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get country distribution
router.get('/country-distribution', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const countryStats = await db.collection('cases').aggregate([
      {
        $group: {
          _id: '$nationality',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]).toArray();

    res.json(countryStats.map(stat => ({
      country: stat._id,
      count: stat.count
    })));
  } catch (error) {
    console.error('Country distribution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add nationality-distribution as alias for country-distribution
router.get('/nationality-distribution', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const countryStats = await db.collection('cases').aggregate([
      {
        $group: {
          _id: '$nationality',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]).toArray();

    res.json(countryStats.map(stat => ({
      name: stat._id,
      value: stat.count
    })));
  } catch (error) {
    console.error('Nationality distribution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ban duration distribution (original detailed version)
router.get('/ban-duration-distribution-detailed', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const banStats = await db.collection('cases').aggregate([
      {
        $group: {
          _id: '$punishment.banDuration',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Calculate total for percentages
    const total = banStats.reduce((acc, stat) => acc + stat.count, 0);

    res.json(banStats.map(stat => ({
      category: stat._id || '未分類',
      count: stat.count,
      percentage: Math.round((stat.count / total) * 100)
    })));
  } catch (error) {
    console.error('Ban duration distribution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ban duration distribution (simplified 10 categories)
router.get('/ban-duration-distribution', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const allCases = await db.collection('cases').find({}).toArray();
    
    // Initialize simplified categories
    const categories = {
      '無處罰 (TUE/合法)': 0,
      '1-6個月': 0,
      '7-12個月': 0,
      '13-18個月': 0,
      '19-24個月': 0,
      '2-3年': 0,
      '4年以上': 0,
      '終身禁賽': 0,
      '死亡/特殊情況': 0,
      '其他': 0
    };

    // Categorize each case
    allCases.forEach(case_ => {
      const banDuration = case_.punishment?.banDuration || '';
      const normalized = banDuration.toLowerCase();

      if (normalized.includes('無處罰') || normalized.includes('合法tue') || 
          normalized.includes('tue證明') || normalized.includes('無禁賽') ||
          normalized.includes('無正式禁賽') || normalized.includes('無（成功') ||
          normalized.includes('當時合法')) {
        categories['無處罰 (TUE/合法)']++;
      }
      else if (normalized.includes('死亡') || normalized.includes('國家系統性禁藥受害者')) {
        categories['死亡/特殊情況']++;
      }
      else if (normalized.includes('終身') || normalized.includes('10年')) {
        categories['終身禁賽']++;
      }
      else if (normalized.includes('1個月') || normalized.includes('6個月') ||
               normalized.includes('50場') || normalized.includes('65場')) {
        categories['1-6個月']++;
      }
      else if (normalized.includes('7個月') || normalized.includes('8個月') ||
               normalized.includes('9個月') || normalized.includes('12個月') ||
               normalized.includes('1年')) {
        categories['7-12個月']++;
      }
      else if (normalized.includes('14個月') || normalized.includes('15個月') ||
               normalized.includes('18個月')) {
        categories['13-18個月']++;
      }
      else if (normalized.includes('2年') || normalized.includes('22個月') ||
               normalized.includes('80場') || normalized.includes('162場') ||
               normalized.includes('211場')) {
        categories['19-24個月']++;
      }
      else if (normalized.includes('3年')) {
        categories['2-3年']++;
      }
      else if (normalized.includes('4年') || normalized.includes('4年3個月')) {
        categories['4年以上']++;
      }
      else if (normalized.includes('奧運失格') || normalized.includes('追溯取消') ||
               normalized.includes('第一次') || normalized.includes('未被抓獲')) {
        categories['其他']++;
      }
      else {
        // Any unmatched cases go to "其他"
        categories['其他']++;
      }
    });

    // Convert to array format with percentages
    const total = allCases.length;
    const result = Object.entries(categories)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .filter(item => item.count > 0) // Only show categories with cases
      .sort((a, b) => b.count - a.count); // Sort by count descending

    res.json(result);
  } catch (error) {
    console.error('Ban duration distribution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get punishment statistics
router.get('/punishment-stats', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const [medalStripped, resultsCancelled] = await Promise.all([
      db.collection('cases').countDocuments({ 'punishment.medalStripped': true }),
      db.collection('cases').countDocuments({ 'punishment.resultsCancelled': true })
    ]);

    res.json({
      medalStripped,
      resultsCancelled
    });
  } catch (error) {
    console.error('Punishment stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;