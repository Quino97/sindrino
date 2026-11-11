import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf','.woff2':'font/woff2','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    let requested=decodeURIComponent(url.pathname);
    // Preview the repository subpath too, just as GitHub Pages will serve it.
    if(requested.startsWith('/sindrino/'))requested=requested.slice('/sindrino'.length);
    if(requested.split('/').some(p=>p.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
    const filename=path.resolve(root,'.'+requested+(requested.endsWith('/')?'index.html':''));
    if(!filename.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}
    if(!(await stat(filename)).isFile())throw new Error('Not a file');
    const bytes=await readFile(filename);
    res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(bytes);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Page not found');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://localhost:4173\nGitHub Pages path preview: http://localhost:4173/sindrino/'));
