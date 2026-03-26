import { useEffect } from "react";
import { Newspaper, ExternalLink } from "lucide-react";

const newsItems = [
  {
    date: "2026-01",
    tag: "WADA 更新",
    tagColor: "bg-emerald-50 text-emerald-700",
    title: "2026 WADA 禁用清單正式生效",
    summary:
      "新增一氧化碳（CO）為 M1 禁用方法、Tirzepatide 加入監控計畫、S0 明確列出 BPC-157、細胞移植納入 M3。",
  },
  {
    date: "2026-05",
    tag: "爭議話題",
    tagColor: "bg-red-50 text-red-700",
    title: "Enhanced Games 在拉斯維加斯舉辦",
    summary:
      "明確允許使用禁藥的運動會，獎金高達 100 萬美元。USADA 負責人 Travis Tygart 稱其為「危險的小丑秀」。引發運動倫理大辯論。",
  },
  {
    date: "2025-2026",
    tag: "國際爭議",
    tagColor: "bg-amber-50 text-amber-700",
    title: "中國泳隊 23 人陽性事件持續發酵",
    summary:
      "2021 東京奧運前 23 名中國游泳選手檢出 Trimetazidine 陽性，WADA 接受「飯店廚房汙染」解釋。美國參議院舉行聽證會，扣留 730 萬美元 WADA 會費。",
  },
  {
    date: "2024-2026",
    tag: "監控追蹤",
    tagColor: "bg-amber-50 text-amber-700",
    title: "Ozempic / Wegovy 可能在 2028 前被禁",
    summary:
      "Semaglutide 自 2024 列入監控，2026 新增 Tirzepatide。WADA 表示如收集到足夠濫用證據，可能在 LA 2028 奧運前禁用。量級運動受影響最大。",
  },
  {
    date: "2025",
    tag: "台灣案例",
    tagColor: "bg-blue-50 text-blue-700",
    title: "台灣近期違規案例",
    summary:
      "舉重選手廖怡慈因 Metandienone 禁賽至 2028；柔道選手張靜瑩因 Furosemide 禁賽至 2027；射擊選手因 Propranolol 禁賽至 2026。健美、輪椅籃球也有違規。",
  },
  {
    date: "2026-03",
    tag: "爭議話題",
    tagColor: "bg-red-50 text-red-700",
    title: "美國大學選手 BPC-157 疑雲",
    summary:
      "大學跑者 Seth Clevenger 轉學後打破 D3 5000m 紀錄超過 12 秒，前隊友指控其使用 BPC-157（S0 禁用物質）。超過 500 名 D3 選手連署要求調查。",
  },
  {
    date: "2023-2025",
    tag: "社群運動",
    tagColor: "bg-emerald-50 text-emerald-700",
    title: "WADA #NaturalIsEnough 運動",
    summary:
      "針對 20-24 歲健身房族群的社群運動，揭示社群媒體上的「完美體態」標準很多靠禁藥堆出來。提醒年輕人：真正的強大不需要靠藥物。",
  },
  {
    date: "2025",
    tag: "台灣里程碑",
    tagColor: "bg-emerald-50 text-emerald-700",
    title: "台灣首件研究案獲 WADA 補助",
    summary:
      "台灣運動禁藥防制研究首次獲得 WADA 補助，代表台灣在國際反禁藥研究領域的重要進展。",
  },
];

function News() {
  useEffect(() => {
    document.title = "最新消息 | 運動禁藥案例資料庫";
    return () => {
      document.title = "運動禁藥案例資料庫";
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-amber-100 rounded-xl">
          <Newspaper className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            最新消息
          </h1>
          <p className="text-gray-500 text-sm">運動禁藥領域的重要動態與討論</p>
        </div>
      </div>

      <div className="space-y-4">
        {newsItems.map((item, i) => (
          <article
            key={i}
            className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-3">
              <time
                dateTime={item.date}
                className="text-xs text-gray-400 font-mono"
              >
                {item.date}
              </time>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${item.tagColor}`}
              >
                {item.tag}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.summary}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default News;
