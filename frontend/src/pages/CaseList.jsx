import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigationType } from "react-router-dom";
import {
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { casesAPI } from "../services/api";
import { hasSubstanceCategoryLabel } from "../utils/substanceCategory";
import { searchCache, filterCache } from "../utils/cache";
import { debounce } from "../utils/debounce";

const EMPTY_FILTERS = {
  search: "",
  sport: "",
  nationality: "",
  year: "",
  substanceCategory: "",
  punishmentType: "",
};

// Decorative palette is stable across filtering and pagination, independent of outcome.
function caseCardTone(id) {
  const hash = Array.from(String(id)).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  return ["sage", "sky", "sand", "lilac"][hash % 4];
}

function CaseList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const queryKey = searchParams.toString();
  const urlFilters = useMemo(() => Object.fromEntries(
    Object.keys(EMPTY_FILTERS).map(key => [key, searchParams.get(key) || ""]),
  ), [searchParams]);
  const rawPage = Number(searchParams.get("page"));
  const urlPage = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const restoreScroll = useRef(navigationType === "POP" ? (() => {
    try { return Number(sessionStorage.getItem(`case-scroll:${queryKey}`)) || 0; }
    catch { return 0; }
  })() : 0);
  const writeQuery = useCallback((values, page = 1, replace = true) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) if (value) next.set(key, value);
    if (page > 1) next.set("page", String(page));
    setSearchParams(next, { replace });
  }, [setSearchParams]);
  const rememberScroll = () => {
    try { sessionStorage.setItem(`case-scroll:${queryKey}`, String(window.scrollY)); }
    catch { /* Storage may be unavailable. URL state still survives navigation. */ }
  };
  const [cases, setCases] = useState([]);
  const [filters, setFilters] = useState(urlFilters);
  const [filterOptions, setFilterOptions] = useState({
    sports: [],
    nationalities: [],
    years: [],
    substanceCategories: [],
    punishmentTypes: ["禁賽", "獎牌剝奪", "成績取消", "罰款", "警告", "其他"],
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCases: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(() => Object.entries(urlFilters).some(([key, value]) => key !== "search" && value));
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const filterRequestIdRef = useRef(0);

  useEffect(() => {
    document.title = "案例搜尋 | 乾淨運動從你我開始";
  }, []);

  // 強制篩選器切換函數
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const loadFilterOptions = useCallback(async () => {
    const requestId = ++filterRequestIdRef.current;
    const isCurrent = () => mountedRef.current && requestId === filterRequestIdRef.current;
    try {
      // 檢查快取
      const cacheKey = "filter-options";
      const cachedOptions = filterCache.get({ key: cacheKey });

      if (cachedOptions) {
        setFilterOptions(cachedOptions);
        return;
      }

      const response = await casesAPI.getFilterOptions();
      if (!isCurrent()) return;
      const options = {
        ...response.data,
        punishmentTypes: [
          "禁賽",
          "獎牌剝奪",
          "成績取消",
          "罰款",
          "警告",
          "其他",
        ],
      };

      setFilterOptions(options);
      filterCache.set({ key: cacheKey }, options);
    } catch (error) {
      if (!isCurrent()) return;
      console.error("Failed to load filter options:", error);
      // Fallback: 使用預設選項
      const fallbackOptions = {
        sports: ["田徑", "游泳", "自行車", "網球", "籃球", "足球"],
        nationalities: ["美國", "中國", "俄羅斯", "德國", "英國", "日本"],
        years: [2020, 2021, 2022, 2023, 2024],
        substanceCategories: ["類固醇", "EPO", "興奮劑", "利尿劑"],
        punishmentTypes: [
          "禁賽",
          "獎牌剝奪",
          "成績取消",
          "罰款",
          "警告",
          "其他",
        ],
      };
      setFilterOptions(fallbackOptions);
    }
  }, []);

  const loadCases = useCallback(async (searchParams = EMPTY_FILTERS, pageNum = 1) => {
    if (!mountedRef.current) return;
    const requestId = ++requestIdRef.current;
    const isCurrent = () => mountedRef.current && requestId === requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...searchParams,
        page: pageNum,
        limit: 12,
      };

      // 檢查快取
      const cachedData = searchCache.get(params);
      if (cachedData) {
        setCases(cachedData.cases);
        setPagination({
          currentPage: cachedData.currentPage,
          totalPages: cachedData.totalPages,
          totalCases: cachedData.totalCases,
        });
        setLoading(false);
        return;
      }

      const response = await casesAPI.getAll(params);
      if (!isCurrent()) return;
      const data = response.data;

      setCases(data.cases);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCases: data.totalCases,
      });

      // 儲存到快取
      searchCache.set(params, data);
    } catch (error) {
      if (!isCurrent()) return;
      console.error("Failed to load cases:", error);
      setError("載入案例資料失敗，請稍後再試。");
      // 發生錯誤時清空快取並設定預設狀態
      searchCache.clear();
      setCases([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCases: 0,
      });
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, []);

  // 使用防抖的搜尋函數
  const debouncedSearch = useMemo(
    () =>
      debounce((searchFilters, page) => {
        loadCases(searchFilters, page);
      }, 300),
    [loadCases],
  );

  useEffect(() => {
    mountedRef.current = true;
    // 兩項請求各自啟動，避免篩選選項較慢時覆蓋使用者的新搜尋。
    void loadFilterOptions();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      filterRequestIdRef.current += 1;
      debouncedSearch.cancel();
    };
  }, [loadFilterOptions, loadCases, debouncedSearch]);

  useEffect(() => {
    requestIdRef.current += 1;
    setFilters(urlFilters);
    setLoading(true);
    debouncedSearch(urlFilters, urlPage);
    return () => debouncedSearch.cancel();
  }, [urlFilters, urlPage, debouncedSearch]);

  useEffect(() => {
    if (!loading && cases.length && restoreScroll.current) {
      const y = restoreScroll.current;
      restoreScroll.current = 0;
      const frame = requestAnimationFrame(() => window.scrollTo(0, y));
      return () => cancelAnimationFrame(frame);
    }
  }, [cases, loading]);

  const goToPage = (page) => {
    debouncedSearch.cancel();
    writeQuery(filters, page, false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilters = { ...filters, [key]: value };
      requestIdRef.current += 1;
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));

      // 使用防抖搜尋
      writeQuery(newFilters, 1);
    },
    [filters, writeQuery],
  );

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // 取消防抖並立即搜尋
      debouncedSearch.cancel();
      writeQuery(filters, 1);
      loadCases(filters, 1);
    },
    [filters, loadCases, debouncedSearch, writeQuery],
  );

  const clearFilters = () => {
    debouncedSearch.cancel();
    setFilters(EMPTY_FILTERS);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    writeQuery(EMPTY_FILTERS, 1);
    void loadCases(EMPTY_FILTERS, 1);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">相關案例</h1>
        <p className="text-gray-600">搜尋並篩選國際運動禁藥案例</p>
        <p className="mt-3 text-sm text-gray-600">收錄違規、污染、合法 TUE 與處分撤銷等教學案例。查核層級與來源限制詳見個案頁。年份依事件年或官方裁決公布年，詳見個案。</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex flex-wrap gap-2">
          <div className="w-full sm:w-auto sm:flex-1 min-w-0 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="姓名、藥物或運動項目"
              aria-describedby="case-search-help"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              aria-label="搜尋案例"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFilters();
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition"
            aria-label="切換篩選選項"
            aria-expanded={showFilters}
            aria-controls="case-filters"
          >
            <Filter className="h-5 w-5" />
            篩選 {showFilters ? "▲" : "▼"}
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
          >
            搜尋
          </button>
        </div>
        <p id="case-search-help" className="mt-2 text-xs text-gray-500">支援選手、教練姓名及拼寫容錯；搜尋條件可隨網址分享。</p>
      </form>

      {/* Filters */}
      {showFilters && (
        <div id="case-filters" className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label
                htmlFor="filter-sport"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                運動項目
              </label>
              <select
                id="filter-sport"
                value={filters.sport}
                onChange={(e) => handleFilterChange("sport", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.sports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-nationality"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                來源所列國家／地區
              </label>
              <select
                id="filter-nationality"
                value={filters.nationality}
                onChange={(e) =>
                  handleFilterChange("nationality", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.nationalities.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                年份
              </label>
              <select
                id="filter-year"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-substance"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                藥物類別
              </label>
              <select
                id="filter-substance"
                value={filters.substanceCategory}
                onChange={(e) =>
                  handleFilterChange("substanceCategory", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.substanceCategories.map((category) => (
                  <option key={category} value={category}>
                    {hasSubstanceCategoryLabel(category) ? category : "未分類"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-punishment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                處罰類型
              </label>
              <select
                id="filter-punishment"
                value={filters.punishmentType}
                onChange={(e) =>
                  handleFilterChange("punishmentType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.punishmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            清除所有篩選
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">找到 {pagination.totalCases} 個案例</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <Link
                key={caseItem._id}
                to={`/cases/${caseItem._id}`}
                onClick={rememberScroll}
                className={`case-result-card case-result-card--${caseCardTone(caseItem._id)}`}
              >
                <div className="case-result-inner">
                  <div className="case-result-heading">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {caseItem.athleteName}
                      </h3>
                      <p className="text-gray-600">{caseItem.sport}</p>
                    </div>
                  </div>

                  <div className="case-result-meta space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {caseItem.nationality}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {caseItem.year}
                    </div>
                  </div>

                  <p className="case-result-substance text-sm leading-relaxed text-gray-600 break-words">
                    {caseItem.substance}
                  </p>

                  {caseItem.punishment && (
                    <div className="case-result-outcome">
                      <p className="text-sm text-gray-600">
                        處理結果：
                        <span className="font-semibold">
                          {caseItem.punishment.banDuration}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => {
                  debouncedSearch.cancel();
                  const newPage = pagination.currentPage - 1;
                  goToPage(newPage);
                }}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="上一頁"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-1">
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 1 &&
                      page <= pagination.currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          debouncedSearch.cancel();
                          goToPage(page);
                        }}
                        className={`px-3 py-1 rounded-lg ${
                          page === pagination.currentPage
                            ? "bg-primary-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.currentPage - 2 ||
                    page === pagination.currentPage + 2
                  ) {
                    return <span key={page}>...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => {
                  debouncedSearch.cancel();
                  const newPage = pagination.currentPage + 1;
                  goToPage(newPage);
                }}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="下一頁"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CaseList;
