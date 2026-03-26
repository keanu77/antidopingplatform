import axios from "axios";

// 根據環境使用不同的 API URL
const API_BASE_URL = import.meta.env.PROD
  ? "/api" // 生產環境使用相對路徑
  : `http://localhost:${import.meta.env.VITE_API_PORT || "8080"}/api`;

const api = API_BASE_URL
  ? axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    })
  : null;

// 延遲載入模擬數據（僅在開發模式下載入）
let mockDataCache = null;
async function getMockData() {
  if (!mockDataCache) {
    const module = await import("./mockData");
    mockDataCache = module.default;
  }
  return mockDataCache;
}

// 模擬 API 響應
const mockResponse = (data) => Promise.resolve({ data });

// Cases API
export const casesAPI = {
  getAll: (params) =>
    api
      ? api.get("/cases", { params })
      : getMockData()
          .then((mockData) => mockResponse(mockData.cases))
          .then((r) => r),
  getById: (id) =>
    api
      ? api.get(`/cases/${id}`)
      : getMockData().then((mockData) => ({
          data: mockData.cases.find((c) => c.id === id || c._id === id) || null,
        })),
  create: (data) => (api ? api.post("/cases", data) : mockResponse(data)),
  update: (id, data) =>
    api ? api.put(`/cases/${id}`, data) : mockResponse(data),
  delete: (id) =>
    api ? api.delete(`/cases/${id}`) : mockResponse({ success: true }),
  getFilterOptions: () =>
    api
      ? api.get("/cases/filters")
      : Promise.resolve({
          data: {
            sports: [
              "田徑",
              "網球",
              "籃球",
              "足球",
              "棒球",
              "花式滑冰",
              "健力",
              "大力士",
              "游泳",
              "MMA/UFC",
              "美式足球",
              "拳擊",
              "高爾夫",
              "MMA",
              "自行車",
              "體操",
              "舉重/大力士",
              "舉重",
              "韻律泳",
              "越野滑雪",
              "冬季兩項",
              "俯式冰橇",
              "多項目",
              "摔跤",
              "競速滑冰",
              "化學家",
              "板球",
              "科學支援",
            ],
            substances: [
              "Trenbolone",
              "Trimetazidine",
              "Clostebol",
              "大麻",
              "Testosterone",
              "Roxadustat",
              "Ostarine（污染）",
              "EPO, HGH",
              "Nandrolone",
              "公開討論使用",
              "錯過檢測",
              "Prednisolone (強體松)",
              "Cardarine（污染）",
              "Testosterone（TUE）",
              "Growth Hormone Releasing Peptide-2",
              "利尿劑",
              "Ipamorelin",
              "Anti-Doping Rule Violations",
              "EPO",
              "大麻、酒精",
              "多種處方藥物",
              "Furosemide",
              "Trimetazidine (疑似)",
              "拒絕檢測",
              "Clenbuterol",
              "Anti-inflammatory (抗炎藥)",
              "公開承認使用",
              "Ligandrol (LGD-4033)",
              "Turinabol (4-chlorodehydromethyltestosterone)",
              "Methylphenidate (甲基苯丙胺)",
              "Meldonium",
              "Turinabol",
              "Testosterone和Clostebol",
              "Clomiphene",
              "GHRP-6",
              "Meldonium (疑似)",
              "Probenecid",
              "L-carnitine注射",
              "公開使用（非藥檢聯盟）",
              "HGH (指控)",
              "Nandrolone (爭議)",
              "系統性使用多種禁藥",
              "Drostanolone",
              "Testosterone等多種",
              "系統性國家禁藥",
              "系統性國家禁藥計劃",
              "睪固酮、HGH",
              "Methandienone",
              "Oxilofrine",
              "Hydrochlorothiazide",
              "EPO, 類固醇",
              "合成代謝類固醇",
              "Triamcinolone (曲安奈德)",
              "Corticosteroid (皮質類固醇)",
              "Stanozolol",
              "EPO、睪固酮、皮質類固醇",
              "自體免疫疾病藥物",
              "DHEA, Pregnenolone",
              "HCG (人類絨毛膜促性腺激素)",
              "Blood Doping (指控)",
              "睪固酮",
              "PED cocktail",
              "THG (Tetrahydrogestrinone)",
              "Oxandrolone",
              "THG, EPO",
              "THG",
              "THG, The Cream",
              "THG, 類固醇",
              "THG (聲稱不知情)",
              "THG設計者",
              "Modafinil",
              "THG, EPO, 類固醇",
              "Diuretic",
              "EPO (疑似)",
              "EPO, 生長激素, 類固醇",
              "Androstenedione (疑似)",
              "Testosterone (歷史案例)",
              "EPO, 血液禁藥",
              "Amphetamines",
              "DHT (雙氫睪固酮)",
              "DHT",
              "EPO研發應用",
              "Oral-Turinabol (疑似)",
              "微量Methenolone",
              "Oral-Turinabol, 睪固酮",
              "Stimulants (微量)",
              "類固醇 (疑似)",
              "Oral-Turinabol",
              "State-sponsored doping",
              "睪固酮 (疑似)",
            ],
            years: [
              1966, 1976, 1980, 1983, 1985, 1986, 1988, 1990, 1994, 1995, 1996,
              1997, 1998, 1999, 2000, 2001, 2003, 2005, 2006, 2007, 2008, 2009,
              2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
              2021, 2022, 2023, 2024,
            ],
            nationalities: [
              "美國",
              "波蘭",
              "義大利",
              "法國",
              "多明尼加",
              "俄羅斯",
              "羅馬尼亞",
              "奈及利亞",
              "冰島",
              "英國",
              "肯亞",
              "中國",
              "墨西哥",
              "哈薩克",
              "挪威",
              "巴西",
              "南韓",
              "伊朗",
              "牙買加",
              "西班牙",
              "亞塞拜然",
              "德國",
              "希臘",
              "波多黎各",
              "澳洲",
              "土耳其",
              "瑞士",
              "愛爾蘭",
              "丹麥",
              "東德",
              "加拿大",
              "捷克斯洛伐克",
              "蘇聯",
            ],
          },
        }),
};

// Statistics API - 添加數據安全檢查
export const statsAPI = {
  getYearlyTrends: () =>
    api
      ? api.get("/stats/yearly-trends")
      : getMockData().then((mockData) => ({
          data: mockData.stats.yearlyTrends || [],
        })),
  getSportDistribution: () => {
    if (api) return api.get("/stats/sport-distribution");

    return getMockData().then((mockData) => {
      const sportCount = {};
      (mockData.cases || []).forEach((c) => {
        const sport = c.sport || "未分類";
        sportCount[sport] = (sportCount[sport] || 0) + 1;
      });
      const distribution = Object.entries(sportCount).map(([name, value]) => ({
        name,
        value,
      }));
      return { data: distribution };
    });
  },
  getSubstanceDistribution: () => {
    if (api) return api.get("/stats/substance-distribution");

    return getMockData().then((mockData) => {
      const substanceCount = {};
      (mockData.cases || []).forEach((c) => {
        const substance = c.substance || "未知物質";
        substanceCount[substance] = (substanceCount[substance] || 0) + 1;
      });
      const distribution = Object.entries(substanceCount).map(
        ([name, value]) => ({ name, value }),
      );
      return { data: distribution };
    });
  },
  getNationalityDistribution: () => {
    if (api) return api.get("/stats/nationality-distribution");

    return getMockData().then((mockData) => {
      const nationalityCount = {};
      (mockData.cases || []).forEach((c) => {
        const nationality = c.nationality || "未知";
        nationalityCount[nationality] =
          (nationalityCount[nationality] || 0) + 1;
      });
      const distribution = Object.entries(nationalityCount).map(
        ([name, value]) => ({ name, value }),
      );
      return { data: distribution };
    });
  },
  getPunishmentStats: () => {
    if (api) return api.get("/stats/punishment-stats");

    return getMockData().then((mockData) => {
      const stats = {
        medalStripped: (mockData.cases || []).filter(
          (c) => c.punishment && c.punishment.medalStripped === true,
        ).length,
        resultsCancelled: (mockData.cases || []).filter(
          (c) => c.punishment && c.punishment.resultsCancelled === true,
        ).length,
      };
      return { data: stats };
    });
  },
  getBanDurationDistribution: () => {
    if (api) return api.get("/stats/ban-duration-distribution");

    return getMockData().then((mockData) => {
      const durationCount = {};
      (mockData.cases || []).forEach((c) => {
        const duration = (c.punishment && c.punishment.banDuration) || "未知";
        durationCount[duration] = (durationCount[duration] || 0) + 1;
      });
      const distribution = Object.entries(durationCount).map(
        ([name, value]) => ({ name, value }),
      );
      return { data: distribution };
    });
  },
  getOverview: () => {
    if (api) return api.get("/stats/overview");

    return getMockData().then((mockData) => {
      const cases = mockData.cases || [];
      const sports = [...new Set(cases.map((c) => c.sport).filter(Boolean))];
      const countries = [
        ...new Set(cases.map((c) => c.nationality).filter(Boolean)),
      ];

      const overview = {
        totalCases: cases.length,
        totalSports: sports.length,
        totalCountries: countries.length,
      };
      return { data: overview };
    });
  },
};

// Education API
export const educationAPI = {
  getAll: () =>
    api
      ? api.get("/education")
      : getMockData().then((mockData) => ({ data: mockData.education })),
  getSubstances: () =>
    api
      ? api.get("/education/substances")
      : getMockData().then((mockData) => ({
          data: mockData.education.substances,
        })),
  getQuizzes: () =>
    api
      ? api.get("/education/quizzes")
      : getMockData().then((mockData) => ({
          data: mockData.education.quizzes,
        })),
  submitQuizAnswer: (id, answer) =>
    api
      ? api.post(`/education/quizzes/${id}/answer`, { answer })
      : mockResponse({ correct: true }),
  getArticles: () =>
    api
      ? api.get("/education/articles")
      : getMockData().then((mockData) => ({
          data: mockData.education.articles,
        })),
  getArticle: (id) =>
    api
      ? api.get(`/education/articles/${id}`)
      : getMockData().then((mockData) => ({
          data: mockData.education.articles.find((a) => a.id === id) || null,
        })),
};

// TUE API
export const tueAPI = {
  getAll: () =>
    api
      ? api.get("/tue")
      : getMockData().then((mockData) => ({ data: mockData.tue })),
  getBasicInfo: () =>
    api
      ? api.get("/tue/basic")
      : getMockData().then((mockData) => ({ data: mockData.tue.basic })),
  getApplicationGuide: () =>
    api ? api.get("/tue/application") : mockResponse({}),
  getDiseaseGuides: () =>
    api
      ? api.get("/tue/diseases")
      : getMockData().then((mockData) => ({ data: mockData.tue.diseases })),
  getTools: () =>
    api
      ? api.get("/tue/tools")
      : getMockData().then((mockData) => ({ data: mockData.tue.tools })),
  checkDrugTUE: (drugName) =>
    api
      ? api.post("/tue/check", { drugName })
      : mockResponse({ needsTUE: false }),
};

export default api;
