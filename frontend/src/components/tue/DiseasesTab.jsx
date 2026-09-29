import { Stethoscope } from "lucide-react";
import { tueDiseases } from "../../data/tueDiseases";

function DiseaseCard({ disease }) {
  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col">
      <div className="bg-blue-600 p-4">
        <div className="flex items-center text-white">
          <Stethoscope className="h-5 w-5 mr-2 flex-shrink-0" />
          <h3 className="text-base font-bold">{disease.title}</h3>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">會卡到的禁用物質</h4>
        <div className="flex flex-wrap gap-1 mb-3">
          {disease.prohibited.map((s) => (
            <span key={s} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {s}
            </span>
          ))}
        </div>

        {disease.keyPoints?.length > 0 && (
          <>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm">臨床重點</h4>
            <ul className="text-sm text-gray-700 space-y-1 mb-3 list-disc pl-5">
              {disease.keyPoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </>
        )}

        {disease.alternatives && (
          <p className="text-xs text-green-800 bg-green-50 rounded p-2 mb-3">
            <span className="font-semibold">非禁用替代：</span>
            {disease.alternatives}
          </p>
        )}

        <div className="mt-auto space-y-2">
          <a
            href={disease.checklistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
          >
            下載 CTADA 檢查表
          </a>
          <a
            href={disease.guidelineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
          >
            閱讀 WADA 醫師指引（{disease.guideline}）
          </a>
        </div>
      </div>
    </article>
  );
}

function DiseasesTab() {
  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">常見疾病的 TUE 重點</h3>
        <p className="text-blue-800 text-sm">
          多數慢性病真正卡關的不是主力藥，而是賽內使用的全身性糖皮質激素或特定藥物。以下整理各病症會遇到的禁用物質、臨床重點與非禁用替代；申請檢查表連結自中華運動禁藥防制基金會，醫師指引連結自
          WADA。
        </p>
        <p className="text-blue-700 text-xs mt-2">
          本頁僅供衛教參考，無法取代醫師診察與個別用藥評估；用藥請依最新年度禁用清單與主治醫師判斷。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tueDiseases.map((d) => (
          <DiseaseCard key={d.id} disease={d} />
        ))}
      </div>
    </div>
  );
}

export default DiseasesTab;
