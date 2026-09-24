#!/usr/bin/env python3
"""Bounded independent CLI case review. No model tools or case-data mutation."""
import argparse,concurrent.futures,datetime,hashlib,json,os,signal,subprocess,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'.cache/full-audit-20260923'
REPORT=ROOT/'docs/research/2026-09-23-full-audit'
MODELS={'gemini':'gemini-3.8-flash-medium','grok':'grok-4.7-build-fast','claude':'haiku','codex':'gpt-6-luna'}
def stamp():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def command(seat,prompt,prompt_path,answer_path,model):
 if seat=='gemini':return ['/Users/ethanwu/.local/bin/agy','-p',prompt,'--model',model,'--effort','medium','--mode','plan','--sandbox','--disable-slash-commands','--output-format','json','--print-timeout','600s']
 if seat=='grok':return ['/Users/ethanwu/.grok/bin/grok','--prompt-file',str(prompt_path),'--cwd',str(CACHE/'isolated'),'--tools','','--deny','*','--no-subagents','--no-memory','--disable-web-search','--permission-mode','dontAsk','--max-turns','1','--verbatim','--output-format','json','--model',model,'--reasoning-effort','low']
 if seat=='claude':return ['claude','--safe-mode','--model',model,'--tools','','--strict-mcp-config','--permission-mode','dontAsk','--no-session-persistence','--max-budget-usd','1','-p',prompt,'--output-format','json']
 return ['codex','exec','--ignore-user-config','--skip-git-repo-check','--ephemeral','--sandbox','read-only','-C',str(CACHE/'isolated'),'-m',model,'-c','model_reasoning_effort="low"','-c','web_search="disabled"','--json','-o',str(answer_path),'-']
def read_answer(seat,raw,answer_path):
 if seat=='codex':return answer_path.read_text() if answer_path.exists() else '',{}
 try:d=json.loads(raw.read_text())
 except (ValueError,OSError):return '',{}
 answer=d.get('response') if seat=='gemini' else d.get('text') if seat=='grok' else d.get('result')
 # Deliberately exclude thought/reasoning/session transcript from public artifacts.
 meta={k:d[k] for k in ['status','stopReason','usage','modelUsage','total_cost_usd','is_error'] if k in d}
 return answer if isinstance(answer,str) else '',meta
def parse_json(answer):
 s=answer.strip()
 if s.startswith('```'):s='\n'.join(s.splitlines()[1:-1])
 return json.loads(s)
def validate_rows(parsed,packet):
 rows=parsed.get('cases',[]);ids=[c['id'] for c in packet['cases']];actual=[x.get('id') for x in rows]
 if sorted(actual)!=sorted(ids) or len(set(actual))!=len(ids):raise ValueError('Missing, duplicate or unexpected case IDs')
 fields={'identity','country','event','substance','sanction','dates','outcomes','education'}
 originals={c['id']:c for c in packet['cases']}
 for row in rows:
  if row.get('status') not in ['supported','issue','uncertain']:raise ValueError('Invalid status')
  checks=row.get('checks')
  if not isinstance(checks,dict) or set(checks)!=fields:raise ValueError('Incomplete field checks')
  if any(x not in ['supported','issue','uncertain','not_applicable'] for x in checks.values()):raise ValueError('Invalid field status')
  expected='issue' if 'issue' in checks.values() else 'uncertain' if 'uncertain' in checks.values() else 'supported'
  if row['status']!=expected:raise ValueError('Overall/field status mismatch')
  docs={d['documentId']:len(d['lines']) for d in originals[row['id']]['documents']}
  if not isinstance(row.get('sourcesRead'),list) or not row['sourcesRead'] or not set(row['sourcesRead'])<=set(docs):raise ValueError('Unknown or missing source document')
  def ref(r):
   if r.get('documentId') not in row['sourcesRead']:raise ValueError('Reference outside sourcesRead')
   start,end=r.get('startLine'),r.get('endLine')
   if not isinstance(start,int) or not isinstance(end,int) or not 1<=start<=end<=docs[r['documentId']]:raise ValueError('Invalid evidence line range')
  if not isinstance(row.get('evidence'),list) or not row['evidence']:raise ValueError('Missing case-specific evidence')
  for e in row['evidence']:
   ref(e)
   if not e.get('note') or not e.get('supports') or not set(e['supports'])<=fields:raise ValueError('Invalid evidence explanation')
  if not isinstance(row.get('findings'),list):raise ValueError('Missing findings')
  found=set()
  for f in row['findings']:
   if f.get('field') not in fields or f.get('kind') not in ['contradiction','insufficient_evidence','material_ambiguity'] or f.get('severity') not in ['high','medium','low']:raise ValueError('Invalid finding')
   if not all(f.get(k) for k in ['claim','explanation','suggestion','sourceRefs']):raise ValueError('Incomplete finding')
   for r in f['sourceRefs']:ref(r)
   found.add(f['field'])
  if any(v in ['issue','uncertain'] and k not in found for k,v in checks.items()):raise ValueError('Unexplained issue/uncertain check')
 return rows
def run(seat,batch,probe=False,attempt=1,model=None):
 model=model or MODELS[seat]; folder=CACHE/('probes' if probe else 'runs')/batch/seat/f'attempt-{attempt}'
 folder.mkdir(parents=True,exist_ok=True); meta_path=folder/'run.json'
 if meta_path.exists():return json.loads(meta_path.read_text())
 (CACHE/'isolated').mkdir(parents=True,exist_ok=True)
 if probe:prompt='Return exactly {"status":"ok"}. Do not use tools, read files, access network, or provide reasoning.';ids=[]
 else:
  packet_path=CACHE/'packets'/f'{batch}.json';packet=json.loads(packet_path.read_text());ids=[x['id'] for x in packet['cases']]
  if digest(ROOT/'data/cases.json') != packet['datasetSha256']:
   raise ValueError('Current dataset differs from frozen audit input')
  # Preserve every extraction line and its number, normalize only whitespace.
  for case in packet['cases']:
   for doc in case['documents']:
    for line in doc['lines']:line['text']=' '.join(line['text'].split())
  prompt=(REPORT/'neutral-prompt.txt').read_text()+'\nSOURCE PACKET (whitespace normalized, no source lines removed):\n'+json.dumps(packet,ensure_ascii=False,separators=(',',':'))
 prompt_path=folder/'prompt.txt';prompt_path.write_text(prompt)
 answer_path=folder/'answer.txt';raw=folder/'raw.json';err=folder/'stderr.txt';args=command(seat,prompt,prompt_path,answer_path,model)
 m={'seat':seat,'requestedModel':model,'batch':batch,'caseIds':ids,'probe':probe,'attempt':attempt,'startedAt':stamp(),'timeoutSeconds':600,'promptSha256':digest(prompt_path),'datasetSha256':digest(ROOT/'data/cases.json'),'status':'running'}
 if not probe:m['packetSha256']=digest(packet_path)
 meta_path.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');start=time.monotonic()
 with raw.open('w') as out,err.open('w') as e:
  proc=subprocess.Popen(args,cwd=CACHE/'isolated',stdin=subprocess.PIPE if seat=='codex' else subprocess.DEVNULL,stdout=out,stderr=e,start_new_session=True)
  try:
   if seat=='codex':proc.stdin.write(prompt.encode());proc.stdin.close()
   m['exitCode']=proc.wait(timeout=600);m['status']='returned'
  except (subprocess.TimeoutExpired,KeyboardInterrupt):
   os.killpg(proc.pid,signal.SIGTERM)
   try:proc.wait(timeout=3)
   except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);proc.wait()
   m['exitCode']=proc.returncode;m['status']='timeout_or_interrupted'
 answer,usage=read_answer(seat,raw,answer_path);m['providerMetadata']=usage;m['elapsedSeconds']=round(time.monotonic()-start,2);m['finishedAt']=stamp();m['answerCharacters']=len(answer)
 if answer:answer_path.write_text(answer)
 m['valid']=False
 try:
  parsed=parse_json(answer)
  if probe:m['valid']=parsed=={'status':'ok'} and m.get('exitCode')==0
  else:
   validate_rows(parsed,packet)
   m['valid']=m.get('exitCode')==0
  if m['valid']:
   target=REPORT/('probes' if probe else 'reviews');target.mkdir(exist_ok=True);(target/f'{batch}-{seat}-a{attempt}.json').write_text(json.dumps(parsed,ensure_ascii=False,indent=2)+'\n')
 except (ValueError,AttributeError,TypeError) as e:m['validationError']=str(e)[:250]
 meta_path.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:m.get(k) for k in ['seat','requestedModel','batch','attempt','status','exitCode','valid','elapsedSeconds','answerCharacters','validationError']},ensure_ascii=False),flush=True)
 return m
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--probe',action='store_true');p.add_argument('--seats',default='gemini,grok,claude,codex');p.add_argument('--batches',default='batch-001');p.add_argument('--attempt',type=int,choices=[1,2],default=1);p.add_argument('--workers',type=int,default=2);p.add_argument('--all-batches',action='store_true');p.add_argument('--retry-missing',action='store_true');p.add_argument('--plan-only',action='store_true');a=p.parse_args()
 seats=a.seats.split(',');assert set(seats)<=set(MODELS)
 batches=[x['batch'] for x in json.loads((REPORT/'packet-manifest.json').read_text())['batches']] if a.all_batches else a.batches.split(',')
 jobs=[(s,'smoke' if a.probe else b) for b in batches for s in seats]
 if a.retry_missing:
  assert not a.probe and a.attempt==2,'Missing-review retry requires --attempt 2'
  records=[json.loads(path.read_text()) for path in (CACHE/'runs').glob('*/*/attempt-*/run.json')]
  assert not any(r['status']=='running' for r in records),'Wait for the current runner to finish'
  complete={b for b in batches if len({r['seat'] for r in records if r['batch']==b and r.get('valid')})>=2}
  jobs=[(s,b) for s,b in jobs if b not in complete
    and any(r['seat']==s and r['batch']==b and r['attempt']==1 and not r.get('valid') for r in records)
    and not any(r['seat']==s and r['batch']==b and (r.get('valid') or r['attempt']==2) for r in records)]
 if a.plan_only:
  print(json.dumps({'jobs':[{'seat':s,'batch':b,'attempt':a.attempt} for s,b in jobs]}));raise SystemExit(0)
 with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as ex:
  futures=[ex.submit(run,s,b,a.probe,a.attempt) for s,b in jobs]
  for f in concurrent.futures.as_completed(futures):f.result()
