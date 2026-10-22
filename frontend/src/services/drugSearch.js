// Searches run locally in a dedicated worker. Typed keywords are not sent to TADA.
export function createDrugSearchClient(catalog = "drugs") {
  if (!["drugs", "herbal", "supplements"].includes(catalog)) throw new Error("不支援的查詢分類。");
  const worker = new Worker(new URL("../workers/drugSearch.worker.js", import.meta.url), { type: "module" });
  const pending = new Map();
  let sequence = 0;
  let stopped = false;
  const rejectAll = (message) => {
    for (const { reject } of pending.values()) reject(new Error(message));
    pending.clear();
  };
  worker.onmessage = ({ data }) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error));
    else request.resolve(data.result);
  };
  worker.onerror = () => { stopped = true; rejectAll("查詢程式無法載入，請重新載入頁面。"); };
  worker.onmessageerror = worker.onerror;
  return {
    request(type, payload) {
      return new Promise((resolve, reject) => {
        if (stopped) { reject(new Error("查詢程式已停止，請重新載入頁面。")); return; }
        const id = ++sequence;
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, type, payload, catalog });
      });
    },
    close() { stopped = true; worker.terminate(); rejectAll("查詢已取消。"); },
  };
}
