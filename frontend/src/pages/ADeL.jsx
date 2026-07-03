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
    name: "ALPHA（運動員基礎課程）",
    desc: "WADA 為運動員設計的反禁藥基礎課程（Athlete Learning Program about Health and Anti-Doping），介紹運動員的權利與責任、禁用清單概念與檢測流程，適合第一次接觸反禁藥教育的人。",
  },
  {
    name: "Sport Physician's Toolkit",
    desc: "專為醫療人員設計，涵蓋 TUE（治療用途豁免）申請、常見用藥與禁用物質的臨床判斷。",
  },
  {
    name: "TUE 相關課程",
    desc: "說明治療用途豁免的適用條件、申請流程與所需醫療文件，協助運動員與醫師正確申請。",
  },
  {
    name: "Whereabouts / ADAMS 行蹤申報",
    desc: "介紹行蹤資訊申報制度與 ADAMS 系統操作，適用於檢測名冊（RTP）內的運動員。",
  },
  {
    name: "Coaches（教練專屬）",
    desc: "針對教練角色設計的反禁藥課程，強調如何營造乾淨運動文化並支持選手做出正確選擇。",
  },
  {
    name: "ADEL for Medical Professionals",
    desc: "WADA 為醫療專業人員設計的反禁藥課程，深入禁用物質分類、TUE 與運動員照護中的用藥安全。",
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
            WADA 官方線上反禁藥教育平台導引
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
          ，面向運動員、支援人員（教練、防護員）、醫療人員與家長等不同角色，提供分眾化的反禁藥學習資源。
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
          課程名稱以英文原名為主，實際上線課程與名稱請以 ADeL 官方平台為準。
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
            ADeL 與 CTADA 線上學習有什麼不同？
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
              CTADA 線上學習（台灣）
            </h3>
            <p className="text-sm text-blue-900/80 leading-relaxed">
              台灣運動禁藥管制組織（CTADA）的中文線上學習平台，是全中運／全大運選手的必修課程。
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mt-3">
          兩者互補：ADeL 提供國際通用的多語言教育，CTADA
          線上學習則是台灣選手參賽前的中文必修，建議依需求同時使用。
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
          href="https://elearning.ctada.org.tw/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-4 bg-white text-emerald-700 border border-emerald-200 rounded-2xl font-bold hover:bg-emerald-50 transition-colors"
        >
          前往 CTADA 線上學習
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default ADeL;
