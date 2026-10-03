import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const pkg='/Users/ethanwu/Documents/Vibe coding/claude/lecture/2026-10-pharmacist-antidoping';
const require=createRequire(pkg+'/package.json');
const {chromium}=require('playwright');
const out=path.resolve('.cache/physician-html-20261001/final');
const base=path.resolve('docs/lectures/2026-10-18-physician-antidoping');
const html=base+'/html/dist/index.html';
const url=pathToFileURL(html).href;
fs.mkdirSync(out,{recursive:true});
const run=spawnSync(process.execPath,['/Users/ethanwu/.claude/skills/html-slide-deck/scripts/qa-screenshots.mjs',html,out],{env:{...process.env,QA_OFFLINE:'1',SKILL_PKG_ROOT:pkg},stdio:'inherit'});
if(run.status!==0)process.exit(run.status||1);
const report={checked_at:new Date().toISOString(),viewport_checks:[],interaction_checks:[],overflow:[],errors:[],external_requests:[]};
const browser=await chromium.launch();
try {
 const ctx=await browser.newContext({viewport:{width:1280,height:720}});
 await ctx.route('**/*',r=>{const u=r.request().url();if(/^(file|data|blob):/.test(u))return r.continue();report.external_requests.push(u);return r.abort();});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(url);await page.waitForFunction(()=>Reveal.isReady());
 await page.evaluate(()=>Reveal.configure({transition:'none'}));
 const input=JSON.parse(fs.readFileSync(base+'/slides.json','utf8'));
 assert.equal(input.reduce((a,s)=>a+s.seconds,0),3000);
 for(let n=1;n<=60;n++){
  await page.evaluate(i=>Reveal.slide(i-1),n);await page.waitForTimeout(30);
  const result=await page.evaluate(()=>{const s=Reveal.getCurrentSlide();const sr=s.getBoundingClientRect();const foot=s.querySelector('footer').getBoundingClientRect();const content=[...s.querySelectorAll('.text-col p,.viz p,.viz .card,.viz .step,.viz .callout,h2,.reference-grid>a')];return {n:+s.dataset.slide,notes:s.querySelector('aside.notes').textContent,broken:[...s.querySelectorAll('img')].filter(i=>!i.complete||i.naturalWidth===0).length,clipped:content.filter(el=>{const r=el.getBoundingClientRect();return r.left<sr.left-2||r.right>sr.right+2||r.top<sr.top-2||r.bottom>foot.top-5;}).map(el=>el.textContent)};});
  assert.equal(result.broken,0,`broken image ${n}`);assert(result.notes.includes(input[n-1].speaker_notes),`notes preserved ${n}`);if(result.clipped.length)report.overflow.push(result);
 }
 report.viewport_checks.push({width:1280,height:720,slides:60,notes:'60 original notes preserved',images:'all loaded'});
 await page.evaluate(()=>Reveal.slide(0));await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>Reveal.getIndices().h),1);
 await page.keyboard.press('s');assert(await page.locator('#notes-dialog').isVisible());await page.click('#notes-next');assert.equal(await page.evaluate(()=>Reveal.getIndices().h),2);await page.keyboard.press('Escape');assert(!(await page.locator('#notes-dialog').isVisible()));
 await page.keyboard.press('g');await page.fill('#page-input','42');await page.click('#jump-form button');assert.equal(await page.evaluate(()=>Reveal.getIndices().h),41);
 await page.keyboard.press('o');assert(await page.evaluate(()=>Reveal.isOverview()));await page.keyboard.press('Escape');assert(!(await page.evaluate(()=>Reveal.isOverview())));
 await page.keyboard.press('b');assert(await page.evaluate(()=>Reveal.isPaused()));await page.keyboard.press('b');assert(!(await page.evaluate(()=>Reveal.isPaused())));
 await page.click('#sources-btn');assert.equal(await page.locator('#source-dialog article').count(),24);await page.keyboard.press('Escape');
 await page.evaluate(()=>Reveal.slide(2));await page.click('[data-quiz="3"] [data-choice="2"]');assert.equal(await page.locator('[data-quiz="3"] [data-choice="2"]').getAttribute('aria-pressed'),'true');await page.click('[data-quiz="3"] [data-reveal-answer]');assert(await page.locator('[data-quiz="3"] .answer').isVisible());await page.screenshot({path:out+'/quiz-answer.png'});
 await page.evaluate(()=>Reveal.slide(55));await page.click('[data-quiz="56"] [data-reveal-answer]');assert.equal(await page.locator('[data-quiz="56"] .answer:visible').count(),3);await page.screenshot({path:out+'/recall-answer.png'});
 report.interaction_checks.push('arrow navigation','S notes + next + Esc close','G jump to 42','O overview + Esc close','B blackout','24 source records','quiz select and answer','three recall answers');
 // Additional projection ratio; fixed canvas should retain its bounds.
 await page.setViewportSize({width:1024,height:768});await page.evaluate(()=>Reveal.layout());await page.screenshot({path:out+'/projection-4x3.png'});report.viewport_checks.push({width:1024,height:768,mode:'deck'});
 await ctx.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.route('**/*',r=>/^(file|data|blob):/.test(r.request().url())?r.continue():r.abort());
 const mp=await mobile.newPage();await mp.goto(url);assert.equal(await mp.locator('body.reading').count(),1);
 const mb=await mp.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,slides:document.querySelectorAll('.slides>section').length}));assert(mb.scroll<=mb.width+1,JSON.stringify(mb));assert.equal(mb.slides,60);
 const mobileOverflow=await mp.evaluate(()=>[...document.querySelectorAll('.slides>section')].flatMap(s=>[...s.querySelectorAll('h1,h2,p,.card,.step,.qrcard')].filter(e=>{const r=e.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1}).map(e=>({n:s.dataset.slide,text:e.textContent.slice(0,100)}))));assert.deepEqual(mobileOverflow,[]);
 await mp.screenshot({path:out+'/mobile-cover.png'});
 await mp.locator('[data-slide="42"]').scrollIntoViewIfNeeded();await mp.locator('[data-slide="42"]').screenshot({path:out+'/mobile-42.png'});
 await mp.click('#jump-btn');await mp.fill('#page-input','60');await mp.click('#jump-form button');await mp.screenshot({path:out+'/mobile-60.png'});
 report.viewport_checks.push({width:390,height:844,mode:'reading',slides:60,horizontal_overflow:false,jump_to_60:true});
 await mobile.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:720}});const np=await nojs.newPage();await np.goto(url);assert.equal(await np.locator('.slides>section:visible').count(),60);report.interaction_checks.push('no JavaScript: all 60 slides readable');await nojs.close();
 assert.deepEqual(report.overflow,[]);assert.deepEqual(report.errors,[]);assert.deepEqual(report.external_requests,[]);
 report.passed=true;
}finally{await browser.close();fs.writeFileSync(out+'/functional-report.json',JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
