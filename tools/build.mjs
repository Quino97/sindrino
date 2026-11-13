import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const dist=path.join(root,'dist');
await mkdir(dist,{recursive:true});
for(const file of ['index.html','admin.html','404.html','styles.css','refinements.css','admin.css','app.js','admin.js','lib','assets','data'])await cp(path.join(root,file),path.join(dist,file),{recursive:true});
await writeFile(path.join(dist,'.nojekyll'),'');
// The help link in the editor also works on the deployed static site.
await cp(path.join(root,'README.md'),path.join(dist,'README.md'));
console.log('Built GitHub Pages site in dist/ (no dependencies).');
