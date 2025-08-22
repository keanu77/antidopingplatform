const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

let db;

// 初始化資料庫連接
MongoClient.connect('mongodb://localhost:27017')
  .then(client => {
    db = client.db('sports-doping-db');
    console.log('Cases route connected to MongoDB');
  })
  .catch(err => console.error('Cases route DB error:', err));

// Get all cases with filtering and pagination
router.get('/', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { 
      sport, 
      nationality, 
      year, 
      substanceCategory,
      search,
      page = 1,
      limit = 12
    } = req.query;

    let query = {};

    // Build filter query
    if (sport) query.sport = sport;
    if (nationality) query.nationality = nationality;
    if (year) query.year = parseInt(year);
    if (substanceCategory) query.substanceCategory = substanceCategory;

    // Text search
    if (search) {
      query.$or = [
        { athleteName: { $regex: search, $options: 'i' } },
        { sport: { $regex: search, $options: 'i' } },
        { nationality: { $regex: search, $options: 'i' } },
        { substance: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute queries in parallel
    const [cases, total] = await Promise.all([
      db.collection('cases')
        .find(query)
        .sort({ year: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      db.collection('cases').countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      cases,
      total,
      currentPage: parseInt(page),
      totalPages,
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Cases query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unique values for filters
router.get('/filters', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const [sports, nationalities, categories, years] = await Promise.all([
      db.collection('cases').distinct('sport'),
      db.collection('cases').distinct('nationality'),
      db.collection('cases').distinct('substanceCategory'),
      db.collection('cases').distinct('year')
    ]);

    res.json({
      sports: sports.sort(),
      nationalities: nationalities.sort(),
      substanceCategories: categories.sort(),
      years: years.sort((a, b) => b - a) // 年份降序排列
    });

  } catch (error) {
    console.error('Filters query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get case by ID
router.get('/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { ObjectId } = require('mongodb');
    const caseData = await db.collection('cases').findOne({ _id: new ObjectId(req.params.id) });

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(caseData);

  } catch (error) {
    console.error('Case by ID query error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;