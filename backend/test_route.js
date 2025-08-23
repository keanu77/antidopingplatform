const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 直接連接到antidoping資料庫
mongoose.connect('mongodb://localhost:27017/antidoping')
  .then(() => console.log('Connected to antidoping database'))
  .catch(err => console.error('MongoDB connection error:', err));

// 直接使用MongoDB原生查詢
app.get('/api/stats/overview', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // 直接查詢cases集合
    const totalCases = await db.collection('cases').countDocuments();
    console.log('Direct query - Total cases:', totalCases);
    
    const sports = await db.collection('cases').distinct('sport');
    console.log('Direct query - Sports:', sports.length, sports.slice(0, 3));
    
    const countries = await db.collection('cases').distinct('nationality');
    console.log('Direct query - Countries:', countries.length);
    
    const recentCases = await db.collection('cases')
      .find({})
      .sort({ year: -1 })
      .limit(5)
      .project({ athleteName: 1, sport: 1, year: 1 })
      .toArray();
    
    console.log('Direct query - Recent cases:', recentCases.map(c => c.athleteName));
    
    res.json({
      totalCases,
      totalSports: sports.length,
      totalCountries: countries.length,
      recentCases
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5005;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});