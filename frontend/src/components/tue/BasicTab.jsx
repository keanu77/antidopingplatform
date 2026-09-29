import { Info, CheckCircle, Clock, HelpCircle, AlertTriangle, BarChart3 } from "lucide-react";
import SectionCard from "./SectionCard";
import {
  tueDefinition,
  approvalCriteria,
  criteriaFootnote,
  timingRules,
  reviewTimeline,
  tueEvidence,
} from "../../data/tueGuide";

const TIMELINE_ICON = {
  ok: <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />,
  warn: <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />,
};

function BasicTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={Info} iconBg="bg-blue-100" iconColor="text-blue-600" title="什麼是 TUE？">
        <p className="text-gray-700 leading-relaxed mb-4">{tueDefinition.summary}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-1">它是</h4>
            <p className="text-sm text-green-800">{tueDefinition.is}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-1">它不是</h4>
            <p className="text-sm text-red-800">{tueDefinition.isNot}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={CheckCircle}
        iconBg="bg-green-100"
        iconColor="text-green-600"
        title="四大核准條件（缺一不可）"
      >
        <div className="space-y-4">
          {approvalCriteria.map((c) => (
            <div key={c.code} className="border-l-4 border-green-300 pl-4">
              <h4 className="font-semibold text-gray-900">
                {c.title}（ISTUE {c.code}）
              </h4>
              <p className="text-gray-700">{c.body}</p>
              <p className="text-sm text-gray-500 mt-1">{c.note}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">{criteriaFootnote}</p>
      </SectionCard>

      <SectionCard icon={Clock} iconBg="bg-amber-100" iconColor="text-amber-600" title="什麼時候申請？">
        <div className="space-y-4">
          {timingRules.map((r) => (
            <div key={r.title} className="border-l-4 border-amber-300 pl-4">
              <h4 className="font-semibold text-gray-900">{r.title}</h4>
              <p className="text-gray-700">{r.body}</p>
              {r.note && <p className="text-gray-600 text-sm mt-1">{r.note}</p>}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={HelpCircle} iconBg="bg-indigo-100" iconColor="text-indigo-600" title="審查時程">
        <ul className="space-y-3">
          {reviewTimeline.map((item) => (
            <li key={item.text} className="flex items-start">
              {TIMELINE_ICON[item.tone]}
              <span className="text-gray-700">{item.text}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard icon={BarChart3} iconBg="bg-emerald-100" iconColor="text-emerald-600" title={tueEvidence.title}>
        <ul className="space-y-2 text-gray-700">
          {tueEvidence.points.map((p) => (
            <li key={p} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-500 mt-3">{tueEvidence.caveat}</p>
      </SectionCard>
    </div>
  );
}

export default BasicTab;
