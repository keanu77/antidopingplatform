import { chromium } from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const out=process.cwd()+'/docs/design/2026-09-24-clean-sport/soft-3d';await mkdir(out+'/screenshots',{recursive:true});
const base='http://127.0.0.1:4187';const b=await chromium.launch({headless:true});const report={at:new Date().toISOString(),base,checks:[],errors:[],feedbackRequests:0};
try{
for(const width of [1280,390,320]){
const p=await b.newPage({viewport:{width,height:844},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));await p.route('**/api/feedback',r=>{report.feedbackRequests++;return r.abort();});
await p.goto(base);await p.waitForLoadState('networkidle');
const cta=await p.locator('.clean-hero-actions').boundingBox();const dock=await p.locator('.adp-fb').boundingBox();assert.ok(cta.y+cta.height<dock.y,'CTA remains above dock');
await p.locator('.clean-learning').scrollIntoViewIfNeeded();await p.waitForFunction(()=>[...document.querySelectorAll('main img')].every(i=>i.complete&&i.naturalWidth>0));
const images=await p.locator('main img').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,alt:i.alt})));
assert.equal(images.length,4);assert.ok(images.every(i=>i.src.includes('soft3d')));assert.deepEqual(await p.locator('.clean-learning-card').evaluateAll(a=>a.map(e=>e.getAttribute('href'))),['/testing-process','/tue','/quiz']);
const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.equal(overflow,0);
await p.screenshot({path:out+`/screenshots/${width}-learning.png`});await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+`/screenshots/${width}-home.png`});await p.screenshot({path:out+`/screenshots/${width}-full.png`,fullPage:true});
report.checks.push({width,overflow,images,ctaVisible:true,linksVerified:true});await p.close();
}
assert.equal(report.errors.length,0);assert.equal(report.feedbackRequests,0);await writeFile(out+'/browser-validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await b.close();}
