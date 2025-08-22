import { useState, useEffect } from 'react';
import { searchCache, filterCache } from '../utils/cache';

function PerformanceMonitor() {
  const [stats, setStats] = useState({
    searchCache: { size: 0, totalHits: 0 },
    filterCache: { size: 0, totalHits: 0 },
    memoryUsage: { used: 0, total: 0 },
    networkStats: { requests: 0, errors: 0 }
  });
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats({
        searchCache: searchCache.getStats(),
        filterCache: filterCache.getStats(),
        memoryUsage: {
          used: performance.memory?.usedJSHeapSize || 0,
          total: performance.memory?.totalJSHeapSize || 0
        },
        networkStats: {
          requests: window.performanceStats?.requests || 0,
          errors: window.performanceStats?.errors || 0
        }
      });
    };

    if (isVisible) {
      updateStats();
      const interval = setInterval(updateStats, 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // 只在開發模式顯示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-full text-sm hover:bg-blue-700 transition"
        >
          📊
        </button>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-4 min-w-64 text-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">效能監控</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="font-medium text-gray-700">搜尋快取</div>
              <div className="text-xs text-gray-600">
                大小: {stats.searchCache.size} | 命中: {stats.searchCache.totalHits}
              </div>
            </div>
            
            <div>
              <div className="font-medium text-gray-700">篩選快取</div>
              <div className="text-xs text-gray-600">
                大小: {stats.filterCache.size} | 命中: {stats.filterCache.totalHits}
              </div>
            </div>
            
            {performance.memory && (
              <div>
                <div className="font-medium text-gray-700">記憶體使用</div>
                <div className="text-xs text-gray-600">
                  {(stats.memoryUsage.used / 1024 / 1024).toFixed(1)}MB / 
                  {(stats.memoryUsage.total / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            )}
            
            <div>
              <div className="font-medium text-gray-700">網路請求</div>
              <div className="text-xs text-gray-600">
                成功: {stats.networkStats.requests} | 錯誤: {stats.networkStats.errors}
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                searchCache.clear();
                filterCache.clear();
                window.performanceStats = { requests: 0, errors: 0 };
              }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              清除快取
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceMonitor;