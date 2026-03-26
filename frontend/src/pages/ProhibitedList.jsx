import { useState } from "react";
import { Search, ChevronDown, Shield, AlertTriangle } from "lucide-react";
import { prohibitedList, timingLabels } from "../data/prohibitedList";

function ProhibitedList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const filtered = prohibitedList.filter((item) => {
    const matchSearch =
      search === "" ||
      item.name.includes(search) ||
      item.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.keySubstances.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "all" || item.timing === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 rounded-xl">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">2026 禁用清單</h1>
            <p className="text-gray-500 text-sm">WADA International Standard Prohibited List 2026</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜尋物質名稱、代碼..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          aria-label="搜尋禁用物質"
        />
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            filter === "all"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
          }`}
        >
          全部
        </button>
        {Object.entries(timingLabels).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === key
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : `bg-white ${val.color} border border-gray-200 hover:border-emerald-300`
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        顯示 {filtered.length} / {prohibitedList.length} 項
      </p>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const timing = timingLabels[item.timing];
          const isOpen = expanded === item.id;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
                isOpen ? "border-emerald-200 shadow-lg shadow-emerald-50" : "border-gray-100 hover:shadow-md hover:border-gray-200"
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : item.id)}
                className="w-full px-5 md:px-6 py-4 flex items-center justify-between text-left"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg md:text-xl font-black text-emerald-600 shrink-0">{item.code}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.nameEn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`hidden sm:inline-block text-xs px-3 py-1 rounded-full font-medium ${timing.bgColor} ${timing.color}`}>
                    {timing.label}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 md:px-6 pb-5 border-t border-gray-100 pt-4 space-y-4 animate-fadeIn">
                  {/* Mobile timing badge */}
                  <span className={`sm:hidden inline-block text-xs px-3 py-1 rounded-full font-medium ${timing.bgColor} ${timing.color}`}>
                    {timing.label}
                  </span>

                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>

                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-2">重點物質：</p>
                    <div className="flex flex-wrap gap-2">
                      {item.keySubstances.map((s) => (
                        <span key={s} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {item.medicalUse && (
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-xs text-blue-800">
                        <span className="font-bold">常見醫療用途：</span> {item.medicalUse}
                      </p>
                    </div>
                  )}

                  {item.isSpecified !== undefined && (
                    <p className="text-xs">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium ${
                        item.isSpecified
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {item.isSpecified ? (
                          <><AlertTriangle className="w-3 h-3" /> 特定物質</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3" /> 非特定物質（處罰較重）</>
                        )}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">找不到符合條件的項目</p>
          <p className="text-sm mt-1">試試不同的關鍵字或篩選條件</p>
        </div>
      )}
    </div>
  );
}

export default ProhibitedList;
