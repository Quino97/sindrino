import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRepository,toBase64,fromBase64} from '../lib/github.js';
import {googleFormEmbed} from '../lib/forms.js';
import {validateContent,templates} from '../lib/content.js';
const content=JSON.parse(await readFile(new URL('../data/content.json',import.meta.url),'utf8'));
const options={owner:'Quino97',repo:'sindrino',branch:'main',token:'test-only'};
function mock({changed=false,rejectRef=false}={}){
  const calls=[];
  const request=async(url,init)=>{
    const path=new URL(url).pathname.replace('/repos/Quino97/sindrino','');
    const body=init.body?JSON.parse(init.body):null;calls.push({path,body,method:init.method||'GET'});
    let data={};let status=200;
    if(path==='/git/ref/heads/main')data={object:{sha:'head'}};
    if(path==='/contents/data/content.json')data={sha:changed?'new-content':'old-content',content:toBase64(JSON.stringify(content))};
    if(path==='/git/commits/head')data={tree:{sha:'base-tree'}};
    if(path==='/git/blobs')data={sha:'image-blob'};
    if(path==='/git/trees')data={sha:'next-tree'};
    if(path==='/git/commits'&&init.method==='POST')data={sha:'next-commit'};
    if(path==='/git/refs/heads/main'&&rejectRef)status=422;
    return new Response(JSON.stringify(data),{status});
  };return {calls,request};
}
test('Google embed uses only the official viewform endpoint and keeps submissions with Google',()=>{
  assert.equal(googleFormEmbed(content.site.enquiryURL),content.site.enquiryURL+'?embedded=true');
  for(const bad of ['javascript:alert(1)','https://evil.example/forms/d/test/viewform','https://docs.google.com/other','http://docs.google.com/forms/d/e/test/viewform'])assert.equal(googleFormEmbed(bad),'');
});
test('Publishing commits uploaded images and content atomically without forcing the branch',async()=>{
  const m=mock();const repo=createRepository(options,m.request);
  await repo.publish(content,'old-content',[{path:'assets/uploads/portrait-abcd1234.webp',bytes:new Uint8Array([1,2,3]).buffer}]);
  const tree=m.calls.find(c=>c.path==='/git/trees').body;
  assert.equal(tree.base_tree,'base-tree');assert.equal(tree.tree[0].sha,'image-blob');
  assert.deepEqual(JSON.parse(tree.tree[1].content),content);
  assert.deepEqual(m.calls.find(c=>c.method==='PATCH').body,{sha:'next-commit',force:false});
  assert.equal(m.calls.filter(c=>c.path==='/git/commits'&&c.method==='POST').length,1);
});
test('Stale content is rejected before uploading or committing anything',async()=>{
  const m=mock({changed:true});await assert.rejects(createRepository(options,m.request).publish(content,'old-content'),/changed since/);
  assert.equal(m.calls.filter(c=>c.method!=='GET').length,0);
});
test('A concurrent branch update is reported rather than overwritten',async()=>{
  const m=mock({rejectRef:true});await assert.rejects(createRepository(options,m.request).publish(content,'old-content'),/repository changed/);
  assert.equal(m.calls.find(c=>c.method==='PATCH').body.force,false);
});
test('New editable photo and testimonial fields are independent per athlete',()=>{
  const a=templates.athletes(),b=templates.athletes();
  a.testimonial='My own words';a.testimonialApproved=true;a.photoApproved=true;a.goals.push(templates.goals());
  assert.equal(b.testimonial,'');assert.equal(b.testimonialApproved,false);assert.equal(b.photoApproved,false);assert.equal(b.goals.length,0);
  const copy=structuredClone(content);copy.profile.photographerURL='javascript:alert(1)';assert.ok(validateContent(copy).length);
});
test('Text and image payloads preserve Unicode and binary bytes',()=>{
  assert.equal(fromBase64(toBase64('Sindrino · Let’s run 🏔')),'Sindrino · Let’s run 🏔');
  assert.equal(toBase64(new Uint8Array([0,127,255]).buffer),'AH//');
});
