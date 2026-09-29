import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  FileSearch,
  FlaskConical,
  ShieldCheck,
  Info,
  ExternalLink,
} from "lucide-react";

// 污染風險較高的產品類別與常見無意違規來源（WADA 2026 禁用清單 S6；Geyer 2004 等污染研究）
const HIGH_RISK_PRODUCTS = [
  "多成分賽前補充劑（pre-workout）",
  "減重、燃脂類產品",
  "標榜提升睪固酮、荷爾蒙或增肌的產品",
  "標榜提升運動表現、強效提神的產品",
];

const COMMON_TRAPS = [
  {
    name: "DMAA（methylhexanamine）",
    body: "興奮劑，屬 S6 賽內禁用；常被標成「天竺葵萃取物」等天然成分，實為合成添加，多見於燃脂與賽前產品。",
  },
  {
    name: "複方感冒藥",
    body: "偽麻黃鹼尿液閾值 150 µg/mL，麻黃鹼與甲基麻黃鹼 10 µg/mL；賽內期改用單方或非禁用藥物前，先查成分。",
  },
  {
    name: "最常檢出的污染物",
    body: "興奮劑、合成代謝類固醇與 SARMs（選擇性雄激素受體調節劑）。",
  },
];

// 教育頁「補充劑安全」分頁
function SupplementsTab() {
  return (
    <div role="tabpanel" className="space-y-6">
      {/* 導言 */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center mb-2">
          <FlaskConical className="h-7 w-7 mr-3" />
          <h2 className="text-2xl font-bold">補充劑安全：天然不等於乾淨</h2>
        </div>
        <p className="text-emerald-50">
          營養補充品是運動員藥檢陽性的常見來源之一。了解污染風險、嚴格責任原則與第三方認證，才能真正保護自己的運動生涯。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 污染數據 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-amber-500 p-4 text-white flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h3 className="text-xl font-bold">研究中的污染檢出比例</h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-gray-700">
              補充品可能含未標示的禁用成分。研究樣本、年份及產品類別不同，不能套用單一比例推估今日市場。
            </p>
            <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border-l-2 border-amber-400">
              Geyer 等人於 2000–2001 年購入 13 國共 634 件非荷爾蒙補充品，94 件（14.8%）檢出未標示的合成代謝雄性類固醇。這是特定歷史樣本，並非目前所有產品的污染率。{" "}
              <a className="underline text-emerald-700" href="https://pubmed.ncbi.nlm.nih.gov/14986195/" target="_blank" rel="noopener noreferrer">2004 年原始研究</a>
            </p>
          </div>
        </div>

        {/* 嚴格責任 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-500 p-4 text-white flex items-center">
            <ShieldAlert className="h-6 w-6 mr-2" />
            <h3 className="text-xl font-bold">嚴格責任原則</h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-gray-700">
              <span className="font-semibold">Strict Liability：</span>
              運動員對自己體內檢出的任何禁用物質負全責，無論是否出於故意或知情。
            </p>
            <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border-l-2 border-red-400">
              成立物質存在違規不需證明故意或過失；但處分仍須依適用規則、污染證據及過失程度個別判斷，可能減輕或免除禁賽。
            </p>
          </div>
        </div>

        {/* 第三方認證 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-600 p-4 text-white flex items-center">
            <ShieldCheck className="h-6 w-6 mr-2" />
            <h3 className="text-xl font-bold">第三方認證計畫</h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-gray-700">
              選擇通過逐批送驗（batch-tested）的產品，可降低（而非消除）污染風險：
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span className="text-sm">
                  <span className="font-semibold">Informed Sport</span>
                  （informed-sport.com）
                </span>
              </li>
              <li className="flex items-start text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span className="text-sm">
                  <span className="font-semibold">
                    NSF Certified for Sport
                  </span>
                  （NSF 國際）
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 核心提醒 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-emerald-600 p-4 text-white flex items-center">
            <Info className="h-6 w-6 mr-2" />
            <h3 className="text-xl font-bold">核心提醒</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-2">
              <li className="flex items-start text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm">
                  「天然」不等於「乾淨」，草本或天然標示無法保證不含禁藥。
                </span>
              </li>
              <li className="flex items-start text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm">
                  第三方認證只能降低風險，無法保證零風險。
                </span>
              </li>
              <li className="flex items-start text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm">
                  用前先查，並優先諮詢運動醫學團隊或隊醫。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 高風險產品與常見雷 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 p-4 text-white flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <h3 className="text-xl font-bold">哪些產品風險最高？</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-700 mb-2">研究中污染比例明顯較高的類別，比單純蛋白粉或肌酸更需要小心：</p>
            <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
              {HIGH_RISK_PRODUCTS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              優先從飲食取得營養（food-first）；真的需要補充時，選逐批檢驗的認證產品並保留批號與購買紀錄。
            </p>
          </div>
          <div className="space-y-3">
            {COMMON_TRAPS.map((t) => (
              <div key={t.name} className="border-l-4 border-red-300 pl-3">
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-sm text-gray-700">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 行動連結 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <h3 className="font-semibold text-emerald-900 mb-3 flex items-center">
          <FileSearch className="h-5 w-5 mr-2 text-emerald-700" />
          用前先查：藥物與成分查詢
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://www.check-antidoping.org.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <div>
              <p className="font-semibold text-gray-900">CTADA 藥物查詢</p>
              <p className="text-xs text-gray-500">
                台灣運動禁藥防制查詢平台
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          </a>
          <a
            href="https://www.globaldro.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <div>
              <p className="font-semibold text-gray-900">Global DRO</p>
              <p className="text-xs text-gray-500">查藥品賽內外狀態；不含台灣購藥、不查補充劑</p>
            </div>
            <ExternalLink className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default SupplementsTab;
