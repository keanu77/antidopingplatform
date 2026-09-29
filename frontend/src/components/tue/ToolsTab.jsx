import { CheckCircle, ExternalLink } from "lucide-react";
import TaiwanDrugLookupCard from "../TaiwanDrugLookupCard";
import DrugLookup from "./DrugLookup";
import DecisionTool from "./DecisionTool";
import { applicationChecklist } from "../../data/tueGuide";

const RESOURCE_LINKS = [
  {
    href: "https://www.antidoping.org.tw/faq/",
    title: "中華運動禁藥防制基金會 FAQ",
    desc: "台灣 TUE 申請指南與常見問題",
    tone: "blue",
  },
  {
    href: "https://www.wada-ama.org/en/prohibited-list",
    title: "WADA 禁用清單",
    desc: "世界運動禁藥管制組織每年更新的禁用物質與方法清單",
    tone: "red",
  },
];

const TONE = {
  blue: { box: "bg-blue-50 hover:bg-blue-100", icon: "text-blue-600", title: "text-blue-900", desc: "text-blue-700" },
  red: { box: "bg-red-50 hover:bg-red-100", icon: "text-red-600", title: "text-red-900", desc: "text-red-700" },
};

function ToolsTab() {
  return (
    <div className="space-y-6">
      <DrugLookup />
      <TaiwanDrugLookupCard />
      <DecisionTool />

      <section className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <CheckCircle className="h-6 w-6 text-primary-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">TUE 申請檢查清單</h3>
        </div>
        <div className="space-y-3">
          {applicationChecklist.map((item) => (
            <label key={item.title} className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span>
                <span className="block font-medium text-gray-900">{item.title}</span>
                <span className="block text-sm text-gray-600">{item.body}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <ExternalLink className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">重要資源連結</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RESOURCE_LINKS.map((link) => {
            const t = TONE[link.tone];
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-4 rounded-lg transition ${t.box}`}
              >
                <span className="flex items-center">
                  <ExternalLink className={`h-5 w-5 mr-2 ${t.icon}`} />
                  <span className={`font-medium ${t.title}`}>{link.title}</span>
                </span>
                <span className={`block text-sm mt-1 ${t.desc}`}>{link.desc}</span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default ToolsTab;
