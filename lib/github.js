import { validateContent } from './content.js';
export function toBase64(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = ''; for(let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i,i+32768));
  return btoa(binary);
}
export function fromBase64(value) { return new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')),c => c.charCodeAt(0))); }
export function createRepository({owner, repo, branch, token}, request = fetch) {
  if(!/^[a-z0-9-]+$/i.test(owner) || !/^[a-z0-9_.-]+$/i.test(repo) || !/^[a-z0-9_.\/-]+$/i.test(branch)) throw new Error('Check the repository owner, name and branch.');
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  async function api(path, options = {}) {
    const response = await request(base + path, {...options, headers:{Accept:'application/vnd.github+json', Authorization:`Bearer ${token}`, 'X-GitHub-Api-Version':'2022-11-28', ...(options.body ? {'Content-Type':'application/json'} : {})},cache:'no-store'});
    if(!response.ok) {
      if(response.status === 401) throw new Error('GitHub could not authenticate this token. Check its value and expiry.');
      if(response.status === 403 || response.status === 404) throw new Error('GitHub denied access. Check repository write access. Collaborators on a shared public repository need a classic token with public_repo; repository owners may use a fine-grained token with Contents: read and write.');
      if([409,422].includes(response.status)) throw new Error('The repository changed while publishing. Your draft is safe. Load the latest content and reconcile your edits.');
      throw new Error(`GitHub returned ${response.status}. Your draft is safe; try again later.`);
    }
    return response.json();
  }
  async function load(ref = branch) {
    const file = await api(`/contents/data/content.json?ref=${encodeURIComponent(ref)}`);
    const data = JSON.parse(fromBase64(file.content));
    const errors = validateContent(data); if(errors.length) throw new Error(`Repository content needs attention: ${errors[0]}`);
    return {data, sha:file.sha};
  }
  return {
    async connect() {const repository = await api(''); if(!repository.permissions?.push) throw new Error('This account needs write access to the repository.'); return load();},
    load,
    async publish(data, expectedSHA, images = []) {
      const errors = validateContent(data); if(errors.length) throw new Error(errors.join('\n'));
      const head = await api(`/git/ref/heads/${encodeURIComponent(branch)}`);
      const current = await load(head.object.sha);
      if(current.sha !== expectedSHA) throw new Error('Website content changed since you connected. Export your draft, then load the latest content before publishing.');
      const parent = await api(`/git/commits/${head.object.sha}`);
      const tree = [];
      for(const image of images) {
        if(!/^assets\/uploads\/[a-z0-9-]+\.(?:jpg|png|webp|svg)$/.test(image.path)) throw new Error('Invalid image upload path.');
        const blob = await api('/git/blobs', {method:'POST',body:JSON.stringify({content:toBase64(image.bytes),encoding:'base64'})});
        tree.push({path:image.path,mode:'100644',type:'blob',sha:blob.sha});
      }
      tree.push({path:'data/content.json',mode:'100644',type:'blob',content:JSON.stringify(data,null,2)+'\n'});
      const nextTree = await api('/git/trees', {method:'POST',body:JSON.stringify({base_tree:parent.tree.sha,tree})});
      const commit = await api('/git/commits', {method:'POST',body:JSON.stringify({message:'Update Sindrino website content and images',tree:nextTree.sha,parents:[head.object.sha]})});
      await api(`/git/refs/heads/${encodeURIComponent(branch)}`,{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});
      return load(commit.sha);
    }
  };
}
