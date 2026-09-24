import { useEffect } from "react";
import { Newspaper, ExternalLink } from "lucide-react";

const newsItems = [
  {
    date: "2026-01-01",
    dateLabel: "2026 年 1 月 1 日生效",
    tag: "WADA 更新",
    tagColor: "bg-emerald-50 text-emerald-700",
    title: "2026 WADA 禁用清單正式生效",
    summary:
      "M1.4 禁止使用再呼吸系統或設備輸送一氧化碳，但由醫療或科學專業人員監督的診斷程序除外；M3.2 明列具有提升運動表現潛力的細胞組成部分，例如粒線體與核糖體。",
    sourceTitle: "WADA 2026 禁用清單（英文 PDF）",
    sourceUrl:
      "https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf",
  },
  {
    date: "2026",
    dateLabel: "2026 年監控計畫",
    tag: "監控追蹤",
    tagColor: "bg-amber-50 text-amber-700",
    title: "Semaglutide 與 Tirzepatide 列於監控計畫",
    summary:
      "2026 年監控計畫列入 Semaglutide 與 Tirzepatide 的標記物，涵蓋賽內及賽外。監控計畫用於了解尚未列入禁用清單的物質是否存在運動濫用模式；列入監控不等於已禁用。",
    sourceTitle: "WADA 2026 監控計畫（英文 PDF）",
    sourceUrl:
      "https://www.wada-ama.org/sites/default/files/2025-09/2026_list_monitoring_program_en_final_clean_september_2025.pdf",
  },
  {
    dateLabel: "WADA 官方宣導資源",
    tag: "教育宣導",
    tagColor: "bg-emerald-50 text-emerald-700",
    title: "WADA #NaturalIsEnough 自然訓練宣導",
    summary:
      "WADA 鼓勵以自然訓練追求健身目標，並認識同化性類固醇的身心風險。官方頁面透過健身創作者的經驗，討論體態壓力、同儕影響與健康訓練。",
    sourceTitle: "WADA：Join the Natural Training Movement",
    sourceUrl: "https://www.wada-ama.org/en/natural-is-enough",
  },
];

function News() {
  useEffect(() => {
    document.title = "最新消息 | 乾淨運動從你我開始";
    return () => {
      document.title = "乾淨運動從你我開始";
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
          <p className="text-gray-500 text-sm">
            以下是附官方來源的反禁藥重點整理，並非即時或完整的新聞清單。
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {newsItems.map((item) => (
          <article
            key={item.sourceUrl}
            className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-3">
              {item.date ? (
                <time
                  dateTime={item.date}
                  className="text-xs text-gray-400 font-mono"
                >
                  {item.dateLabel}
                </time>
              ) : (
                <span className="text-xs text-gray-400 font-mono">
                  {item.dateLabel}
                </span>
              )}
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
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
            >
              {item.sourceTitle}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

export default News;
