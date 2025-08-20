const fs = require('fs');

// 讀取現有的API文件
const apiPath = '/Users/ethanwu/Documents/AI class/202507 claude code/延伸/延伸七 運動禁藥案例平台/sports-doping-platform/frontend/src/services/api.js';
let apiContent = fs.readFileSync(apiPath, 'utf8');

console.log('修復生產環境數據問題...');

// 替換環境檢測邏輯，確保在生產環境中始終使用mock數據
const newApiContent = apiContent.replace(
  'const API_BASE_URL = import.meta.env.PROD ? null : (import.meta.env.VITE_API_URL || \'http://localhost:5001/api\');',
  `// 強制在生產環境使用mock數據以確保穩定性
const API_BASE_URL = (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) ? 
  null : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');`
);

// 修復統計數據的安全處理
const statsApiSection = `// Statistics API - 添加數據安全檢查
export const statsAPI = {
  getYearlyTrends: () => api ? api.get('/stats/yearly-trends') : mockResponse(mockData.stats.yearlyTrends || []),
  getSportDistribution: () => {
    if (api) return api.get('/stats/sport-distribution');
    
    const sportCount = {};
    (mockData.cases || []).forEach(c => {
      const sport = c.sport || '未分類';
      sportCount[sport] = (sportCount[sport] || 0) + 1;
    });
    const distribution = Object.entries(sportCount).map(([name, value]) => ({ name, value }));
    return mockResponse(distribution);
  },
  getSubstanceDistribution: () => {
    if (api) return api.get('/stats/substance-distribution');
    
    const substanceCount = {};
    (mockData.cases || []).forEach(c => {
      const substance = c.substance || '未知物質';
      substanceCount[substance] = (substanceCount[substance] || 0) + 1;
    });
    const distribution = Object.entries(substanceCount).map(([name, value]) => ({ name, value }));
    return mockResponse(distribution);
  },
  getNationalityDistribution: () => {
    if (api) return api.get('/stats/nationality-distribution');
    
    const nationalityCount = {};
    (mockData.cases || []).forEach(c => {
      const nationality = c.nationality || '未知';
      nationalityCount[nationality] = (nationalityCount[nationality] || 0) + 1;
    });
    const distribution = Object.entries(nationalityCount).map(([name, value]) => ({ name, value }));
    return mockResponse(distribution);
  },
  getPunishmentStats: () => {
    if (api) return api.get('/stats/punishment-stats');
    
    const stats = {
      medalStripped: (mockData.cases || []).filter(c => c.punishment && c.punishment.medalStripped === true).length,
      resultsCancelled: (mockData.cases || []).filter(c => c.punishment && c.punishment.resultsCancelled === true).length
    };
    return mockResponse(stats);
  },
  getBanDurationDistribution: () => {
    if (api) return api.get('/stats/ban-duration-distribution');
    
    const durationCount = {};
    (mockData.cases || []).forEach(c => {
      const duration = (c.punishment && c.punishment.banDuration) || '未知';
      durationCount[duration] = (durationCount[duration] || 0) + 1;
    });
    const distribution = Object.entries(durationCount).map(([name, value]) => ({ name, value }));
    return mockResponse(distribution);
  },
  getOverview: () => {
    if (api) return api.get('/stats/overview');
    
    const cases = mockData.cases || [];
    const sports = [...new Set(cases.map(c => c.sport).filter(Boolean))];
    const countries = [...new Set(cases.map(c => c.nationality).filter(Boolean))];
    
    const overview = {
      totalCases: cases.length,
      totalSports: sports.length,
      totalCountries: countries.length
    };
    return mockResponse(overview);
  },
};`;

// 替換統計API部分
const updatedContent = newApiContent.replace(
  /\/\/ Statistics API[\s\S]*?};/,
  statsApiSection
);

// 寫入更新的API文件
fs.writeFileSync(apiPath, updatedContent);

console.log('✅ 修復完成！');
console.log('📊 添加了數據安全檢查和生產環境穩定性改善');
console.log('🔧 修復了統計數據中的undefined值問題');