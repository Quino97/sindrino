import { loadContent, escapeHTML as e, lines, safeURL } from './lib/content.js';
import { icon } from './lib/icons.js';
import { isPlaceholder, athleteInitials, filterAthletes } from './lib/athletes.js';

const $ = selector => document.querySelector(selector);
const arrow = icon('arrowUpRight');
const photo = (src, alt, cls = '', eager = false) => `<img class="${cls}" src="${e(safeURL(src, {image:true}) || 'assets/landscape.jpg')}" alt="${e(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
const button = (text, href, cls = '') => `<a class="button ${cls}" href="${href}">${e(text)} ${arrow}</a>`;
const eyebrow = text => `<p class="eyebrow"><span class="eyebrow-mark" aria-hidden="true"></span>${e(text)}</p>`;
let content;
let currentRoute = '';
let railObserver;
const preview = new URLSearchParams(location.search).get('preview') === '1';
const routes = [['athlete','The athlete'],['coaching','Coaching'],['athletes','Our athletes'],['journal','Field notes'],['plans','Plans & pricing']];

function header() {
  $('#site-header').innerHTML = `<a class="wordmark" href="#/" aria-label="${e(content.site.name)} home"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="m8 29 20-21h26L34 29H8Z" fill="var(--sky)"/><path d="M10 35h26L56 14v22L36 57H10l20-22H10Z" fill="currentColor"/></svg><span>${e(content.site.name)}</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu"><span></span><span></span></button><nav id="primary-nav" aria-label="Main navigation">${routes.map(([id,label]) => `<a href="#/${id}" data-nav="${id}">${label}</a>`).join('')}<a class="nav-contact" href="#/contact" data-nav="contact">Let’s talk ${arrow}</a></nav>`;
  $('.menu-toggle').addEventListener('click', () => {
    const open = $('.menu-toggle').getAttribute('aria-expanded') !== 'true';
    $('.menu-toggle').setAttribute('aria-expanded', String(open));
    $('.menu-toggle').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('#site-header').classList.toggle('menu-open', open);
  });
  $('#primary-nav').addEventListener('click', ev => {if (ev.target.closest('a')) closeMenu();});
  document.addEventListener('keydown', ev => {if (ev.key === 'Escape') closeMenu();});
}
function closeMenu() { $('#site-header').classList.remove('menu-open'); $('.menu-toggle').setAttribute('aria-expanded','false'); $('.menu-toggle').setAttribute('aria-label','Open menu'); }
function footer() {
  const s = content.site;
  const socials = [['Instagram',s.instagram],['Strava',s.strava]].filter(([,v])=>safeURL(v));
  $('#site-footer').innerHTML = `<div class="footer-top wrap"><div><a class="footer-brand" href="#/">${e(s.name)}<span class="brand-dot" aria-hidden="true">${arrow}</span></a><p>${e(s.footerText)}</p></div><div class="footer-links">${routes.map(([id,label])=>`<a href="#/${id}">${label}</a>`).join('')}<a href="#/contact">Contact</a></div><div class="footer-social">${socials.map(([label,url])=>socialLink(label,url)).join('')}${button('Find your next step','#/contact','light small')}</div></div><div class="footer-bottom wrap"><span>© ${new Date().getFullYear()} ${e(s.name)}. All strides welcome.</span><span>Athlete & coaching <span class="footer-sep">/</span> <a href="./admin.html">Studio access</a> <span class="footer-sep">/</span> <a href="#/credits">Credits & privacy</a></span></div>`;
}
function socialLink(label,url) {
  const address=safeURL(url);
  if (!address) return '';
  const brand=['Instagram','Strava'].includes(label)?`<span class="social-icon social-${label.toLowerCase()}" aria-hidden="true"></span>`:'';
  return `<a class="social-link" href="${e(address)}" target="_blank" rel="noopener noreferrer">${brand}<span>${e(label)}</span></a>`;
}
function partnerStrip() {
  const group = (duplicate = false) => `<div class="partner-group"${duplicate?' aria-hidden="true"':''}>${content.sponsors.map(s=>`<a href="${e(safeURL(s.url)||'#/')}" data-partner="${e(s.name.toLowerCase())}" target="_blank" rel="noopener noreferrer"${duplicate?' tabindex="-1"':''}>${photo(s.logo,s.name)}</a>`).join('')}</div>`;
  return `<section class="partners" aria-label="Proudly supported by"><p>GOOD COMPANY.<br><strong>GREAT POSSIBILITIES.</strong></p><div class="partner-window"><div class="partner-track">${group()}${group(true)}</div></div><button class="motion-toggle" aria-label="Pause sponsor animation" title="Pause animation">${icon('pause')}</button></section>`;
}
function cta() {return `<section class="cta wrap">${eyebrow('THE NEXT STEP IS YOURS')}<div class="cta-row"><div><h2>${lines(content.site.ctaTitle)}</h2><p>${e(content.site.ctaText)}</p></div>${button('Let’s start a conversation','#/contact')}</div></section>`;}
function articleCard(a) {return `<a class="article-card" href="#/journal/${encodeURIComponent(a.id)}"><div class="article-image">${photo(a.image,a.title)}<span class="round-arrow">${arrow}</span></div><div class="article-meta"><span>${e(a.category)}</span><span>${e(a.readTime)} read</span></div><h3>${e(a.title)}</h3><p>${e(a.excerpt)}</p></a>`;}
function home() {
  const s = content.site;
  return `<section class="hero">${photo(s.heroImage,'A trail leads from forest and turquoise water towards the mountains and open sky','hero-image',true)}<div class="hero-shade"></div><div class="hero-content wrap">${eyebrow(s.heroEyebrow)}<h1>${s.heroTitle.split("\n").map((line,i)=>i===0?e(line):`<span class="hero-title-accent">${e(line)}</span>`).join("<br>")}</h1><p class="hero-description">${e(s.heroDescription)}</p><div class="hero-actions">${button('Find your stride','#/coaching','light') }<a class="text-link" href="#/athlete">Meet Sindrino <span>${arrow}</span></a></div></div><div class="hero-bottom wrap"><a href="#explore" class="scroll-cue">A LITTLE FURTHER ${icon("arrowDown")}</a><div class="hero-stamp"><span>ATHLETE</span><b class="stamp-divider" aria-hidden="true"></b><span>COACH</span></div><span class="hero-location">ROOTED IN NATURE. <span>BUILT TO GO BEYOND.</span></span></div><span class="image-credit">${e(s.heroCredit)}</span></section>${partnerStrip()}<section class="intro wrap section" id="explore"><div class="intro-copy">${eyebrow(s.introEyebrow)}<h2>${lines(s.introTitle)}</h2><p>${e(s.introText)}</p><a class="under-link" href="#/athlete">Get to know Sindrino ${arrow}</a><div class="intro-footnote"><span>01 —</span> ${e(s.tagline)}</div></div><div class="intro-portrait">${photo(s.introImage,'Sindrino in motion on the track')}<span class="image-label">A LIFE IN MOTION ${arrow}</span><div class="portrait-note">More than<br>the miles.</div></div></section><section class="coaching-home"><div class="wrap coaching-home-inner"><div>${eyebrow(s.homeCoachingEyebrow)}<h2>${lines(s.homeCoachingTitle)}</h2></div><div><p>${e(s.homeCoachingText)}</p>${button('Explore the approach','#/coaching','outline')}</div></div><div class="wrap three-principles">${content.coaching.philosophy.map((p,i)=>`<div><span class="principle-index">0${i+1} /</span><h3>${e(p.title)}</h3><p>${e(p.text)}</p></div>`).join('')}</div></section><section class="manifesto">${photo(s.manifestoImage,'Runners tracing a mountain trail','manifesto-image')}<div class="wrap manifesto-content">${eyebrow(s.manifestoEyebrow)}<h2>${lines(s.manifestoTitle)}</h2><p>${e(s.manifestoText)}</p><a class="under-link" href="#/athletes">Meet the community ${arrow}</a><span class="contour" aria-hidden="true">${arrow}</span></div></section><section class="journal-home section wrap"><div class="section-heading"><div>${eyebrow(s.homeJournalEyebrow)}<h2>${lines(s.homeJournalTitle)}</h2></div><a class="under-link" href="#/journal">All field notes ${arrow}</a></div><div class="article-grid">${content.articles.filter(a=>a.published).slice(0,3).map(articleCard).join('')}</div></section>${cta()}`;
}
function pageHeading(label, title, intro, cls = '') { return `<section class="page-heading wrap ${cls}">${eyebrow(label)}<h1>${lines(title)}</h1><p>${e(intro)}</p></section>`; }
function resultsTable(results) {
  return results.length ? `<div class="results-table"><div class="result-head"><span>EVENT / DISTANCE</span><span>DATE</span><span>RESULT</span></div>${results.map(r=>`<div class="result-row"><div><strong>${e(r.event)}</strong><small>${e(r.distance)}</small></div><span>${e(r.date)}</span><strong>${safeURL(r.link)?`<a href="${e(safeURL(r.link))}" target="_blank" rel="noopener noreferrer">${e(r.result)} ${arrow}</a>`:e(r.result)}</strong></div>`).join('')}</div>` : '<div class="quiet-state"><span class="section-rule" aria-hidden="true"></span><h3>More of the story to come.</h3><p>Race highlights and results will be shared here.</p></div>';
}
function goalsList(goals) { return goals.length ? `<div class="goals-list">${goals.map(g=>`<div><span class="status-label">${e(g.status)}</span><h3>${e(g.title)}</h3><p>${e(g.target)}</p></div>`).join('')}</div>` : ''; }
function profileLinks(profile) {
  return `<div class="profile-links">${(profile.links||[]).filter(link=>safeURL(link.url)).map(link=>`<a class="under-link" href="${e(safeURL(link.url))}" target="_blank" rel="noopener noreferrer">${e(link.label)} ${arrow}</a>`).join('')}</div>`;
}
function profileBenchmarks(profile) {
  if (!profile.benchmarks?.length) return '';
  return `<section class="wrap benchmark-section"><div class="section-heading"><div>${eyebrow('PERSONAL BENCHMARKS')}<h2>${e(profile.benchmarkTitle||'A feel for the pace.')}</h2></div></div><dl class="benchmark-grid">${profile.benchmarks.map(b=>`<div><dt>${e(b.label)}</dt><dd>${e(b.time)}</dd><dd class="benchmark-context">${e(b.note)}</dd></div>`).join('')}</dl><p class="caption benchmark-note">${e(profile.benchmarkNote||'Approximate benchmarks; event details to follow.')}</p></section>`;
}
function contactChannels(site) {
  const enquiry=safeURL(site.enquiryURL);
  const email=site.email?`<a class="under-link" href="mailto:${e(site.email)}">${e(site.email)} ${arrow}</a>`:'';
  if (enquiry) return `${email}<div class="official-enquiry">${button('Start coaching enquiry',e(enquiry))}<p>Opens Sindrino’s coaching form. You can also find him on Instagram below.</p></div>`;
  return email||'<p class="contact-pending">Contact details are being updated. You can prepare and download your enquiry below.</p>';
}
function athlete() {
  const p = content.profile;
  return `<div class="profile-hero wrap"><div>${eyebrow(p.eyebrow)}<h1>${lines(p.headline)}</h1><p>${e(p.intro)}</p><div class="tags">${p.disciplines.map(d=>`<span>${e(d)}</span>`).join('')}</div><a class="under-link" href="#/contact">Get in touch ${arrow}</a></div><figure>${photo(p.image,p.name,'',true)}<figcaption>${e(p.name)} / A LIFE IN MOTION</figcaption></figure></div><section class="wrap section split-copy"><div>${eyebrow('BEHIND THE BIB')}<h2>In it for<br>the whole journey.</h2></div><div class="profile-story"><p>${e(p.bio)}</p>${profileLinks(p)}</div></section>${profileBenchmarks(p)}<section class="results-section wrap section"><div class="section-heading"><div>${eyebrow('THE WORK. THE MOMENTS.')}<h2>Race highlights.</h2></div><span>THE ATHLETE / ${e(p.name).toUpperCase()}</span></div>${resultsTable(p.achievements)}${goalsList(p.goals)}</section><section class="gallery-section section"><div class="wrap section-heading"><div>${eyebrow('BETWEEN THE START AND FINISH')}<h2>A few frames along the way.</h2></div></div><div class="gallery-grid wrap">${p.gallery.map(g=>`<figure>${photo(g.image,g.caption)}<figcaption><span>${e(g.caption)}</span><small>${e(g.credit)}</small></figcaption></figure>`).join('')}</div></section>${partnerStrip()}${cta()}`;
}
function coaching() {
  const c = content.coaching;
  return `${pageHeading('COACHING WITH SINDRINO',c.headline,c.intro)}<div class="wide-image wrap">${photo(c.image,'A group meeting at the running track')}</div><section class="section wrap"><div class="section-heading"><div>${eyebrow('THE APPROACH')}<h2>Good running starts<br>with understanding you.</h2></div></div><div class="philosophy-list">${c.philosophy.map((p,i)=>`<div><span>0${i+1}</span><h3>${e(p.title)}</h3><p>${e(p.text)}</p></div>`).join('')}</div></section><section class="process section"><div class="wrap">${eyebrow('FROM A CONVERSATION TO A COMMITMENT')}<h2>One step at a time.</h2><div class="three-principles">${c.steps.map((s,i)=>`<div><span class="principle-index">0${i+1} /</span><h3>${e(s.title)}</h3><p>${e(s.text)}</p></div>`).join('')}</div></div></section><section class="section wrap"><div class="section-heading"><div>${eyebrow('A FEEL FOR THE RHYTHM')}<h2>Purpose in every day.</h2></div><p class="caption">An illustrative week, not an individual training prescription.<br>Your training is shaped around your needs.</p></div><div class="week-grid">${c.sampleWeek.map(d=>`<div><span>${e(d.day)}</span><h3>${e(d.title)}</h3><p>${e(d.description)}</p></div>`).join('')}</div><div class="center-action">${button('Explore coaching options','#/plans')}</div></section>${cta()}`;
}
function athletes() {
  const t = content.team;
  return `${pageHeading('THE PEOPLE. THE PROGRESS.',t.headline,t.intro)}<div class="wide-image wrap team-image">${photo(t.image,'A community of runners at the track')}</div><section class="section wrap athlete-section"><div class="section-heading"><div>${eyebrow('OUR ATHLETES')}<h2>Every story has a next step.</h2></div>${content.athletes.length?`<label class="filter-label">Discipline<select id="athlete-filter"><option value="all">All profiles</option>${[...new Set(content.athletes.filter(a=>!isPlaceholder(a)).map(a=>a.discipline))].map(d=>`<option>${e(d)}</option>`).join('')}</select></label>`:''}</div><div class="athlete-rail-toolbar"><p>Swipe, scroll, or use the arrows to meet the runners.</p><div class="carousel-controls"><span id="athlete-position" class="carousel-count" aria-live="polite"></span><button id="athlete-prev" class="carousel-button" aria-label="Previous athlete profiles" aria-controls="athlete-grid">${icon('arrowLeft')}</button><button id="athlete-next" class="carousel-button" aria-label="Next athlete profiles" aria-controls="athlete-grid">${icon('arrowRight')}</button></div></div><div id="athlete-grid" class="athlete-rail" role="list" aria-label="Coached athlete profiles" tabindex="0">${athleteCards(content.athletes)}</div>${!content.athletes.length?`<div class="community-empty"><div class="empty-mark" aria-hidden="true">${arrow}</div><div><h3>${e(t.emptyTitle)}</h3><p>${e(t.emptyText)}</p>${button('Start your own journey','#/contact','outline')}</div></div>`:''}</section>${cta()}`;
}
function athleteVisual(a) {
  if (safeURL(a.image,{image:true})) return photo(a.image,a.name);
  return `<div class="athlete-avatar${isPlaceholder(a)?' is-placeholder':''}"><div class="avatar-ridges" aria-hidden="true"></div><span class="athlete-monogram" aria-hidden="true">${isPlaceholder(a)?icon('person'):e(athleteInitials(a.name))}</span><span class="avatar-caption">${isPlaceholder(a)?'A STORY STILL TO COME':'PROFILE PHOTO TO FOLLOW'}</span></div>`;
}
function athleteCards(athletes) {return athletes.map(a=>isPlaceholder(a)?`<article class="athlete-slide" role="listitem"><div class="athlete-card placeholder-card">${athleteVisual(a)}<div><span class="eyebrow">PROFILE COMING SOON</span><h3>${e(a.name||'The next story.')}</h3><p>${e(a.headline||'A new runner. A new chapter.')}</p><span class="placeholder-caption">Details to follow</span></div></div></article>`:`<article class="athlete-slide" role="listitem"><a class="athlete-card" href="#/athletes/${encodeURIComponent(a.id)}">${athleteVisual(a)}<div><span class="eyebrow">${e(a.discipline)}</span><h3>${e(a.name)} ${arrow}</h3><p>${e(a.headline)}</p><span class="under-link">Meet the runner ${arrow}</span></div></a></article>`).join('');}
function athleteDetail(id) {
  const a = content.athletes.find(a=>a.id===id);
  if (!a||isPlaceholder(a)) return notFound();
  return `<div class="wrap breadcrumb"><a href="#/athletes">${icon('arrowLeft')} Our athletes</a></div><div class="profile-hero wrap"><div>${eyebrow(a.discipline)}<h1>${e(a.name)}</h1><h2 class="profile-subheading">${lines(a.headline)}</h2><p>${e(a.bio)}</p><div class="athlete-profile-social">${socialLink('Instagram',a.instagram)}</div></div><figure class="athlete-detail-visual">${athleteVisual(a)}</figure></div><section class="section wrap">${eyebrow('CELEBRATING THE WORK')}<h2>Achievements.</h2>${resultsTable(a.achievements)}</section><section class="section wrap goal-section">${eyebrow('WHAT’S NEXT')}<h2>Goals on the horizon.</h2>${a.goals.length?goalsList(a.goals):'<p>The next chapter is taking shape.</p>'}</section>${cta()}`;
}
function journal() {
  const published = content.articles.filter(a=>a.published);
  return `${pageHeading('FIELD NOTES',content.journal.headline,content.journal.intro)}<section class="wrap journal-list"><div class="journal-controls"><div class="filter-pills" role="group" aria-label="Filter field notes">${['All notes',...new Set(published.map(a=>a.category))].map((c,i)=>`<button class="filter-pill${i===0?' active':''}" data-category="${e(c)}" aria-pressed="${i===0}">${e(c)}</button>`).join('')}</div><label class="search-box"><span class="sr-only">Search field notes</span><input id="journal-search" type="search" placeholder="Find a little perspective…">${icon("search")}</label></div><p id="journal-count" class="caption" aria-live="polite"></p><div class="article-grid" id="journal-grid">${published.map(articleCard).join('')}</div></section>${cta()}`;
}
function article(id) {
  const a = content.articles.find(a=>a.id===id&&a.published);
  if (!a) return notFound();
  return `<article><div class="wrap breadcrumb"><a href="#/journal">${icon("arrowLeft")} All field notes</a></div><header class="article-heading wrap">${eyebrow(a.category)}<h1>${e(a.title)}</h1><p>${e(a.excerpt)}</p><div class="article-meta"><span>THE SINDRINO JOURNAL</span><span>${e(a.readTime)} read</span></div></header><div class="wide-image wrap">${photo(a.image,a.title,'',true)}</div><div class="article-body">${a.paragraphs.map(p=>`<p>${lines(p)}</p>`).join('')}<div class="article-end"><span class="section-rule" aria-hidden="true"></span><p>Keep learning. Keep moving.</p><a class="under-link" href="#/contact">Talk about your next step ${arrow}</a></div></div></article><section class="wrap section"><div class="section-heading"><h2>A little more perspective.</h2><a class="under-link" href="#/journal">All field notes ${arrow}</a></div><div class="article-grid">${content.articles.filter(other=>other.published&&other.id!==id).slice(0,3).map(articleCard).join('')}</div></section>`;
}
function plans() {return `${pageHeading('INVEST IN YOUR NEXT STEP',content.pricing.headline,content.pricing.intro)}${content.pricing.draft?`<div class="wrap"><p class="proposed-pricing">${e(content.pricing.draftLabel||"Proposed rates · awaiting confirmation")}</p></div>`:""}<section class="wrap plans-grid">${content.plans.map(p=>`<article class="plan${p.featured?' featured':''}">${p.featured?'<div class="plan-highlight">PERSONAL. PURPOSEFUL. TOGETHER.</div>':''}<div class="plan-body">${eyebrow(p.eyebrow)}<h2>${e(p.name)}</h2><p>${e(p.description)}</p><div class="plan-price">${e(p.price)}<span>${e(p.period)}</span></div><ul>${p.features.map(f=>`<li><span aria-hidden="true">${arrow}</span>${e(f)}</li>`).join('')}</ul>${button('Let’s talk','#/contact?plan='+encodeURIComponent(p.name),p.featured?'light':'outline')}</div></article>`).join('')}</section><p class="wrap pricing-note">${e(content.pricing.note)}</p><section class="section faq-section wrap"><div>${eyebrow('A FEW GOOD QUESTIONS')}<h2>Before the<br>first step.</h2></div><div class="faq-list">${content.faqs.map(f=>`<details><summary>${e(f.question)}${icon("chevronDown")}</summary><p>${e(f.answer)}</p></details>`).join('')}</div></section>${cta()}`;}
function contact(params) {
  const s = content.site;
  const hasEmail = !!s.email;
  return `${pageHeading('GOOD THINGS START WITH A CONVERSATION',s.contactHeadline,s.contactIntro)}<section class="wrap contact-layout"><div class="contact-aside">${photo(s.contactImage,'A runner climbing a rocky mountain trail')}<div><h2>A first step.<br>A whole lot of possibility.</h2><p>${e(s.tagline)}</p>${contactChannels(s)}<div class="contact-socials">${[['Instagram',s.instagram],['Strava',s.strava],['WhatsApp',s.whatsapp]].map(([n,u])=>socialLink(n,u)).join('')}</div></div></div><form id="contact-form" class="contact-form"><h2>Tell me your story.</h2><p>Somewhere between where you are and where you’d like to be. Let’s start there.</p><div class="form-two"><label>Your name<input name="name" required autocomplete="name" placeholder="First and last name" maxlength="150"></label><label>Email address<input name="email" type="email" required autocomplete="email" placeholder="you@example.com" maxlength="200"></label></div><label>I’m interested in<select name="interest"><option>Personal coaching</option><option>Race-focused support</option><option>A little direction</option><option>Sponsorship / collaboration</option><option>Something else</option>${params.get('plan')?`<option selected>${e(params.get('plan'))}</option>`:''}</select></label><label>What’s on your horizon?<textarea name="message" required rows="6" maxlength="5000" placeholder="Your running so far, the goal you have in mind, and what you’d like a hand with…"></textarea></label><label class="consent"><input type="checkbox" name="consent" required><span>I’m happy to share these details with Sindrino to discuss my enquiry.</span></label><button class="button" type="submit">${hasEmail?'Prepare email':'Download my enquiry'} ${arrow}</button><p class="form-disclosure">${hasEmail?'This opens a prepared message in your email app. Review it and press send there.':safeURL(s.enquiryURL)?'This saves a text file on your device. Use the coaching form above or Instagram to contact Sindrino directly.':'This saves a text file on your device to share when contact details are available.'} Your details are not stored by this website.</p><p id="contact-status" class="form-status" role="status"></p><a id="email-fallback" class="under-link" hidden>Open your prepared email ${arrow}</a></form></section>`;
}
function credits() {return `${pageHeading('THE SMALL PRINT','Good company.\nProper credit.','A few details about this website and the people behind its imagery.')}<section class="wrap prose section"><h2>Photography</h2><p>Homepage landscape: <a href="https://unsplash.com/photos/2cB599inAew" target="_blank" rel="noopener noreferrer">Cole Allen on Unsplash</a>, Glacier National Park. Used under the Unsplash License. This landscape is a visual reference, not a claim about Sindrino’s training location.</p><p>Running photography was supplied for this project. Original filenames and available credits are preserved in <a href="./assets/photo-credits.json">the photo index</a>. Credits including ZACZINN and @sachaspex are retained where supplied. All photographer rights remain with their respective owners.</p><h2>Partners</h2><p>Burnt Studios, Saucony, and OpenFuel logos belong to their respective owners. Sponsorship information was supplied by the site owner. Partner links open their own websites.</p><h2>Your privacy</h2><p>This site uses no analytics, advertising cookies, or tracking scripts. Contact forms prepare an email or download a text file; this website does not receive or store your enquiry. Email delivery depends on you sending the prepared message from your email app. The separate coaching enquiry link opens Sindrino’s published Google Form, where responses are handled by Sindrino and Google under their own policies. The hosting provider and linked services may process requests under their own policies.</p><p>The content editor stores drafts on your device. GitHub access tokens are held in the editor’s memory for the current page session and are sent only to GitHub’s API when you connect or publish. Don’t put private athlete information into public site content.</p><h2>Field notes</h2><p>Field notes are general educational starting points. Individual training and nutrition needs should be discussed with an appropriately qualified professional.</p></section>`;}
function notFound() { return `${pageHeading('A SMALL DETOUR','Let’s get you\nback on track.','That page may have moved, or the story hasn’t been published yet.')}<div class="wrap section">${button('Back to the start','#/')}</div>`; }

function bindAthleteRail() {
  const rail=$('#athlete-grid'),prev=$('#athlete-prev'),next=$('#athlete-next'),position=$('#athlete-position');
  const update=()=>{
    const count=rail.children.length;
    const step=rail.firstElementChild?(rail.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(rail).columnGap||0)):1;
    const active=count?Math.min(count,Math.round(rail.scrollLeft/step)+1):0;
    const text=`${String(active).padStart(2,'0')} / ${String(count).padStart(2,'0')}`;
    if(position.textContent!==text)position.textContent=text;
    prev.disabled=rail.scrollLeft<=1;
    next.disabled=rail.scrollWidth-rail.clientWidth-rail.scrollLeft<=1;
  };
  const move=direction=>{
    const step=rail.firstElementChild?(rail.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(rail).columnGap||0)):rail.clientWidth;
    rail.scrollBy({left:direction*step,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  rail.addEventListener('scroll',update,{passive:true});
  $('#athlete-filter')?.addEventListener('change',ev=>{
    rail.innerHTML=athleteCards(filterAthletes(content.athletes,ev.target.value));
    rail.scrollTo({left:0,behavior:'instant'});update();
  });
  railObserver=new ResizeObserver(update);railObserver.observe(rail);update();
}
function bindPage(route) {
  if (route==='journal' && $('#journal-search')) {
    let category = 'All notes';
    const update = () => {
      const query = $('#journal-search').value.toLowerCase();
      const filtered = content.articles.filter(a=>a.published&&(category==='All notes'||a.category===category)&&`${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(query));
      $('#journal-grid').innerHTML = filtered.length ? filtered.map(articleCard).join('') : '<p class="quiet-state">No notes found. Try a different search.</p>';
      $('#journal-count').textContent = `${filtered.length} field ${filtered.length===1?'note':'notes'}`;
    };
    document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category; document.querySelectorAll('[data-category]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});update();}));
    $('#journal-search').addEventListener('input',update); update();
  }
  if($('#athlete-grid'))bindAthleteRail();
  $('.motion-toggle')?.addEventListener('click',ev=>{const p=ev.currentTarget.closest('.partners'); const paused=p.classList.toggle('paused');ev.currentTarget.innerHTML=icon(paused?'play':'pause');ev.currentTarget.title=paused?'Play animation':'Pause animation';ev.currentTarget.setAttribute('aria-label',`${paused?'Play':'Pause'} sponsor animation`);});
  $('.scroll-cue')?.addEventListener('click',ev=>{ev.preventDefault();$('#explore').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  $('#contact-form')?.addEventListener('submit',ev=>{
    ev.preventDefault(); const data = new FormData(ev.target);
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nInterested in: ${data.get('interest')}\n\n${data.get('message')}`;
    if (content.site.email) {
      const url = `mailto:${content.site.email}?subject=${encodeURIComponent('Coaching enquiry — '+data.get('interest'))}&body=${encodeURIComponent(body)}`;
      const link=$('#email-fallback'); link.href=url; link.hidden=false;
      location.href=url;
      $('#contact-status').textContent='Your email draft is ready. Send it from your email app. If it didn’t open, use the link below.';
    } else {
      const url=URL.createObjectURL(new Blob([body],{type:'text/plain;charset=utf-8'})); const a=document.createElement('a');a.href=url;a.download='sindrino-enquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      $('#contact-status').textContent=safeURL(content.site.enquiryURL)?'Your enquiry has been downloaded. Nothing has been sent. Use the coaching form above or Instagram to contact Sindrino.':'Your enquiry has been downloaded. Nothing has been sent. Keep it to share once contact details are available.';
    }
  });
}
function render({ initial = false } = {}) {
  if (location.hash==='#main') return;
  railObserver?.disconnect();
  const hash = location.hash.replace(/^#\/?/,'');
  const [path,query=''] = hash.split('?');
  const [route='',id=''] = path.split('/');
  const params = new URLSearchParams(query);
  currentRoute=route;
  closeMenu();
  document.body.classList.toggle('is-home',!route);
  const views = {'':home,athlete,coaching,athletes:()=>id?athleteDetail(id):athletes(),journal:()=>id?article(id):journal(),plans,contact:()=>contact(params),credits};
  $('#main').innerHTML = (views[route]||notFound)();
  const title = ({'':'Run with purpose',athlete:'The athlete',coaching:'Coaching',athletes:'Our athletes',journal:'Field notes',plans:'Plans & pricing',contact:'Let’s talk',credits:'Credits & privacy'})[route]||'Page not found';
  document.title = `${title} | ${content.site.name}`;
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  bindPage(route);
  if (!initial) { window.scrollTo({top:0,behavior:'instant'}); $('#main').focus({preventScroll:true}); }
  updateHeader();
}
function updateHeader() { $('#site-header').classList.toggle('solid',!!currentRoute||scrollY>40); }
try {
  content = await loadContent({draft:preview});
  if (preview) {$('#preview-banner').hidden=false;document.body.classList.add('draft-preview');}
  header();footer();render({initial:true});
  addEventListener('hashchange',()=>render());
  addEventListener('scroll',updateHeader,{passive:true});
} catch (err) {
  $('#main').innerHTML=`<div class="wrap section"><h1>A short pause.</h1><p>${e(err.message)}</p><a class="button" href="./">Try again ${arrow}</a></div>`;
}
