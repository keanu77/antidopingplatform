import concurrent.futures,importlib.util,json,subprocess,os,signal,time,hashlib
from pathlib import Path
R=Path('/Users/ethanwu/Documents/Vibe coding/claude/Antidopingplatform')
D=R/'docs/reviews/2026-09-24-uiux-images'; C=R/'.cache/uiux-20260924';(C/'isolated').mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('cli',R/'scripts/run-full-case-audit.py');cli=importlib.util.module_from_spec(spec);spec.loader.exec_module(cli);cli.CACHE=C
brief='''請以獨立 UI/UX 審核顧問身分分析繁體中文運動反禁藥教學網站，並評估是否及何處適合加入 AI 生成圖片。這是分析任務，不修改網站、不生圖。只用以下固定證據，不調用工具，不讀其他模型答案，不假裝看過截圖或做過操作；你收到的是實測 DOM 與程式碼，主持人另外檢視截圖。沒有使用者訪談或流量資料，不能聲稱改善轉換率。請用繁體中文，1000-1600字。輸出：(1)保留的優點 (2)最多5項優先UI/UX問題，分已證實/推論/待驗，引用檔名與行號或DOM路由與寬度 (3)首頁、藥檢流程、測驗、TUE、案例、統計的生圖適用矩陣，允許建議完全不加圖 (4)最小試驗方案及驗收條件 (5)反對你自身結論的理由與未知。獨立權衡教學理解、操作效率、信任、無障礙、手機空間、載入速度、真假事件圖像。規則及醫學內容未於本輪重新審核，不替它們背書。共識不等於事實。\n'''
browser=json.loads((D/'browser-evidence.json').read_text());brief+='\nLIVE DOM EVIDENCE:\n'+json.dumps(browser,ensure_ascii=False)
for name in ['pages/Home.jsx','pages/CaseList.jsx','pages/TestingProcess.jsx','pages/Statistics.jsx','components/Layout.jsx','index.css']:
 p=R/'frontend/src'/name;brief+='\nFILE frontend/src/'+name+'\n'+'\n'.join(f'{i}: {l}' for i,l in enumerate(p.read_text().splitlines(),1))
brief+='\nADDITIONAL CODE FACTS: CaseList uses component useState for filters/page, no URLSearchParams/useSearchParams. CaseDetail back button navigate(-1). TUE initial activeTab=basic, tools contains drug lookup and multi-step decision UI. FeedbackBar fixed bottom; .adp-fb-inner flex-wrap:wrap; stars immediately post rating. Browser intercepted feedback requests; no submissions occurred.\nREFERENCE GUIDANCE (host verified): W3C decorative images alt empty https://www.w3.org/WAI/tutorials/images/decorative/ ; web.dev responsive-images reserves width/height, advises not lazyloading LCP https://web.dev/learn/design/responsive-images . Proposed byte budgets are project choices, not standards.\n'
(D/'neutral-brief.txt').write_text(brief)
def run(seat):
 folder=C/seat;folder.mkdir(exist_ok=True);pp=folder/'prompt.txt';pp.write_text(brief);ans=folder/'answer.txt';raw=folder/'raw.json';err=folder/'stderr.txt';model=cli.MODELS[seat];args=cli.command(seat,brief,pp,ans,model);start=time.monotonic();m={'seat':seat,'requestedModel':model,'timeoutSeconds':600,'promptSha256':hashlib.sha256(brief.encode()).hexdigest()}
 with raw.open('w') as o,err.open('w') as e:
  p=subprocess.Popen(args,cwd=C/'isolated',stdin=subprocess.PIPE if seat=='codex' else subprocess.DEVNULL,stdout=o,stderr=e,start_new_session=True)
  try:
   p.communicate(brief.encode() if seat=='codex' else None,timeout=600);m['exitCode']=p.returncode
  except subprocess.TimeoutExpired:
   os.killpg(p.pid,signal.SIGTERM);p.wait();m['exitCode']=p.returncode;m['timeout']=True
 answer,meta=cli.read_answer(seat,raw,ans);m.update(elapsedSeconds=round(time.monotonic()-start,2),providerMetadata=meta,answerCharacters=len(answer),valid=p.returncode==0 and len(answer)>500)
 if answer:(D/(seat+'-answer.md')).write_text(answer)
 (D/(seat+'-run.json')).write_text(json.dumps(m,ensure_ascii=False,indent=2));print(json.dumps(m,ensure_ascii=False),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(run,['codex','gemini','claude','grok']))
