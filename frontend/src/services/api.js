import axios from "axios";

// 根據環境使用不同的 API URL
const API_BASE_URL = import.meta.env.PROD
  ? "/api" // 生產環境使用相對路徑
  : `http://localhost:${import.meta.env.VITE_API_PORT || "8080"}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 高影響規則更新須避開瀏覽器已快取的舊分類與舊物質欄位。
const RULES_PARAMS = { rulesVersion: "2026-10-23" };

// Cases API
export const casesAPI = {
  getAll: (params) => api.get("/cases", { params }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post("/cases", data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`),
  getFilterOptions: () => api.get("/cases/filters"),
};

// Statistics API
export const statsAPI = {
  getYearlyTrends: () => api.get("/stats/yearly-trends"),
  getSportDistribution: () => api.get("/stats/sport-distribution"),
  getSubstanceDistribution: () => api.get("/stats/substance-distribution"),
  getNationalityDistribution: () => api.get("/stats/nationality-distribution"),
  getPunishmentStats: () => api.get("/stats/punishment-stats"),
  getBanDurationDistribution: () => api.get("/stats/ban-duration-distribution"),
  getOverview: () => api.get("/stats/overview"),
  getReviewSummary: () => api.get("/stats/review-summary"),
};

// Education API
export const educationAPI = {
  getAll: () => api.get("/education", { params: RULES_PARAMS }),
  getSubstances: () => api.get("/education/substances", { params: RULES_PARAMS }),
  getQuizzes: () => api.get("/education/quizzes"),
  submitQuizAnswer: (id, answer) =>
    api.post(`/education/quizzes/${id}/answer`, { answer }),
  getArticles: () => api.get("/education/articles"),
  getArticle: (id) => api.get(`/education/articles/${id}`),
  getAdrv: () => api.get("/education/adrv"),
};

// TUE API
export const tueAPI = {
  getSubstances: () => api.get("/tue/substances", { params: RULES_PARAMS }),
  checkDrugTUE: (drugName) => api.post("/tue/check", { drugName }),
};

export default api;
