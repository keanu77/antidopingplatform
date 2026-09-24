import { chromium } from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const cases=JSON.parse(readFileSync('data/cases.json','utf8'));
const browser=await chromium.launch({headless:true});
const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4179/')?route.continue():route.abort());
 const visit=async path=>{await page.goto('http://127.0.0.1:4179'+path);await page.waitForLoadState('networkidle');};
 await visit('/cases');
 assert.match(await page.locator('body').innerText(),/找到 517 個案例/);checks.push('list shows 517');
 await page.getByRole('textbox',{name:'搜尋案例'}).fill('Susan Dutta');
 await page.waitForTimeout(800);
 assert.match(await page.locator('body').innerText(),/找到 1 個案例/);checks.push('search returns the final-batch case');
 const examples=[['usada-d8d5e2c3a318','巴西'],['48','合法 TUE'],['sia-peter-bol-2023','未提出違規指控'],['135','C.J. Hunter'],['usada-8813abb5dfc8','James Howe II']];
 for(const [id,label] of examples){
  await visit('/cases/'+id);assert.ok((await page.locator('body').innerText()).includes(label),id+' / '+label);
  assert.ok(await page.locator('a[target="_blank"][href^="https://"]').count()>0);checks.push('detail '+id+' / source link');
 }
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/cases','/cases/usada-d8d5e2c3a318','/statistics','/education']){
  await visit(path);
  if(path==='/statistics')assert.match(await page.locator('body').innerText(),/並非已確定違規人數或盛行率/);
  if(path==='/education'){
   await page.getByRole('tab',{name:'案例學習'}).click();
   await page.getByRole('link',{name:'閱讀個案與官方來源'}).first().waitFor();
   assert.equal(await page.getByRole('link',{name:'閱讀個案與官方來源'}).count(),6);
   const body=await page.locator('body').innerText();assert.match(body,/3個月/);assert.match(body,/合法 TUE/);assert.doesNotMatch(body,/Tara Lipinski|Roy Evans|211場/);
   checks.push('education uses six audited API records with corrected outcomes');
  }
  const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(overflow.doc<=overflow.width+1,JSON.stringify({path,...overflow}));checks.push('390px '+path+' fits viewport');
 }
 await page.screenshot({path:'/private/tmp/antidoping-517-education-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 const report={checkedAt:new Date().toISOString(),caseCount:cases.length,environment:'local built frontend with real Pages API bundle; external requests blocked',checks,consoleErrors:errors};
 writeFileSync('docs/research/2026-09-22-expansion-500/browser-validation.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}finally{await browser.close();}
