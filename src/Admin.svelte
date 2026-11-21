<script>
  import { onMount } from 'svelte';
  import { loadContent, validateContent, DRAFT_KEY, BASE_KEY } from '../lib/content.js';
  import { saveImage, allImages, clearImages } from '../lib/media.js';
  import { createRepository } from '../lib/github.js';
  import Fields from './components/Fields.svelte';
  import Photo from './components/Photo.svelte';
  import Modal from './components/Modal.svelte';
  const sections = {site:'Home, brand & contact',profile:'The Athlete',coaching:'Coaching',team:'My Athletes page',athletes:'Athlete profiles',journal:'Field notes page',articles:'Articles',pricing:'Pricing introduction',plans:'Coaching plans',faqs:'Common questions',sponsors:'Sponsor slider',ui:'All section text & labels'};
  let data = $state(null), baseline = $state(null), loaded, section = $state('site'), status = $state(''), error = $state(false), history = $state([]), photos = $state([]), picker = $state(null), queued = $state(0);
  let owner = $state('Quino97'), repo = $state('sindrino'), branch = $state('main'), tokenInput = $state(''), connection = $state(null), remoteSHA = $state(''), remoteData = $state(null), busy = $state(false), githubStatus = $state('Connect when you are ready to publish.'), confirmation = $state(null);
  const dirty = $derived(data && JSON.stringify(data) !== JSON.stringify(baseline));
  const compatible = $derived(remoteData && JSON.stringify(remoteData) === JSON.stringify(baseline));
  let saveTimer, historyTimer;
  const clone = value => JSON.parse(JSON.stringify(value));
  function notify(message, failed = false) {status = message;error = failed;}
  function persist() {
    try {localStorage.setItem(DRAFT_KEY,JSON.stringify(data));localStorage.setItem(BASE_KEY,JSON.stringify(baseline));return true;}
    catch {notify('Device storage is full or unavailable. Export a backup before closing this page.',true);return false;}
  }
  function snapshot() {history = [...history.slice(-29),clone(data)];}
  function change(path,value) {
    if(!historyTimer) snapshot(); clearTimeout(historyTimer); historyTimer = setTimeout(() => historyTimer = null,700);
    const next = clone(data), parent = path.slice(0,-1).reduce((v,k)=>v[k],next); parent[path.at(-1)] = value; data = next;
    clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(persist())notify('Draft saved on this device. Preview it before publishing.');},500);
  }
  function ask(message,action) { confirmation = {message,action}; }
  function undo() {if(!history.length)return;data=history.at(-1);history=history.slice(0,-1);persist();notify('Previous edit restored.');}
  function download(filename,body,type='application/json') {const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function exportContent() {persist();download('sindrino-content.json',JSON.stringify(data,null,2));notify('Content exported. Uploaded images are stored separately; use Export uploaded images to back them up too.');}
  async function exportImages() {const files=await allImages();for(const file of files)download(file.path.split('/').at(-1),file.bytes,file.type);notify(`Exported ${files.length} image files. Keep these with your content backup.`);}
  async function importContent(event) {
    try {const file=event.currentTarget.files?.[0];if(!file)return;const parsed=JSON.parse(await file.text());const errors=validateContent(parsed);if(errors.length)throw new Error(errors.join('\n'));ask('Replace your current draft with this content file?',()=>{snapshot();data=parsed;persist();notify('Imported as a local draft.');});}
    catch(e){notify(e.message,true);}finally{event.currentTarget.value='';}
  }
  async function upload(path,file) {try{const imagePath=await saveImage(file);change(path,imagePath);queued=(await allImages()).length;photos=[...photos,{file:imagePath.replace(/^assets\//,''),source:file.name}];notify('Image saved in your local draft. Preview it, then publish to add it to the website.');}catch(e){notify(e.message,true);}}
  async function connect() {
    busy=true;
    try{const client=createRepository({owner,repo,branch,token:tokenInput.trim()});tokenInput='';const remote=await client.connect();connection=client;remoteSHA=remote.sha;remoteData=remote.data;githubStatus=JSON.stringify(remote.data)===JSON.stringify(baseline)?'Connected. Ready to publish.':'Connected. Website content has changed. Export your draft, then load the latest content before publishing.';}
    catch(e){connection=null;remoteSHA='';githubStatus=e.message;tokenInput='';}finally{busy=false;}
  }
  function disconnect(){connection=null;remoteSHA='';remoteData=null;tokenInput='';githubStatus='Disconnected. No token is retained.';}
  async function loadRemote(){try{busy=true;const latest=await connection.load();snapshot();data=clone(latest.data);baseline=clone(latest.data);loaded=clone(latest.data);remoteData=latest.data;remoteSHA=latest.sha;persist();githubStatus='Latest content loaded. Ready to edit.';}catch(e){githubStatus=e.message;}finally{busy=false;}}
  async function publish(){
    busy=true;
    try{
      const publishingData=clone(data), client=connection;
      const errors=validateContent(publishingData);if(errors.length)throw new Error(errors.join('\n'));
      persist();const images=await allImages();const json=JSON.stringify(publishingData);const referenced=images.filter(image=>json.includes(image.path));
      githubStatus='Publishing your content and images together…';
      const result=await client.publish(publishingData,remoteSHA,referenced);
      remoteSHA=result.sha;remoteData=clone(result.data);baseline=clone(result.data);loaded=clone(result.data);history=[];persist();
      // Retain the local media cache until the deployment is available, so previews keep working.
      queued=images.length;githubStatus='Published to GitHub. The website updates when the Pages deployment finishes.';notify('Content and images committed together. View deployment progress below.');
    }catch(e){githubStatus=e.message;notify(e.message,true);}finally{busy=false;}
  }
  onMount(()=>{
    (async()=>{try{
      loaded=await loadContent();baseline=clone(loaded);data=clone(loaded);
      try{const saved=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null'),base=JSON.parse(localStorage.getItem(BASE_KEY)||'null');
        if(saved && validateContent(saved).length===0 && base && validateContent(base).length===0 && JSON.stringify(saved)!==JSON.stringify(base)){data=saved;baseline=base;notify('Restored your saved draft.');}
      }catch{notify('Loaded published content. An older draft could not be restored.',true);}
      const response=await fetch('./assets/photo-credits.json');if(response.ok)photos=await response.json();
      const uploads=await allImages();queued=uploads.length;photos=[...photos,...uploads.map(f=>({file:f.path.replace(/^assets\//,''),source:'Local upload'})),...data.sponsors.map(s=>({file:s.logo.replace(/^assets\//,''),source:s.name}))];
    }catch(e){notify(e.message,true);}})();
    const save=()=>{if(data)persist();};window.addEventListener('pagehide',save);
    return()=>{clearTimeout(saveTimer);clearTimeout(historyTimer);window.removeEventListener('pagehide',save);connection=null;};
  });
</script>
<svelte:head><title>Sindrino | Content studio</title></svelte:head>
<header class="admin-header"><a class="name-logo" href="./"><strong>Sindrino Matthews</strong><small>Content studio</small></a><a class="under-link" href="./?preview=1" target="_blank" rel="noopener">Preview draft</a></header>
{#if data}<div class="admin-layout"><aside class="admin-sidebar"><p class="eyebrow">YOUR WEBSITE</p><nav aria-label="Editor sections">{#each Object.entries(sections) as [key,label]}<button class:active={section===key} onclick={()=>section=key}>{label}</button>{/each}</nav><p class="editor-note">All page copy, button labels, images and partner logos are editable here. Drafts stay on this device until you publish.</p></aside><main class="admin-main">
  <div class="admin-title"><div><p class="eyebrow">SINDRINO CONTENT STUDIO</p><h1>{sections[section]}</h1></div><span class="draft-state">{dirty?'Draft changes':'Published content'}</span></div>
  <div class="admin-toolbar"><button onclick={()=>{persist();notify('Draft saved on this device.');}}>Save draft</button><button disabled={!history.length} onclick={undo}>Undo</button><button onclick={exportContent}>Export content</button><label class="upload-label">Import content<input type="file" class="sr-only" accept="application/json" onchange={importContent}/></label><button onclick={()=>ask('Reset your draft to the latest content loaded from the website?',()=>{snapshot();data=clone(loaded);baseline=clone(loaded);persist();notify('Draft reset.');})}>Reset draft</button></div>
  <p class:error class="studio-status" role="status">{status}</p>
  {#if section==='athletes'}<p class="section-tip">Each athlete has their own profile, results, times, goals, photo and optional testimonial. Publish photos and quotes only after confirming the athlete’s permission. Eric’s photo and quote still need to be supplied.</p>{:else if section==='ui'}<p class="section-tip">Edit the smaller headings, navigation, button text, footer and privacy wording. Main page content lives in the other sections.</p>{:else if section==='sponsors'}<p class="section-tip">Add, remove or reorder partners below. Choose or upload their transparent logo, then set the destination link.</p>{/if}
  <section class="admin-editor" aria-label={sections[section]}>{#key section}<Fields value={data[section]} path={[section]} {change} choose={path=>picker=path} {upload} confirmRemove={action=>ask('Remove this entry from your draft? You can restore it with Undo.',action)}/>{/key}</section>
  <section class="media-backup"><h2>Uploaded images</h2><p>{queued} images stored on this device. Referenced uploads publish together with your content. Export them if you need a separate backup.</p><button onclick={exportImages}>Export uploaded images</button><button onclick={()=>ask('Clear the local image cache? Export a backup first. Only clear it after the live deployment has finished.',async()=>{await clearImages((await allImages()).map(f=>f.path));queued=0;notify('Local image cache cleared.');})}>Clear image cache</button></section>
  <section class="publish-panel"><p class="eyebrow">MAKE IT LIVE</p><h2>Publish your next chapter.</h2><p>Connect with a GitHub fine-grained token for this repository. Give it Contents: read and write. The token stays in memory for this page session.</p><div class="github-fields"><label>Owner<input bind:value={owner} oninput={disconnect}/></label><label>Repository<input bind:value={repo} oninput={disconnect}/></label><label>Branch<input bind:value={branch} oninput={disconnect}/></label><label class="token-field">GitHub access token<input type="password" bind:value={tokenInput} autocomplete="off"/></label></div><div class="github-actions"><button class="button" disabled={busy||!tokenInput.trim()} onclick={connect}>Connect to GitHub</button>{#if connection}<button disabled={busy} onclick={disconnect}>Disconnect</button><button disabled={busy} onclick={()=>ask('Load the latest repository content? Export your current draft first if you need to keep it.',loadRemote)}>Load latest content</button><button class="button" disabled={busy||!dirty||!compatible} onclick={()=>ask('Publish this draft and its uploaded images to the public website?',publish)}>Publish website</button>{/if}</div><p class="studio-status" role="status">{githubStatus}</p><a class="under-link" href={'https://github.com/'+encodeURIComponent(owner)+'/'+encodeURIComponent(repo)+'/actions'} target="_blank" rel="noopener noreferrer">View deployment progress</a></section>
  </main></div>
{:else}<main class="loading"><h1>Content studio</h1><p role="status">{status||'Loading your website…'}</p></main>{/if}
{#if picker}<Modal titleId="image-dialog-title" close={()=>picker=null}><div class="dialog-heading"><h2 id="image-dialog-title">Find the right moment.</h2><button onclick={()=>picker=null}>Close library</button></div><div class="photo-library">{#each photos as photo}<button onclick={()=>{change(picker,'assets/'+photo.file);picker=null;}}><Photo src={'assets/'+photo.file} alt={photo.source}/><span>{photo.source}</span></button>{/each}</div></Modal>{/if}
{#if confirmation}<Modal titleId="confirmation-title" compact close={()=>confirmation=null}><h2 id="confirmation-title">Review this change.</h2><p>{confirmation.message}</p><div class="github-actions"><button onclick={()=>confirmation=null}>Cancel</button><button class="button" onclick={()=>{const action=confirmation.action;confirmation=null;action();}}>Continue</button></div></Modal>{/if}
