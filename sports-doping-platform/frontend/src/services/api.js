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
  cases: [],
  stats: {
    overview: { totalCases: 0, totalSports: 0, totalCountries: 0 },
    yearlyTrends: [],
    sportDistribution: [],
    substanceDistribution: [],
    nationalityDistribution: [],
    punishmentStats: { medalStripped: 0, resultsCancelled: 0 },
    banDurationDistribution: []
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
  getFilterOptions: () => api ? api.get('/cases/filters/options') : mockResponse({ sports: [], substances: [], years: [] }),
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