import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateContent,safeURL,escapeHTML,templates} from '../lib/content.js';
import {filterAthletes,athleteInitials} from '../lib/athletes.js';
const original=JSON.parse(await readFile(new URL('../data/content.json',import.meta.url),'utf8'));
test('Published content validates and placeholders do not carry athlete results',()=>{
  assert.deepEqual(validateContent(original),[]);
  for(const athlete of original.athletes.filter(a=>a.placeholder)){
    assert.deepEqual(athlete.achievements,[]);assert.deepEqual(athlete.goals,[]);
  }
});
test('Parent athlete profiles keep independent child achievements and goals',()=>{
  const data=structuredClone(original);
  data.athletes=[];
  const a=templates.athletes(),b=templates.athletes();a.id='first-athlete';b.id='second-athlete';
  a.achievements.push({...templates.achievements(),event:'Confirmed race',result:'1st'});
  a.goals.push({...templates.goals(),title:'A new distance'});
  data.athletes.push(a,b);
  assert.deepEqual(validateContent(data),[]);
  assert.equal(b.achievements.length,0);assert.equal(b.goals.length,0);
  const roundTrip=JSON.parse(JSON.stringify(data));
  assert.equal(roundTrip.athletes[0].achievements[0].result,'1st');
});
test('Duplicate page addresses and malformed child records cannot be published',()=>{
  const data=structuredClone(original);data.athletes=[{...templates.athletes(),id:'runner'}, {...templates.athletes(),id:'runner'}];
  assert.match(validateContent(data).join(' '),/duplicate ID/);
  data.athletes[0].goals=[{}];
  assert.match(validateContent(data).join(' '),/goals\[0\].title/);
});
test('Unsafe image and social URLs are rejected; text is escaped',()=>{
  for(const bad of ['javascript:alert(1)','data:text/html,<svg>','//evil.example/test','assets/../admin.js','https:\\evil.example','https:\n//evil.example'])assert.equal(safeURL(bad,{image:true}),'',bad);
  assert.equal(safeURL('assets/photos/run-01.webp',{image:true}),'assets/photos/run-01.webp');
  assert.equal(safeURL('https://example.com/image.jpg',{image:true}),'https://example.com/image.jpg');
  assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
  const data=structuredClone(original);data.site.instagram='javascript:alert(1)';assert.ok(validateContent(data).length);
});
test('Imported or published content must retain required sections and field types',()=>{
  const data=structuredClone(original);delete data.coaching.sampleWeek;data.articles[0].published='true';data.site.heroTitle=null;data.profile.benchmarks=null;data.pricing.draft='yes';
  const errors=validateContent(data).join(' ');
  assert.match(errors,/sampleWeek/);assert.match(errors,/published/);assert.match(errors,/heroTitle/);
  assert.match(errors,/benchmarks/);assert.match(errors,/pricing.draft/);
});
test('Malformed list entries return validation errors rather than crashing',()=>{
  const data=structuredClone(original);data.articles=[null,null];data.plans=[null];
  assert.ok(validateContent(data).length>0);
});
test('Athlete filters keep coming-soon slots distinct from real runners',()=>{
  const runner={...templates.athletes(),id:'real-runner',name:'Eric O’Brien',discipline:'Running'};
  const slot={...templates.athletes(),id:'blank-slot',discipline:'Running',placeholder:true};
  assert.deepEqual(filterAthletes([runner,slot],'all'),[runner,slot]);
  assert.deepEqual(filterAthletes([runner,slot],'Running'),[runner]);
  assert.deepEqual(filterAthletes([runner,slot],'Trail'),[]);
  assert.equal(athleteInitials('Eric O’Brien'),'EO');
});
