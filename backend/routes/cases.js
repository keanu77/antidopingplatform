const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const fuzzysort = require('fuzzysort');

// 簡單的記憶體快取
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分鐘

// 快取工具函數
function getCacheKey(params) {
  return JSON.stringify(params);
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // 限制快取大小
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

// 清理過期快取
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60 * 1000); // 每分鐘清理一次

// Get all cases with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      sport, 
      nationality, 
      year, 
      substanceCategory,
      banDuration,
      punishmentType,
      search,
      page = 1,
      limit = 12
    } = req.query;

    // 檢查快取
    const cacheKey = getCacheKey(req.query);
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    let query = {};

    // Build filter query
    if (sport) query.sport = sport;
    if (nationality) query.nationality = nationality;
    if (year) query.year = parseInt(year);
    
    // 處理特殊的TUE篩選
    if (substanceCategory) {
      if (substanceCategory === '🏥 TUE合法使用案例') {
        query.$or = [
          { substanceCategory: 'TUE合法使用' },
          { 'punishment.banDuration': { $regex: /TUE|合法.*使用/ } }
        ];
      } else {
        query.substanceCategory = substanceCategory;
      }
    }

    // 新增的篩選條件
    if (banDuration) {
      switch (banDuration) {
        case '無處罰':
          query.$or = [
            { 'punishment.banDuration': { $regex: /無處罰|無禁賽|警告/ } },
            { 'punishment.banDuration': { $exists: false } }
          ];
          break;
        case '3個月內':
          query['punishment.banDuration'] = { $regex: /[1-3]個月|月/ };
          break;
        case '3-12個月':
          query['punishment.banDuration'] = { $regex: /[4-9]個月|1[0-2]個月/ };
          break;
        case '1-2年':
          query['punishment.banDuration'] = { $regex: /1年|2年|24個月/ };
          break;
        case '2-4年':
          query['punishment.banDuration'] = { $regex: /[3-4]年|36個月|48個月/ };
          break;
        case '4年以上':
          query['punishment.banDuration'] = { $regex: /[5-9]年|[1-9]\d年/ };
          break;
        case '終身禁賽':
          query['punishment.banDuration'] = { $regex: /終身|永久/ };
          break;
      }
    }

    if (punishmentType) {
      switch (punishmentType) {
        case '禁賽':
          query['punishment.banDuration'] = { $exists: true, $ne: '' };
          break;
        case '獎牌剝奪':
          query['punishment.medalStripped'] = true;
          break;
        case '成績取消':
          query['punishment.resultsCancelled'] = true;
          break;
        case '罰款':
          query['punishment.banDuration'] = { $regex: /罰款|罰金/ };
          break;
        case '警告':
          query['punishment.banDuration'] = { $regex: /警告|告誡/ };
          break;
      }
    }

    let cases, total;

    // Enhanced text search with fuzzy matching
    if (search) {
      // 先嘗試精確搜索
      const exactQuery = { ...query, $text: { $search: search } };
      cases = await Case.find(exactQuery).sort({ year: -1 });
      
      // 如果精確搜索結果少於5個，使用模糊搜索
      if (cases.length < 5) {
        // 獲取所有符合其他篩選條件的案例
        const allCases = await Case.find(query);
        
        // 使用 fuzzysort 進行模糊匹配
        const searchTargets = allCases.map(caseItem => ({
          ...caseItem.toObject(),
          searchText: `${caseItem.athleteName} ${caseItem.sport} ${caseItem.substance} ${caseItem.nationality}`
        }));
        
        // 模糊搜索
        const fuzzyResults = fuzzysort.go(search, searchTargets, {
          keys: ['athleteName', 'sport', 'substance', 'nationality', 'substanceCategory'],
          threshold: -50000,
          limit: 100
        });
        
        // 合併精確和模糊搜索結果，去除重複
        const fuzzyWithOriginal = fuzzyResults.map(result => result.obj);
        const exactIds = new Set(cases.map(c => c._id.toString()));
        const additionalFuzzy = fuzzyWithOriginal.filter(c => !exactIds.has(c._id.toString()));
        
        cases = [...cases, ...additionalFuzzy];
      }
      
      // 分頁處理
      total = cases.length;
      const skip = (page - 1) * limit;
      cases = cases.slice(skip, skip + parseInt(limit));
      
    } else {
      // 沒有搜索詞時使用原來的邏輯，加入索引優化
      const skip = (page - 1) * limit;
      
      // 使用 lean() 提高查詢效能
      cases = await Case.find(query)
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
        .select('athleteName sport nationality year substance substanceCategory punishment createdAt');
      
      total = await Case.countDocuments(query);
    }

    const result = {
      cases,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCases: total
    };

    // 儲存到快取
    setCache(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Cases query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single case by ID
router.get('/:id', async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('relatedCases', 'athleteName sport substance year');
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(caseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new case
router.post('/', async (req, res) => {
  try {
    const newCase = new Case(req.body);
    const savedCase = await newCase.save();
    res.status(201).json(savedCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update case
router.put('/:id', async (req, res) => {
  try {
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(updatedCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete case
router.delete('/:id', async (req, res) => {
  try {
    const deletedCase = await Case.findByIdAndDelete(req.params.id);
    
    if (!deletedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get filter options
router.get('/filters/options', async (req, res) => {
  try {
    // 檢查快取
    const cacheKey = 'filter-options';
    const cachedOptions = getCache(cacheKey);
    if (cachedOptions) {
      return res.json(cachedOptions);
    }

    // 使用並行查詢提高效率
    const [sports, nationalities, years, substanceCategories, tueCount] = await Promise.all([
      Case.distinct('sport'),
      Case.distinct('nationality'), 
      Case.distinct('year'),
      Case.distinct('substanceCategory'),
      Case.countDocuments({ 
        $or: [
          { substanceCategory: 'TUE合法使用' },
          { 'punishment.banDuration': { $regex: /TUE|合法.*使用/ } }
        ]
      })
    ]);

    // 將TUE相關類別分組並加入特殊篩選選項
    let enhancedCategories = [...substanceCategories.sort()];
    
    // 移除原本的 'TUE合法使用' 並加入新的特殊篩選選項
    enhancedCategories = enhancedCategories.filter(cat => cat !== 'TUE合法使用');
    
    if (tueCount > 0) {
      enhancedCategories.unshift('🏥 TUE合法使用案例');
    }

    const result = {
      sports: sports.sort(),
      nationalities: nationalities.sort(),
      years: years.sort((a, b) => b - a),
      substanceCategories: enhancedCategories
    };

    // 儲存到快取（較長的快取時間，因為這個資料變動較少）
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Compare cases
router.post('/compare', async (req, res) => {
  try {
    const { caseIds } = req.body;
    
    if (!caseIds || caseIds.length !== 2) {
      return res.status(400).json({ error: 'Please provide exactly 2 case IDs' });
    }

    const cases = await Case.find({ _id: { $in: caseIds } });
    
    if (cases.length !== 2) {
      return res.status(404).json({ error: 'One or more cases not found' });
    }

    res.json({ 
      case1: cases[0],
      case2: cases[1],
      comparison: {
        sameSport: cases[0].sport === cases[1].sport,
        sameSubstanceCategory: cases[0].substanceCategory === cases[1].substanceCategory,
        yearDifference: Math.abs(cases[0].year - cases[1].year)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;