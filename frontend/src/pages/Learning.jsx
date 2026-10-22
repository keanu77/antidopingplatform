import { useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Printer, Trash2 } from 'lucide-react';
import EvidenceLinks from '../components/EvidenceLinks';
import { learningPaths, sharedLearningSources } from '../data/learningPaths';
import { registry } from '../../../shared/content-evidence.mjs';
import { SITE_URL } from '../data/routeMeta';
import useLearningProgress from '../utils/useLearningProgress';

function ResourceLink({ href, children, className = 'text-emerald-800 underline underline-offset-4' }) {
  return href.startsWith('/') ? <Link to={href} className={className}>{children}</Link>
    : <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}（官方網站，另開分頁）</a>;
}

export default function Learning() {
  const [params] = useSearchParams();
  const location = useLocation();
  const path = learningPaths.find(item => item.id === params.get('role')) || learningPaths[0];
  const { progress, update, clear, status } = useLearningProgress();
  const headingRef = useRef(null);
  const completed = path.tasks.filter(task => progress.completed.includes(`${path.id}:${task.id}`)).length;

  useEffect(() => {
    if (location.hash === '#mini-lesson' && path.id === 'coach') {
      const lesson = document.getElementById('mini-lesson');
      lesson?.scrollIntoView({ block: 'start' });
      lesson?.focus({ preventScroll: true });
    }
  }, [location.hash, path.id]);

  function toggleTask(id) {
    const key = `${path.id}:${id}`;
    update({ ...progress, completed: progress.completed.includes(key)
      ? progress.completed.filter(item => item !== key) : [...progress.completed, key] });
  }

  return <div className="max-w-5xl mx-auto">
    <header className="mb-8">
      <p className="text-sm font-semibold tracking-widest text-emerald-800 mb-3">把知識化成下一步</p>
      <h1 className="text-3xl font-bold text-gray-900">依角色開始學習</h1>
      <p className="mt-3 text-gray-700 leading-relaxed">選手、教練與醫護使用同一套來源，從各自需要完成的任務開始。角色可隨時切換。</p>
    </header>

    <nav aria-label="學習角色" className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
      {learningPaths.map(role => <Link key={role.id} to={`/learning?role=${role.id}`}
        aria-current={role.id === path.id ? 'page' : undefined}
        onClick={() => requestAnimationFrame(() => headingRef.current?.focus())}
        className={`rounded-xl border px-3 py-4 sm:p-5 text-center font-bold transition ${role.id === path.id ? 'bg-emerald-800 border-emerald-800 text-white' : 'bg-white border-gray-300 text-gray-800 hover:border-emerald-700'}`}>
        {role.label}
      </Link>)}
    </nav>

    <section aria-labelledby="role-learning-heading" className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div><h2 ref={headingRef} id="role-learning-heading" tabIndex={-1} className="text-2xl font-bold scroll-mt-24">{path.title}</h2>
          <p className="text-gray-700 mt-2">{path.description}</p></div>
        <p className="text-sm text-emerald-800" aria-live="polite">已完成 {completed} / {path.tasks.length} 個學習任務</p>
      </div>
      <ol className="space-y-4">
        {path.tasks.map((task, index) => <li key={`${path.id}:${task.id}`} className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex gap-4">
            <span aria-hidden="true" className="text-2xl font-semibold text-emerald-700 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1"><h3 className="text-lg font-bold">{task.title}</h3>
              <p className="mt-2 mb-3 text-gray-700 leading-relaxed">{task.description}</p>
              <ResourceLink href={task.href}>{task.action}</ResourceLink>
              <label className="mt-4 flex items-center gap-3 cursor-pointer py-2 text-sm text-gray-800">
                <input type="checkbox" className="h-5 w-5 accent-emerald-700" checked={progress.completed.includes(`${path.id}:${task.id}`)} onChange={() => toggleTask(task.id)} />
                我已完成：{task.title}
              </label>
              <details className="mt-2 text-sm"><summary className="cursor-pointer py-2 text-emerald-800">本任務的延伸證據與適用範圍</summary>
                <EvidenceLinks evidenceId={task.evidenceId} />
              </details>
            </div>
          </div>
        </li>)}
      </ol>
    </section>

    {path.id === 'coach' && <section id="mini-lesson" tabIndex={-1} aria-labelledby="mini-lesson-heading" className="scroll-mt-24 mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
      <p className="text-sm text-emerald-800 font-semibold">教練帶領 · 12 分鐘 · 不需收集個人用藥</p>
      <h2 id="mini-lesson-heading" className="text-xl font-bold mt-2 mb-4">團隊短課：隊友說這個可以吃，下一步呢？</h2>
      <ol className="space-y-4 text-gray-800">
        <li><strong>0–2 分鐘｜提出虛構情境。</strong>一位選手賽前感冒，隊友推薦藥品與提神補充品。請大家先說明缺少哪些資料，不討論真實隊員病史。</li>
        <li><strong>2–6 分鐘｜分組查核。</strong>用 <Link className="underline text-emerald-800" to="/tue?tab=tools">藥物查詢工具</Link> 與 <Link className="underline text-emerald-800" to="/education?tab=supplements">補充劑安全</Link> 找出查詢步驟、限制與官方核對管道。</li>
        <li><strong>6–10 分鐘｜討論決策。</strong>誰負責確認成分？查不到怎麼辦？何時聯絡醫師、藥師或主管機構？請每組說出一個不能單憑口頭保證的理由。</li>
        <li><strong>10–12 分鐘｜練習與回顧。</strong>進入 <Link className="underline text-emerald-800" to="/quiz?role=coach">情境測驗</Link>，比較答案與官方來源，再訂一個稍後回來複習的日期。</li>
      </ol>
      <p className="mt-4 text-sm text-gray-700">這是站內討論教案。完成短課或測驗不等於取得官方課程證明或賽事資格。</p>
    </section>}

    <section className="learning-checklist mb-8 rounded-xl border border-gray-300 bg-white p-5 sm:p-6" aria-labelledby="preparation-checklist-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="preparation-checklist-heading" className="text-xl font-bold">{path.label}準備清單</h2>
        <button type="button" onClick={() => window.print()} className="print:hidden inline-flex gap-2 items-center border border-emerald-700 text-emerald-800 rounded-lg px-4 py-3 hover:bg-emerald-50"><Printer size={18} />列印準備清單</button>
      </div>
      <p className="text-sm text-gray-700 mb-4">這份清單只提醒要準備的事項。請勿在本平台輸入或上傳姓名、診斷、用藥或其他個人健康資料。</p>
      <ul className="space-y-3">{path.checklist.map(item => <li key={item} className="flex gap-3"><span aria-hidden="true">□</span><span>{item}</span></li>)}</ul>
      <p className="mt-5 text-sm text-gray-700">準備清單不能代替醫療評估、官方查核或 TUE 核准。規則來源及適用年度：{SITE_URL}/sources</p>
    </section>

    <section className="mb-8 grid md:grid-cols-2 gap-6" aria-label="練習與官方課程">
      <div className="border-t-2 border-emerald-700 pt-5"><h2 className="text-xl font-bold flex gap-2 items-center"><BookOpen size={21} />站內練習</h2>
        <p className="text-gray-700 my-3">透過情境題與隨機題檢查理解，答錯後可閱讀來源、重做並安排稍後複習。站內分數沒有認證效力。</p>
        <Link className="inline-flex items-center gap-2 text-emerald-800 font-semibold underline" to={`/quiz?role=${path.id}`}>開始練習<ArrowRight size={17} /></Link>
      </div>
      <div className="border-t-2 border-gray-300 pt-5"><h2 className="text-xl font-bold">官方課程</h2>
        <p className="text-gray-700 my-3">在 ADEL 查找「{path.course}」。開放狀態、語言與完成證明依官方平台；賽事要求另向主辦單位確認。</p>
        <ResourceLink href={path.courseUrl}>前往 ADEL 官方學習平台</ResourceLink>
      </div>
    </section>

    <section className="mb-8 border-t border-gray-200 pt-6" aria-labelledby="shared-sources-heading">
      <h2 id="shared-sources-heading" className="text-xl font-bold mb-3">三種角色共用的來源</h2>
      <p className="text-gray-700 text-sm mb-4">來源用來核對規則；課程用來循序學習。請先看適用年度、核對範圍與待查項目。</p>
      <ul className="space-y-3">{sharedLearningSources.map(id => <li key={id}><ResourceLink href={registry.sources[id].url}>{registry.sources[id].title}</ResourceLink></li>)}
        <li><Link className="text-emerald-800 underline" to="/sources">來源、有效期與修訂紀錄</Link></li>
      </ul>
    </section>

    <aside className="rounded-xl bg-gray-100 p-5 text-sm text-gray-700">
      <h2 className="font-bold text-gray-900 mb-2">本機學習進度</h2>
      <p>只在這個瀏覽器保存任務勾選、題目選項及複習日期；不傳送到伺服器。最長保存 90 天，規則到期或內容版本更新時提前失效。換裝置或清除網站資料後不會同步。</p>
      <button type="button" onClick={clear} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-400 bg-white px-4 py-3 hover:bg-gray-50"><Trash2 size={16} />清除所有本機學習紀錄</button>
      <p role="status" className="mt-2 min-h-5">{status}</p>
    </aside>
    <style>{`@media print { body * { visibility: hidden !important; } .learning-checklist, .learning-checklist * { visibility: visible !important; } .learning-checklist { position: absolute; top: 0; left: 0; width: 100%; border: 0; margin: 0; padding: 24px; } .learning-checklist button { display: none; } }`}</style>
  </div>;
}
