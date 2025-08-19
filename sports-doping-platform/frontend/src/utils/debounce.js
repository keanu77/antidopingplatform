/**
 * 防抖函數 - 避免頻繁觸發
 * @param {Function} func - 要執行的函數
 * @param {number} delay - 延遲時間（毫秒）
 * @returns {Function} 防抖後的函數
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  let lastArgs;
  
  const debounced = function(...args) {
    lastArgs = args;
    clearTimeout(timeoutId);
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(func.apply(this, lastArgs));
      }, delay);
    });
  };
  
  // 提供取消方法
  debounced.cancel = function() {
    clearTimeout(timeoutId);
    timeoutId = null;
  };
  
  // 提供立即執行方法
  debounced.flush = function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      return func.apply(this, lastArgs);
    }
  };
  
  return debounced;
}

/**
 * 節流函數 - 限制執行頻率
 * @param {Function} func - 要執行的函數
 * @param {number} limit - 時間限制（毫秒）
 * @returns {Function} 節流後的函數
 */
export function throttle(func, limit = 1000) {
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, Math.max(limit - (Date.now() - lastRan), 0));
    }
  };
}

export default { debounce, throttle };