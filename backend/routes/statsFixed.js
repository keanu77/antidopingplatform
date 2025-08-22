const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

let db;

// 初始化資料庫連接
MongoClient.connect('mongodb://localhost:27017')
  .then(client => {
    db = client.db('sports-doping-db');
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
        $group: {
          _id: '$substanceCategory',
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

// Get ban duration distribution
router.get('/ban-duration-distribution', async (req, res) => {
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