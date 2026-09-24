import concurrent.futures,importlib.util,json,subprocess,os,signal,time,hashlib
from pathlib import Path
R=Path('/Users/ethanwu/Documents/Vibe coding/claude/Antidopingplatform')
D=R/'docs/reviews/2026-09-24-uiux-images'; C=R/'.cache/uiux-20260924';(C/'isolated').mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('cli',R/'scripts/run-full-case-audit.py');cli=importlib.util.module_from_spec(spec);spec.loader.exec_module(cli);cli.CACHE=C
D=D/'reference-round';D.mkdir(exist_ok=True);C=C/'reference-round';(C/'isolated').mkdir(parents=True,exist_ok=True);cli.CACHE=C
brief="""獨立設計審核，請只使用下列證據、不呼叫工具、不聲稱看過截圖。繁體中文600字內。使用者要分析運動反禁藥網站 UI/UX 並希望加入圖片，明確補充「我也想加入一些圖片，例如 https://injury.sportsmedicine.tw/ ，不一定要真實圖片」。請評估相似視覺方向的可行版本與取捨，而非假設只允許法規資訊圖。仍可對個別位置反對，但須區分裝飾主視覺、虛構教學情境插畫、真實人物事件證據、精確規則圖。
參考網站 LIVE DOM：injury 首頁 h1 運動傷害影片圖鑑，主標語 看懂受傷，了解回場，兩顆按鈕 開始找影片/看受傷瞬間，數字14/200/30。首張圖片 a-all-sport-burst.*.avif 為首頁hero裝飾圖 alt空；1280px視窗實際圖781x354，390px視窗圖302x180。其餘圖片是影片縮圖，不能混同主視覺。這些是DOM資料，未提供像素，不判定具體色彩/畫風。
被審網站 LIVE：antidoping 首頁 emerald/teal漸層、中央標題、開始測驗/瀏覽禁用清單兩CTA，下方6個圖示學習卡（禁用清單、測驗、藥檢、TUE、案例、消息）；8頁首次DOM的main img皆0，有Lucide SVG與Chart.js。手機390 hero標題y112、模組h2 y976，固定回饋列149px；320案例搜尋欄84px寬。新操作證據：搜Imani得1件，進案例後返回搜尋清空回517件；320藥檢步驟列橫溢12px。統計390頁高8225，第一圖h2 y1706。已用桌面/手機截圖由主持人另看，不代表模型看圖。
任務：1.給可行的圖片配置與第一批張數/優先順序（可含首頁運動群像、學習卡情境）；2.說明何處不適合；3.如何兼顧小螢幕CTA/速度/無障礙；4.主張或反對哪一部分參考站設計並說理由。人物可為清楚非寫實的虛構運動員，不影射真實涉案選手，不生成人臉冒充案例；不得把圖當證據。規則、數字、中文、箭頭交給HTML/SVG，生成素材無字。圖片成效無用戶研究不可聲稱已改善。列未知。不是要求修改或生圖。"""
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
