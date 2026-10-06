'use strict';
/* Lexi 2: vocabulario (repetición espaciada), estudio, tests, simulacros PET/B2 y writing. Todo en local. */
const APP_VERSION = '3.0.0';
const KEY = 'lexi:v1';
const DAY = 864e5;

const TOPICS = { travel:'Viajes', work:'Trabajo', shopping:'Compras', health:'Salud', education:'Estudios', relationships:'Relaciones', freetime:'Tiempo libre', environment:'Medio ambiente', weather:'El tiempo', house:'Casa', technology:'Tecnología', food:'Comida', money:'Dinero', feelings:'Emociones', general:'General' };
const CATS = { vocab:'Elige la palabra', phrasal:'Phrasal verb', collocation:'Make, do, take o have', falsefriend:'Falso amigo', spelling:'Escribe la palabra', wordform:'Forma la palabra', translate:'¿Cómo se dice en inglés?', listening:'Dictado', writing:'Escritura' };
const TYPES = ['mcq','gap','wordform','translate','dictation','writing'];
const SECTIONS = { reading:'Reading PET', listening:'Listening PET', uoe:'B2 First Use of English' };
const PARTS = { reading:6, listening:4, uoe:4 };
const FORMS = { email:'Email', article:'Artículo', story:'Historia', essay:'Essay', review:'Review', sentences:'Frases' };

/* ---------- Estado ---------- */
function defaultState(){
  return { v:2, createdAt:Date.now(), srs:{}, attempts:[], writings:[], packs:[], exports:[], lastExportAt:0,
    daily:{}, session:null, messages:[], settings:{ sessionSize:10, newPerDay:12 },
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
  catch(e){ if(!saveFail) toast('No se ha podido guardar. Descarga una copia de seguridad en Datos.'); saveFail=true; }
}
let S = load();
let ITEMS, TASKS, PAPERS, PAGES, GRAMMAR, PHRASAL;
const PH_TOPIC = { rutina:'house', relaciones:'relationships', viajes:'travel', trabajo:'work', problemas:'general', comunicacion:'general', dinero:'money', salud:'health', ocio:'freetime' };
const PACK_KEYS = ['items','tasks','papers','pages','grammar','phrasal'];
const PACK_LABEL = { items:'ejercicios de vocabulario', tasks:'tareas de examen', papers:'simulacros', pages:'páginas', grammar:'temas de gramática', phrasal:'phrasal verbs' };
const keyOf = (k,x) => k==='phrasal' ? x.v : x.id;
function rebuild(){
  ITEMS = new Map();
  for(const it of (window.LEXI_CONTENT?.items||[])) ITEMS.set(it.id, it);
  for(const it of (window.LEXI_WRITING_EXTRA||[])) ITEMS.set(it.id, it);
  TASKS = new Map((window.LEXI_TASKS||[]).map(t=>[t.id,t]));
  PAPERS = new Map((window.LEXI_PAPERS||[]).map(p=>[p.id,p]));
  PAGES = new Map([...(window.LEXI_GUIDES||[]), ...(window.LEXI_WRITING_PAGES||[]), ...(window.LEXI_SPEAKING_PAGES||[])].map(p=>[p.id,p]));
  GRAMMAR = new Map((window.LEXI_GRAMMAR||[]).map(g=>[g.id,g]));
  PHRASAL = new Map((window.LEXI_PHRASAL||[]).map(p=>[p.v,p]));
  for(const p of S.packs){
    if(p.off) continue;
    for(const it of (p.items||[])) ITEMS.set(it.id, Object.assign({}, it, { pack:p.id }));
    for(const t of (p.tasks||[])) TASKS.set(t.id, Object.assign({}, t, { pack:p.id }));
    for(const x of (p.papers||[])) PAPERS.set(x.id, x);
    for(const x of (p.pages||[])) PAGES.set(x.id, Object.assign({}, x, { pack:p.id }));
    for(const x of (p.grammar||[])) GRAMMAR.set(x.id, x);
    for(const x of (p.phrasal||[])) PHRASAL.set(x.v, Object.assign({ theme:'otros', level:'B1' }, x, { pack:p.id }));
  }
  // Cada phrasal verb genera un ejercicio en contexto para las sesiones diarias
  for(const p of PHRASAL.values()){
    const ex=(p.ex||[]).find(e=>(e.match(/\*/g)||[]).length===2); if(!ex) continue;
    const id='ph-'+p.v.toLowerCase().replace(/[^a-z]+/g,'-');
    if(ITEMS.has(id)) continue;
    const other=(p.ex||[]).find(e=>e!==ex);
    ITEMS.set(id, { id, type:'gap', cat:'phrasal', level:p.level||'B1', topic:PH_TOPIC[p.theme]||'general', word:p.v,
      prompt:ex.replace(/\*([^*]+)\*/,'___'), hint:`${p.v}: ${p.es}`, hintAlways:true, answers:[ex.match(/\*([^*]+)\*/)[1]],
      exp:`${p.v} = ${p.es}.${p.sep?' Separable.':''}${other?' Otro ejemplo: '+other.replace(/\*/g,''):''}`, auto:true });
  }
}
rebuild();

let view = 'home', current = null, editing = null, exportCache = null, pageRef = null, resultId = null, sp = null, irrFilter = '', phrFilter = '', phrTheme = '', pendingImport = null, noteId = null, openPack = null;

/* ---------- Utilidades ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function dayKey(t = Date.now()){ const d = new Date(t); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function startOfDay(t){ const d = new Date(t); d.setHours(0,0,0,0); return d.getTime(); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function iso(t){ return new Date(t).toISOString(); }
function fmtDate(t){ return new Date(t).toLocaleDateString('es-ES',{ day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); }
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

/* ---------- Voz ---------- */
let voiceA=null, voiceB=null;
function pickVoices(){
  if(!('speechSynthesis' in window)) return;
  const vs=speechSynthesis.getVoices().filter(v=>v.lang && v.lang.toLowerCase().startsWith('en'));
  const gb=vs.filter(v=>v.lang==='en-GB'||v.lang==='en_GB');
  const pool=gb.length>=2?gb:vs;
  voiceA=pool[0]||null; voiceB=pool.find(v=>v!==voiceA)||voiceA;
}
if('speechSynthesis' in window){ pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
function hasVoice(){ if(!('speechSynthesis' in window)){ toast('Este navegador no tiene voz. Prueba con Chrome o Safari.'); return false; } return true; }
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

/* ---------- Repetición espaciada (vocabulario) ---------- */
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
  if(!q.length){ toast('No hay ejercicios disponibles ahora mismo.'); return; }
  S.session={ q, i:0, retried:[], results:[], started:Date.now() }; current=null; save(); go('session');
}
function check(ans){
  const ss=S.session; if(!current || current.checked || !ss) return;
  const item=ITEMS.get(current.id), res=grade(item, ans), ms=Date.now()-current.start;
  current.checked=true; current.result=res; current.answer=ans;
  const isNew=schedule(item.id, res);
  const d=today(); d.n++; if(res!=='bad') d.ok++; if(isNew) d.nw++;
  S.attempts.push({ id:item.id, t:Date.now(), r:res, ms, a:String(ans||'').slice(0,300) });
  ss.results.push({ id:item.id, r:res });
  if(res==='bad' && !ss.retried.includes(item.id)){ ss.retried.push(item.id); ss.q.splice(Math.min(ss.q.length, ss.i+4), 0, item.id); }
  exportCache=null; save(); render();
  if(item.type!=='mcq') setTimeout(()=>$('#next')?.focus(), 50);
}
function next(){ if(!S.session) return; S.session.i++; current=null; save(); render(); }

/* ---------- Render general ---------- */
function go(v){ view=v; stopSpeech(); window.scrollTo(0,0); render(); }
const TAB_OF = { templates:'study', note:'study', home:'home', session:'home', progress:'home', study:'study', page:'study', speak:'study', tests:'tests', run:'tests', result:'tests', writing:'writing', write:'writing', wmock:'writing', data:'data' };
function render(){
  document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-current', b.dataset.go===TAB_OF[view] ? 'page' : 'false'));
  $('#tabs').classList.toggle('hidden', ['session','run','wmock'].includes(view));
  const fn={ home:renderHome, session:renderSession, progress:renderProgress, study:renderStudy, page:renderPage, speak:renderSpeak,
    tests:renderTests, run:renderRun, templates:renderTemplates, note:renderNote, result:renderResult, writing:renderWriting, write:renderWrite, wmock:renderWMock, data:renderData }[view] || renderHome;
  $('#app').innerHTML = fn();
  afterRender();
}
function header(){ return `<div class="top"><div class="brand">Lexi<i></i></div><div class="muted small">${esc(new Date().toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'long'}))}</div></div>`; }
function backBar(title, to){ return `<div class="sess-top"><button class="icon-btn" data-go="${to}" aria-label="Volver">←</button><b style="flex:1">${esc(title)}</b></div>`; }

/* ---------- Inicio ---------- */
function renderHome(){
  const c=counts(), ss=S.session, size=S.settings.sessionSize;
  const pending=ss && ss.i<ss.q.length;
  const unread=S.messages.filter(m=>!m.read).slice(-1)[0];
  const since=S.attempts.filter(a=>a.t>S.lastExportAt).length + S.tests.filter(t=>t.at>S.lastExportAt).length*5;
  const daysSinceExport=S.lastExportAt ? Math.floor((Date.now()-S.lastExportAt)/DAY) : null;
  let hero;
  if(pending) hero=`<h1>Tienes una sesión a medias</h1><p class="muted">Vas por el ejercicio ${ss.i+1} de ${ss.q.length}.</p>
      <button class="btn primary big block" data-act="resume">Continuar sesión</button>
      <button class="btn ghost block" data-act="discard">Descartar y empezar otra</button>`;
  else if(c.due+c.newAvail>0) hero=`<h1>${c.due} ${c.due===1?'repaso':'repasos'} y ${c.newAvail} ${c.newAvail===1?'palabra nueva':'palabras nuevas'} para hoy</h1>
      <p class="muted">Sesiones de ${size} ejercicios de vocabulario. Puedes dejarlas a medias cuando quieras.</p>
      <button class="btn primary big block" data-act="start">Empezar sesión</button><div class="gap"></div>
      <button class="btn block" data-act="quick">Sesión rápida de 5</button>`;
  else hero=`<h1>Vocabulario al día</h1><p class="muted">Los repasos vuelven cuando toca. Mientras, puedes estudiar gramática o hacer un test.</p>
      <button class="btn primary big block" data-act="extra" ${Object.keys(S.srs).length?'':'disabled'}>Repaso extra de vocabulario</button>`;
  const run=S.run, wm=S.wmock;
  return `${header()}
    ${unread?`<div class="panel note"><h3>Nota de Claude</h3><p style="white-space:pre-wrap">${esc(unread.text)}</p><button class="btn ghost" data-act="readmsg">Marcar como leída</button></div>`:''}
    ${run?`<div class="panel note"><h3>${esc(run.title)} a medias</h3><button class="btn block" data-go="run">Continuar</button></div>`:''}
    ${wm?`<div class="panel note"><h3>Simulacro de Writing en curso</h3><button class="btn block" data-go="wmock">Continuar</button></div>`:''}
    ${hero}
    <div class="stats">
      <div class="stat"><b>${c.streak}</b><span>${c.streak===1?'día seguido':'días seguidos'}</span></div>
      <div class="stat"><b>${c.learned}</b><span>palabras aprendidas</span></div>
      <div class="stat"><b>${S.tests.length}</b><span>tests hechos</span></div>
    </div>
    <div class="grid2">
      <button class="tile" data-go="study"><b>Estudiar</b><span>Gramática, irregulares y guías del examen</span></button>
      <button class="tile" data-go="tests"><b>Tests</b><span>Por temas, por partes y simulacros</span></button>
      <button class="tile" data-go="writing"><b>Escribir</b><span>Emails, artículos e historias</span></button>
      <button class="tile" data-go="progress"><b>Progreso</b><span>Estadísticas y evolución</span></button>
    </div>
    ${since>=30 && (daysSinceExport===null || daysSinceExport>=7) ? `<div class="panel" style="margin-top:14px"><h3>Toca revisar con Claude</h3><p class="muted small">Tienes bastante actividad sin exportar. Copia tus novedades y pégalas en el chat.</p><button class="btn block" data-go="data">Ir a exportar</button></div>`:''}`;
}

/* ---------- Sesión de vocabulario ---------- */
function sentenceHTML(prompt, fill, cls){
  const parts=String(prompt).split('___');
  if(parts.length<2) return `<p class="sentence">${esc(prompt)}</p>`;
  return `<p class="sentence">${parts.map(esc).join(`<span class="slot ${cls||''}">${fill?esc(fill):'&nbsp;'}</span>`)}</p>`;
}
function renderSession(){
  const ss=S.session;
  if(!ss) return renderHome();
  if(ss.i>=ss.q.length) return renderSummary();
  const item=ITEMS.get(ss.q[ss.i]);
  if(!item){ ss.i++; save(); return renderSession(); }
  if(!current || current.idx!==ss.i || current.id!==item.id)
    current={ id:item.id, idx:ss.i, start:Date.now(), checked:false, result:null, answer:'', showHint:false, opts:item.options ? shuffle([...item.options]) : null };
  const pct=Math.round(ss.i/ss.q.length*100), done=current.checked, res=current.result, correct=correctText(item);
  let body='', answer='';
  if(item.type==='dictation'){
    body=`<div class="card" style="text-align:center"><button class="play" data-act="say" aria-label="Escuchar la frase">▶</button>
      <div style="margin-top:12px"><button class="btn ghost" data-act="sayslow">Escuchar más despacio</button></div>
      ${done?`<p class="sentence diff" style="margin-top:14px;font-size:21px">${dictDiff(item.text, current.answer)}</p>`:''}</div>`;
  } else if(item.type==='translate'){
    body=`<div class="card"><div class="es">${esc(item.es)}</div>${done?`<p class="sentence" style="margin-top:12px"><span class="slot ${res}">${esc(correct)}</span></p>`:''}</div>`;
  } else {
    const fill = done ? (item.type==='mcq' ? item.answer : (res==='ok' ? current.answer.trim() : correct)) : '';
    body=`<div class="card">${sentenceHTML(item.prompt, fill, done?(res==='bad'?'ok':res):'')}
      ${item.type==='wordform'?`<div class="base">${esc(item.base)}</div>`:''}
      ${item.hint && (current.showHint||done||item.hintAlways)?`<div class="hint">${esc(item.hint)}</div>`:''}</div>`;
  }
  if(item.type==='mcq'){
    answer=`<div class="opts">${current.opts.map(o=>{ let cls=''; if(done){ if(o===item.answer) cls='ok'; else if(o===current.answer) cls='bad'; }
      return `<button class="opt ${cls}" data-opt="${esc(o)}" ${done?'disabled':''}>${esc(o)}</button>`; }).join('')}</div>`;
  } else if(!done){
    answer=`<input id="ans" class="field" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${item.type==='dictation'?'Escribe lo que oyes':'Tu respuesta'}" aria-label="Tu respuesta">
      <div class="actions"><button class="btn primary block" data-act="check">Comprobar</button>
      <div class="row">${item.hint?`<button class="btn ghost" data-act="hint">Pista</button>`:''}<button class="btn ghost" data-act="dunno" style="margin-left:auto">No lo sé</button></div></div>`;
  } else if(res==='bad' && item.type!=='dictation') answer=`<p class="muted small">Tu respuesta: <b>${esc(current.answer)||'(en blanco)'}</b></p>`;
  let fb='';
  if(done){
    const title = res==='ok' ? 'Correcto' : res==='near' ? 'Casi: revisa la ortografía' : 'No es correcto';
    const listen = item.type==='dictation' ? item.text : (item.prompt ? item.prompt.replace('___', correct) : correct);
    fb=`<div class="fb ${res}"><h3>${title}</h3>${res!=='ok'?`<p>Respuesta: <span class="ans">${esc(correct)}</span></p>`:''}${item.exp?`<p class="small" style="margin:0">${esc(item.exp)}</p>`:''}</div>
    <div class="actions"><button class="btn primary block big" id="next" data-act="next">Siguiente</button><button class="btn ghost" data-say="${esc(listen)}">Escuchar la frase</button></div>`;
  }
  return `<div class="sess-top"><button class="icon-btn" data-act="quit" aria-label="Salir">✕</button>
      <div class="bar"><div style="width:${pct}%"></div></div><span class="small muted">${ss.i+1}/${ss.q.length}</span></div>
    <div class="kind"><span>${esc(CATS[item.cat]||'Ejercicio')}</span><span class="chip">${esc(item.level||'')}</span></div>${body}${answer}${fb}`;
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
  return `<h1 style="margin-top:20px">Sesión terminada</h1><p class="muted">Has acertado ${ok} de ${ids.length} a la primera.</p>
    ${failed.length?`<div class="panel"><h3>Para repasar</h3><ul class="list">${failed.map(i=>`<li><b>${esc(i.word||correctText(i))}</b><div class="small muted">${esc(i.exp||'')}</div></li>`).join('')}</ul></div>`:''}
    <div class="actions"><button class="btn primary big block" data-act="again">Otra sesión</button><button class="btn block" data-act="finish">Volver al inicio</button></div>`;
}

/* ---------- Estudio ---------- */
function bestOf(kind, ref){ const ts=S.tests.filter(t=>t.kind===kind && t.ref===ref); return ts.length ? Math.max(...ts.map(t=>Math.round(t.score/t.max*100))) : null; }
function badge(p){ return p===null ? '' : `<span class="pct ${p>=80?'hi':p>=60?'mid':'lo'}">${p}%</span>`; }
function readMark(id){ return S.read[id] ? '<span class="tick" aria-label="Leído">✓</span>' : ''; }
function renderStudy(){
  const pages=[...PAGES.values()], sec=s=>pages.filter(g=>g.section===s);
  const li=g=>`<li><button class="rowbtn" data-page="guide:${esc(g.id)}"><span>${esc(g.title)}</span>${readMark(g.id)}</button></li>`;
  const wp=sec('writing'), groups=[...new Set(wp.map(p=>p.group||'Más'))];
  const notes=sec('notes'), raw=S.rawNotes.filter(n=>n.status!=='converted');
  const learnedPh=[...PHRASAL.values()].filter(p=>{ const s=S.srs['ph-'+p.v.toLowerCase().replace(/[^a-z]+/g,'-')]; return s && s.i>=3; }).length;
  return `${header()}<h1>Estudiar</h1><p class="muted">Tu libro de teoría y tus apuntes.</p>
    <h2>Mis apuntes</h2>
    ${notes.length?`<ul class="list">${notes.map(li).join('')}</ul>`:'<p class="small muted">Aquí aparecerán tus apuntes cuando Claude te los devuelva convertidos.</p>'}
    ${raw.length?`<ul class="list">${raw.map(n=>`<li><button class="rowbtn" data-note="${esc(n.id)}"><span>${esc(n.title||'Apunte sin título')}<br><span class="small muted">${n.status==='ready'?'Listo para enviar a Claude':'Borrador'}</span></span><span>›</span></button></li>`).join('')}</ul>`:''}
    <div class="row"><button class="btn" data-go="templates">Plantillas de apuntes</button><button class="btn" data-newnote="">Nuevo apunte</button></div>
    <h2>El examen</h2><ul class="list">${sec('exam').map(li).join('')}</ul>
    <h2>Gramática</h2><ul class="list">${[...GRAMMAR.values()].map(g=>`<li><button class="rowbtn" data-page="grammar:${esc(g.id)}"><span>${esc(g.title)} <span class="chip">${esc(g.level)}</span></span><span class="row">${badge(bestOf('topic',g.id))}${readMark(g.id)}</span></button></li>`).join('')}</ul>
    <h2>Writing</h2>${groups.map(g=>`<h3 class="sub">${esc(g)}</h3><ul class="list">${wp.filter(p=>(p.group||'Más')===g).map(li).join('')}</ul>`).join('')}
    <h2>Vocabulario</h2><ul class="list">
      <li><button class="rowbtn" data-page="phrasal:"><span>Phrasal verbs en contexto (${PHRASAL.size})<br><span class="small muted">${learnedPh} aprendidos en tus sesiones</span></span>${badge(bestOf('phrasal','phrasal'))||'<span>›</span>'}</button></li>
      <li><button class="rowbtn" data-page="irregular:"><span>Verbos irregulares (${(window.LEXI_IRREGULAR||[]).length})</span>${badge(bestOf('irregular','irregular'))||'<span>›</span>'}</button></li></ul>
    <h2>Speaking</h2><ul class="list">${sec('speaking').map(li).join('')}<li><button class="rowbtn" data-go="speak"><span>Practicar speaking con cronómetro</span><span>›</span></button></li></ul>
    ${sec('other').length?`<h2>Más</h2><ul class="list">${sec('other').map(li).join('')}</ul>`:''}`;
}
function renderPage(){
  const [type,id]=pageRef||[];
  if(type==='guide'){ const g=PAGES.get(id); if(!g) return renderStudy(); S.read[id]=S.read[id]||Date.now(); save();
    return `${backBar(g.title,'study')}<article class="page">${g.html}</article>`; }
  if(type==='grammar'){ const g=GRAMMAR.get(id); if(!g) return renderStudy(); S.read[id]=S.read[id]||Date.now(); save();
    return `${backBar(g.title,'study')}<article class="page">${g.html}</article>
      <div class="panel"><div class="row spread"><b>Test de este tema</b>${badge(bestOf('topic',id))}</div><p class="small muted">${g.test.length} preguntas.</p>
      <button class="btn primary block" data-topic="${esc(id)}">Hacer el test</button></div>`; }
  if(type==='irregular'){ const f=irrFilter.toLowerCase();
    const rows=(window.LEXI_IRREGULAR||[]).filter(v=>!f || [v.b,v.p,v.pp,v.es].some(x=>x.toLowerCase().includes(f)));
    return `${backBar('Verbos irregulares','study')}
      <button class="btn primary block" data-act="irrtest">Practicar 10 verbos</button><div class="gap"></div>
      <input class="field" id="irrq" placeholder="Buscar (inglés o español)" value="${esc(irrFilter)}" autocomplete="off" autocapitalize="off">
      <div class="tablewrap"><table class="irr"><thead><tr><th>Infinitivo</th><th>Pasado</th><th>Participio</th></tr></thead><tbody id="irrbody">${irrRows(rows)}</tbody></table></div>
      <p class="small muted">Toca un verbo para escucharlo. Los que falles saldrán más en la práctica.</p>`; }
  if(type==='phrasal'){
    const themes=window.LEXI_PHRASAL_THEMES||{}; const used=[...new Set([...PHRASAL.values()].map(p=>p.theme))];
    return `${backBar('Phrasal verbs en contexto','study')}
      <p class="small muted">Aprende cada uno con sus frases: escúchalas y repítelas en voz alta. También salen en tus sesiones diarias de vocabulario.</p>
      <button class="btn primary block" data-act="phrtest">Test en contexto (10)</button><div class="gap"></div>
      <input class="field" id="phrq" placeholder="Buscar (inglés o español)" value="${esc(phrFilter)}" autocomplete="off" autocapitalize="off">
      <div class="chips">${['',...used].map(t=>`<button data-phrtheme="${esc(t)}" aria-pressed="${phrTheme===t}">${esc(t?(themes[t]||t):'Todos')}</button>`).join('')}</div>
      <div id="phrlist">${phrCards()}</div>`; }
  return renderStudy();
}
function hlEx(e){ return esc(e).replace(/\*([^*]+)\*/g,'<b class="hl">$1</b>'); }
function phrCards(){
  const f=phrFilter.toLowerCase();
  const list=[...PHRASAL.values()].filter(p=>(!phrTheme||p.theme===phrTheme) && (!f || (p.v+' '+p.es+' '+(p.ex||[]).join(' ')).toLowerCase().includes(f)));
  if(!list.length) return '<p class="muted">Nada con ese filtro.</p>';
  return list.map(p=>{ const s=S.srs['ph-'+p.v.toLowerCase().replace(/[^a-z]+/g,'-')];
    return `<div class="pv"><div class="row spread"><b class="pvv">${esc(p.v)}</b><span class="row">${s&&s.i>=3?'<span class="tick" title="Aprendido">✓</span>':''}${p.sep?'<span class="chip alt">separable</span>':''}<span class="chip">${esc(p.level||'')}</span></span></div>
      <div class="pves">${esc(p.es)}</div>
      <ul class="exs">${(p.ex||[]).map(e=>`<li><button class="icon-btn sm" data-say="${esc(e.replace(/\*/g,''))}" aria-label="Escuchar">▶</button><span>${hlEx(e)}</span></li>`).join('')}</ul></div>`; }).join('');
}
function irrRows(rows){ return rows.map(v=>`<tr data-say="${esc(v.b+', '+v.p.replace('/',' or ')+', '+v.pp.replace('/',' or '))}"><td><b>${esc(v.b)}</b><div class="small muted">${esc(v.es)}</div></td><td>${esc(v.p)}</td><td>${esc(v.pp)}</td></tr>`).join(''); }

/* ---------- Apuntes ---------- */
const NOTE_TEMPLATES = [
{ id:'general', title:'Apunte general (gramática, clase, vídeo…)', desc:'Para teoría: una explicación, ejemplos y dudas. Claude lo convierte en una página de estudio con su test.', text:`### APUNTE LEXI ###
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
sí / no. Cuántos y de qué tipo:` },
{ id:'vocab', title:'Lista de vocabulario', desc:'Palabras o expresiones que has visto. Claude añade ejemplos y las mete en tus sesiones diarias.', text:`### VOCABULARIO LEXI ###
Tema:
Nivel: B1 / B2
Fuente:

## Palabras (palabra = significado | frase donde la viste, si la tienes)
- 
- 
- 

## Dudas
-` },
{ id:'phrasal', title:'Phrasal verbs y expresiones', desc:'Phrasal verbs, collocations o frases hechas. Claude las añade a tu biblioteca con dos ejemplos cada una.', text:`### PHRASAL VERBS LEXI ###
Fuente:

## Lista (verbo = significado | ejemplo si lo tienes)
- 
- 
- 

## Los que confundo entre sí
-` },
{ id:'mistakes', title:'Mis errores (de clase o de un writing corregido)', desc:'Frases que te han corregido. Claude detecta el patrón y te crea ejercicios para no repetirlo.', text:`### ERRORES LEXI ###
Fuente: (writing, clase, examen de prueba…)

## Frase incorrecta → frase corregida
- ✗  →  ✓
- ✗  →  ✓

## Lo que me explicaron
-` }];
function renderTemplates(){
  return `${backBar('Plantillas de apuntes','study')}
    <p class="muted">Dos formas de usarlas:</p>
    <p><b>1. Dentro de la app:</b> pulsa "Crear apunte", rellénalo y márcalo como listo. Irá en tu próxima exportación.</p>
    <p><b>2. Fuera:</b> copia la plantilla, rellénala en tus notas o a mano (puedes mandarme una foto) y pégamela en el chat.</p>
    <p class="small muted">En los dos casos te devuelvo un pack con tus apuntes como páginas de estudio, más ejercicios si los pides.</p>
    ${NOTE_TEMPLATES.map(t=>`<div class="panel"><h3>${esc(t.title)}</h3><p class="small muted">${esc(t.desc)}</p>
      <details><summary class="small">Ver plantilla</summary><pre class="tpl">${esc(t.text)}</pre></details>
      <div class="row" style="margin-top:10px"><button class="btn primary" data-newnote="${t.id}">Crear apunte</button><button class="btn" data-copytpl="${t.id}">Copiar</button></div></div>`).join('')}`;
}
function newNote(tplId){
  const t=NOTE_TEMPLATES.find(x=>x.id===tplId);
  const n={ id:'n'+Date.now().toString(36), title:'', template:tplId||'libre', text:t?t.text:'', status:'draft', createdAt:Date.now(), updatedAt:Date.now() };
  S.rawNotes.push(n); save(); noteId=n.id; go('note');
}
function renderNote(){
  const n=S.rawNotes.find(x=>x.id===noteId); if(!n) return renderStudy();
  return `${backBar('Apunte','study')}
    <input class="field" id="ntitle" placeholder="Título (p. ej. Condicionales, clase del martes)" value="${esc(n.title)}" style="margin-bottom:10px">
    <textarea class="field" data-note="${esc(n.id)}" style="min-height:380px;font-size:15px" spellcheck="false">${esc(n.text)}</textarea>
    <div class="row spread" style="margin:8px 0 14px"><span class="small muted">${n.status==='ready'?'Listo: irá en tu próxima exportación.':'Borrador: no se envía hasta que lo marques como listo.'}</span><span class="small muted" data-saved></span></div>
    <div class="actions">${n.status==='ready'?`<button class="btn block" data-act="noteunready">Volver a borrador</button>`:`<button class="btn primary block big" data-act="noteready">Listo para Claude</button>`}
      <button class="btn ghost danger" data-act="notedel">Borrar apunte</button></div>`;
}

/* ---------- Speaking ---------- */
let rec=null, recChunks=[], recURL=null;
function renderSpeak(){
  const SP=window.LEXI_SPEAKING||{part1:[],part2:[],part3:[]};
  if(!sp) sp={ part:1, idx:0, end:0 };
  const parts={1:'Part 1: preguntas personales',2:'Part 2: describir una foto',3:'Part 3: discusión',4:'Part 4: opinión'};
  let prompt='', secs=30;
  if(sp.part===1){ prompt=SP.part1[sp.idx%SP.part1.length]; secs=30; }
  if(sp.part===2){ prompt=SP.part2[sp.idx%SP.part2.length]; secs=60; }
  if(sp.part===3){ const x=SP.part3[sp.idx%SP.part3.length]; prompt=`${x.title}\n\n${x.text}`; secs=150; }
  if(sp.part===4){ const x=SP.part3[Math.floor(sp.idx/3)%SP.part3.length]; prompt=x.follow[sp.idx%x.follow.length]; secs=45; }
  sp.secs=secs;
  const canRec=!!(navigator.mediaDevices && window.MediaRecorder);
  return `${backBar('Practicar speaking','study')}
    <div class="seg" role="group">${[1,2,3,4].map(p=>`<button data-sp="${p}" aria-pressed="${sp.part===p}">Part ${p}</button>`).join('')}</div>
    <p class="small muted" style="margin-top:8px">${parts[sp.part]}. ${sp.part===2?'Imagina la foto y descríbela durante 1 minuto.':sp.part===3?'Habla en voz alta como si tuvieras compañero: sugiere, compara y decide.':'Contesta con 2–3 frases, dando razones y ejemplos.'}</p>
    <div class="card"><div class="sp-prompt">${fmtText(prompt)}</div>
      ${sp.part!==3&&sp.part!==2?`<button class="btn ghost" data-say="${esc(prompt)}">Escuchar la pregunta</button>`:''}</div>
    <div class="timer-big" ${sp.end?`data-deadline="${sp.end}" data-kind="speak"`:''}>${sp.end?mmss(sp.end-Date.now()):mmss(secs*1000)}</div>
    <div class="actions">
      <button class="btn primary block" data-act="sptimer">${sp.end?'Reiniciar cronómetro':'Empezar a hablar'}</button>
      ${canRec?(rec?`<button class="btn block danger" data-act="recstop">■ Parar grabación</button>`:`<button class="btn block" data-act="recstart">● Grabarme</button>`):''}
      ${recURL&&!rec?`<audio controls src="${recURL}" style="width:100%"></audio>`:''}
      <button class="btn ghost block" data-act="spnext">Otra ${sp.part===2?'foto':sp.part===3?'situación':'pregunta'}</button></div>
    <p class="small muted">La grabación solo se queda en tu móvil mientras estás en esta pantalla. Escúchate buscando silencios largos, errores de tiempos verbales y palabras repetidas.</p>`;
}
async function startRec(){
  try{ const stream=await navigator.mediaDevices.getUserMedia({ audio:true });
    rec=new MediaRecorder(stream); recChunks=[];
    rec.ondataavailable=e=>recChunks.push(e.data);
    rec.onstop=()=>{ stream.getTracks().forEach(t=>t.stop()); if(recURL) URL.revokeObjectURL(recURL); recURL=URL.createObjectURL(new Blob(recChunks,{ type:rec.mimeType||'audio/webm' })); rec=null; render(); };
    rec.start(); render();
  }catch(e){ rec=null; toast('No se ha podido usar el micrófono. Revisa los permisos.'); }
}

/* ---------- Tests: construcción ---------- */
function topicTask(g){
  return { id:'topic-'+g.id, section:'grammar', title:g.title, instructions:'Elige o escribe la respuesta correcta.',
    questions:g.test.map((q,i)=>({ n:i+1, stem:q.q, kind:q.o?'mcq':'text', options:q.o?shuffle([...q.o]):undefined, answer:q.o?q.a:undefined, answers:q.o?undefined:(Array.isArray(q.a)?q.a:[q.a]), exp:q.e })) };
}
function irrTask(){
  const all=window.LEXI_IRREGULAR||[];
  const weighted=shuffle([...all]).sort((a,b)=>(S.irr[b.b]||0)-(S.irr[a.b]||0));
  const pick=shuffle([...weighted.slice(0,4), ...shuffle(weighted.slice(4)).slice(0,6)]);
  const qs=[]; let n=1;
  for(const v of pick){
    qs.push({ n:n++, stem:`${v.b} (${v.es}) → past simple`, kind:'text', answers:v.p.split('/'), verb:v.b });
    qs.push({ n:n++, stem:`${v.b} → past participle`, kind:'text', answers:v.pp.split('/'), verb:v.b });
  }
  return { id:'irr-'+Date.now(), section:'grammar', title:'Verbos irregulares', instructions:'Escribe el pasado y el participio.', questions:qs };
}
function phrTask(){
  const all=[...PHRASAL.values()].filter(p=>(p.ex||[]).some(e=>(e.match(/\*/g)||[]).length===2));
  const weighted=shuffle([...all]).sort((a,b)=>(S.phr[b.v]||0)-(S.phr[a.v]||0));
  const pick=shuffle([...weighted.slice(0,3), ...shuffle(weighted.slice(3)).slice(0,7)]);
  return { id:'phr-'+Date.now(), section:'grammar', title:'Phrasal verbs en contexto', instructions:'Completa la frase con el phrasal verb en la forma correcta, o elige qué significa en esa frase.',
    questions:pick.map((p,i)=>{
      const exs=shuffle((p.ex||[]).filter(e=>(e.match(/\*/g)||[]).length===2)); const ex=exs[0]; const ans=ex.match(/\*([^*]+)\*/)[1];
      const other=(p.ex||[]).find(e=>e!==ex); const exp=`${p.v} = ${p.es}${other?'. Otro ejemplo: '+other.replace(/\*/g,''):''}`;
      if(i%2===0) return { n:i+1, stem:`${ex.replace(/\*([^*]+)\*/,'___')}\n(${p.v}: ${p.es})`, kind:'text', answers:[ans], exp, phr:p.v };
      const opts=shuffle([p.es, ...shuffle(all.filter(x=>x.v!==p.v && x.es!==p.es)).slice(0,3).map(x=>x.es)]);
      return { n:i+1, stem:`${ex.replace(/\*([^*]+)\*/, (m,x)=>x.toUpperCase())}\n¿Qué significa aquí "${ans}"?`, kind:'mcq', options:opts, answer:p.es, exp, phr:p.v };
    }) };
}
function startRun(opts){
  if(S.run && !confirm('Tienes otro test a medias. ¿Descartarlo y empezar este?')) return;
  S.run=Object.assign({ id:'t'+Date.now().toString(36), mode:'practice', ti:0, answers:{}, checked:{}, plays:{}, started:Date.now() }, opts);
  if(S.run.mode==='exam' && S.run.minutes) S.run.deadline=Date.now()+S.run.minutes*60000;
  save(); go('run');
}
function startTopic(id){ const g=GRAMMAR.get(id); if(g) startRun({ kind:'topic', ref:id, title:'Test: '+g.title, tasks:[topicTask(g)] }); }
function startPart(section, part){
  const cands=[...TASKS.values()].filter(t=>t.section===section && t.part===part);
  if(!cands.length){ toast('Todavía no hay tareas de esta parte. Pídeselas a Claude en un pack.'); return; }
  const tries=id=>S.tests.filter(t=>t.kind==='part' && (t.tasks||[]).includes(id)).length;
  cands.sort((a,b)=>tries(a.id)-tries(b.id));
  const t=cands[0]; startRun({ kind:'part', ref:section+':'+part, title:`${SECTIONS[section]} Part ${part}`, tasks:[t.id] });
}
function startPaper(id){
  const p=PAPERS.get(id); if(!p) return;
  const tasks=[...TASKS.values()].filter(t=>t.paper===id).sort((a,b)=>a.part-b.part).map(t=>t.id);
  if(!tasks.length){ toast('Este simulacro no tiene tareas.'); return; }
  startRun({ kind:'mock', ref:id, title:p.title, tasks, mode:'exam', minutes:p.minutes, section:p.section });
}
const TT = x => typeof x==='string' ? TASKS.get(x) : x;

/* ---------- Tests: corrección ---------- */
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
function scaleLabel(sc){ return sc>=160?'Grade A (nivel B2)':sc>=153?'Grade B (B1)':sc>=140?'Grade C (B1)':sc>=120?'Nivel A2':'Por debajo de A2'; }
function finishRun(auto){
  const run=S.run; if(!run) return;
  const tasks=run.tasks.map(TT).filter(Boolean);
  const detail=[], parts=[]; let score=0, max=0;
  for(const t of tasks){
    let ts=0;
    for(const q of t.questions){ const v=run.answers[t.id+':'+q.n]; const r=gradeQ(q,v); if(r==='ok'){ ts++; }
      detail.push({ task:t.id, part:t.part||null, n:q.n, stem:(q.stem||'').slice(0,160), given:v==null?'':String(v), correct:correctOf(q), r });
      if(q.verb){ S.irr[q.verb]=Math.max(0,(S.irr[q.verb]||0)+(r==='ok'?-1:2)); }
      if(q.phr){ S.phr[q.phr]=Math.max(0,(S.phr[q.phr]||0)+(r==='ok'?-1:2)); } }
    score+=ts; max+=t.questions.length; parts.push({ task:t.id, part:t.part||null, title:t.title, score:ts, max:t.questions.length });
  }
  const section=run.section || tasks[0]?.section;
  const rec={ id:run.id, kind:run.kind, ref:run.ref, title:run.title, mode:run.mode, section, at:Date.now(), durationSec:Math.round((Date.now()-run.started)/1000),
    score, max, parts, detail, tasks:run.tasks.map(x=>typeof x==='string'?x:x.id), auto:!!auto };
  if(run.kind==='mock' && SCALES[section] && max===(section==='reading'?32:25)) rec.scale=scaleScore(section, score);
  S.tests.push(rec); const d=today(); d.t=(d.t||0)+1;
  S.run=null; exportCache=null; resultId=rec.id; save(); stopSpeech();
  if(auto) toast('Se ha acabado el tiempo. Examen entregado.');
  go('result');
}

/* ---------- Tests: pantallas ---------- */
function renderTests(){
  const gl=[...GRAMMAR.values()];
  const partBtn=(sec,p)=>{ const n=[...TASKS.values()].filter(t=>t.section===sec&&t.part===p).length;
    const done=S.tests.filter(t=>t.ref===sec+':'+p); const last=done[done.length-1];
    return `<button class="partbtn" data-part="${sec}:${p}" ${n?'':'disabled'}><b>Part ${p}</b><span>${last?Math.round(last.score/last.max*100)+'%':n+(n===1?' tarea':' tareas')}</span></button>`; };
  const papers=[...PAPERS.values()];
  const hist=S.tests.slice(-12).reverse();
  return `${header()}<h1>Tests</h1>
    ${S.run?`<div class="panel note"><b>${esc(S.run.title)}</b> a medias.<div class="gap"></div><button class="btn block" data-go="run">Continuar</button></div>`:''}
    <h2>Simulacros</h2><p class="small muted">Con cronómetro y sin ver las soluciones hasta el final, como en el examen.</p>
    <ul class="list">${papers.map(p=>{ const b=S.tests.filter(t=>t.ref===p.id); const best=b.length?Math.max(...b.map(t=>t.score)):null;
      return `<li><button class="rowbtn" data-paper="${esc(p.id)}"><span>${esc(p.title)}<br><span class="small muted">${p.minutes} min, ${p.max} preguntas</span></span><span>${best===null?'›':`<span class="pct">${best}/${p.max}</span>`}</span></button></li>`; }).join('')}
      <li><button class="rowbtn" data-act="wmock"><span>Writing PET completo<br><span class="small muted">45 min: email + artículo o historia (lo corrige Claude)</span></span><span>›</span></button></li>
      <li><button class="rowbtn" data-go="speak"><span>Speaking<br><span class="small muted">Preguntas, fotos y discusión con cronómetro</span></span><span>›</span></button></li></ul>
    <h2>Práctica por partes</h2><p class="small muted">Sin tiempo y con corrección al terminar cada parte.</p>
    ${Object.keys(SECTIONS).map(sec=>`<h3 class="sub">${SECTIONS[sec]}</h3><div class="parts">${Array.from({length:PARTS[sec]},(_,i)=>partBtn(sec,i+1)).join('')}</div>`).join('')}
    <h2>Test por temas</h2>
    <ul class="list">${gl.map(g=>`<li><button class="rowbtn" data-topic="${esc(g.id)}"><span>${esc(g.title)}</span>${badge(bestOf('topic',g.id))||'<span>›</span>'}</button></li>`).join('')}
      <li><button class="rowbtn" data-act="irrtest"><span>Verbos irregulares</span>${badge(bestOf('irregular','irregular'))||'<span>›</span>'}</button></li>
      <li><button class="rowbtn" data-act="phrtest"><span>Phrasal verbs</span>${badge(bestOf('phrasal','phrasal'))||'<span>›</span>'}</button></li></ul>
    ${hist.length?`<h2>Historial</h2><ul class="list">${hist.map(t=>`<li><button class="rowbtn" data-result="${esc(t.id)}"><span>${esc(t.title)}<br><span class="small muted">${fmtDate(t.at)}</span></span><span class="pct">${t.score}/${t.max}</span></button></li>`).join('')}</ul>`:''}`;
}
function passageHTML(text, t, reveal, ans){
  return fmtText(text).replace(/\[(\d+)\]/g, (m,n)=>{
    const q=t.questions.find(q=>String(q.n)===n);
    if(reveal && q){ const r=gradeQ(q, ans[t.id+':'+q.n]); return `<span class="gapn ${r}">${n}<em>${esc(correctOf(q))}</em></span>`; }
    const v=q && ans[t.id+':'+q.n]; return `<span class="gapn${v?' filled':''}">${n}${v?`<em>${esc(v)}</em>`:''}</span>`;
  });
}
function qHTML(t, q, run, reveal){
  const k=t.id+':'+q.n, v=run.answers[k], r=reveal?gradeQ(q,v):null;
  let input='';
  if(q.kind==='mcq') input=`<div class="opts">${q.options.map((o,i)=>{ let c=v===o?'sel':''; if(reveal){ c=o===q.answer?'ok':(v===o?'bad':''); }
      return `<button class="opt sm ${c}" data-q="${esc(k)}" data-v="${esc(o)}" ${reveal?'disabled':''}><span class="ol">${'ABCD'[i]}</span>${esc(o)}</button>`; }).join('')}</div>`;
  else if(q.kind==='select') input=`<div class="letters">${q.options.map(o=>{ let c=v===o?'sel':''; if(reveal){ c=o===q.answer?'ok':(v===o?'bad':''); }
      return `<button class="lt ${c}" data-q="${esc(k)}" data-v="${esc(o)}" ${reveal?'disabled':''}>${esc(o)}</button>`; }).join('')}</div>`;
  else input=`<input class="field qin ${r||''}" data-q="${esc(k)}" value="${esc(v||'')}" ${reveal?'disabled':''} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Tu respuesta">`
      + (reveal && r!=='ok' ? `<div class="small" style="margin-top:4px">${r==='near'?'Casi (la ortografía cuenta). ':''}Respuesta: <b>${esc((q.answers||[]).join(' / '))}</b></div>` : '');
  const audio=q.audio?audioCtl(run, t.id+':'+q.n, q.audio, reveal):'';
  return `<div class="q ${r||''}"><div class="qn">${q.n}</div><div class="qb">${q.stem?`<div class="qstem">${fmtText(q.stem)}</div>`:''}${audio}${input}${reveal&&q.exp?`<div class="small muted" style="margin-top:6px">${esc(q.exp)}</div>`:''}</div></div>`;
}
function audioCtl(run, key, lines, reveal){
  const used=run.plays[key]||0, limit=run.mode==='exam'&&!reveal?2:Infinity, left=limit-used;
  return `<div class="audio"><button class="btn ${left>0?'primary':''}" data-play="${esc(key)}" ${left>0?'':'disabled'}>▶ Escuchar</button>
    <button class="btn ghost" data-act="stopaudio">■</button>${limit!==Infinity?`<span class="small muted">${left>0?`Te quedan ${left}`:'Sin escuchas'}</span>`:''}
    ${reveal?`<details><summary class="small">Ver transcripción</summary><div class="small transcript">${lines.map(([w,x])=>`<p><b>${w==='B'?'—':'–'}</b> ${esc(x)}</p>`).join('')}</div></details>`:''}</div>`;
}
function renderRun(){
  const run=S.run; if(!run) return renderTests();
  const tasks=run.tasks.map(TT).filter(Boolean); if(!tasks.length){ S.run=null; save(); return renderTests(); }
  run.ti=Math.min(run.ti, tasks.length-1);
  const t=tasks[run.ti], reveal=run.mode==='practice' && !!run.checked[run.ti];
  const answered=t.questions.filter(q=>run.answers[t.id+':'+q.n]).length;
  const last=run.ti===tasks.length-1;
  const nav= run.mode==='exam'
    ? `<div class="row spread"><button class="btn" data-act="prevtask" ${run.ti?'':'disabled'}>Anterior</button>${last?`<button class="btn primary" data-act="finishrun">Entregar examen</button>`:`<button class="btn primary" data-act="nexttask">Siguiente parte</button>`}</div>`
    : (reveal ? `<div class="fb ${scoreTask(t,run.answers)===t.questions.length?'ok':'near'}"><h3>${scoreTask(t,run.answers)} de ${t.questions.length} correctas</h3></div>${last?`<button class="btn primary big block" data-act="finishrun">Ver resultado</button>`:`<button class="btn primary big block" data-act="nexttask">Siguiente</button>`}`
      : `<button class="btn primary big block" data-act="checktask">Corregir</button>`);
  return `<div class="sess-top"><button class="icon-btn" data-act="quitrun" aria-label="Salir">✕</button><div style="flex:1"><b class="small">${esc(run.title)}</b>
      ${tasks.length>1?`<div class="bar" style="margin-top:4px"><div style="width:${Math.round((run.ti)/tasks.length*100)}%"></div></div>`:''}</div>
      ${run.deadline?`<span class="timer" data-deadline="${run.deadline}" data-kind="run">${mmss(run.deadline-Date.now())}</span>`:''}</div>
    <div class="kind"><span>${esc(t.title||'')}${tasks.length>1?` (${run.ti+1}/${tasks.length})`:''}</span><span class="small muted">${answered}/${t.questions.length}</span></div>
    ${t.instructions?`<p class="instr">${esc(t.instructions)}</p>`:''}
    ${t.audio?audioCtl(run, t.id, t.audio, reveal || (run.mode==='exam'&&false)):''}
    ${t.passage?`<div class="passage">${passageHTML(t.passage, t, reveal, run.answers)}</div>`:''}
    ${t.blocks?`<div class="blocks">${t.blocks.map(b=>`<div class="block"><span class="bl">${esc(b.label)}</span><div><b>${esc(b.title||'')}</b><div class="small">${esc(b.text)}</div></div></div>`).join('')}</div>`:''}
    ${t.choices?`<div class="blocks">${t.choices.map(c=>{ const used=Object.entries(run.answers).some(([k,v])=>k.startsWith(t.id+':')&&v===c.label); return `<div class="block ${used?'used':''}"><span class="bl">${esc(c.label)}</span><div class="small">${esc(c.text)}</div></div>`; }).join('')}</div>`:''}
    <div class="qs">${t.questions.map(q=>qHTML(t,q,run,reveal)).join('')}</div>
    ${nav}`;
}
function renderResult(){
  const r=S.tests.find(x=>x.id===resultId); if(!r) return renderTests();
  const pct=Math.round(r.score/r.max*100);
  const bad=r.detail.filter(d=>d.r!=='ok');
  const redo = r.kind==='topic' ? `data-topic="${esc(r.ref)}"` : r.kind==='mock' ? `data-paper="${esc(r.ref)}"` : r.kind==='part' ? `data-part="${esc(r.ref)}"` : r.kind==='irregular' ? 'data-act="irrtest"' : 'data-act="phrtest"';
  return `${backBar('Resultado','tests')}
    <h1>${r.score} de ${r.max} <span class="muted" style="font-size:22px">(${pct}%)</span></h1>
    <p class="muted">${esc(r.title)}, ${fmtDate(r.at)}, ${mmss(r.durationSec*1000)} min.</p>
    ${r.scale?`<div class="panel note"><h3>≈ ${r.scale} en la Cambridge English Scale</h3><p class="small" style="margin:0">${scaleLabel(r.scale)}. Estimación aproximada: la conversión oficial varía un poco en cada convocatoria.</p></div>`:''}
    ${r.parts.length>1?`<div class="panel"><h3>Por partes</h3><ul class="list">${r.parts.map(p=>`<li><div class="row spread"><span>${esc(p.title||'Part '+p.part)}</span><span class="small muted">${p.score}/${p.max}</span></div><div class="meter"><div style="width:${p.score/p.max*100}%"></div></div></li>`).join('')}</ul></div>`:''}
    ${bad.length?`<h2>Tus fallos</h2><ul class="list">${bad.map(d=>`<li><div class="small muted">Pregunta ${d.n}${d.part?`, Part ${d.part}`:''}</div>${d.stem?`<div class="small">${esc(d.stem)}</div>`:''}<div>Tu respuesta: <b class="bad-t">${esc(d.given)||'(en blanco)'}</b></div><div>Correcta: <b class="ok-t">${esc(d.correct)}</b></div></li>`).join('')}</ul>`:'<p>¡Todo correcto!</p>'}
    <div class="actions"><button class="btn primary block" ${redo}>Repetir</button><button class="btn block" data-go="tests">Volver a tests</button></div>`;
}

/* ---------- Escritura ---------- */
function writingPrompts(){ return [...ITEMS.values()].filter(i=>i.type==='writing' && !i.retired); }
function createWriting(promptId, extra){
  const p=ITEMS.get(promptId);
  const w=Object.assign({ id:'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), promptId, title:p?p.title:'', text:'', status:'draft', createdAt:Date.now(), updatedAt:Date.now(), feedback:null }, extra||{});
  S.writings.push(w); return w;
}
function renderWriting(){
  const prompts=writingPrompts();
  const status=w=>w.feedback?'<span class="status fb">Corregido</span>':w.status==='done'?'<span class="status done">Terminado</span>':'<span class="status muted">Borrador</span>';
  const group=(title, list)=> list.length?`<h2>${title}</h2><ul class="list">${list.map(p=>{ const ws=S.writings.filter(w=>w.promptId===p.id); const last=ws[ws.length-1];
    return `<li><div class="row spread"><div><b>${esc(p.title)}</b><div class="small muted">${FORMS[p.form]||''}${p.form?', ':''}${p.words} palabras, ${esc(p.level)}</div></div>${last?status(last):''}</div>
      <div class="row" style="margin-top:8px">${last?`<button class="btn" data-open="${esc(last.id)}">Abrir</button>`:''}<button class="btn ${last?'ghost':''}" data-new="${esc(p.id)}">${last?'Hacer otra vez':'Empezar'}</button></div></li>`; }).join('')}</ul>`:'';
  const mocks=S.writings.filter(w=>w.mock);
  return `${header()}<h1>Escribir</h1><p class="muted">Lo que escribas va en tu exportación. Lo corrijo con los 4 criterios oficiales y la corrección vuelve al importar.</p>
    <button class="btn primary block big" data-act="wmock">${S.wmock?'Continuar simulacro de Writing':'Simulacro de Writing (45 min)'}</button>
    ${group('PET Part 1: email', prompts.filter(p=>p.level==='B1'&&p.form==='email'))}
    ${group('PET Part 2: artículo o historia', prompts.filter(p=>p.level==='B1'&&(p.form==='article'||p.form==='story')))}
    ${group('B2 First', prompts.filter(p=>p.level==='B2'))}
    ${group('Otras', prompts.filter(p=>p.level==='B1'&&!['email','article','story'].includes(p.form)))}
    <h2>Escritura libre</h2><button class="btn block" data-new="free">Escribir sobre lo que quiera</button>
    ${S.writings.filter(w=>w.promptId==='free'||w.mock).length?`<ul class="list" style="margin-top:8px">${S.writings.filter(w=>w.promptId==='free'||w.mock).slice(-15).reverse().map(w=>`<li class="row spread"><button class="btn ghost" data-open="${esc(w.id)}">${w.mock?'Simulacro: ':''}${esc(w.title||'Sin título')}</button>${status(w)}</li>`).join('')}</ul>`:''}`;
}
function renderWrite(){
  const w=S.writings.find(x=>x.id===editing); if(!w) return renderWriting();
  const p=ITEMS.get(w.promptId);
  return `${backBar(p?p.title:'Escritura libre','writing')}
    ${p?`<div class="panel"><pre class="task">${esc(p.task)}</pre></div>`:`<input class="field" id="wtitle" placeholder="Título" value="${esc(w.title)}" style="margin-bottom:10px">`}
    ${feedbackHTML(w)}
    <textarea class="field" data-w="${esc(w.id)}" placeholder="Write here…" autocapitalize="sentences" spellcheck="false" ${w.status==='done'?'readonly':''}>${esc(w.text)}</textarea>
    <div class="row spread" style="margin:8px 0 14px"><span class="small muted" data-wc="${esc(w.id)}">${wc(w.text)} palabras${p?` de ~${p.words}`:''}</span><span class="small muted" data-saved></span></div>
    <div class="actions">${w.status==='done'?`<button class="btn block" data-act="reopen">Seguir editando</button>`:`<button class="btn primary block big" data-act="wdone">Marcar como terminado</button>`}
      <button class="btn ghost danger" data-act="wdel">Borrar este texto</button></div>
    <p class="small muted">Desactiva el corrector del teclado para practicar como en el examen.</p>`;
}
function feedbackHTML(w){
  if(!w.feedback) return '';
  const f=w.feedback;
  return `<div class="panel note"><h3>Corrección${f.score?` (${esc(f.score)})`:''}</h3>
    ${f.bands?`<div class="bands">${Object.entries(f.bands).map(([k,v])=>`<div><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('')}</div>`:''}
    <p style="white-space:pre-wrap">${esc(f.notes||'')}</p>
    ${f.corrected?`<details><summary>Versión corregida</summary><p style="white-space:pre-wrap;margin-top:8px">${esc(f.corrected)}</p></details>`:''}</div>`;
}
function startWMock(){
  if(S.wmock){ go('wmock'); return; }
  const ps=writingPrompts().filter(p=>p.level==='B1');
  const used=id=>S.writings.filter(w=>w.promptId===id).length;
  const pick=list=>shuffle(list).sort((a,b)=>used(a.id)-used(b.id))[0];
  const p1=pick(ps.filter(p=>p.form==='email'&&p.part===1)), art=pick(ps.filter(p=>p.form==='article')), sto=pick(ps.filter(p=>p.form==='story'));
  if(!p1||!art||!sto){ toast('Faltan tareas para montar el simulacro.'); return; }
  const mockId='wm'+Date.now().toString(36);
  const w1=createWriting(p1.id,{ mock:mockId, part:1 });
  S.wmock={ id:mockId, started:Date.now(), deadline:Date.now()+45*60000, w1:w1.id, opts:[art.id, sto.id], w2:null };
  save(); go('wmock');
}
function finishWMock(auto){
  const m=S.wmock; if(!m) return;
  for(const id of [m.w1,m.w2]){ const w=S.writings.find(x=>x.id===id); if(w){ w.status='done'; w.updatedAt=Date.now(); w.minutes=Math.round((Date.now()-m.started)/60000); } }
  S.wmock=null; exportCache=null; save();
  toast(auto?'Tiempo terminado. Tus textos se han guardado para corregir.':'Simulacro entregado. Irá en tu próxima exportación.'); go('writing');
}
function renderWMock(){
  const m=S.wmock; if(!m) return renderWriting();
  const w1=S.writings.find(x=>x.id===m.w1), p1=ITEMS.get(w1?.promptId);
  const w2=m.w2 && S.writings.find(x=>x.id===m.w2), p2=w2 && ITEMS.get(w2.promptId);
  const ta=(w,p)=>`<textarea class="field" data-w="${esc(w.id)}" placeholder="Write here…" spellcheck="false">${esc(w.text)}</textarea><div class="small muted" data-wc="${esc(w.id)}" style="margin:6px 0 16px">${wc(w.text)} palabras de ~${p.words}</div>`;
  return `<div class="sess-top"><button class="icon-btn" data-go="writing" aria-label="Salir (se guarda)">←</button><b style="flex:1">Simulacro de Writing</b><span class="timer" data-deadline="${m.deadline}" data-kind="wmock">${mmss(m.deadline-Date.now())}</span></div>
    <p class="small muted">Tienes 45 minutos para las dos partes. Se guarda solo. Puedes salir y volver.</p>
    <h2>Part 1 (obligatoria)</h2><div class="panel"><pre class="task">${esc(p1.task)}</pre></div>${ta(w1,p1)}
    <h2>Part 2 (elige una)</h2>
    ${w2?`<div class="panel"><pre class="task">${esc(p2.task)}</pre></div>${ta(w2,p2)}`:
      m.opts.map(id=>{ const p=ITEMS.get(id); return `<div class="panel"><b>${FORMS[p.form]}</b><pre class="task">${esc(p.task)}</pre><button class="btn block" data-wchoose="${esc(id)}">Elegir ${FORMS[p.form].toLowerCase()}</button></div>`; }).join('')}
    <button class="btn primary big block" data-act="wmockdone" style="margin-top:10px">Entregar</button>`;
}

/* ---------- Progreso ---------- */
function renderProgress(){
  const c=counts(), now=Date.now();
  const last=[]; for(let k=13;k>=0;k--){ const key=dayKey(now-k*DAY); last.push({ key, d:S.daily[key]||{n:0,ok:0,t:0} }); }
  const max=Math.max(5,...last.map(x=>x.d.n+(x.d.t||0)*5));
  const week=S.attempts.filter(a=>a.t>now-7*DAY);
  const acc=week.length?Math.round(week.filter(a=>a.r!=='bad').length/week.length*100):null;
  const by=(keyFn,labels)=>{ const m={}; for(const a of S.attempts){ const it=ITEMS.get(a.id); if(!it) continue; const k=keyFn(it); (m[k]||(m[k]={n:0,ok:0})); m[k].n++; if(a.r!=='bad') m[k].ok++; }
    return Object.entries(m).sort((x,y)=>(x[1].ok/x[1].n)-(y[1].ok/y[1].n)).map(([k,v])=>`<li><div class="row spread"><span>${esc(labels[k]||k)}</span><span class="small muted">${Math.round(v.ok/v.n*100)}% de ${v.n}</span></div><div class="meter"><div style="width:${v.ok/v.n*100}%"></div></div></li>`).join(''); };
  const hard=Object.entries(S.srs).filter(([,s])=>s.l>0).sort((a,b)=>b[1].l-a[1].l).slice(0,10).map(([id,s])=>({it:ITEMS.get(id),s})).filter(x=>x.it);
  const mocks=S.tests.filter(t=>t.kind==='mock');
  const grammar=[...GRAMMAR.values()].map(g=>({ g, p:bestOf('topic',g.id) })).filter(x=>x.p!==null).sort((a,b)=>a.p-b.p);
  return `${backBar('Progreso','home')}
    <div class="stats"><div class="stat"><b>${c.learned}</b><span>palabras aprendidas</span></div><div class="stat"><b>${c.mastered}</b><span>dominadas</span></div><div class="stat"><b>${acc===null?'–':acc+'%'}</b><span>aciertos vocabulario, 7 días</span></div></div>
    <div class="panel"><h3>Actividad, últimos 14 días</h3>
      <div class="bars">${last.map(x=>{ const tot=x.d.n+(x.d.t||0)*5; return tot?`<div class="col" title="${x.key}"><div class="badp" style="height:${(x.d.n-x.d.ok)/max*100}%"></div><div class="okp" style="height:${(x.d.ok+(x.d.t||0)*5)/max*100}%"></div></div>`:`<div class="col"><div class="empty"></div></div>`; }).join('')}</div></div>
    ${mocks.length?`<h2>Simulacros</h2><ul class="list">${mocks.slice(-10).reverse().map(t=>`<li><button class="rowbtn" data-result="${esc(t.id)}"><span>${esc(t.title)}<br><span class="small muted">${fmtDate(t.at)}${t.scale?`, ≈ ${t.scale} (${scaleLabel(t.scale)})`:''}</span></span><span class="pct">${t.score}/${t.max}</span></button></li>`).join('')}</ul>`:''}
    ${grammar.length?`<h2>Gramática (mejor nota)</h2><ul class="list">${grammar.map(x=>`<li><div class="row spread"><span>${esc(x.g.title)}</span>${badge(x.p)}</div><div class="meter"><div style="width:${x.p}%"></div></div></li>`).join('')}</ul>`:''}
    ${S.attempts.length?`<h2>Vocabulario por tipo</h2><ul class="list">${by(i=>i.cat, CATS)}</ul><h2>Vocabulario por tema</h2><ul class="list">${by(i=>i.topic, TOPICS)}</ul>`:''}
    ${hard.length?`<h2>Palabras que más te cuestan</h2><ul class="list">${hard.map(x=>`<li class="row spread"><b>${esc(x.it.word||correctText(x.it))}</b><span class="small muted">${x.s.l} ${x.s.l===1?'fallo':'fallos'}</span></li>`).join('')}</ul>`:''}`;
}

/* ---------- Exportar ---------- */
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
    return { id:w.id, promptId:w.promptId, form:p?.form||null, level:p?.level||null, title:p?p.title:w.title, task:p?p.task:null, targetWords:p?p.words:null, status:w.status, timedMock:!!w.mock, minutes:w.minutes||null, words:wc(w.text), text:w.text, updatedAt:iso(w.updatedAt), alreadyCorrected:!!w.feedback }; });
  return { format:'lexi-export', version:2, app:APP_VERSION, kind:full?'full':'delta', exportedAt:iso(now), period:{ from:since?iso(since):null, to:iso(now) },
    profile:{ currentLevel:'B1', targetExam:'Cambridge B1 Preliminary (PET)', nextGoal:'B2 First', settings:S.settings },
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

/* ---------- Importar: validación con motivos ---------- */
const TASK_SECTIONS=['reading','listening','uoe','grammar'];
function whyItem(it){
  if(!it || typeof it!=='object') return 'no es un objeto';
  if(typeof it.id!=='string' || !it.id) return 'falta "id"';
  if(!TYPES.includes(it.type)) return `"type" debe ser uno de: ${TYPES.join(', ')}`;
  if(['mcq','gap','wordform'].includes(it.type) && typeof it.prompt!=='string') return 'falta "prompt"';
  if(['mcq','gap','wordform'].includes(it.type) && !it.prompt.includes('___')) return 'el "prompt" no tiene hueco ___';
  if(it.type==='mcq' && !(Array.isArray(it.options) && it.options.includes(it.answer))) return '"answer" no está entre las "options"';
  if(['gap','wordform','translate'].includes(it.type) && !(Array.isArray(it.answers) && it.answers.length)) return 'falta "answers" (lista)';
  if(it.type==='translate' && typeof it.es!=='string') return 'falta "es"';
  if(it.type==='dictation' && typeof it.text!=='string') return 'falta "text"';
  if(it.type==='writing' && typeof it.task!=='string') return 'falta "task"';
  return null;
}
function whyTask(t){
  if(!t || typeof t.id!=='string') return 'falta "id"';
  if(!TASK_SECTIONS.includes(t.section)) return `"section" debe ser ${TASK_SECTIONS.join(', ')}`;
  if(!Array.isArray(t.questions) || !t.questions.length) return 'no tiene "questions"';
  for(const q of t.questions){
    if(q==null || q.n==null) return 'una pregunta no tiene "n"';
    if(!['mcq','select','text'].includes(q.kind)) return `pregunta ${q.n}: "kind" debe ser mcq, select o text`;
    if(q.kind==='text' && !(Array.isArray(q.answers)&&q.answers.length)) return `pregunta ${q.n}: falta "answers"`;
    if(q.kind!=='text' && !(Array.isArray(q.options)&&q.options.includes(q.answer))) return `pregunta ${q.n}: "answer" no está en "options"`;
  }
  if(t.passage){ const nums=new Set(t.questions.map(q=>String(q.n))); for(const m of t.passage.matchAll(/\[(\d+)\]/g)) if(!nums.has(m[1])) return `el texto marca [${m[1]}] pero no hay pregunta ${m[1]}`; }
  return null;
}
function whyTopic(g){
  if(!g || typeof g.id!=='string') return 'falta "id"';
  if(typeof g.title!=='string' || typeof g.html!=='string') return 'faltan "title" o "html"';
  if(!Array.isArray(g.test)) return 'falta "test" (puede ser [])';
  for(const [i,q] of g.test.entries()){ if(!q.q || q.a==null) return `pregunta ${i+1}: faltan "q" o "a"`; if(q.o && !q.o.includes(q.a)) return `pregunta ${i+1}: "a" no está en "o"`; }
  return null;
}
function whyPage(p){ if(!p || typeof p.id!=='string') return 'falta "id"'; if(typeof p.title!=='string' || typeof p.html!=='string') return 'faltan "title" o "html"'; return null; }
function whyPaper(p){ if(!p || typeof p.id!=='string' || typeof p.title!=='string') return 'faltan "id" o "title"'; if(!p.minutes || !p.max) return 'faltan "minutes" o "max"'; return null; }
function whyPhrasal(p){
  if(!p || typeof p.v!=='string' || !p.v) return 'falta "v" (el phrasal verb)';
  if(typeof p.es!=='string') return 'falta "es" (significado)';
  if(!Array.isArray(p.ex) || !p.ex.length) return 'falta "ex" (lista de ejemplos)';
  if(!p.ex.some(e=>(String(e).match(/\*/g)||[]).length>=2)) return 'ningún ejemplo marca el verbo con *asteriscos*';
  return null;
}
const WHY={ items:whyItem, tasks:whyTask, grammar:whyTopic, pages:whyPage, papers:whyPaper, phrasal:whyPhrasal };
function existsIn(k,key){ return ({ items:ITEMS, tasks:TASKS, papers:PAPERS, pages:PAGES, grammar:GRAMMAR, phrasal:PHRASAL })[k].has(key); }

function parseImport(text){
  let t=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
  const i=t.search(/[\[{]/); if(i<0) throw new Error('No encuentro ningún JSON en el texto.');
  t=t.slice(i); const last=Math.max(t.lastIndexOf('}'), t.lastIndexOf(']')); if(last<1) throw new Error('El JSON está incompleto: parece que no se ha copiado entero.'); t=t.slice(0,last+1);
  let data;
  try{ data=JSON.parse(t); }
  catch(e){ // varios objetos seguidos: {..}{..}
    try{ data=JSON.parse('['+t.replace(/}\s*{/g,'},{')+']'); }catch(_){ throw new Error('El JSON no es válido. Suele pasar si no se ha copiado entero (revisa el final).'); } }
  const list=Array.isArray(data) ? data : [data];
  if(!list.length) throw new Error('El JSON está vacío.');
  return list;
}
function analyzeImport(list){
  const rep={ entries:[], ok:true };
  for(const d of list){
    if(!d || typeof d!=='object'){ rep.entries.push({ kind:'error', msg:'Elemento que no es un objeto.' }); continue; }
    if(d.format==='lexi-backup'){ rep.entries.push({ kind:'backup', data:d, when:d.savedAt }); continue; }
    if(d.format!=='lexi-pack'){ rep.entries.push({ kind:'error', msg:`Formato desconocido${d.format?` ("${d.format}")`:''}. Debe llevar "format": "lexi-pack".` }); continue; }
    const P=d.pack||{}, e={ kind:'pack', data:d, id:P.id||null, name:P.name||P.id||'Pack sin nombre', mode:P.mode==='merge'?'merge':'replace', counts:{}, errors:[], clean:{} };
    e.existing=!!(P.id && S.packs.find(p=>p.id===P.id));
    for(const k of PACK_KEYS){
      const arr=P[k]; if(arr==null) continue;
      if(!Array.isArray(arr)){ e.errors.push(`"${k}" debería ser una lista`); continue; }
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
    if(e.kind==='backup'){ S=Object.assign(defaultState(), e.data.state); out.push('copia de seguridad restaurada'); continue; }
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
      out.push(`"${e.name}" ${prev?(e.mode==='merge'?'actualizado (fusión)':'actualizado'):'instalado'}`);
    }
    if(Array.isArray(d.feedback)){ for(const f of d.feedback){ const w=S.writings.find(x=>x.id===f.writingId); if(w) w.feedback={ score:f.score||'', bands:f.bands||null, notes:f.notes||'', corrected:f.corrected||'', at:Date.now() }; } if(e.feedback?.ok) out.push(`${e.feedback.ok} correcciones`); }
    if(Array.isArray(d.review)) for(const id of d.review){ if(S.srs[id]) S.srs[id].due=Date.now(); }
    if(Array.isArray(d.retire)) for(const p of S.packs) for(const k of PACK_KEYS) if(p[k]) p[k]=p[k].filter(x=>!d.retire.includes(keyOf(k,x)));
    if(Array.isArray(d.convertedNotes)) for(const c of d.convertedNotes){ const nid=typeof c==='string'?c:c.noteId; const n=S.rawNotes.find(x=>x.id===nid); if(n){ n.status='converted'; n.pageIds=c.pageIds||[]; } }
    if(d.message) S.messages.push({ at:Date.now(), text:String(d.message), read:false });
  }
  rebuild(); exportCache=null; pendingImport=null; save();
  return out.length ? 'Hecho: '+out.join('; ')+'.' : 'Aplicado.';
}
function importPreviewHTML(rep){
  const label=(k,c)=>`${PACK_LABEL[k]}: ${c.nw?`${c.nw} nuevos`:''}${c.nw&&c.up?', ':''}${c.up?`${c.up} actualizados`:''}${c.bad?`${c.nw||c.up?', ':''}<span class="bad-t">${c.bad} con errores</span>`:''}`;
  return `<div class="panel note preview"><h3>Revisa antes de aplicar</h3>
    ${rep.entries.map(e=>{
      if(e.kind==='error') return `<p class="bad-t">${esc(e.msg)}</p>`;
      if(e.kind==='backup') return `<p><b>Copia de seguridad</b>${e.when?` del ${esc(fmtDate(Date.parse(e.when)))}`:''}. <span class="bad-t">Sustituirá todos tus datos actuales.</span></p>`;
      return `<div class="pv-entry"><b>${esc(e.name)}</b> <span class="chip">${e.existing?(e.mode==='merge'?'se fusiona con el que tienes':'sustituye al que tienes'):'nuevo'}</span>
        <ul class="small">${Object.entries(e.counts).map(([k,c])=>`<li>${label(k,c)}</li>`).join('')}
        ${e.feedback?`<li>Correcciones de writing: ${e.feedback.ok}${e.feedback.missing?` (${e.feedback.missing} de textos que no están en este móvil)`:''}</li>`:''}
        ${e.review!=null?`<li>Palabras para repasar ya: ${e.review}</li>`:''}${e.retire?`<li>Elementos a retirar: ${e.retire}</li>`:''}
        ${e.converted?`<li>Apuntes marcados como convertidos: ${e.converted}</li>`:''}${e.message?'<li>Incluye una nota para ti</li>':''}</ul>
        ${e.errors.length?`<details><summary class="small bad-t">${e.errors.length} ${e.errors.length===1?'elemento no se cargará':'elementos no se cargarán'}: ver por qué</summary><ul class="small">${e.errors.slice(0,30).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="small muted">Pásale esta lista a Claude para que lo corrija.</p></details>`:''}</div>`;
    }).join('')}
    <div class="row" style="margin-top:12px">${rep.ok?`<button class="btn primary" data-act="applyimport">Aplicar</button>`:''}<button class="btn" data-act="cancelimport">Cancelar</button></div></div>`;
}
function reviewImport(text){
  try{ pendingImport=analyzeImport(parseImport(text)); }
  catch(e){ pendingImport=null; toast(e.message); return; }
  render(); setTimeout(()=>document.querySelector('.preview')?.scrollIntoView({ behavior:'smooth', block:'start' }), 50);
}
function packCounts(p){ return PACK_KEYS.filter(k=>(p[k]||[]).length).map(k=>`${p[k].length} ${PACK_LABEL[k]}`).join(', ') || 'vacío'; }
function packContents(p){
  const name=(k,x)=>k==='phrasal'?x.v:(x.title||x.word||x.prompt||x.es||x.id);
  return PACK_KEYS.filter(k=>(p[k]||[]).length).map(k=>`<p class="small"><b>${PACK_LABEL[k]}</b></p><ul class="small">${p[k].slice(0,40).map(x=>`<li>${esc(String(name(k,x)).slice(0,90))}</li>`).join('')}${p[k].length>40?`<li>…y ${p[k].length-40} más</li>`:''}</ul>`).join('');
}

/* ---------- Datos ---------- */
function renderData(){
  const delta=getExport(false), n=delta.attempts.length, t=delta.tests.length, w=delta.writings.length, nn=delta.notes.length, any=n||t||w||nn;
  const seg=(key,vals)=>`<div class="seg" role="group">${vals.map(v=>`<button data-set="${key}" data-val="${v}" aria-pressed="${S.settings[key]===v}">${v}</button>`).join('')}</div>`;
  return `${header()}<h1>Datos</h1>
    <h2 style="margin-top:8px">Enviar a Claude</h2>
    <div class="panel stack"><p style="margin:0">${any?`Desde ${S.lastExportAt?'el último envío ('+fmtDate(S.lastExportAt)+')':'el principio'}: <b>${n}</b> ejercicios, <b>${t}</b> tests, <b>${w}</b> textos y <b>${nn}</b> apuntes.`:'No hay novedades desde el último envío.'}</p>
      <button class="btn primary block" data-act="copydelta" ${any?'':'disabled'}>Copiar novedades</button>
      <button class="btn block" data-act="sharedelta" ${any?'':'disabled'}>Guardar como archivo</button>
      <p class="small muted" style="margin:0">Pégalo en el chat del proyecto. Al copiarlo, el contador se reinicia.</p>
      <button class="btn ghost block" data-go="templates">Plantillas de apuntes</button></div>
    <details class="panel"><summary>Exportar todo el historial</summary><p class="small muted" style="margin:10px 0">Para un análisis completo. No reinicia el contador.</p><button class="btn block" data-act="copyfull">Copiar historial completo</button></details>
    <h2>Recibir de Claude</h2>
    <div class="panel stack"><textarea class="field" id="imp" placeholder="Pega aquí el JSON que te dé Claude (puede ser uno o varios packs)" style="min-height:120px;font-size:14px"></textarea>
      <button class="btn primary block" data-act="import">Revisar</button>
      <label class="btn block">Cargar archivos .json<input type="file" id="impfile" accept="application/json,.json,.txt" multiple hidden></label></div>
    ${pendingImport?importPreviewHTML(pendingImport):''}
    <h2>Contenido instalado</h2>
    ${S.packs.length?`<ul class="list">${S.packs.map(p=>`<li><div class="row spread"><div><b>${esc(p.name)}</b><div class="small muted">${packCounts(p)}</div><div class="small muted">${p.updatedFrom?'Actualizado':'Instalado'} ${fmtDate(p.importedAt)}</div></div>
        <button class="switch" role="switch" aria-checked="${!p.off}" data-packtoggle="${esc(p.id)}" aria-label="Activar o desactivar"><span></span></button></div>
        <div class="row" style="margin-top:6px"><button class="btn ghost" data-packview="${esc(p.id)}">${openPack===p.id?'Ocultar':'Ver contenido'}</button><button class="btn ghost" data-packcopy="${esc(p.id)}">Copiar JSON</button><button class="btn ghost danger" data-packdel="${esc(p.id)}">Borrar</button></div>
        ${openPack===p.id?`<div class="packbox">${packContents(p)}</div>`:''}</li>`).join('')}</ul>`:'<p class="small muted">Todavía no has cargado ningún pack.</p>'}
    <h2>Ajustes</h2>
    <div class="panel stack"><div><b>Ejercicios por sesión de vocabulario</b></div>${seg('sessionSize',[5,10,15,20])}<div style="margin-top:14px"><b>Palabras nuevas al día</b></div>${seg('newPerDay',[5,8,12,20])}</div>
    <h2>Copia de seguridad</h2>
    <div class="panel stack"><p class="small muted" style="margin:0">Tus datos solo están en este móvil. Guarda una copia de vez en cuando.</p>
      <button class="btn block" data-act="backup">Descargar copia de seguridad</button>
      <label class="btn block">Restaurar copia<input type="file" id="restore" accept="application/json,.json" hidden></label>
      <button class="btn ghost danger block" data-act="wipe">Borrar todos los datos</button></div>
    <p class="small muted">Lexi ${APP_VERSION}</p>`;
}

/* ---------- Eventos ---------- */
let saveTimer=null;
function afterRender(){
  const inp=$('#ans'); if(inp && !current?.checked) setTimeout(()=>inp.focus(), 60);
  document.querySelectorAll('textarea[data-w]').forEach(ta=>ta.addEventListener('input',()=>{
    const w=S.writings.find(x=>x.id===ta.dataset.w); if(!w) return; const p=ITEMS.get(w.promptId);
    w.text=ta.value; w.updatedAt=Date.now();
    const c=document.querySelector(`[data-wc="${w.id}"]`); if(c) c.textContent=`${wc(ta.value)} palabras${p?` de ~${p.words}`:''}`;
    const sv=$('[data-saved]'); if(sv) sv.textContent='Guardando…';
    clearTimeout(saveTimer); saveTimer=setTimeout(()=>{ exportCache=null; save(); const sv=$('[data-saved]'); if(sv) sv.textContent='Guardado'; }, 700);
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
    const sv=$('[data-saved]'); if(sv) sv.textContent='Guardando…'; clearTimeout(saveTimer); saveTimer=setTimeout(()=>{ exportCache=null; save(); const sv=$('[data-saved]'); if(sv) sv.textContent='Guardado'; },700); }));
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
  const t=e.target.closest('button, [data-go], tr[data-say]'); if(!t || t.disabled) return;
  const ds=t.dataset;
  if(ds.go){ go(ds.go); return; }
  if(ds.opt!==undefined){ check(ds.opt); return; }
  if(ds.say){ speak(ds.say); return; }
  if(ds.q && ds.v!==undefined){ if(!S.run) return; S.run.answers[ds.q]=ds.v; save(); const y=window.scrollY; render(); window.scrollTo(0,y); return; }
  if(ds.play){ playKey(ds.play); return; }
  if(ds.new){ if(ds.new==='free'){ const w=createWriting('free'); save(); editing=w.id; go('write'); } else { const w=createWriting(ds.new); save(); editing=w.id; go('write'); } return; }
  if(ds.open){ editing=ds.open; go('write'); return; }
  if(ds.page){ const i=ds.page.indexOf(':'); pageRef=[ds.page.slice(0,i), ds.page.slice(i+1)]; go('page'); return; }
  if(ds.topic){ startTopic(ds.topic); return; }
  if(ds.part){ const [s,p]=ds.part.split(':'); startPart(s, +p); return; }
  if(ds.paper){ startPaper(ds.paper); return; }
  if(ds.result){ resultId=ds.result; go('result'); return; }
  if(ds.set){ S.settings[ds.set]=+ds.val; save(); render(); return; }
  if(ds.sp){ sp={ part:+ds.sp, idx:Math.floor(Math.random()*20), end:0 }; render(); return; }
  if(ds.phrtheme!==undefined){ phrTheme=ds.phrtheme; render(); return; }
  if(ds.newnote!==undefined){ newNote(ds.newnote); return; }
  if(ds.note){ noteId=ds.note; go('note'); return; }
  if(ds.copytpl){ const t=NOTE_TEMPLATES.find(x=>x.id===ds.copytpl); toast(await copyText(t.text)?'Plantilla copiada.':'No se pudo copiar.'); return; }
  if(ds.packtoggle){ const p=S.packs.find(x=>x.id===ds.packtoggle); p.off=!p.off; rebuild(); exportCache=null; save(); render(); toast(p.off?'Pack desactivado: su contenido deja de aparecer.':'Pack activado.'); return; }
  if(ds.packview){ openPack=openPack===ds.packview?null:ds.packview; render(); return; }
  if(ds.packcopy){ const p=S.packs.find(x=>x.id===ds.packcopy); const pack={ id:p.id, name:p.name }; for(const k of PACK_KEYS) if((p[k]||[]).length) pack[k]=p[k];
    toast(await copyText(JSON.stringify({ format:'lexi-pack', pack }))?'JSON del pack copiado.':'No se pudo copiar.'); return; }
  if(ds.packdel){ const p=S.packs.find(x=>x.id===ds.packdel); if(confirm(`¿Borrar "${p.name}"? Tu progreso en sus ejercicios se conserva por si lo vuelves a cargar.`)){ S.packs=S.packs.filter(x=>x!==p); rebuild(); exportCache=null; save(); render(); } return; }
  if(ds.wchoose){ const m=S.wmock; const w=createWriting(ds.wchoose,{ mock:m.id, part:2 }); m.w2=w.id; save(); render(); return; }
  const act=ds.act; if(!act) return;
  const item=current && ITEMS.get(current.id);
  switch(act){
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
    case 'irrtest': startRun({ kind:'irregular', ref:'irregular', title:'Verbos irregulares', tasks:[irrTask()] }); break;
    case 'phrtest': startRun({ kind:'phrasal', ref:'phrasal', title:'Phrasal verbs', tasks:[phrTask()] }); break;
    case 'checktask': { const run=S.run; const tk=TT(run.tasks[run.ti]); const empty=tk.questions.filter(q=>!run.answers[tk.id+':'+q.n]).length;
      if(empty && !confirm(`Te faltan ${empty} por contestar. ¿Corregir igualmente?`)) break; run.checked[run.ti]=true; save(); render(); break; }
    case 'nexttask': S.run.ti++; save(); stopSpeech(); window.scrollTo(0,0); render(); break;
    case 'prevtask': S.run.ti--; save(); stopSpeech(); window.scrollTo(0,0); render(); break;
    case 'finishrun': if(S.run.mode!=='exam' || confirm('¿Entregar el examen? Ya no podrás cambiar las respuestas.')) finishRun(false); break;
    case 'quitrun': if(S.run.mode==='exam'){ stopSpeech(); go('tests'); toast('El examen sigue en marcha. El tiempo no se para.'); } else if(confirm('¿Salir? Tus respuestas se guardan y podrás continuar.')) go('tests'); break;
    case 'stopaudio': stopSpeech(); break;
    case 'wmock': startWMock(); break;
    case 'wmockdone': if(confirm('¿Entregar el simulacro de Writing?')) finishWMock(false); break;
    case 'wdone': { const w=S.writings.find(x=>x.id===editing); w.status='done'; w.updatedAt=Date.now(); exportCache=null; save(); toast('Terminado. Irá en tu próxima exportación.'); go('writing'); break; }
    case 'reopen': { const w=S.writings.find(x=>x.id===editing); w.status='draft'; save(); render(); break; }
    case 'wdel': if(confirm('¿Borrar este texto?')){ S.writings=S.writings.filter(x=>x.id!==editing); save(); go('writing'); } break;
    case 'sptimer': sp.end=Date.now()+sp.secs*1000; S.speak[dayKey()]=(S.speak[dayKey()]||0)+1; save(); render(); break;
    case 'spnext': sp.idx++; sp.end=0; stopSpeech(); render(); break;
    case 'recstart': startRec(); break;
    case 'recstop': if(rec) rec.stop(); break;
    case 'copydelta': { const d=getExport(false); if(await copyText(exportJSON(d))){ markExported(d); toast('Copiado. Pégalo en el chat con Claude.'); render(); } else toast('No se pudo copiar. Usa "Guardar como archivo".'); break; }
    case 'sharedelta': { const d=getExport(false); if(await shareFile(`lexi-${dayKey()}.json`, exportJSON(d))){ markExported(d); render(); } break; }
    case 'copyfull': toast(await copyText(exportJSON(getExport(true))) ? 'Historial completo copiado.' : 'No se pudo copiar.'); break;
    case 'import': { const v=$('#imp').value; if(!v.trim()){ toast('Pega primero el JSON.'); break; } reviewImport(v); break; }
    case 'applyimport': { const hasBackup=pendingImport.entries.some(e=>e.kind==='backup'); if(hasBackup && !confirm('Vas a sustituir todos tus datos por la copia. ¿Seguro?')) break; toast(applyImport(pendingImport)); render(); break; }
    case 'cancelimport': pendingImport=null; render(); break;
    case 'noteready': { const n=S.rawNotes.find(x=>x.id===noteId); if(!n.title.trim()){ toast('Ponle un título primero.'); break; } n.status='ready'; n.updatedAt=Date.now(); exportCache=null; save(); toast('Listo. Irá en tu próxima exportación.'); go('study'); break; }
    case 'noteunready': { const n=S.rawNotes.find(x=>x.id===noteId); n.status='draft'; save(); render(); break; }
    case 'notedel': if(confirm('¿Borrar este apunte?')){ S.rawNotes=S.rawNotes.filter(x=>x.id!==noteId); save(); go('study'); } break;
    case 'backup': download(`lexi-copia-${dayKey()}.json`, JSON.stringify({ format:'lexi-backup', version:2, savedAt:iso(Date.now()), state:S })); break;
    case 'wipe': if(prompt('Escribe BORRAR para eliminar todos tus datos de este móvil.')==='BORRAR'){ S=defaultState(); rebuild(); save(); toast('Datos borrados.'); go('home'); } break;
  }
});
document.addEventListener('keydown', e=>{
  if(e.key!=='Enter' || view!=='session' || !current) return;
  if(e.target.id==='ans' && !current.checked){ e.preventDefault(); check(e.target.value); }
  else if(current.checked && e.target.tagName!=='BUTTON'){ e.preventDefault(); next(); }
});
// Cronómetros
setInterval(()=>{
  document.querySelectorAll('[data-deadline]').forEach(el=>{
    const left=+el.dataset.deadline-Date.now(); el.textContent=mmss(left); el.classList.toggle('urgent', left<5*60000 && el.dataset.kind!=='speak');
    if(left<=0){ el.removeAttribute('data-deadline');
      if(el.dataset.kind==='run' && S.run) finishRun(true);
      else if(el.dataset.kind==='wmock' && S.wmock) finishWMock(true);
      else if(el.dataset.kind==='speak'){ el.textContent='Tiempo'; if(navigator.vibrate) navigator.vibrate(200); } }
  });
  if(S.run?.deadline && Date.now()>S.run.deadline && view!=='run') finishRun(true);
  if(S.wmock && Date.now()>S.wmock.deadline && view!=='wmock') finishWMock(true);
}, 1000);

/* ---------- Arranque ---------- */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  const hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange', ()=>{ if(hadController && !['session','run','write','wmock'].includes(view)) location.reload(); });
}
if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(()=>{});
render();
