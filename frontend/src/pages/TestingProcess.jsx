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
      "未成年運動員應有陪同人員（教練、家長）",
    ],
    tips: "合理延遲理由：完成訓練、參加頒獎、接受治療等。但必須在 DCO 視線範圍內。",
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
      "藥檢人員與運動員必須是同性別",
      "選擇採樣杯和密封瓶",
      "在監督下提供尿液樣本（至少 90mL）",
      "將尿液分裝到 A 瓶和 B 瓶",
    ],
    tips: "未成年運動員的陪同人員與藥檢代表會監督藥檢人員的執行過程。",
  },
  {
    num: 4,
    title: "完成表單",
    icon: FileCheck,
    color: "bg-gray-800",
    lightColor: "bg-gray-100 text-gray-700",
    details: [
      "檢查七處號碼是否一致（如有疑慮可要求更換）",
      "填寫 7 日內使用的藥品或營養品資訊",
      "簽署藥檢紀錄表",
      "檢體與表單副本將寄至藥檢實驗室",
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
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => setActive(i)}
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 ${
                i === active
                  ? `${step.color} text-white scale-110 shadow-xl`
                  : i < active
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-100 text-gray-400"
              }`}
              aria-label={`步驟 ${step.num}: ${step.title}`}
            >
              {step.num}
              <span className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap ${
                i === active ? "text-gray-900" : "text-gray-500"
              }`}>
                {step.title}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-12 md:w-20 h-1 mx-1 rounded-full transition-colors duration-300 ${
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

      {/* Other testing methods */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { pct: "~90%", type: "尿液檢測", desc: "最主要的檢測方式", color: "text-emerald-600" },
          { pct: "~10%", type: "血液檢測", desc: "由授證醫檢師採集靜脈血液", color: "text-blue-600" },
          { pct: "NEW", type: "乾血點檢測", desc: "2022 北京冬奧開始，指尖一滴血", color: "text-amber-600" },
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
