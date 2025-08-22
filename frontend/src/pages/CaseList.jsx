import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { casesAPI } from '../services/api';
import { searchCache, filterCache } from '../utils/cache';
import { debounce } from '../utils/debounce';

function CaseList() {
  const [cases, setCases] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    sport: '',
    nationality: '',
    year: '',
    substanceCategory: '',
    banDuration: '',
    punishmentType: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    sports: [],
    nationalities: [],
    years: [],
    substanceCategories: [],
    banDurations: [
      '無處罰',
      '3個月內',
      '3-12個月',
      '1-2年',
      '2-4年',
      '4年以上',
      '終身禁賽'
    ],
    punishmentTypes: [
      '禁賽',
      '獎牌剝奪',
      '成績取消',
      '罰款',
      '警告',
      '其他'
    ]
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCases: 0
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // 強制篩選器切換函數
  const toggleFilters = useCallback(() => {
    console.log('Toggle filters called, current state:', showFilters);
    setShowFilters(prev => {
      const newState = !prev;
      console.log('Filters state changed from', prev, 'to', newState);
      return newState;
    });
  }, [showFilters]);

  useEffect(() => {
    const initializeData = async () => {
      await loadFilterOptions();
      // 使用初始的空篩選條件載入資料
      const initialFilters = {
        search: '',
        sport: '',
        nationality: '',
        year: '',
        substanceCategory: '',
        banDuration: '',
        punishmentType: ''
      };
      await loadCases(initialFilters, 1);
    };
    initializeData();
  }, []); // 空依賴，只在組件掛載時執行一次

  const loadFilterOptions = useCallback(async () => {
    try {
      // 檢查快取
      const cacheKey = 'filter-options';
      const cachedOptions = filterCache.get({ key: cacheKey });
      
      if (cachedOptions) {
        setFilterOptions(cachedOptions);
        return;
      }
      
      const response = await casesAPI.getFilterOptions();
      const options = {
        ...response.data,
        banDurations: [
          '無處罰',
          '3個月內',
          '3-12個月',
          '1-2年',
          '2-4年',
          '4年以上',
          '終身禁賽'
        ],
        punishmentTypes: [
          '禁賽',
          '獎牌剝奪',
          '成績取消',
          '罰款',
          '警告',
          '其他'
        ]
      };
      
      setFilterOptions(options);
      filterCache.set({ key: cacheKey }, options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
      // Fallback: 使用預設選項
      const fallbackOptions = {
        sports: ['田徑', '游泳', '自行車', '網球', '籃球', '足球'],
        nationalities: ['美國', '中國', '俄羅斯', '德國', '英國', '日本'],
        years: [2020, 2021, 2022, 2023, 2024],
        substanceCategories: ['類固醇', 'EPO', '興奮劑', '利尿劑'],
        banDurations: [
          '無處罰',
          '3個月內',
          '3-12個月',
          '1-2年',
          '2-4年',
          '4年以上',
          '終身禁賽'
        ],
        punishmentTypes: [
          '禁賽',
          '獎牌剝奪',
          '成績取消',
          '罰款',
          '警告',
          '其他'
        ]
      };
      setFilterOptions(fallbackOptions);
    }
  }, []);

  const loadCases = useCallback(async (searchParams, pageNum) => {
    const actualParams = searchParams || filters;
    const actualPage = pageNum || pagination.currentPage;
    
    console.log('Loading cases with params:', actualParams, 'page:', actualPage);
    setLoading(true);
    try {
      const params = {
        ...actualParams,
        page: actualPage,
        limit: 12
      };
      console.log('Final API params:', params);
      
      // 檢查快取
      const cachedData = searchCache.get(params);
      if (cachedData) {
        setCases(cachedData.cases);
        setPagination({
          currentPage: cachedData.currentPage,
          totalPages: cachedData.totalPages,
          totalCases: cachedData.totalCases
        });
        setLoading(false);
        return;
      }
      
      const response = await casesAPI.getAll(params);
      const data = response.data;
      
      console.log('API response:', data);
      
      setCases(data.cases);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCases: data.totalCases
      });
      
      // 儲存到快取
      searchCache.set(params, data);
      console.log('Cases loaded successfully:', data.cases.length, 'cases');
    } catch (error) {
      console.error('Failed to load cases:', error);
      // 發生錯誤時清空快取並設定預設狀態
      searchCache.clear();
      setCases([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCases: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 使用防抖的搜尋函數
  const debouncedSearch = useMemo(
    () => debounce((searchFilters, page) => {
      loadCases(searchFilters, page);
    }, 300),
    [loadCases]
  );

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // 使用防抖搜尋
    debouncedSearch(newFilters, 1);
  }, [filters, debouncedSearch]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    // 取消防抖並立即搜尋
    debouncedSearch.cancel();
    loadCases(filters, 1);
  }, [filters, loadCases, debouncedSearch]);

  const clearFilters = () => {
    setFilters({
      search: '',
      sport: '',
      nationality: '',
      year: '',
      substanceCategory: '',
      banDuration: '',
      punishmentType: ''
    });
  };

  const substanceCategoryColors = {
    '興奮劑': 'bg-red-100 text-red-700',
    '類固醇': 'bg-purple-100 text-purple-700',
    'EPO': 'bg-blue-100 text-blue-700',
    '利尿劑': 'bg-cyan-100 text-cyan-700',
    '生長激素': 'bg-green-100 text-green-700',
    '血液興奮劑': 'bg-pink-100 text-pink-700',
    '其他': 'bg-gray-100 text-gray-700'
  };


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">相關案例</h1>
        <p className="text-gray-600">搜尋並篩選國際運動禁藥案例</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="智能搜尋：支援拼寫錯誤容錯，搜尋運動員姓名、藥物或運動項目..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Filter button clicked');
              toggleFilters();
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition"
            aria-label="切換篩選選項"
          >
            <Filter className="h-5 w-5" />
            篩選 {showFilters ? '▲' : '▼'}
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
          >
            搜尋
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">運動項目</label>
              <select
                value={filters.sport}
                onChange={(e) => handleFilterChange('sport', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">國籍</label>
              <select
                value={filters.nationality}
                onChange={(e) => handleFilterChange('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.nationalities.map(nationality => (
                  <option key={nationality} value={nationality}>{nationality}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年份</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">藥物類別</label>
              <select
                value={filters.substanceCategory}
                onChange={(e) => handleFilterChange('substanceCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.substanceCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">禁賽期限</label>
              <select
                value={filters.banDuration}
                onChange={(e) => handleFilterChange('banDuration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.banDurations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">處罰類型</label>
              <select
                value={filters.punishmentType}
                onChange={(e) => handleFilterChange('punishmentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {filterOptions.punishmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
            {cases.map(caseItem => (
              <Link
                key={caseItem._id}
                to={`/cases/${caseItem._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{caseItem.athleteName}</h3>
                      <p className="text-gray-600">{caseItem.sport}</p>
                    </div>
                    <div className="bg-danger-100 p-2 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-danger-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {caseItem.nationality}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {caseItem.year}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${substanceCategoryColors[caseItem.substanceCategory] || 'bg-gray-100 text-gray-700'}`}>
                      {caseItem.substanceCategory}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {caseItem.substance}
                    </span>
                  </div>

                  {caseItem.punishment && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        處罰：<span className="font-semibold">{caseItem.punishment.banDuration}</span>
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
                  const newPage = pagination.currentPage - 1;
                  setPagination(prev => ({ ...prev, currentPage: newPage }));
                  loadCases(filters, newPage);
                }}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex gap-1">
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setPagination(prev => ({ ...prev, currentPage: page }));
                          loadCases(filters, page);
                        }}
                        className={`px-3 py-1 rounded-lg ${
                          page === pagination.currentPage
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100'
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
                  const newPage = pagination.currentPage + 1;
                  setPagination(prev => ({ ...prev, currentPage: newPage }));
                  loadCases(filters, newPage);
                }}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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