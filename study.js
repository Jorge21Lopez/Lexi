'use strict';
/* Lexi v7: screens for the exercise engine — sessions with every exercise kind, Home, libraries, unit cards,
   Learn new, flashcards, library tests, Progress blocks and settings. Loaded before app.js: only definitions here. */

const tx = v => v==null ? '' : typeof v==='string' ? v : (LANG==='en' ? (v.en||v.es||'') : (v.es||v.en||''));
const isExercise = x => x && x.kind!=='present';
const fmtName = f => FMT[f] ? lab({ x:FMT[f].l }, 'x') : f;
const libName = l => lab(LIB_L, l);
// *x* → highlighted; ___ → a slot (filled after checking)
function rich(s, fill, cls){
  const hl=t=>esc(t).replace(/\*([^*]+)\*/g,'<b class="hl">$1</b>').replace(/\n/g,'<br>');
  const parts=String(s||'').split('___');
  if(parts.length<2) return hl(s);
  return parts.map(hl).join(`<span class="slot ${cls||''}">${fill?esc(fill):'&nbsp;'}</span>`);
}
const optText = o => o ? L(o,'t') : '';
// A meaning in the interface language; content that only exists in Spanish is marked as such
function meanHTML(m, max){ const cut=s=>max && s.length>max ? s.slice(0,max-1)+'…' : s;
  if(LANG==='en' && !m.en) return m.es ? `<span lang="es">${esc(cut(m.es))}</span>` : '';
  return esc(cut(LANG==='en' ? m.en : (m.es||m.en))); }

/* ---------- Grading ---------- */
function gradeText(ex, v, answers, prompt){
  const type = ex.format==='dictation' ? 'dictation' : ex.format==='translate' ? 'translate' : 'gap';
  return grade({ type, cat:ex.strict?'grammar':'vocab', prompt:prompt??ex.q, answers:answers||ex.answers, text:ex.text }, v);
}
function gradeEx(ex, ans){
  const one=r=>({ r, parts:[{ uid:ex.uid, r }] });
  switch(ex.kind){
    case 'choice': return one(+ans===ex.ans ? 'ok' : 'bad');
    case 'text': return one(gradeText(ex, ans));
    case 'order': { const plainW=a=>a.map(normTok).filter(Boolean).join(' '), mine=plainW(ans||[]);
      return one(mine===plainW(ex.sol) || (ex.alts||[]).includes(mine) ? 'ok' : 'bad'); }
    case 'self': return one(ans==='ok' ? 'ok' : 'bad');
    case 'flash': return one(ans==='again' ? 'bad' : ans==='hard' ? 'near' : 'ok');
    case 'tap': { const t=ans||{}; if(!ex.bad.includes(t.tok)) return one('bad'); if(!ex.fix) return one('ok');
      const r=gradeText(Object.assign({}, ex, { format:'gap' }), t.fix||'', ex.fixes||[ex.fix], ''); return one(r==='bad' ? 'near' : r); }
    case 'multi': { const rs=ex.fields.map((f,i)=>gradeText(Object.assign({}, ex, { format:'gap' }), (ans||[])[i]||'', f.answers, ''));
      const all=rs.every(r=>r==='ok') ? 'ok' : rs.some(r=>r==='bad') ? 'bad' : 'near';
      return { r:all, fields:rs, parts:ex.fields.some(f=>f.uid) ? ex.fields.map((f,i)=>({ uid:f.uid, r:rs[i] })) : [{ uid:ex.uid, r:all }] }; }
    case 'match': { const parts=ex.pairs.map(p=>({ uid:p.uid, r:(ans||{})[p.uid]===p.uid ? 'ok' : 'bad' })), bad=parts.filter(p=>p.r==='bad').length;
      return { r:bad===0 ? 'ok' : bad===1 ? 'near' : 'bad', parts }; }
  }
  return one('bad');
}
function answerText(ex, ans, part){
  if(ans==null) return '';
  if(ex.kind==='choice') return optText(ex.opts[+ans]);
  if(ex.kind==='multi') return (ans||[]).join(' / ');
  if(ex.kind==='order') return (ans||[]).join(' ');
  if(ex.kind==='tap') return [ex.toks[ans.tok], ans.fix].filter(Boolean).join(' → ');
  if(ex.kind==='match'){ const p=part && ex.pairs.find(x=>x.uid===part.uid); if(p){ const r=ex.pairs.find(x=>x.uid===ans[p.uid]); return r?optText(r.r):''; } return ''; }
  if(ex.kind==='self') return current?.ui?.text || '';
  return String(ans);
}
function correctOfEx(ex, part){
  if(ex.kind==='choice') return optText(ex.opts[ex.ans]);
  if(ex.kind==='text') return (ex.answers||[])[0] || ex.text || '';
  if(ex.kind==='multi'){ if(part && ex.fields.some(f=>f.uid)) return ex.fields.find(f=>f.uid===part.uid)?.answers[0]||''; return ex.fields.map(f=>f.answers[0]).join(' / '); }
  if(ex.kind==='order') return ex.sol.join(' ');
  if(ex.kind==='match'){ const p=ex.pairs.find(x=>x.uid===(part?.uid||ex.uid)); return p ? `${p.l} = ${optText(p.r)}` : ''; }
  if(ex.kind==='tap') return ex.show||'';
  return ex.show || unitName(UNITS.get(ex.uid)||{ term:'' });
}
function questionOf(ex){
  const parts=[ex.from, ex.ctx, ex.q, ex.q2, ex.es, ex.front, tx(ex.pr)].filter(Boolean);
  if(ex.kind==='tap') parts.push(ex.toks.join(' '));
  return plain(parts.join(' · ')).replace(/\n/g,' ');
}

/* ---------- Session flow ---------- */
const RETRY_MODES=['daily','extra','new','learn','route'];
const QUIZ_MODES=['mixed','focused','challenge','libtest','routetest'];
const updatesUnits = ss => !(ss.mode==='challenge' && CH_NO_SRS.includes(ss.ch));
// o.routeId / o.routeMode: activity started from a route (learn, practise, flashcards, test), recorded with every answer
function startEx(exs, o={}){
  if(!exs || !exs.filter(isExercise).length){ toast(T('There is nothing to practise with these options.','No hay nada que practicar con estas opciones.')); return false; }
  const secs=o.secs; delete o.secs;
  if(o.routeId) routeTouch(o.routeId, o.routeMode);
  S.session=Object.assign({ q:exs, i:0, retried:[], results:[], started:Date.now(), answered:-1, mode:'daily' }, o, { deadline:secs?Date.now()+secs*1000:null });
  current=null; trackPos=0; save(); go('session'); return true;
}
// Tells the user when new items had to fill the session (nothing else left that wasn't practised in the last 4 hours)
function filledToast(exs){ const n=exs.extraNew||0; if(n) toast(T(`Not enough reviews right now, so ${n} new ${n===1?'item fills':'items fill'} the session.`,`Ahora no hay repasos suficientes: ${n} ${n===1?'elemento nuevo completa':'elementos nuevos completan'} la sesión.`)); }
function startSession(size, mode='daily'){
  if(mode==='extra'){
    const exs=buildDaily(size, { newBudget:0, noCool:true });
    if(exs.filter(isExercise).length){ filledToast(exs); return startEx(exs, { mode:'extra' }); }
    // Nothing to review and no new items left: a mixed test, which may repeat what you know
    toast(T("You've practised everything recently: here is a mixed test.",'Ya lo has practicado todo hace poco: aquí tienes un test mixto.')); return startMixed();
  }
  if(mode==='new') return startEx(buildDaily(size, { onlyNew:true, newBudget:size }), { mode:'new' });
  const exs=buildDaily(size); filledToast(exs);
  return startEx(exs, { mode:'daily', size });
}
function startLearn(units, o={}){
  if(!units.length){ toast(T('There are no new items left here. Try another library or theme.','No quedan elementos nuevos aquí. Prueba otra librería u otro tema.')); return false; }
  return startEx(buildLearn(units), Object.assign({ mode:'learn', uids:units.map(u=>u.uid) }, o));
}
function startPractiseOne(uid){ const u=UNITS.get(uid); if(!u) return; startEx(buildPractiseOne(u), { mode:'practise', uids:[uid] }); }
function startFlash(lib){ startEx(buildFlash(lib), { mode:'flash', lib }); }
function startLibTest(o){
  const c=Object.assign({}, S.settings.libtest, o||{}), exs=buildLibTest(c.lib, c.n, c.scope, c.mode, c.theme);
  if(startEx(exs, { mode:'libtest', lib:c.lib, opts:c })){ rememberLibTest(c.lib, exs); save(); }
}
function retryEx(ex){
  const u=UNITS.get(ex.uid); if(!u) return null;
  const rx=genFor(u, { tier:1, single:true, exclude:[ex.format] }) || genFor(u, { single:true });
  if(rx){ rx.retry=true; rx.showExp=true; } return rx;
}
// A failed exercise comes back 4–7 places later, away from the same unit, format and library
function retryPos(ss, rx){
  const at=k=>ss.q[k];
  const ok=x=>!x || (x.uid!==rx.uid && x.format!==rx.format && x.lib!==rx.lib);
  for(let p=ss.i+4;p<=Math.min(ss.q.length, ss.i+7);p++) if(ok(at(p-1)) && ok(at(p))) return p;
  for(let p=ss.i+4;p<=Math.min(ss.q.length, ss.i+7);p++) if((!at(p-1)||at(p-1).uid!==rx.uid) && (!at(p)||at(p).uid!==rx.uid)) return p;
  return Math.min(ss.q.length, ss.i+4);
}
function check(ans){
  const ss=S.session; if(!current || current.checked || !ss) return;
  const ex=current.ex; if(!isExercise(ex)) return;
  const ms=Date.now()-current.start, g=gradeEx(ex, ans);
  current.checked=true; current.result=g.r; current.answer=ans; current.grade=g; ss.answered=ss.i;
  const d=today(), on=updatesUnits(ss);
  d.ar=d.ar||{};
  for(const p of g.parts){
    if(on && learnUnit(p.uid, p.r, ex.skill, ex.format, { introduced:ex.fresh, easy:ex.kind==='flash' && ans==='easy' })) d.nw=(d.nw||0)+1;
    const a=areaOf(p.uid.split(':')[0]); d.ar[a]=(d.ar[a]||0)+1;
  }
  d.n++; if(g.r!=='bad') d.ok++;
  const hint=!!(ex.hint && tx(ex.hint) && (current.showHint || ex.hintAlways || ['gap_hint','particle','verbchoice'].includes(ex.format) || (ex.lib!=='voc' && ex.format==='gap')));
  for(const p of g.parts){
    const rec={ id:legacyId(p.uid), u:p.uid, t:Date.now(), r:p.r, ms:Math.round(ms/g.parts.length), a:String(answerText(ex, ans, p)).slice(0,300), f:ex.format, s:ex.skill, m:ss.mode, h:hint?1:0 };
    if(p.r==='bad'){ rec.q=questionOf(ex).slice(0,160); rec.c=String(correctOfEx(ex, p)).slice(0,120); }
    if(ss.routeId){ rec.rid=ss.routeId; rec.rm=ss.routeMode; }
    S.attempts.push(rec);
  }
  ss.results.push({ id:legacyId(ex.uid), uid:ex.uid, uids:g.parts.map(p=>p.uid), r:g.r, a:String(answerText(ex, ans)).slice(0,300), c:String(correctOfEx(ex)).slice(0,200), f:ex.format, s:ex.skill, q:questionOf(ex).slice(0,200) });
  if(ex.format==='complete') S.prod.push({ uid:ex.uid, at:Date.now(), prompt:tx(ex.pr), text:String(current.ui.text||'').slice(0,600), self:g.r });
  if(g.r==='bad' && RETRY_MODES.includes(ss.mode) && !ss.retried.includes(ex.uid)){ ss.retried.push(ex.uid); const rx=retryEx(ex); if(rx) ss.q.splice(retryPos(ss, rx), 0, rx); }
  if(g.r==='bad' && ss.ch==='sudden') ss.q=ss.q.slice(0, ss.i+1);
  exportCache=null; save(); render();
  if(g.r==='bad'){ $('.card')?.classList.add('shake'); buzz([30,40,30]); } else buzz(12);
  setTimeout(()=>$('#next')?.focus(), 50);
}
// The "Check" button and Enter: reads the answer the way each kind of exercise holds it
function submitCurrent(){
  const ex=current?.ex; if(!ex || current.checked) return;
  if(ex.kind==='multi') check([...document.querySelectorAll('input.mf')].map(i=>i.value));
  else if(ex.kind==='order') check(current.ui.order.map(i=>ex.tiles[i]));
  else if(ex.kind==='tap') check({ tok:current.ui.tok, fix:$('#ans')?.value||'' });
  else check($('#ans')?.value||'');
}
function gotIt(){ const ss=S.session; if(!ss || !current) return; const ex=current.ex;
  const s=S.units[ex.uid] || (S.units[ex.uid]=newUnitState(Date.now())); if(!s.introduced) s.introduced=Date.now(); next(); }
function next(){ const ss=S.session; if(!ss) return; ss.i++; current=null; if(ss.i>=ss.q.length) finishSession(ss); save(); render(); }
function finishSession(ss){
  if(ss.done) return;
  if(QUIZ_MODES.includes(ss.mode)) return finishQuiz(ss);
  ss.done=true; const d=today();
  if(ss.mode==='daily') d.ds=(d.ds||0)+1;
  if(ss.mode==='learn') d.ln=(d.ln||0)+1;
}
function keepGoing(){
  const ss=S.session; if(!ss) return;
  const used=new Set(ss.q.map(x=>x.uid)), more=buildDaily(10, { exclude:[...used] }); filledToast(more);
  if(!more.filter(isExercise).length){ toast(T('Nothing else to practise right now.','No queda nada más que practicar ahora.')); return; }
  ss.q=ss.q.concat(more); ss.done=false; current=null; save(); render();
}
// A session saved by v6 (a list of item ids) becomes exercises
function upgradeSession(){
  const ss=S.session; if(!ss || !ss.q || !ss.q.some(x=>typeof x==='string')) return;
  const done=ss.q.slice(0, ss.i).length, rest=ss.q.slice(ss.i).map(id=>{ const u=UNITS.get(uidOfItem(id)); return u ? genFor(u, { single:true }) : null; }).filter(Boolean);
  ss.q=[...ss.q.slice(0, ss.i).map(id=>({ uid:uidOfItem(id)||id, kind:'choice', format:'choose', lib:'voc', opts:[], ans:0, old:true })), ...rest];
  ss.i=done; ss.answered=-1; ss.results=(ss.results||[]).map(r=>Object.assign({ uid:uidOfItem(r.id) }, r));
}

/* ---------- Session screen ---------- */
function exercisePos(ss){ let n=0, at=0; ss.q.forEach((x,k)=>{ if(isExercise(x)){ if(k<ss.i) at++; n++; } }); return { at, n }; }
function trackHTML(ss, curRes){
  const exs=ss.q.map((x,k)=>({ x, k })).filter(o=>isExercise(o.x)), pos=exercisePos(ss), n=exs.length, to=n>1 ? Math.min(1, pos.at/(n-1)) : 1;
  let ri=0; const res=exs.map(o=>o.k<ss.i ? ss.results[ri++]?.r : o.k===ss.i ? curRes : null);
  const dots=exs.map((o,j)=>`<i class="${o.k===ss.i&&!curRes?'cur':''} ${res[j]||''}"></i>`).join('');
  const html=`<div class="track" aria-hidden="true"><div class="leg" data-to="${to}" style="transform:scaleX(${trackPos})"></div>${dots}</div>`;
  trackPos=to; return html;
}
function newCurrent(ss){ const ex=ss.q[ss.i]; return { idx:ss.i, ex, start:Date.now(), checked:false, result:null, answer:null, showHint:false, ui:{ pairs:{}, sel:null, order:[], tok:null, text:'', model:false, flip:false } }; }
function renderSession(){
  const ss=S.session;
  if(!ss) return renderHome();
  if(!current && ss.answered===ss.i) ss.i++;
  if(ss.i>=ss.q.length){ if(!ss.done) finishSession(ss); return renderSummary(); }
  const ex=ss.q[ss.i];
  if(!ex || ex.old){ ss.q.splice(ss.i,1); save(); return renderSession(); }
  if(!current || current.idx!==ss.i || current.ex!==ex) current=newCurrent(ss);
  const endless=['speed','sudden'].includes(ss.ch), title=sessionTitle(ss), pos=exercisePos(ss), done=current.checked;
  const score=ss.results.filter(r=>r.r!=='bad').length;
  const top=`<div class="sess-top"><button class="icon-btn" data-act="quit" aria-label="${T('Exit','Salir')}">${ic('close')}</button>
      ${endless?`<b style="flex:1">${esc(title)}</b>`:trackHTML(ss, done?current.result:null)}
      ${ss.deadline?`<span class="timer" data-deadline="${ss.deadline}" data-kind="sess">${mmss(ss.deadline-Date.now())}</span>`:''}
      <span class="count">${endless?T(`${score} right`,`${score} bien`):`${Math.min(pos.at+1, pos.n)}/${pos.n}`}</span></div>
    ${title&&!endless?`<p class="small muted" style="margin:0 0 8px">${esc(title)}</p>`:''}`;
  if(ex.kind==='present') return top+presentHTML(ex);
  return top+exerciseHTML(ex, current, pos.at+1);
}
function cardHead(ex, n){ return `<div class="ch"><span class="n">${n}</span><span class="t">${esc(libName(ex.lib))} · ${esc(fmtName(ex.format))}</span><span class="lv">${esc(ex.level||'')}</span></div>`; }
function audioBtns(ex){ return ex.say ? `<div class="row" style="justify-content:center;margin:4px 0 12px"><button class="play" data-act="say" aria-label="${T('Listen','Escuchar')}">${ic('play')}</button><button class="btn ghost" data-act="sayslow">${T('More slowly','Más despacio')}</button></div>` : ''; }
function exerciseHTML(ex, cur, n){
  const done=cur.checked, res=cur.result, ui=cur.ui, ins=FMT[ex.format]?.ins;
  let body='', answer='', foot='';
  const hintOn=ex.hint && tx(ex.hint) && (ex.hintAlways || cur.showHint || ['gap_hint','particle','verbchoice'].includes(ex.format) || (ex.lib!=='voc' && ex.format==='gap') || ex.format==='three');
  const fillText = ex.kind==='text' && done ? (res==='ok' ? String(cur.answer).trim() : (ex.answers||[])[0]) : ex.kind==='choice' && done && String(ex.q||'').includes('___') ? optText(ex.opts[ex.ans]) : '';
  const fillCls = done ? (res==='bad' ? 'ok' : res) : '';
  const parts=[];
  if(ex.showExp && !done && tx(ex.exp)) parts.push(`<div class="panel note" style="margin:0 0 12px"><p class="small" style="margin:0;white-space:pre-line">${esc(tx(ex.exp))}</p></div>`);
  if(ins) parts.push(`<p class="instr" style="margin:0 0 10px">${esc(lab({ x:ins }, 'x'))}</p>`);
  if(ex.say) parts.push(audioBtns(ex));
  if(ex.pr) parts.push(`<p class="${ex.big?'sentence':'qprompt'}">${esc(tx(ex.pr))}</p>`);
  if(ex.es) parts.push(`<div lang="es"><div class="small muted" style="margin-bottom:6px">${T('In Spanish:','En español:')}</div><div class="es">${esc(ex.es)}</div></div>`);
  if(ex.from) parts.push(`<p class="kwfrom">${esc(ex.from)}</p><div class="base">${esc(ex.kw)}</div>`);
  if(ex.ctx) parts.push(`<p class="small muted" style="white-space:pre-line">${esc(ex.ctx)}</p>`);
  if(ex.q && ex.format!=='opencloze' && !(ex.hide && !done)){
    if(ex.q2) parts.push(`<div class="pair"><span class="bl">A</span><p class="sentence sm">${rich(ex.q)}</p></div><div class="pair"><span class="bl">B</span><p class="sentence sm">${rich(ex.q2)}</p></div>`);
    else if(ex.format==='three' || ex.format==='wfgrid') parts.push(`<p class="sentence big">${esc(ex.q)}</p>`);
    else parts.push(`<p class="sentence${ex.from?' sm':''}">${rich(ex.q, fillText, fillCls)}</p>`);
  }
  if(ex.format==='opencloze') parts.push(`<p class="sentence sm">${rich(ex.q)}</p>`);
  if(ex.base && ex.format!=='kwt') parts.push(`<div class="base">${esc(ex.base)}</div>`);
  if(hintOn) parts.push(`<div class="hint" ${LANG==='en'&&!(ex.hint.en)?'lang="es"':''}>${esc(tx(ex.hint))}</div>`);
  if(ex.kind==='tap'){ const t=ui.tok;
    parts.push(`<div class="toks">${ex.toks.map((w,i)=>{ let c=''; if(done){ if(ex.bad.includes(i)) c='bad'; else if(i===t) c='miss'; } else if(i===t) c='sel';
      return `<button class="tk ${c}" data-tok="${i}" ${done||(t!=null&&ex.bad.includes(t))?'disabled':''}>${esc(w)}</button>`; }).join('')}</div>`);
    if(done) parts.push(`<p class="small ok-t" style="margin-top:10px">✓ ${esc(ex.show)}</p>`); }
  if(ex.kind==='flash'){
    parts.push(`<p class="sentence">${rich(ex.front)}</p>`);
    if(ui.flip || done) parts.push(flashBack(ex)); }
  body=`<div class="card sheet">${cardHead(ex, n)}<div class="cb">${parts.join('')}</div></div>`;

  if(ex.kind==='choice'){
    const long=ex.opts.some(o=>optText(o).length>40);
    answer=`<div class="opts">${ex.opts.map((o,i)=>{ let c=''; if(done){ if(i===ex.ans) c='ok'; else if(i===+cur.answer) c='bad'; }
      return `<button class="opt ${c} ${long?'sm':''}" data-opt="${i}" ${done?'disabled':''}><span class="ol">${'ABCDEF'[i]}</span><span class="ot">${esc(optText(o))}</span></button>`; }).join('')}</div>`;
  }
  if(ex.kind==='match'){
    const pairNo={}; Object.keys(ui.pairs).forEach((l,k)=>pairNo[l]=k+1);
    // After checking, colour each meaning by what was really chosen for it (the right pair wins if two pointed at it)
    const rightOf={}; for(const [l,r] of Object.entries(done ? cur.answer||{} : ui.pairs)) if(!rightOf[r] || l===r) rightOf[r]=l;
    const L1=ex.pairs.map(p=>{ let c=ui.sel===p.uid?'sel':ui.pairs[p.uid]?'paired':''; if(done) c=cur.answer[p.uid]===p.uid?'ok':'bad';
      return `<button class="mb ${c}" data-ml="${esc(p.uid)}" ${done?'disabled':''}>${ui.pairs[p.uid]&&!done?`<i>${pairNo[p.uid]}</i>`:''}${esc(p.l)}</button>`; }).join('');
    const R1=ex.rorder.map(uid=>{ const p=ex.pairs.find(x=>x.uid===uid), l=rightOf[uid]; let c=l?'paired':''; if(done) c=cur.answer[rightOf[uid]]===uid?'ok':'bad';
      return `<button class="mb r ${c}" data-mr="${esc(uid)}" ${done?'disabled':''}>${l&&!done?`<i>${pairNo[l]}</i>`:''}${esc(optText(p.r))}</button>`; }).join('');
    answer=`<div class="match"><div>${L1}</div><div>${R1}</div></div>`;
    if(done) answer+=`<table class="cd" style="margin-top:10px"><tbody>${ex.pairs.map(p=>`<tr><td><b>${esc(p.l)}</b></td><td class="small">${esc(optText(p.r))}</td></tr>`).join('')}</tbody></table>`;
  }
  if(ex.kind==='order'){
    const used=new Set(ui.order);
    answer=`<div class="built ${done?res:''}">${ui.order.length?ui.order.map((ti,k)=>`<button class="tile on" data-untile="${k}" ${done?'disabled':''}>${esc(ex.tiles[ti])}</button>`).join(''):`<span class="small muted">${T('Tap the words below','Toca las palabras de abajo')}</span>`}</div>
      <div class="tiles">${ex.tiles.map((w,i)=>`<button class="tile" data-tile="${i}" ${used.has(i)||done?'disabled':''}>${esc(w)}</button>`).join('')}</div>`;
    if(done && res!=='ok') answer+=`<p class="small ok-t">✓ ${esc(ex.sol.join(' '))}</p>`;
  }
  if(ex.kind==='multi'){
    answer=`<div class="mfields">${ex.fields.map((f,i)=>{ const r=done?cur.grade.fields[i]:''; return `<label class="mfr"><span>${esc(tx(f.lab))}</span><input class="field mf ${r}" data-f="${i}" value="${esc(done?(cur.answer[i]||''):'')}" ${done?'disabled':''} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">${done&&r!=='ok'?`<span class="small ok-t">${esc(f.answers.join(' / '))}</span>`:''}</label>`; }).join('')}</div>`;
  }

  if(!done){
    if(ex.kind==='text' || (ex.kind==='tap' && ui.tok!=null && ex.bad.includes(ui.tok) && ex.fix)){
      const ph = ex.kind==='tap' ? T('Write the correction','Escribe la corrección') : ex.format==='dictation' ? T('Write what you hear','Escribe lo que oyes') : T('Your answer','Tu respuesta');
      foot=`<input id="ans" class="field" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${ph}" aria-label="${ph}">
        <div class="actions"><button class="btn primary block" data-act="check">${T('Check','Comprobar')}</button>
        <div class="row">${ex.kind==='text'&&ex.hint&&tx(ex.hint)&&!hintOn?`<button class="btn ghost" data-act="hint">${T('Hint','Pista')}</button>`:''}<button class="btn ghost" data-act="dunno" style="margin-left:auto">${T("I don't know",'No lo sé')}</button></div></div>`;
    } else if(ex.kind==='multi' || ex.kind==='order'){
      foot=`<div class="actions"><button class="btn primary block" data-act="check" ${ex.kind==='order'&&!ui.order.length?'disabled':''}>${T('Check','Comprobar')}</button><button class="btn ghost" data-act="dunno">${T("I don't know",'No lo sé')}</button></div>`;
    } else if(ex.kind==='self'){
      foot = ui.model
        ? `<div class="panel" style="margin-bottom:10px"><b>${T('Your sentence','Tu frase')}</b><p style="margin:4px 0 10px">${esc(ui.text)||T('(blank)','(en blanco)')}</p><b>${T('Model','Modelo')}</b>${ex.model.map(m=>`<p class="small" style="margin:4px 0">${esc(m)}</p>`).join('')}</div>
           <p class="small muted">${T('Is your sentence correct and does it use the expression in the same way?','¿Tu frase es correcta y usa la expresión de la misma forma?')}</p>
           <div class="grid2"><button class="btn primary" data-self="ok">${T('Yes, correct','Sí, correcta')}</button><button class="btn" data-self="bad">${T('Not quite','No del todo')}</button></div>`
        : `<textarea id="ans" class="field" style="min-height:110px" placeholder="${ex.start?esc(ex.start):T('Your sentence','Tu frase')}" spellcheck="false">${esc(ui.text)}</textarea>
           <div class="actions"><button class="btn primary block" data-act="showmodel">${T('Compare with the model','Comparar con el modelo')}</button></div>
           <p class="small muted">${T('Your sentences go in your export, so Claude can correct them.','Tus frases van en la exportación para que Claude las corrija.')}</p>`;
    } else if(ex.kind==='flash'){
      foot = ui.flip
        ? `<div class="grid4"><button class="btn" data-flash="again">${T('Again','Otra vez')}</button><button class="btn" data-flash="hard">${T('Hard','Difícil')}</button><button class="btn" data-flash="good">${T('Good','Bien')}</button><button class="btn" data-flash="easy">${T('Easy','Fácil')}</button></div>`
        : `<button class="btn primary block big" data-act="flip">${T('Show answer','Ver respuesta')}</button>`;
    }
  } else {
    const title = res==='ok' ? T('Correct','Correcto') : res==='near' ? (ex.kind==='tap' ? T('You found it: check the correction','Lo has encontrado: revisa la corrección') : ex.kind==='match' ? T('Almost: one pair is wrong','Casi: una pareja está mal') : T('Almost: check the spelling','Casi: revisa la ortografía')) : T('Not quite','No es correcto');
    const rows=[], correct=correctOfEx(ex), exp=tx(ex.exp);
    if(res!=='ok' && !['match','multi','order','tap','self','flash'].includes(ex.kind)) rows.push(`<tr><td class="k">${T('Answer','Respuesta')}</td><td class="ans">${esc(correct)}</td></tr>`);
    if(res==='bad' && ex.kind==='text' && ex.format!=='dictation') rows.push(`<tr><td class="k">${T('Yours','La tuya')}</td><td>${esc(cur.answer)||T('(blank)','(en blanco)')}</td></tr>`);
    if(exp) rows.push(`<tr><td class="k">${T('Why','Por qué')}</td><td class="small" style="white-space:pre-line">${esc(exp)}</td></tr>`);
    const listen=ex.show||correct;
    const u=UNITS.get(ex.uid);
    foot=`<div class="verdict ${res}"><span class="mk">${ic(res==='bad'?'x':'check')}</span><h3>${title}</h3>
        <span class="row" style="margin-left:auto;gap:6px">${listen?`<button class="icon-btn sm" data-say="${esc(plain(listen))}" aria-label="${T('Listen','Escuchar')}">${ic('speaker','sm')}</button>`:''}${u?saveBtn(u.uid, unitName(u), 'sm'):''}</span></div>
      ${rows.length?`<div class="fbt"><table class="cd"><tbody>${rows.join('')}</tbody></table></div>`:''}
      ${ex.lib!=='voc'&&ex.lib!=='gr'&&UNITS.has(ex.uid)?`<button class="btn ghost block" data-unit="${esc(ex.uid)}">${T('See the card','Ver la ficha')}</button>`:''}
      <button class="btn primary block big" id="next" data-act="next">${T('Next','Siguiente')} ${ic('go')}</button>`;
  }
  return `${body}${answer}<div class="foot">${foot}</div>`;
}
function flashBack(ex){ const c=ex.card;
  return `<div class="flashback"><p><b>${esc(c.term)}</b></p><p>${meanHTML(c.mean)}</p>${c.lines.map(l=>`<p class="small muted">${esc(tx(l))}</p>`).join('')}
    ${(c.ex||[]).slice(0,1).map(e=>`<ul class="exs"><li><button class="icon-btn sm" data-say="${esc(plain(e))}" aria-label="${T('Listen','Escuchar')}">${ic('play','sm')}</button><span>${hlEx(e)}</span></li></ul>`).join('')}</div>`; }
function cardBody(c, u){
  const mean=meanHTML(c.mean);
  return `<div class="pvv">${esc(c.term)}</div>
    ${mean?`<div class="pves">${mean}${LANG==='en'&&c.mean.es&&c.mean.en&&c.mean.es!==c.mean.en?`<span class="small muted"> · ES: ${esc(c.mean.es)}</span>`:''}</div>`:''}
    ${c.lines.map(l=>`<p class="small" style="margin:4px 0">${esc(tx(l))}</p>`).join('')}
    ${(c.ex||[]).length?`<ul class="exs" style="margin-top:10px">${c.ex.map(e=>`<li><button class="icon-btn sm" data-say="${esc(plain(e))}" aria-label="${T('Listen','Escuchar')}">${ic('play','sm')}</button><span>${hlEx(e)}</span></li>`).join('')}</ul>`:''}
    ${c.wrong?`<div class="wrongbox"><div class="ans-row bad-t">${ic('x','sm')}<span class="struck">${esc(c.wrong.bad)}</span></div><div class="ans-row ok-t">${ic('check','sm')}<b>${esc(c.wrong.good)}</b></div></div>`:''}`;
}
function presentHTML(ex){
  return `<div class="card"><div class="small muted" style="margin-bottom:8px;font-family:var(--cond);font-weight:700;letter-spacing:.06em;text-transform:uppercase">${T('New','Nuevo')} · ${esc(libName(ex.lib))}</div>${cardBody(ex.card)}</div>
    <div class="foot"><button class="btn primary block big" data-act="gotit">${T('Got it','Entendido')} ${ic('go')}</button></div>`;
}
function renderSummary(){
  const ss=S.session;
  if(QUIZ_MODES.includes(ss.mode)) return quizSummaryHTML(ss);
  const first={}; for(const r of ss.results) if(!(r.uid in first)) first[r.uid]=r.r;
  const ids=Object.keys(first), ok=ids.filter(id=>first[id]!=='bad').length;
  const failed=ids.filter(id=>first[id]==='bad').map(id=>UNITS.get(id)).filter(Boolean);
  const dots=ss.results.map(r=>`<i class="${r.r}"></i>`).join('');
  trackPos=0;
  const rid=ss.routeId && routeById(ss.routeId) ? esc(ss.routeId) : '';
  const again = rid ? `data-routego="${ss.mode==='route'?'practise':ss.mode==='flash'?'flash':'learn'}" data-rid="${rid}"` : ss.mode==='learn' ? `data-act="learnmore"` : ss.mode==='practise' ? `data-practise="${esc(ss.uids[0])}"` : ss.mode==='flash' ? `data-flashlib="${esc(ss.lib)}"` : 'data-act="again"';
  const introduced=ss.mode==='learn' ? (ss.uids||[]).map(id=>UNITS.get(id)).filter(Boolean) : [];
  return `<div class="sess-top"><button class="icon-btn" data-act="finish" aria-label="${T('Back to home','Volver al inicio')}">${ic('close')}</button>
      <div class="track" aria-hidden="true"><div class="leg" data-to="1" style="transform:scaleX(0)"></div>${dots}</div><span class="count">${T('Finish','Meta')}</span></div>
    <h1>${ss.mode==='learn'?T('Learnt today','Aprendido hoy'):T('Session complete','Sesión terminada')}</h1>
    <div class="score"><b>${ok}/${ids.length}</b><span>${T('right first time','a la primera')}</span></div>
    ${introduced.length?`<p class="muted">${T(`First review of these ${introduced.length}: tomorrow. They will come back in your daily practice.`,`Primer repaso de estos ${introduced.length}: mañana. Volverán en tu práctica diaria.`)}</p><ul class="list">${introduced.map(u=>unitRow(u)).join('')}</ul>`:''}
    ${failed.length?`<h2>${T('To review','Para repasar')}</h2><ul class="list">${failed.map(u=>unitRow(u)).join('')}</ul>`:ss.mode!=='learn'?`<p class="muted">${T('A clean run: every control punched first time.','Recorrido limpio: todos los controles a la primera.')}</p>`:''}
    <div class="foot"><div class="actions">
      ${ss.mode==='daily'||ss.mode==='extra'?`<button class="btn primary big block" data-act="keepgoing">${T('Keep going (10 more)','Seguir (10 más)')} ${ic('go')}</button>`:''}
      ${failed.length&&ss.mode!=='learn'?`<button class="btn block" data-act="learnfailed">${T('Learn these','Aprender estos')}</button>`:''}
      <button class="btn ${ss.mode==='daily'||ss.mode==='extra'?'':'primary big'} block" ${again}>${ss.mode==='learn'?T('Learn more','Aprender más'):T('Another session','Otra sesión')}</button>
      ${rid?`<button class="btn block" data-route="${rid}">${T('Back to the route','Volver a la ruta')}</button>`:''}
      <button class="btn ghost block" data-act="finish">${T('Back to home','Volver al inicio')}</button></div></div>`;
}

/* ---------- Unit rows, libraries and unit cards ---------- */
function stageChip(uid){ const s=stageOf(uid); return `<span class="stg s${s}">${esc(lab({ x:STAGE_L[s] }, 'x'))}</span>`; }
// o.save: a bookmark beside the row; o.pick: a Set, and the row becomes a checkbox (selecting several)
function unitRow(u, o={}){ const m=meanHTML(meaningOf(u), 90), txt=`<span class="rt"><b>${esc(unitName(u))}</b>${m?`<span class="small muted">${m}</span>`:''}</span>`;
  if(o.pick) return `<li><button class="rowbtn" role="checkbox" aria-checked="${o.pick.has(u.uid)}" data-lpick="${esc(u.uid)}"><span class="cbx" aria-hidden="true">${ic('check','sm')}</span>${txt}${stageChip(u.uid)}</button></li>`;
  const row=`<button class="rowbtn" data-unit="${esc(u.uid)}">${txt}${!o.save&&inRoutes(u.uid)?`<span class="star" aria-label="${T('In a route','En una ruta')}">★</span>`:''}${stageChip(u.uid)}</button>`;
  return o.save ? `<li class="urow">${row}${saveBtn(u.uid, unitName(u), 'sm')}</li>` : `<li>${row}</li>`; }
function libStages(lib){ const c=[0,0,0,0,0,0]; for(const u of BYLIB[lib]||[]){ const s=S.units[u.uid]; c[s&&s.seen?s.stage:0]++; } return c; }
function stageSummary(lib){ const c=libStages(lib), known=c[3]+c[4]+c[5], learning=c[1]+c[2];
  return T(`${known} Known · ${learning} Learning · ${c[0]} New`,`${known} conocidas · ${learning} aprendiendo · ${c[0]} nuevas`); }
function stageBar(c){ const tot=c.reduce((a,b)=>a+b,0)||1;
  return `<div class="stbar" role="img" aria-label="${c.map((n,i)=>`${lab({ x:STAGE_L[i] }, 'x')} ${n}`).join(', ')}">${c.map((n,i)=>n?`<div class="s${i}" style="width:${n/tot*100}%"></div>`:'').join('')}</div>`; }
const THEME_KEY = { pv:'theme', cn:'fn', col:'theme', irr:'group', tr:'structure', wf:null };
function themeLabel(lib, t){
  if(lib==='pv') return themeName(t);
  if(lib==='cn') return lab(FN_L, t);
  if(lib==='col') return lab(COLT_L, t);
  return t;
}
const FN_L = { add:['Adding','Añadir'], contrast:['Contrast','Contraste'], reason:['Reason','Causa'], result:['Result','Consecuencia'], purpose:['Purpose','Finalidad'], example:['Examples','Ejemplos'],
  sequence:['Sequence','Secuencia'], opinion:['Opinion','Opinión'], conclusion:['Conclusion','Conclusión'], condition:['Condition','Condición'], time:['Time','Tiempo'] };
const COLT_L = { daily:['Daily life','Día a día'], study:['Studies','Estudios'], work:['Work','Trabajo'], social:['Social life','Vida social'], health:['Health','Salud'], money:['Money','Dinero'],
  travel:['Travel','Viajes'], communication:['Communication','Comunicación'], freetime:['Free time','Tiempo libre'], feelings:['Feelings','Emociones'] };
let libRef='pv', libFilter='', libQuery='', libSort='az', unitRef=null, unitBack='library', libSel=null;
function libListUnits(){
  const q=lc(libQuery), [fk,fv]=libFilter.split(/:(.*)/s);
  let arr=(BYLIB[libRef]||[]).filter(u=>{
    if(q && ![unitName(u), u.es, u.en, ...(Array.isArray(u.ex)?u.ex:Object.values(u.ex||{}))].join(' ').toLowerCase().includes(q)) return false;
    if(fk==='state'){ const s=S.units[u.uid], st=s&&s.seen?s.stage:0; return fv==='list' ? inRoutes(u.uid) : String(st)===fv; }
    if(fk==='theme') return u.theme===fv;
    if(fk==='level') return u.level===fv;
    return true; });
  const st=u=>S.units[u.uid]||{};
  if(libSort==='az') arr.sort((a,b)=>unitName(a).localeCompare(unitName(b)));
  if(libSort==='failed') arr.sort((a,b)=>(st(b).lapses||0)-(st(a).lapses||0) || unitName(a).localeCompare(unitName(b)));
  if(libSort==='seen') arr.sort((a,b)=>(st(a).seen||0)-(st(b).seen||0) || (st(a).lastSeen||0)-(st(b).lastSeen||0));
  if(libSort==='new') arr.sort((a,b)=>((st(a).seen?1:0)-(st(b).seen?1:0)) || unitName(a).localeCompare(unitName(b)));
  return arr;
}
function libListHTML(){ const arr=libListUnits(); if(!arr.length) return `<p class="muted">${T('Nothing matches that filter.','Nada con ese filtro.')}</p>`;
  return `<ul class="list">${arr.slice(0,250).map(u=>unitRow(u, libSel ? { pick:libSel } : { save:true })).join('')}</ul>`; }
function renderLibrary(){
  const lib=libRef, tk=THEME_KEY[lib], themes=tk?[...new Set(BYLIB[lib].map(u=>u.theme))]:[];
  const chip=(v,l)=>`<button data-lfilter="${esc(v)}" aria-pressed="${libFilter===v}">${esc(l)}</button>`;
  const levels=[...new Set(BYLIB[lib].map(u=>u.level))];
  return `${backBar(libName(lib),'study')}
    ${stageBar(libStages(lib))}<p class="small muted" style="margin:6px 0 12px">${esc(stageSummary(lib))}</p>
    <div class="grid3"><button class="btn primary" data-learnlib="${lib}">${T('Learn new','Aprender')}</button><button class="btn" data-flashlib="${lib}">${T('Flashcards','Tarjetas')}</button><button class="btn" data-libtest="${lib}">Test</button></div>
    <input class="field" id="libq" placeholder="${T('Search (English or Spanish)','Buscar (inglés o español)')}" value="${esc(libQuery)}" autocomplete="off" autocapitalize="off" style="margin-top:12px">
    <div class="chips">${chip('',T('All','Todos'))}${[0,1,2,3,4,5].map(s=>chip('state:'+s, lab({ x:STAGE_L[s] }, 'x'))).join('')}${chip('state:list',T('In my routes','En mis rutas'))}</div>
    ${themes.length>1||levels.length>1?`<div class="chips">${levels.length>1?levels.map(l=>chip('level:'+l, l)).join(''):''}${themes.length>1?themes.map(t=>chip('theme:'+t, themeLabel(lib,t))).join(''):''}</div>`:''}
    <div class="row spread" style="margin:4px 0 10px;align-items:flex-start"><div class="seg" role="group">${[['az','A–Z'],['failed',T('Most failed','Más falladas')],['seen',T('Least seen','Menos vistas')],['new',T('New first','Nuevas')]].map(([v,l])=>`<button data-lsort="${v}" aria-pressed="${libSort===v}">${l}</button>`).join('')}</div>
      <button class="btn ghost" data-act="libsel" aria-pressed="${!!libSel}">${libSel?T('Cancel','Cancelar'):T('Select','Seleccionar')}</button></div>
    <div id="liblist">${libListHTML()}</div>
    ${libSel?`<div class="go"><button class="btn primary block" data-act="libselsave" ${libSel.size?'':'disabled'}>${ic('bookmark','sm')} ${T(`Save selected to… (${libSel.size})`,`Guardar seleccionados en… (${libSel.size})`)}</button></div>`:''}`;
}
function unitData(u){
  const s=S.units[u.uid], atts=S.attempts.filter(a=>a.u===u.uid || (!a.u && uidOfItem(a.id)===u.uid));
  const byF={}; for(const a of atts){ const f=a.f||inferFormat(a)||'?'; (byF[f]||(byF[f]={ n:0, ok:0 })); byF[f].n++; if(a.r!=='bad') byF[f].ok++; }
  const resIc=r=>`<span class="${r==='bad'?'bad-t':r==='near'?'':'ok-t'}">${ic(r==='bad'?'x':'check','sm')}</span>`;
  return `<h2>${T('Your data','Tus datos')}</h2>
    <table class="cd"><tbody>
      <tr><td class="k">${T('Stage','Etapa')}</td><td>${stageChip(u.uid)}</td></tr>
      <tr><td class="k">${T('Seen','Vista')}</td><td>${s?.seen||0} · ${s&&s.seen?Math.round(s.correct/s.seen*100)+'%':'–'} ${T('right','de acierto')}</td></tr>
      <tr><td class="k">${T('Next review','Próximo repaso')}</td><td>${s&&s.seen?(s.due<=Date.now()?T('Due now','Ya toca'):esc(fmtDate(s.due))):T('Not started','Sin empezar')}</td></tr>
      ${s&&s.seen?`<tr><td class="k">${T('By skill','Por habilidad')}</td><td class="small">${SKILLS.filter(k=>s.bySkill[k]).map(k=>`${lab(SKILL_L,k)} ${s.bySkill[k].ok}/${s.bySkill[k].n}`).join(' · ')||'–'}</td></tr>`:''}
      ${Object.keys(byF).length?`<tr><td class="k">${T('By format','Por formato')}</td><td class="small">${Object.entries(byF).map(([f,v])=>`${esc(fmtName(f))} ${Math.round(v.ok/v.n*100)}%`).join(' · ')}</td></tr>`:''}
    </tbody></table>
    ${atts.length?`<table class="cd hist" style="margin-top:10px"><tbody>${atts.slice(-6).reverse().map(a=>`<tr><td>${resIc(a.r)}</td><td><div class="small">${esc(a.a)||T('(blank)','(en blanco)')}</div><div class="small muted">${esc(fmtDate(a.t))} · ${esc(fmtName(a.f||inferFormat(a)))}</div></td></tr>`).join('')}</tbody></table>`:''}`;
}
function renderUnit(){
  const u=UNITS.get(unitRef); if(!u) return renderStudy();
  const c=cardOf(u), chips=[u.level, u.register, u.lib==='cn'?lab(FN_L,u.fn):'', u.lib==='pv'&&u.sep?T('separable','separable'):'', u.lib==='irr'?u.group:'', u.lib==='tr'?u.structure:''].filter(Boolean);
  const conf=(u.confuseWith||[]).map(t=>UNITS.get(u.lib+':'+t)).filter(Boolean);
  let extra='';
  if(u.lib==='irr') extra=`<table class="cd" style="margin-top:12px"><tbody><tr><td class="k">${T('Infinitive','Infinitivo')}</td><td><b>${esc(u.term)}</b></td></tr><tr><td class="k">${T('Past simple','Pasado')}</td><td>${esc(u.p.join(' / '))}</td></tr><tr><td class="k">${T('Past participle','Participio')}</td><td>${esc(u.pp.join(' / '))}</td></tr></tbody></table>`;
  if(u.lib==='wf') extra=`<table class="cd" style="margin-top:12px"><tbody>${Object.entries(u.forms).map(([k,f])=>`<tr><td class="k">${esc(k)}</td><td><b>${esc(f)}</b>${u.alts[k]?` / ${esc(u.alts[k].join(' / '))}`:''}</td></tr>`).join('')}</tbody></table>`;
  if(u.lib==='tr') extra=`<div class="panel" style="margin-top:12px"><p>${esc(u.from)}</p><div class="base">${esc(u.key)}</div><p style="margin-top:10px">${rich(u.to, u.answers[0], 'ok')}</p><p class="small muted">${esc(u.answers.join(' / '))}</p></div>`;
  const inR=routesWith(u.uid).length;
  return `${backBar(unitName(u), unitBack, saveBtn(u.uid, unitName(u)))}
    <div class="pv">${cardBody(c, u)}${chips.length?`<div class="row wrap" style="margin-top:10px">${chips.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`:''}</div>
    ${extra}
    ${conf.length?`<h2>${T("Don't confuse with",'No confundir con')}</h2><ul class="list">${conf.map(unitRow).join('')}</ul>`:''}
    ${unitData(u)}
    <div class="actions" style="margin-top:16px"><button class="btn primary block" data-practise="${esc(u.uid)}">${T('Practise this one','Practicar este')} ${ic('go')}</button>
      <button class="btn block" data-save="${esc(u.uid)}">${ic(inR?'bookmarkf':'bookmark','sm')} ${inR?T(`In ${inR} ${inR===1?'route':'routes'}: change`,`En ${inR} ${inR===1?'ruta':'rutas'}: cambiar`):T('Save to a route','Guardar en una ruta')}</button></div>`;
}

/* ---------- Learn new ---------- */
let learnCfg={ lib:'', theme:'', n:5 };
function renderLearn(){
  const lib=learnCfg.lib, themes=lib && THEME_KEY[lib] ? [...new Set(BYLIB[lib].filter(u=>!S.units[u.uid]?.seen).map(u=>u.theme))] : [];
  const left=newLeftToday();
  return `${backBar(T('Learn new','Aprender nuevos'),'study')}
    <p class="muted">${T('Each item is presented first (meaning, examples, typical mistake). Then you practise them mixed: meaning, then use, then writing.','Primero se presenta cada elemento (significado, ejemplos, error típico). Después los practicas mezclados: significado, uso y escritura.')}</p>
    ${left===0?`<div class="panel note"><p class="small" style="margin:0">${T(`You've reached today's ${S.settings.newItems} new items. You can learn more, but reviewing is what makes them stick.`,`Ya has llegado a los ${S.settings.newItems} nuevos de hoy. Puedes aprender más, pero lo que los fija es repasarlos.`)}</p></div>`:''}
    <h3 class="sub">${T('What','Qué')}</h3>
    <div class="chips" style="flex-wrap:wrap">${[['',T('Let the app choose','Que elija la app')], ...STUDY_LIBS.map(l=>[l, libName(l)])].map(([v,l])=>`<button data-lrnlib="${v}" aria-pressed="${lib===v}">${esc(l)}</button>`).join('')}</div>
    ${themes.length>1?`<div class="chips" style="flex-wrap:wrap">${['',...themes].map(t=>`<button data-lrntheme="${esc(t)}" aria-pressed="${learnCfg.theme===t}">${esc(t?themeLabel(lib,t):T('Any theme','Cualquier tema'))}</button>`).join('')}</div>`:''}
    <h3 class="sub">${T('How many','Cuántos')}</h3>
    <div class="seg" role="group">${[3,5,8].map(n=>`<button data-lrnn="${n}" aria-pressed="${learnCfg.n===n}">${n}</button>`).join('')}</div>
    ${routedUids().size?`<p class="small muted" style="margin-top:10px">${T('What you saved in your routes goes first.','Lo que has guardado en tus rutas va primero.')}</p>`:''}
    <button class="btn primary block big" data-act="learnstart" style="margin-top:16px">${T('Start','Empezar')} ${ic('go')}</button>`;
}

/* ---------- Home ---------- */
function areaFresh(a){ return areaUnits(a).filter(u=>!S.units[u.uid]?.seen).length; }
function renderHome(){
  const c=counts(), ss=S.session, size=S.settings.dailySize||25, d=today();
  const pending=ss && ss.i<ss.q.length && !ss.done;
  const unread=S.messages.filter(m=>!m.read).slice(-1)[0];
  const since=S.attempts.filter(a=>a.t>S.lastExportAt).length + S.tests.filter(t=>t.at>S.lastExportAt).length*5;
  const daysSinceExport=S.lastExportAt ? Math.floor((Date.now()-S.lastExportAt)/DAY) : null;
  const sug=suggestTest();
  const dailyState = d.ds ? 'done' : 'open';
  const learnState = d.ln || (d.nw||0)>=(S.settings.newItems||10) ? 'done' : c.newAvail>0 ? 'open' : 'none';
  const testState = (d.t||0)>0 ? 'done' : 'open';
  const legs=[dailyState, learnState, testState], all=legs.every(x=>x!=='open') && activeDay(dayKey());
  let reach=0; for(const x of legs){ if(x==='open') break; reach++; }
  if(!legs.slice(0,reach).includes('done')) reach=0;
  const tick=st=>st==='done'?ic('check'):'';
  const course=`<div class="course">${legHTML(0, all?1:reach/4)}
      ${ctrlHTML({ cls:'start', mark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 21 19.5H3z" fill="none" stroke="var(--course)" stroke-width="3" stroke-linejoin="round"/></svg>', label:T('Start','Salida') })}
      ${ctrlHTML({ state:dailyState, num:1, mark:tick(dailyState), label:T('Practice','Práctica'), attr:dailyState==='open'?`data-act="${pending?'resume':'start'}"`:'' })}
      ${ctrlHTML({ state:learnState, num:2, mark:tick(learnState), label:learnState==='none'?T('None left','Sin nuevas'):T('Learn','Aprender'), attr:learnState==='open'?'data-act="learnauto"':'' })}
      ${ctrlHTML({ state:testState, num:3, mark:tick(testState), label:'Test', attr:testState==='open'?sug.attr:'' })}
      ${ctrlHTML({ cls:'finish', state:all?'done':'', label:T('Finish','Meta') })}</div>`;
  const table=`<table class="cd"><tbody>
      <tr><th>1</th><td class="sym"><i class="sw open"></i></td><td>${T('Reviews due','Repasos pendientes')}</td><td class="v">${c.due||'–'}</td></tr>
      <tr><th>2</th><td class="sym"><i class="sw open"></i></td><td>${T('New items today','Nuevos de hoy')}</td><td class="v">${c.newAvail||'–'}</td></tr>
      <tr><th>3</th><td class="sym">${ic('flag')}</td><td>${esc(sug.label)}</td><td class="v">${testState==='done'?ic('check','sm'):'Test'}</td></tr></tbody></table>`;
  let title, lead, go;
  if(pending){
    const p=exercisePos(ss);
    title=T('Session in progress','Sesión a medias'); lead=T(`You're on exercise ${p.at+1} of ${p.n}.`,`Vas por el ejercicio ${p.at+1} de ${p.n}.`);
    go=`<button class="btn primary big block" data-act="resume">${T('Continue','Continuar')} ${ic('go')}</button><button class="btn ghost block" data-act="discard">${T('Discard and start a new one','Descartar y empezar otra')}</button>`;
  } else if(dailyState==='open'){
    title=T("Today's course",'Recorrido de hoy'); lead=T(`Daily practice: ${size} exercises mixing every area. You can stop halfway whenever you like.`,`Práctica diaria: ${size} ejercicios de todas las áreas. Puedes dejarla a medias cuando quieras.`);
    go=`<button class="btn primary big block" data-act="start">${T('Go','Salir')} ${ic('go')}</button><button class="btn block" data-act="quick">${T('Quick session (10)','Sesión rápida de 10')}</button>`;
  } else if(learnState==='open'){
    title=T('Practice done','Práctica hecha'); lead=T('Next control: learn a few new items.','Siguiente control: aprende unos cuantos elementos nuevos.');
    go=`<button class="btn primary big block" data-act="learnauto">${T('Learn new','Aprender nuevos')} ${ic('go')}</button><button class="btn block" data-act="extra">${T('Keep practising','Seguir practicando')}</button>`;
  } else if(testState!=='done'){
    title=T('Almost there','Casi está'); lead=T("One control left: a short test closes today's course.",'Queda un control: un test corto cierra el recorrido de hoy.');
    go=`<button class="btn primary big block" ${sug.attr}>${T('Take the test','Hacer el test')} ${ic('go')}</button><button class="btn ghost block" data-act="extra">${T('Extra practice','Práctica extra')}</button>`;
  } else {
    title=T('Course complete','Recorrido completo'); lead=T('Reviews come back when they are due. Anything else today is a bonus.','Los repasos vuelven cuando toca. Lo que hagas hoy ya es extra.');
    go=`<button class="btn primary big block" data-act="extra">${T('Extra practice','Práctica extra')} ${ic('go')}</button><button class="btn block" data-act="mixed">${T('Mixed test','Test mixto')}</button>`;
  }
  const learnMore = learnState!=='open' && AREAS.some(a=>areaFresh(a)>0) ? `<button class="btn ghost block" data-act="learnauto">${T('Learn more today','Aprender más hoy')}</button>` : '';
  const shares=currentShares(), ar=d.ar||{};
  const areaRows=AREAS.filter(a=>shares[a]>0 && areaUnits(a).length).map(a=>{ const target=Math.max(1, Math.round(size*shares[a]/100)), n=ar[a]||0, fresh=areaFresh(a);
    return `<li><div class="row spread"><span>${esc(lab(AREA_L,a))}</span><span class="small muted">${n}/${target}</span></div><div class="meter"><div style="width:${Math.min(100, n/target*100)}%"></div></div>${fresh<20?`<div class="small muted">${T(`Only ${fresh} new left: ask Claude for a pack.`,`Solo quedan ${fresh} nuevos: pide un pack a Claude.`)}</div>`:''}</li>`; }).join('');
  const run=S.run, wm=S.wmock;
  return `${header()}
    <section class="today"><h1>${title}</h1><p class="lead">${lead}</p>${course}${table}<div class="go">${go}</div>${learnMore}</section>
    ${lessonHTML()}
    ${homeRoutesHTML()}
    ${unread?`<div class="panel note"><h3>${ic('mail')}${T('Note from Claude','Nota de Claude')}</h3><p style="white-space:pre-wrap">${esc(unread.text)}</p><button class="btn ghost" data-act="readmsg">${T('Mark as read','Marcar como leída')}</button></div>`:''}
    ${run?`<div class="panel note run"><h3>${ic('clock')}${esc(run.title)}: ${T('in progress','a medias')}</h3><button class="btn block" data-go="run">${T('Continue','Continuar')}</button></div>`:''}
    ${wm?`<div class="panel note run"><h3>${ic('clock')}${T('Writing mock exam in progress','Simulacro de Writing en curso')}</h3><button class="btn block" data-go="wmock">${T('Continue','Continuar')}</button></div>`:''}
    <h2>${T('Today by area','Hoy por áreas')}</h2><ul class="list">${areaRows}</ul>
    <h2>${T('Libraries','Librerías')}</h2><ul class="list">${STUDY_LIBS.map(l=>`<li><button class="rowbtn" data-lib="${l}"><span class="rt"><b>${esc(libName(l))}</b><span class="small muted">${esc(stageSummary(l))}</span></span>${ic('chev','sm')}</button></li>`).join('')}</ul>
    <h2>${T('This week','Esta semana')}</h2>${weekHTML()}
    <p class="small muted" style="margin-top:10px">${c.streak?T(`${c.streak}-day streak · ${c.learned} known · ${S.tests.length} tests`,`${c.streak} ${c.streak===1?'día':'días'} seguidos · ${c.learned} conocidas · ${S.tests.length} tests`):T(`${c.learned} known · ${S.tests.length} tests`,`${c.learned} conocidas · ${S.tests.length} tests`)}</p>
    <h2>${T('Challenges','Retos')}</h2>${challengesHTML(['daily','speed','sudden'])}
    <button class="btn ghost block" data-go="tests" style="margin-top:6px">${T('All challenges and the mixed test','Todos los retos y el test mixto')}</button>
    <h2>${T('Map legend','Leyenda')}</h2>
    <ul class="legend">
      <li><button data-go="study">${ic('book')}<span><b>${T('Study','Estudiar')}</b><span>${T('Libraries, grammar, flashcards and exam guides','Librerías, gramática, tarjetas y guías del examen')}</span></span>${ic('chev','sm')}</button></li>
      <li><button data-go="tests">${ic('flag')}<span><b>Tests</b><span>${T('Library tests, mixed tests, parts and timed mock exams','Tests por librería, mixtos, por partes y simulacros')}</span></span>${ic('chev','sm')}</button></li>
      <li><button data-go="writing">${ic('pen')}<span><b>${T('Write','Escribir')}</b><span>${T('Emails, articles and stories for Claude to mark','Emails, artículos e historias para que corrija Claude')}</span></span>${ic('chev','sm')}</button></li>
      <li><button data-go="progress">${ic('chart')}<span><b>${T('Progress','Progreso')}</b><span>${T('Stages, skills, formats and stuck items','Etapas, habilidades, formatos y atascos')}</span></span>${ic('chev','sm')}</button></li>
    </ul>
    ${since>=30 && (daysSinceExport===null || daysSinceExport>=7) ? `<div class="panel note" style="margin-top:14px"><h3>${ic('mail')}${T('Time for a review with Claude','Toca revisar con Claude')}</h3><p class="small">${T("You have a lot of activity that hasn't been exported. Copy your updates and paste them in the chat.",'Tienes bastante actividad sin exportar. Copia tus novedades y pégalas en el chat.')}</p><button class="btn block" data-go="data">${T('Go to export','Ir a exportar')}</button></div>`:''}`;
}
function counts(){
  const now=Date.now(); let due=0, learned=0, mastered=0, seen=0, total=0, fresh=0;
  for(const a of AREAS) for(const u of areaUnits(a)){ total++; const s=S.units[u.uid]; if(!s || !s.seen){ fresh++; continue; } seen++; if(s.due<=now) due++; if(s.stage>=3) learned++; if(s.stage>=5) mastered++; }
  return { due, unseen:total-seen, newAvail:Math.min(fresh, newLeftToday()), learned, mastered, total, streak:streak() };
}

/* ---------- Study tab: libraries block ---------- */
function librariesHTML(){
  return `<h2>${T('Libraries','Librerías')}</h2>
    <div class="grid2" style="margin-bottom:10px"><button class="btn primary" data-go="learn">${T('Learn new','Aprender nuevos')}</button><button class="btn" data-go="routes">${ic('bookmark','sm')} ${T('My routes','Mis rutas')} (${S.routes.length})</button></div>
    <ul class="list">${STUDY_LIBS.map(l=>`<li><button class="rowbtn" data-lib="${l}"><i class="sw ${l==='irr'||l==='pv'||l==='col'?'open':l==='cn'?'contour':'thicket'}"></i><span class="rt">${esc(libName(l))} (${BYLIB[l].length})<span class="small muted">${esc(stageSummary(l))}</span></span>${ic('chev','sm')}</button></li>`).join('')}</ul>`;
}

/* ---------- Tests tab: library tests ---------- */
function libTestHTML(){
  const c=S.settings.libtest, themes=THEME_KEY[c.lib] ? [...new Set(BYLIB[c.lib].map(u=>u.theme))] : [];
  const seg=(key, vals, labels)=>`<div class="seg" role="group">${vals.map((v,i)=>`<button data-lt="${key}" data-val="${v}" aria-pressed="${String(c[key])===String(v)}">${labels[i]}</button>`).join('')}</div>`;
  const hist=S.tests.filter(t=>t.kind==='library' && t.ref===c.lib);
  return `<h2>${T('Library tests','Tests por librería')}</h2><p class="small muted">${T("Choose what to test and how. Items from your last two tests of that library don't come back while there are others.",'Elige qué y cómo. Lo que salió en tus dos últimos tests de esa librería no vuelve mientras haya otros.')}</p>
    <div class="panel stack">
      <div class="chips" style="flex-wrap:wrap;padding-top:0">${['pv','cn','col','irr','wf','tr'].map(l=>`<button data-lt="lib" data-val="${l}" aria-pressed="${c.lib===l}">${esc(libName(l))}</button>`).join('')}</div>
      <div><b>${T('Length','Longitud')}</b></div>${seg('n',[10,20,30],['10','20','30'])}
      <div><b>${T('Which ones','Cuáles')}</b></div>${seg('scope',['all','list','learning','weak','theme'],[T('All','Todos'),T('In my routes','En mis rutas'),T('Learning','Aprendiendo'),T('Most failed','Más fallados'),T('A theme','Un tema')])}
      ${c.scope==='theme'&&themes.length?`<div class="chips" style="flex-wrap:wrap">${themes.map(t=>`<button data-lt="theme" data-val="${esc(t)}" aria-pressed="${c.theme===t}">${esc(themeLabel(c.lib,t))}</button>`).join('')}</div>`:''}
      <div><b>${T('Mode','Modo')}</b></div>${seg('mode',['meaning','usage','mixed'],[T('Meaning','Significado'),T('Usage','Uso'),T('Mixed','Mixto')])}
      <button class="btn primary block" data-act="libtest">${T('Start test','Empezar test')} ${ic('go')}</button>
      ${hist.length?`<p class="small muted" style="margin:0">${T(`Last: ${hist[hist.length-1].score}/${hist[hist.length-1].max}`,`Último: ${hist[hist.length-1].score}/${hist[hist.length-1].max}`)}</p>`:''}</div>`;
}

/* ---------- Progress blocks ---------- */
function libsProgressHTML(){
  return `<h2>${T('Libraries by stage','Librerías por etapa')}</h2>
    <table class="cd"><tbody>${['voc','gr',...STUDY_LIBS].map(l=>{ const c=libStages(l); return `<tr data-lib="${STUDY_LIBS.includes(l)?l:''}"><td><b>${esc(libName(l))}</b>${stageBar(c)}<div class="small muted">${c.map((n,i)=>n?`${lab({ x:STAGE_L[i] }, 'x')} ${n}`:'').filter(Boolean).join(' · ')}</div></td></tr>`; }).join('')}</tbody></table>
    <div class="row wrap small muted stkey">${STAGE_L.map((s,i)=>`<span><i class="s${i}"></i>${esc(lab({ x:s }, 'x'))}</span>`).join('')}</div>`;
}
function accBy(keyFn, days=14){ const since=Date.now()-days*DAY, m={};
  for(const a of S.attempts){ if(a.t<since) continue; const k=keyFn(a); if(!k) continue; (m[k]||(m[k]={ n:0, ok:0 })); m[k].n++; if(a.r!=='bad') m[k].ok++; } return m; }
const skillOfAttempt = a => a.s || (FMT[a.f||inferFormat(a)]?.skill) || (['mcq'].includes(a.f||inferFormat(a)) ? 'recognise' : 'produce');
function skillsHTML(){
  const bs=accBy(skillOfAttempt), bf=accBy(a=>a.f||inferFormat(a));
  const meter=(name,v)=>`<li><div class="row spread"><span>${esc(name)}</span><span class="small muted">${T(`${Math.round(v.ok/v.n*100)}% of ${v.n}`,`${Math.round(v.ok/v.n*100)} % de ${v.n}`)}</span></div><div class="meter"><div style="width:${v.ok/v.n*100}%"></div></div></li>`;
  if(!Object.keys(bs).length) return '';
  return `<h2>${T('Accuracy by skill','Acierto por habilidad')}</h2><ul class="list">${SKILLS.filter(k=>bs[k]).map(k=>meter(lab(SKILL_L,k), bs[k])).join('')}</ul>
    <p class="small muted">${T('Last 14 days. Meaning and usage are understanding; production is writing it yourself. A big gap means you recognise it but cannot use it yet.','Últimos 14 días. Significado y uso son comprensión; producción es escribirlo tú. Mucha diferencia significa que lo reconoces pero aún no sabes usarlo.')}</p>
    <h2>${T('Accuracy by format','Acierto por formato')}</h2><ul class="list">${Object.entries(bf).sort((a,b)=>a[1].ok/a[1].n-b[1].ok/b[1].n).map(([f,v])=>meter(fmtName(f), v)).join('')}</ul>`;
}
function stuckUnits(){ const since=Date.now()-7*DAY, m=new Map();
  for(const a of S.attempts){ if(a.t<since || a.r!=='bad') continue; const u=unitOfAttempt(a); if(!u || !UNITS.has(u)) continue; const e=m.get(u)||{ uid:u, n:0, last:[] }; e.n++; e.last.push({ at:a.t, given:a.a, format:a.f }); m.set(u, e); }
  return [...m.values()].filter(e=>e.n>=3).sort((a,b)=>b.n-a.n); }
function stuckHTML(){ const st=stuckUnits(); if(!st.length) return '';
  return `<h2>${T('Stuck','Atascados')}</h2><p class="small muted">${T('Failed 3 times or more in the last week.','Fallados 3 veces o más en la última semana.')}</p><ul class="list">${st.slice(0,12).map(e=>unitRow(UNITS.get(e.uid))).join('')}</ul>`; }

/* ---------- Settings ---------- */
function mixSettingsHTML(){
  const p=S.settings.mixPreset||'balanced', sh=currentShares(), tot=AREAS.reduce((s,a)=>s+(sh[a]||0),0);
  return `<div style="margin-top:14px"><b>${T('Daily practice size','Tamaño de la práctica diaria')}</b></div>
    <div class="seg" role="group">${[15,25,40].map(v=>`<button data-set="dailySize" data-val="${v}" aria-pressed="${S.settings.dailySize===v}">${v}</button>`).join('')}</div>
    <div style="margin-top:14px"><b>${T('New items per day','Nuevos al día')}</b></div>
    <div class="seg" role="group">${[5,10,15,20,30].map(v=>`<button data-set="newItems" data-val="${v}" aria-pressed="${S.settings.newItems===v}">${v}</button>`).join('')}</div>
    <div style="margin-top:14px"><b>${T('Daily mix','Mezcla diaria')}</b></div>
    <div class="seg" role="group">${['balanced','exam','vocab'].map(k=>`<button data-preset="${k}" aria-pressed="${p===k}">${esc(lab(PRESET_L,k))}</button>`).join('')}${p==='custom'?`<button aria-pressed="true">${esc(lab(PRESET_L,'custom'))}</button>`:''}</div>
    <details style="margin-top:10px"><summary class="small">${T('Fine-tune by area','Ajuste fino por área')}</summary>
      <table class="cd" style="margin-top:8px"><tbody>${AREAS.map(a=>`<tr><td>${esc(lab(AREA_L,a))}</td><td class="v"><button class="btn ghost" data-share="${a}" data-d="-5" aria-label="−5">−</button> ${sh[a]||0}% <button class="btn ghost" data-share="${a}" data-d="5" aria-label="+5">+</button></td></tr>`).join('')}</tbody></table>
      <p class="small muted">${T(`Total ${tot}%. Areas are scaled to fill the session.`,`Total ${tot} %. Las áreas se ajustan para llenar la sesión.`)}</p></details>`;
}
