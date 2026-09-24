import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const root=process.cwd();const require=createRequire(root+'/package.json');const express=require('express');
const {build}=require(root+'/frontend/node_modules/esbuild');
const bundle=await build({entryPoints:[root+'/functions/api/[[path]].js'],bundle:true,write:false,platform:'node',format:'esm'});
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const app=express();app.use('/api',async(req,res)=>{try{
if(req.method!=='GET') return res.status(405).json({error:'Preview is read-only'});
const request=new Request('http://127.0.0.1:4187'+req.originalUrl);
const response=await onRequest({request,env:{},params:{path:new URL(request.url).pathname.slice(5).split('/')}});
res.status(response.status);response.headers.forEach((v,k)=>res.set(k,v));res.send(Buffer.from(await response.arrayBuffer()));
}catch(e){res.status(500).json({error:e.message});}});
app.use(express.static(resolve(root,'frontend/dist')));app.get('*',(req,res)=>res.sendFile(resolve(root,'frontend/dist/index.html')));
app.listen(4187,'127.0.0.1',()=>console.log('Read-only preview http://127.0.0.1:4187'));
