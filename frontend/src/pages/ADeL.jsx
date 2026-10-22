import { useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  ExternalLink,
  CheckCircle,
  Globe,
} from "lucide-react";

const courses = [
  {
    name: "ADEL for International-Level Athletes",
    desc: "國際級選手：學習權利與責任、檢測、禁用清單與 TUE；請依所屬國際總會確認適用課程與賽事要求。",
  },
  {
    name: "ADEL for National-Level Athletes",
    desc: "國家級選手：建立乾淨運動與用藥查核的基礎，並確認國家運動禁藥管制組織的教育要求。",
  },
  {
    name: "ADEL for High Performance Coaches",
    desc: "教練：了解支援人員責任，協助選手確認用藥、營養品與通報流程，建立乾淨運動文化。",
  },
  {
    name: "ADEL for Medical Professionals",
    desc: "醫療人員：學習禁用物質與途徑差異、TUE 文件及運動員照護中的用藥查核。",
  },
  {
    name: "At-a-Glance: Therapeutic Use Exemptions (TUE)",
    desc: "TUE 重點資源：協助選手、教練與醫療人員快速理解治療用途豁免，作為完整課程的補充。",
  },
  {
    name: "At-a-Glance: Athlete Whereabouts",
    desc: "行蹤申報重點資源：檢測名冊內的選手與支援人員可用來確認行蹤資訊責任。",
  },
];

function ADeL() {
  useEffect(() => {
    document.title = "ADeL 學習專區 | 乾淨運動從你我開始";
    return () => {
      document.title = "乾淨運動從你我開始";
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-emerald-100 rounded-xl">
          <GraduationCap className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            ADeL 學習專區
          </h1>
          <p className="text-gray-500 text-sm">
            WADA 官方線上運動禁藥防制教育平台導引
          </p>
        </div>
      </div>

      {/* 什麼是 ADeL */}
      <section className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">什麼是 ADeL？</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          ADeL 全名為{" "}
          <strong>Anti-Doping Education and Learning（ADEL）</strong>（早期稱
          Anti-Doping e-Learning Platform）
          ，是世界運動禁藥管制組織（WADA）建置的官方線上教育平台，網址為{" "}
          <a
            href="https://adel.wada-ama.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-medium hover:underline"
          >
            adel.wada-ama.org
          </a>
          。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          平台<strong>免費、支援多國語言</strong>
          ，面向運動員、支援人員（教練、防護員）、醫療人員與家長等不同角色，提供分眾化的運動禁藥防制學習資源。
        </p>
      </section>

      {/* 如何註冊 */}
      <section className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">如何註冊與修課</h2>
        </div>
        <ul className="space-y-2.5">
          {[
            "前往 adel.wada-ama.org 免費建立帳號",
            "選擇你的身分別（運動員／支援人員／醫療人員／家長）",
            "依角色選擇對應課程並線上修課",
            "完成課程後可取得完成證明",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-600 leading-relaxed">
                {step}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 推薦課程 */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">推薦課程</h2>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          課程與重點資源依角色選擇；完成證明依各課程規定，不代表自動符合賽事報名要求。實際名稱、語言與開放狀態請以 ADEL 官方平台為準。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map((course) => (
            <div
              key={course.name}
              className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-200"
            >
              <h3 className="font-bold text-gray-900 mb-1.5">{course.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {course.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ADeL vs CTADA */}
      <section className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">
            ADeL 與 CTADA 教育資源有什麼不同？
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-1.5">
              ADeL（WADA 國際平台）
            </h3>
            <p className="text-sm text-emerald-900/80 leading-relaxed">
              WADA
              建置的國際線上教育平台，支援多國語言、國際通用，適合有國際賽事需求的運動員與醫療人員。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-1.5">
              CTADA 教育資源（台灣）
            </h3>
            <p className="text-sm text-blue-900/80 leading-relaxed">
              CTADA 提供中文運動禁藥防制學習資源。115 年全中運、全大運已取消將線上測驗通過證明列為報名條件，其他賽會請核對各自公告。
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mt-3">
          兩者互補：ADeL 提供國際通用的多語言教育，CTADA
          提供中文學習資源；學習要求與報名資格須分開確認。請參閱{" "}<a href="https://www.antidoping.org.tw/news/測驗平台公告/" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">CTADA 測驗平台公告</a>。
        </p>
      </section>

      {/* 行動連結 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="https://adel.wada-ama.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
        >
          前往 ADeL 學習平台
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href="https://www.antidoping.org.tw/news/測驗平台公告/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-4 bg-white text-emerald-700 border border-emerald-200 rounded-2xl font-bold hover:bg-emerald-50 transition-colors"
        >
          查看 CTADA 官方公告
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default ADeL;
