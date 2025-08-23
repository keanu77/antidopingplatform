const express = require('express');
const router = express.Router();
const Case = require('../models/Case');

// Get yearly trends
router.get('/yearly-trends', async (req, res) => {
  try {
    const yearlyStats = await Case.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(yearlyStats.map(stat => ({
      year: stat._id,
      count: stat.count
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sport distribution
router.get('/sport-distribution', async (req, res) => {
  try {
    const sportStats = await Case.aggregate([
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json(sportStats.map(stat => ({
      sport: stat._id,
      count: stat.count
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get substance category distribution
router.get('/substance-distribution', async (req, res) => {
  try {
    const substanceStats = await Case.aggregate([
      {
        $group: {
          _id: '$substanceCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(substanceStats.map(stat => ({
      category: stat._id,
      count: stat.count
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nationality distribution
router.get('/nationality-distribution', async (req, res) => {
  try {
    const nationalityStats = await Case.aggregate([
      {
        $group: {
          _id: '$nationality',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.json(nationalityStats.map(stat => ({
      nationality: stat._id,
      count: stat.count
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get punishment statistics
router.get('/punishment-stats', async (req, res) => {
  try {
    const stats = await Case.aggregate([
      {
        $facet: {
          medalStripped: [
            { $match: { 'punishment.medalStripped': true } },
            { $count: 'count' }
          ],
          resultsCancelled: [
            { $match: { 'punishment.resultsCancelled': true } },
            { $count: 'count' }
          ],
          banDurations: [
            {
              $group: {
                _id: '$punishment.banDuration',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);

    res.json({
      medalStripped: stats[0].medalStripped[0]?.count || 0,
      resultsCancelled: stats[0].resultsCancelled[0]?.count || 0,
      banDurations: stats[0].banDurations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ban duration distribution
router.get('/ban-duration-distribution', async (req, res) => {
  try {
    // 獲取所有案例的禁賽期限
    const cases = await Case.find({}, 'punishment.banDuration');
    
    // 定義禁賽期限分類
    const categories = {
      '無處罰': 0,
      '3個月內': 0,
      '3-12個月': 0,
      '1-2年': 0,
      '2-4年': 0,
      '4年以上': 0,
      '終身禁賽': 0
    };

    // 分類每個案例
    cases.forEach(caseItem => {
      const banDuration = caseItem.punishment?.banDuration || '';
      const banLower = banDuration.toLowerCase();
      
      // 檢查是否為終身禁賽
      if (banLower.includes('終身') || banLower.includes('永久') || banLower.includes('lifetime')) {
        categories['終身禁賽']++;
      }
      // 檢查是否無處罰
      else if (banLower.includes('無') || banLower.includes('清白') || banLower.includes('no ban') || banLower.includes('無正式禁賽')) {
        categories['無處罰']++;
      }
      // 解析具體時間
      else {
        // 提取數字和單位
        const matches = banDuration.match(/(\d+)\s*(年|月|天|週|場|days?|months?|years?|games?)/gi);
        
        if (matches) {
          let totalMonths = 0;
          
          matches.forEach(match => {
            const numberMatch = match.match(/(\d+)/);
            const number = numberMatch ? parseInt(numberMatch[1]) : 0;
            const unit = match.toLowerCase();
            
            // 轉換為月份
            if (unit.includes('年') || unit.includes('year')) {
              totalMonths += number * 12;
            } else if (unit.includes('月') || unit.includes('month')) {
              totalMonths += number;
            } else if (unit.includes('週') || unit.includes('week')) {
              totalMonths += number * 0.25;
            } else if (unit.includes('天') || unit.includes('day')) {
              totalMonths += number / 30;
            } else if (unit.includes('場') || unit.includes('game')) {
              // 假設平均一個賽季162場，約6個月
              totalMonths += (number / 162) * 6;
            }
          });
          
          // 分類到對應區間
          if (totalMonths <= 0) {
            categories['無處罰']++;
          } else if (totalMonths <= 3) {
            categories['3個月內']++;
          } else if (totalMonths <= 12) {
            categories['3-12個月']++;
          } else if (totalMonths <= 24) {
            categories['1-2年']++;
          } else if (totalMonths <= 48) {
            categories['2-4年']++;
          } else {
            categories['4年以上']++;
          }
        } else {
          // 無法解析，歸類為其他
          if (banDuration.includes('退休') || banDuration.includes('生涯結束')) {
            categories['終身禁賽']++;
          } else {
            categories['無處罰']++;
          }
        }
      }
    });

    // 轉換為陣列格式
    const result = Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      percentage: ((count / cases.length) * 100).toFixed(1)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overall statistics
router.get('/overview', async (req, res) => {
  try {
    console.log('Overview API called');
    console.log('Database connection:', Case.db.name);
    console.log('Collection name:', Case.collection.name);
    
    const totalCases = await Case.countDocuments();
    console.log('Step 1 - Total cases:', totalCases);
    
    const sports = await Case.distinct('sport');
    console.log('Step 2 - Sports:', sports.length, sports.slice(0, 3));
    
    const countries = await Case.distinct('nationality');
    console.log('Step 3 - Countries:', countries.length, countries.slice(0, 3));
    
    const recentCases = await Case.find().sort({ year: -1 }).limit(5).select('athleteName sport year');
    console.log('Step 4 - Recent cases:', recentCases.length, recentCases.map(c => c.athleteName));
    
    const totalSports = sports.length;
    const totalCountries = countries.length;

    res.json({
      totalCases,
      totalSports,
      totalCountries,
      recentCases
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;