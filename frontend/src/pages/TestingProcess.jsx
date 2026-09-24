import { useState } from "react";
import { ChevronLeft, ChevronRight, Bell, UserCheck, Beaker, FileCheck, AlertTriangle } from "lucide-react";

const steps = [
  {
    num: 1,
    title: "通知",
    icon: Bell,
    color: "bg-emerald-600",
    lightColor: "bg-emerald-100 text-emerald-700",
    details: [
      "藥檢人員（DCO）通知你被選為受檢對象",
      "受通知後，在 DCO 陪同下盡快到藥檢站報到",
      "未成年運動員應獲告知可由代表（如教練、家長）陪同",
    ],
    tips: "合理延遲須先經 DCO 許可，例如完成訓練、參加頒獎或接受治療；期間仍須接受持續監督。",
  },
  {
    num: 2,
    title: "報到",
    icon: UserCheck,
    color: "bg-blue-600",
    lightColor: "bg-blue-100 text-blue-700",
    details: [
      "到達藥檢站後，確認你的身份",
      "了解藥檢程序與你的權利",
      "準備好你的證件",
    ],
    tips: "你有權要求看 DCO 的證件，確認其身份。",
  },
  {
    num: 3,
    title: "採樣",
    icon: Beaker,
    color: "bg-amber-600",
    lightColor: "bg-amber-100 text-amber-700",
    details: [
      "直接目視尿液採集的 DCO／陪同官須與運動員同性別",
      "選擇採樣杯和密封瓶",
      "在監督下提供尿液樣本（至少 90mL）",
      "將尿液分裝到 A 瓶和 B 瓶",
    ],
    tips: "未成年人採樣須有額外保護安排；代表可觀察執行採樣的人員，通常不直接觀看排尿，並依適用規範及運動員意願安排。",
  },
  {
    num: 4,
    title: "完成表單",
    icon: FileCheck,
    color: "bg-gray-800",
    lightColor: "bg-gray-100 text-gray-700",
    details: [
      "核對 A、B 瓶、外盒與表單上的檢體編號是否一致",
      "填寫 7 日內使用的藥品或營養品資訊",
      "簽署藥檢紀錄表",
      "檢體與不含姓名等身分資訊的實驗室表單副本送至 WADA 認證實驗室",
    ],
    tips: "保留你的副本！如有異議，請在表單上註明。",
  },
];

function TestingProcess() {
  const [active, setActive] = useState(0);
  const StepIcon = steps[active].icon;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">藥檢流程</h1>
        <p className="text-gray-500">尿液藥檢四步驟 — 了解你的權利與義務</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center mb-8 w-full">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center min-w-0">
            <button
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 ${
                i === active
                  ? `${step.color} text-white scale-110 shadow-xl`
                  : i < active
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-100 text-gray-400"
              }`}
              aria-label={`步驟 ${step.num}: ${step.title}`}
              aria-current={i === active ? "step" : undefined}
            >
              {step.num}
              <span className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap ${
                i === active ? "text-gray-900" : "text-gray-500"
              }`}>
                {step.title}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-4 sm:w-12 md:w-20 h-1 mx-1 shrink rounded-full transition-colors duration-300 ${
                i < active ? "bg-emerald-300" : "bg-gray-200"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mt-12">
        <div className="flex items-center gap-3 mb-5">
          <span className={`w-11 h-11 rounded-xl ${steps[active].color} text-white flex items-center justify-center`}>
            <StepIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-gray-500 font-medium">步驟 {steps[active].num}</p>
            <h2 className="text-2xl font-bold text-gray-900">{steps[active].title}</h2>
          </div>
        </div>

        <ul className="space-y-3 mb-6">
          {steps[active].details.map((d, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`w-7 h-7 rounded-lg ${steps[active].lightColor} text-xs font-bold flex items-center justify-center mt-0.5 shrink-0`}>
                {i + 1}
              </span>
              <span className="text-gray-700 leading-relaxed">{d}</span>
            </li>
          ))}
        </ul>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 mb-0.5">注意事項</p>
            <p className="text-sm text-amber-700">{steps[active].tips}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setActive(Math.max(0, active - 1))}
            disabled={active === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            上一步
          </button>
          <button
            onClick={() => setActive(Math.min(steps.length - 1, active + 1))}
            disabled={active === steps.length - 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-30 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
          >
            下一步
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-5 text-sm text-gray-600">流程依適用規範與採樣方式調整。參考：<a className="text-emerald-700 underline" href="https://www.usada.org/sample-collection-process/" target="_blank" rel="noopener noreferrer">USADA 採樣流程說明</a>、<a className="text-emerald-700 underline" href="https://www.wada-ama.org/en/athletes-support-personnel/anti-doping-process" target="_blank" rel="noopener noreferrer">WADA 反禁藥流程</a>。</p>

      {/* Other testing methods */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { pct: "尿液", type: "尿液檢測", desc: "依採樣規範取得至少 90mL，並確認比重", color: "text-emerald-600" },
          { pct: "血液", type: "血液檢測", desc: "由具適用資格的血液採樣人員採集", color: "text-blue-600" },
          { pct: "DBS", type: "乾血點檢測", desc: "以少量微血管血液採樣，採樣位置依裝置而異", color: "text-amber-600" },
        ].map((m) => (
          <div key={m.type} className="bg-white rounded-2xl p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
            <p className={`text-2xl font-black ${m.color} mb-1`}>{m.pct}</p>
            <p className="font-bold text-gray-900 text-sm">{m.type}</p>
            <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestingProcess;
