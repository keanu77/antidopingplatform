import { Users, FileText, ClipboardList, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import SectionCard from "./SectionCard";
import {
  applicantLevels,
  applicationSteps,
  documentationStandard,
  retroactiveGrounds,
  retroactiveFairness,
  retroactiveNote,
  lifecycleItems,
  noTueConsequence,
} from "../../data/tueGuide";

function ApplicationTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={Users} iconBg="bg-purple-100" iconColor="text-purple-600" title="向誰申請？">
        <div className="space-y-3">
          {applicantLevels.map((a) => (
            <div key={a.level} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900">{a.level}</h4>
              <p className="text-gray-700 text-sm mt-1">{a.to}</p>
              <p className="text-gray-500 text-xs mt-1">{a.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={FileText} iconBg="bg-blue-100" iconColor="text-blue-600" title="申請流程">
        <ol className="space-y-4">
          {applicationSteps.map((s, i) => (
            <li key={s.title} className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-sm font-semibold">
                {i + 1}
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">{s.title}</h4>
                <p className="text-gray-700 text-sm">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard
        icon={ClipboardList}
        iconBg="bg-teal-100"
        iconColor="text-teal-600"
        title="給醫師：醫療文件要寫到什麼程度？"
      >
        <p className="text-gray-700 mb-3">
          標準是讓 TUEC 委員在未見到病人的情況下，做出與主治醫師相同的診斷與治療計畫。
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          {documentationStandard.map((d) => (
            <li key={d} className="bg-teal-50 px-3 py-2 rounded">
              {d}
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-500 mt-3">
          文件不完整會被退回補件，不起算 21 天審查期；寫得完整比送得快更省時間。
        </p>
      </SectionCard>

      <SectionCard icon={Clock} iconBg="bg-red-100" iconColor="text-red-600" title="來不及事前申請：追溯 TUE">
        <p className="text-gray-700 mb-3">ISTUE 第 4.1 條列出五種可以事後申請的情形：</p>
        <ul className="space-y-2">
          {retroactiveGrounds.map((g) => (
            <li key={g.code} className="flex items-start text-gray-700">
              <span className="font-mono text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded mr-3 mt-0.5 flex-shrink-0">
                {g.code}
              </span>
              <span>{g.text}</span>
            </li>
          ))}
          <li className="flex items-start text-gray-700">
            <span className="font-mono text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded mr-3 mt-0.5 flex-shrink-0">
              {retroactiveFairness.code}
            </span>
            <span>{retroactiveFairness.text}</span>
          </li>
        </ul>
        <p className="mt-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">
          {retroactiveNote}
        </p>
      </SectionCard>

      <SectionCard icon={RefreshCw} iconBg="bg-sky-100" iconColor="text-sky-600" title="核准之後：效期、變更與跨組織效力">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifecycleItems.map((item) => (
            <div key={item.title} className="border-l-4 border-sky-300 pl-4">
              <h4 className="font-semibold text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-700">{item.body}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-900">{noTueConsequence}</p>
      </div>
    </div>
  );
}

export default ApplicationTab;
