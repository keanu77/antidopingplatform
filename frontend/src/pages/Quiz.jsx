import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, RotateCcw, Trash2, XCircle, Zap } from 'lucide-react';
import EvidenceLinks from '../components/EvidenceLinks';
import { learningPaths, questionLearning } from '../data/learningPaths';
import { allQuestions, mergeAnswer, validReviewDate, progressExpiry } from '../utils/learningProgress';
import { answerQuestion, createQuizSession, eligibleQuestions, questionEvidence, sessionResults } from '../utils/quizSession';
import useLearningProgress from '../utils/useLearningProgress';
import { calendarDate, nextContentDateBoundary } from '../../../shared/content-evidence.mjs';

const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed';
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed';

function QuestionTags({ question }) {
  const meta = questionLearning[question.id];
  return <div className="flex flex-wrap gap-2 text-xs mb-4">
    <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-900">能力：{meta.competency}</span>
    {meta.roles.map(id => <Link key={id} className="rounded border border-gray-300 px-2 py-1 text-gray-700 underline" to={`/learning?role=${id}`}>{learningPaths.find(path => path.id === id).label}</Link>)}
  </div>;
}

function AnswerReview({ result }) {
  const { question, option } = result;
  return <li className="rounded-xl border border-gray-200 bg-white p-5 text-left">
    <QuestionTags question={question} /><h3 className="text-lg font-bold mb-3">{question.question}</h3>
    <p className="text-sm text-gray-700">你的選擇：{option}</p>
    <p className="text-sm font-semibold text-emerald-900 mt-1">來源支持的答案：{question.options[question.correctIndex]}</p>
    <p className="text-gray-700 leading-relaxed mt-3">{question.explanation}</p>
    <EvidenceLinks evidenceId={`quiz:${question.id}`} />
    <Link className="inline-block mt-3 text-emerald-800 underline" to={questionLearning[question.id].href}>回到對應內容學習</Link>
  </li>;
}

function Quiz() {
  const [params, setParams] = useSearchParams();
  const role = learningPaths.some(path => path.id === params.get('role')) ? params.get('role') : null;
  const [view, setView] = useState('menu');
  const [session, setSession] = useState(null);
  const [current, setCurrent] = useState(0);
  const [asOf, setAsOf] = useState(() => calendarDate());
  const [reminderError, setReminderError] = useState('');
  const { progress, update, clear, status } = useLearningProgress();
  const headingRef = useRef(null);
  const { reviewOn } = progress;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [view, current]);

  useEffect(() => {
    const refresh = () => setAsOf(calendarDate());
    const boundary = nextContentDateBoundary(new Date());
    const timer = window.setTimeout(refresh, boundary.getTime() - Date.now() + 50);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearTimeout(timer); document.removeEventListener('visibilitychange', refresh); };
  }, [asOf]);

  const available = eligibleQuestions(allQuestions, asOf);
  const roleQuestions = available.filter(q => !role || questionLearning[q.id].roles.includes(role));
  const scenarios = roleQuestions.filter(q => q.category === 'scenario');
  const savedWrong = roleQuestions.filter(q => progress.answers.some(answer => answer.questionId === q.id && answer.optionIndex !== q.correctIndex));
  const results = session ? sessionResults(session, allQuestions, asOf) : [];
  const wrong = results.filter(result => result.correct === false);
  const scored = results.filter(result => result.correct !== null);
  const score = scored.filter(result => result.correct).length;
  const q = session && allQuestions.find(question => question.id === session.questionIds[current]);
  const evidence = q && questionEvidence(q, asOf);
  const answer = session?.answers.find(item => item.questionId === q?.id);
  const revealed = Boolean(answer && evidence.valid);

  function start(mode, pool) {
    const liveDate = calendarDate();
    const validPool = eligibleQuestions(pool, liveDate);
    setAsOf(liveDate);
    if (!validPool.length) return;
    setSession(createQuizSession(mode, validPool));
    setCurrent(0);
    setView('question');
  }
  function choose(optionIndex) {
    const liveDate = calendarDate();
    setAsOf(liveDate);
    const next = answerQuestion(session, q, optionIndex, liveDate);
    if (next === session) return;
    setSession(next);
    update(mergeAnswer(progress, next.answers.at(-1)));
  }
  function nextQuestion() {
    setAsOf(calendarDate());
    if (current + 1 === session.questionIds.length) setView('result');
    else setCurrent(index => index + 1);
  }
  function reminder(value) {
    if (value && (!validReviewDate(value) || value < calendarDate() || value > calendarDate(new Date(progressExpiry(Date.now()))))) {
      setReminderError('請選擇今天起至本版進度保存期限內的日期。');
      return;
    }
    setReminderError('');
    update({ ...progress, reviewOn: value || null });
  }
  function clearAll() {
    clear(); setSession(null); setCurrent(0); setView('menu'); setReminderError('');
  }

  const localProgress = <aside className="mt-8 rounded-xl bg-gray-100 p-5 text-sm text-gray-700">
    <h2 className="font-bold text-gray-900 mb-2">稍後再練習</h2>
    <p>回來時會顯示複習日期，不會傳送通知或電子郵件。僅在這個瀏覽器保存任務勾選、題目選項與日期，不上傳伺服器；最多 90 天，規則到期或內容改版時提前失效。</p>
    <label className="block mt-4 font-semibold" htmlFor="review-date">下次複習日期</label>
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <input id="review-date" type="date" className="rounded-lg border border-gray-400 bg-white px-3 py-3 text-gray-900" value={reviewOn || ''}
        min={calendarDate()} max={calendarDate(new Date(progressExpiry(Date.now())))} onChange={event => reminder(event.target.value)} aria-describedby={reminderError ? 'review-date-error' : undefined} />
      {reviewOn && <button className={secondaryButton} onClick={() => reminder('')}>移除複習日期</button>}
    </div>
    {reminderError && <p id="review-date-error" role="alert" className="mt-2 text-red-800">{reminderError}</p>}
    {reviewOn && <p className="mt-2">{reviewOn <= asOf ? `已到複習日期（${reviewOn}），可以開始錯題複習。` : `下次回來複習：${reviewOn}`}</p>}
    <button onClick={clearAll} className={`${secondaryButton} mt-4`}><Trash2 size={16} />清除所有本機學習紀錄</button>
    <p role="status" className="mt-2 min-h-5">{status}</p>
  </aside>;

  if (view === 'menu') return <div className="max-w-3xl mx-auto">
    <header className="mb-7">
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold scroll-mt-24">互動測驗</h1>
      <p className="mt-3 text-gray-700 leading-relaxed">用情境練習查核，讀來源後再做一次。這是自我學習，不核發官方認證或賽事資格。</p>
      <p className="mt-2 text-sm text-gray-700">題目依標示的 2026 清單、2021 Code 與相關來源學習。歷史答案不代表日後年度允許用藥；缺來源或超過有效期的題目暫停評分。</p>
      <Link to="/sources#rule-transition" className="inline-block mt-2 text-emerald-800 underline">來源與 2026／2027 交接狀態</Link>
    </header>
    <fieldset className="mb-6"><legend className="font-semibold mb-3">依適用角色練習</legend>
      <div className="flex flex-wrap gap-2">{[{ id: null, label: '全部題目' }, ...learningPaths].map(item => <button key={item.id || 'all'} type="button" aria-pressed={role === item.id}
        onClick={() => setParams(item.id ? { role: item.id } : {})} className={`rounded-lg px-4 py-3 border ${role === item.id ? 'bg-emerald-800 border-emerald-800 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>{item.label}</button>)}</div>
    </fieldset>
    {available.length < allQuestions.length && <p role="status" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">{allQuestions.length - available.length} 題來源或版本待更新，目前不提供答案與計分。<Link to="/sources" className="underline ml-1">查看官方來源與待查項目</Link></p>}
    <div className="space-y-4">
      <button disabled={!scenarios.length} onClick={() => start('scenario', scenarios)} className={`${secondaryButton} w-full text-left justify-start p-6 gap-4`}>
        <Zap className="text-emerald-800 shrink-0" /><span><strong className="block text-lg mb-1">情境題：這個算不算禁藥？</strong><span className="text-sm">{scenarios.length} 題適用情境，逐題解說與來源查核</span></span>
      </button>
      <button disabled={!roleQuestions.length} onClick={() => start('quiz', roleQuestions)} className={`${secondaryButton} w-full text-left justify-start p-6 gap-4`}>
        <BookOpen className="text-emerald-800 shrink-0" /><span><strong className="block text-lg mb-1">知識測驗（隨機 {Math.min(10, roleQuestions.length)} 題）</strong><span className="text-sm">固定本次抽出的題目，完成後回顧作答與錯題</span></span>
      </button>
      <button disabled={!savedWrong.length} onClick={() => start('review', savedWrong)} className={`${secondaryButton} w-full text-left justify-start p-6 gap-4`}>
        <RotateCcw className="text-emerald-800 shrink-0" /><span><strong className="block text-lg mb-1">刻意練習：重做錯題</strong><span className="text-sm">目前角色有 {savedWrong.length} 題待複習；答對後移出錯題清單</span></span>
      </button>
    </div>
    {localProgress}
  </div>;

  if (view === 'result') return <div className="max-w-3xl mx-auto">
    <header className="mb-7 border-b border-gray-200 pb-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold scroll-mt-24">{session.mode === 'review' ? '錯題複習結果' : '測驗結果'}</h1>
      {scored.length ? <p className="mt-5 text-4xl font-bold text-emerald-800" aria-label={`答對 ${score} 題，共 ${scored.length} 題可計分`}>{score} / {scored.length}</p> : <p role="status" className="mt-4 text-amber-900">目前沒有可計分題目，請先核對更新後的官方來源。</p>}
      <p className="text-gray-700 mt-3">本次固定題組 {session.questionIds.length} 題，已作答 {results.length} 題；分母只計入來源仍有效的作答。分數供學習參考，不能作為認證。</p>
      {session.questionIds.some(id => !questionEvidence(allQuestions.find(q => q.id === id), asOf).valid) && <p className="mt-3 text-amber-900">部分題目在本次練習期間已失效，停止顯示答案與評分。<Link className="underline" to="/sources">查看來源交接狀態</Link></p>}
    </header>
    <div className="flex flex-wrap gap-3 mb-8">
      <button onClick={() => setView('menu')} className={primaryButton}><RotateCcw size={18} />返回測驗選單</button>
      {wrong.length > 0 && <button onClick={() => start('review', wrong.map(result => result.question))} className={secondaryButton}>重做這 {wrong.length} 題</button>}
      <Link to={`/learning?role=${role || 'athlete'}`} className={secondaryButton}>回到角色學習路徑</Link>
    </div>
    <section aria-labelledby="wrong-question-heading"><h2 id="wrong-question-heading" className="text-xl font-bold mb-4">錯題回顧</h2>
      {wrong.length ? <ul className="space-y-4">{wrong.map(result => <AnswerReview key={result.questionId} result={result} />)}</ul> : <p className="text-gray-700">本次有效作答沒有錯題。可以換一個角色或回到學習路徑繼續練習。</p>}
    </section>
    <details className="mt-6"><summary className="cursor-pointer py-3 text-emerald-800 underline">查看本次完整作答紀錄</summary>
      <ol className="divide-y divide-gray-200">{results.map(result => <li key={result.questionId} className="py-4"><p className="font-semibold">{result.question.question}</p><p className="mt-1 text-sm text-gray-700">你的選擇：{result.option} · {result.correct === null ? '來源版本失效，暫不評分' : result.correct ? '答對' : '待複習'}</p></li>)}</ol>
    </details>
    {localProgress}
  </div>;

  return <div className="max-w-3xl mx-auto">
    <div className="flex items-center justify-between gap-3 mb-5">
      <button onClick={() => setView('menu')} className={secondaryButton}><ArrowLeft size={16} />返回選單</button>
      <span className="text-sm text-gray-700">{session.mode === 'review' ? '錯題練習' : session.mode === 'scenario' ? '情境練習' : '知識測驗'} · {current + 1} / {session.questionIds.length}</span>
    </div>
    <progress className="w-full h-2 mb-6 accent-emerald-700" value={current} max={session.questionIds.length} aria-label="已完成題數" />
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7 mb-5">
      <QuestionTags question={q} />
      <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold mb-6 leading-relaxed scroll-mt-24">{q.question}</h1>
      {evidence.valid ? <div className="space-y-3" aria-label="答案選項">{q.options.map((option, index) => {
        const correct = revealed && index === q.correctIndex;
        const selected = revealed && index === answer.optionIndex;
        return <button key={`${q.id}:${index}`} type="button" aria-pressed={selected} aria-disabled={revealed}
          onClick={() => { if (!revealed) choose(index); }}
          className={`w-full text-left rounded-lg border-2 px-4 py-4 flex gap-3 items-center ${correct ? 'bg-emerald-50 border-emerald-700 text-emerald-950' : selected ? 'bg-red-50 border-red-700 text-red-950' : 'border-gray-200 text-gray-800 hover:border-emerald-500'}`}>
          <span className="flex-1">{option}{selected ? '（你的選擇）' : ''}</span>{correct ? <CheckCircle aria-label="正確答案" size={20} /> : selected ? <XCircle aria-label="待複習" size={20} /> : null}
        </button>;
      })}</div> : <div role="status" className="rounded-lg bg-amber-50 p-4 text-amber-950"><p>來源或規則版本待更新，這題暫停作答與計分。</p><p className="mt-2 text-sm">{evidence.reason}</p><EvidenceLinks evidenceId={`quiz:${q.id}`} /></div>}
    </section>
    <div aria-live="polite" aria-atomic="true">{revealed && <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 mb-5">
      <h2 className="font-bold text-emerald-950 mb-2">{answer.optionIndex === q.correctIndex ? '答對了，確認一下來源與限制。' : '這題需要再複習，看看來源支持的答案。'}</h2>
      <p className="text-gray-800 leading-relaxed">{q.explanation}</p><EvidenceLinks evidenceId={`quiz:${q.id}`} />
      <Link to={questionLearning[q.id].href} className="inline-block mt-3 text-emerald-800 underline">回到對應內容學習</Link>
    </section>}</div>
    {(revealed || !evidence.valid) && <button onClick={nextQuestion} className={`${primaryButton} w-full`}>{current + 1 === session.questionIds.length ? '查看結果與錯題' : !evidence.valid ? '略過待更新題目' : '下一題'}<ArrowRight size={18} /></button>}
  </div>;
}

export default Quiz;
