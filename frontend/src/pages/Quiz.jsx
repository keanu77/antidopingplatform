import { useState, useMemo } from "react";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, RotateCcw, Zap, BookOpen, Trophy } from "lucide-react";
import { scenarioQuestions, knowledgeQuestions } from "../data/quiz";

function Quiz() {
  const [mode, setMode] = useState("menu"); // menu | scenario | quiz | result
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  const quizQuestions = useMemo(() => {
    const all = [...knowledgeQuestions, ...scenarioQuestions];
    return all.sort(() => Math.random() - 0.5).slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const questions = mode === "scenario" ? scenarioQuestions : quizQuestions;
  const q = questions[current];

  function handleSelect(idx) {
    if (revealed) return;
    setSelected(idx);
    if (mode === "quiz") {
      setAnswers((prev) => { const n = [...prev]; n[current] = idx; return n; });
      if (idx === q.correctIndex) setScore((s) => s + 1);
    }
    setRevealed(true);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      if (mode === "quiz") setMode("result");
      else { setMode("menu"); setCurrent(0); }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  function reset() {
    setMode("menu");
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setAnswers([]);
  }

  if (mode === "menu") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">互動測驗</h1>
          <p className="text-gray-500">測試你對運動禁藥的了解程度</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => { setMode("scenario"); setCurrent(0); setSelected(null); setRevealed(false); }}
            className="w-full p-6 bg-white rounded-2xl border-2 border-transparent text-left hover:shadow-xl hover:border-amber-200 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors shrink-0">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                  情境題：這個算不算禁藥？
                </h3>
                <p className="text-gray-500 text-sm mb-2">PRP、高壓氧、ILIB、感冒藥、Ozempic... 逐題揭曉答案</p>
                <span className="inline-block text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {scenarioQuestions.length} 題
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => { setMode("quiz"); setCurrent(0); setSelected(null); setRevealed(false); setScore(0); setAnswers([]); }}
            className="w-full p-6 bg-white rounded-2xl border-2 border-transparent text-left hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors shrink-0">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                  知識測驗（計分）
                </h3>
                <p className="text-gray-500 text-sm mb-2">隨機 10 題，答完顯示分數與解析</p>
                <span className="inline-block text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  滿分 10 分
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "result") {
    const percentage = Math.round((score / 10) * 100);
    const emoji = percentage >= 80 ? "trophy" : percentage >= 60 ? "thumbsup" : "book";
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className={`inline-flex p-4 rounded-full mb-6 ${
          percentage >= 80 ? "bg-emerald-100" : percentage >= 60 ? "bg-amber-100" : "bg-red-100"
        }`}>
          <Trophy className={`h-12 w-12 ${
            percentage >= 80 ? "text-emerald-600" : percentage >= 60 ? "text-amber-600" : "text-red-600"
          }`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">測驗結果</h2>
        <div className={`text-7xl font-black mb-2 ${
          percentage >= 80 ? "text-emerald-600" : percentage >= 60 ? "text-amber-600" : "text-red-600"
        }`}>
          {score}/10
        </div>
        <p className="text-gray-500 text-lg mb-8">
          {percentage >= 80 ? "太棒了！你對運動禁藥很有概念" : percentage >= 60 ? "不錯，但還有進步空間" : "建議再複習一下禁用清單"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
        >
          <RotateCcw className="h-4 w-4" />
          再測一次
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={reset} className="flex items-center gap-1 text-gray-500 text-sm hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          返回選單
        </button>
        <span className="text-sm text-gray-500 font-medium">
          {current + 1} / {questions.length}
          {mode === "quiz" && <span className="ml-2 text-emerald-600">得分 {score}</span>}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-5">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 leading-relaxed">{q.question}</h2>

        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            let style = "bg-gray-50 border-gray-200 text-gray-900 hover:border-emerald-300 hover:bg-emerald-50";
            let icon = null;
            if (revealed) {
              if (idx === q.correctIndex) {
                style = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold";
                icon = <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />;
              } else if (idx === selected) {
                style = "bg-red-50 border-red-400 text-red-700";
                icon = <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
              } else {
                style = "bg-gray-50 border-gray-100 text-gray-400";
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                  revealed ? "" : "cursor-pointer active:scale-[0.98]"
                } ${style}`}
              >
                <span className="flex-1">{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {revealed && (
        <div className={`rounded-2xl p-5 md:p-6 mb-5 border ${
          selected === q.correctIndex
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        }`}>
          <p className={`text-sm font-bold mb-1 ${
            selected === q.correctIndex ? "text-emerald-700" : "text-red-700"
          }`}>
            {selected === q.correctIndex ? "正確！" : "答錯了！"}
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {revealed && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
        >
          {current + 1 >= questions.length ? (mode === "quiz" ? "看結果" : "回到選單") : "下一題"}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Quiz;
