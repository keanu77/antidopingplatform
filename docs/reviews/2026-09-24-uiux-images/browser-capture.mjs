import { chromium } from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
const out=process.cwd()+'/docs/reviews/2026-09-24-uiux-images';
await mkdir(out+'/screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const result={at:new Date().toISOString(),base:'https://antidopingplatform.sportsmedicine.tw',pages:[],errors:[]};
try{
for(const width of [1280,390,320]){
const page=await browser.newPage({viewport:{width,height:900}});
await page.route('**/api/feedback',r=>r.abort());
page.on('pageerror',e=>result.errors.push(e.message));
for(const path of (width===320?['/','/cases']:['/','/cases','/statistics','/testing-process','/tue','/quiz','/education','/cases/usada-792c30cdc646'])){
await page.goto(result.base+path);await page.waitForLoadState('networkidle');
const info=await page.evaluate(()=>({title:document.title,text:document.querySelector('main').innerText,overflow:document.documentElement.scrollWidth-innerWidth,images:document.querySelectorAll('main img').length,height:document.documentElement.scrollHeight,feedbackHeight:document.querySelector('.adp-fb')?.getBoundingClientRect().height,search:document.querySelector('input[aria-label="搜尋案例"]')?.getBoundingClientRect().toJSON(),headings:[...document.querySelectorAll('main h1,main h2')].map(e=>({text:e.innerText,y:Math.round(e.getBoundingClientRect().y)}))}));
const name=width+'-'+(path==='/'?'home':path.slice(1).replaceAll('/','-'));
await page.screenshot({path:out+'/screenshots/'+name+'.png',fullPage:true});
result.pages.push({width,path,...info});
}
await page.close();
}
result.version=await(await browser.newPage()).request.get(result.base+'/version.json').then(r=>r.json());
await writeFile(out+'/browser-evidence.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({version:result.version,pages:result.pages.map(({text,...r})=>r),errors:result.errors}));
}finally{await browser.close();}
