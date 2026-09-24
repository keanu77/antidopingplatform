import { chromium } from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const out=process.cwd()+'/docs/design/2026-09-24-clean-sport';await mkdir(out+'/screenshots',{recursive:true});
const base='http://127.0.0.1:4187';const browser=await chromium.launch({headless:true});
const result={at:new Date().toISOString(),base,pages:[],interactions:[],errors:[],feedbackRequests:0};
try{
for(const width of [1280,390,320]){
const p=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
await p.route('**/api/feedback',r=>{result.feedbackRequests++;return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});});
p.on('pageerror',e=>result.errors.push(e.message));
for(const path of ['/','/cases','/testing-process','/statistics']){
await p.goto(base+path);await p.waitForLoadState('networkidle');
const info=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,feedbackHeight:document.querySelector('.adp-fb')?.getBoundingClientRect().height,searchWidth:document.querySelector('[aria-label="搜尋案例"]')?.getBoundingClientRect().width,headingPositions:[...document.querySelectorAll('main h2')].map(e=>({text:e.textContent,y:e.getBoundingClientRect().y})),images:[...document.querySelectorAll('main img')].map(i=>({src:i.currentSrc,width:i.naturalWidth,loaded:i.complete}))}));
assert.ok(info.overflow<=1,`${width} ${path} overflow ${info.overflow}`);assert.ok(info.feedbackHeight<65,`dock height ${info.feedbackHeight}`);
if(path==='/cases' && width<400)assert.ok(info.searchWidth>width-50);
if(path==='/'){
const cta=p.locator('.clean-hero-actions');const rect=await cta.boundingBox();assert.ok(rect.y+rect.height<844-info.feedbackHeight);
await p.locator('.clean-learning').scrollIntoViewIfNeeded();await p.waitForTimeout(300);assert.equal(await p.locator('main img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth>0).length),4);
await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+`/screenshots/${width}-home-viewport.png`});
}
await p.screenshot({path:out+`/screenshots/${width}-${path==='/'?'home':path.slice(1)}.png`,fullPage:true});result.pages.push({width,path,...info});
}
await p.goto(base+'/cases');await p.waitForLoadState('networkidle');await p.getByRole('textbox',{name:'搜尋案例'}).fill('Imani');await p.waitForLoadState('networkidle');await p.waitForTimeout(400);assert.match(p.url(),/search=Imani/);await p.getByText('找到 1 個案例',{exact:true}).waitFor();
await p.locator('main a[href^="/cases/"]').first().click();await p.waitForLoadState('networkidle');await p.getByRole('button',{name:'返回',exact:true}).click();await p.waitForLoadState('networkidle');assert.equal(await p.getByRole('textbox',{name:'搜尋案例'}).inputValue(),'Imani');await p.getByText('找到 1 個案例',{exact:true}).waitFor();
await p.reload();await p.waitForLoadState('networkidle');assert.equal(await p.getByRole('textbox',{name:'搜尋案例'}).inputValue(),'Imani');await p.getByText('找到 1 個案例',{exact:true}).waitFor();result.interactions.push({width,name:'search-detail-back-reload',passed:true});
await p.goto(base+'/cases?page=2');await p.waitForLoadState('networkidle');await p.waitForTimeout(400);const first=await p.locator('main h3').first().textContent();await p.locator('main a[href^="/cases/"]').first().click();await p.waitForLoadState('networkidle');await p.getByRole('button',{name:'返回',exact:true}).click();await p.waitForLoadState('networkidle');assert.match(p.url(),/page=2/);assert.equal(await p.locator('main h3').first().textContent(),first);result.interactions.push({width,name:'page-two-return',passed:true});
await p.getByRole('button',{name:'切換篩選選項'}).click();await p.locator('#filter-sport').selectOption('田徑');await p.waitForLoadState('networkidle');await p.reload();await p.waitForLoadState('networkidle');assert.equal(await p.locator('#filter-sport').inputValue(),'田徑');result.interactions.push({width,name:'filter-reload',passed:true});
await p.getByRole('button',{name:'意見回饋',exact:true}).click();assert.ok(await p.getByRole('button',{name:'5 星',exact:true}).isVisible());await p.getByRole('button',{name:'收合回饋列'}).click();await p.waitForFunction(()=>document.activeElement?.textContent==='意見回饋');
await p.getByRole('button',{name:'回報問題',exact:true}).click();assert.ok(await p.getByText('回報這個頁面的問題',{exact:true}).isVisible());await p.getByRole('button',{name:'收合回饋列'}).click();result.interactions.push({width,name:'feedback-expand-close-report',passed:true});
await p.goto(base+'/testing-process');await p.waitForLoadState('networkidle');await p.getByRole('button',{name:'下一步',exact:false}).click();assert.equal(await p.locator('main h2').textContent(),'報到');result.interactions.push({width,name:'testing-next',passed:true});await p.close();
}
assert.equal(result.errors.length,0);assert.equal(result.feedbackRequests,0);
await writeFile(out+'/browser-validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify({pages:result.pages.length,interactions:result.interactions.length,errors:result.errors,feedbackRequests:result.feedbackRequests}));
}catch(e){await writeFile(out+'/browser-failure.json',JSON.stringify({...result,error:e.message},null,2));throw e;}finally{await browser.close();}
