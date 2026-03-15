const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

const errorResponse = (error) =>
  process.env.NODE_ENV === 'production' ? '伺服器錯誤，請稍後再試' : error.message;

let db;

// 初始化資料庫連接
MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017')
  .then(client => {
    db = client.db('sports-doping-db');
    console.log('Stats route connected to MongoDB');
  })
  .catch(err => console.error('Stats route DB error:', err));

// Shared handler: overview stats
const overviewHandler = async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

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
      uniqueSubstances: uniqueSubstances.length,
      // Also include aliases used by /overview consumers
      totalSports: uniqueSports.length,
      totalCountries: uniqueCountries.length
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({ error: errorResponse(error) });
  }
};

router.get('/', overviewHandler);
router.get('/overview', overviewHandler);

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
    res.status(500).json({ error: errorResponse(error) });
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
    res.status(500).json({ error: errorResponse(error) });
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
    res.status(500).json({ error: errorResponse(error) });
  }
});

// Shared country/nationality query
async function getCountryStats() {
  return db.collection('cases').aggregate([
    {
      $group: {
        _id: '$nationality',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 15 }
  ]).toArray();
}

// Get country distribution
router.get('/country-distribution', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const countryStats = await getCountryStats();

    res.json(countryStats.map(stat => ({
      country: stat._id,
      count: stat.count
    })));
  } catch (error) {
    console.error('Country distribution error:', error);
    res.status(500).json({ error: errorResponse(error) });
  }
});

// Nationality distribution (alias with different output format)
router.get('/nationality-distribution', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const countryStats = await getCountryStats();

    res.json(countryStats.map(stat => ({
      name: stat._id,
      value: stat.count
    })));
  } catch (error) {
    console.error('Nationality distribution error:', error);
    res.status(500).json({ error: errorResponse(error) });
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

    const total = banStats.reduce((acc, stat) => acc + stat.count, 0);

    res.json(banStats.map(stat => ({
      category: stat._id || '未分類',
      count: stat.count,
      percentage: Math.round((stat.count / total) * 100)
    })));
  } catch (error) {
    console.error('Ban duration distribution error:', error);
    res.status(500).json({ error: errorResponse(error) });
  }
});

// Get ban duration distribution (simplified categories via aggregation pipeline)
router.get('/ban-duration-distribution', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const banStats = await db.collection('cases').aggregate([
      {
        $addFields: {
          banCategory: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /無處罰|合法tue|tue證明|無禁賽|無正式禁賽|無（成功|當時合法/ } }, then: '無處罰 (TUE/合法)' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /死亡|國家系統性禁藥受害者/ } }, then: '死亡/特殊情況' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /終身|10年|無限期停賽/ } }, then: '終身禁賽' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /1個月|6個月|3個月/ } }, then: '1-6個月' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /7個月|8個月|9個月|12個月|1年/ } }, then: '7-12個月' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /14個月|15個月|18個月|2年|22個月|21個月/ } }, then: '1-2年' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /3年|2-4年不等/ } }, then: '2-3年' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /4年|4年3個月|8年|4年集體禁賽|6年|5年/ } }, then: '4年以上' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /退役|自行退役|已退役|退役後/ } }, then: '退役' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /追溯性道德譴責|學術聲譽受損|車隊解散|終身禁入體育界|聲譽受損/ } }, then: '聲譽受損' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /無確鑿證據|暫時禁賽|暫時禁賽後撤銷|無證據確鑿/ } }, then: '暫時禁賽：無確鑿證據' },
                { case: { $regexMatch: { input: { $toLower: { $ifNull: ['$punishment.banDuration', ''] } }, regex: /場禁賽|場比賽|球季|賽季|80場|162場|211場|50場|65場|25場|20場|10場/ } }, then: '特定比賽場次' },
              ],
              default: '其他'
            }
          }
        }
      },
      { $group: { _id: '$banCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const total = banStats.reduce((acc, stat) => acc + stat.count, 0);
    res.json(banStats.map(stat => ({
      category: stat._id,
      count: stat.count,
      percentage: Math.round((stat.count / total) * 100)
    })));
  } catch (error) {
    console.error('Ban duration distribution error:', error);
    res.status(500).json({ error: errorResponse(error) });
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
    res.status(500).json({ error: errorResponse(error) });
  }
});

module.exports = router;
