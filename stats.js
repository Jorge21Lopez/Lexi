'use strict';
/* Lexi v6: tracking (Progress) and the extra export data. Loaded before app.js: only definitions here. */

const MAX_ATTEMPT_MS=90e3, MAX_TEST_SEC=3*3600;
// Active minutes per day: time spent on each answer (capped, so a phone left open doesn't count) plus tests
function minutesByDay(atts=S.attempts, tests=S.tests){
  const m={};
  for(const a of atts){ const k=dayKey(a.t); m[k]=(m[k]||0)+Math.min(a.ms||0, MAX_ATTEMPT_MS)/60000; }
  for(const t of tests){ const k=dayKey(t.at); m[k]=(m[k]||0)+Math.min(t.durationSec||0, MAX_TEST_SEC)/60; }
  for(const k of Object.keys(m)) m[k]=Math.round(m[k]*10)/10;
  return m;
}
function accuracyByFormat(atts=S.attempts){
  const m={};
  for(const a of atts){ const f=inferFormat(a), g=FMT_GROUP[f]; if(!g) continue; (m[g]||(m[g]={ n:0, ok:0 })); m[g].n++; if(a.r!=='bad') m[g].ok++; }
  return m;
}
function leeches(){ return Object.entries(S.srs).filter(([,s])=>s.l>=4).sort((a,b)=>b[1].l-a[1].l).map(([id,s])=>{ const it=ITEMS.get(id); return { id, word:it?.word||null, cat:it?.cat||null, lapses:s.l }; }); }
const catName = c => CAT_L[c] ? lab(CAT_L, c) : SECTION_L[c] ? lab(SECTION_L, c) : c==='mock' ? T('Mock exams','Simulacros') : (c||'?');

/* ---------- Activity calendar ---------- */
function heatmapHTML(){
  // 8 weeks of active minutes as a vegetation-density tile: columns are weeks (Monday first), darker = more minutes that day
  const weeks=8, todayStart=startOfDay(Date.now()), dow=(new Date(todayStart).getDay()+6)%7, mins=minutesByDay();
  const start=todayStart-(dow+(weeks-1)*7)*DAY; let active=0, total=0;
  const day=(w,d)=>start+(w*7+d)*DAY+12*3600e3;
  const cells=['<span></span>'];
  for(let w=0;w<weeks;w++){ const t=day(w,0), m=new Date(t).getMonth(), prev=w?new Date(day(w-1,0)).getMonth():-1;
    cells.push(`<span class="mo">${m!==prev?esc(new Date(t).toLocaleDateString(LOCALE(),{month:'short'})):''}</span>`); }
  for(let d=0;d<7;d++){
    cells.push(`<span class="wd">${d%2===0?esc(new Date(day(0,d)).toLocaleDateString(LOCALE(),{weekday:'narrow'})):''}</span>`);
    for(let w=0;w<weeks;w++){ const t=day(w,d);
      if(t>Date.now()+DAY/2){ cells.push('<i class="fut"></i>'); continue; }
      const v=Math.round(mins[dayKey(t)]||0); if(v){ active++; total+=v; }
      cells.push(`<i class="${v===0?'':'h'+(v<5?1:v<15?2:v<30?3:4)}" title="${dayKey(t)}: ${v} min"></i>`); } }
  return `<div class="heat" role="img" aria-label="${T(`${active} active days and ${total} minutes in the last 8 weeks`,`${active} días activos y ${total} minutos en las últimas 8 semanas`)}">${cells.join('')}</div>
    <p class="small muted" style="margin-top:8px">${T(`${active} active days, ${total} minutes. Darker means more time that day (5, 15, 30 min).`,`${active} días activos, ${total} minutos. Más oscuro, más tiempo ese día (5, 15, 30 min).`)}</p>`;
}

/* ---------- Weekly accuracy by category: one small line per category (same scale, 0–100 %) ---------- */
function weekStarts(n){ const t0=startOfDay(Date.now()), dow=(new Date(t0).getDay()+6)%7, mon=t0-dow*DAY; return Array.from({ length:n }, (_,k)=>mon-(n-1-k)*7*DAY); }
function weeklyByCategory(weeks=8){
  const starts=weekStarts(weeks), from=starts[0], m={};
  for(const a of S.attempts){ if(a.t<from) continue; const it=ITEMS.get(a.id); if(!it) continue;
    const w=Math.min(weeks-1, Math.floor((a.t-from)/(7*DAY))), c=it.cat||'?';
    (m[c]||(m[c]=starts.map(()=>({ n:0, ok:0 }))))[w].n++; if(a.r!=='bad') m[c][w].ok++; }
  return { starts, cats:m };
}
function sparkSVG(points, label){
  // points: [{ x:0..1, y:0..100 | null, tip }]; a gap where a week has too few answers
  const W=150, Hh=36, px=x=>4+x*(W-8), py=y=>Hh-4-(y/100)*(Hh-8);
  const segs=[]; let cur=[];
  for(const p of points){ if(p.y===null){ if(cur.length) segs.push(cur); cur=[]; } else cur.push(p); }
  if(cur.length) segs.push(cur);
  const lines=segs.map(s=>s.length>1?`<polyline points="${s.map(p=>px(p.x).toFixed(1)+','+py(p.y).toFixed(1)).join(' ')}" fill="none" stroke="var(--course)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`:'').join('');
  const dots=points.filter(p=>p.y!==null).map(p=>`<circle cx="${px(p.x).toFixed(1)}" cy="${py(p.y).toFixed(1)}" r="3" fill="var(--course)" stroke="var(--surface)" stroke-width="1.5"><title>${esc(p.tip)}</title></circle>`).join('');
  return `<svg class="spark" viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" role="img" aria-label="${esc(label)}"><line x1="4" x2="${W-4}" y1="${py(50)}" y2="${py(50)}" stroke="var(--line)" stroke-dasharray="2 3"/>${lines}${dots}</svg>`;
}
function weeklyHTML(){
  const { starts, cats }=weeklyByCategory(8), MIN=3;
  const rows=Object.entries(cats).filter(([,ws])=>ws.reduce((s,w)=>s+w.n,0)>=5);
  if(!rows.length) return `<p class="small muted">${T('Answer a few more exercises to see how each category changes week by week.','Contesta unos cuantos ejercicios más para ver cómo evoluciona cada categoría semana a semana.')}</p>`;
  const wk=t=>new Date(t).toLocaleDateString(LOCALE(),{ day:'numeric', month:'short' });
  return `<table class="cd weekly"><tbody>${rows.map(([c,ws])=>{
      const pts=ws.map((w,k)=>({ x:k/(ws.length-1), y:w.n>=MIN?Math.round(w.ok/w.n*100):null, tip:`${T('Week of','Semana del')} ${wk(starts[k])}: ${w.n>=MIN?Math.round(w.ok/w.n*100)+'% · ':''}${w.ok}/${w.n}` }));
      const last=[...pts].reverse().find(p=>p.y!==null);
      const tbl=`${catName(c)}: ${pts.filter(p=>p.y!==null).map(p=>p.tip).join('; ')}`;
      return `<tr><td>${esc(catName(c))}</td><td class="sp">${sparkSVG(pts, tbl)}</td><td class="v">${last?last.y+'%':'–'}</td></tr>`; }).join('')}</tbody></table>
    <p class="small muted">${T(`Last 8 weeks, accuracy per week (dotted line = 50 %). Weeks with fewer than ${MIN} answers are left blank.`,`Últimas 8 semanas, acierto por semana (línea de puntos = 50 %). Las semanas con menos de ${MIN} respuestas quedan en blanco.`)}</p>`;
}
function formatHTML(){
  const m=accuracyByFormat(), keys=['choice','write','translate','dictation'].filter(k=>m[k]);
  if(!keys.length) return '';
  return `<h2>${T('Accuracy by format','Acierto por formato')}</h2><ul class="list">${keys.map(k=>`<li><div class="row spread"><span>${lab(FMTG_L,k)}</span><span class="small muted">${T(`${Math.round(acc(m[k])*100)}% of ${m[k].n}`,`${Math.round(acc(m[k])*100)} % de ${m[k].n}`)}</span></div><div class="meter"><div style="width:${acc(m[k])*100}%"></div></div></li>`).join('')}</ul>
    <p class="small muted">${T('Choosing is recognising; writing, translating and dictation are producing. A big gap means you know the word when you see it but cannot use it yet.','Elegir es reconocer; escribir, traducir y el dictado son producir. Mucha diferencia significa que reconoces la palabra pero aún no sabes usarla.')}</p>`;
}
/* ---------- Weak points ---------- */
function weakPoints(n=5){
  const w=weakStats(14), out=[];
  for(const [c,v] of Object.entries(w.cat)) if(v.n>=5 && c!=='grammar') out.push({ only:'cat:'+c, name:catName(c), kind:T('Type','Tipo'), a:acc(v), n:v.n });
  for(const [t,v] of Object.entries(w.topic)) if(v.n>=5) out.push({ only:'topic:'+t, name:lab(TOPIC_L,t), kind:T('Topic','Tema'), a:acc(v), n:v.n });
  for(const g of GRAMMAR.values()){ const v=w.gt[g.id], b=bestOf('topic',g.id);
    const a=v && v.n>=3 ? acc(v) : b!==null ? b/100 : null; if(a!==null) out.push({ only:'g:'+g.id, name:L(g,'title'), kind:T('Grammar','Gramática'), a, n:v?.n||0 }); }
  for(const [t,v] of Object.entries(w.tag)) if(v.n>=5) out.push({ only:'tag:'+t, name:t, kind:T('Tag','Etiqueta'), a:acc(v), n:v.n });
  return out.filter(x=>x.a<0.85).sort((a,b)=>a.a-b.a).slice(0,n);
}
function weakHTML(){
  const list=weakPoints(); if(!list.length) return '';
  return `<h2>${T('Weak points','Puntos débiles')}</h2><table class="cd"><tbody>${list.map((x,i)=>`<tr><th>${i+1}</th><td><b>${esc(x.name)}</b><div class="small muted">${esc(x.kind)} · ${Math.round(x.a*100)}%</div></td><td class="v"><button class="btn ghost" data-focus="${esc(x.only)}">${T('Practise now','Practicar')}</button></td></tr>`).join('')}</tbody></table>
    <p class="small muted">${T('Last 14 days. "Practise now" starts a 10-question mixed test on that point.','Últimos 14 días. "Practicar" lanza un test mixto de 10 preguntas sobre ese punto.')}</p>`;
}

/* ---------- Mistake notebook ---------- */
function mistakeLog(){
  const m=new Map();
  const put=(key, base, t, given)=>{ const e=m.get(key) || Object.assign({ key, n:0, last:0 }, base); e.n++; if(t>=e.last){ e.last=t; e.given=given; } m.set(key, e); };
  for(const a of S.attempts) if(a.r==='bad'){ const it=ITEMS.get(a.id); if(!it) continue;
    put(a.id, { id:a.id, cat:it.cat, tags:it.tags||[], q:questionText(it), es:it.type==='translate', correct:correctText(it) }, a.t, a.a||''); }
  for(const t of S.tests){ if(t.kind==='mixed') continue;
    for(const d of t.detail||[]) if(d.r!=='ok'){ const id=detailRef(t,d), it=id && ITEMS.get(id);
      if(it) put(id, { id, cat:it.cat, tags:it.tags||[], q:questionText(it), correct:correctText(it) }, t.at, d.given);
      else put(`${t.kind}:${d.task}:${d.n}`, { id:null, tags:[], cat:t.kind==='topic'?'grammar':t.kind==='mock'?'mock':(t.section||t.kind), q:d.stem||`${t.title} · ${d.n}`, correct:d.correct, title:t.title }, t.at, d.given); } }
  return [...m.values()].sort((a,b)=>b.last-a.last);
}
// Filter: a category, or a tag as 'tag:<name>'
let mistakeCat='';
const mistakeMatch = e => !mistakeCat || (mistakeCat.startsWith('tag:') ? (e.tags||[]).includes(mistakeCat.slice(4)) : e.cat===mistakeCat);
function mistakeRows(list){
  return list.map(e=>`<tr ${e.id?`data-item="${esc(e.id)}"`:''}><td><div class="small muted">${esc(catName(e.cat))} · ${esc(fmtDate(e.last))}${e.n>1?` · <b>${e.n}×</b>`:''}</div><div class="small"${e.es?' lang="es"':''}>${esc(e.q)}</div>
    <div class="ans-row bad-t">${ic('x','sm')}<span class="${e.given?'struck':''}">${esc(e.given)||T('(blank)','(en blanco)')}</span></div><div class="ans-row ok-t">${ic('check','sm')}<b>${esc(e.correct)}</b></div></td>${e.id?`<td class="v">${ic('chev','sm')}</td>`:'<td></td>'}</tr>`).join('');
}
function renderMistakes(){
  const all=mistakeLog(), cats=[...new Set(all.map(e=>e.cat))], tags=[...new Set(all.flatMap(e=>e.tags||[]))].map(t=>'tag:'+t), list=all.filter(mistakeMatch);
  return `${backBar(T('Mistake notebook','Cuaderno de errores'),'progress')}
    <p class="small muted">${T(`Everything you have got wrong (${all.length}). Tap one to see its history.`,`Todo lo que has fallado (${all.length}). Toca uno para ver su historial.`)}</p>
    <div class="chips">${['',...cats,...tags].map(c=>`<button data-mfilter="${esc(c)}" aria-pressed="${mistakeCat===c}">${esc(!c?T('All','Todos'):c.startsWith('tag:')?'#'+c.slice(4):catName(c))}</button>`).join('')}</div>
    <div class="row"><button class="btn" data-act="copymistakes" ${list.length?'':'disabled'}>${T('Copy list','Copiar lista')}</button></div>
    ${list.length?`<table class="cd hist"><tbody>${mistakeRows(list)}</tbody></table>`:`<p class="muted">${T('No mistakes here.','Aquí no hay fallos.')}</p>`}`;
}
function mistakesExport(){ const list=mistakeLog().filter(mistakeMatch);
  return JSON.stringify({ format:'lexi-mistakes', exportedAt:iso(Date.now()), filter:mistakeCat||null, mistakes:list.map(e=>({ id:e.id, category:e.cat, tags:e.tags&&e.tags.length?e.tags:undefined, question:e.q, myAnswer:e.given, correct:e.correct, last:iso(e.last), times:e.n })) }, null, 1); }

/* ---------- Item card ---------- */
let itemId=null, itemBack='progress';
function renderItem(){
  const it=ITEMS.get(itemId); if(!it) return renderProgress();
  const s=S.srs[it.id], hist=S.attempts.filter(a=>a.id===it.id).slice(-30).reverse();
  const shown=it.type==='translate' ? `<div class="small muted">${T('In Spanish:','En español:')}</div><div class="es">${esc(it.es)}</div><p class="sentence"><span class="slot ok">${esc(correctText(it))}</span></p>`
    : it.type==='dictation' ? `<p class="sentence">${esc(it.text)}</p>` : sentenceHTML(it.prompt||'', correctText(it), 'ok');
  const resIc=r=>`<span class="${r==='bad'?'bad-t':r==='near'?'':'ok-t'}">${ic(r==='bad'?'x':'check','sm')}</span>`;
  return `${backBar(it.word||correctText(it), itemBack)}
    <div class="card sheet"><div class="ch"><span class="t">${esc(catName(it.cat))}</span><span class="lv">${esc(it.level||'')}</span></div><div class="cb">${shown}${it.gtopic&&GRAMMAR.get(it.gtopic)?`<div class="small muted">${esc(L(GRAMMAR.get(it.gtopic),'title'))}</div>`:''}</div></div>
    ${L(it,'exp')?`<div class="panel"><b>${T('Why','Por qué')}</b><p class="small" style="margin:6px 0 0">${esc(L(it,'exp'))}</p></div>`:''}
    <table class="cd"><tbody>
      <tr><td class="k">${T('Next review','Próximo repaso')}</td><td>${s?(s.due<=Date.now()?T('Due now','Ya toca'):esc(fmtDate(s.due))):T('Not in your reviews','No está en tus repasos')}</td></tr>
      ${s?`<tr><td class="k">${T('Interval','Intervalo')}</td><td>${pl(s.i,'day','days','día','días').replace(/^/,s.i+' ')}</td></tr><tr><td class="k">${T('Right in a row','Aciertos seguidos')}</td><td>${s.r}</td></tr><tr><td class="k">${T('Misses','Fallos')}</td><td>${s.l}${s.l>=4?` · <span class="bad-t">${T('hard word','palabra difícil')}</span>`:''}</td></tr>`:''}
    </tbody></table>
    <h2>${T('History','Historial')}</h2>
    ${hist.length?`<table class="cd hist"><tbody>${hist.map(a=>`<tr><td>${resIc(a.r)}</td><td><div class="small">${esc(a.a)||T('(blank)','(en blanco)')}</div><div class="small muted">${esc(fmtDate(a.t))}${inferFormat(a)?' · '+esc(lab(FMTG_L, FMT_GROUP[inferFormat(a)])):''}</div></td></tr>`).join('')}</tbody></table>`:`<p class="muted small">${T('No answers yet.','Todavía sin respuestas.')}</p>`}
    <button class="btn block" data-say="${esc(it.type==='dictation'?it.text:it.prompt?String(it.prompt).split('\n').pop().replace('___', correctText(it)):correctText(it))}">${ic('speaker','sm')} ${T('Listen','Escuchar')}</button>`;
}

/* ---------- Records and mock exams ---------- */
function recordsHTML(){
  const hist=S.challenges.hist, any=Object.keys(S.challenges.best).length;
  if(!any && !hist.length) return '';
  return `<h2>${T('Challenge records','Récords de retos')}</h2><table class="cd"><tbody>${Object.keys(CH_L).filter(ch=>chBest(ch)!=null||ch==='daily'&&dailyStreak()).map(ch=>`<tr><td>${lab(CH_L,ch)}${ch==='daily'?`<div class="small muted">${T(`Streak: ${dailyStreak()}`,`Racha: ${dailyStreak()}`)}</div>`:''}</td><td class="v">${esc(chBestLabel(ch)||'–')}</td></tr>`).join('')}</tbody></table>
    ${hist.length?`<details class="panel"><summary>${T('Latest challenges','Últimos retos')}</summary><table class="cd" style="margin-top:8px"><tbody>${hist.slice(-10).reverse().map(h=>`<tr><td>${lab(CH_L,h.ch)}<div class="small muted">${esc(fmtDate(h.at))} · ${mmss(h.sec*1000)}</div></td><td class="v">${CH_SCORE[h.ch]?h.score:`${h.score}/${h.max}`}</td></tr>`).join('')}</tbody></table></details>`:''}`;
}
function mocksHTML(){
  const mocks=S.tests.filter(t=>t.kind==='mock'); if(!mocks.length) return '';
  const pts=mocks.slice(-12), n=pts.length;
  const chart = n>1 ? sparkSVG(pts.map((t,k)=>({ x:k/(n-1), y:Math.round(t.score/t.max*100), tip:`${t.title} · ${fmtDate(t.at)}: ${t.score}/${t.max}` })), T('Mock exam scores over time','Notas de los simulacros en el tiempo')) : '';
  return `<h2>${T('Mock exams','Simulacros')}</h2>${chart?`<div class="row spread small muted" style="margin-bottom:6px"><span>${T('Score by date (%)','Nota por fecha (%)')}</span>${chart.replace('class="spark"','class="spark wide"')}</div>`:''}
    <table class="cd hist"><tbody>${mocks.slice(-10).reverse().map(t=>`<tr data-result="${esc(t.id)}"><td><b>${esc(t.title)}</b><div class="small muted">${fmtDate(t.at)}${t.scale?` · ≈ ${t.scale} (${scaleLabel(t.scale)})`:''}</div></td><td class="v">${t.score}/${t.max}</td></tr>`).join('')}</tbody></table>`;
}
function bankHTML(c){
  const seen=c.total-c.unseen;
  return `<h2>${T('Word bank','Banco de palabras')}</h2>
    <div class="bank" role="img" aria-label="${T(`${c.mastered} mastered, ${c.learned} learnt, ${seen} seen of ${c.total}`,`${c.mastered} dominadas, ${c.learned} aprendidas, ${seen} vistas de ${c.total}`)}">
      <div class="m" style="width:${c.total?c.mastered/c.total*100:0}%"></div><div class="l" style="width:${c.total?(c.learned-c.mastered)/c.total*100:0}%"></div><div class="s" style="width:${c.total?(seen-c.learned)/c.total*100:0}%"></div></div>
    <div class="row wrap small muted bankkey"><span><i class="m"></i>${T('Mastered','Dominadas')} ${c.mastered}</span><span><i class="l"></i>${T('Learnt','Aprendidas')} ${c.learned-c.mastered}</span><span><i class="s"></i>${T('Seen','Vistas')} ${seen-c.learned}</span><span>${T(`${seen} of ${c.total} seen · ${c.unseen} new available`,`${seen} de ${c.total} vistas · ${c.unseen} nuevas disponibles`)}</span></div>
    ${c.unseen<30?`<div class="panel note" style="margin-top:10px"><h3>${ic('mail')}${T('You are running out of new exercises','Te quedas sin ejercicios nuevos')}</h3><p class="small">${T(`Only ${c.unseen} left. Export your updates and ask Claude for a new pack.`,`Solo quedan ${c.unseen}. Exporta tus novedades y pide a Claude un pack nuevo.`)}</p><button class="btn block" data-go="data">${T('Go to export','Ir a exportar')}</button></div>`:''}`;
}
