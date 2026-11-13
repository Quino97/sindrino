export const DRAFT_KEY = 'sindrino-content-draft-v1';
export const BASE_KEY = 'sindrino-content-base-v1';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const lines = value => escapeHTML(value).replace(/\n/g, '<br>');
export function safeURL(value, { image = false } = {}) {
  const text = String(value ?? '').trim();
  if (!text || /[\x00-\x1f\\]/.test(text)) return '';
  if (/^(?:\.\/)?assets\/[a-z0-9_./% @+-]+$/i.test(text) && !text.split('/').includes('..')) return text;
  try {
    const url = new URL(text);
    if (url.protocol === 'https:' || (!image && ['mailto:', 'tel:'].includes(url.protocol))) return text;
  } catch { /* Relative routes are handled separately. */ }
  return '';
}
export function validateContent(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['Content must be an object.'];
  if (data.schemaVersion !== 1) errors.push('Unsupported schemaVersion; expected 1.');
  const objects = ['site','profile','coaching','team','journal','pricing'];
  const arrays = ['athletes','articles','plans','faqs','sponsors'];
  for (const key of objects) if (!data[key] || typeof data[key] !== 'object' || Array.isArray(data[key])) errors.push(`${key} must be an object.`);
  for (const key of arrays) if (!Array.isArray(data[key])) errors.push(`${key} must be an array.`);
  if (errors.length) return errors;
  const strings = {
    site: ['name','tagline','heroEyebrow','heroTitle','heroDescription','heroImage','introEyebrow','introTitle','introText','introImage','manifestoTitle','manifestoText','ctaTitle','ctaText','email','instagram','strava','whatsapp','contactIntro','footerText'],
    profile: ['name','eyebrow','headline','intro','bio','image'],
    coaching: ['headline','intro','image'], team: ['headline','intro','image','emptyTitle','emptyText'], journal: ['headline','intro'], pricing: ['headline','intro','note']
  };
  for (const [section, keys] of Object.entries(strings)) for (const key of keys) if (typeof data[section][key] !== 'string') errors.push(`${section}.${key} must be text.`);
  for (const key of ['heroCredit','homeCoachingEyebrow','homeCoachingTitle','homeCoachingText','manifestoEyebrow','manifestoImage','homeJournalEyebrow','homeJournalTitle','contactHeadline','contactImage']) if (typeof data.site[key] !== 'string') errors.push(`site.${key} must be text.`);
  function list(value, path, fields, childArrays = {}) {
    if (!Array.isArray(value)) { errors.push(`${path} must be a list.`); return; }
    value.forEach((row, i) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) { errors.push(`${path}[${i}] must be an object.`); return; }
      for (const key of fields) if (typeof row[key] !== 'string') errors.push(`${path}[${i}].${key} must be text.`);
      for (const [key, childFields] of Object.entries(childArrays)) {
        if (childFields === 'text') textList(row[key], `${path}[${i}].${key}`);
        else list(row[key], `${path}[${i}].${key}`, childFields);
      }
    });
  }
  function textList(value, path) { if (!Array.isArray(value) || value.some(x => typeof x !== 'string')) errors.push(`${path} must be a list of text.`); }
  const resultFields = ['event','date','result','distance','link'];
  const goalFields = ['title','target','status'];
  list(data.profile.achievements, 'profile.achievements', resultFields);
  list(data.profile.goals, 'profile.goals', goalFields);
  textList(data.profile.disciplines, 'profile.disciplines');
  list(data.profile.gallery, 'profile.gallery', ['image','caption','credit']);
  if (data.profile.benchmarks !== undefined) list(data.profile.benchmarks, 'profile.benchmarks', ['label','time','note']);
  if (data.profile.links !== undefined) list(data.profile.links, 'profile.links', ['label','url']);
  if (data.pricing.draft !== undefined && typeof data.pricing.draft !== 'boolean') errors.push('pricing.draft must be a switch.');
  for (const [section,key] of [['profile','benchmarkTitle'],['profile','benchmarkNote'],['pricing','draftLabel'],['site','enquiryURL']]) if (data[section][key] !== undefined && typeof data[section][key] !== 'string') errors.push(`${section}.${key} must be text.`);
  list(data.coaching.philosophy, 'coaching.philosophy', ['title','text']);
  list(data.coaching.steps, 'coaching.steps', ['title','text']);
  list(data.coaching.sampleWeek, 'coaching.sampleWeek', ['day','title','description']);
  list(data.athletes, 'athletes', ['id','name','discipline','headline','bio','image'], {achievements: resultFields, goals: goalFields});
  for (const a of data.athletes) if (a?.placeholder !== undefined && typeof a.placeholder !== 'boolean') errors.push('Each athlete placeholder flag must be a switch.');
  list(data.articles, 'articles', ['id','title','category','readTime','image','excerpt'], {paragraphs:'text'});
  list(data.plans, 'plans', ['id','name','eyebrow','price','period','description'], {features:'text'});
  list(data.faqs, 'faqs', ['question','answer']);
  list(data.sponsors, 'sponsors', ['name','logo','url']);
  for (const key of ['athletes','articles','plans']) {
    const ids = new Set();
    for (const row of data[key]) {
      if (typeof row?.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id)) errors.push(`${key}: use a lowercase ID with hyphens.`);
      if (ids.has(row?.id)) errors.push(`${key}: duplicate ID “${row?.id}”.`);
      ids.add(row?.id);
    }
  }
  for (const row of data.articles) if (typeof row?.published !== 'boolean') errors.push('Each article needs a published switch.');
  for (const row of data.plans) if (typeof row?.featured !== 'boolean') errors.push('Each plan needs a featured switch.');
  function walk(value, path = '') {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
    if (value && typeof value === 'object') for (const [key, val] of Object.entries(value)) {
      const next = `${path}.${key}`;
      if (['image','heroImage','introImage','manifestoImage','contactImage','logo'].includes(key) && typeof val === 'string' && val && !safeURL(val, {image:true})) errors.push(`${next}: use an assets/ path or HTTPS image URL.`);
      if (['url','link','instagram','strava','whatsapp','enquiryURL'].includes(key) && val && !safeURL(val)) errors.push(`${next}: use a valid HTTPS URL.`);
      if (key === 'email' && val && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(val)) errors.push('Enter a valid contact email.');
      walk(val, next);
    }
  }
  walk(data);
  return errors;
}
export async function loadContent({ draft = false } = {}) {
  const response = await fetch('./data/content.json', {cache:'no-store'});
  if (!response.ok) throw new Error('The site content could not be loaded. Please try again.');
  let data = await response.json();
  if (draft) {
    try { const saved = localStorage.getItem(DRAFT_KEY); if (saved) data = JSON.parse(saved); } catch { /* Use published content if browser storage is unavailable. */ }
  }
  const errors = validateContent(data);
  if (errors.length) throw new Error(`Content needs attention: ${errors[0]}`);
  return data;
}
export const templates = {
  benchmarks: () => ({label:'New benchmark',time:'To be confirmed',note:'Approximate · details to follow'}),
  links: () => ({label:'New link',url:''}),
  athletes: () => ({id:`runner-${Date.now()}`,name:'New athlete',discipline:'Running',headline:'A new goal on the horizon.',bio:'',image:'',instagram:'',placeholder:false,achievements:[],goals:[]}),
  achievements: () => ({event:'New event',date:'',result:'',distance:'',link:''}),
  goals: () => ({title:'New goal',target:'',status:'In progress'}),
  gallery: () => ({image:'',caption:'New moment',credit:''}),
  articles: () => ({id:`note-${Date.now()}`,title:'New field note',category:'Training',readTime:'3 min',image:'',excerpt:'',published:false,paragraphs:['']}),
  plans: () => ({id:`plan-${Date.now()}`,name:'New plan',eyebrow:'COACHING',price:'On enquiry',period:'',description:'',features:[''],featured:false}),
  faqs: () => ({question:'New question',answer:''}),
  sponsors: () => ({name:'New partner',logo:'',url:''}),
  philosophy: () => ({title:'New principle',text:''}),
  steps: () => ({title:'New step',text:''}),
  sampleWeek: () => ({day:'MON',title:'New session',description:''})
};
