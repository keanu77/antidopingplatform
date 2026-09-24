import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { build } from '/Users/ethanwu/Documents/Vibe coding/claude/Antidopingplatform/frontend/node_modules/esbuild/lib/main.js';
const root=process.cwd(),dist=join(root,'frontend/dist');
const b=await build({entryPoints:[join(root,'functions/api/[[path]].js')],bundle:true,write:false,platform:'node',format:'esm'});
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
createServer(async(req,res)=>{
 try {
  const u=new URL(req.url,'http://127.0.0.1:4179');
  if(u.pathname.startsWith('/api/')){
   const chunks=[]; for await (const chunk of req) chunks.push(chunk);
   const body=Buffer.concat(chunks);
   const request=new Request(u,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body})});
   const r=await onRequest({request,env:{},params:{path:u.pathname.slice(5).split('/')}});
   res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return;
  }
  let file=resolve(dist,'.'+decodeURIComponent(u.pathname));
  if(!file.startsWith(dist+'/'))file=join(dist,'index.html');
  if(existsSync(file)&&statSync(file).isDirectory())file=join(file,'index.html');
  if(!existsSync(file))file=join(dist,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'})[extname(file)]||'application/octet-stream');
  res.end(readFileSync(file));
 } catch(e){res.statusCode=500;res.end(String(e));}
}).listen(4179,'127.0.0.1',()=>console.log('Ready on 4179'));
