'use strict';
/* Lexi v6: question formats, mixed tests and challenges.
   Loaded before app.js and only defines functions: everything here runs when app.js calls it. */

/* ---------- Helpers ---------- */
function strHash(s){ let h=2166136261; for(const c of String(s)){ h^=c.charCodeAt(0); h=Math.imul(h,16777619); } return (h>>>0).toString(36); }
// Seeded random numbers (mulberry32): the same seed gives the same sequence on any device
function seeded(seed){ let a=parseInt(strHash(seed),36)||1; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function shuffleWith(a, rnd){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const levelOk = (l, level) => !level || level==='all' || (level==='B2' ? l==='B2' : l!=='B2');

/* ---------- Grammar questions and irregular verbs as items ---------- */
// Not part of the vocabulary bank (they carry `virtual`): they feed mixed tests, challenges and, if enabled, the daily sessions
const gqId = (gid, q) => 'gq:'+gid+':'+strHash(q.q);
function addVirtualItems(){
  for(const g of GRAMMAR.values()) (g.test||[]).forEach(q=>{
    if(!q || !q.q || q.a==null) return;
    const id=gqId(g.id, q); if(ITEMS.has(id)) return;
    const ans=Array.isArray(q.a)?q.a:[q.a], mcq=Array.isArray(q.o) && q.o.length>1;
    ITEMS.set(id, { id, virtual:'gq', type:mcq?'mcq':'gap', cat:'grammar', gtopic:g.id, level:q.level||g.level||'B1', topic:'general', word:ans[0],
      prompt:q.q, options:mcq?q.o:undefined, answer:mcq?q.a:undefined, answers:mcq?undefined:ans, exp:q.e, exp_en:q.e_en, tags:q.tags||g.tags, pack:g.pack });
  });
  for(const v of window.LEXI_IRREGULAR||[]) for(const [k,name] of [['p','past simple'],['pp','past participle']]){
    const id='irr:'+v.b+':'+k;
    ITEMS.set(id, { id, virtual:'irr', type:'gap', cat:'irregular', level:'B1', topic:'general', word:v.b, verb:v.b, form:k,
      prompt:`${v.b} → ___ (${name})`, answers:v[k].split('/'), exp:`${v.b} – ${v.p} – ${v.pp} (${v.es})`, exp_en:`${v.b} – ${v.p} – ${v.pp}` });
  }
}
// The item behind a mistake stored in a test (topic tests and irregular-verb tests)
function detailRef(t, d){
  if(d.id) return d.id;
  if(t.kind==='topic'){ const g=GRAMMAR.get(t.ref), q=g && (g.test||[])[d.n-1]; return q ? gqId(g.id, q) : null; }
  if(t.kind==='irregular'){ const m=String(d.stem||'').match(/^(\S+).*→ past (simple|participle)/); return m ? `irr:${m[1]}:${m[2]==='simple'?'p':'pp'}` : null; }
  return null;
}

/* ---------- Formats ---------- */
// mcq = choose; gap_hint = write with a hint; gap / wordform = write; translate; dictation
const PRODUCTION=['gap','gap_hint','wordform','translate','dictation'];
const FMT_GROUP={ mcq:'choice', gap:'write', gap_hint:'write', wordform:'write', translate:'translate', dictation:'dictation' };
const FMTG_L={ choice:['Choose','Elegir'], write:['Write','Escribir'], translate:['Translate','Traducir'], dictation:['Dictation','Dictado'] };
const PREPS=['in','on','at','for','to','of','with','by','from','about','into','over','under','off','up','out'];
function inferFormat(a){
  if(a.f) return a.f;
  const it=ITEMS.get(a.id); if(!it) return null;
  return it.type==='gap' ? (it.hintAlways?'gap_hint':'gap') : it.type;
}
const answersOf = it => it.type==='mcq' ? [it.answer] : (it.answers||[]);
const filled = (prompt, a) => String(prompt).split('\n').filter(l=>l.includes('___')).pop().replace('___', a);
// Wrong options for an exercise that is normally written: answers of the same kind of exercise
function distractors(it){
  const right=answersOf(it), seen=new Set(right.map(norm)), size=String(right[0]||'').split(' ').length;
  let pool;
  if(it.cat==='preposition') pool=PREPS;
  else if(it.virtual==='irr'){ const v=(window.LEXI_IRREGULAR||[]).find(x=>x.b===it.verb)||{};
    pool=[v.b, ...(v.p||'').split('/'), ...(v.pp||'').split('/'), v.b+(String(v.b).endsWith('e')?'d':'ed')].filter(Boolean); }
  else { const same=[...ITEMS.values()].filter(x=>x.id!==it.id && x.cat===it.cat && ['mcq','gap','wordform'].includes(x.type));
    const close=same.filter(x=>x.topic===it.topic && it.topic!=='general' || (it.gtopic && x.gtopic===it.gtopic));
    pool=[...shuffle(close), ...shuffle(same)].map(x=>answersOf(x)[0]); }
  const out=[];
  for(const p of pool){ const n=norm(p); if(!p || seen.has(n) || Math.abs(String(p).split(' ').length-size)>1) continue; seen.add(n); out.push(p); }
  return out;
}
const canChoose = it => it.type==='mcq' || (['gap','wordform'].includes(it.type) && distractors(it).length>=3);
const canDictate = it => !it.virtual && typeof it.prompt==='string' && it.prompt.includes('___') && it.type!=='mcq' && words(it.prompt).length<=16;
const writable = it => ['gap','wordform','translate'].includes(it.type);
// Format by maturity: choose → write with a hint → write → write / dictation / translate
// The exercise as it is shown this time: a copy of the item with the format applied
/* ---------- Order inside a session ---------- */
// Never two of the same `cat` in a row (when possible): take from the biggest remaining group that differs from the last one
// At least 40 % production: the newest choice exercises move up to "write with a hint"
// A failed exercise comes back 4–7 places later, where it doesn't sit next to the same `cat`
/* ---------- Weak points ---------- */
// Accuracy in the last 14 days by category, vocabulary topic, grammar topic and tag, plus the failed items
function weakStats(days=14){
  const since=Date.now()-days*DAY, w={ cat:{}, topic:{}, gt:{}, tag:{}, fails:new Map(), ufails:new Map() };
  const add=(m,k,ok)=>{ if(!k) return; (m[k]||(m[k]={ n:0, ok:0 })); m[k].n++; if(ok) m[k].ok++; };
  const one=(id, ok)=>{ const it=ITEMS.get(id); if(!it || it.virtual==='ph'){ const uid=uidOfItem(id); if(uid && !uid.startsWith('voc:') && !uid.startsWith('gr:')){ add(w.cat, uid.split(':')[0], ok); if(!ok) w.ufails.set(uid, (w.ufails.get(uid)||0)+1); } return; }
    add(w.cat, it.cat, ok); if(!it.virtual) add(w.topic, it.topic, ok); add(w.gt, it.gtopic, ok); for(const t of it.tags||[]) add(w.tag, t, ok);
    if(!ok) w.fails.set(id, (w.fails.get(id)||0)+1); };
  for(const a of S.attempts) if(a.t>since) one(a.id, a.r!=='bad');
  for(const t of S.tests) if(t.at>since && t.kind!=='mixed') for(const d of t.detail||[]){ const id=detailRef(t,d); if(id) one(id, d.r==='ok'); else if(t.kind==='topic') add(w.gt, t.ref, d.r==='ok'); }
  return w;
}
const acc = x => x && x.n ? x.ok/x.n : null;
function itemWeight(it, w){
  let x=1; x+=3*(w.fails.get(it.id)||0);
  const c=w.cat[it.cat]; if(c && c.n>=3) x+=4*(1-acc(c));
  if(it.gtopic){ const b=bestOf('topic', it.gtopic); if(b!==null && b<70) x+=3; const g=w.gt[it.gtopic]; if(g && g.n>=3) x+=4*(1-acc(g)); }
  if(it.virtual==='irr' && (S.irr[it.verb]||0)>0) x+=3;
  if(it.cat==='phrasal' && (S.phr[it.word]||0)>0) x+=3;
  for(const t of it.tags||[]){ const g=w.tag[t]; if(g && g.n>=3) x+=2*(1-acc(g)); }
  return x;
}
function weightedPick(list, n, weight){
  const pool=list.map(it=>({ it, w:weight(it) })), out=[];
  while(out.length<n && pool.length){ let r=Math.random()*pool.reduce((s,p)=>s+p.w,0), k=0; while(k<pool.length-1 && (r-=pool[k].w)>0) k++; out.push(pool.splice(k,1)[0].it); }
  return out;
}

/* ---------- Mixed tests ---------- */
const MIX_SHARE={ grammar:.4, vocab:.35, phrasal:.15, irregular:.1 };
const MIXG_L={ grammar:['Grammar','Gramática'], vocab:['Vocabulary and collocations','Vocabulario y collocations'], phrasal:['Phrasal verbs','Phrasal verbs'], irregular:['Irregular verbs','Verbos irregulares'] };
const mixGroup = it => it.cat==='grammar'||it.cat==='irregular'||it.cat==='phrasal' ? it.cat : 'vocab';
function matchesOnly(it, only){
  if(!only) return true;
  const [k,v]=String(only).split(/:(.*)/s);
  return k==='cat' ? it.cat===v : k==='topic' ? !it.virtual && it.topic===v : k==='g' ? it.gtopic===v : k==='tag' ? (it.tags||[]).includes(v) : true;
}
function mixPool(level, only){ return [...ITEMS.values()].filter(i=>i.type!=='writing' && !i.retired && levelOk(i.level, level) && matchesOnly(i, only)); }
// opts: { n, level: 'B1'|'all'|'B2', focus: 'balanced'|'weak', only }
// The same session engine as the daily sessions, with its own queue and options
/* ---------- Challenges ---------- */
const CH_L={ daily:['Daily challenge','Reto diario'], speed:['Speed round','Contrarreloj'], sudden:['Sudden death','Muerte súbita'], nohints:['No hints','Sin pistas'], b2:['B2 only','Solo B2'], mistakes:['Mistakes review','Repaso de fallos'] };
const CH_D={ daily:['10 harder questions, the same all day. Writing only, no hints.','10 preguntas más difíciles, iguales todo el día. Solo escribir, sin pistas.'],
  speed:['90 seconds: as many choice questions as you can.','90 segundos: todas las preguntas de elegir que puedas.'],
  sudden:['Mixed questions until your first mistake.','Preguntas mixtas hasta el primer fallo.'],
  nohints:['A vocabulary session where you write everything: no hints, no options.','Sesión de vocabulario en la que todo es escribir: sin pistas ni opciones.'],
  b2:['A mixed test with B2 content only.','Test mixto solo con contenido B2.'],
  mistakes:['Only what you got wrong in the last 14 days.','Solo lo que has fallado en los últimos 14 días.'] };
const CH_NO_SRS=['daily','speed','sudden'];
const CH_SCORE={ speed:'count', sudden:'count' }; // the rest are scored as a percentage
function dailyStreak(){ let n=0, t=Date.now(); if(!S.challenges.daily[dayKey(t)]) t-=DAY; while(S.challenges.daily[dayKey(t)]){ n++; t-=DAY; } return n; }
function chBest(ch){ const b=S.challenges.best[ch]; return b==null ? null : b; }
function chBestLabel(ch){ const b=chBest(ch); return b==null ? '' : CH_SCORE[ch] ? String(b) : b+'%'; }

/* ---------- End of a mixed test or challenge ---------- */
// Time's up in a speed round or a timed mixed test: the question on screen doesn't count unless it was answered
function sessionTimeUp(){
  const ss=S.session; if(!ss || ss.done) return;
  ss.q=ss.q.slice(0, current && current.checked ? ss.i+1 : ss.i); ss.i=ss.q.length; current=null;
  finishQuiz(ss); save();
  toast(ss.ch==='speed' ? T("Time's up!",'¡Tiempo!') : T("Time's up. Your test has been marked.",'Se acabó el tiempo. Tu test está corregido.'));
  if(view==='session') render();
}
function onlyName(only){
  const [k,v]=String(only||'').split(/:(.*)/s);
  if(k==='cat') return lab(CAT_L, v); if(k==='topic') return lab(TOPIC_L, v);
  if(k==='g'){ const g=GRAMMAR.get(v); return g ? L(g,'title') : v; }
  return v||'';
}
function questionText(it, r){
  if(r && r.q) return r.q;
  if(it.type==='translate') return it.es||''; if(it.type==='dictation') return it.text||'';
  return String(it.prompt||it.word||'').replace(/\n/g,' ');
}

/* ---------- Screens ---------- */
function mixedSectionHTML(){
  const m=S.settings.mix;
  const seg=(key, vals, labels)=>`<div class="seg" role="group">${vals.map((v,i)=>`<button data-mix="${key}" data-val="${v}" aria-pressed="${String(m[key])===String(v)}">${labels[i]}</button>`).join('')}</div>`;
  const papers=[...PAPERS.values()].filter(p=>p.section==='grammar');
  const hist=S.tests.filter(t=>t.kind==='mixed');
  return `<h2>${T('Mixed practice','Práctica mezclada')}</h2><p class="small muted">${T('Questions from everything you have installed: grammar, vocabulary, phrasal verbs and irregular verbs.','Preguntas de todo lo que tienes instalado: gramática, vocabulario, phrasal verbs e irregulares.')}</p>
    <div class="panel stack">
      <div><b>${T('Length','Longitud')}</b></div>${seg('n',[10,20,30],['10','20','30'])}
      <div><b>${T('Level','Nivel')}</b></div>${seg('level',['B1','all','B2'],['B1','B1 + B2','B2'])}
      <div><b>${T('Focus','Enfoque')}</b></div>${seg('focus',['balanced','weak'],[T('Balanced','Equilibrado'),T('My weak points','Mis puntos débiles')])}
      <div><b>${T('Timer','Cronómetro')}</b></div>${seg('timer',['false','true'],[T('Off','Sin cronómetro'),T('45 s per question','45 s por pregunta')])}
      <button class="btn primary block" data-act="mixed">${T('Start mixed test','Empezar test mixto')} ${ic('go')}</button>
      ${hist.length?`<p class="small muted" style="margin:0">${T(`Last: ${hist[hist.length-1].score}/${hist[hist.length-1].max}`,`Último: ${hist[hist.length-1].score}/${hist[hist.length-1].max}`)}</p>`:''}</div>
    ${papers.length?`<h3 class="sub">${T('General tests','Tests generales')}</h3><ul class="list">${papers.map(p=>{ const b=S.tests.filter(t=>t.ref===p.id); const best=b.length?Math.max(...b.map(t=>t.score)):null;
      return `<li><button class="rowbtn" data-paper="${esc(p.id)}"><i class="sw thicket"></i><span class="rt">${esc(L(p,'title'))}<span class="small muted">${p.minutes} min · ${p.max} ${T('questions','preguntas')}</span></span>${best===null?ic('chev','sm'):`<span class="pct">${best}/${p.max}</span>`}</button></li>`; }).join('')}</ul>`:''}`;
}
// Lesson of the day: the weakest grammar topic, or one not read yet. It stays the same all day.
function lessonOfDay(){
  const k=dayKey();
  if(S.lesson?.day===k && GRAMMAR.has(S.lesson.id)) return { g:GRAMMAR.get(S.lesson.id), why:S.lesson.why, p:S.lesson.p };
  const w=weakStats(30), gs=[...GRAMMAR.values()]; if(!gs.length) return null;
  const score=g=>{ const b=bestOf('topic',g.id), a=w.gt[g.id]&&w.gt[g.id].n>=3?Math.round(acc(w.gt[g.id])*100):null; return b===null ? a : a===null ? b : Math.min(a, b); };
  const scored=gs.map(g=>({ g, p:score(g) })).filter(x=>x.p!==null && x.p<70).sort((a,b)=>a.p-b.p);
  let pick=scored[0] ? { g:scored[0].g, why:'weak', p:scored[0].p } : null;
  if(!pick){ const unread=gs.filter(g=>!S.read[g.id]); if(unread.length){ const g=unread[Math.floor(seeded('lesson:'+k)()*unread.length)]; pick={ g, why:'unread', p:null }; } }
  if(!pick){ const all=gs.map(g=>({ g, p:score(g) })).sort((a,b)=>(a.p??101)-(b.p??101)); pick={ g:all[0].g, why:'review', p:all[0].p }; }
  S.lesson={ day:k, id:pick.g.id, why:pick.why, p:pick.p };
  return pick;
}
function lessonHTML(){
  const l=lessonOfDay(); if(!l) return '';
  const why = l.why==='weak' ? T(`Your weakest topic right now (${l.p}%).`,`Tu tema más flojo ahora mismo (${l.p} %).`) : l.why==='unread' ? T("You haven't read this one yet.",'Todavía no lo has leído.') : T('A quick refresher.','Un repaso rápido.');
  return `<div class="panel note"><h3>${ic('book')}${T('Lesson of the day','Lección del día')}</h3><p style="margin:0 0 4px"><b>${esc(L(l.g,'title'))}</b></p><p class="small muted">${why} ${T('Read the theory, then take its test.','Lee la teoría y después haz su test.')}</p>
    <button class="btn block" data-page="grammar:${esc(l.g.id)}">${S.read[l.g.id]?T('Read it again','Volver a leerla'):T('Read the lesson','Leer la lección')}</button></div>`;
}

/* ---------- v7: mixed tests and challenges run on the exercise engine ---------- */
function startMixed(extra){
  const m=Object.assign({}, S.settings.mix, extra||{});
  const exs=extra?.exs || buildMixedEx(m);
  return startEx(exs, { mode:m.only?'focused':'mixed', only:m.only||null, opts:{ n:exs.length, level:m.level, focus:m.focus, timer:!!m.timer, mistakes:!!m.mistakes }, secs:m.timer ? exs.length*45 : 0 });
}
const unitsEx = (uids, o={}) => interleave(uids.map(id=>UNITS.get(id)).filter(Boolean).map(u=>genFor(u, Object.assign({ single:true }, o))).filter(Boolean));
function startChallenge(ch){
  if(ch==='daily'){
    const done=S.challenges.daily[dayKey()];
    if(done){ toast(T(`Already done today: ${done.score}/${done.max}. Come back tomorrow.`,`Ya lo has hecho hoy: ${done.score}/${done.max}. Vuelve mañana.`)); return; }
    return startEx(dailyChallengeEx(), { mode:'challenge', ch });
  }
  if(ch==='speed') return startEx(unitsEx(shuffle([...UNITS.keys()]).slice(0,140), { kinds:['choice'] }).slice(0,120), { mode:'challenge', ch, secs:90 });
  if(ch==='sudden') return startEx(buildMixedEx({ n:80, level:'all', focus:'balanced' }), { mode:'challenge', ch });
  if(ch==='nohints') return startEx(buildDaily(S.settings.dailySize||25, { noBalance:true, gen:{ skills:['produce'], kinds:['text','multi'], noHint:true, single:true } }).filter(isExercise), { mode:'challenge', ch });
  if(ch==='b2') return startEx(buildMixedEx({ n:20, level:'B2', focus:'balanced' }), { mode:'challenge', ch });
  if(ch==='mistakes') return startEx(unitsEx(shuffle(recentMistakeUnits()).slice(0,20)), { mode:'challenge', ch });
}
function startMyMistakes(ss){ const ids=[...new Set(ss.results.filter(r=>r.r==='bad').flatMap(r=>r.uids||[r.uid]))];
  return startMixed({ exs:unitsEx(ids), n:ids.length, mistakes:true }); }

/* ---------- End of a test or challenge ---------- */
function breakdownOf(results){
  const b={ bySkill:{}, byFormat:{}, byArea:{}, byCategory:{}, byGrammarTopic:{} };
  const add=(m,k,ok)=>{ if(!k) return; (m[k]||(m[k]={ n:0, ok:0 })); m[k].n++; if(ok) m[k].ok++; };
  for(const x of results){ const ok=x.r!=='bad', u=UNITS.get(x.uid);
    add(b.bySkill, x.s, ok); add(b.byFormat, x.f, ok); if(u){ add(b.byArea, areaOf(u.lib), ok); add(b.byCategory, u.item ? u.item.cat : u.lib, ok); if(u.item?.gtopic) add(b.byGrammarTopic, u.item.gtopic, ok); } }
  return b;
}
function finishQuiz(ss){
  if(ss.done || !['mixed','focused','challenge','libtest'].includes(ss.mode)) return;
  ss.done=true;
  const res=ss.results, score=res.filter(r=>r.r!=='bad').length, max=res.length, sec=Math.round((Date.now()-ss.started)/1000), d=today();
  const detail=res.map((r,k)=>{ const u=UNITS.get(r.uid); return { n:k+1, id:r.id||legacyId(r.uid||''), uid:r.uid, lib:u?.lib||null, cat:u?.item?.cat||u?.lib||null, gtopic:u?.item?.gtopic||null,
    format:r.f||null, skill:r.s||null, stem:String(r.q||'').slice(0,160), given:r.a||'', correct:r.c||'', r:r.r }; });
  if(ss.mode!=='challenge'){
    const lib=ss.mode==='libtest';
    const rec={ id:'t'+Date.now().toString(36), kind:lib?'library':'mixed', ref:lib?ss.lib:(ss.only||'mixed'), title:sessionTitle(ss), mode:'practice', section:lib?'library':'mixed', at:Date.now(), durationSec:sec,
      score, max, parts:[], detail, tasks:[], breakdown:breakdownOf(res), opts:ss.opts||null };
    S.tests.push(rec); ss.rec=rec.id; d.t=(d.t||0)+1;
  } else {
    const val=CH_SCORE[ss.ch] ? score : (max ? Math.round(score/max*100) : 0);
    const prev=S.challenges.best[ss.ch];
    ss.best=prev==null || val>prev; if(ss.best && max) S.challenges.best[ss.ch]=val;
    S.challenges.hist.push({ ch:ss.ch, at:Date.now(), score, max, sec, mistakes:detail.filter(x=>x.r==='bad').map(x=>({ id:x.id, uid:x.uid, given:x.given, correct:x.correct })) });
    if(S.challenges.hist.length>300) S.challenges.hist=S.challenges.hist.slice(-300);
    if(ss.ch==='daily') S.challenges.daily[dayKey()]={ score, max };
    if(ss.ch==='daily' || ss.ch==='b2') d.t=(d.t||0)+1;
  }
  exportCache=null;
}
function sessionTitle(ss){
  if(ss.mode==='challenge') return lab(CH_L, ss.ch);
  if(ss.mode==='focused') return T('Focused practice: ','Práctica enfocada: ')+onlyName(ss.only);
  if(ss.mode==='mixed') return ss.opts?.mistakes ? T('My mistakes','Mis fallos') : T('Mixed test','Test mixto');
  if(ss.mode==='libtest'){ const m=ss.opts?.mode; return `${libName(ss.lib)}: ${m==='meaning'?T('meaning test','test de significado'):m==='usage'?T('usage test','test de uso'):'test'}`; }
  if(ss.mode==='learn') return T('Learn new','Aprender nuevos');
  if(ss.mode==='practise'){ const u=UNITS.get(ss.uids?.[0]); return T('Practise: ','Practicar: ')+(u?unitName(u):''); }
  if(ss.mode==='flash') return T('Flashcards: ','Tarjetas: ')+libName(ss.lib);
  return '';
}
function breakdownHTML(b){
  if(!b) return '';
  const rows=(m, name)=>Object.entries(m||{}).sort((x,y)=>acc(x[1])-acc(y[1])).map(([k,v])=>`<li><div class="row spread"><span>${esc(name(k))}</span><span class="small muted">${v.ok}/${v.n}</span></div><div class="meter"><div style="width:${v.ok/v.n*100}%"></div></div></li>`).join('');
  const line = b.bySkill && Object.keys(b.bySkill).length ? `<p class="skillline">${SKILLS.filter(k=>b.bySkill[k]).map(k=>`${esc(lab(SKILL_L,k))} <b>${b.bySkill[k].ok}/${b.bySkill[k].n}</b>`).join(' · ')}</p>` : '';
  return `${line}
    ${b.byFormat && Object.keys(b.byFormat).length?`<h2>${T('By format','Por formato')}</h2><ul class="list">${rows(b.byFormat, fmtName)}</ul>`:''}
    ${Object.keys(b.byArea||{}).length>1?`<h2>${T('By area','Por área')}</h2><ul class="list">${rows(b.byArea, k=>lab(AREA_L,k))}</ul>`:''}
    ${!b.byFormat && Object.keys(b.byCategory||{}).length?`<h2>${T('By category','Por categoría')}</h2><ul class="list">${rows(b.byCategory, k=>catName(k))}</ul>`:''}
    ${Object.keys(b.byGrammarTopic||{}).length?`<h2>${T('By grammar topic','Por tema de gramática')}</h2><ul class="list">${rows(b.byGrammarTopic, k=>{ const g=GRAMMAR.get(k); return g?L(g,'title'):k; })}</ul>`:''}`;
}
function quizSummaryHTML(ss){
  const res=ss.results, ok=res.filter(r=>r.r!=='bad').length, bad=res.filter(r=>r.r==='bad');
  const ch=ss.mode==='challenge', count=ch && CH_SCORE[ss.ch];
  const big=count ? `<b>${ok}</b><span>${ss.ch==='speed'?T('right in 90 seconds','aciertos en 90 segundos'):pl(ok,'in a row','in a row','seguida','seguidas')}</span>` : `<b>${ok}/${res.length}</b><span>${res.length?Math.round(ok/res.length*100):0}%</span>`;
  const again = ch ? `data-ch="${ss.ch}"` : ss.mode==='focused' ? `data-focus="${esc(ss.only)}"` : ss.mode==='libtest' ? 'data-act="libtest"' : 'data-act="mixed"';
  const failedUnits=[...new Set(bad.map(r=>r.uid).filter(u=>u && UNITS.has(u)))];
  return `<div class="sess-top"><button class="icon-btn" data-act="finish" aria-label="${T('Back to home','Volver al inicio')}">${ic('close')}</button><b style="flex:1">${esc(sessionTitle(ss))}</b><span class="count">${T('Finish','Meta')}</span></div>
    <h1>${ch?T('Challenge complete','Reto terminado'):T('Test complete','Test terminado')}</h1>
    <div class="score">${big}</div>
    ${ch?`<p class="muted">${ss.best?T('New personal best!','¡Nuevo récord personal!'):chBest(ss.ch)!=null?T(`Personal best: ${chBestLabel(ss.ch)}`,`Récord personal: ${chBestLabel(ss.ch)}`):''}${ss.ch==='daily'?' '+T(`Daily challenge streak: ${dailyStreak()}.`,`Racha de retos diarios: ${dailyStreak()}.`):''}</p>`:''}
    ${!count && res.length ? breakdownHTML(breakdownOf(res)) : ''}
    ${bad.length?`<h2>${T('Your mistakes','Tus fallos')}</h2><table class="cd"><tbody>${bad.map((r,k)=>{ const u=UNITS.get(r.uid); const link=u ? (u.item ? `data-item="${esc(u.item.id)}"` : `data-unit="${esc(u.uid)}"`) : '';
      return `<tr ${link}><th>${k+1}</th><td><div class="small muted">${esc(fmtName(r.f))}${u?' · '+esc(unitName(u)):''}</div><div class="small"${r.f==='translate'?' lang="es"':''}>${esc(r.q)}</div>
      <div class="ans-row bad-t">${ic('x','sm')}<span class="${r.a?'struck':''}">${esc(r.a)||T('(blank)','(en blanco)')}</span></div><div class="ans-row ok-t">${ic('check','sm')}<b>${esc(r.c)}</b></div></td></tr>`; }).join('')}</tbody></table>`:''}
    <div class="foot"><div class="actions">
      ${failedUnits.length?`<button class="btn primary big block" data-learnthese="${esc(failedUnits.slice(0,8).join('|'))}">${T('Learn these','Aprender estos')} ${ic('go')}</button>`:''}
      ${bad.length?`<button class="btn block" data-act="mixmistakes">${T('Practise my mistakes','Practicar mis fallos')}</button>`:''}
      <button class="btn ${bad.length?'':'primary big'} block" ${again}>${T('Try again','Repetir')}</button>
      <button class="btn ghost block" data-act="finish">${T('Back to home','Volver al inicio')}</button></div></div>`;
}
function challengesHTML(list){
  const keys=list||Object.keys(CH_L), dd=S.challenges.daily[dayKey()];
  return `<ul class="list">${keys.map(ch=>{
    const right = ch==='daily' ? (dd?`<span class="pct">${dd.score}/${dd.max}</span>`:ic('chev','sm')) : ch==='mistakes' ? `<span class="small muted">${recentMistakeUnits().length}</span>` : (chBest(ch)!=null?`<span class="pct">${esc(chBestLabel(ch))}</span>`:ic('chev','sm'));
    const sub = ch==='daily' && dd ? T(`Done today · streak ${dailyStreak()}`,`Hecho hoy · racha ${dailyStreak()}`) : lab(CH_D, ch);
    return `<li><button class="rowbtn" data-ch="${ch}"><i class="sw ${ch==='b2'?'thicket':'contour'}"></i><span class="rt">${lab(CH_L,ch)}<span class="small muted">${esc(sub)}</span></span>${right}</button></li>`; }).join('')}</ul>`;
}
