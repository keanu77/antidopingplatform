class CacheManager {
  constructor(maxSize = 50, ttl = 5 * 60 * 1000) { // 預設快取50筆，TTL 5分鐘
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  // 生成快取鍵值
  generateKey(params) {
    return JSON.stringify(params);
  }

  // 設定快取
  set(params, data) {
    const key = this.generateKey(params);
    
    // 如果快取已滿，刪除最舊的項目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hitCount: 0
    });
  }

  // 取得快取
  get(params) {
    const key = this.generateKey(params);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // 檢查是否過期
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // 更新命中次數
    cached.hitCount++;
    
    return cached.data;
  }

  // 清除所有快取
  clear() {
    this.cache.clear();
  }

  // 清除過期快取
  clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 取得快取統計資訊
  getStats() {
    let totalHits = 0;
    let items = 0;
    
    for (const value of this.cache.values()) {
      totalHits += value.hitCount;
      items++;
    }
    
    return {
      size: this.cache.size,
      totalHits,
      averageHits: items > 0 ? totalHits / items : 0
    };
  }
}

// 建立快取實例
export const searchCache = new CacheManager(50, 5 * 60 * 1000); // 搜尋結果快取
export const filterCache = new CacheManager(20, 10 * 60 * 1000); // 篩選選項快取

// 定期清理過期快取
setInterval(() => {
  searchCache.clearExpired();
  filterCache.clearExpired();
}, 60 * 1000); // 每分鐘清理一次

export default CacheManager;