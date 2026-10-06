'use strict';
/* Lexi: English for PET (B1) and B2 First. Everything is stored locally on the device. */
const APP_VERSION = '5.0.0';
const KEY = 'lexi:v1';
const DAY = 864e5;

/* ---------- Language ---------- */
let LANG = 'en';
const T = (en, es) => LANG==='es' ? es : en;
const pl = (n, en1, enN, es1, esN) => T(n===1?en1:enN, n===1?es1:esN);
// Localised content field: uses <field>_en in English when it exists
function L(o, f){ if(!o) return ''; if(LANG==='en'){ const v=o[f+'_en']; if(v!=null && v!=='') return v; } return o[f]; }
const LOCALE = () => LANG==='es' ? 'es-ES' : 'en-GB';
const GROUP_EN = { 'Empieza aquí':'Start here', 'Plantillas':'Templates', 'Recursos':'Resources', 'Más':'More' };

const TOPIC_L = { travel:['Travel','Viajes'], work:['Work','Trabajo'], shopping:['Shopping','Compras'], health:['Health','Salud'], education:['Education','Estudios'], relationships:['Relationships','Relaciones'], freetime:['Free time','Tiempo libre'], environment:['Environment','Medio ambiente'], weather:['Weather','El tiempo'], house:['Home','Casa'], technology:['Technology','Tecnología'], food:['Food','Comida'], money:['Money','Dinero'], feelings:['Feelings','Emociones'], general:['General','General'] };
const CAT_L = { vocab:['Choose the word','Elige la palabra'], phrasal:['Phrasal verb','Phrasal verb'], collocation:['Collocations','Collocations'], falsefriend:['False friend','Falso amigo'], spelling:['Write the word','Escribe la palabra'], wordform:['Word formation','Forma la palabra'], translate:['Say it in English','¿Cómo se dice en inglés?'], listening:['Dictation','Dictado'], writing:['Writing','Escritura'] };
const FORM_L = { email:['Email','Email'], article:['Article','Artículo'], story:['Story','Historia'], essay:['Essay','Essay'], review:['Review','Review'], sentences:['Sentences','Frases'] };
const SECTION_L = { reading:['Reading PET','Reading PET'], listening:['Listening PET','Listening PET'], uoe:['B2 First Use of English','B2 First Use of English'] };
const lab = (map, k) => map[k] ? T(map[k][0], map[k][1]) : (k||'');
const TYPES = ['mcq','gap','wordform','translate','dictation','writing'];
const PARTS = { reading:6, listening:4, uoe:4 };

/* ---------- State ---------- */
function defaultState(){
  return { v:2, createdAt:Date.now(), srs:{}, attempts:[], writings:[], packs:[], exports:[], lastExportAt:0,
    daily:{}, session:null, messages:[], settings:{ sessionSize:10, newPerDay:12, lang:'en', theme:'auto' },
    tests:[], run:null, wmock:null, read:{}, irr:{}, speak:{}, phr:{}, rawNotes:[] };
}
function load(){
  try{ const raw = localStorage.getItem(KEY); if(!raw) return defaultState();
    const s = JSON.parse(raw); const d = defaultState();
    return Object.assign(d, s, { settings:Object.assign(d.settings, s.settings||{}) });
  }catch(e){ return defaultState(); }
}
let saveFail=false;
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(S)); saveFail=false; }
  catch(e){ if(!saveFail) toast(T("Couldn't save. Download a backup in Data.",'No se ha podido guardar. Descarga una copia de seguridad en Datos.')); saveFail=true; }
}
let S = load();
function setLang(l){
  LANG = l==='es' ? 'es' : 'en'; S.settings.lang=LANG;
  document.documentElement.lang = LANG;
  document.querySelectorAll('#tabs [data-tl]').forEach(b=>{ const [en,es]=b.dataset.tl.split('|'); b.lastChild.textContent=T(en,es); });
}

/* ---------- Content ---------- */
let ITEMS, TASKS, PAPERS, PAGES, GRAMMAR, PHRASAL;
const PH_TOPIC = { rutina:'house', relaciones:'relationships', viajes:'travel', trabajo:'work', problemas:'general', comunicacion:'general', dinero:'money', salud:'health', ocio:'freetime' };
const PACK_KEYS = ['items','tasks','papers','pages','grammar','phrasal'];
const PACK_L = { items:['vocabulary exercises','ejercicios de vocabulario'], tasks:['exam tasks','tareas de examen'], papers:['mock exams','simulacros'], pages:['pages','páginas'], grammar:['grammar topics','temas de gramática'], phrasal:['phrasal verbs','phrasal verbs'] };
const keyOf = (k,x) => k==='phrasal' ? x.v : x.id;
const phId = v => 'ph-'+v.toLowerCase().replace(/[^a-z]+/g,'-');
const meaning = p => LANG==='en' ? (p.en||p.es) : (p.es||p.en);
function withEn(o, en, map){ if(!en) return o; const x=Object.assign({}, o); for(const [from,to] of map) if(en[from]!=null && x[to]==null) x[to]=en[from]; return x; }
function rebuild(){
  const EN=window.LEXI_EN||{};
  ITEMS = new Map();
  for(const it of [...(window.LEXI_CONTENT?.items||[]), ...(window.LEXI_WRITING_EXTRA||[])])
    ITEMS.set(it.id, withEn(it, EN.items?.[it.id], [['exp','exp_en'],['hint','hint_en'],['title','title_en']]));
  TASKS = new Map((window.LEXI_TASKS||[]).map(t=>[t.id,t]));
  PAPERS = new Map((window.LEXI_PAPERS||[]).map(p=>[p.id, EN.papers?.[p.id] ? Object.assign({}, p, { title_en:EN.papers[p.id] }) : p]));
  PAGES = new Map([...(window.LEXI_GUIDES||[]), ...(window.LEXI_WRITING_PAGES||[]), ...(window.LEXI_SPEAKING_PAGES||[])]
    .map(p=>[p.id, withEn(p, EN.pages?.[p.id], [['title','title_en'],['html','html_en'],['group','group_en']])]));
  GRAMMAR = new Map((window.LEXI_GRAMMAR||[]).map(g=>[g.id, withEn(g, EN.grammar?.[g.id], [['title','title_en'],['html','html_en']])]));
  PHRASAL = new Map((window.LEXI_PHRASAL||[]).map(p=>[p.v, EN.phrasal?.[p.v] ? Object.assign({}, p, { en:EN.phrasal[p.v] }) : p]));
  for(const p of S.packs){
    if(p.off) continue;
    for(const it of (p.items||[])) ITEMS.set(it.id, Object.assign({}, it, { pack:p.id }));
    for(const t of (p.tasks||[])) TASKS.set(t.id, Object.assign({}, t, { pack:p.id }));
    for(const x of (p.papers||[])) PAPERS.set(x.id, x);
    for(const x of (p.pages||[])) PAGES.set(x.id, Object.assign({}, x, { pack:p.id }));
    for(const x of (p.grammar||[])) GRAMMAR.set(x.id, x);
    for(const x of (p.phrasal||[])) PHRASAL.set(x.v, Object.assign({ theme:'otros', level:'B1' }, x, { pack:p.id }));
  }
  // Every phrasal verb also becomes a gap exercise in context for the daily sessions
  for(const p of PHRASAL.values()){
    const ex=(p.ex||[]).find(e=>(e.match(/\*/g)||[]).length===2); if(!ex) continue;
    const id=phId(p.v); if(ITEMS.has(id)) continue;
    const other=(p.ex||[]).find(e=>e!==ex), oth=other?other.replace(/\*/g,''):'';
    const es=p.es||p.en, en=p.en||p.es;
    ITEMS.set(id, { id, type:'gap', cat:'phrasal', level:p.level||'B1', topic:PH_TOPIC[p.theme]||'general', word:p.v,
      prompt:ex.replace(/\*([^*]+)\*/,'___'), answers:[ex.match(/\*([^*]+)\*/)[1]], hintAlways:true, auto:true,
      hint:`${p.v}: ${es}`, hint_en:`${p.v}: ${en}`,
      exp:`${p.v} = ${es}.${p.sep?' Separable.':''}${oth?' Otro ejemplo: '+oth:''}`,
      exp_en:`${p.v} = ${en}.${p.sep?' Separable.':''}${oth?' Another example: '+oth:''}` });
  }
}
const SP_EN = window.LEXI_EN?.speaking||[];
(window.LEXI_SPEAKING?.part3||[]).forEach((x,i)=>{ if(SP_EN[i]) x.title_en=SP_EN[i]; });
rebuild();

let view='home', current=null, editing=null, exportCache=null, pageRef=null, resultId=null, sp=null, irrFilter='', phrFilter='', phrTheme='', pendingImport=null, noteId=null, openPack=null;

/* ---------- Utilities ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICONS = {
  back:'<path d="M15 5l-7 7 7 7"/>', close:'<path d="M6 6l12 12M18 6 6 18"/>', chev:'<path d="M9 5l7 7-7 7"/>',
  play:'<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>', stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="1" fill="currentColor"/>',
  rec:'<circle cx="12" cy="12" r="6" fill="currentColor"/>', check:'<path d="M5 12.5l4.5 4.5L19 7"/>', x:'<path d="M7 7l10 10M17 7 7 17"/>',
  speaker:'<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  go:'<path d="M5 12h13M13 6l6 6-6 6"/>', mail:'<path d="M3.5 6h17v12h-17z"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  book:'<path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/><path d="M8 7h8"/>', pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>', chart:'<path d="M4 20h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/>',
  flag:'<path d="M5 21V3"/><path d="M5 4h14v10H5z"/><path d="M5 4l14 10"/>', clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'
};
const ic = (n, cls='') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const BRAND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 21.5 19.5h-19z" fill="none" stroke="var(--course)" stroke-width="2.6" stroke-linejoin="round"/></svg>';
// One ISOM symbol per skill, the same on every screen (sections spanning several skills get none)
const SKILL_SW = { vocab:'open', grammar:'thicket', uoe:'thicket', reading:'rough', listening:'water', writing:'contour', speaking:'rock' };
function skillOfPage(g){ if(g.section==='writing') return 'writing'; if(g.section==='speaking') return 'speaking';
  const t=(g.title_en||g.title||'').toLowerCase(); for(const k of ['reading','listening','writing','speaking']) if(t.startsWith(k)||t.includes(' '+k)) return k; return null; }
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function buzz(p){ try{ if(navigator.vibrate && !reduced()) navigator.vibrate(p); }catch(e){} }
function applyTheme(){ const t=S.settings.theme; if(t==='light'||t==='dark') document.documentElement.dataset.theme=t; else delete document.documentElement.dataset.theme; }
function dayKey(t = Date.now()){ const d = new Date(t); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function startOfDay(t){ const d = new Date(t); d.setHours(0,0,0,0); return d.getTime(); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function iso(t){ return new Date(t).toISOString(); }
function fmtDate(t){ return new Date(t).toLocaleDateString(LOCALE(),{ day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); }
function mmss(ms){ const s=Math.max(0,Math.round(ms/1000)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function norm(s){ return String(s||'').toLowerCase().replace(/[’‘`´]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim().replace(/[.!?,;:]+$/,'').trim(); }
function lev(a,b){
  const m=a.length,n=b.length; if(Math.abs(m-n)>2) return 9;
  let prev=Array.from({length:n+1},(_,j)=>j);
  for(let i=1;i<=m;i++){ const cur=[i]; for(let j=1;j<=n;j++){ cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)); } prev=cur; }
  return prev[n];
}
function words(s){
  let t = norm(s)
    .replace(/\bcan't\b/g,'cannot').replace(/\bwon't\b/g,'will not').replace(/\bshan't\b/g,'shall not')
    .replace(/\b(\w+)n't\b/g,'$1 not').replace(/\bi'm\b/g,'i am').replace(/\b(\w+)'re\b/g,'$1 are')
    .replace(/\b(\w+)'ve\b/g,'$1 have').replace(/\b(\w+)'ll\b/g,'$1 will').replace(/\b(\w+)'d\b/g,'$1 would')
    .replace(/\b(it|he|she|that|there|what|where|who|here|how)'s\b/g,'$1 is')
    .replace(/\bcan not\b/g,'cannot').replace(/[^a-z0-9'\s-]/g,' ').replace(/-/g,' ');
  return t.split(/\s+/).filter(Boolean);
}
function lcsMatch(a,b){
  const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=m-1;i>=0;i--) for(let j=n-1;j>=0;j--) dp[i][j]= a[i]===b[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j],dp[i][j+1]);
  const hit=new Set(); let i=0,j=0;
  while(i<m&&j<n){ if(a[i]===b[j]){hit.add(i);i++;j++;} else if(dp[i+1][j]>=dp[i][j+1]) i++; else j++; }
  return hit;
}
function toast(msg){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.textContent=msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(), 3000);
}
function fmtText(s){ return String(s).split(/\n{2,}/).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join(''); }
function wc(t){ return (String(t).trim().match(/\S+/g)||[]).length; }

/* ---------- Voice ---------- */
let voiceA=null, voiceB=null;
function pickVoices(){
  if(!('speechSynthesis' in window)) return;
  const vs=speechSynthesis.getVoices().filter(v=>v.lang && v.lang.toLowerCase().startsWith('en'));
  const gb=vs.filter(v=>v.lang==='en-GB'||v.lang==='en_GB');
  const pool=gb.length>=2?gb:vs;
  voiceA=pool[0]||null; voiceB=pool.find(v=>v!==voiceA)||voiceA;
}
if('speechSynthesis' in window){ pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
function hasVoice(){ if(!('speechSynthesis' in window)){ toast(T('This browser has no voice. Try Chrome or Safari.','Este navegador no tiene voz. Prueba con Chrome o Safari.')); return false; } return true; }
function speak(text, rate=0.95){
  if(!hasVoice()) return; speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text); u.lang='en-GB'; u.rate=rate; if(voiceA) u.voice=voiceA;
  speechSynthesis.speak(u);
}
function speakScript(lines, rate=0.92){
  if(!hasVoice()) return; speechSynthesis.cancel();
  for(const [who,text] of lines){
    const u=new SpeechSynthesisUtterance(text); u.lang='en-GB'; u.rate=rate;
    const v= who==='B'?voiceB:voiceA; if(v) u.voice=v;
    if(voiceA===voiceB) u.pitch = who==='B'?0.8:1.2;
    speechSynthesis.speak(u);
  }
}
function stopSpeech(){ if('speechSynthesis' in window) speechSynthesis.cancel(); }

/* ---------- Spaced repetition (vocabulary) ---------- */
function schedule(id, result){
  const now=Date.now(); const isNew=!S.srs[id];
  const s=S.srs[id] || { e:2.5, i:0, r:0, l:0, first:now };
  if(result==='bad'){ s.l++; s.r=0; s.i=0; s.e=Math.max(1.3, s.e-0.2); s.due=now+10*60000; }
  else {
    s.r++; s.i = s.r===1 ? 1 : s.r===2 ? 3 : Math.round(Math.max(1,s.i)*s.e);
    if(result==='near'){ s.e=Math.max(1.3, s.e-0.15); s.i=Math.max(1, Math.round(s.i*0.6)); } else s.e=Math.min(3, s.e+0.05);
    s.due = startOfDay(now) + s.i*DAY + 4*3600e3;
  }
  s.last=now; S.srs[id]=s; return isNew;
}
function today(){ const k=dayKey(); return S.daily[k] || (S.daily[k]={ n:0, ok:0, nw:0 }); }
function practiceItems(){ return [...ITEMS.values()].filter(i=>i.type!=='writing' && !i.retired); }
function counts(){
  const now=Date.now(), items=practiceItems();
  const due=items.filter(i=>S.srs[i.id] && S.srs[i.id].due<=now).length;
  const unseen=items.filter(i=>!S.srs[i.id]).length;
  const newLeft=Math.max(0, S.settings.newPerDay - (S.daily[dayKey()]?.nw||0));
  const learned=items.filter(i=>S.srs[i.id] && S.srs[i.id].i>=3).length;
  const mastered=items.filter(i=>S.srs[i.id] && S.srs[i.id].i>=21).length;
  return { due, unseen, newAvail:Math.min(unseen,newLeft), learned, mastered, total:items.length, streak:streak() };
}
function activeDay(k){ return (S.daily[k]?.n||0) + (S.daily[k]?.t||0) > 0; }
function streak(){ let n=0, t=Date.now(); if(!activeDay(dayKey(t))) t-=DAY; while(activeDay(dayKey(t))){ n++; t-=DAY; } return n; }
function buildQueue(size, extra){
  const now=Date.now(), items=practiceItems();
  if(extra) return shuffle(items.filter(i=>S.srs[i.id]).sort((a,b)=>S.srs[a.id].due-S.srs[b.id].due).slice(0,size).map(i=>i.id));
  const due=items.filter(i=>S.srs[i.id] && S.srs[i.id].due<=now).sort((a,b)=>S.srs[a.id].due-S.srs[b.id].due);
  let q = due.slice(0,size).map(i=>i.id);
  const room=Math.min(size-q.length, Math.max(0, S.settings.newPerDay - today().nw));
  if(room>0){
    const fresh=items.filter(i=>!S.srs[i.id]);
    const packs=shuffle(fresh.filter(i=>i.pack)), b1=shuffle(fresh.filter(i=>!i.pack && i.level!=='B2')), b2=shuffle(fresh.filter(i=>!i.pack && i.level==='B2'));
    const mixed=[...packs]; while(b1.length||b2.length){ for(let k=0;k<3&&b1.length;k++) mixed.push(b1.shift()); if(b2.length) mixed.push(b2.shift()); }
    q = q.concat(mixed.slice(0,room).map(i=>i.id));
  }
  return shuffle(q);
}
function grade(item, ans){
  if(item.type==='mcq') return ans===item.answer ? 'ok' : 'bad';
  if(item.type==='dictation'){
    const a=words(item.text), b=words(ans); if(!b.length) return 'bad';
    const err=Math.max(a.length,b.length)-lcsMatch(a,b).size;
    return err===0 ? 'ok' : (err===1 && a.length>=5 ? 'near' : 'bad');
  }
  const n=norm(ans); if(!n) return 'bad';
  const list=(item.answers||[]).map(norm);
  if(list.includes(n)) return 'ok';
  if(list.some(x=>x.length>=5 && lev(x,n)===1)) return 'near';
  return 'bad';
}
function correctText(item){ return item.type==='mcq' ? item.answer : item.type==='dictation' ? item.text : (item.answers||[])[0]||''; }
function startSession(size, extra){
  const q=buildQueue(size, extra);
  if(!q.length){ toast(T('No exercises available right now.','No hay ejercicios disponibles ahora mismo.')); return; }
  S.session={ q, i:0, retried:[], results:[], started:Date.now(), answered:-1 }; current=null; trackPos=0; save(); go('session');
}
function check(ans){
  const ss=S.session; if(!current || current.checked || !ss) return;
  const item=ITEMS.get(current.id), res=grade(item, ans), ms=Date.now()-current.start;
  current.checked=true; current.result=res; current.answer=ans; ss.answered=ss.i;
  const isNew=schedule(item.id, res);
  const d=today(); d.n++; if(res!=='bad') d.ok++; if(isNew) d.nw++;
  S.attempts.push({ id:item.id, t:Date.now(), r:res, ms, a:String(ans||'').slice(0,300) });
  ss.results.push({ id:item.id, r:res });
  if(res==='bad' && !ss.retried.includes(item.id)){ ss.retried.push(item.id); ss.q.splice(Math.min(ss.q.length, ss.i+4), 0, item.id); }
  exportCache=null; save(); render();
  if(res==='bad'){ $('.card')?.classList.add('shake'); buzz([30,40,30]); } else buzz(12);
  if(item.type!=='mcq') setTimeout(()=>$('#next')?.focus(), 50);
}
function next(){ if(!S.session) return; S.session.i++; current=null; save(); render(); }

/* ---------- Rendering ---------- */
const FOCUS = ['session','run','wmock'];
function go(v){
  const swap=()=>{ view=v; stopSpeech(); window.scrollTo(0,0); render(); };
  if(document.startViewTransition && !reduced() && v!==view) document.startViewTransition(swap); else swap();
}
const TAB_OF = { templates:'study', note:'study', home:'home', session:'home', progress:'home', study:'study', page:'study', speak:'study', tests:'tests', run:'tests', result:'tests', writing:'writing', write:'writing', wmock:'writing', data:'data' };
function render(){
  document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-current', b.dataset.go===TAB_OF[view] ? 'page' : 'false'));
  $('#tabs').classList.toggle('hidden', FOCUS.includes(view));
  $('#app').classList.toggle('focus', FOCUS.includes(view));
  const fn={ home:renderHome, session:renderSession, progress:renderProgress, study:renderStudy, page:renderPage, speak:renderSpeak,
    tests:renderTests, run:renderRun, templates:renderTemplates, note:renderNote, result:renderResult, writing:renderWriting, write:renderWrite, wmock:renderWMock, data:renderData }[view] || renderHome;
  $('#app').innerHTML = fn();
  afterRender();
}
function header(){
  return `<div class="top"><div class="brand">${BRAND}Lexi</div><div class="row"><span class="date">${esc(new Date().toLocaleDateString(LOCALE(),{weekday:'short', day:'numeric', month:'short'}))}</span>
    <button class="langbtn" data-act="togglelang" aria-label="${T('Change language','Cambiar idioma')}">${LANG==='en'?'EN':'ES'}</button></div></div>`;
}
function backBar(title, to){ return `<div class="sess-top"><button class="icon-btn" data-go="${to}" aria-label="${T('Back','Volver')}">${ic('back')}</button><b style="flex:1">${esc(title)}</b></div>`; }

/* ---------- The course: today's plan drawn as controls on a purple line ---------- */
// Legs animate from data-from to data-to after each render (see afterRender)
function legHTML(from, to){ return `<div class="leg" data-to="${to}" style="transform:scaleX(${from})"></div>`; }
function ctrlHTML(o){
  const tag=o.attr?'button':'div';
  return `<${tag} class="ctrl ${o.cls||''}${o.state?' '+o.state:''}" ${o.attr||''} ${o.aria?`aria-label="${esc(o.aria)}"`:''}><span class="mk">${o.mark||''}${o.num?`<span class="num">${o.num}</span>`:''}</span><span class="lb">${o.label}</span></${tag}>`;
}
function suggestTest(){
  const scored=[...GRAMMAR.values()].map(g=>({ g, p:bestOf('topic',g.id) }));
  const pick=scored.find(x=>x.p===null) || scored.filter(x=>x.p<80).sort((a,b)=>a.p-b.p)[0];
  return pick ? { attr:`data-topic="${esc(pick.g.id)}"`, label:L(pick.g,'title') } : { attr:'data-go="tests"', label:T('Any test','Cualquier test') };
}
function weekHTML(){
  const out=[]; for(let k=6;k>=0;k--){ const t=Date.now()-k*DAY, key=dayKey(t);
    out.push(`<div class="${activeDay(key)?'on':''}${k===0?' now':''}"><i></i>${esc(new Date(t).toLocaleDateString(LOCALE(),{weekday:'narrow'}))}</div>`); }
  return `<div class="week" aria-label="${T('Days studied this week','Días estudiados esta semana')}">${out.join('')}</div>`;
}

/* ---------- Home ---------- */
function renderHome(){
  const c=counts(), ss=S.session, size=S.settings.sessionSize, d=today();
  const pending=ss && ss.i<ss.q.length;
  const unread=S.messages.filter(m=>!m.read).slice(-1)[0];
  const since=S.attempts.filter(a=>a.t>S.lastExportAt).length + S.tests.filter(t=>t.at>S.lastExportAt).length*5;
  const daysSinceExport=S.lastExportAt ? Math.floor((Date.now()-S.lastExportAt)/DAY) : null;
  const sug=suggestTest();
  // A leg is 'done' only when something was really done today; nothing to do = 'none' (off today's course)
  const revState = pending || c.due>0 ? 'open' : (d.n-d.nw)>0 ? 'done' : 'none';
  const newState = pending || c.newAvail>0 ? 'open' : d.nw>0 ? 'done' : 'none';
  const testState = (d.t||0)>0 ? 'done' : 'open';
  const legs=[revState,newState,testState], closed=legs.every(x=>x!=='open'), all=closed && activeDay(dayKey());
  let reach=0; for(const x of legs){ if(x==='open') break; reach++; }
  if(!legs.slice(0,reach).includes('done')) reach=0;
  const revDone=revState!=='open', newDone=newState!=='open', testDone=testState==='done';
  const tick=st=>st==='done'?ic('check'):'';
  const startAct=`data-act="${pending?'resume':'start'}"`;
  const course=`<div class="course">${legHTML(0, all?1:reach/4)}
      ${ctrlHTML({ cls:'start', mark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 21 19.5H3z" fill="none" stroke="var(--course)" stroke-width="3" stroke-linejoin="round"/></svg>', label:T('Start','Salida') })}
      ${ctrlHTML({ state:revState, num:1, mark:tick(revState), label:revState==='none'?T('None due','Sin repasos'):T('Review','Repaso'), attr:revState==='open'?startAct:'' })}
      ${ctrlHTML({ state:newState, num:2, mark:tick(newState), label:newState==='none'?T('None left','Sin nuevas'):T('New','Nuevas'), attr:newState==='open'?startAct:'' })}
      ${ctrlHTML({ state:testState, num:3, mark:tick(testState), label:'Test', attr:testState==='open'?sug.attr:'' })}
      ${ctrlHTML({ cls:'finish', state:all?'done':'', label:T('Finish','Meta') })}</div>`;
  const table=`<table class="cd"><tbody>
      <tr><th>1</th><td class="sym"><i class="sw open"></i></td><td>${T('Reviews due','Repasos pendientes')}</td><td class="v">${c.due||'–'}</td></tr>
      <tr><th>2</th><td class="sym"><i class="sw open"></i></td><td>${T('New words','Palabras nuevas')}</td><td class="v">${c.newAvail||'–'}</td></tr>
      <tr><th>3</th><td class="sym">${ic('flag')}</td><td>${esc(sug.label)}</td><td class="v">${testDone?ic('check','sm'):'Test'}</td></tr></tbody></table>`;
  let title, lead, go;
  if(pending){
    title=T('Session in progress','Sesión a medias'); lead=T(`You're on exercise ${ss.i+1} of ${ss.q.length}.`,`Vas por el ejercicio ${ss.i+1} de ${ss.q.length}.`);
    go=`<button class="btn primary big block" data-act="resume">${T('Continue','Continuar')} ${ic('go')}</button><button class="btn ghost block" data-act="discard">${T('Discard and start a new one','Descartar y empezar otra')}</button>`;
  } else if(c.due+c.newAvail>0){
    title=T("Today's course",'Recorrido de hoy'); lead=T(`Sessions of ${size} exercises. You can stop halfway whenever you like.`,`Sesiones de ${size} ejercicios. Puedes dejarlas a medias cuando quieras.`);
    go=`<button class="btn primary big block" data-act="start">${T('Go','Salir')} ${ic('go')}</button><button class="btn block" data-act="quick">${T('Quick session (5)','Sesión rápida de 5')}</button>`;
  } else if(!testDone){
    title=T('Vocabulary up to date','Vocabulario al día'); lead=T('One control left: a short test closes today\'s course.','Queda un control: un test corto cierra el recorrido de hoy.');
    go=`<button class="btn primary big block" ${sug.attr}>${T('Take the test','Hacer el test')} ${ic('go')}</button><button class="btn ghost block" data-act="extra" ${Object.keys(S.srs).length?'':'disabled'}>${T('Extra vocabulary review','Repaso extra de vocabulario')}</button>`;
  } else {
    title=T('Course complete','Recorrido completo'); lead=T('Reviews come back when they are due. Anything else today is a bonus.','Los repasos vuelven cuando toca. Lo que hagas hoy ya es extra.');
    go=`<button class="btn primary big block" data-act="extra" ${Object.keys(S.srs).length?'':'disabled'}>${T('Extra review','Repaso extra')} ${ic('go')}</button>`;
  }
  const run=S.run, wm=S.wmock;
  return `${header()}
    <section class="today"><h1>${title}</h1><p class="lead">${lead}</p>${course}${table}<div class="go">${go}</div></section>
    ${unread?`<div class="panel note"><h3>${ic('mail')}${T('Note from Claude','Nota de Claude')}</h3><p style="white-space:pre-wrap">${esc(unread.text)}</p><button class="btn ghost" data-act="readmsg">${T('Mark as read','Marcar como leída')}</button></div>`:''}
    ${run?`<div class="panel note run"><h3>${ic('clock')}${esc(run.title)}: ${T('in progress','a medias')}</h3><button class="btn block" data-go="run">${T('Continue','Continuar')}</button></div>`:''}
    ${wm?`<div class="panel note run"><h3>${ic('clock')}${T('Writing mock exam in progress','Simulacro de Writing en curso')}</h3><button class="btn block" data-go="wmock">${T('Continue','Continuar')}</button></div>`:''}
    <h2>${T('This week','Esta semana')}</h2>${weekHTML()}
    <p class="small muted" style="margin-top:10px">${c.streak?T(`${c.streak}-day streak · ${c.learned} words learnt · ${S.tests.length} tests`,`${c.streak} ${c.streak===1?'día':'días'} seguidos · ${c.learned} palabras aprendidas · ${S.tests.length} tests`):T(`${c.learned} words learnt · ${S.tests.length} tests`,`${c.learned} palabras aprendidas · ${S.tests.length} tests`)}</p>
    <h2>${T('Map legend','Leyenda')}</h2>
    <ul class="legend">
      <li><button data-go="study">${ic('book')}<span><b>${T('Study','Estudiar')}</b><span>${T('Grammar, irregular verbs, phrasal verbs and exam guides','Gramática, irregulares, phrasal verbs y guías del examen')}</span></span>${ic('chev','sm')}</button></li>
      <li><button data-go="tests">${ic('flag')}<span><b>Tests</b><span>${T('By topic, by part and timed mock exams','Por temas, por partes y simulacros cronometrados')}</span></span>${ic('chev','sm')}</button></li>
      <li><button data-go="writing">${ic('pen')}<span><b>${T('Write','Escribir')}</b><span>${T('Emails, articles and stories for Claude to mark','Emails, artículos e historias para que corrija Claude')}</span></span>${ic('chev','sm')}</button></li>
      <li><button data-go="progress">${ic('chart')}<span><b>${T('Progress','Progreso')}</b><span>${T('Statistics, mock scores and hardest words','Estadísticas, simulacros y palabras difíciles')}</span></span>${ic('chev','sm')}</button></li>
    </ul>
    ${since>=30 && (daysSinceExport===null || daysSinceExport>=7) ? `<div class="panel note" style="margin-top:14px"><h3>${ic('mail')}${T('Time for a review with Claude','Toca revisar con Claude')}</h3><p class="small">${T("You have a lot of activity that hasn't been exported. Copy your updates and paste them in the chat.",'Tienes bastante actividad sin exportar. Copia tus novedades y pégalas en el chat.')}</p><button class="btn block" data-go="data">${T('Go to export','Ir a exportar')}</button></div>`:''}`;
}

/* ---------- Vocabulary session ---------- */
let trackPos=0;
function sentenceHTML(prompt, fill, cls){
  const parts=String(prompt).split('___');
  if(parts.length<2) return `<p class="sentence">${esc(prompt)}</p>`;
  return `<p class="sentence">${parts.map(esc).join(`<span class="slot ${cls||''}">${fill?esc(fill):'&nbsp;'}</span>`)}</p>`;
}
// One control per exercise on the purple line; answered ones are punched (filled) or crossed
function trackHTML(ss, curRes){
  const n=ss.q.length, to=n>1 ? Math.min(1, ss.i/(n-1)) : 1;
  const dots=ss.q.map((_,k)=>{ const r=k<ss.i ? ss.results[k]?.r : k===ss.i ? curRes : null;
    return `<i class="${k===ss.i&&!curRes?'cur':''} ${r||''}"></i>`; }).join('');
  const html=`<div class="track" aria-hidden="true"><div class="leg" data-to="${to}" style="transform:scaleX(${trackPos})"></div>${dots}</div>`;
  trackPos=to; return html;
}
function renderSession(){
  const ss=S.session;
  if(!ss) return renderHome();
  if(!current && ss.answered===ss.i) ss.i++; // answered but left before pressing "Next": don't count it twice
  if(ss.i>=ss.q.length) return renderSummary();
  const item=ITEMS.get(ss.q[ss.i]);
  if(!item){ ss.i++; save(); return renderSession(); }
  if(!current || current.idx!==ss.i || current.id!==item.id)
    current={ id:item.id, idx:ss.i, start:Date.now(), checked:false, result:null, answer:'', showHint:false, opts:item.options ? shuffle([...item.options]) : null };
  const done=current.checked, res=current.result, correct=correctText(item);
  const hint=L(item,'hint'), exp=L(item,'exp');
  let body='', answer='', foot='';
  const ch=`<div class="ch"><span class="n">${ss.i+1}</span><span class="t">${esc(lab(CAT_L,item.cat)||T('Exercise','Ejercicio'))}</span><span class="lv">${esc(item.level||'')}</span></div>`;
  if(item.type==='dictation'){
    body=`<div class="card sheet">${ch}<div class="cb" style="text-align:center"><button class="play" data-act="say" aria-label="${T('Listen to the sentence','Escuchar la frase')}">${ic('play')}</button>
      <div style="margin-top:12px"><button class="btn ghost" data-act="sayslow">${T('Listen more slowly','Escuchar más despacio')}</button></div>
      ${done?`<p class="sentence diff" style="margin-top:14px;font-size:21px">${dictDiff(item.text, current.answer)}</p>`:''}</div></div>`;
  } else if(item.type==='translate'){
    body=`<div class="card sheet">${ch}<div class="cb"><div class="small muted" style="margin-bottom:6px">${T('In Spanish:','En español:')}</div><div class="es">${esc(item.es)}</div>${done?`<p class="sentence" style="margin-top:12px"><span class="slot ${res}">${esc(correct)}</span></p>`:''}</div></div>`;
  } else {
    const fill = done ? (item.type==='mcq' ? item.answer : (res==='ok' ? current.answer.trim() : correct)) : '';
    body=`<div class="card sheet">${ch}<div class="cb">${sentenceHTML(item.prompt, fill, done?(res==='bad'?'ok':res):'')}
      ${item.type==='wordform'?`<div class="base">${esc(item.base)}</div>`:''}
      ${hint && (done ? !exp : (current.showHint||item.hintAlways))?`<div class="hint">${esc(hint)}</div>`:''}</div></div>`;
  }
  if(item.type==='mcq'){
    answer=`<div class="opts">${current.opts.map((o,i)=>{ let cls=''; if(done){ if(o===item.answer) cls='ok'; else if(o===current.answer) cls='bad'; }
      return `<button class="opt ${cls}" data-opt="${esc(o)}" ${done?'disabled':''}><span class="ol">${'ABCDEF'[i]}</span><span class="ot">${esc(o)}</span></button>`; }).join('')}</div>`;
  } else if(!done){
    foot=`<input id="ans" class="field" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${item.type==='dictation'?T('Write what you hear','Escribe lo que oyes'):T('Your answer','Tu respuesta')}" aria-label="${T('Your answer','Tu respuesta')}">
      <div class="actions"><button class="btn primary block" data-act="check">${T('Check','Comprobar')}</button>
      <div class="row">${hint&&!item.hintAlways?`<button class="btn ghost" data-act="hint">${T('Hint','Pista')}</button>`:''}<button class="btn ghost" data-act="dunno" style="margin-left:auto">${T("I don't know",'No lo sé')}</button></div></div>`;
  }
  if(done){
    const title = res==='ok' ? T('Correct','Correcto') : res==='near' ? T('Almost: check the spelling','Casi: revisa la ortografía') : T('Not quite','No es correcto');
    const listen = item.type==='dictation' ? item.text : (item.prompt ? item.prompt.replace('___', correct) : correct);
    const rows=[];
    if(res!=='ok') rows.push(`<tr><td class="k">${T('Answer','Respuesta')}</td><td class="ans">${esc(correct)}</td></tr>`);
    if(res==='bad' && item.type!=='dictation' && item.type!=='mcq') rows.push(`<tr><td class="k">${T('Yours','La tuya')}</td><td>${esc(current.answer)||T('(blank)','(en blanco)')}</td></tr>`);
    if(exp) rows.push(`<tr><td class="k">${T('Why','Por qué')}</td><td class="small">${esc(exp)}</td></tr>`);
    foot=`<div class="verdict ${res}"><span class="mk">${ic(res==='bad'?'x':'check')}</span><h3>${title}</h3>
        <button class="icon-btn sm" style="margin-left:auto" data-say="${esc(listen)}" aria-label="${T('Listen to the sentence','Escuchar la frase')}">${ic('speaker','sm')}</button></div>
      ${rows.length?`<div class="fbt"><table class="cd"><tbody>${rows.join('')}</tbody></table></div>`:''}
      <button class="btn primary block big" id="next" data-act="next">${T('Next','Siguiente')} ${ic('go')}</button>`;
  }
  return `<div class="sess-top"><button class="icon-btn" data-act="quit" aria-label="${T('Exit','Salir')}">${ic('close')}</button>
      ${trackHTML(ss, done?res:null)}<span class="count">${ss.i+1}/${ss.q.length}</span></div>
    ${body}${answer}
    <div class="foot">${foot}</div>`;
}
function dictDiff(text, ans){
  const raw=text.split(/\s+/), a=words(text), b=words(ans);
  if(a.length!==raw.length) return esc(text);
  const hit=lcsMatch(a,b); return raw.map((w,i)=>hit.has(i)?esc(w):`<span class="miss">${esc(w)}</span>`).join(' ');
}
function renderSummary(){
  const ss=S.session, first={}; for(const r of ss.results) if(!(r.id in first)) first[r.id]=r.r;
  const ids=Object.keys(first), ok=ids.filter(id=>first[id]!=='bad').length;
  const failed=ids.filter(id=>first[id]==='bad').map(id=>ITEMS.get(id)).filter(Boolean);
  const dots=ss.results.map(r=>`<i class="${r.r}"></i>`).join('');
  trackPos=0;
  return `<div class="sess-top"><button class="icon-btn" data-act="finish" aria-label="${T('Back to home','Volver al inicio')}">${ic('close')}</button>
      <div class="track" aria-hidden="true"><div class="leg" data-to="1" style="transform:scaleX(0)"></div>${dots}</div><span class="count">${T('Finish','Meta')}</span></div>
    <h1>${T('Session complete','Sesión terminada')}</h1>
    <div class="score"><b>${ok}/${ids.length}</b><span>${T('right first time','a la primera')}</span></div>
    ${failed.length?`<h2>${T('To review','Para repasar')}</h2><table class="cd"><tbody>${failed.map((i,k)=>`<tr><th>${k+1}</th><td><b>${esc(i.word||correctText(i))}</b><div class="small muted">${esc(L(i,'exp')||'')}</div></td></tr>`).join('')}</tbody></table>`:`<p class="muted">${T('A clean run: every control punched first time.','Recorrido limpio: todos los controles a la primera.')}</p>`}
    <div class="foot"><div class="actions"><button class="btn primary big block" data-act="again">${T('Another session','Otra sesión')} ${ic('go')}</button><button class="btn block" data-act="finish">${T('Back to home','Volver al inicio')}</button></div></div>`;
}

/* ---------- Study ---------- */
function bestOf(kind, ref){ const ts=S.tests.filter(t=>t.kind===kind && t.ref===ref); return ts.length ? Math.max(...ts.map(t=>Math.round(t.score/t.max*100))) : null; }
function badge(p){ return p===null ? '' : `<span class="pct ${p>=80?'hi':p>=60?'mid':'lo'}">${p}%</span>`; }
function readMark(id){ return S.read[id] ? `<span class="tick" aria-label="${T('Read','Leído')}">${ic('check','sm')}</span>` : ''; }
function groupOf(p){ const g=L(p,'group')||p.group||'Más'; return LANG==='en' ? (GROUP_EN[g]||g) : g; }
function renderStudy(){
  const pages=[...PAGES.values()], sec=s=>pages.filter(g=>g.section===s);
  const li=g=>{ const k=skillOfPage(g); return `<li><button class="rowbtn" data-page="guide:${esc(g.id)}">${k?`<i class="sw ${SKILL_SW[k]}"></i>`:'<i class="sw none"></i>'}<span class="rt">${esc(L(g,'title'))}</span>${readMark(g.id)||ic('chev','sm')}</button></li>`; };
  const wp=sec('writing'), groups=[...new Set(wp.map(groupOf))];
  const notes=sec('notes'), raw=S.rawNotes.filter(n=>n.status!=='converted');
  const learnedPh=[...PHRASAL.values()].filter(p=>{ const s=S.srs[phId(p.v)]; return s && s.i>=3; }).length;
  return `${header()}<h1>${T('Study','Estudiar')}</h1><p class="muted">${T('Your theory book and your notes.','Tu libro de teoría y tus apuntes.')}</p>
    <h2>${T('My notes','Mis apuntes')}</h2>
    ${notes.length?`<ul class="list">${notes.map(li).join('')}</ul>`:`<p class="small muted">${T('Your notes will appear here once Claude sends them back converted.','Aquí aparecerán tus apuntes cuando Claude te los devuelva convertidos.')}</p>`}
    ${raw.length?`<ul class="list">${raw.map(n=>`<li><button class="rowbtn" data-note="${esc(n.id)}"><span>${esc(n.title||T('Untitled note','Apunte sin título'))}<br><span class="small muted">${n.status==='ready'?T('Ready to send to Claude','Listo para enviar a Claude'):T('Draft','Borrador')}</span></span>${ic('chev','sm')}</button></li>`).join('')}</ul>`:''}
    <div class="row"><button class="btn" data-go="templates">${T('Note templates','Plantillas de apuntes')}</button><button class="btn" data-newnote="">${T('New note','Nuevo apunte')}</button></div>
    <h2>${T('The exam','El examen')}</h2><ul class="list">${sec('exam').map(li).join('')}</ul>
    <h2>${T('Grammar','Gramática')}</h2><ul class="list">${[...GRAMMAR.values()].map(g=>`<li><button class="rowbtn" data-page="grammar:${esc(g.id)}"><i class="sw thicket"></i><span class="rt">${esc(L(g,'title'))}</span><span class="row"><span class="chip">${esc(g.level)}</span>${badge(bestOf('topic',g.id))}${readMark(g.id)}</span></button></li>`).join('')}</ul>
    <h2>Writing</h2>${groups.map(g=>`<h3 class="sub">${esc(g)}</h3><ul class="list">${wp.filter(p=>groupOf(p)===g).map(li).join('')}</ul>`).join('')}
    <h2>${T('Vocabulary','Vocabulario')}</h2><ul class="list">
      <li><button class="rowbtn" data-page="phrasal:"><i class="sw open"></i><span class="rt">${T('Phrasal verbs in context','Phrasal verbs en contexto')} (${PHRASAL.size})<br><span class="small muted">${T(`${learnedPh} learnt in your sessions`,`${learnedPh} aprendidos en tus sesiones`)}</span></span>${badge(bestOf('phrasal','phrasal'))||ic('chev','sm')}</button></li>
      <li><button class="rowbtn" data-page="irregular:"><i class="sw open"></i><span class="rt">${T('Irregular verbs','Verbos irregulares')} (${(window.LEXI_IRREGULAR||[]).length})</span>${badge(bestOf('irregular','irregular'))||ic('chev','sm')}</button></li></ul>
    <h2>Speaking</h2><ul class="list">${sec('speaking').map(li).join('')}<li><button class="rowbtn" data-go="speak"><i class="sw rock"></i><span class="rt">${T('Practise speaking with a timer','Practicar speaking con cronómetro')}</span>${ic('chev','sm')}</button></li></ul>
    ${sec('other').length?`<h2>${T('More','Más')}</h2><ul class="list">${sec('other').map(li).join('')}</ul>`:''}`;
}
function renderPage(){
  const [type,id]=pageRef||[];
  if(type==='guide'){ const g=PAGES.get(id); if(!g) return renderStudy(); if(!S.read[id]){ S.read[id]=Date.now(); save(); }
    return `${backBar(L(g,'title'),'study')}<article class="page">${L(g,'html')}</article>`; }
  if(type==='grammar'){ const g=GRAMMAR.get(id); if(!g) return renderStudy(); if(!S.read[id]){ S.read[id]=Date.now(); save(); }
    return `${backBar(L(g,'title'),'study')}<article class="page">${L(g,'html')}</article>
      <div class="panel"><div class="row spread"><b>${T('Test on this topic','Test de este tema')}</b>${badge(bestOf('topic',id))}</div><p class="small muted">${pl(g.test.length,'question','questions','pregunta','preguntas').replace(/^/,g.test.length+' ')}.</p>
      <button class="btn primary block" data-topic="${esc(id)}">${T('Take the test','Hacer el test')}</button></div>`; }
  if(type==='irregular'){ const f=irrFilter.toLowerCase();
    const rows=(window.LEXI_IRREGULAR||[]).filter(v=>!f || [v.b,v.p,v.pp,v.es].some(x=>x.toLowerCase().includes(f)));
    return `${backBar(T('Irregular verbs','Verbos irregulares'),'study')}
      <button class="btn primary block" data-act="irrtest">${T('Practise 10 verbs','Practicar 10 verbos')}</button><div class="gap"></div>
      <input class="field" id="irrq" placeholder="${T('Search (English or Spanish)','Buscar (inglés o español)')}" value="${esc(irrFilter)}" autocomplete="off" autocapitalize="off">
      <div class="tablewrap"><table class="irr"><thead><tr><th>${T('Infinitive','Infinitivo')}</th><th>${T('Past simple','Pasado')}</th><th>${T('Past participle','Participio')}</th></tr></thead><tbody id="irrbody">${irrRows(rows)}</tbody></table></div>
      <p class="small muted">${T("Tap a verb to hear it. The ones you get wrong come up more often in practice.",'Toca un verbo para escucharlo. Los que falles saldrán más en la práctica.')}</p>`; }
  if(type==='phrasal'){
    const used=[...new Set([...PHRASAL.values()].map(p=>p.theme))];
    return `${backBar(T('Phrasal verbs in context','Phrasal verbs en contexto'),'study')}
      <p class="small muted">${T('Learn each one with its sentences: listen and repeat them out loud. They also appear in your daily vocabulary sessions.','Aprende cada uno con sus frases: escúchalas y repítelas en voz alta. También salen en tus sesiones diarias de vocabulario.')}</p>
      <button class="btn primary block" data-act="phrtest">${T('Test in context (10)','Test en contexto (10)')}</button><div class="gap"></div>
      <input class="field" id="phrq" placeholder="${T('Search (English or Spanish)','Buscar (inglés o español)')}" value="${esc(phrFilter)}" autocomplete="off" autocapitalize="off">
      <div class="chips">${['',...used].map(t=>`<button data-phrtheme="${esc(t)}" aria-pressed="${phrTheme===t}">${esc(t?themeName(t):T('All','Todos'))}</button>`).join('')}</div>
      <div id="phrlist">${phrCards()}</div>`; }
  return renderStudy();
}
function themeName(t){ return LANG==='en' ? (window.LEXI_EN?.themes?.[t]||t) : ((window.LEXI_PHRASAL_THEMES||{})[t]||t); }
function hlEx(e){ return esc(e).replace(/\*([^*]+)\*/g,'<b class="hl">$1</b>'); }
function phrCards(){
  const f=phrFilter.toLowerCase();
  const list=[...PHRASAL.values()].filter(p=>(!phrTheme||p.theme===phrTheme) && (!f || [p.v,p.es,p.en,...(p.ex||[])].join(' ').toLowerCase().includes(f)));
  if(!list.length) return `<p class="muted">${T('Nothing matches that filter.','Nada con ese filtro.')}</p>`;
  return list.map(p=>{ const s=S.srs[phId(p.v)];
    return `<div class="pv"><div class="row spread"><b class="pvv">${esc(p.v)}</b><span class="row">${s&&s.i>=3?`<span class="tick" title="${T('Learnt','Aprendido')}">${ic('check','sm')}</span>`:''}${p.sep?`<span class="chip alt">${T('separable','separable')}</span>`:''}<span class="chip">${esc(p.level||'')}</span></span></div>
      <div class="pves">${esc(meaning(p))}${LANG==='en'&&p.es&&p.en?`<span class="small muted"> · ES: ${esc(p.es)}</span>`:''}</div>
      <ul class="exs">${(p.ex||[]).map(e=>`<li><button class="icon-btn sm" data-say="${esc(e.replace(/\*/g,''))}" aria-label="${T('Listen','Escuchar')}">${ic('play','sm')}</button><span>${hlEx(e)}</span></li>`).join('')}</ul></div>`; }).join('');
}
function irrRows(rows){ return rows.map(v=>`<tr data-say="${esc(v.b+', '+v.p.replace('/',' or ')+', '+v.pp.replace('/',' or '))}"><td><b>${esc(v.b)}</b><div class="small muted">${esc(v.es)}</div></td><td>${esc(v.p)}</td><td>${esc(v.pp)}</td></tr>`).join(''); }

/* ---------- Notes ---------- */
const NOTE_TEMPLATES = [
{ id:'general', title:['General note (grammar, class, video…)','Apunte general (gramática, clase, vídeo…)'], desc:['For theory: an explanation, examples and questions. Claude turns it into a study page with its own test.','Para teoría: una explicación, ejemplos y dudas. Claude lo convierte en una página de estudio con su test.'],
  text:[`### LEXI NOTE ###
Type: grammar / writing / speaking / exam / other
Topic:
Level: B1 / B2
Source: (class, book, video, teacher…)

## Explanation
(In your own words. You can copy what your teacher gave you.)

## Examples
-
-

## Mistakes I make
-

## Questions for Claude
-

## Do you want exercises?
yes / no. How many and what type:`, `### APUNTE LEXI ###
Tipo: gramática / writing / speaking / examen / otro
Tema:
Nivel: B1 / B2
Fuente: (clase, libro, vídeo, profesor…)

## Explicación
(Con tus palabras. Puedes copiar lo que te dio el profesor.)

## Ejemplos
-
-

## Errores que cometo
-

## Dudas para Claude
-

## ¿Quieres ejercicios?
sí / no. Cuántos y de qué tipo:`] },
{ id:'vocab', title:['Vocabulary list','Lista de vocabulario'], desc:['Words or expressions you have seen. Claude adds examples and puts them in your daily sessions.','Palabras o expresiones que has visto. Claude añade ejemplos y las mete en tus sesiones diarias.'],
  text:[`### LEXI VOCABULARY ###
Topic:
Level: B1 / B2
Source:

## Words (word = meaning | sentence where you saw it, if you have it)
- 
- 
- 

## Questions
-`, `### VOCABULARIO LEXI ###
Tema:
Nivel: B1 / B2
Fuente:

## Palabras (palabra = significado | frase donde la viste, si la tienes)
- 
- 
- 

## Dudas
-`] },
{ id:'phrasal', title:['Phrasal verbs and expressions','Phrasal verbs y expresiones'], desc:['Phrasal verbs, collocations or set phrases. Claude adds them to your library with two examples each.','Phrasal verbs, collocations o frases hechas. Claude las añade a tu biblioteca con dos ejemplos cada una.'],
  text:[`### LEXI PHRASAL VERBS ###
Source:

## List (verb = meaning | example if you have one)
- 
- 
- 

## The ones I mix up
-`, `### PHRASAL VERBS LEXI ###
Fuente:

## Lista (verbo = significado | ejemplo si lo tienes)
- 
- 
- 

## Los que confundo entre sí
-`] },
{ id:'mistakes', title:['My mistakes (from class or a corrected writing)','Mis errores (de clase o de un writing corregido)'], desc:['Sentences that were corrected. Claude finds the pattern and creates exercises so you stop repeating it.','Frases que te han corregido. Claude detecta el patrón y te crea ejercicios para no repetirlo.'],
  text:[`### LEXI MISTAKES ###
Source: (writing, class, practice exam…)

## Wrong sentence → corrected sentence
- ✗  →  ✓
- ✗  →  ✓

## What I was told
-`, `### ERRORES LEXI ###
Fuente: (writing, clase, examen de prueba…)

## Frase incorrecta → frase corregida
- ✗  →  ✓
- ✗  →  ✓

## Lo que me explicaron
-`] }];
const tpl = (t,k) => T(t[k][0], t[k][1]);
function renderTemplates(){
  return `${backBar(T('Note templates','Plantillas de apuntes'),'study')}
    <p class="muted">${T('Two ways to use them:','Dos formas de usarlas:')}</p>
    <p>${T('<b>1. In the app:</b> tap "Create note", fill it in and mark it as ready. It will go in your next export.','<b>1. Dentro de la app:</b> pulsa "Crear apunte", rellénalo y márcalo como listo. Irá en tu próxima exportación.')}</p>
    <p>${T('<b>2. Outside:</b> copy the template, fill it in your notes or by hand (you can send a photo) and paste it in the chat.','<b>2. Fuera:</b> copia la plantilla, rellénala en tus notas o a mano (puedes mandarme una foto) y pégamela en el chat.')}</p>
    <p class="small muted">${T('Either way, you get back a pack with your notes as study pages, plus exercises if you ask for them.','En los dos casos te devuelvo un pack con tus apuntes como páginas de estudio, más ejercicios si los pides.')}</p>
    ${NOTE_TEMPLATES.map(t=>`<div class="panel"><h3>${esc(tpl(t,'title'))}</h3><p class="small muted">${esc(tpl(t,'desc'))}</p>
      <details><summary class="small">${T('See template','Ver plantilla')}</summary><pre class="tpl">${esc(tpl(t,'text'))}</pre></details>
      <div class="row" style="margin-top:10px"><button class="btn primary" data-newnote="${t.id}">${T('Create note','Crear apunte')}</button><button class="btn" data-copytpl="${t.id}">${T('Copy','Copiar')}</button></div></div>`).join('')}`;
}
function newNote(tplId){
  const t=NOTE_TEMPLATES.find(x=>x.id===tplId);
  const n={ id:'n'+Date.now().toString(36), title:'', template:tplId||'free', text:t?tpl(t,'text'):'', status:'draft', createdAt:Date.now(), updatedAt:Date.now() };
  S.rawNotes.push(n); save(); noteId=n.id; go('note');
}
function renderNote(){
  const n=S.rawNotes.find(x=>x.id===noteId); if(!n) return renderStudy();
  return `${backBar(T('Note','Apunte'),'study')}
    <input class="field" id="ntitle" placeholder="${T("Title (e.g. Conditionals, Tuesday's class)",'Título (p. ej. Condicionales, clase del martes)')}" value="${esc(n.title)}" style="margin-bottom:10px">
    <textarea class="field" data-note="${esc(n.id)}" style="min-height:380px;font-size:15px" spellcheck="false">${esc(n.text)}</textarea>
    <div class="row spread" style="margin:8px 0 14px"><span class="small muted">${n.status==='ready'?T('Ready: it will go in your next export.','Listo: irá en tu próxima exportación.'):T("Draft: it won't be sent until you mark it as ready.",'Borrador: no se envía hasta que lo marques como listo.')}</span><span class="small muted" data-saved></span></div>
    <div class="actions">${n.status==='ready'?`<button class="btn block" data-act="noteunready">${T('Back to draft','Volver a borrador')}</button>`:`<button class="btn primary block big" data-act="noteready">${T('Ready for Claude','Listo para Claude')}</button>`}
      <button class="btn ghost danger" data-act="notedel">${T('Delete note','Borrar apunte')}</button></div>`;
}

/* ---------- Speaking ---------- */
let rec=null, recChunks=[], recURL=null;
function renderSpeak(){
  const SP=window.LEXI_SPEAKING||{part1:[],part2:[],part3:[]};
  if(!sp) sp={ part:1, idx:0, end:0 };
  const parts={1:T('Part 1: personal questions','Part 1: preguntas personales'),2:T('Part 2: describe a photo','Part 2: describir una foto'),3:T('Part 3: discussion','Part 3: discusión'),4:T('Part 4: opinions','Part 4: opinión')};
  let prompt='', secs=30;
  if(sp.part===1){ prompt=SP.part1[sp.idx%SP.part1.length]; secs=30; }
  if(sp.part===2){ prompt=SP.part2[sp.idx%SP.part2.length]; secs=60; }
  if(sp.part===3){ const x=SP.part3[sp.idx%SP.part3.length]; prompt=`${L(x,'title')}\n\n${x.text}`; secs=150; }
  if(sp.part===4){ const x=SP.part3[Math.floor(sp.idx/3)%SP.part3.length]; prompt=x.follow[sp.idx%x.follow.length]; secs=45; }
  sp.secs=secs;
  const canRec=!!(navigator.mediaDevices && window.MediaRecorder);
  const tip = sp.part===2 ? T('Imagine the photo and describe it for 1 minute.','Imagina la foto y descríbela durante 1 minuto.') : sp.part===3 ? T('Speak out loud as if you had a partner: suggest, compare and decide.','Habla en voz alta como si tuvieras compañero: sugiere, compara y decide.') : T('Answer in 2–3 sentences, giving reasons and examples.','Contesta con 2–3 frases, dando razones y ejemplos.');
  const another = sp.part===2 ? T('Another photo','Otra foto') : sp.part===3 ? T('Another situation','Otra situación') : T('Another question','Otra pregunta');
  return `${backBar(T('Speaking practice','Practicar speaking'),'study')}
    <div class="seg" role="group">${[1,2,3,4].map(p=>`<button data-sp="${p}" aria-pressed="${sp.part===p}">Part ${p}</button>`).join('')}</div>
    <p class="small muted" style="margin-top:8px">${parts[sp.part]}. ${tip}</p>
    <div class="card"><div class="sp-prompt">${fmtText(prompt)}</div>
      ${sp.part!==3&&sp.part!==2?`<button class="btn ghost" data-say="${esc(prompt)}">${T('Listen to the question','Escuchar la pregunta')}</button>`:''}</div>
    <div class="timer-big" ${sp.end?`data-deadline="${sp.end}" data-kind="speak"`:''}>${sp.end?mmss(sp.end-Date.now()):mmss(secs*1000)}</div>
    <div class="actions">
      <button class="btn primary block" data-act="sptimer">${sp.end?T('Restart timer','Reiniciar cronómetro'):T('Start speaking','Empezar a hablar')}</button>
      ${canRec?(rec?`<button class="btn block danger" data-act="recstop">${ic('stop','sm')} ${T('Stop recording','Parar grabación')}</button>`:`<button class="btn block" data-act="recstart">${ic('rec','sm')} ${T('Record myself','Grabarme')}</button>`):''}
      ${recURL&&!rec?`<audio controls src="${recURL}" style="width:100%"></audio>`:''}
      <button class="btn ghost block" data-act="spnext">${another}</button></div>
    <p class="small muted">${T('The recording only stays on your phone while you are on this screen. Listen for long pauses, tense mistakes and repeated words.','La grabación solo se queda en tu móvil mientras estás en esta pantalla. Escúchate buscando silencios largos, errores de tiempos verbales y palabras repetidas.')}</p>`;
}
async function startRec(){
  try{ const stream=await navigator.mediaDevices.getUserMedia({ audio:true });
    rec=new MediaRecorder(stream); recChunks=[];
    rec.ondataavailable=e=>recChunks.push(e.data);
    rec.onstop=()=>{ stream.getTracks().forEach(t=>t.stop()); if(recURL) URL.revokeObjectURL(recURL); recURL=URL.createObjectURL(new Blob(recChunks,{ type:rec.mimeType||'audio/webm' })); rec=null; render(); };
    rec.start(); render();
  }catch(e){ rec=null; toast(T("Couldn't use the microphone. Check the permissions.",'No se ha podido usar el micrófono. Revisa los permisos.')); }
}

/* ---------- Tests: building ---------- */
function topicTask(g){
  return { id:'topic-'+g.id, section:'grammar', title:L(g,'title'), instructions:T('Choose or write the correct answer.','Elige o escribe la respuesta correcta.'),
    questions:g.test.map((q,i)=>({ n:i+1, stem:L(q,'q'), kind:q.o?'mcq':'text', options:q.o?shuffle([...q.o]):undefined, answer:q.o?q.a:undefined, answers:q.o?undefined:(Array.isArray(q.a)?q.a:[q.a]), exp:L(q,'e') })) };
}
function irrTask(){
  const all=window.LEXI_IRREGULAR||[];
  const weighted=shuffle([...all]).sort((a,b)=>(S.irr[b.b]||0)-(S.irr[a.b]||0));
  const pick=shuffle([...weighted.slice(0,4), ...shuffle(weighted.slice(4)).slice(0,6)]);
  const qs=[]; let n=1;
  for(const v of pick){
    qs.push({ n:n++, stem:`${v.b}${LANG==='es'?` (${v.es})`:''} → past simple`, kind:'text', answers:v.p.split('/'), verb:v.b });
    qs.push({ n:n++, stem:`${v.b} → past participle`, kind:'text', answers:v.pp.split('/'), verb:v.b });
  }
  return { id:'irr-'+Date.now(), section:'grammar', title:T('Irregular verbs','Verbos irregulares'), instructions:T('Write the past simple and the past participle.','Escribe el pasado y el participio.'), questions:qs };
}
function phrTask(){
  const all=[...PHRASAL.values()].filter(p=>(p.ex||[]).some(e=>(e.match(/\*/g)||[]).length===2));
  const weighted=shuffle([...all]).sort((a,b)=>(S.phr[b.v]||0)-(S.phr[a.v]||0));
  const pick=shuffle([...weighted.slice(0,3), ...shuffle(weighted.slice(3)).slice(0,7)]);
  return { id:'phr-'+Date.now(), section:'grammar', title:T('Phrasal verbs in context','Phrasal verbs en contexto'),
    instructions:T('Complete the sentence with the phrasal verb in the correct form, or choose what it means in that sentence.','Completa la frase con el phrasal verb en la forma correcta, o elige qué significa en esa frase.'),
    questions:pick.map((p,i)=>{
      const ex=shuffle((p.ex||[]).filter(e=>(e.match(/\*/g)||[]).length===2))[0]; const ans=ex.match(/\*([^*]+)\*/)[1];
      const other=(p.ex||[]).find(e=>e!==ex); const exp=`${p.v} = ${meaning(p)}${other?T('. Another example: ','. Otro ejemplo: ')+other.replace(/\*/g,''):''}`;
      if(i%2===0) return { n:i+1, stem:`${ex.replace(/\*([^*]+)\*/,'___')}\n(${p.v}: ${meaning(p)})`, kind:'text', answers:[ans], exp, phr:p.v };
      const opts=shuffle([meaning(p), ...shuffle(all.filter(x=>x.v!==p.v && meaning(x)!==meaning(p))).slice(0,3).map(meaning)]);
      return { n:i+1, stem:`${ex.replace(/\*([^*]+)\*/, (m,x)=>x.toUpperCase())}\n${T(`What does "${ans}" mean here?`,`¿Qué significa aquí "${ans}"?`)}`, kind:'mcq', options:opts, answer:meaning(p), exp, phr:p.v };
    }) };
}
function startRun(opts){
  if(S.run && !confirm(T('You have another test in progress. Discard it and start this one?','Tienes otro test a medias. ¿Descartarlo y empezar este?'))) return;
  S.run=Object.assign({ id:'t'+Date.now().toString(36), mode:'practice', ti:0, answers:{}, checked:{}, plays:{}, started:Date.now() }, opts);
  if(S.run.mode==='exam' && S.run.minutes) S.run.deadline=Date.now()+S.run.minutes*60000;
  save(); go('run');
}
function startTopic(id){ const g=GRAMMAR.get(id); if(g) startRun({ kind:'topic', ref:id, title:'Test: '+L(g,'title'), tasks:[topicTask(g)] }); }
function startPart(section, part){
  const cands=[...TASKS.values()].filter(t=>t.section===section && t.part===part);
  if(!cands.length){ toast(T('There are no tasks for this part yet. Ask Claude for some in a pack.','Todavía no hay tareas de esta parte. Pídeselas a Claude en un pack.')); return; }
  const tries=id=>S.tests.filter(t=>t.kind==='part' && (t.tasks||[]).includes(id)).length;
  cands.sort((a,b)=>tries(a.id)-tries(b.id));
  startRun({ kind:'part', ref:section+':'+part, title:`${lab(SECTION_L,section)} Part ${part}`, tasks:[cands[0].id] });
}
function startPaper(id){
  const p=PAPERS.get(id); if(!p) return;
  const tasks=[...TASKS.values()].filter(t=>t.paper===id).sort((a,b)=>a.part-b.part).map(t=>t.id);
  if(!tasks.length){ toast(T('This mock exam has no tasks.','Este simulacro no tiene tareas.')); return; }
  startRun({ kind:'mock', ref:id, title:L(p,'title'), tasks, mode:'exam', minutes:p.minutes, section:p.section });
}
const SEC_SW = SKILL_SW;
const TT = x => typeof x==='string' ? TASKS.get(x) : x;

/* ---------- Tests: marking ---------- */
function gradeQ(q, v){
  if(v==null || String(v).trim()==='') return 'bad';
  if(q.kind==='mcq' || q.kind==='select') return v===q.answer ? 'ok' : 'bad';
  const n=norm(v), w=words(v).join(' '), list=q.answers||[];
  if(list.some(a=>norm(a)===n || words(a).join(' ')===w)) return 'ok';
  if(list.some(a=>norm(a).length>=5 && lev(norm(a),n)===1)) return 'near';
  return 'bad';
}
function correctOf(q){ return q.kind==='text' ? (q.answers||[])[0] : q.answer; }
function scoreTask(t, ans){ let s=0; for(const q of t.questions) if(gradeQ(q, ans[t.id+':'+q.n])==='ok') s++; return s; }
const SCALES = { reading:[[0,82],[13,120],[23,140],[29,160],[32,170]], listening:[[0,82],[11,120],[18,140],[23,160],[25,170]] };
function scaleScore(section, raw){
  const a=SCALES[section]; if(!a) return null;
  for(let i=1;i<a.length;i++) if(raw<=a[i][0]){ const [x0,y0]=a[i-1],[x1,y1]=a[i]; return Math.round(y0+(raw-x0)*(y1-y0)/(x1-x0)); }
  return 170;
}
function scaleLabel(sc){ return sc>=160?T('Grade A (B2 level)','Grade A (nivel B2)'):sc>=153?'Grade B (B1)':sc>=140?'Grade C (B1)':sc>=120?T('A2 level','Nivel A2'):T('Below A2','Por debajo de A2'); }
function finishRun(auto){
  const run=S.run; if(!run) return;
  const tasks=run.tasks.map(TT).filter(Boolean);
  const detail=[], parts=[]; let score=0, max=0;
  for(const t of tasks){
    let ts=0;
    for(const q of t.questions){ const v=run.answers[t.id+':'+q.n]; const r=gradeQ(q,v); if(r==='ok') ts++;
      detail.push({ task:t.id, part:t.part||null, n:q.n, stem:(q.stem||'').slice(0,160), given:v==null?'':String(v), correct:correctOf(q), r });
      if(q.verb){ S.irr[q.verb]=Math.max(0,(S.irr[q.verb]||0)+(r==='ok'?-1:2)); }
      if(q.phr){ S.phr[q.phr]=Math.max(0,(S.phr[q.phr]||0)+(r==='ok'?-1:2)); } }
    score+=ts; max+=t.questions.length; parts.push({ task:t.id, part:t.part||null, title:L(t,'title'), score:ts, max:t.questions.length });
  }
  const section=run.section || tasks[0]?.section;
  const rec={ id:run.id, kind:run.kind, ref:run.ref, title:run.title, mode:run.mode, section, at:Date.now(), durationSec:Math.round((Date.now()-run.started)/1000),
    score, max, parts, detail, tasks:run.tasks.map(x=>typeof x==='string'?x:x.id), auto:!!auto };
  if(run.kind==='mock' && SCALES[section] && max===(section==='reading'?32:25)) rec.scale=scaleScore(section, score);
  S.tests.push(rec); const d=today(); d.t=(d.t||0)+1;
  S.run=null; exportCache=null; resultId=rec.id; save(); stopSpeech();
  if(auto) toast(T("Time's up. Your exam has been handed in.",'Se ha acabado el tiempo. Examen entregado.'));
  go('result');
}

/* ---------- Tests: screens ---------- */
function renderTests(){
  const gl=[...GRAMMAR.values()];
  // Each exam part is a control on its section's course; punched once you score 80 % or more
  const partCtrl=(sec,p)=>{ const n=[...TASKS.values()].filter(t=>t.section===sec&&t.part===p).length;
    const done=S.tests.filter(t=>t.ref===sec+':'+p), best=done.length?Math.max(...done.map(t=>Math.round(t.score/t.max*100))):null;
    return ctrlHTML({ state:best!==null&&best>=80?'done':best!==null?'visited':(n?'':'none'), num:p, mark:best!==null&&best>=80?ic('check'):'',
      label:best!==null?`${best}%`:n?`${n} ${pl(n,'task','tasks','tarea','tareas')}`:T('None yet','Aún no'), attr:`data-part="${sec}:${p}" ${n?'':'disabled'}`, aria:`Part ${p}` }); };
  const papers=[...PAPERS.values()], hist=S.tests.slice(-12).reverse();
  const row=(attr, sw, title, sub, right)=>`<li><button class="rowbtn" ${attr}><i class="sw ${sw}"></i><span class="rt">${title}${sub?`<span class="small muted">${sub}</span>`:''}</span>${right}</button></li>`;
  return `${header()}<h1>Tests</h1>
    ${S.run?`<div class="panel note run"><h3>${ic('clock')}${esc(S.run.title)}: ${T('in progress','a medias')}</h3><button class="btn block" data-go="run">${T('Continue','Continuar')}</button></div>`:''}
    <h2>${T('Mock exams','Simulacros')}</h2><p class="small muted">${T('Timed, with no answers until the end, just like the real exam.','Con cronómetro y sin ver las soluciones hasta el final, como en el examen.')}</p>
    <ul class="list">${papers.map(p=>{ const b=S.tests.filter(t=>t.ref===p.id); const best=b.length?Math.max(...b.map(t=>t.score)):null;
      return row(`data-paper="${esc(p.id)}"`, SEC_SW[p.section]||'open', esc(L(p,'title')), `${p.minutes} min · ${p.max} ${T('questions','preguntas')}`, best===null?ic('chev','sm'):`<span class="pct">${best}/${p.max}</span>`); }).join('')}
      ${row('data-act="wmock"','contour',T('Full PET Writing','Writing PET completo'),T('45 min · email + article or story, marked by Claude','45 min · email + artículo o historia, lo corrige Claude'),ic('chev','sm'))}
      ${row('data-go="speak"','rock','Speaking',T('Questions, photos and discussion with a timer','Preguntas, fotos y discusión con cronómetro'),ic('chev','sm'))}</ul>
    <h2>${T('Practice by part','Práctica por partes')}</h2><p class="small muted">${T('No time limit, marked at the end of each part. A part is punched at 80 % or more.','Sin tiempo y con corrección al terminar cada parte. Una parte queda marcada con un 80 % o más.')}</p>
    ${Object.keys(SECTION_L).map(sec=>`<h3 class="sub"><i class="sw ${SEC_SW[sec]}"></i>${lab(SECTION_L,sec)}</h3><div class="course parts">${Array.from({length:PARTS[sec]},(_,i)=>partCtrl(sec,i+1)).join('')}</div>`).join('')}
    <h2>${T('Tests by topic','Test por temas')}</h2>
    <ul class="list">${gl.map(g=>row(`data-topic="${esc(g.id)}"`,'thicket',esc(L(g,'title')),'',badge(bestOf('topic',g.id))||ic('chev','sm'))).join('')}
      ${row('data-act="irrtest"','open',T('Irregular verbs','Verbos irregulares'),'',badge(bestOf('irregular','irregular'))||ic('chev','sm'))}
      ${row('data-act="phrtest"','open','Phrasal verbs','',badge(bestOf('phrasal','phrasal'))||ic('chev','sm'))}</ul>
    ${hist.length?`<h2>${T('History','Historial')}</h2><table class="cd hist"><tbody>${hist.map(t=>`<tr data-result="${esc(t.id)}"><td><b>${esc(t.title)}</b><div class="small muted">${fmtDate(t.at)}</div></td><td class="v">${t.score}/${t.max}</td></tr>`).join('')}</tbody></table>`:''}`;
}

function passageHTML(text, t, reveal, ans){
  return fmtText(text).replace(/\[(\d+)\]/g, (m,n)=>{
    const q=t.questions.find(q=>String(q.n)===n);
    if(reveal && q){ const r=gradeQ(q, ans[t.id+':'+q.n]); return `<span class="gapn ${r}">${n}<em>${esc(correctOf(q))}</em></span>`; }
    const v=q && ans[t.id+':'+q.n]; return `<span class="gapn${v?' filled':''}">${n}${v?`<em>${esc(v)}</em>`:''}</span>`;
  });
}
function qHTML(t, q, run, reveal){
  const k=t.id+':'+q.n, v=run.answers[k], r=reveal?gradeQ(q,v):null, exp=L(q,'exp');
  let input='';
  if(q.kind==='mcq') input=`<div class="opts">${q.options.map((o,i)=>{ let c=v===o?'sel':''; if(reveal){ c=o===q.answer?'ok':(v===o?'bad':''); }
      return `<button class="opt sm ${c}" data-q="${esc(k)}" data-v="${esc(o)}" ${reveal?'disabled':''}><span class="ol">${'ABCD'[i]}</span>${esc(o)}</button>`; }).join('')}</div>`;
  else if(q.kind==='select') input=`<div class="letters">${q.options.map(o=>{ let c=v===o?'sel':''; if(reveal){ c=o===q.answer?'ok':(v===o?'bad':''); }
      return `<button class="lt ${c}" data-q="${esc(k)}" data-v="${esc(o)}" ${reveal?'disabled':''}>${esc(o)}</button>`; }).join('')}</div>`;
  else input=`<input class="field qin ${r||''}" data-q="${esc(k)}" value="${esc(v||'')}" ${reveal?'disabled':''} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${T('Your answer','Tu respuesta')}">`
      + (reveal && r!=='ok' ? `<div class="small" style="margin-top:4px">${r==='near'?T('Almost (spelling counts). ','Casi (la ortografía cuenta). '):''}${T('Answer:','Respuesta:')} <b>${esc((q.answers||[]).join(' / '))}</b></div>` : '');
  const audio=q.audio?audioCtl(run, k, q.audio, reveal):'';
  return `<div class="q ${r||''}"><div class="qn">${q.n}</div><div class="qb">${q.stem?`<div class="qstem">${fmtText(L(q,'stem'))}</div>`:''}${audio}${input}${reveal&&exp?`<div class="small muted" style="margin-top:6px">${esc(exp)}</div>`:''}</div></div>`;
}
function audioCtl(run, key, lines, reveal){
  const used=run.plays[key]||0, limit=run.mode==='exam'&&!reveal?2:Infinity, left=limit-used;
  return `<div class="audio"><button class="btn ${left>0?'primary':''}" data-play="${esc(key)}" ${left>0?'':'disabled'}>${ic('play','sm')} ${T('Listen','Escuchar')}</button>
    <button class="btn ghost" data-act="stopaudio" aria-label="${T('Stop','Parar')}">${ic('stop','sm')}</button>${limit!==Infinity?`<span class="small muted">${left>0?T(`${left} ${left===1?'play':'plays'} left`,`Te quedan ${left}`):T('No plays left','Sin escuchas')}</span>`:''}
    ${reveal?`<details><summary class="small">${T('See transcript','Ver transcripción')}</summary><div class="small transcript">${lines.map(([w,x])=>`<p><b>${w==='B'?'—':'–'}</b> ${esc(x)}</p>`).join('')}</div></details>`:''}</div>`;
}
function renderRun(){
  const run=S.run; if(!run) return renderTests();
  const tasks=run.tasks.map(TT).filter(Boolean); if(!tasks.length){ S.run=null; save(); return renderTests(); }
  run.ti=Math.min(run.ti, tasks.length-1);
  const t=tasks[run.ti], reveal=run.mode==='practice' && !!run.checked[run.ti];
  const answered=t.questions.filter(q=>run.answers[t.id+':'+q.n]).length, last=run.ti===tasks.length-1;
  const sc=scoreTask(t,run.answers);
  const nav= run.mode==='exam'
    ? `<div class="row spread"><button class="btn" data-act="prevtask" ${run.ti?'':'disabled'}>${T('Previous','Anterior')}</button>${last?`<button class="btn primary" data-act="finishrun">${T('Hand in','Entregar examen')}</button>`:`<button class="btn primary" data-act="nexttask">${T('Next part','Siguiente parte')}</button>`}</div>`
    : (reveal ? `<div class="fb ${sc===t.questions.length?'ok':'near'}"><h3>${T(`${sc} of ${t.questions.length} correct`,`${sc} de ${t.questions.length} correctas`)}</h3></div>${last?`<button class="btn primary big block" data-act="finishrun">${T('See result','Ver resultado')}</button>`:`<button class="btn primary big block" data-act="nexttask">${T('Next','Siguiente')}</button>`}`
      : `<button class="btn primary big block" data-act="checktask">${T('Check answers','Corregir')}</button>`);
  return `<div class="sess-top"><button class="icon-btn" data-act="quitrun" aria-label="${T('Exit','Salir')}">${ic('close')}</button><div style="flex:1;min-width:0"><b class="small" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(run.title)}</b>
      ${tasks.length>1?`<div class="track" aria-hidden="true"><div class="leg" data-to="${run.ti/(tasks.length-1)}" style="transform:scaleX(${Math.max(0,run.ti-1)/(tasks.length-1)})"></div>${tasks.map((_,k)=>`<i class="${k<run.ti?'ok':k===run.ti?'cur':''}"></i>`).join('')}</div>`:''}</div>
      ${run.deadline?`<span class="timer" data-deadline="${run.deadline}" data-kind="run">${mmss(run.deadline-Date.now())}</span>`:''}</div>
    <div class="ch taskh"><span class="n">${t.part||run.ti+1}</span><span class="t">${esc(L(t,'title')||'')}${tasks.length>1?` · ${run.ti+1}/${tasks.length}`:''}</span><span class="lv">${answered}/${t.questions.length}</span></div>
    ${t.instructions?`<p class="instr">${esc(L(t,'instructions'))}</p>`:''}
    ${t.audio?audioCtl(run, t.id, t.audio, reveal):''}
    ${t.passage?`<div class="passage">${passageHTML(t.passage, t, reveal, run.answers)}</div>`:''}
    ${t.blocks?`<div class="blocks">${t.blocks.map(b=>`<div class="block"><span class="bl">${esc(b.label)}</span><div><b>${esc(b.title||'')}</b><div class="small">${esc(b.text)}</div></div></div>`).join('')}</div>`:''}
    ${t.choices?`<div class="blocks">${t.choices.map(c=>{ const used=Object.entries(run.answers).some(([k,v])=>k.startsWith(t.id+':')&&v===c.label); return `<div class="block ${used?'used':''}"><span class="bl">${esc(c.label)}</span><div class="small">${esc(c.text)}</div></div>`; }).join('')}</div>`:''}
    <div class="qs">${t.questions.map(q=>qHTML(t,q,run,reveal)).join('')}</div>
    ${nav}`;
}
function renderResult(){
  const r=S.tests.find(x=>x.id===resultId); if(!r) return renderTests();
  const pct=Math.round(r.score/r.max*100), bad=r.detail.filter(d=>d.r!=='ok');
  const redo = r.kind==='topic' ? `data-topic="${esc(r.ref)}"` : r.kind==='mock' ? `data-paper="${esc(r.ref)}"` : r.kind==='part' ? `data-part="${esc(r.ref)}"` : r.kind==='irregular' ? 'data-act="irrtest"' : 'data-act="phrtest"';
  return `${backBar(T('Result','Resultado'),'tests')}
    <h1>${esc(r.title)}</h1>
    <div class="score"><b>${r.score}/${r.max}</b><span>${pct}%</span></div>
    <p class="muted small">${fmtDate(r.at)} · ${mmss(r.durationSec*1000)} min</p>
    ${r.scale?`<div class="panel note"><h3>≈ ${r.scale} ${T('on the Cambridge English Scale','en la Cambridge English Scale')}</h3><p class="small" style="margin:0">${scaleLabel(r.scale)}. ${T('Approximate estimate: the official conversion varies slightly between exam sessions.','Estimación aproximada: la conversión oficial varía un poco en cada convocatoria.')}</p></div>`:''}
    ${r.parts.length>1?`<h2>${T('By part','Por partes')}</h2><table class="cd"><tbody>${r.parts.map((p,i)=>`<tr><th>${p.part||i+1}</th><td>${esc(p.title||'Part '+p.part)}<div class="meter"><div style="width:${p.score/p.max*100}%"></div></div></td><td class="v">${p.score}/${p.max}</td></tr>`).join('')}</tbody></table>`:''}
    ${bad.length?`<h2>${T('Your mistakes','Tus fallos')}</h2><table class="cd"><tbody>${bad.map(d=>`<tr><th>${d.n}</th><td>${d.part&&r.parts.length>1?`<div class="small muted">Part ${d.part}</div>`:''}${d.stem?`<div class="small">${esc(d.stem)}</div>`:''}
      <div class="ans-row bad-t">${ic('x','sm')}<span class="${d.given?'struck':''}">${esc(d.given)||T('(blank)','(en blanco)')}</span></div><div class="ans-row ok-t">${ic('check','sm')}<b>${esc(d.correct)}</b></div></td></tr>`).join('')}</tbody></table>`:`<p class="muted">${T('A clean run: every answer right.','Recorrido limpio: todo correcto.')}</p>`}
    <div class="actions" style="margin-top:18px"><button class="btn primary block" ${redo}>${T('Try again','Repetir')}</button><button class="btn block" data-go="tests">${T('Back to tests','Volver a tests')}</button></div>`;
}

/* ---------- Writing ---------- */
function writingPrompts(){ return [...ITEMS.values()].filter(i=>i.type==='writing' && !i.retired); }
function createWriting(promptId, extra){
  const p=ITEMS.get(promptId);
  const w=Object.assign({ id:'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), promptId, title:p?L(p,'title'):'', text:'', status:'draft', createdAt:Date.now(), updatedAt:Date.now(), feedback:null }, extra||{});
  S.writings.push(w); return w;
}
function wstatus(w){ return w.feedback?`<span class="status fb">${T('Corrected','Corregido')}</span>`:w.status==='done'?`<span class="status done">${T('Finished','Terminado')}</span>`:`<span class="status muted">${T('Draft','Borrador')}</span>`; }
function renderWriting(){
  const prompts=writingPrompts();
  const group=(title, list)=> list.length?`<h2>${title}</h2><ul class="list">${list.map(p=>{ const ws=S.writings.filter(w=>w.promptId===p.id); const last=ws[ws.length-1];
    return `<li><div class="row spread"><div><b>${esc(L(p,'title'))}</b><div class="small muted">${p.form?lab(FORM_L,p.form)+', ':''}${p.words} ${T('words','palabras')}, ${esc(p.level)}</div></div>${last?wstatus(last):''}</div>
      <div class="row" style="margin-top:8px">${last?`<button class="btn" data-open="${esc(last.id)}">${T('Open','Abrir')}</button>`:''}<button class="btn ${last?'ghost':''}" data-new="${esc(p.id)}">${last?T('Do it again','Hacer otra vez'):T('Start','Empezar')}</button></div></li>`; }).join('')}</ul>`:'';
  const own=S.writings.filter(w=>w.promptId==='free'||w.mock);
  return `${header()}<h1>${T('Write','Escribir')}</h1><p class="muted">${T('Everything you write goes in your export. Claude corrects it with the 4 official criteria and the correction comes back when you import.','Lo que escribas va en tu exportación. Lo corrijo con los 4 criterios oficiales y la corrección vuelve al importar.')}</p>
    <button class="btn primary block big" data-act="wmock">${S.wmock?T('Continue Writing mock exam','Continuar simulacro de Writing'):T('Writing mock exam (45 min)','Simulacro de Writing (45 min)')}</button>
    ${group('PET Part 1: email', prompts.filter(p=>p.level==='B1'&&p.form==='email'))}
    ${group(T('PET Part 2: article or story','PET Part 2: artículo o historia'), prompts.filter(p=>p.level==='B1'&&(p.form==='article'||p.form==='story')))}
    ${group('B2 First', prompts.filter(p=>p.level==='B2'))}
    ${group(T('Other','Otras'), prompts.filter(p=>p.level==='B1'&&!['email','article','story'].includes(p.form)))}
    <h2>${T('Free writing','Escritura libre')}</h2><button class="btn block" data-new="free">${T('Write about anything','Escribir sobre lo que quiera')}</button>
    ${own.length?`<ul class="list" style="margin-top:8px">${own.slice(-15).reverse().map(w=>`<li class="row spread"><button class="btn ghost" data-open="${esc(w.id)}">${w.mock?T('Mock: ','Simulacro: '):''}${esc(w.title||T('Untitled','Sin título'))}</button>${wstatus(w)}</li>`).join('')}</ul>`:''}`;
}
function renderWrite(){
  const w=S.writings.find(x=>x.id===editing); if(!w) return renderWriting();
  const p=ITEMS.get(w.promptId);
  return `${backBar(p?L(p,'title'):T('Free writing','Escritura libre'),'writing')}
    ${p?`<div class="panel"><pre class="task">${esc(p.task)}</pre></div>`:`<input class="field" id="wtitle" placeholder="${T('Title','Título')}" value="${esc(w.title)}" style="margin-bottom:10px">`}
    ${feedbackHTML(w)}
    <textarea class="field" data-w="${esc(w.id)}" placeholder="Write here…" autocapitalize="sentences" spellcheck="false" ${w.status==='done'?'readonly':''}>${esc(w.text)}</textarea>
    <div class="row spread" style="margin:8px 0 14px"><span class="small muted" data-wc="${esc(w.id)}">${wcLabel(w.text,p)}</span><span class="small muted" data-saved></span></div>
    <div class="actions">${w.status==='done'?`<button class="btn block" data-act="reopen">${T('Keep editing','Seguir editando')}</button>`:`<button class="btn primary block big" data-act="wdone">${T('Mark as finished','Marcar como terminado')}</button>`}
      <button class="btn ghost danger" data-act="wdel">${T('Delete this text','Borrar este texto')}</button></div>
    <p class="small muted">${T("Turn off your keyboard's autocorrect to practise like in the exam.",'Desactiva el corrector del teclado para practicar como en el examen.')}</p>`;
}
function wcLabel(text,p){ const n=wc(text); return p?T(`${n} words of ~${p.words}`,`${n} palabras de ~${p.words}`):T(`${n} words`,`${n} palabras`); }
function feedbackHTML(w){
  if(!w.feedback) return '';
  const f=w.feedback;
  return `<div class="panel note"><h3>${T('Correction','Corrección')}${f.score?` (${esc(f.score)})`:''}</h3>
    ${f.bands?`<div class="bands">${Object.entries(f.bands).map(([k,v])=>`<div><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('')}</div>`:''}
    <p style="white-space:pre-wrap">${esc(f.notes||'')}</p>
    ${f.corrected?`<details><summary>${T('Corrected version','Versión corregida')}</summary><p style="white-space:pre-wrap;margin-top:8px">${esc(f.corrected)}</p></details>`:''}</div>`;
}
function startWMock(){
  if(S.wmock){ go('wmock'); return; }
  const ps=writingPrompts().filter(p=>p.level==='B1');
  const used=id=>S.writings.filter(w=>w.promptId===id).length;
  const pick=list=>shuffle(list).sort((a,b)=>used(a.id)-used(b.id))[0];
  const p1=pick(ps.filter(p=>p.form==='email'&&p.part===1)), art=pick(ps.filter(p=>p.form==='article')), sto=pick(ps.filter(p=>p.form==='story'));
  if(!p1||!art||!sto){ toast(T('There are not enough tasks to build the mock exam.','Faltan tareas para montar el simulacro.')); return; }
  const mockId='wm'+Date.now().toString(36);
  const w1=createWriting(p1.id,{ mock:mockId, part:1 });
  S.wmock={ id:mockId, started:Date.now(), deadline:Date.now()+45*60000, w1:w1.id, opts:[art.id, sto.id], w2:null };
  save(); go('wmock');
}
function finishWMock(auto){
  const m=S.wmock; if(!m) return;
  for(const id of [m.w1,m.w2]){ const w=S.writings.find(x=>x.id===id); if(w){ w.status='done'; w.updatedAt=Date.now(); w.minutes=Math.round((Date.now()-m.started)/60000); } }
  S.wmock=null; exportCache=null; save();
  toast(auto?T("Time's up. Your texts have been saved for correction.",'Tiempo terminado. Tus textos se han guardado para corregir.'):T('Mock exam handed in. It will go in your next export.','Simulacro entregado. Irá en tu próxima exportación.')); go('writing');
}
function renderWMock(){
  const m=S.wmock; if(!m) return renderWriting();
  const w1=S.writings.find(x=>x.id===m.w1), p1=ITEMS.get(w1?.promptId);
  const w2=m.w2 && S.writings.find(x=>x.id===m.w2), p2=w2 && ITEMS.get(w2.promptId);
  const ta=(w,p)=>`<textarea class="field" data-w="${esc(w.id)}" placeholder="Write here…" spellcheck="false">${esc(w.text)}</textarea><div class="small muted" data-wc="${esc(w.id)}" style="margin:6px 0 16px">${wcLabel(w.text,p)}</div>`;
  return `<div class="sess-top"><button class="icon-btn" data-go="writing" aria-label="${T('Exit (it is saved)','Salir (se guarda)')}">${ic('back')}</button><b style="flex:1">${T('Writing mock exam','Simulacro de Writing')}</b><span class="timer" data-deadline="${m.deadline}" data-kind="wmock">${mmss(m.deadline-Date.now())}</span></div>
    <p class="small muted">${T('You have 45 minutes for both parts. It saves automatically. You can leave and come back.','Tienes 45 minutos para las dos partes. Se guarda solo. Puedes salir y volver.')}</p>
    <h2>${T('Part 1 (compulsory)','Part 1 (obligatoria)')}</h2><div class="panel"><pre class="task">${esc(p1.task)}</pre></div>${ta(w1,p1)}
    <h2>${T('Part 2 (choose one)','Part 2 (elige una)')}</h2>
    ${w2?`<div class="panel"><pre class="task">${esc(p2.task)}</pre></div>${ta(w2,p2)}`:
      m.opts.map(id=>{ const p=ITEMS.get(id); const f=lab(FORM_L,p.form); return `<div class="panel"><b>${f}</b><pre class="task">${esc(p.task)}</pre><button class="btn block" data-wchoose="${esc(id)}">${T('Choose','Elegir')} ${f.toLowerCase()}</button></div>`; }).join('')}
    <button class="btn primary big block" data-act="wmockdone" style="margin-top:10px">${T('Hand in','Entregar')}</button>`;
}

/* ---------- Progress ---------- */
function heatmapHTML(){
  // 12 weeks of activity as a vegetation-density tile: columns are weeks (Monday first), darker = more work that day
  const weeks=12, todayStart=startOfDay(Date.now()), dow=(new Date(todayStart).getDay()+6)%7;
  const start=todayStart-(dow+(weeks-1)*7)*DAY; let active=0;
  const day=(w,d)=>start+(w*7+d)*DAY+12*3600e3;
  const cells=['<span></span>'];
  for(let w=0;w<weeks;w++){ const t=day(w,0), m=new Date(t).getMonth(), prev=w?new Date(day(w-1,0)).getMonth():-1;
    cells.push(`<span class="mo">${m!==prev?esc(new Date(t).toLocaleDateString(LOCALE(),{month:'short'})):''}</span>`); }
  for(let d=0;d<7;d++){
    cells.push(`<span class="wd">${d%2===0?esc(new Date(day(0,d)).toLocaleDateString(LOCALE(),{weekday:'narrow'})):''}</span>`);
    for(let w=0;w<weeks;w++){ const t=day(w,d);
      if(t>Date.now()+DAY/2){ cells.push('<i class="fut"></i>'); continue; }
      const x=S.daily[dayKey(t)]||{}, v=(x.n||0)+(x.t||0)*5; if(v) active++;
      cells.push(`<i class="${v===0?'':'h'+(v<5?1:v<15?2:v<30?3:4)}" title="${dayKey(t)}: ${v}"></i>`); } }
  return `<div class="heat" role="img" aria-label="${T(`${active} active days in the last 12 weeks`,`${active} días activos en las últimas 12 semanas`)}">${cells.join('')}</div>
    <p class="small muted" style="margin-top:8px">${T(`${active} active days. Darker means more exercises that day.`,`${active} días activos. Más oscuro, más ejercicios ese día.`)}</p>`;
}
function renderProgress(){
  const c=counts(), now=Date.now();
  const week=S.attempts.filter(a=>a.t>now-7*DAY);
  const acc=week.length?Math.round(week.filter(a=>a.r!=='bad').length/week.length*100):null;
  const by=(keyFn,map)=>{ const m={}; for(const a of S.attempts){ const it=ITEMS.get(a.id); if(!it) continue; const k=keyFn(it); (m[k]||(m[k]={n:0,ok:0})); m[k].n++; if(a.r!=='bad') m[k].ok++; }
    return Object.entries(m).sort((x,y)=>(x[1].ok/x[1].n)-(y[1].ok/y[1].n)).map(([k,v])=>`<li><div class="row spread"><span>${esc(lab(map,k))}</span><span class="small muted">${T(`${Math.round(v.ok/v.n*100)}% of ${v.n}`,`${Math.round(v.ok/v.n*100)}% de ${v.n}`)}</span></div><div class="meter"><div style="width:${v.ok/v.n*100}%"></div></div></li>`).join(''); };
  const hard=Object.entries(S.srs).filter(([,s])=>s.l>0).sort((a,b)=>b[1].l-a[1].l).slice(0,10).map(([id,s])=>({it:ITEMS.get(id),s})).filter(x=>x.it);
  const mocks=S.tests.filter(t=>t.kind==='mock');
  const grammar=[...GRAMMAR.values()].map(g=>({ g, p:bestOf('topic',g.id) })).filter(x=>x.p!==null).sort((a,b)=>a.p-b.p);
  const seen=c.total-c.unseen;
  return `${backBar(T('Progress','Progreso'),'home')}
    <div class="stats"><div class="stat"><b>${c.learned}</b><span>${T('words learnt','palabras aprendidas')}</span></div><div class="stat"><b>${c.mastered}</b><span>${T('mastered','dominadas')}</span></div><div class="stat"><b>${acc===null?'–':acc+'%'}</b><span>${T('accuracy, 7 days','aciertos, 7 días')}</span></div></div>
    <h2>${T('Last 12 weeks','Últimas 12 semanas')}</h2>${heatmapHTML()}
    <h2>${T('Word bank','Banco de palabras')}</h2>
    <div class="bank" role="img" aria-label="${T(`${c.mastered} mastered, ${c.learned} learnt, ${seen} seen of ${c.total}`,`${c.mastered} dominadas, ${c.learned} aprendidas, ${seen} vistas de ${c.total}`)}">
      <div class="m" style="width:${c.total?c.mastered/c.total*100:0}%"></div><div class="l" style="width:${c.total?(c.learned-c.mastered)/c.total*100:0}%"></div><div class="s" style="width:${c.total?(seen-c.learned)/c.total*100:0}%"></div></div>
    <div class="row wrap small muted bankkey"><span><i class="m"></i>${T('Mastered','Dominadas')} ${c.mastered}</span><span><i class="l"></i>${T('Learnt','Aprendidas')} ${c.learned-c.mastered}</span><span><i class="s"></i>${T('Seen','Vistas')} ${seen-c.learned}</span><span>${T('Total','Total')} ${c.total}</span></div>
    ${mocks.length?`<h2>${T('Mock exams','Simulacros')}</h2><table class="cd hist"><tbody>${mocks.slice(-10).reverse().map(t=>`<tr data-result="${esc(t.id)}"><td><b>${esc(t.title)}</b><div class="small muted">${fmtDate(t.at)}${t.scale?` · ≈ ${t.scale} (${scaleLabel(t.scale)})`:''}</div></td><td class="v">${t.score}/${t.max}</td></tr>`).join('')}</tbody></table>`:''}
    ${grammar.length?`<h2>${T('Grammar (best score)','Gramática (mejor nota)')}</h2><ul class="list">${grammar.map(x=>`<li><div class="row spread"><span>${esc(L(x.g,'title'))}</span>${badge(x.p)}</div><div class="meter"><div style="width:${x.p}%"></div></div></li>`).join('')}</ul>`:''}
    ${S.attempts.length?`<h2>${T('Vocabulary by type','Vocabulario por tipo')}</h2><ul class="list">${by(i=>i.cat, CAT_L)}</ul><h2>${T('Vocabulary by topic','Vocabulario por tema')}</h2><ul class="list">${by(i=>i.topic, TOPIC_L)}</ul>`:''}
    ${hard.length?`<h2>${T('Words you find hardest','Palabras que más te cuestan')}</h2><table class="cd"><tbody>${hard.map((x,i)=>`<tr><th>${i+1}</th><td><b>${esc(x.it.word||correctText(x.it))}</b></td><td class="v">${x.s.l}<span class="small muted"> ${pl(x.s.l,'miss','misses','fallo','fallos')}</span></td></tr>`).join('')}</tbody></table>`:''}`;
}

/* ---------- Export ---------- */
function compactItem(it){
  const o={ type:it.type, cat:it.cat, level:it.level, topic:it.topic, word:it.word };
  if(it.prompt) o.prompt=it.prompt; if(it.es) o.es=it.es; if(it.base) o.base=it.base; if(it.text) o.text=it.text;
  if(it.type==='mcq'){ o.answer=it.answer; o.options=it.options; } else if(it.answers) o.answers=it.answers;
  if(it.pack) o.pack=it.pack; return o;
}
function summaryOf(atts, tests){
  const agg=fn=>{ const m={}; for(const a of atts){ const it=ITEMS.get(a.id); if(!it) continue; const k=fn(it)||'?'; (m[k]||(m[k]={n:0,ok:0,near:0})); m[k].n++; if(a.r==='ok') m[k].ok++; if(a.r==='near') m[k].near++; } return m; };
  const c=counts();
  const grammarBest={}; for(const g of GRAMMAR.values()){ const p=bestOf('topic',g.id); if(p!==null) grammarBest[g.id]=p; }
  return { vocab:{ attempts:atts.length, correct:atts.filter(a=>a.r==='ok').length, near:atts.filter(a=>a.r==='near').length, wrong:atts.filter(a=>a.r==='bad').length,
      avgMs:atts.length?Math.round(atts.reduce((s,a)=>s+a.ms,0)/atts.length):0, byCategory:agg(i=>i.cat), byTopic:agg(i=>i.topic), byLevel:agg(i=>i.level) },
    tests:tests.map(t=>({ title:t.title, kind:t.kind, score:t.score, max:t.max, scale:t.scale||null, at:iso(t.at) })),
    overall:{ itemsSeen:c.total-c.unseen, itemsTotal:c.total, learned:c.learned, mastered:c.mastered, streakDays:c.streak, dueNow:c.due, testsDone:S.tests.length, pagesRead:Object.keys(S.read).length },
    grammarBestPct:grammarBest,
    phrasalTrouble:Object.entries(S.phr).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([v])=>v),
    irregularTrouble:Object.entries(S.irr).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([v])=>v),
    speakingSessions:Object.values(S.speak).reduce((a,b)=>a+b,0),
    topErrorsAllTime:Object.entries(S.srs).filter(([,s])=>s.l>0).sort((a,b)=>b[1].l-a[1].l).slice(0,25).map(([id,s])=>({ id, word:ITEMS.get(id)?.word, lapses:s.l, intervalDays:s.i })) };
}
function buildExport(full){
  const since=full?0:S.lastExportAt, now=Date.now();
  const atts=S.attempts.filter(a=>a.t>since), tests=S.tests.filter(t=>t.at>since);
  const touched=new Set(atts.map(a=>a.id)); const items={};
  for(const id of touched){ const it=ITEMS.get(id); if(it) items[id]=compactItem(it); }
  const srs={}; for(const id of (full?Object.keys(S.srs):touched)){ const s=S.srs[id]; if(s) srs[id]={ reps:s.r, lapses:s.l, intervalDays:s.i, ease:+s.e.toFixed(2), due:iso(s.due) }; }
  const writings=S.writings.filter(w=>w.updatedAt>since && w.text.trim()).map(w=>{ const p=ITEMS.get(w.promptId);
    return { id:w.id, promptId:w.promptId, form:p?.form||null, level:p?.level||null, title:p?(p.title_en||p.title):w.title, task:p?p.task:null, targetWords:p?p.words:null, status:w.status, timedMock:!!w.mock, minutes:w.minutes||null, words:wc(w.text), text:w.text, updatedAt:iso(w.updatedAt), alreadyCorrected:!!w.feedback }; });
  return { format:'lexi-export', version:2, app:APP_VERSION, kind:full?'full':'delta', exportedAt:iso(now), period:{ from:since?iso(since):null, to:iso(now) },
    profile:{ currentLevel:'B1', targetExam:'Cambridge B1 Preliminary (PET)', nextGoal:'B2 First', settings:S.settings, appLanguage:LANG },
    installed:{ packs:S.packs.map(p=>({ id:p.id, name:p.name, active:!p.off })), tasks:[...TASKS.keys()], grammar:[...GRAMMAR.keys()], papers:[...PAPERS.keys()], pages:[...PAGES.keys()], phrasal:[...PHRASAL.keys()] },
    summary:summaryOf(atts, tests),
    attempts:atts.map(a=>({ id:a.id, at:iso(a.t), result:a.r, ms:a.ms, answer:a.a })), items, srs,
    tests:tests.map(t=>({ id:t.id, kind:t.kind, ref:t.ref, title:t.title, mode:t.mode, at:iso(t.at), durationSec:t.durationSec, score:t.score, max:t.max, scale:t.scale||null, parts:t.parts, mistakes:t.detail.filter(d=>d.r!=='ok') })),
    writings,
    notes:S.rawNotes.filter(n=>n.status==='ready' && (full || n.updatedAt>since)).map(n=>({ id:n.id, title:n.title, template:n.template, text:n.text, updatedAt:iso(n.updatedAt) })),
    _ts:now };
}
function getExport(full){ if(!exportCache || exportCache.full!==full) exportCache={ full, data:buildExport(full) }; return exportCache.data; }
function markExported(data){ if(data.kind!=='delta') return; S.lastExportAt=data._ts; S.exports.push({ at:data._ts, attempts:data.attempts.length, tests:data.tests.length, writings:data.writings.length }); exportCache=null; save(); }
function exportJSON(data){ const d=Object.assign({},data); delete d._ts; return JSON.stringify(d); }
async function copyText(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch(e){ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch(_){ } ta.remove(); return ok; }
}
function download(name, text){ const url=URL.createObjectURL(new Blob([text],{ type:'application/json' })); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 2000); }
async function shareFile(name, text){
  const file=new File([text], name, { type:'application/json' });
  if(navigator.canShare && navigator.canShare({ files:[file] })){ try{ await navigator.share({ files:[file], title:name }); return true; }catch(e){ return false; } }
  download(name, text); return true;
}

/* ---------- Import: validation with reasons ---------- */
const TASK_SECTIONS=['reading','listening','uoe','grammar'];
function whyItem(it){
  if(!it || typeof it!=='object') return T('not an object','no es un objeto');
  if(typeof it.id!=='string' || !it.id) return T('missing "id"','falta "id"');
  if(!TYPES.includes(it.type)) return T(`"type" must be one of: ${TYPES.join(', ')}`,`"type" debe ser uno de: ${TYPES.join(', ')}`);
  if(['mcq','gap','wordform'].includes(it.type) && typeof it.prompt!=='string') return T('missing "prompt"','falta "prompt"');
  if(['mcq','gap','wordform'].includes(it.type) && !it.prompt.includes('___')) return T('the "prompt" has no ___ gap','el "prompt" no tiene hueco ___');
  if(it.type==='mcq' && !(Array.isArray(it.options) && it.options.includes(it.answer))) return T('"answer" is not in "options"','"answer" no está entre las "options"');
  if(['gap','wordform','translate'].includes(it.type) && !(Array.isArray(it.answers) && it.answers.length)) return T('missing "answers" (list)','falta "answers" (lista)');
  if(it.type==='translate' && typeof it.es!=='string') return T('missing "es"','falta "es"');
  if(it.type==='dictation' && typeof it.text!=='string') return T('missing "text"','falta "text"');
  if(it.type==='writing' && typeof it.task!=='string') return T('missing "task"','falta "task"');
  return null;
}
function whyTask(t){
  if(!t || typeof t.id!=='string') return T('missing "id"','falta "id"');
  if(!TASK_SECTIONS.includes(t.section)) return T(`"section" must be ${TASK_SECTIONS.join(', ')}`,`"section" debe ser ${TASK_SECTIONS.join(', ')}`);
  if(!Array.isArray(t.questions) || !t.questions.length) return T('no "questions"','no tiene "questions"');
  for(const q of t.questions){
    if(q==null || q.n==null) return T('a question has no "n"','una pregunta no tiene "n"');
    if(!['mcq','select','text'].includes(q.kind)) return T(`question ${q.n}: "kind" must be mcq, select or text`,`pregunta ${q.n}: "kind" debe ser mcq, select o text`);
    if(q.kind==='text' && !(Array.isArray(q.answers)&&q.answers.length)) return T(`question ${q.n}: missing "answers"`,`pregunta ${q.n}: falta "answers"`);
    if(q.kind!=='text' && !(Array.isArray(q.options)&&q.options.includes(q.answer))) return T(`question ${q.n}: "answer" is not in "options"`,`pregunta ${q.n}: "answer" no está en "options"`);
  }
  if(t.passage){ const nums=new Set(t.questions.map(q=>String(q.n))); for(const m of t.passage.matchAll(/\[(\d+)\]/g)) if(!nums.has(m[1])) return T(`the text marks [${m[1]}] but there is no question ${m[1]}`,`el texto marca [${m[1]}] pero no hay pregunta ${m[1]}`); }
  return null;
}
function whyTopic(g){
  if(!g || typeof g.id!=='string') return T('missing "id"','falta "id"');
  if(typeof g.title!=='string' || typeof g.html!=='string') return T('missing "title" or "html"','faltan "title" o "html"');
  if(!Array.isArray(g.test)) return T('missing "test" (can be [])','falta "test" (puede ser [])');
  for(const [i,q] of g.test.entries()){ if(!q.q || q.a==null) return T(`question ${i+1}: missing "q" or "a"`,`pregunta ${i+1}: faltan "q" o "a"`); if(q.o && !q.o.includes(q.a)) return T(`question ${i+1}: "a" is not in "o"`,`pregunta ${i+1}: "a" no está en "o"`); }
  return null;
}
function whyPage(p){ if(!p || typeof p.id!=='string') return T('missing "id"','falta "id"'); if(typeof p.title!=='string' || typeof p.html!=='string') return T('missing "title" or "html"','faltan "title" o "html"'); return null; }
function whyPaper(p){ if(!p || typeof p.id!=='string' || typeof p.title!=='string') return T('missing "id" or "title"','faltan "id" o "title"'); if(!p.minutes || !p.max) return T('missing "minutes" or "max"','faltan "minutes" o "max"'); return null; }
function whyPhrasal(p){
  if(!p || typeof p.v!=='string' || !p.v) return T('missing "v" (the phrasal verb)','falta "v" (el phrasal verb)');
  if(typeof p.es!=='string' && typeof p.en!=='string') return T('missing "es" or "en" (meaning)','falta "es" o "en" (significado)');
  if(!Array.isArray(p.ex) || !p.ex.length) return T('missing "ex" (list of examples)','falta "ex" (lista de ejemplos)');
  if(!p.ex.some(e=>(String(e).match(/\*/g)||[]).length>=2)) return T('no example marks the verb with *asterisks*','ningún ejemplo marca el verbo con *asteriscos*');
  return null;
}
const WHY={ items:whyItem, tasks:whyTask, grammar:whyTopic, pages:whyPage, papers:whyPaper, phrasal:whyPhrasal };
function existsIn(k,key){ return ({ items:ITEMS, tasks:TASKS, papers:PAPERS, pages:PAGES, grammar:GRAMMAR, phrasal:PHRASAL })[k].has(key); }
function parseImport(text){
  let t=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
  const i=t.search(/[\[{]/); if(i<0) throw new Error(T("I can't find any JSON in the text.",'No encuentro ningún JSON en el texto.'));
  t=t.slice(i); const last=Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  if(last<1) throw new Error(T("The JSON is incomplete: it looks like it wasn't copied in full.",'El JSON está incompleto: parece que no se ha copiado entero.'));
  t=t.slice(0,last+1);
  let data;
  try{ data=JSON.parse(t); }
  catch(e){ try{ data=JSON.parse('['+t.replace(/}\s*{/g,'},{')+']'); }catch(_){ throw new Error(T('The JSON is not valid. This usually happens when it was not copied in full (check the end).','El JSON no es válido. Suele pasar si no se ha copiado entero (revisa el final).')); } }
  const list=Array.isArray(data) ? data : [data];
  if(!list.length) throw new Error(T('The JSON is empty.','El JSON está vacío.'));
  return list;
}
function analyzeImport(list){
  const rep={ entries:[], ok:true };
  for(const d of list){
    if(!d || typeof d!=='object'){ rep.entries.push({ kind:'error', msg:T('An element is not an object.','Elemento que no es un objeto.') }); continue; }
    if(d.format==='lexi-backup'){ rep.entries.push({ kind:'backup', data:d, when:d.savedAt }); continue; }
    if(d.format!=='lexi-pack'){ rep.entries.push({ kind:'error', msg:T(`Unknown format${d.format?` ("${d.format}")`:''}. It must include "format": "lexi-pack".`,`Formato desconocido${d.format?` ("${d.format}")`:''}. Debe llevar "format": "lexi-pack".`) }); continue; }
    const P=d.pack||{}, e={ kind:'pack', data:d, id:P.id||null, name:P.name||P.id||T('Untitled pack','Pack sin nombre'), mode:P.mode==='merge'?'merge':'replace', counts:{}, errors:[], clean:{} };
    e.existing=!!(P.id && S.packs.find(p=>p.id===P.id));
    for(const k of PACK_KEYS){
      const arr=P[k]; if(arr==null) continue;
      if(!Array.isArray(arr)){ e.errors.push(T(`"${k}" should be a list`,`"${k}" debería ser una lista`)); continue; }
      const good=[]; let nw=0, up=0;
      arr.forEach((x,i)=>{ const why=WHY[k](x); if(why){ e.errors.push(`${k}[${i}]${x&&keyOf(k,x)?` (${keyOf(k,x)})`:''}: ${why}`); return; }
        good.push(x); if(existsIn(k,keyOf(k,x))) up++; else nw++; });
      e.clean[k]=good; if(arr.length) e.counts[k]={ nw, up, bad:arr.length-good.length };
    }
    if(Array.isArray(d.feedback)){ const ok=d.feedback.filter(f=>S.writings.some(w=>w.id===f.writingId)).length; e.feedback={ ok, missing:d.feedback.length-ok }; }
    if(Array.isArray(d.review)) e.review=d.review.filter(id=>S.srs[id]).length;
    if(Array.isArray(d.retire)) e.retire=d.retire.length;
    if(Array.isArray(d.convertedNotes)) e.converted=d.convertedNotes.length;
    if(d.message) e.message=String(d.message);
    rep.entries.push(e);
  }
  rep.ok=rep.entries.some(e=>e.kind!=='error');
  return rep;
}
function applyImport(rep){
  const out=[];
  for(const e of rep.entries){
    if(e.kind==='backup'){ S=Object.assign(defaultState(), e.data.state); setLang(S.settings.lang||'en'); out.push(T('backup restored','copia de seguridad restaurada')); continue; }
    if(e.kind!=='pack') continue;
    const d=e.data;
    if(Object.keys(e.clean).some(k=>e.clean[k].length)){
      const id=e.id || 'pack-'+Date.now().toString(36);
      const prev=S.packs.find(p=>p.id===id);
      const pk={ id, name:e.name, importedAt:Date.now(), updatedFrom:prev?prev.importedAt:null, off:prev?prev.off:false };
      for(const k of PACK_KEYS){
        const incoming=e.clean[k]||[];
        if(e.mode==='merge' && prev){ const m=new Map((prev[k]||[]).map(x=>[keyOf(k,x),x])); for(const x of incoming) m.set(keyOf(k,x),x); pk[k]=[...m.values()]; }
        else pk[k]=incoming;
      }
      S.packs=S.packs.filter(p=>p.id!==id); S.packs.push(pk);
      out.push(`"${e.name}" ${prev?(e.mode==='merge'?T('updated (merged)','actualizado (fusión)'):T('updated','actualizado')):T('installed','instalado')}`);
    }
    if(Array.isArray(d.feedback)){ for(const f of d.feedback){ const w=S.writings.find(x=>x.id===f.writingId); if(w) w.feedback={ score:f.score||'', bands:f.bands||null, notes:f.notes||'', corrected:f.corrected||'', at:Date.now() }; } if(e.feedback?.ok) out.push(T(`${e.feedback.ok} corrections`,`${e.feedback.ok} correcciones`)); }
    if(Array.isArray(d.review)) for(const id of d.review){ if(S.srs[id]) S.srs[id].due=Date.now(); }
    if(Array.isArray(d.retire)) for(const p of S.packs) for(const k of PACK_KEYS) if(p[k]) p[k]=p[k].filter(x=>!d.retire.includes(keyOf(k,x)));
    if(Array.isArray(d.convertedNotes)) for(const c of d.convertedNotes){ const nid=typeof c==='string'?c:c.noteId; const n=S.rawNotes.find(x=>x.id===nid); if(n){ n.status='converted'; n.pageIds=c.pageIds||[]; } }
    if(d.message) S.messages.push({ at:Date.now(), text:String(d.message), read:false });
  }
  rebuild(); exportCache=null; pendingImport=null; save();
  return out.length ? T('Done: ','Hecho: ')+out.join('; ')+'.' : T('Applied.','Aplicado.');
}
function importPreviewHTML(rep){
  const label=(k,c)=>{ const bits=[]; if(c.nw) bits.push(T(`${c.nw} new`,`${c.nw} nuevos`)); if(c.up) bits.push(T(`${c.up} updated`,`${c.up} actualizados`)); if(c.bad) bits.push(`<span class="bad-t">${T(`${c.bad} with errors`,`${c.bad} con errores`)}</span>`); return `${lab(PACK_L,k)}: ${bits.join(', ')}`; };
  return `<div class="panel note preview"><h3>${T('Check before applying','Revisa antes de aplicar')}</h3>
    ${rep.entries.map(e=>{
      if(e.kind==='error') return `<p class="bad-t">${esc(e.msg)}</p>`;
      if(e.kind==='backup') return `<p><b>${T('Backup','Copia de seguridad')}</b>${e.when?` ${T('from','del')} ${esc(fmtDate(Date.parse(e.when)))}`:''}. <span class="bad-t">${T('It will replace all your current data.','Sustituirá todos tus datos actuales.')}</span></p>`;
      return `<div class="pv-entry"><b>${esc(e.name)}</b> <span class="chip">${e.existing?(e.mode==='merge'?T('merges with the one you have','se fusiona con el que tienes'):T('replaces the one you have','sustituye al que tienes')):T('new','nuevo')}</span>
        <ul class="small">${Object.entries(e.counts).map(([k,c])=>`<li>${label(k,c)}</li>`).join('')}
        ${e.feedback?`<li>${T('Writing corrections:','Correcciones de writing:')} ${e.feedback.ok}${e.feedback.missing?T(` (${e.feedback.missing} for texts not on this phone)`,` (${e.feedback.missing} de textos que no están en este móvil)`):''}</li>`:''}
        ${e.review!=null?`<li>${T('Words to review now:','Palabras para repasar ya:')} ${e.review}</li>`:''}${e.retire?`<li>${T('Items to remove:','Elementos a retirar:')} ${e.retire}</li>`:''}
        ${e.converted?`<li>${T('Notes marked as converted:','Apuntes marcados como convertidos:')} ${e.converted}</li>`:''}${e.message?`<li>${T('Includes a note for you','Incluye una nota para ti')}</li>`:''}</ul>
        ${e.errors.length?`<details><summary class="small bad-t">${T(`${e.errors.length} ${e.errors.length===1?"item won't":"items won't"} be loaded: see why`,`${e.errors.length} ${e.errors.length===1?'elemento no se cargará':'elementos no se cargarán'}: ver por qué`)}</summary><ul class="small">${e.errors.slice(0,30).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="small muted">${T('Give this list to Claude so it can fix it.','Pásale esta lista a Claude para que lo corrija.')}</p></details>`:''}</div>`;
    }).join('')}
    <div class="row" style="margin-top:12px">${rep.ok?`<button class="btn primary" data-act="applyimport">${T('Apply','Aplicar')}</button>`:''}<button class="btn" data-act="cancelimport">${T('Cancel','Cancelar')}</button></div></div>`;
}
function reviewImport(text){
  try{ pendingImport=analyzeImport(parseImport(text)); }
  catch(e){ pendingImport=null; toast(e.message); return; }
  render(); setTimeout(()=>document.querySelector('.preview')?.scrollIntoView({ behavior:'smooth', block:'start' }), 50);
}
function packCounts(p){ return PACK_KEYS.filter(k=>(p[k]||[]).length).map(k=>`${p[k].length} ${lab(PACK_L,k)}`).join(', ') || T('empty','vacío'); }
function packContents(p){
  const name=(k,x)=>k==='phrasal'?x.v:(L(x,'title')||x.word||x.prompt||x.es||x.id);
  return PACK_KEYS.filter(k=>(p[k]||[]).length).map(k=>`<p class="small"><b>${lab(PACK_L,k)}</b></p><ul class="small">${p[k].slice(0,40).map(x=>`<li>${esc(String(name(k,x)).slice(0,90))}</li>`).join('')}${p[k].length>40?`<li>${T(`…and ${p[k].length-40} more`,`…y ${p[k].length-40} más`)}</li>`:''}</ul>`).join('');
}

/* ---------- Data ---------- */
function renderData(){
  const delta=getExport(false), n=delta.attempts.length, t=delta.tests.length, w=delta.writings.length, nn=delta.notes.length, any=n||t||w||nn;
  const seg=(key,vals,labels)=>`<div class="seg" role="group">${vals.map((v,i)=>`<button data-set="${key}" data-val="${v}" aria-pressed="${S.settings[key]===v}">${labels?labels[i]:v}</button>`).join('')}</div>`;
  return `${header()}<h1>${T('Data','Datos')}</h1>
    <p class="muted">${T('Your loop with Claude: send what you did, get back a new map built on your mistakes.','Tu ciclo con Claude: envías lo que has hecho y recibes un mapa nuevo hecho con tus fallos.')}</p>
    <div class="panel stack step"><h3><span class="qn">1</span>${T('Send to Claude','Enviar a Claude')}</h3><p style="margin:0">${any?T(`Since ${S.lastExportAt?'your last export ('+fmtDate(S.lastExportAt)+')':'the beginning'}: <b>${n}</b> exercises, <b>${t}</b> tests, <b>${w}</b> texts and <b>${nn}</b> notes.`,`Desde ${S.lastExportAt?'el último envío ('+fmtDate(S.lastExportAt)+')':'el principio'}: <b>${n}</b> ejercicios, <b>${t}</b> tests, <b>${w}</b> textos y <b>${nn}</b> apuntes.`):T('Nothing new since your last export.','No hay novedades desde el último envío.')}</p>
      <button class="btn primary block" data-act="copydelta" ${any?'':'disabled'}>${T('Copy updates','Copiar novedades')}</button>
      <button class="btn block" data-act="sharedelta" ${any?'':'disabled'}>${T('Save as a file','Guardar como archivo')}</button>
      <p class="small muted" style="margin:0">${T('Paste it in the project chat. Copying it resets the counter.','Pégalo en el chat del proyecto. Al copiarlo, el contador se reinicia.')}</p>
      <button class="btn ghost block" data-go="templates">${T('Note templates','Plantillas de apuntes')}</button></div>
    <details class="panel"><summary>${T('Export your whole history','Exportar todo el historial')}</summary><p class="small muted" style="margin:10px 0">${T("For a full analysis. It doesn't reset the counter.",'Para un análisis completo. No reinicia el contador.')}</p><button class="btn block" data-act="copyfull">${T('Copy full history','Copiar historial completo')}</button></details>
    <div class="panel stack step"><h3><span class="qn">2</span>${T('Receive from Claude','Recibir de Claude')}</h3><textarea class="field" id="imp" placeholder="${T('Paste the JSON from Claude here (one or several packs)','Pega aquí el JSON que te dé Claude (puede ser uno o varios packs)')}" style="min-height:120px;font-size:14px"></textarea>
      <button class="btn primary block" data-act="import">${T('Check','Revisar')}</button>
      <label class="btn block">${T('Load .json files','Cargar archivos .json')}<input type="file" id="impfile" accept="application/json,.json,.txt" multiple hidden></label></div>
    ${pendingImport?importPreviewHTML(pendingImport):''}
    <h2>${T('Installed content','Contenido instalado')}</h2>
    ${S.packs.length?`<ul class="list">${S.packs.map(p=>`<li><div class="row spread"><div><b>${esc(p.name)}</b><div class="small muted">${packCounts(p)}</div><div class="small muted">${p.updatedFrom?T('Updated','Actualizado'):T('Installed','Instalado')} ${fmtDate(p.importedAt)}</div></div>
        <button class="switch" role="switch" aria-checked="${!p.off}" data-packtoggle="${esc(p.id)}" aria-label="${T('Turn on or off','Activar o desactivar')}"><span></span></button></div>
        <div class="row" style="margin-top:6px"><button class="btn ghost" data-packview="${esc(p.id)}">${openPack===p.id?T('Hide','Ocultar'):T('See contents','Ver contenido')}</button><button class="btn ghost" data-packcopy="${esc(p.id)}">${T('Copy JSON','Copiar JSON')}</button><button class="btn ghost danger" data-packdel="${esc(p.id)}">${T('Delete','Borrar')}</button></div>
        ${openPack===p.id?`<div class="packbox">${packContents(p)}</div>`:''}</li>`).join('')}</ul>`:`<p class="small muted">${T("You haven't loaded any packs yet.",'Todavía no has cargado ningún pack.')}</p>`}
    <h2>${T('Settings','Ajustes')}</h2>
    <div class="panel stack"><div><b>${T('Language','Idioma')}</b></div><div class="seg" role="group"><button data-lang="en" aria-pressed="${LANG==='en'}">English</button><button data-lang="es" aria-pressed="${LANG==='es'}">Español</button></div>
      <p class="small muted" style="margin:0">${T('Changes the interface, theory and explanations. Exercises are always in English.','Cambia la interfaz, la teoría y las explicaciones. Los ejercicios siempre están en inglés.')}</p>
      <div style="margin-top:14px"><b>${T('Appearance','Apariencia')}</b></div><div class="seg" role="group">${[['auto',T('Automatic','Automático')],['light',T('Light','Claro')],['dark',T('Dark','Oscuro')]].map(([v,l])=>`<button data-theme-set="${v}" aria-pressed="${(S.settings.theme||'auto')===v}">${l}</button>`).join('')}</div>
      <div style="margin-top:14px"><b>${T('Exercises per vocabulary session','Ejercicios por sesión de vocabulario')}</b></div>${seg('sessionSize',[5,10,15,20])}
      <div style="margin-top:14px"><b>${T('New words per day','Palabras nuevas al día')}</b></div>${seg('newPerDay',[5,8,12,20])}</div>
    <h2>${T('Backup','Copia de seguridad')}</h2>
    <div class="panel stack"><p class="small muted" style="margin:0">${T('Your data only exists on this phone. Save a copy from time to time.','Tus datos solo están en este móvil. Guarda una copia de vez en cuando.')}</p>
      <button class="btn block" data-act="backup">${T('Download backup','Descargar copia de seguridad')}</button>
      <label class="btn block">${T('Restore backup','Restaurar copia')}<input type="file" id="restore" accept="application/json,.json" hidden></label>
      <button class="btn ghost danger block" data-act="wipe">${T('Delete all data','Borrar todos los datos')}</button></div>
    <p class="small muted">Lexi ${APP_VERSION}</p>`;
}

/* ---------- Events ---------- */
let saveTimer=null;
function savingLabel(done){ const sv=$('[data-saved]'); if(sv) sv.textContent=done?T('Saved','Guardado'):T('Saving…','Guardando…'); }
function afterRender(){
  const legs=document.querySelectorAll('.leg[data-to]');
  if(legs.length) requestAnimationFrame(()=>requestAnimationFrame(()=>legs.forEach(l=>l.style.transform=`scaleX(${l.dataset.to})`)));
  const inp=$('#ans'); if(inp && !current?.checked) setTimeout(()=>inp.focus(), 60);
  document.querySelectorAll('textarea[data-w]').forEach(ta=>ta.addEventListener('input',()=>{
    const w=S.writings.find(x=>x.id===ta.dataset.w); if(!w) return; const p=ITEMS.get(w.promptId);
    w.text=ta.value; w.updatedAt=Date.now();
    const c=document.querySelector(`[data-wc="${w.id}"]`); if(c) c.textContent=wcLabel(ta.value,p);
    savingLabel(false); clearTimeout(saveTimer); saveTimer=setTimeout(()=>{ exportCache=null; save(); savingLabel(true); }, 700);
  }));
  const tt=$('#wtitle'); if(tt) tt.addEventListener('input',()=>{ const w=S.writings.find(x=>x.id===editing); w.title=tt.value; w.updatedAt=Date.now(); clearTimeout(saveTimer); saveTimer=setTimeout(save,700); });
  document.querySelectorAll('input.qin').forEach(el=>el.addEventListener('input',()=>{ if(!S.run) return; S.run.answers[el.dataset.q]=el.value; clearTimeout(saveTimer); saveTimer=setTimeout(save,500); }));
  const iq=$('#irrq'); if(iq) iq.addEventListener('input',()=>{ irrFilter=iq.value; const f=irrFilter.toLowerCase();
    $('#irrbody').innerHTML=irrRows((window.LEXI_IRREGULAR||[]).filter(v=>!f||[v.b,v.p,v.pp,v.es].some(x=>x.toLowerCase().includes(f)))); });
  const f=$('#impfile'); if(f) f.addEventListener('change', async ()=>{ if(!f.files.length) return;
    const texts=await Promise.all([...f.files].map(x=>x.text())); let all=[];
    try{ for(const t of texts) all=all.concat(parseImport(t)); }catch(e){ toast(e.message); return; }
    pendingImport=analyzeImport(all); render(); setTimeout(()=>document.querySelector('.preview')?.scrollIntoView({ behavior:'smooth' }), 50); });
  const r=$('#restore'); if(r) r.addEventListener('change', async ()=>{ const file=r.files[0]; if(!file) return; reviewImport(await file.text()); });
  document.querySelectorAll('textarea[data-note]').forEach(ta=>ta.addEventListener('input',()=>{ const n=S.rawNotes.find(x=>x.id===ta.dataset.note); if(!n) return; n.text=ta.value; n.updatedAt=Date.now();
    savingLabel(false); clearTimeout(saveTimer); saveTimer=setTimeout(()=>{ exportCache=null; save(); savingLabel(true); },700); }));
  const nt=$('#ntitle'); if(nt) nt.addEventListener('input',()=>{ const n=S.rawNotes.find(x=>x.id===noteId); n.title=nt.value; n.updatedAt=Date.now(); clearTimeout(saveTimer); saveTimer=setTimeout(save,700); });
  const pq=$('#phrq'); if(pq) pq.addEventListener('input',()=>{ phrFilter=pq.value; $('#phrlist').innerHTML=phrCards(); });
  if(view==='session' && current && !current.checked){ const it=ITEMS.get(current.id); if(it?.type==='dictation') setTimeout(()=>speak(it.text), 350); }
}
function playKey(key){
  const run=S.run; if(!run) return;
  const tasks=run.tasks.map(TT); let lines=null;
  for(const t of tasks){ if(t.id===key) lines=t.audio; for(const q of t.questions) if(t.id+':'+q.n===key) lines=q.audio; }
  if(!lines) return;
  const reveal=run.mode==='practice' && run.checked[run.ti];
  if(run.mode==='exam' && !reveal){ if((run.plays[key]||0)>=2) return; run.plays[key]=(run.plays[key]||0)+1; save(); render(); }
  speakScript(lines);
}
document.addEventListener('click', async e=>{
  const t=e.target.closest('button, [data-go], tr[data-say], tr[data-result]'); if(!t || t.disabled) return;
  const ds=t.dataset;
  if(ds.go){ go(ds.go); return; }
  if(ds.opt!==undefined){ check(ds.opt); return; }
  if(ds.say){ speak(ds.say); return; }
  if(ds.q && ds.v!==undefined){ if(!S.run) return; S.run.answers[ds.q]=ds.v; save(); const y=window.scrollY; render(); window.scrollTo(0,y); return; }
  if(ds.play){ playKey(ds.play); return; }
  if(ds.new){ const w=createWriting(ds.new); save(); editing=w.id; go('write'); return; }
  if(ds.open){ editing=ds.open; go('write'); return; }
  if(ds.page){ const i=ds.page.indexOf(':'); pageRef=[ds.page.slice(0,i), ds.page.slice(i+1)]; go('page'); return; }
  if(ds.topic){ startTopic(ds.topic); return; }
  if(ds.part){ const [s,p]=ds.part.split(':'); startPart(s, +p); return; }
  if(ds.paper){ startPaper(ds.paper); return; }
  if(ds.result){ resultId=ds.result; go('result'); return; }
  if(ds.lang){ setLang(ds.lang); exportCache=null; save(); render(); return; }
  if(ds.themeSet){ S.settings.theme=ds.themeSet; applyTheme(); save(); render(); return; }
  if(ds.set){ S.settings[ds.set]=+ds.val; save(); render(); return; }
  if(ds.sp){ sp={ part:+ds.sp, idx:Math.floor(Math.random()*20), end:0 }; render(); return; }
  if(ds.phrtheme!==undefined){ phrTheme=ds.phrtheme; render(); return; }
  if(ds.newnote!==undefined){ newNote(ds.newnote); return; }
  if(ds.note){ noteId=ds.note; go('note'); return; }
  if(ds.copytpl){ const tp=NOTE_TEMPLATES.find(x=>x.id===ds.copytpl); toast(await copyText(tpl(tp,'text'))?T('Template copied.','Plantilla copiada.'):T("Couldn't copy.",'No se pudo copiar.')); return; }
  if(ds.packtoggle){ const p=S.packs.find(x=>x.id===ds.packtoggle); p.off=!p.off; rebuild(); exportCache=null; save(); render(); toast(p.off?T('Pack turned off: its content no longer appears.','Pack desactivado: su contenido deja de aparecer.'):T('Pack turned on.','Pack activado.')); return; }
  if(ds.packview){ openPack=openPack===ds.packview?null:ds.packview; render(); return; }
  if(ds.packcopy){ const p=S.packs.find(x=>x.id===ds.packcopy); const pack={ id:p.id, name:p.name }; for(const k of PACK_KEYS) if((p[k]||[]).length) pack[k]=p[k];
    toast(await copyText(JSON.stringify({ format:'lexi-pack', pack }))?T('Pack JSON copied.','JSON del pack copiado.'):T("Couldn't copy.",'No se pudo copiar.')); return; }
  if(ds.packdel){ const p=S.packs.find(x=>x.id===ds.packdel); if(confirm(T(`Delete "${p.name}"? Your progress on its exercises is kept in case you load it again.`,`¿Borrar "${p.name}"? Tu progreso en sus ejercicios se conserva por si lo vuelves a cargar.`))){ S.packs=S.packs.filter(x=>x!==p); rebuild(); exportCache=null; save(); render(); } return; }
  if(ds.wchoose){ const m=S.wmock; const w=createWriting(ds.wchoose,{ mock:m.id, part:2 }); m.w2=w.id; save(); render(); return; }
  const act=ds.act; if(!act) return;
  const item=current && ITEMS.get(current.id);
  switch(act){
    case 'togglelang': setLang(LANG==='en'?'es':'en'); exportCache=null; save(); render(); break;
    case 'start': startSession(S.settings.sessionSize); break;
    case 'quick': startSession(5); break;
    case 'extra': startSession(S.settings.sessionSize, true); break;
    case 'resume': go('session'); break;
    case 'discard': S.session=null; current=null; save(); startSession(S.settings.sessionSize); break;
    case 'again': S.session=null; current=null; startSession(S.settings.sessionSize); break;
    case 'finish': S.session=null; current=null; save(); go('home'); break;
    case 'quit': current=null; go('home'); break;
    case 'check': check($('#ans')?.value||''); break;
    case 'dunno': check(''); break;
    case 'hint': current.showHint=true; render(); break;
    case 'next': next(); break;
    case 'say': speak(item.text); break;
    case 'sayslow': speak(item.text, 0.65); break;
    case 'readmsg': S.messages.forEach(m=>m.read=true); save(); render(); break;
    case 'irrtest': startRun({ kind:'irregular', ref:'irregular', title:T('Irregular verbs','Verbos irregulares'), tasks:[irrTask()] }); break;
    case 'phrtest': startRun({ kind:'phrasal', ref:'phrasal', title:'Phrasal verbs', tasks:[phrTask()] }); break;
    case 'checktask': { const run=S.run; const tk=TT(run.tasks[run.ti]); const empty=tk.questions.filter(q=>!run.answers[tk.id+':'+q.n]).length;
      if(empty && !confirm(T(`You have ${empty} unanswered. Check anyway?`,`Te faltan ${empty} por contestar. ¿Corregir igualmente?`))) break; run.checked[run.ti]=true; save(); render(); break; }
    case 'nexttask': S.run.ti++; save(); stopSpeech(); window.scrollTo(0,0); render(); break;
    case 'prevtask': S.run.ti--; save(); stopSpeech(); window.scrollTo(0,0); render(); break;
    case 'finishrun': if(S.run.mode!=='exam' || confirm(T("Hand in the exam? You won't be able to change your answers.",'¿Entregar el examen? Ya no podrás cambiar las respuestas.'))) finishRun(false); break;
    case 'quitrun': if(S.run.mode==='exam'){ stopSpeech(); go('tests'); toast(T("The exam is still running. The clock doesn't stop.",'El examen sigue en marcha. El tiempo no se para.')); } else if(confirm(T("Exit? Your answers are saved and you can continue later.",'¿Salir? Tus respuestas se guardan y podrás continuar.'))) go('tests'); break;
    case 'stopaudio': stopSpeech(); break;
    case 'wmock': startWMock(); break;
    case 'wmockdone': if(confirm(T('Hand in the Writing mock exam?','¿Entregar el simulacro de Writing?'))) finishWMock(false); break;
    case 'wdone': { const w=S.writings.find(x=>x.id===editing); w.status='done'; w.updatedAt=Date.now(); exportCache=null; save(); toast(T('Finished. It will go in your next export.','Terminado. Irá en tu próxima exportación.')); go('writing'); break; }
    case 'reopen': { const w=S.writings.find(x=>x.id===editing); w.status='draft'; save(); render(); break; }
    case 'wdel': if(confirm(T('Delete this text?','¿Borrar este texto?'))){ S.writings=S.writings.filter(x=>x.id!==editing); save(); go('writing'); } break;
    case 'sptimer': sp.end=Date.now()+sp.secs*1000; S.speak[dayKey()]=(S.speak[dayKey()]||0)+1; save(); render(); break;
    case 'spnext': sp.idx++; sp.end=0; stopSpeech(); render(); break;
    case 'recstart': startRec(); break;
    case 'recstop': if(rec) rec.stop(); break;
    case 'copydelta': { const d=getExport(false); if(await copyText(exportJSON(d))){ markExported(d); toast(T('Copied. Paste it in the chat with Claude.','Copiado. Pégalo en el chat con Claude.')); render(); } else toast(T("Couldn't copy. Use \"Save as a file\".",'No se pudo copiar. Usa "Guardar como archivo".')); break; }
    case 'sharedelta': { const d=getExport(false); if(await shareFile(`lexi-${dayKey()}.json`, exportJSON(d))){ markExported(d); render(); } break; }
    case 'copyfull': toast(await copyText(exportJSON(getExport(true))) ? T('Full history copied.','Historial completo copiado.') : T("Couldn't copy.",'No se pudo copiar.')); break;
    case 'import': { const v=$('#imp').value; if(!v.trim()){ toast(T('Paste the JSON first.','Pega primero el JSON.')); break; } reviewImport(v); break; }
    case 'applyimport': { const hasBackup=pendingImport.entries.some(e=>e.kind==='backup'); if(hasBackup && !confirm(T('You are about to replace all your data with the backup. Are you sure?','Vas a sustituir todos tus datos por la copia. ¿Seguro?'))) break; toast(applyImport(pendingImport)); render(); break; }
    case 'cancelimport': pendingImport=null; render(); break;
    case 'noteready': { const n=S.rawNotes.find(x=>x.id===noteId); if(!n.title.trim()){ toast(T('Give it a title first.','Ponle un título primero.')); break; } n.status='ready'; n.updatedAt=Date.now(); exportCache=null; save(); toast(T('Ready. It will go in your next export.','Listo. Irá en tu próxima exportación.')); go('study'); break; }
    case 'noteunready': { const n=S.rawNotes.find(x=>x.id===noteId); n.status='draft'; save(); render(); break; }
    case 'notedel': if(confirm(T('Delete this note?','¿Borrar este apunte?'))){ S.rawNotes=S.rawNotes.filter(x=>x.id!==noteId); save(); go('study'); } break;
    case 'backup': download(`lexi-backup-${dayKey()}.json`, JSON.stringify({ format:'lexi-backup', version:2, savedAt:iso(Date.now()), state:S })); break;
    case 'wipe': { const word=T('DELETE','BORRAR'); if(prompt(T(`Type ${word} to remove all your data from this phone.`,`Escribe ${word} para eliminar todos tus datos de este móvil.`))===word){ const lang=LANG; S=defaultState(); setLang(lang); rebuild(); save(); toast(T('Data deleted.','Datos borrados.')); go('home'); } break; }
  }
});
document.addEventListener('keydown', e=>{
  if(e.key!=='Enter' || view!=='session' || !current) return;
  if(e.target.id==='ans' && !current.checked){ e.preventDefault(); check(e.target.value); }
  else if(current.checked && e.target.tagName!=='BUTTON'){ e.preventDefault(); next(); }
});
// Timers
setInterval(()=>{
  document.querySelectorAll('[data-deadline]').forEach(el=>{
    const left=+el.dataset.deadline-Date.now(); el.textContent=mmss(left); el.classList.toggle('urgent', left<5*60000 && el.dataset.kind!=='speak');
    if(left<=0){ el.removeAttribute('data-deadline');
      if(el.dataset.kind==='run' && S.run) finishRun(true);
      else if(el.dataset.kind==='wmock' && S.wmock) finishWMock(true);
      else if(el.dataset.kind==='speak'){ el.textContent=T('Time','Tiempo'); if(navigator.vibrate) navigator.vibrate(200); } }
  });
  if(S.run?.deadline && Date.now()>S.run.deadline && view!=='run') finishRun(true);
  if(S.wmock && Date.now()>S.wmock.deadline && view!=='wmock') finishWMock(true);
}, 1000);

/* ---------- Start ---------- */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  const hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange', ()=>{ if(hadController && !['session','run','write','wmock','note'].includes(view)) location.reload(); });
}
if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(()=>{});
setLang(S.settings.lang||'en');
applyTheme();
render();
