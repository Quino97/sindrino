import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {validateContent} from '../lib/content.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=JSON.parse(await readFile(path.join(root,'data/content.json'),'utf8'));
const errors=validateContent(data);
if(errors.length)throw new Error(errors.join('\n'));
const references=[];
function scan(v){if(Array.isArray(v))v.forEach(scan);else if(v&&typeof v==='object')Object.values(v).forEach(scan);else if(typeof v==='string'&&v.startsWith('assets/'))references.push(v);}
scan(data);
for(const p of references)await access(path.join(root,p));
for(const file of ['index.html','admin.html']){
  const text=await readFile(path.join(root,file),'utf8');
  for(const match of text.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g))await access(path.join(root,match[1]));
}
console.log(`Content valid. Verified ${references.length} content asset references and HTML entry points.`);
