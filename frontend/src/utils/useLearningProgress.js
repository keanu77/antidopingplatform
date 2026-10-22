import { useEffect, useRef, useState } from 'react';
import { PROGRESS_KEY, parseProgress, readProgress, saveProgress, clearProgress, emptyProgress } from './learningProgress';

function storage() {
  try { return window.localStorage; } catch { return undefined; }
}

function storedSnapshot() {
  try {
    const store = storage();
    if (!store) return null;
    const raw = store.getItem(PROGRESS_KEY);
    if (raw === null) return { progress: emptyProgress(), expiresAt: null };
    const progress = parseProgress(raw);
    if (!progress) {
      let removed = true;
      try { store.removeItem(PROGRESS_KEY); } catch { removed = false; }
      return { progress: emptyProgress(), expiresAt: null, invalid: true, removed };
    }
    return { progress, expiresAt: JSON.parse(raw).expiresAt };
  } catch { return null; }
}

export default function useLearningProgress() {
  const [progress, setProgress] = useState(() => readProgress(storage()));
  const [status, setStatus] = useState('');
  // A failed write must not erase the current tab's usable, temporary progress
  // just because the user switches tabs or returns to the browser.
  const ephemeral = useRef(false);
  useEffect(() => {
    let timer;
    function refresh(force = false) {
      window.clearTimeout(timer);
      const snapshot = storedSnapshot();
      if (!snapshot) return;
      if (!ephemeral.current || force) {
        ephemeral.current = false;
        setProgress(previous => JSON.stringify(previous) === JSON.stringify(snapshot.progress) ? previous : snapshot.progress);
        if (snapshot.invalid) setStatus(snapshot.removed
          ? '已清除過期、版本不符或無效的本機學習紀錄。'
          : '本機紀錄已失效，但瀏覽器拒絕刪除資料；請到瀏覽器網站資料設定清除。');
      }
      if (snapshot.expiresAt !== null) {
        // Browser timeout values are signed 32-bit; a 90-day lifetime needs
        // more than one timer. Re-read storage before every reschedule.
        timer = window.setTimeout(refresh, Math.min(2147483647, Math.max(1, snapshot.expiresAt - Date.now() + 1)));
      }
    }
    function storageChanged(event) {
      if ((event.key === PROGRESS_KEY || event.key === null)
        && (!event.storageArea || event.storageArea === storage())) refresh(true);
    }
    function resume() { refresh(); }
    function visibilityChanged() { if (document.visibilityState === 'visible') refresh(); }
    refresh();
    window.addEventListener('storage', storageChanged);
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('storage', storageChanged);
      window.removeEventListener('focus', resume);
      document.removeEventListener('visibilitychange', visibilityChanged);
    };
  }, [progress]);

  function update(next) {
    const saved = saveProgress(storage(), next);
    ephemeral.current = !saved;
    setProgress(next);
    setStatus(saved ? '已儲存在這個瀏覽器。' : '目前無法儲存進度；仍可繼續學習，離開頁面後可能不保留。');
  }

  function clear() {
    const removed = clearProgress(storage());
    ephemeral.current = !removed;
    setProgress(emptyProgress());
    setStatus(removed ? '已清除本機所有角色進度、作答紀錄與複習日期。' : '畫面紀錄已清除，但瀏覽器拒絕刪除儲存資料；請到瀏覽器網站資料設定清除。');
  }
  return { progress, update, clear, status };
}
