import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { tueAPI } from "../../services/api";
import { VERDICT_META } from "../../utils/tueDecision";
import { VERDICT_STYLE, checkResultVerdict } from "./verdictStyle";

// 單筆藥物查詢（打 /api/tue/check，資料單一來源自 substances.json）
function DrugLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);
  const pendingRef = useRef(false);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      pendingRef.current = false;
    },
    [],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const q = query.trim();
    if (!q || pendingRef.current) return;
    const requestId = ++requestIdRef.current;
    pendingRef.current = true;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await tueAPI.checkDrugTUE(q);
      if (requestId !== requestIdRef.current) return;
      setResult(res.data);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError("查詢失敗，請檢查網路連線後再試");
      setResult(null);
    } finally {
      if (requestId === requestIdRef.current) {
        pendingRef.current = false;
        setLoading(false);
      }
    }
  };

  const handleChange = (event) => {
    // 新輸入使上一個查詢失效；只有與目前輸入相符的回覆能顯示。
    requestIdRef.current += 1;
    pendingRef.current = false;
    setQuery(event.target.value);
    setLoading(false);
    setResult(null);
    setError(null);
  };

  const meta = result && !error ? VERDICT_META[checkResultVerdict(result)] : null;
  const style = meta ? VERDICT_STYLE[meta.tone] : null;

  return (
    <section className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-2">
        <Search className="h-6 w-6 text-primary-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-900">藥物 TUE 快速查詢</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        輸入藥物名稱（中英文皆可，如 salbutamol、胰島素、利他能、triamcinolone），查詢 WADA
        分類與是否需要 TUE。
      </p>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="輸入藥物名稱後按查詢"
          aria-label="藥物名稱"
          className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "查詢中…" : "查詢"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {meta && (
        <div className={`mt-4 rounded-lg border p-4 ${style.box}`} role="status">
          <div className={`flex items-center font-bold ${style.text}`}>
            <style.Icon className="h-5 w-5 mr-2 flex-shrink-0" />
            {result.displayName || result.drugName}
            <span className="ml-2">— {meta.label}</span>
          </div>
          <p className="mt-2 text-sm text-gray-700">分類：{result.wadaCategory}</p>
          <p className="mt-1 text-sm text-gray-700">{result.explanation}</p>
          {result.washout && (
            <p className="mt-1 text-sm text-gray-700">清除期參考：{result.washout}</p>
          )}
        </div>
      )}
    </section>
  );
}

export default DrugLookup;
