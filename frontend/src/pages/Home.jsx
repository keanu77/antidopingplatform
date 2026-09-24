import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  AlertTriangle,
  Users,
  Trophy,
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

  const learningCards = [
    { to: "/testing-process", title: "第一次藥檢，從容面對", desc: "從通知到完成表單，了解每一步與你的權利。", image: "testing", label: "藥檢流程", icon: ClipboardList },
    { to: "/tue", title: "需要治療，也安心運動", desc: "認識治療用途豁免，準備與醫師討論的資料。", image: "tue", label: "TUE 指南", icon: FileText },
    { to: "/quiz", title: "遇到這個情境，你會怎麼選？", desc: "用情境題與知識測驗，練習做出知情選擇。", image: "quiz", label: "互動測驗", icon: Zap },
  ];

  return (
    <div className="clean-home -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {error && <p role="status" className="bg-red-50 text-red-700 px-6 py-4">{error}</p>}
      <section className="clean-hero">
        <img className="clean-hero-image" src="/images/clean-sport/hero-soft3d-1440.webp"
          srcSet="/images/clean-sport/hero-soft3d-768.webp 768w, /images/clean-sport/hero-soft3d-1440.webp 1440w"
          sizes="100vw" width="1672" height="941" alt="" fetchPriority="high" />
        <div className="clean-hero-shade" />
        <div className="clean-hero-copy">
          <p className="clean-eyebrow">CLEAN SPORT · 知情選擇，安心運動</p>
          <h1>乾淨運動<br /><span>從你我開始</span></h1>
          <p className="clean-hero-intro">認識禁用清單、練習情境判斷，<br className="hidden sm:block" />讓每一次上場，都準備得更充分。</p>
          <div className="clean-hero-actions">
            <Link to="/quiz" className="clean-primary"><Zap size={19} />開始測驗<ArrowRight size={18} /></Link>
            <Link to="/prohibited-list" className="clean-secondary"><Shield size={18} />瀏覽禁用清單</Link>
          </div>
          <p className="clean-hero-note">運動反禁藥互動教學平台</p>
        </div>
      </section>

      <div className="clean-content">
        <div className="clean-numbers" aria-label="平台收錄概況">
          {[
            [stats.totalCases, "教學案例", AlertTriangle],
            [stats.totalSports, "運動項目", Trophy],
            [stats.totalCountries, "來源所列國家／地區", Users],
            ["S0–P1", "禁用分類", Shield],
          ].map(([num, label, Icon]) => <div key={label}>
            <p><Icon size={16} aria-hidden="true" />{label}</p><strong>{num ?? "—"}</strong>
          </div>)}
        </div>

        <section className="clean-learning" aria-labelledby="learning-heading">
          <div className="clean-section-heading">
            <div><p className="clean-kicker">把知識帶上場</p><h2 id="learning-heading">從你的下一步開始</h2></div>
            <span className="clean-illustration-note">插畫為虛構情境示意</span>
          </div>
          <div className="clean-learning-grid">
            {learningCards.map(({ to, title, desc, image, label, icon: Icon }) => <Link to={to} key={to} className="clean-learning-card">
              <div className="clean-learning-image"><img src={`/images/clean-sport/${image}-soft3d-640.webp`}
                srcSet={`/images/clean-sport/${image}-soft3d-400.webp 400w, /images/clean-sport/${image}-soft3d-640.webp 640w`}
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 38vw"
                width="1448" height="1086" loading="lazy" decoding="async" alt="" /></div>
              <div className="clean-learning-copy"><span className="clean-card-label"><Icon size={15} />{label}</span>
                <h3>{title}</h3><p>{desc}</p><span className="clean-card-action">開始了解 <ArrowRight size={16} /></span>
              </div>
            </Link>)}
          </div>
        </section>

        <section className="clean-tools" aria-label="更多查詢資源">
          {navCards.filter(card => ["/prohibited-list", "/cases", "/news"].includes(card.to)).map(({ to, title, desc, icon: Icon }) => <Link to={to} key={to}>
            <Icon size={22} /><div><h3>{title}</h3><p>{desc}</p></div><ArrowRight size={18} />
          </Link>)}
        </section>

        <aside className="clean-fact"><span>你知道嗎？</span><p>{randomFact}</p></aside>
        <section className="clean-responsibility">
          <Shield size={28} aria-hidden="true" /><div><h2>Your Body, Your Responsibility.</h2>
          <p>運動員要對自己所吃下的任何物質及使用的方法負責，誤服誤用不能成為躲避處罰的理由</p></div>
        </section>
        {stats.recentCases?.length > 0 && <section className="pb-10"><h2 className="text-xl font-bold mb-4">最新案例</h2>
          {stats.recentCases.slice(0, 5).map(item => <Link className="block py-3 border-b text-emerald-800" key={item._id} to={`/cases/${item._id}`}>{item.athleteName} · {item.sport} · {item.year}</Link>)}
        </section>}
      </div>
    </div>
  );
}

export default Home;
