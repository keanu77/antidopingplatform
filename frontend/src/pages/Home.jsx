import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BarChart3,
  GraduationCap,
  AlertTriangle,
  Users,
  Trophy,
  Calendar,
  Shield,
  Zap,
  ClipboardList,
  FileText,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import { statsAPI } from "../services/api";

const facts = [
  "115 年全中運、全大運及全民運動會取消將線上測驗通過證明列為報名條件；選手仍應學習反禁藥知識，其他賽會依各自公告",
  "部分感冒藥含 pseudoephedrine（偽麻黃鹼），屬 S6 興奮劑；賽內尿液濃度超過 150µg/mL 時禁用，用藥前應核對規範",
  "PRP 注射本身不在禁用清單；侵入式靜脈雷射 ILIB 可能涉及 M1.3 以物理方式操縱血管內血液，須就具體療程確認",
  "2026 年 semaglutide（Ozempic）與 tirzepatide 的標記物列入 WADA 賽內、賽外監控計畫，兩者尚未列入禁用清單",
  "2026 年 WADA 新增一氧化碳（CO）非診斷用途為禁用方法",
  "BPC-157 屬於 S0 未經核可之物質，賽內、賽外皆禁用；醫療宣傳不代表已有人體治療核准或 TUE 核准",
  "嚴格責任原則：成立檢體中存在禁用物質的違規，不需證明故意或過失；禁賽等處分仍依過失程度及適用規則個別評估",
  "吸入式 Salbutamol 的劑量例外為 24 小時內不超過 1600 微克，且任何 8 小時內不超過 600 微克；超出例外需 TUE",
];

const navCards = [
  {
    to: "/prohibited-list",
    title: "禁用清單",
    desc: "2026 WADA 禁用物質與方法分類瀏覽",
    icon: Shield,
    gradient: "from-red-500 to-rose-600",
  },
  {
    to: "/quiz",
    title: "互動測驗",
    desc: "「這個算不算禁藥？」情境題 + 知識測驗",
    icon: Zap,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    to: "/testing-process",
    title: "藥檢流程",
    desc: "四步驟圖解：通知→報到→採樣→表單",
    icon: ClipboardList,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    to: "/tue",
    title: "TUE 指南",
    desc: "治療用途豁免申請決策樹",
    icon: FileText,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    to: "/cases",
    title: "案例搜尋",
    desc: "國際運動禁藥案例，支援多條件篩選",
    icon: Search,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    to: "/news",
    title: "最新消息",
    desc: "禁藥監控、國際案例與反禁藥規範更新",
    icon: Newspaper,
    gradient: "from-gray-600 to-gray-800",
  },
];

function Home() {
  const [stats, setStats] = useState({
    totalCases: null,
    totalSports: null,
    totalCountries: null,
    recentCases: [],
  });
  const [error, setError] = useState(null);

  const randomFact = useMemo(
    () => facts[Math.floor(Math.random() * facts.length)],
    [],
  );

  useEffect(() => {
    document.title = "乾淨運動從你我開始 | 運動禁藥案例資料庫";
    loadStats();
  }, []);

  const loadStats = async () => {
    setError(null);
    try {
      const response = await statsAPI.getOverview();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("案例統計暫時無法載入，請重新整理後再試。其他學習功能仍可使用。");
    }
  };

  return (
    <div className="-mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Error Banner */}
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            乾淨運動
            <br className="md:hidden" />
            <span className="md:ml-3">從你我開始</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            運動禁藥互動教學平台 — 禁用清單查詢、情境測驗、藥檢流程、TUE 指南
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-lg shadow-emerald-900/20 text-lg"
            >
              <Zap className="h-5 w-5" />
              開始測驗
            </Link>
            <Link
              to="/prohibited-list"
              className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-bold px-8 py-3.5 rounded-xl border border-white/25 hover:bg-white/25 transition-all duration-200 text-lg backdrop-blur-sm"
            >
              <Shield className="h-5 w-5" />
              瀏覽禁用清單
            </Link>
          </div>
        </div>
      </section>

      {/* Did you know */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-amber-400">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            你知道嗎？
          </p>
          <p className="text-gray-700">{randomFact}</p>
        </div>
      </div>

      {/* Key numbers */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              num: stats.totalCases ?? "—",
              label: "教學案例",
              icon: AlertTriangle,
              color: "text-red-600 bg-red-50",
            },
            {
              num: stats.totalSports ?? "—",
              label: "運動項目",
              icon: Trophy,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              num: stats.totalCountries ?? "—",
              label: "來源所列國家／地區",
              icon: Users,
              color: "text-blue-600 bg-blue-50",
            },
            {
              num: "S0-P1",
              label: "完整禁用分類",
              icon: Shield,
              color: "text-amber-600 bg-amber-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-2 rounded-xl mb-3 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl md:text-3xl font-black text-gray-900">
                {item.num}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-5">探索學習模組</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300"
            >
              <div className="p-6">
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient} mb-4 shadow-sm`}
                >
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                  {card.title}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Strict liability */}
      <section className="bg-gray-900 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Your Body,
            <br />
            Your Responsibility!
          </p>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            運動員要對自己所吃下的任何物質及使用的方法負責，誤服誤用不能成為躲避處罰的理由
          </p>
        </div>
      </section>

      {/* Recent Cases */}
      {stats.recentCases && stats.recentCases.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">最新案例</h2>
            <div className="space-y-2">
              {stats.recentCases.slice(0, 5).map((case_item) => (
                <Link
                  key={case_item._id}
                  to={`/cases/${case_item._id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {case_item.athleteName}
                      </p>
                      <p className="text-sm text-gray-500">{case_item.sport}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {case_item.year}
                  </div>
                </Link>
              ))}
            </div>
            <Link
              to="/cases"
              className="flex items-center justify-center gap-1 mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              查看所有案例
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
