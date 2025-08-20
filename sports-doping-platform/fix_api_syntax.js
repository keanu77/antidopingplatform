const fs = require('fs');

// Read the complete cases data
const casesData = JSON.parse(fs.readFileSync('/tmp/all_cases_complete.json', 'utf8'));
const cases = casesData.cases;

console.log(`Processing ${cases.length} cases...`);

function generateEventBackground(caseData) {
  const { year, sport, athleteName, substance } = caseData;
  
  // 特殊案例的詳細背景
  if (athleteName === 'Ben Johnson') return '1988年漢城奧運會100公尺決賽，以9.79秒打破世界紀錄奪金，但賽後藥檢呈陽性反應。';
  if (athleteName === 'Lance Armstrong') return '七屆環法自行車賽冠軍，長期使用禁藥並領導團隊系統性作弊。';
  if (athleteName === 'Maria Sharapova') return '2016年澳網期間藥檢呈陽性，聲稱不知道Meldonium已被列入禁藥清單。';
  if (athleteName === 'Marion Jones') return '2000年雪梨奧運會獲得5面獎牌，後承認使用禁藥。';
  if (athleteName === 'Sun Yang') return '2014年全國游泳錦標賽藥檢陽性，後因破壞血檢樣本再次被禁賽。';
  if (athleteName === 'Russian State Doping System') return '俄羅斯國家層面系統性禁藥計劃，影響多屆奧運會和世界大賽。';
  
  // 根據年代生成背景
  if (year >= 2020) return `${year}年期間，${sport}選手${athleteName}因使用${substance}被檢出，成為近年重要的禁藥案例。`;
  if (year >= 2010) return `${year}年，${sport}選手${athleteName}因${substance}違規成為國際體育界關注焦點。`;
  if (year >= 2000) return `${year}年，${athleteName}在${sport}項目中因${substance}的禁藥案例震驚體育界。`;
  if (year >= 1990) return `${year}年，${sport}選手${athleteName}使用${substance}的禁藥事件成為體育史上的重要案例。`;
  return `${year}年，${athleteName}在${sport}項目中的禁藥案例對當時的體育界產生重大影響。`;
}

function generateSourceLinks(caseData) {
  const { athleteName, sport } = caseData;
  const links = [{
    title: `WADA - ${athleteName} Case`,
    url: 'https://www.wada-ama.org/',
    type: 'WADA'
  }];
  
  // 根據運動項目添加特定來源
  if (sport === '田徑') links.push({ title: 'World Athletics', url: 'https://www.worldathletics.org/', type: '官方文件' });
  if (sport === '游泳') links.push({ title: 'World Aquatics', url: 'https://www.worldaquatics.com/', type: '官方文件' });
  if (sport === '自行車') links.push({ title: 'UCI', url: 'https://www.uci.org/', type: '官方文件' });
  if (sport === '網球') links.push({ title: 'ITF', url: 'https://www.itftennis.com/', type: '官方文件' });
  
  return links;
}

function generateSummary(caseData) {
  const { sport, year, athleteName, substanceCategory } = caseData;
  
  // 特殊案例的摘要
  if (athleteName === 'Ben Johnson') return '史上最著名的禁藥醜聞之一，改變了奧運會的藥檢制度。';
  if (athleteName === 'Lance Armstrong') return '自行車史上最大的禁藥醜聞，揭露了職業自行車界的系統性問題。';
  if (athleteName === 'Maria Sharapova') return '高知名度選手因未注意禁藥清單更新而違規的案例。';
  if (athleteName.includes('俄羅斯') || athleteName.includes('Russian')) return '俄羅斯系統性禁藥計劃的重要案例，影響國際體育治理。';
  
  // 一般案例的摘要
  return `${year}年${sport}界的重要禁藥案例，展現了${substanceCategory}類物質的危害。`;
}

function generateEducationalNotes(caseData) {
  const { substance, substanceCategory } = caseData;
  
  // 特定物質的教育說明
  if (substance.includes('Stanozolol')) return 'Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。';
  if (substance.includes('EPO')) return 'EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。';
  if (substance.includes('Meldonium')) return 'Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。';
  if (substance.includes('THG')) return 'THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。';
  if (substance.includes('Clenbuterol')) return 'Clenbuterol是支氣管擴張劑，也用於畜牧業，可能通過食物鏈進入人體。';
  if (substance.includes('Testosterone') || substance.includes('睪固酮')) return '睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。';
  if (substance.includes('Trimetazidine')) return 'Trimetazidine是心臟病藥物，被列為禁藥是因為可能提高運動表現。';
  
  // 根據類別提供教育說明
  const category = substanceCategory;
  if (category.includes('類固醇') || category.includes('S1')) return '合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。';
  if (category.includes('EPO') || category.includes('S2')) return 'EPO和生長激素能提高運動表現，但會增加血栓、中風和器官肥大風險。';
  if (category.includes('興奮劑') || category.includes('S6')) return '興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。';
  if (category.includes('利尿劑') || category.includes('S5')) return '利尿劑常用於掩蔽其他禁藥，同時會影響電解質平衡。';
  if (category.includes('代謝') || category.includes('S4')) return '代謝調節劑能影響新陳代謝和氧氣利用，但會對心臟造成負擔。';
  if (category.includes('操作') || category.includes('M')) return '物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。';
  
  return '此物質被列為禁用是因為其對運動表現的不當提升和潛在健康風險。';
}

// Convert cases data with proper formatting
const convertedCases = cases.map(caseData => ({
  _id: caseData._id,
  athleteName: caseData.athleteName,
  nationality: caseData.nationality,
  sport: caseData.sport,
  substance: caseData.substance,
  substanceCategory: caseData.substanceCategory,
  year: caseData.year,
  eventBackground: generateEventBackground(caseData),
  punishment: caseData.punishment,
  sourceLinks: generateSourceLinks(caseData),
  summary: generateSummary(caseData),
  educationalNotes: generateEducationalNotes(caseData)
}));

// Generate the new API file content
const apiContent = `import axios from 'axios';

// 在生產環境中使用模擬數據，開發環境連接後端
const API_BASE_URL = import.meta.env.PROD ? null : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');

const api = API_BASE_URL ? axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) : null;

// 模擬數據
const mockData = {
  cases: ${JSON.stringify(convertedCases, null, 2)},
  statistics: {
    totalCases: ${cases.length},
    countries: [${[...new Set(cases.map(c => c.nationality))].map(c => `"${c}"`).join(', ')}],
    substances: [${[...new Set(cases.map(c => c.substance))].map(s => `"${s}"`).join(', ')}]
  },
  tue: {
    basic: {},
    diseases: [],
    tools: []
  },
  filterOptions: {
    sports: [${[...new Set(cases.map(c => c.sport))].map(s => `"${s}"`).join(', ')}],
    substances: [${[...new Set(cases.map(c => c.substance))].map(s => `"${s}"`).join(', ')}],
    years: [${[...new Set(cases.map(c => c.year))].sort().join(', ')}]
  }
};

// 模擬 API 響應
const mockResponse = (data) => Promise.resolve({ data });

// Cases API
export const casesAPI = {
  getAll: (params) => api ? api.get('/cases', { params }) : mockResponse(mockData.cases),
  getById: (id) => api ? api.get(\`/cases/\${id}\`) : mockResponse(mockData.cases.find(c => c._id === id) || null),
  create: (data) => api ? api.post('/cases', data) : mockResponse(data),
  update: (id, data) => api ? api.put(\`/cases/\${id}\`, data) : mockResponse(data),
  delete: (id) => api ? api.delete(\`/cases/\${id}\`) : mockResponse({ success: true })
};

// Statistics API
export const statisticsAPI = {
  getOverview: () => api ? api.get('/statistics/overview') : mockResponse(mockData.statistics)
};

// TUE API
export const tueAPI = {
  getBasic: () => api ? api.get('/tue/basic') : mockResponse(mockData.tue.basic),
  getDiseases: () => api ? api.get('/tue/diseases') : mockResponse(mockData.tue.diseases),
  getTools: () => api ? api.get('/tue/tools') : mockResponse(mockData.tue.tools)
};

export { mockData };
export default { casesAPI, statisticsAPI, tueAPI };
`;

// Write the corrected API file
fs.writeFileSync('/Users/ethanwu/Documents/AI class/202507 claude code/延伸/延伸七 運動禁藥案例平台/sports-doping-platform/frontend/src/services/api.js', apiContent);

console.log('✅ Successfully recreated frontend API file with correct syntax');
console.log(`📊 Added ${convertedCases.length} cases to frontend`);