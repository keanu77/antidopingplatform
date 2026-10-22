import { useEffect, useState } from 'react';
import { PROGRESS_KEY, readProgress, saveProgress, clearProgress, emptyProgress } from './learningProgress';

function storage() {
  try { return window.localStorage; } catch { return undefined; }
}

export default function useLearningProgress() {
  const [progress, setProgress] = useState(() => readProgress(storage()));
  const [status, setStatus] = useState('');
  useEffect(() => {
    function refresh(event) {
      if (event.key === PROGRESS_KEY || event.key === null) setProgress(readProgress(storage()));
    }
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  function update(next) {
    setProgress(next);
    setStatus(saveProgress(storage(), next) ? '已儲存在這個瀏覽器。' : '目前無法儲存進度；仍可繼續學習，離開頁面後可能不保留。');
  }

  function clear() {
    const removed = clearProgress(storage());
    setProgress(emptyProgress());
    setStatus(removed ? '已清除本機所有角色進度、作答紀錄與複習日期。' : '畫面紀錄已清除，但瀏覽器拒絕刪除儲存資料；請到瀏覽器網站資料設定清除。');
  }
  return { progress, update, clear, status };
}
