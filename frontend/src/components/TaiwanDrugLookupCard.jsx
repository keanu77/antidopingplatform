import { ExternalLink, Landmark } from "lucide-react";
import { TAIWAN_DRUG_LOOKUPS } from "../data/taiwanDrugLookups";

function TaiwanDrugLookupCard() {
  return (
    <section
      aria-labelledby="tw-drug-lookup-title"
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center mb-2">
        <Landmark className="h-6 w-6 text-primary-600 mr-3" aria-hidden="true" />
        <h3 id="tw-drug-lookup-title" className="text-xl font-bold text-gray-900">
          台灣官方運動禁藥查詢系統
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        要確認國內市售的西藥、中藥或營養品是否含禁用成分，請使用運動部體育署與台灣運動禁藥管制學會的官方系統（將另開新分頁）。本站的快速查詢僅涵蓋常見藥物的
        WADA 分類，不能取代官方查詢。
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TAIWAN_DRUG_LOOKUPS.map((item) => (
          <li key={item.category}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-4 h-full rounded-lg border border-primary-100 bg-primary-50 hover:bg-primary-100 transition"
            >
              <ExternalLink className="h-5 w-5 text-primary-700 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                <span className="block font-medium text-primary-900">
                  {item.label}
                  <span className="sr-only">（另開新分頁）</span>
                </span>
                <span className="block text-sm text-primary-700 mt-0.5">{item.hint}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-gray-500">
        官方系統說明：查無資料不代表產品不含禁藥。產品成分或用藥有疑慮時，請洽詢隊醫、藥師或運動禁藥管制單位。
      </p>
    </section>
  );
}

export default TaiwanDrugLookupCard;
