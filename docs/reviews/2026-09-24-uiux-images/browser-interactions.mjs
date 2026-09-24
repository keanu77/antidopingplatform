import {chromium} from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const out=process.cwd()+'/docs/reviews/2026-09-24-uiux-images';const base='https://antidopingplatform.sportsmedicine.tw';
const b=await chromium.launch({headless:true});const r={at:new Date().toISOString(),checks:[]};
try{
const p=await b.newPage({viewport:{width:390,height:844}});await p.route('**/api/feedback',r=>r.abort());
await p.goto(base+'/cases');await p.waitForLoadState('networkidle');
await p.getByRole('textbox',{name:'搜尋案例'}).fill('Imani');await p.waitForTimeout(1000);
const before={url:p.url(),input:await p.getByRole('textbox',{name:'搜尋案例'}).inputValue(),text:(await p.locator('main').innerText()).slice(0,900)};
await p.locator('main a[href^="/cases/"]').first().click();await p.waitForLoadState('networkidle');await p.getByRole('button',{name:'返回',exact:true}).click();await p.waitForLoadState('networkidle');
r.checks.push({name:'search-detail-back',before,after:{url:p.url(),input:await p.getByRole('textbox',{name:'搜尋案例'}).inputValue(),text:(await p.locator('main').innerText()).slice(0,600)}});
await p.goto(base+'/testing-process');await p.waitForLoadState('networkidle');await p.getByRole('button',{name:'下一步',exact:false}).click();r.checks.push({name:'step-next',heading:await p.locator('main h2').innerText()});
await p.setViewportSize({width:320,height:844});await p.goto(base+'/testing-process');await p.waitForLoadState('networkidle');r.checks.push({name:'320-testing-process',overflow:await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)});await p.screenshot({path:out+'/screenshots/320-testing-process.png',fullPage:true});
await p.setViewportSize({width:390,height:844});await p.goto(base+'/');await p.waitForLoadState('networkidle');await p.screenshot({path:out+'/screenshots/390-home-viewport.png'});
await p.getByRole('button',{name:/選單/}).first().click();r.checks.push({name:'mobile-menu',links:await p.locator('header a:visible').allTextContents()});await p.keyboard.press('Escape');
await p.goto(base+'/cases');await p.waitForLoadState('networkidle');await p.getByRole('button',{name:'切換篩選選項'}).click();r.checks.push({name:'case-filter-toggle',selects:await p.locator('main select:visible').count()});
await p.screenshot({path:out+'/screenshots/390-cases-filters-viewport.png'});
await writeFile(out+'/interaction-evidence.json',JSON.stringify(r,null,2));console.log(JSON.stringify(r));
}finally{await b.close();}
