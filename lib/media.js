const database = () => new Promise((resolve, reject) => {
  const request = indexedDB.open('sindrino-media-v1', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('uploads', {keyPath:'path'});
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(new Error('Image storage is unavailable. Use an HTTPS image address instead.'));
});
async function transaction(mode, action) {
  const db = await database();
  try { return await new Promise((resolve, reject) => {
    const tx = db.transaction('uploads', mode), request = action(tx.objectStore('uploads'));
    let result; if(request) request.onsuccess = () => result = request.result;
    tx.oncomplete = () => resolve(result); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('Image could not be saved.'));
  }); } finally { db.close(); }
}
export async function saveImage(file) {
  const extensions = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/svg+xml':'svg'};
  if (!extensions[file.type]) throw new Error('Choose a JPG, PNG, WebP or SVG image.');
  if (!file.size || file.size > 8 * 1024 * 1024) throw new Error('Choose an image between 1 byte and 8 MB.');
  const slug = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,45) || 'image';
  const path = `assets/uploads/${slug}-${crypto.randomUUID().slice(0,8)}.${extensions[file.type]}`;
  const bytes = await file.arrayBuffer();
  await transaction('readwrite', store => store.put({path, type:file.type, bytes}));
  return path;
}
export const allImages = () => transaction('readonly', store => store.getAll());
export async function clearImages(paths) { for(const path of paths) await transaction('readwrite', store => store.delete(path)); }
const objectURLs = new Map();
export async function resolveImage(path) {
  if(!path?.startsWith('assets/uploads/')) return path;
  if(objectURLs.has(path)) return objectURLs.get(path);
  if(!location.pathname.endsWith('admin.html') && new URLSearchParams(location.search).get('preview') !== '1') return path;
  try {
    const record = await transaction('readonly', store => store.get(path));
    if(record){const url = URL.createObjectURL(new Blob([record.bytes], {type:record.type})); objectURLs.set(path,url); return url;}
  } catch { /* Published images remain available when local storage is unavailable. */ }
  return path;
}
