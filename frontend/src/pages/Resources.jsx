import { ExternalLink, Link2, Search, BookOpen, Users, Globe } from "lucide-react";

const resources = [
  {
    category: "藥物查詢",
    icon: Search,
    items: [
      { name: "CTADA 藥物查詢系統", desc: "查詢藥物是否含禁用成分（24 小時服務）", url: "https://www.check-antidoping.org.tw/" },
      { name: "WADA 禁用清單 2026（中英對照）", desc: "官方完整禁用物質與方法清單", url: "https://www.wada-ama.org/en/prohibited-list" },
    ],
  },
  {
    category: "教育學習",
    icon: BookOpen,
    items: [
      { name: "CTADA 線上學習平台", desc: "全中運/全大運選手必修課程", url: "https://elearning.ctada.org.tw/" },
      { name: "WADA ADEL 學習平台", desc: "國際反禁藥教育課程（多語言）", url: "https://adel.wada-ama.org/learn" },
      { name: "CTADA 官方網站", desc: "最新公告、禁用清單、藥檢資訊", url: "https://www.antidoping.org.tw/" },
    ],
  },
  {
    category: "社群資源",
    icon: Users,
    items: [
      { name: "CTADA Facebook", desc: "追蹤最新反禁藥教育資訊", url: "https://www.facebook.com/CTADA.org.tw/" },
      { name: "CTADA Instagram", desc: "反禁藥教育圖文", url: "https://www.instagram.com/ctada.org.tw/" },
      { name: "WADA Play True Day", desc: "每年 4/11 全球反禁藥宣導日", url: "https://www.wada-ama.org/en/play-true-day" },
    ],
  },
  {
    category: "國際組織",
    icon: Globe,
    items: [
      { name: "WADA 世界運動禁藥管制組織", desc: "全球反禁藥規範制定機構", url: "https://www.wada-ama.org/" },
      { name: "ITA 國際檢測機構", desc: "獨立藥檢執行機構", url: "https://ita.sport/" },
    ],
  },
];

function Resources() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-xl">
          <Link2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">實用連結</h1>
          <p className="text-gray-500 text-sm">運動禁藥相關資源一站式彙整</p>
        </div>
      </div>

      <div className="space-y-8">
        {resources.map((group) => {
          const CategoryIcon = group.icon;
          return (
            <section key={group.category}>
              <div className="flex items-center gap-2 mb-3">
                <CategoryIcon className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">{group.category}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-200 group"
                  >
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                      {item.name}
                      <ExternalLink className="h-3.5 w-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default Resources;
