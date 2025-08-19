import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cases API
export const casesAPI = {
  getAll: (params) => api.get('/cases', { params }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`),
  getFilterOptions: () => api.get('/cases/filters/options'),
};

// Statistics API
export const statsAPI = {
  getYearlyTrends: () => api.get('/stats/yearly-trends'),
  getSportDistribution: () => api.get('/stats/sport-distribution'),
  getSubstanceDistribution: () => api.get('/stats/substance-distribution'),
  getNationalityDistribution: () => api.get('/stats/nationality-distribution'),
  getPunishmentStats: () => api.get('/stats/punishment-stats'),
  getBanDurationDistribution: () => api.get('/stats/ban-duration-distribution'),
  getOverview: () => api.get('/stats/overview'),
};

// Education API
export const educationAPI = {
  getAll: () => api.get('/education'),
  getSubstances: () => api.get('/education/substances'),
  getQuizzes: () => api.get('/education/quizzes'),
  submitQuizAnswer: (id, answer) => api.post(`/education/quizzes/${id}/answer`, { answer }),
  getArticles: () => api.get('/education/articles'),
  getArticle: (id) => api.get(`/education/articles/${id}`),
};

// TUE API
export const tueAPI = {
  getAll: () => api.get('/tue'),
  getBasicInfo: () => api.get('/tue/basic'),
  getApplicationGuide: () => api.get('/tue/application'),
  getDiseaseGuides: () => api.get('/tue/diseases'),
  getTools: () => api.get('/tue/tools'),
  checkDrugTUE: (drugName) => api.post('/tue/check', { drugName }),
};

export default api;