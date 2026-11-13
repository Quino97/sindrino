import {loadContent, validateContent, escapeHTML as e, safeURL, DRAFT_KEY, BASE_KEY, templates} from './lib/content.js';
import { icon } from './lib/icons.js';
const $ = s => document.querySelector(s);
const sectionInfo = {
  site:['Home & contact','Homepage, brand voice, contact details, and social links.'],
  profile:['The athlete','Sindrino’s story, race results, goals, and gallery.'],
  coaching:['Coaching','Your philosophy, coaching process, and illustrative training week.'],
  team:['Athletes page','The introduction to your coached athletes and community.'],
  athletes:['Athlete profiles','Each athlete owns their achievements and goals. Add, edit, or reorder profiles here.'],
  journal:['Field notes page','The headline and introduction to your advice and ideas.'],
  articles:['Articles','Write training, nutrition, race preparation, and mindset notes. Turn off Published to keep a note out of the public site.'],
  pricing:['Pricing page','The introduction to your coaching options.'],
  plans:['Coaching plans','Edit prices, benefits, and the featured option. Confirm all offers before publishing.'],
  faqs:['Common questions','Help visitors understand what to expect.'],
  sponsors:['Partners','Use approved partner logos on transparent backgrounds.'],
  assets:['Photo library','Choose a supplied photo or copy its asset path into any image field.']
};
const names = {heroEyebrow:'Hero small heading',heroTitle:'Hero headline',heroDescription:'Hero introduction',heroImage:'Hero background',introEyebrow:'Introduction small heading',introTitle:'Introduction headline',introText:'Introduction text',introImage:'Introduction photo',manifestoTitle:'Community headline',manifestoText:'Community text',ctaTitle:'Closing invitation headline',ctaText:'Closing invitation text',footerText:'Footer line',contactIntro:'Contact page introduction',bio:'Biography / story',eyebrow:'Small heading',readTime:'Reading time',sampleWeek:'Illustrative training week',featured:'Feature this plan',published:'Published on the website',id:'Page ID',url:'Website link',link:'Result verification link',image:'Photo',logo:'Transparent logo',achievements:'Achievements',goals:'Goals',philosophy:'Coaching principles',steps:'How coaching works',gallery:'Photo gallery',paragraphs:'Article paragraphs',features:'What’s included',disciplines:'Disciplines'};
Object.assign(names,{benchmarks:'Running benchmarks',links:'Profile links',benchmarkTitle:'Benchmarks headline',benchmarkNote:'Benchmarks context / accuracy note',enquiryURL:'Official coaching enquiry form',draft:'Show proposed pricing notice',draftLabel:'Proposed pricing notice text'});
Object.assign(names,{placeholder:'Show as an unnamed coming-soon profile'});
const help = {id:'Unique lowercase words joined by hyphens. This becomes the page address.',email:'Your public enquiry address. Leaving this empty enables downloadable enquiries instead.',whatsapp:'Full HTTPS link, e.g. https://wa.me/27… (country code, no spaces).',price:'Display text, e.g. R850, R1,200, or On enquiry. No checkout or recurring billing is attached.',period:'Display text, e.g. per month or one-off consultation.',date:'Display date, e.g. 8 November 2026.',result:'Only publish a confirmed result. Add the official results link where available.',target:'A date, distance, or description of what the athlete is working towards.',status:'For example: In progress, Coming up, or Achieved.',credit:'Keep the photographer credit supplied with the image.',published:'Unpublished notes stay in the public JSON file but are hidden from the website. Do not use for confidential material.',headline:'Use a line break to control the headline layout.'};
let data, baseline, loaded, section='site', history=[], lastEditPath='', saveTimer, changed=false;
let token='', repo=null, remote=null, remoteSha='', connectionBaseline='', busy=false;
let photoIndex=[];
const clone = v => JSON.parse(JSON.stringify(v));
const canonical = v => JSON.stringify(v);
const label = key => names[key] || key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
const get = (path, root=data) => path.reduce((v,k)=>v[k],root);
function set(path,value) {const parent=get(path.slice(0,-1));parent[path.at(-1)]=value;}
function status(text,error=false) {$('#studio-status').textContent=text;$('#studio-status').classList.toggle('error',error);}
function ghStatus(text,error=false) {$('#github-status').textContent=text;$('#github-status').classList.toggle('error',error);}
function snapshot() {history.push(clone(data));if(history.length>35)history.shift();$('#undo').disabled=false;}
function updateDirty() {
  changed=canonical(data)!==canonical(baseline);
  $('#draft-badge').textContent=changed?'Draft changes':'Published content';
  $('#draft-badge').classList.toggle('dirty',changed);
}
function persist() {
  try {localStorage.setItem(DRAFT_KEY,JSON.stringify(data));localStorage.setItem(BASE_KEY,JSON.stringify(baseline));updateDirty();return true;}
  catch {status('Browser storage is unavailable or full. Export your content to keep a copy.',true);return false;}
}
function scheduleSave() {updateDirty();clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(persist())status('Draft saved on this device. Use Preview draft to review it.');},650);}
function encodePath(path) {return e(JSON.stringify(path));}
function decodePath(element) {return JSON.parse(element.dataset.path);}
function isImage(key) {return ['image','heroImage','introImage','manifestoImage','contactImage','logo'].includes(key);}
function fieldHTML(value,path,key) {
  const id='field-'+path.join('-');
  const common=`id="${e(id)}" data-field data-path="${encodePath(path)}"`;
  if(typeof value==='boolean')return `<label class="editor-field checkbox-field" for="${e(id)}"><input ${common} type="checkbox"${value?' checked':''}>${e(label(key))}</label>`;
  const long = /text|description|intro$|bio|headline|title|answer|excerpt|message/i.test(key)&&!['name','readTime','eyebrow'].includes(key);
  const wide = long||isImage(key)||['instagram','strava','whatsapp','email','url','link'].includes(key);
  const control = long?`<textarea ${common} rows="${String(value).length>230?'5':'3'}">${e(value)}</textarea>`:`<input ${common} value="${e(value)}" type="${key==='email'?'email':'text'}"${key==='id'?' spellcheck="false"':''}>`;
  const imageUI=isImage(key)?`<span class="field-help">Use a supplied photo, an assets/ path, or an HTTPS image URL.</span><span class="asset-picker"><button type="button" data-pick-image data-path="${encodePath(path)}">Choose from photo library ${icon("arrowUpRight")}</button></span>${safeURL(value,{image:true})?`<img class="field-preview${key==='logo'?' logo-preview':''}" src="${e(safeURL(value,{image:true}))}" alt="Selected image preview">`:''}`:'';
  return `<label class="editor-field${wide?' full-field':''}" for="${e(id)}"><span>${e(label(key))}</span>${control}${help[key]?`<span class="field-help">${e(help[key])}</span>`:''}${imageUI}</label>`;
}
function objectHTML(object,path) {
  let scalar='', nested='';
  for(const [key,value] of Object.entries(object)) {
    if(typeof value==='string'||typeof value==='number'||typeof value==='boolean')scalar+=fieldHTML(value,[...path,key],key);
    else if(Array.isArray(value))nested+=arrayHTML(value,[...path,key],key);
  }
  return `<div class="editor-grid">${scalar}${nested}</div>`;
}
function itemTitle(item,i) {return typeof item==='string'?`Item ${i+1}`:item.name||item.title||item.label||item.question||item.event||item.caption||item.day||`Item ${i+1}`;}
function arrayHTML(array,path,key) {
  return `<section class="nested-section"><div class="nested-heading"><h3>${e(label(key))}</h3><span>${array.length} ${array.length===1?'entry':'entries'}</span></div>${array.length?array.map((item,i)=>{
    const itemPath=[...path,i];
    if(typeof item==='string')return `<div class="string-row">${fieldHTML(item,itemPath,'item')}<button type="button" class="studio-button" data-action="up" data-path="${encodePath(itemPath)}"${i===0?' disabled':''} aria-label="Move item ${i+1} up">${icon("arrowUp")}</button><button type="button" class="studio-button" data-action="remove" data-path="${encodePath(itemPath)}" aria-label="Remove item ${i+1}">×</button></div>`;
    return `<details class="collection-item" data-item-path="${encodePath(itemPath)}"><summary><span>${String(i+1).padStart(2,'0')}</span><span data-item-title>${e(itemTitle(item,i))}</span><span>${icon("chevronDown")}</span></summary><div class="item-fields">${objectHTML(item,itemPath)}</div><div class="item-actions"><button type="button" class="studio-button" data-action="up" data-path="${encodePath(itemPath)}"${i===0?' disabled':''}>${icon("arrowUp")} Move up</button><button type="button" class="studio-button" data-action="down" data-path="${encodePath(itemPath)}"${i===array.length-1?' disabled':''}>${icon("arrowDown")} Move down</button><button type="button" class="studio-button remove" data-action="remove" data-path="${encodePath(itemPath)}">Remove ${e(label(key).replace(/s$/,''))}</button></div></details>`;
  }).join(''):`<p class="empty-collection">No ${e(label(key).toLowerCase())} yet. Add your first entry when it’s ready.</p>`}<button type="button" class="studio-button" data-action="add" data-path="${encodePath(path)}">+ Add ${e(label(key).replace(/s$/,''))}</button></section>`;
}
function photoTiles(pickerPath=null) {
  return `<div class="asset-gallery">${photoIndex.map((p,i)=>`<button class="asset-tile" type="button" ${pickerPath?`data-choose-image="assets/${e(p.file)}" data-path="${encodePath(pickerPath)}"`:`data-copy-path="assets/${e(p.file)}"`}><img src="assets/${e(p.file)}" alt="Supplied running photo ${i+1}" loading="lazy"><div><strong>Photo ${String(i+1).padStart(2,'0')}</strong><span>${e(p.source.split('/').slice(1).join(' / '))}</span><br><span class="asset-path">assets/${e(p.file)}</span></div></button>`).join('')}</div>`;
}
function renderNav() {$('#editor-nav').innerHTML=Object.entries(sectionInfo).map(([key,[name]])=>`<button data-section="${key}" class="${key===section?'active':''}"${key===section?' aria-current="page"':''}>${name}${Array.isArray(data[key])?`<span>${data[key].length}</span>`:''}</button>`).join('');}
function renderEditor() {
  const [title,description]=sectionInfo[section];
  $('#editor-title').textContent=title+'.';$('#editor-description').textContent=description;
  renderNav();
  if(section==='assets') {$('#editor').innerHTML='<p class="asset-guide">Select a photo to copy its path. Photographer credits remain in the photo index; keep them with your public images. Add new local images to assets/photos in GitHub, or use an HTTPS image URL.</p>'+photoTiles();return;}
  const tips={profile:'Publish confirmed results only. Each race highlight can include a link to official results.',athletes:'One athlete = one parent profile. Open the athlete to edit their own achievements and goals. Use IDs that won’t change when a name changes.',articles:'These starter notes are proposed editorial copy. Review them in Sindrino’s voice before launch. “Unpublished” hides a note in the interface; the JSON remains public.',plans:'These are proposed coaching options. Set your confirmed prices, scope, and terms before launch.',site:'Add an email address to enable prepared email enquiries. Social links only appear when filled in.'};
  $('#editor').innerHTML=(tips[section]?`<p class="section-tip">${e(tips[section])}</p>`:'')+`<div class="editor-section">${Array.isArray(data[section])?arrayHTML(data[section],[section],section):objectHTML(data[section],[section])}</div>`;
  $('#undo').disabled=!history.length;
}
function rememberOpen() {return [...document.querySelectorAll('.collection-item[open]')].map(x=>x.dataset.itemPath);}
function restoreOpen(paths) {for(const d of document.querySelectorAll('.collection-item'))if(paths.includes(d.dataset.itemPath))d.open=true;}
async function ask(message,accept='Continue') {
  $('#confirm-message').textContent=message;$('#confirm-accept').textContent=accept;const dialog=$('#confirm-dialog');dialog.showModal();
  return new Promise(resolve=>{
    const yes=()=>{cleanup();dialog.close();resolve(true);};const no=()=>{cleanup();dialog.close();resolve(false);};
    const cleanup=()=>{$('#confirm-accept').removeEventListener('click',yes);$('#confirm-cancel').removeEventListener('click',no);dialog.removeEventListener('cancel',no);};
    $('#confirm-accept').addEventListener('click',yes);$('#confirm-cancel').addEventListener('click',no);dialog.addEventListener('cancel',no);
  });
}
function getTemplate(path,array) {
  const key=path.at(-1);if(templates[key])return templates[key]();
  return array.length?typeof array[0]==='string'?'':clone(array[0]):'';
}
async function collectionAction(button) {
  const path=decodePath(button),action=button.dataset.action;
  const open=rememberOpen();
  if(action==='add') {
    snapshot();const array=get(path);array.push(getTemplate(path,array));
    renderEditor();restoreOpen(open);
    const newPath=JSON.stringify([...path,array.length-1]);
    const details=[...document.querySelectorAll('.collection-item')].find(d=>d.dataset.itemPath===newPath);if(details){details.open=true;details.scrollIntoView({block:'center',behavior:'smooth'});}
  } else {
    const parent=get(path.slice(0,-1)),index=path.at(-1);
    if(action==='remove'&&!await ask('Remove this entry from your draft? You can use Undo to bring it back.','Remove entry'))return;
    snapshot();
    if(action==='remove')parent.splice(index,1);
    if(action==='up'&&index>0)[parent[index-1],parent[index]]=[parent[index],parent[index-1]];
    if(action==='down'&&index<parent.length-1)[parent[index+1],parent[index]]=[parent[index],parent[index+1]];
    renderEditor();restoreOpen(open);
  }
  lastEditPath='';persist();status('Draft updated and saved on this device.');
}
function downloadJSON() {const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='content.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Exported content.json. Upload it into the repository’s data folder to publish manually.');}
async function chooseImage(path) {
  const dialog=document.createElement('dialog');dialog.className='asset-choice';dialog.innerHTML='<h2>Find the right moment.</h2><p>Choose a supplied photo for this section.</p>'+photoTiles(path)+'<button class="studio-button" data-close>Back to editor</button>';
  document.body.append(dialog);
  dialog.addEventListener('click',ev=>{
    const button=ev.target.closest('[data-choose-image]');
    if(button){snapshot();set(path,button.dataset.chooseImage);const open=rememberOpen();renderEditor();restoreOpen(open);persist();dialog.close();}
    if(ev.target.closest('[data-close]'))dialog.close();
  });
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
}
function endpoint() {return `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/contents/data/content.json`;}
async function api(url,options={}) {
  const response=await fetch(url,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28',...(options.body?{'Content-Type':'application/json'}:{}),...options.headers},cache:'no-store'});
  if(!response.ok){
    if(response.status===401)throw new Error('GitHub could not authenticate this token. Check its value and expiry.');
    if(response.status===403)throw new Error('GitHub denied access. Check repository permissions, organisation approval, or API rate limits.');
    if(response.status===404)throw new Error('Repository content not found. Push the initial site first, then check the owner, repository, branch, and token access.');
    if(response.status===409||response.status===422)throw new Error('The repository changed, or GitHub rejected the update. Reconnect and load current content before trying again.');
    throw new Error(`GitHub returned ${response.status}. Your local draft is safe; try again later.`);
  }
  return response.json();
}
function fromBase64(text) {return new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g,'')),c=>c.charCodeAt(0)));}
function toBase64(text) {let binary='';for(const byte of new TextEncoder().encode(text))binary+=String.fromCharCode(byte);return btoa(binary);}
async function getRemote() {
  const file=await api(endpoint()+`?ref=${encodeURIComponent(repo.branch)}`);
  const result=JSON.parse(fromBase64(file.content));const errors=validateContent(result);
  if(errors.length)throw new Error(`Repository content needs attention: ${errors[0]}`);
  return {data:result,sha:file.sha};
}
function setBusy(value){busy=value;$('#connect').disabled=value;$('#publish').disabled=value||!remoteSha||connectionBaseline!==canonical(baseline);$('#load-remote').disabled=value||!remote;}
function disconnect(){token='';repo=null;remote=null;remoteSha='';connectionBaseline='';$('#gh-token').value='';$('#disconnect').hidden=true;$('#workflow-link').hidden=true;$('#github-status').textContent='Disconnected. No token is retained.';setBusy(false);}
async function connect() {
  try {
    if(!$('#gh-token').value.trim()){ghStatus('Enter a GitHub token with access to this repository.',true);return;}
    token=$('#gh-token').value.trim();$('#gh-token').value='';
    repo={owner:$('#gh-owner').value.trim(),name:$('#gh-repo').value.trim(),branch:$('#gh-branch').value.trim()};
    if(!/^[a-z0-9-]+$/i.test(repo.owner)||!/^[a-z0-9_.-]+$/i.test(repo.name)||!repo.branch)throw new Error('Enter a valid owner, repository name, and branch.');
    setBusy(true);ghStatus('Connecting to GitHub and checking the current content…');
    const repository=await api(`https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`);
    if(!repository.permissions?.push)throw new Error('This token does not have write access to the repository. Give it Contents: read and write for this repository.');
    const latest=await getRemote();remote=latest.data;remoteSha=latest.sha;connectionBaseline=canonical(remote);
    $('#disconnect').hidden=false;
    $('#workflow-link').href=`https://github.com/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/actions`;
    if(connectionBaseline!==canonical(baseline))ghStatus('Connected. The repository has newer or different content. Export your draft as a backup, then choose Load repository content before editing or publishing.',true);
    else ghStatus('Connected. Your draft is ready to publish when you are. GitHub still enforces the token’s write permissions and any branch rules.');
  } catch(err){token='';remoteSha='';connectionBaseline='';ghStatus(err.message,true);}
  finally{setBusy(false);}
}
async function loadRemote() {
  if(!await ask('Replace the current draft with the latest repository content? Export your draft first if you want to keep a separate copy. Undo is available after loading.','Load repository content'))return;
  try{setBusy(true);const latest=await getRemote();snapshot();data=clone(latest.data);baseline=clone(latest.data);loaded=clone(latest.data);remote=latest.data;remoteSha=latest.sha;connectionBaseline=canonical(baseline);persist();renderEditor();status('Loaded the repository content. Your local draft now matches it.');ghStatus('Repository content loaded. You can edit and publish.');}
  catch(err){ghStatus(err.message,true);}finally{setBusy(false);}
}
async function publish() {
  const errors=validateContent(data);if(errors.length){status('Please fix these before publishing:\n'+errors.join('\n'),true);return;}
  if(!token||!repo||!remoteSha||busy)return;
  if(canonical(data)===canonical(baseline)){ghStatus('There are no content changes to publish.');return;}
  if(!await ask(`Publish this draft to ${repo.owner}/${repo.name} on ${repo.branch}? This updates the public website after the GitHub Pages deployment completes.`,'Publish content'))return;
  try {
    setBusy(true);ghStatus('Checking for changes made by another editor…');
    const latest=await getRemote();
    if(latest.sha!==remoteSha)throw new Error('Someone changed the repository since you connected. Your draft has been kept. Export it, then load repository content and reconcile the edits before publishing.');
    ghStatus('Committing your content to GitHub…');
    const result=await api(endpoint(),{method:'PUT',body:JSON.stringify({message:'Update Sindrino website content',content:toBase64(JSON.stringify(data,null,2)+'\n'),sha:remoteSha,branch:repo.branch})});
    remoteSha=result.content.sha;remote=clone(data);baseline=clone(data);loaded=clone(data);connectionBaseline=canonical(baseline);persist();history=[];$('#undo').disabled=true;
    $('#workflow-link').hidden=false;ghStatus('Content committed. GitHub Pages will update after the workflow succeeds. View the deployment below.');status('Published to the repository. The live site may take a few minutes to update.');
  } catch(err){ghStatus(err.message,true);}finally{setBusy(false);}
}
async function init(){
  loaded=await loadContent();baseline=clone(loaded);data=clone(loaded);
  try{
    const saved=localStorage.getItem(DRAFT_KEY),base=localStorage.getItem(BASE_KEY);
    if(saved){
      const draft=JSON.parse(saved), savedBase=base?JSON.parse(base):null;
      if(draft.schemaVersion===1&&draft.site&&Array.isArray(draft.athletes)){
        if(savedBase&&canonical(draft)===canonical(savedBase)&&canonical(savedBase)!==canonical(loaded)){
          status('Loaded the latest website content. Your previous saved draft had no changes.');
          persist();
        }else{
          data=draft;if(savedBase)baseline=savedBase;
          status('Restored your saved draft from this device.');
        }
      }
    }
  }catch{status('A previous draft could not be restored. Published content has been loaded.',true);}
  try{const res=await fetch('./assets/photo-credits.json');if(res.ok)photoIndex=await res.json();}catch{ /* Direct asset paths remain available. */ }
  renderEditor();updateDirty();
  $('#editor-nav').addEventListener('click',ev=>{const b=ev.target.closest('[data-section]');if(b){section=b.dataset.section;lastEditPath='';renderEditor();status('');}});
  $('#editor').addEventListener('input',ev=>{
    const field=ev.target.closest('[data-field]');if(!field)return;
    if(lastEditPath!==field.dataset.path){snapshot();lastEditPath=field.dataset.path;}
    const path=decodePath(field);set(path,field.type==='checkbox'?field.checked:field.value);
    if(['name','title','question','event','caption'].includes(path.at(-1))) {
      const details=field.closest('.collection-item');if(details){const title=details.querySelector(':scope>summary [data-item-title]');if(title)title.textContent=itemTitle(get(JSON.parse(details.dataset.itemPath)),0);}
    }
    scheduleSave();
  });
  $('#editor').addEventListener('change',()=>{lastEditPath='';});
  $('#editor').addEventListener('click',async ev=>{
    const action=ev.target.closest('[data-action]');if(action)await collectionAction(action);
    const picker=ev.target.closest('[data-pick-image]');if(picker){ev.preventDefault();await chooseImage(decodePath(picker));}
    const copy=ev.target.closest('[data-copy-path]');if(copy){try{await navigator.clipboard.writeText(copy.dataset.copyPath);status('Copied '+copy.dataset.copyPath);}catch{status('Photo path: '+copy.dataset.copyPath);}}
  });
  $('#save-draft').addEventListener('click',()=>{clearTimeout(saveTimer);const errors=validateContent(data);persist();status(errors.length?'Draft saved. Before previewing or publishing, fix:\n'+errors.join('\n'):'Draft saved on this device. Open Preview draft to see the changes.',!!errors.length);});
  $('#undo').addEventListener('click',()=>{if(!history.length)return;data=history.pop();lastEditPath='';persist();renderEditor();status('Restored the previous edit.');setBusy(false);});
  $('#export').addEventListener('click',downloadJSON);
  $('#import').addEventListener('change',async ev=>{
    try{const file=ev.target.files[0];if(!file)return;if(file.size>2e6)throw new Error('Choose a content JSON file under 2 MB.');const parsed=JSON.parse(await file.text());const errors=validateContent(parsed);if(errors.length)throw new Error(errors.join('\n'));if(!await ask('Replace your draft with this imported content file? Your current draft can be restored with Undo.','Import content'))return;snapshot();data=parsed;persist();renderEditor();status('Imported your content file as a local draft.');}
    catch(err){status('Import failed: '+err.message,true);}finally{ev.target.value='';}
  });
  $('#reset').addEventListener('click',async()=>{if(!await ask('Reset the draft to the content most recently loaded from the website or repository? Undo is available.','Reset draft'))return;snapshot();data=clone(loaded);baseline=clone(loaded);persist();renderEditor();status('Draft reset.');setBusy(false);});
  $('#connect').addEventListener('click',connect);$('#load-remote').addEventListener('click',loadRemote);$('#publish').addEventListener('click',publish);$('#disconnect').addEventListener('click',disconnect);
  for(const id of ['gh-owner','gh-repo','gh-branch'])$('#'+id).addEventListener('input',()=>{if(token)disconnect();});
  addEventListener('pagehide',()=>{clearTimeout(saveTimer);persist();token='';});
}
init().catch(err=>{status(err.message,true);$('#editor').textContent='The editor could not load. Serve this folder over HTTP using npm run dev, then try again.';});
