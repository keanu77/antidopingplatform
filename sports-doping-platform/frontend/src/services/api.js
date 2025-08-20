import axios from 'axios';

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
  cases: [
    {
      _id: '1',
      athleteName: 'Ben Johnson',
      nationality: '加拿大',
      sport: '田徑',
      substance: 'Stanozolol',
      substanceCategory: '類固醇',
      year: 1988,
      eventBackground: '1988年漢城奧運會100公尺決賽，以9.79秒打破世界紀錄奪金，但賽後藥檢呈陽性反應。',
      punishment: {
        banDuration: '2年',
        resultsCancelled: true,
        medalStripped: true,
        otherPenalties: '世界紀錄被取消'
      },
      sourceLinks: [
        {
          title: 'Olympics.com - Ben Johnson doping scandal',
          url: 'https://olympics.com/en/news/ben-johnson-doping-scandal-seoul-1988',
          type: '官方文件'
        }
      ],
      summary: '史上最著名的禁藥醜聞之一，改變了奧運會的藥檢制度。',
      educationalNotes: 'Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。'
    },
    {
      _id: '2',
      athleteName: 'Lance Armstrong',
      nationality: '美國',
      sport: '自行車',
      substance: 'EPO、睪固酮、皮質類固醇',
      substanceCategory: 'EPO',
      year: 2012,
      eventBackground: '七屆環法自行車賽冠軍，長期使用禁藥並領導團隊系統性作弊。',
      punishment: {
        banDuration: '終身禁賽',
        resultsCancelled: true,
        medalStripped: true,
        otherPenalties: '剝奪1998年後所有成績，包括7個環法冠軍'
      },
      sourceLinks: [
        {
          title: 'USADA Report on Lance Armstrong',
          url: 'https://www.usada.org/lance-armstrong/',
          type: 'WADA'
        }
      ],
      summary: '自行車史上最大的禁藥醜聞，揭露了職業自行車界的系統性問題。',
      educationalNotes: 'EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。'
    },
    {
      _id: '3',
      athleteName: 'Maria Sharapova',
      nationality: '俄羅斯',
      sport: '網球',
      substance: 'Meldonium',
      substanceCategory: '其他',
      year: 2016,
      eventBackground: '2016年澳網期間藥檢呈陽性，聲稱不知道Meldonium已被列入禁藥清單。',
      punishment: {
        banDuration: '15個月',
        resultsCancelled: false,
        medalStripped: false,
        otherPenalties: '失去多個贊助合約'
      },
      sourceLinks: [
        {
          title: 'ITF Statement on Maria Sharapova',
          url: 'https://www.itftennis.com/en/news-and-media/',
          type: '官方文件'
        }
      ],
      summary: '高知名度選手因未注意禁藥清單更新而違規的案例。',
      educationalNotes: 'Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。'
    },
    {
      _id: '4',
      athleteName: 'Marion Jones',
      nationality: '美國',
      sport: '田徑',
      substance: 'THG (Tetrahydrogestrinone)',
      substanceCategory: '類固醇',
      year: 2007,
      eventBackground: '2000年雪梨奧運會獲得5面獎牌，後承認使用禁藥。',
      punishment: {
        banDuration: '2年',
        resultsCancelled: true,
        medalStripped: true,
        otherPenalties: '因作偽證被判入獄6個月'
      },
      sourceLinks: [
        {
          title: 'BALCO Scandal',
          url: 'https://www.wada-ama.org/',
          type: 'WADA'
        }
      ],
      summary: 'BALCO醜聞的核心人物之一，揭露了美國田徑界的禁藥問題。',
      educationalNotes: 'THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。'
    },
    {
      _id: '5',
      athleteName: 'Sun Yang',
      nationality: '中國',
      sport: '游泳',
      substance: 'Trimetazidine',
      substanceCategory: '興奮劑',
      year: 2014,
      eventBackground: '2014年全國游泳錦標賽藥檢陽性，後因破壞血檢樣本再次被禁賽。',
      punishment: {
        banDuration: '3個月（2014年）、8年（2020年）',
        resultsCancelled: false,
        medalStripped: false,
        otherPenalties: '2020年因破壞血檢樣本被重罰'
      },
      sourceLinks: [
        {
          title: 'CAS Decision on Sun Yang',
          url: 'https://www.tas-cas.org/',
          type: '官方文件'
        }
      ],
      summary: '中國游泳名將的爭議案例，涉及藥檢程序和運動員權利的討論。',
      educationalNotes: 'Trimetazidine是心臟病藥物，2014年被列為禁藥，可能提高運動表現。'
    },
    {
      _id: '6',
      athleteName: 'Tyson Gay',
      nationality: '美國',
      sport: '田徑',
      substance: '合成代謝類固醇',
      substanceCategory: '類固醇',
      year: 2013,
      eventBackground: '美國短跑名將，100公尺美國紀錄保持者，2013年藥檢陽性。',
      punishment: {
        banDuration: '1年',
        resultsCancelled: true,
        medalStripped: true,
        otherPenalties: '失去2012年奧運會4x100公尺接力銀牌'
      },
      sourceLinks: [
        {
          title: 'USADA Tyson Gay Case',
          url: 'https://www.usada.org/',
          type: 'WADA'
        }
      ],
      summary: '美國短跑界的禁藥案例，顯示即使頂尖運動員也可能違規。',
      educationalNotes: '合成代謝類固醇能增加肌肉量和爆發力，但對心血管系統有嚴重副作用。'
    },
    {
      _id: '7',
      athleteName: 'Alberto Contador',
      nationality: '西班牙',
      sport: '自行車',
      substance: 'Clenbuterol',
      substanceCategory: '興奮劑',
      year: 2010,
      eventBackground: '2010年環法自行車賽期間檢測出微量Clenbuterol，聲稱是食用受污染的牛肉所致。',
      punishment: {
        banDuration: '2年',
        resultsCancelled: true,
        medalStripped: true,
        otherPenalties: '失去2010年環法冠軍和2011年環義冠軍'
      },
      sourceLinks: [
        {
          title: 'CAS Alberto Contador Decision',
          url: 'https://www.tas-cas.org/',
          type: '官方文件'
        }
      ],
      summary: '「污染肉品」辯護的經典案例，引發對微量檢測的討論。',
      educationalNotes: 'Clenbuterol是支氣管擴張劑，也用於畜牧業，可能通過食物鏈進入人體。'
    },
    {
      _id: '8',
      athleteName: 'Justin Gatlin',
      nationality: '美國',
      sport: '田徑',
      substance: '睪固酮',
      substanceCategory: '類固醇',
      year: 2006,
      eventBackground: '2004年奧運會100公尺金牌得主，2006年第二次藥檢陽性。',
      punishment: {
        banDuration: '4年',
        resultsCancelled: false,
        medalStripped: false,
        otherPenalties: '原判8年後減為4年'
      },
      sourceLinks: [
        {
          title: 'IAAF Justin Gatlin Case',
          url: 'https://www.worldathletics.org/',
          type: '官方文件'
        }
      ],
      summary: '爭議性的復出案例，禁賽期滿後繼續參賽並獲得佳績。',
      educationalNotes: '睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。'
    }
  ],
  stats: {
    overview: { 
      totalCases: 8, 
      totalSports: 4, 
      totalCountries: 6,
      recentCases: [
        {
          _id: '3',
          athleteName: 'Maria Sharapova',
          sport: '網球',
          year: 2016
        },
        {
          _id: '5',
          athleteName: 'Sun Yang',
          sport: '游泳',
          year: 2014
        },
        {
          _id: '6',
          athleteName: 'Tyson Gay',
          sport: '田徑',
          year: 2013
        }
      ]
    },
    yearlyTrends: [
      { year: 1988, count: 1 },
      { year: 2006, count: 1 },
      { year: 2007, count: 1 },
      { year: 2010, count: 1 },
      { year: 2012, count: 1 },
      { year: 2013, count: 1 },
      { year: 2014, count: 1 },
      { year: 2016, count: 1 }
    ],
    sportDistribution: [
      { sport: '田徑', count: 4 },
      { sport: '自行車', count: 2 },
      { sport: '網球', count: 1 },
      { sport: '游泳', count: 1 }
    ],
    substanceDistribution: [
      { category: '類固醇', count: 4 },
      { category: '興奮劑', count: 2 },
      { category: 'EPO', count: 1 },
      { category: '其他', count: 1 }
    ],
    nationalityDistribution: [
      { nationality: '美國', count: 4 },
      { nationality: '加拿大', count: 1 },
      { nationality: '俄羅斯', count: 1 },
      { nationality: '中國', count: 1 },
      { nationality: '西班牙', count: 1 }
    ],
    punishmentStats: { medalStripped: 5, resultsCancelled: 6 },
    banDurationDistribution: [
      { duration: '1年', count: 1 },
      { duration: '2年', count: 3 },
      { duration: '3個月', count: 1 },
      { duration: '4年', count: 1 },
      { duration: '15個月', count: 1 },
      { duration: '終身禁賽', count: 1 }
    ]
  },
  education: {
    substances: [],
    quizzes: [],
    articles: []
  },
  tue: {
    basic: {},
    diseases: [],
    tools: []
  },
  filterOptions: {
    sports: ['田徑', '自行車', '網球', '游泳'],
    substances: ['Stanozolol', 'EPO', 'Meldonium', 'THG', 'Trimetazidine', '合成代謝類固醇', 'Clenbuterol', '睪固酮'],
    years: [1988, 2006, 2007, 2010, 2012, 2013, 2014, 2016]
  }
};

// 模擬 API 響應
const mockResponse = (data) => Promise.resolve({ data });

// Cases API
export const casesAPI = {
  getAll: (params) => api ? api.get('/cases', { params }) : mockResponse(mockData.cases),
  getById: (id) => api ? api.get(`/cases/${id}`) : mockResponse(mockData.cases.find(c => c.id === id) || null),
  create: (data) => api ? api.post('/cases', data) : mockResponse(data),
  update: (id, data) => api ? api.put(`/cases/${id}`, data) : mockResponse(data),
  delete: (id) => api ? api.delete(`/cases/${id}`) : mockResponse({ success: true }),
  getFilterOptions: () => api ? api.get('/cases/filters/options') : mockResponse(mockData.filterOptions),
};

// Statistics API
export const statsAPI = {
  getYearlyTrends: () => api ? api.get('/stats/yearly-trends') : mockResponse(mockData.stats.yearlyTrends),
  getSportDistribution: () => api ? api.get('/stats/sport-distribution') : mockResponse(mockData.stats.sportDistribution),
  getSubstanceDistribution: () => api ? api.get('/stats/substance-distribution') : mockResponse(mockData.stats.substanceDistribution),
  getNationalityDistribution: () => api ? api.get('/stats/nationality-distribution') : mockResponse(mockData.stats.nationalityDistribution),
  getPunishmentStats: () => api ? api.get('/stats/punishment-stats') : mockResponse(mockData.stats.punishmentStats),
  getBanDurationDistribution: () => api ? api.get('/stats/ban-duration-distribution') : mockResponse(mockData.stats.banDurationDistribution),
  getOverview: () => api ? api.get('/stats/overview') : mockResponse(mockData.stats.overview),
};

// Education API
export const educationAPI = {
  getAll: () => api ? api.get('/education') : mockResponse(mockData.education),
  getSubstances: () => api ? api.get('/education/substances') : mockResponse(mockData.education.substances),
  getQuizzes: () => api ? api.get('/education/quizzes') : mockResponse(mockData.education.quizzes),
  submitQuizAnswer: (id, answer) => api ? api.post(`/education/quizzes/${id}/answer`, { answer }) : mockResponse({ correct: true }),
  getArticles: () => api ? api.get('/education/articles') : mockResponse(mockData.education.articles),
  getArticle: (id) => api ? api.get(`/education/articles/${id}`) : mockResponse(mockData.education.articles.find(a => a.id === id) || null),
};

// TUE API
export const tueAPI = {
  getAll: () => api ? api.get('/tue') : mockResponse(mockData.tue),
  getBasicInfo: () => api ? api.get('/tue/basic') : mockResponse(mockData.tue.basic),
  getApplicationGuide: () => api ? api.get('/tue/application') : mockResponse({}),
  getDiseaseGuides: () => api ? api.get('/tue/diseases') : mockResponse(mockData.tue.diseases),
  getTools: () => api ? api.get('/tue/tools') : mockResponse(mockData.tue.tools),
  checkDrugTUE: (drugName) => api ? api.post('/tue/check', { drugName }) : mockResponse({ needsTUE: false }),
};

export default api;