'use strict';
/* Lexi v7.1: routes, the learner's own study lists ("Save to route", like a playlist).
   A route only lists references (units, grammar topics, pages and notes): progress stays per unit, so removing
   an item or deleting a route never touches it. Loaded before app.js and only defines things. */

/* ---------- References ---------- */
// ref: a unit uid (pv:, cn:, col:, irr:, wf:, tr:, voc:, gr:), grammar:<topic>, page:<id> or note:<id>
const ROUTE_ICONS = ['🎯','✍️','🗣️','📚','🧩','⭐','🔥','🧠','✈️','💼'];
const LEARN_LIBS = ['pv','cn','col','irr','wf','tr','voc'];
const RGROUPS = ['pv','cn','col','irr','wf','tr','voc','theory'];
const RGROUP_L = { pv:['Phrasal verbs','Phrasal verbs'], cn:['Connectors','Conectores'], col:['Collocations','Collocations'], irr:['Irregular verbs','Verbos irregulares'],
  wf:['Word families','Familias de palabras'], tr:['Transformations','Transformaciones'], voc:['Vocabulary','Vocabulario'], theory:['Grammar & theory','Gramática y teoría'] };
const RCOUNT = { pv:['phrasal verb','phrasal verbs','phrasal verb','phrasal verbs'], cn:['connector','connectors','conector','conectores'], col:['collocation','collocations','collocation','collocations'],
  irr:['irregular verb','irregular verbs','verbo irregular','verbos irregulares'], wf:['word family','word families','familia de palabras','familias de palabras'],
  tr:['transformation','transformations','transformación','transformaciones'], voc:['word','words','palabra','palabras'], gq:['grammar question','grammar questions','pregunta de gramática','preguntas de gramática'],
  grammar:['grammar topic','grammar topics','tema de gramática','temas de gramática'], page:['page','pages','página','páginas'], note:['note','notes','apunte','apuntes'] };
const RCOUNT_ORDER = ['pv','cn','col','irr','wf','tr','voc','gq','grammar','page','note'];
const REF_KINDS = ['pv','cn','col','irr','wf','tr','voc','gr','grammar','page','note'];

const refKind = ref => { const k=String(ref).split(':')[0]; return k==='grammar'||k==='page'||k==='note' ? k : 'unit'; };
const refId = ref => String(ref).slice(String(ref).indexOf(':')+1);
const refGroup = ref => refKind(ref)!=='unit' || String(ref).startsWith('gr:') ? 'theory' : String(ref).split(':')[0];
const countKey = ref => refKind(ref)!=='unit' ? refKind(ref) : String(ref).startsWith('gr:') ? 'gq' : String(ref).split(':')[0];
function refExists(ref){ const k=refKind(ref), id=refId(ref);
  return k==='unit' ? UNITS.has(ref) : k==='grammar' ? GRAMMAR.has(id) : k==='page' ? PAGES.has(id) : S.rawNotes.some(n=>n.id===id); }
// The units a reference brings: itself, or every question of a grammar topic
function refUnits(ref){ const k=refKind(ref);
  if(k==='unit') return UNITS.has(ref) ? [ref] : [];
  if(k==='grammar'){ const id=refId(ref); return (BYLIB.gr||[]).filter(u=>u.item.gtopic===id).map(u=>u.uid); }
  return []; }
function refTitle(ref){ const k=refKind(ref), id=refId(ref);
  if(k==='unit'){ const u=UNITS.get(ref); if(!u) return id; if(u.lib==='gr'){ const p=String(u.item.prompt||u.term).split('\n').pop(); return p.length>70 ? p.slice(0,69)+'…' : p; } return unitName(u); }
  if(k==='grammar'){ const g=GRAMMAR.get(id); return g ? L(g,'title') : id; }
  if(k==='page'){ const p=PAGES.get(id); return p ? L(p,'title') : id; }
  const n=S.rawNotes.find(x=>x.id===id); return n ? (n.title||T('Untitled note','Apunte sin título')) : id; }
function refKindLabel(ref){ const k=refKind(ref);
  if(k==='unit') return String(ref).startsWith('gr:') ? T('Grammar question','Pregunta de gramática') : libName(String(ref).split(':')[0]);
  return k==='grammar' ? T('Grammar topic','Tema de gramática') : k==='page' ? T('Page','Página') : T('My note','Mi apunte'); }
// Theory a route asks you to read: grammar topics and pages (your own notes are already yours)
const refReadable = ref => refKind(ref)==='grammar' || refKind(ref)==='page';
const refRead = ref => !!S.read[refId(ref)];

/* ---------- Routes ---------- */
const routeById = id => (S.routes||[]).find(r=>r.id===id) || null;
const routeName = r => r.list && !r.renamed ? T('My learning list','Mi lista de aprendizaje') : (L(r,'name')||T('Untitled route','Ruta sin nombre'));
const routeHas = (r, ref) => r.items.some(x=>x.ref===ref);
const routesWith = ref => (S.routes||[]).filter(r=>routeHas(r, ref));
function newRouteId(){ let id; do id='r_'+Math.random().toString(36).slice(2,6); while(routeById(id)); return id; }
function makeRoute(name, icon, o={}){ const now=Date.now();
  const r=Object.assign({ id:newRouteId(), name:String(name||'').trim().slice(0,60), icon:icon||'', items:[], pinned:false, source:'user', createdAt:now, updatedAt:now, sessions:0, lastActivity:0 }, o);
  S.routes.push(r); return r; }
function routeAdd(r, refs){ const now=Date.now(); let n=0; for(const ref of refs) if(!routeHas(r, ref)){ r.items.push({ ref, addedAt:now }); n++; } if(n) r.updatedAt=now; return n; }
function routeRemove(r, refs){ const set=new Set(refs), before=r.items.length; r.items=r.items.filter(x=>!set.has(x.ref)); if(r.items.length!==before) r.updatedAt=Date.now(); }
// The route that replaced the v7.0 learning list; packs with "learnList" add to it
function listRoute(create){ let r=(S.routes||[]).find(x=>x.list); if(!r && create) r=makeRoute('My learning list', '⭐', { id:'r_list', list:true }); return r; }
// Every unit saved in some route. Kept until a route or the content changes (it is asked once per row in the libraries)
let routedCache=null;
function routedUids(){
  const key=(S.routes||[]).map(r=>r.items.map(x=>x.ref).join('|')).join('#');
  if(routedCache && routedCache.key===key && routedCache.units===UNITS) return routedCache.set;
  const set=new Set(); for(const r of S.routes||[]) for(const x of r.items) for(const uid of refUnits(x.ref)) set.add(uid);
  routedCache={ key, units:UNITS, set }; return set; }
const inRoutes = uid => routedUids().has(uid);
// The units of a route, once each, in the order they were saved
function routeUnits(r){ const seen=new Set(), out=[]; for(const x of r.items) for(const uid of refUnits(x.ref)) if(!seen.has(uid)){ seen.add(uid); out.push(UNITS.get(uid)); } return out; }
function routeStats(r){ const us=routeUnits(r), th=r.items.filter(x=>refReadable(x.ref) && refExists(x.ref));
  return { n:us.length, known:us.filter(u=>S.units[u.uid]?.seen && stageOf(u.uid)>=3).length, theory:th.length, read:th.filter(x=>refRead(x.ref)).length }; }
function routeCountLine(r){ const c={}; for(const x of r.items){ const k=countKey(x.ref); c[k]=(c[k]||0)+1; }
  return RCOUNT_ORDER.filter(k=>c[k]).map(k=>`${c[k]} ${pl(c[k], ...RCOUNT[k])}`).join(' · ') || T('Empty','Vacía'); }
const routeTests = id => S.tests.filter(t=>t.kind==='route' && t.ref===id);
// Activity started from a route: counted for its statistics
function routeTouch(id, mode){ const r=routeById(id); if(!r) return; r.lastActivity=Date.now(); if(mode!=='test') r.sessions=(r.sessions||0)+1; }

/* ---------- The bookmark button and the "Save to…" sheet ---------- */
function saveBtn(ref, name, cls=''){ const n=routesWith(ref).length;
  const label = n ? T(`Saved in ${n} ${n===1?'route':'routes'}. Change`,`Guardado en ${n} ${n===1?'ruta':'rutas'}. Cambiar`) : T(`Save ${name} to a route`,`Guardar ${name} en una ruta`);
  return `<button class="${['icon-btn','savebtn',cls,n?'on':''].filter(Boolean).join(' ')}" data-save="${esc(ref)}" aria-label="${esc(label)}">${ic(n?'bookmarkf':'bookmark', cls)}${n>1?`<span class="badge">${n}</span>`:''}</button>`; }
let sheet=null, newForm=null, undoFn=null;
function openSave(refs, o={}){ refs=[...new Set(refs)].filter(Boolean); if(!refs.length) return;
  sheet=Object.assign({ refs, snap:JSON.stringify(S.routes), creating:!S.routes.length, name:'', icon:'', fresh:true }, o); render(); }
function newRouteForm(where){ const f=where==='sheet' ? sheet : newForm;
  return `<div class="panel newroute"><label for="rname"><b>${T('New route','Nueva ruta')}</b></label>
    <input class="field" id="rname" maxlength="60" placeholder="${T('Name, e.g. Connectors for writing','Nombre, p. ej. Conectores para el writing')}" value="${esc(f.name)}" autocomplete="off" style="margin-top:8px">
    <div class="emojis" role="group" aria-label="${T('Icon (optional)','Icono (opcional)')}">${ROUTE_ICONS.map(e=>`<button data-remoji="${e}" aria-pressed="${f.icon===e}">${e}</button>`).join('')}</div>
    <button class="btn primary block" data-act="${where==='sheet'?'rcreatesave':'rcreate'}">${where==='sheet'?T('Create and save','Crear y guardar'):T('Create','Crear')}</button></div>`; }
function sheetHTML(){
  const s=sheet, n=s.refs.length, what=n===1 ? `<i>${esc(refTitle(s.refs[0]))}</i>` : esc(T(`${n} items`,`${n} elementos`));
  const order=[...S.routes].sort((a,b)=>(b.id===S.routeLast)-(a.id===S.routeLast) || (b.pinned-a.pinned) || (b.updatedAt-a.updatedAt));
  const state=r=>{ const k=s.refs.filter(ref=>routeHas(r, ref)).length; return k===n ? 'true' : k ? 'mixed' : 'false'; };
  return `<button class="scrim" data-act="sheetclose" tabindex="-1" aria-label="${T('Close','Cerrar')}"></button>
    <div class="sheetp" role="dialog" aria-modal="true" aria-labelledby="sheett"><div class="grab" aria-hidden="true"></div>
    <h3 id="sheett">${T(`Save ${what} to…`,`Guardar ${what} en…`)}</h3>
    ${order.length?`<ul class="list">${order.map(r=>`<li><button class="rowbtn" role="checkbox" aria-checked="${state(r)}" data-rtoggle="${esc(r.id)}"><span class="cbx" aria-hidden="true">${ic('check','sm')}</span><span class="rt"><b>${r.icon?esc(r.icon)+' ':''}${esc(routeName(r))}</b><span class="small muted">${esc(routeCountLine(r))}</span></span></button></li>`).join('')}</ul>`
      :`<p class="small muted">${T('You have no routes yet: create the first one.','Aún no tienes rutas: crea la primera.')}</p>`}
    <div style="margin-top:10px">${s.creating?newRouteForm('sheet'):`<button class="btn block" data-act="rnewform">${ic('plus','sm')} ${T('New route','Nueva ruta')}</button>`}</div>
    <button class="btn primary block" data-act="sheetdone" style="margin-top:10px">${T('Done','Hecho')}</button></div>`;
}
// What changed since the sheet opened, for the toast: "Saved to Writing" / "Removed from Writing"
function sheetChanges(){
  const before=new Map(JSON.parse(sheet.snap).map(r=>[r.id, new Set(r.items.map(x=>x.ref))])), added=[], removed=[];
  for(const r of S.routes){ const b=before.get(r.id)||new Set(), now=new Set(r.items.map(x=>x.ref));
    if(sheet.refs.some(ref=>now.has(ref) && !b.has(ref))) added.push(routeName(r));
    if(sheet.refs.some(ref=>b.has(ref) && !now.has(ref))) removed.push(routeName(r)); }
  return { added, removed };
}
function closeSheet(){
  if(!sheet) return; const c=sheetChanges(), snap=sheet.snap, fromSel=sheet.fromSel, opener=sheet.refs.length===1 ? sheet.refs[0] : null;
  sheet=null; if(fromSel) libSel=null; exportCache=null; save(); render();
  // Focus goes back to the bookmark that opened the sheet
  if(opener && typeof CSS!=='undefined') setTimeout(()=>document.querySelector(`[data-save="${CSS.escape(opener)}"]`)?.focus(), 60);
  const msg = c.added.length ? T(`Saved to ${c.added.join(', ')}`,`Guardado en ${c.added.join(', ')}`) : c.removed.length ? T(`Removed from ${c.removed.join(', ')}`,`Quitado de ${c.removed.join(', ')}`) : '';
  if(msg) toast(msg, ()=>{ S.routes=JSON.parse(snap); save(); render(); toast(T('Undone.','Deshecho.')); });
}
function createRoute(where){
  const f=where==='sheet' ? sheet : newForm, name=($('#rname')?.value ?? f.name).trim();
  if(!name){ toast(T('Give the route a name.','Ponle un nombre a la ruta.')); return null; }
  const r=makeRoute(name, f.icon); S.routeLast=r.id; f.name=''; f.icon=''; return r;
}

/* ---------- My routes and the route screen ---------- */
let routeRef=null, routeEdit=false, routeBack='routes', pageRoute=null, addQuery='', addSel=new Set(), routeSort='failed';
function routeCard(r, o={}){ const st=routeStats(r);
  return `<li class="rcard"><button class="rowbtn" data-route="${esc(r.id)}"><span class="ricon" aria-hidden="true">${r.icon?esc(r.icon):ic('bookmark')}</span><span class="rt"><b>${esc(routeName(r))}</b><span class="small muted">${esc(routeCountLine(r))}</span>
      ${st.n?`<span class="meter"><span style="width:${st.known/st.n*100}%"></span></span><span class="small muted">${T(`${st.known} of ${st.n} known`,`${st.known} de ${st.n} conocidas`)}</span>`:''}</span>${o.home?'':ic('chev','sm')}</button>
    ${o.home&&st.n?`<button class="btn" data-routego="practise" data-rid="${esc(r.id)}">${T('Practise','Practicar')}</button>`:''}</li>`; }
function renderRoutes(){
  const list=[...S.routes].sort((a,b)=>(b.pinned-a.pinned) || (b.updatedAt-a.updatedAt));
  return `${backBar(T('My routes','Mis rutas'),'study')}
    <p class="muted">${T('Save anything with the bookmark (a phrasal verb, a connector, a grammar topic, a page…) and study just that: learn, practise, flashcards, tests and the theory.','Guarda lo que quieras con el marcador (un phrasal verb, un conector, un tema de gramática, una página…) y estudia solo eso: aprender, practicar, tarjetas, tests y la teoría.')}</p>
    ${newForm?newRouteForm('page'):`<button class="btn primary block" data-act="rnewpage">${ic('plus','sm')} ${T('New route','Nueva ruta')}</button>`}
    ${list.length?`<ul class="list" style="margin-top:14px">${list.map(r=>routeCard(r)).join('')}</ul>`:`<p class="small muted" style="margin-top:14px">${T('No routes yet.','Todavía no tienes rutas.')}</p>`}`;
}
function homeRoutesHTML(){
  if(!S.routes.length) return '';
  const pinned=S.routes.filter(r=>r.pinned);
  return `<h2>${T('My routes','Mis rutas')}</h2>${pinned.length?`<ul class="list">${pinned.map(r=>routeCard(r, { home:true })).join('')}</ul>`:''}
    <button class="btn ghost block" data-go="routes">${T(`All my routes (${S.routes.length})`,`Todas mis rutas (${S.routes.length})`)}</button>`;
}
function routeItemRow(x){
  const ref=x.ref, k=refKind(ref);
  if(!refExists(ref)) return `<li><div class="row spread"><span>${esc(refId(ref))}<br><span class="small muted">${esc(refKindLabel(ref))}</span></span><span class="chip alt">${T('Pending','Pendiente')}</span></div></li>`;
  if(k==='unit'){ const u=UNITS.get(ref), link=u.item ? `data-item="${esc(u.item.id)}"` : `data-unit="${esc(u.uid)}"`, m=u.lib==='gr' ? '' : meanHTML(meaningOf(u), 80);
    return `<li><button class="rowbtn" ${link}><span class="rt"><b>${esc(refTitle(ref))}</b>${m?`<span class="small muted">${m}</span>`:''}</span>${stageChip(u.uid)}</button></li>`; }
  const open = k==='note' ? `data-note="${esc(refId(ref))}"` : `data-page="${k==='grammar'?'grammar':'guide'}:${esc(refId(ref))}" data-rid="${esc(routeRef)}"`;
  const sub = k==='grammar' ? T(`Theory + ${refUnits(ref).length} questions`,`Teoría + ${refUnits(ref).length} preguntas`) : refKindLabel(ref);
  const read = refReadable(ref) ? `<span class="stg ${refRead(ref)?'s3':'s0'}">${refRead(ref)?T('Read','Leído'):T('Unread','Sin leer')}</span>` : '';
  return `<li><button class="rowbtn" ${open}><span class="rt"><b>${esc(refTitle(ref))}</b><span class="small muted">${esc(sub)}</span></span>${read}</button></li>`;
}
function routeStageCounts(units){ const c=[0,0,0,0,0,0]; for(const u of units){ const s=S.units[u.uid]; c[s&&s.seen?s.stage:0]++; } return c; }
function renderRoute(){
  const r=routeById(routeRef); if(!r) return renderRoutes();
  if(routeEdit) return routeEditHTML(r);
  const st=routeStats(r), units=routeUnits(r), unseen=units.filter(u=>LEARN_LIBS.includes(u.lib) && !S.units[u.uid]?.seen).length;
  const flash=units.filter(u=>LEARN_LIBS.includes(u.lib)).length, unread=st.theory-st.read, n=S.settings.route?.n||20;
  const groups=RGROUPS.map(g=>[g, r.items.filter(x=>refGroup(x.ref)===g)]).filter(([,l])=>l.length);
  return `${backBar(routeName(r), routeBack, `<button class="icon-btn" data-act="redit" aria-label="${T('Edit route','Editar ruta')}">${ic('pen')}</button>`)}
    <div class="row" style="gap:12px;margin-bottom:4px"><span class="ricon" aria-hidden="true">${r.icon?esc(r.icon):ic('bookmark')}</span><span class="small muted">${esc(routeCountLine(r))}${r.source==='pack'?' · '+T('from a pack','de un pack'):''}</span></div>
    ${st.n?`${stageBar(routeStageCounts(units))}<p class="small muted" style="margin:6px 0 12px">${T(`${st.known} of ${st.n} known`,`${st.known} de ${st.n} conocidas`)}${st.theory?T(` · theory read ${st.read}/${st.theory}`,` · teoría leída ${st.read}/${st.theory}`):''}</p>`:''}
    ${r.items.length?`<div class="grid3"><button class="btn primary" data-routego="learn" ${unseen?'':'disabled'}>${T('Learn','Aprender')}${unseen?` (${unseen})`:''}</button><button class="btn" data-routego="flash" ${flash?'':'disabled'}>${T('Flashcards','Tarjetas')}</button><button class="btn" data-routego="test" ${st.n?'':'disabled'}>Test</button></div>
    <div class="panel stack" style="margin-top:10px"><div class="row spread"><b>${T('Practise','Practicar')}</b><div class="seg" role="group" aria-label="${T('Exercises','Ejercicios')}">${[10,20,30].map(v=>`<button data-rset="${v}" aria-pressed="${n===v}">${v}</button>`).join('')}</div></div>
      <button class="btn primary block" data-routego="practise" ${st.n?'':'disabled'}>${T(`Practise ${n} exercises`,`Practicar ${n} ejercicios`)} ${ic('go')}</button></div>
    <div class="grid2"><button class="btn" data-routego="read" ${unread?'':'disabled'}>${T('Read theory','Leer teoría')}${unread?` (${unread})`:''}</button><button class="btn" data-routego="stats">${ic('chart','sm')} ${T('Stats','Estadísticas')}</button></div>`
      :`<p class="muted">${T('This route is empty. Add items with the bookmark on any card, page or list, or search below.','Esta ruta está vacía. Añade elementos con el marcador de cualquier ficha, página o lista, o búscalos abajo.')}</p>`}
    ${groups.map(([g,l])=>`<details class="rgroup" open><summary>${esc(lab(RGROUP_L,g))} <span class="small muted">${l.length}</span></summary><ul class="list">${l.map(routeItemRow).join('')}</ul></details>`).join('')}
    <button class="btn block" data-act="radd" style="margin-top:14px">${ic('plus','sm')} ${T('Add more','Añadir más')}</button>`;
}
function routeEditHTML(r){
  return `<div class="sess-top"><button class="icon-btn" data-act="reditdone" aria-label="${T('Back','Volver')}">${ic('back')}</button><b style="flex:1">${T('Edit route','Editar ruta')}</b></div>
    <label for="redname"><b>${T('Name','Nombre')}</b></label>
    <input class="field" id="redname" maxlength="60" value="${esc(routeName(r))}" autocomplete="off" style="margin-top:6px">
    <div class="emojis" role="group" aria-label="${T('Icon','Icono')}">${ROUTE_ICONS.map(e=>`<button data-remoji="${e}" aria-pressed="${r.icon===e}">${e}</button>`).join('')}</div>
    ${toggleRowRoute(r)}
    <h2>${T('Items','Elementos')}</h2>
    ${r.items.length?`<ul class="list">${r.items.map((x,i)=>`<li class="urow"><span class="rt" style="flex:1;min-width:0;padding:10px 14px"><b>${esc(refTitle(x.ref))}</b><span class="small muted">${esc(refKindLabel(x.ref))}</span></span>
      <button class="icon-btn sm" data-rmove="${i}|-1" ${i?'':'disabled'} aria-label="${T('Move up','Subir')}">${ic('up','sm')}</button><button class="icon-btn sm" data-rmove="${i}|1" ${i<r.items.length-1?'':'disabled'} aria-label="${T('Move down','Bajar')}">${ic('down','sm')}</button>
      <button class="icon-btn sm danger" data-rdel="${i}" aria-label="${T('Remove','Quitar')}" style="margin-right:10px">${ic('trash','sm')}</button></li>`).join('')}</ul>`:`<p class="small muted">${T('No items.','Sin elementos.')}</p>`}
    <div class="actions" style="margin-top:16px"><button class="btn block" data-act="rdup">${T('Duplicate','Duplicar')}</button>
      <button class="btn ghost danger block" data-act="rdelete">${T('Delete route','Borrar ruta')}</button>
      <p class="small muted" style="margin:0">${T('Deleting a route or removing items never deletes your progress.','Borrar una ruta o quitar elementos nunca borra tu progreso.')}</p>
      <button class="btn primary block" data-act="reditdone">${T('Done','Hecho')}</button></div>`;
}
const toggleRowRoute = r => `<div class="row spread" style="margin-top:6px;gap:12px"><div><b>${T('Pin to Home','Fijar en Inicio')}</b><div class="small muted">${T('With a direct Practise button.','Con un botón directo de Practicar.')}</div></div><button class="switch" role="switch" aria-checked="${!!r.pinned}" data-act="rpin" aria-label="${T('Pin to Home','Fijar en Inicio')}"><span></span></button></div>`;

/* ---------- Add more: one search across every library, topic, page and note ---------- */
const fold = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’‘]/g,"'");
function addCandidates(q){
  const n=fold(q).trim(); if(n.length<2) return [];
  const hit=(...xs)=>xs.some(x=>fold(x).includes(n)), theory=[], units=[];
  for(const g of GRAMMAR.values()) if(hit(g.title, g.title_en)) theory.push('grammar:'+g.id);
  for(const p of PAGES.values()) if(hit(p.title, p.title_en)) theory.push('page:'+p.id);
  for(const x of S.rawNotes) if(hit(x.title, x.text)) theory.push('note:'+x.id);
  for(const u of UNITS.values()){ if(u.lib==='gr' || units.length>=80) continue;
    if(hit(unitName(u), u.term, u.es, u.en, u.item?.exp, u.item?.exp_en, u.item?.es, u.item?.word)) units.push(u.uid); }
  // Exact and starting matches first
  const rank=ref=>{ const t=fold(refTitle(ref)); return t===n ? 0 : t.startsWith(n) ? 1 : 2; };
  return [...theory, ...units.sort((a,b)=>rank(a)-rank(b))];
}
function addListHTML(){
  const r=routeById(routeRef); if(!r) return '';
  if(fold(addQuery).trim().length<2) return `<p class="small muted">${T('Type at least two letters, in English or Spanish (for example "aplazar" finds put off).','Escribe al menos dos letras, en inglés o en español (por ejemplo, "aplazar" encuentra put off).')}</p>`;
  const refs=addCandidates(addQuery); if(!refs.length) return `<p class="muted">${T('Nothing found.','No se ha encontrado nada.')}</p>`;
  return `<ul class="list">${refs.map(ref=>{ const inR=routeHas(r, ref), on=inR || addSel.has(ref);
    return `<li><button class="rowbtn" role="checkbox" aria-checked="${on}" data-raddpick="${esc(ref)}" ${inR?'disabled':''}><span class="cbx" aria-hidden="true">${ic('check','sm')}</span><span class="rt"><b>${esc(refTitle(ref))}</b><span class="small muted">${esc(refKindLabel(ref))}${inR?' · '+T('already in this route','ya está en esta ruta'):''}</span></span></button></li>`; }).join('')}</ul>`;
}
function renderRouteAdd(){
  const r=routeById(routeRef); if(!r) return renderRoutes();
  return `${backBar(T('Add to the route','Añadir a la ruta'),'route')}
    <p class="small muted">${esc(routeName(r))}</p>
    <input class="field" id="raddq" placeholder="${T('Search everything (English or Spanish)','Buscar en todo (inglés o español)')}" value="${esc(addQuery)}" autocomplete="off" autocapitalize="off">
    <div id="raddlist" style="margin-top:12px">${addListHTML()}</div>
    <div class="go"><button class="btn primary block" data-act="raddsave" ${addSel.size?'':'disabled'}>${T(`Add selected (${addSel.size})`,`Añadir seleccionados (${addSel.size})`)}</button></div>`;
}

/* ---------- Studying a route ---------- */
// Practise: due first, then new (with a presentation card), reinforcement and the rest. A short route
// comes back in other formats until the session is full; cooling down does not apply (you asked for it)
function buildRoutePractise(units, n, rnd=Math.random){
  const rk=rankUnits(units, Date.now(), rnd);
  const picked=[...rk.due.map(u=>[u,'due']), ...rk.fresh.map(u=>[u,'new']), ...rk.reinf.map(u=>[u,'reinf']), ...rk.rest.map(u=>[u,'rest']), ...rk.cool.map(u=>[u,'rest'])].slice(0, n);
  const exs=exercisesFor(picked, { rnd, cards:true, fill:n }), count=()=>exs.filter(isExercise).length+more.length, more=[];
  for(let round=0; round<4 && count()<n; round++) for(const [u] of picked){ if(count()>=n) break;
    const ex=genFor(u, { rnd, single:true, exclude:[...exs, ...more].filter(x=>x.uid===u.uid).map(x=>x.format) }); if(ex) more.push(ex); }
  let tail=interleave(more, false); const last=exs[exs.length-1];
  for(let g=0; g<tail.length && last && tail[0].uid===last.uid; g++) tail=[...tail.slice(1), tail[0]];
  return [...exs, ...tail];
}
function routeFlash(units, n=20){ const r=rankUnits(units, Date.now(), Math.random); return [...r.due, ...r.reinf, ...r.cool, ...r.rest, ...r.fresh].slice(0, n).map((u,k)=>flashEx(u,k)); }
function nextUnread(r){ return r.items.find(x=>refReadable(x.ref) && refExists(x.ref) && !refRead(x.ref)) || null; }
function routeGo(kind, rid){
  const r=routeById(rid||routeRef); if(!r) return; routeRef=r.id;
  const units=routeUnits(r), o={ routeId:r.id };
  if(kind==='learn'){ const fresh=units.filter(u=>LEARN_LIBS.includes(u.lib) && !S.units[u.uid]?.seen).slice(0, 5);
    if(!fresh.length){ toast(T('Everything in this route has been seen: practise it instead.','Ya has visto todo lo de esta ruta: practícalo.')); return; }
    return startLearn(fresh, Object.assign(o, { routeMode:'learn' })); }
  if(kind==='practise'){ if(!units.length){ toast(T('This route has nothing to practise yet.','Esta ruta aún no tiene nada que practicar.')); return; }
    return startEx(buildRoutePractise(units, S.settings.route?.n||20), Object.assign(o, { mode:'route', routeMode:'practise' })); }
  if(kind==='flash') return startEx(routeFlash(units.filter(u=>LEARN_LIBS.includes(u.lib))), Object.assign(o, { mode:'flash', lib:null, routeMode:'flashcards' }));
  if(kind==='test'){ go('routetest'); return; }
  if(kind==='stats'){ go('routestats'); return; }
  if(kind==='read'){ const x=nextUnread(r);
    if(!x){ toast(T("You've read all the theory in this route.",'Ya has leído toda la teoría de esta ruta.')); go('route'); return; }
    pageRef=[refKind(x.ref)==='grammar'?'grammar':'guide', refId(x.ref)]; pageRoute=r.id; go('page'); }
}
// Under a page opened from a route: the next unread page of that route
function pageRouteHTML(){
  const r=pageRoute && routeById(pageRoute); if(!r) return '';
  const x=nextUnread(r);
  return `<div class="panel note"><h3>${ic('bookmark')}${esc(routeName(r))}</h3>${x
    ?`<p class="small">${T(`Next to read: ${refTitle(x.ref)}`,`Lo siguiente: ${refTitle(x.ref)}`)}</p><button class="btn block" data-routego="read" data-rid="${esc(r.id)}">${T('Next page','Siguiente página')} ${ic('go')}</button>`
    :`<p class="small" style="margin:0 0 10px">${T('All the theory in this route is read.','Toda la teoría de esta ruta está leída.')}</p><button class="btn block" data-route="${esc(r.id)}">${T('Back to the route','Volver a la ruta')}</button>`}</div>`;
}

/* ---------- Route tests ---------- */
const RT_SKILLS = { meaning:['understand','recognise'], usage:['use'], production:['produce'], mixed:null };
const RT_MODE_L = { meaning:['Meaning','Significado'], usage:['Usage','Uso'], production:['Production','Producción'], mixed:['Mixed','Mixto'] };
function routeTestPool(r, c){
  let us=routeUnits(r);
  if(String(c.scope).startsWith('type:')){ const g=c.scope.slice(5); us=us.filter(u=>(u.lib==='gr'?'theory':u.lib)===g); }
  else if(c.scope==='lastfail'){ const last=routeTests(r.id).pop(), f=new Set(last ? last.detail.filter(d=>d.r==='bad').map(d=>d.uid) : []); us=us.filter(u=>f.has(u.uid)); }
  else if(c.scope==='weak') us=us.filter(u=>!S.units[u.uid]?.seen || stageOf(u.uid)<3);
  return us;
}
// How many times each unit was asked in this route's tests
function routeAsked(id){ const m={}; for(const t of routeTests(id)) for(const d of t.detail) if(d.uid) m[d.uid]=(m[d.uid]||0)+1; return m; }
// One exercise per unit; grammar questions keep their original format
function routeTestEx(units, mode, rnd=Math.random){
  const skills=RT_SKILLS[mode]||null, exs=[];
  for(const u of units){ const avoid=exs[exs.length-1]?.format;
    const ex = u.lib==='gr' ? genFor(u, { rnd, only:['gq'] }) : (genFor(u, { rnd, single:true, skills:skills||undefined, avoid }) || genFor(u, { rnd, single:true }));
    if(ex) exs.push(ex); }
  return interleave(exs, false);
}
// Full: every unit once. Otherwise coverage first: the units asked least in this route's tests go first
function buildRouteTest(r, c, rnd=Math.random){
  const pool=routeTestPool(r, c), asked=routeAsked(r.id), n=c.n==='full' ? pool.length : Math.min(+c.n||10, pool.length);
  const pick=shuf(pool, rnd).sort((a,b)=>(asked[a.uid]||0)-(asked[b.uid]||0) || (S.units[a.uid]?.lastSeen||0)-(S.units[b.uid]?.lastSeen||0)).slice(0, n);
  return routeTestEx(pick, c.mode, rnd);
}
function renderRouteTest(){
  const r=routeById(routeRef); if(!r) return renderRoutes();
  const c=S.settings.routetest, groups=RGROUPS.filter(g=>routeUnits(r).some(u=>(u.lib==='gr'?'theory':u.lib)===g)), pool=routeTestPool(r, c), hist=routeTests(r.id);
  const seg=(key, vals, labels)=>`<div class="seg" role="group">${vals.map((v,i)=>`<button data-rt="${key}" data-val="${v}" aria-pressed="${String(c[key])===String(v)}">${labels[i]}</button>`).join('')}</div>`;
  const n=c.n==='full' ? pool.length : Math.min(+c.n, pool.length);
  return `${backBar(T('Route test','Test de la ruta'),'route')}
    <p class="small muted">${esc(routeName(r))}. ${T("Items you were asked least in this route's tests come first; a full test asks each one once.",'Lo que menos te ha salido en los tests de esta ruta va primero; el test completo pregunta cada elemento una vez.')}</p>
    <div class="panel stack">
      <div><b>${T('Length','Longitud')}</b></div>${seg('n',[10,20,30,'full'],['10','20','30',T('Full','Completo')])}
      <div><b>${T('Which ones','Cuáles')}</b></div>${seg('scope',['all',String(c.scope).startsWith('type:')?c.scope:'type','lastfail','weak'],[T('Whole route','Toda la ruta'),T('One type','Un tipo'),T('Failed last time','Fallos del último'),T('Below Known','Sin afianzar')])}
      ${String(c.scope).startsWith('type:')?`<div class="chips" style="flex-wrap:wrap">${groups.map(g=>`<button data-rt="scope" data-val="type:${g}" aria-pressed="${c.scope==='type:'+g}">${esc(lab(RGROUP_L,g))}</button>`).join('')}</div>`:''}
      <div><b>${T('Mode','Modo')}</b></div>${seg('mode',['meaning','usage','production','mixed'],['meaning','usage','production','mixed'].map(k=>lab(RT_MODE_L,k)))}
      <div><b>${T('Timer','Cronómetro')}</b></div>${seg('timer',['false','true'],[T('No','No'),T('Yes','Sí')])}
      <p class="small muted" style="margin:0">${pool.length?T(`${n} ${n===1?'question':'questions'}${c.timer?`, ${mmss(n*45000)} min`:''}.`,`${n} ${n===1?'pregunta':'preguntas'}${c.timer?`, ${mmss(n*45000)} min`:''}.`):T('Nothing to test with these options.','No hay nada que preguntar con estas opciones.')}</p>
      <button class="btn primary block" data-act="rtstart" ${pool.length?'':'disabled'}>${T('Start test','Empezar test')} ${ic('go')}</button>
      ${hist.length?`<p class="small muted" style="margin:0">${T(`Last: ${hist[hist.length-1].score}/${hist[hist.length-1].max}`,`Último: ${hist[hist.length-1].score}/${hist[hist.length-1].max}`)}</p>`:''}</div>`;
}
function startRouteTest(units, c){
  const r=routeById(routeRef); if(!r) return;
  const exs=units ? routeTestEx(units, 'mixed') : buildRouteTest(r, c);
  return startEx(exs, { mode:'routetest', routeId:r.id, routeMode:'test', opts:Object.assign({}, c, { asked:exs.length }), secs:c.timer ? exs.length*45 : 0 });
}
// By type (phrasal verbs 7/8, connectors 4/6, grammar 5/6…)
function typeBreakdown(results){ const m={};
  for(const x of results){ const u=UNITS.get(x.uid); if(!u) continue; const k=u.lib==='gr'?'theory':u.lib; (m[k]||(m[k]={ n:0, ok:0 })); m[k].n++; if(x.r!=='bad') m[k].ok++; }
  return m; }
// Against the previous test of the same route: score difference and the units that improved or got worse
function routeCompare(rec){
  const all=routeTests(rec.ref), i=all.findIndex(t=>t.id===rec.id), prev=i>0 ? all[i-1] : null; if(!prev) return null;
  const pct=t=>t.max ? Math.round(t.score/t.max*100) : 0, was=new Map(prev.detail.map(d=>[d.uid, d.r!=='bad'])), up=[], down=[];
  for(const d of rec.detail){ if(!was.has(d.uid)) continue; const ok=d.r!=='bad'; if(ok && !was.get(d.uid)) up.push(d.uid); if(!ok && was.get(d.uid)) down.push(d.uid); }
  return { diff:pct(rec)-pct(prev), at:prev.at, up, down };
}
function routeCompareHTML(rec){
  const c=routeCompare(rec); if(!c) return `<p class="small muted">${T('Your first test of this route: the next one will be compared with it.','Tu primer test de esta ruta: el siguiente se comparará con este.')}</p>`;
  const day=new Date(c.at).toLocaleDateString(LOCALE(),{ day:'numeric', month:'short' }), sign=c.diff>0?'+':'';
  const names=ids=>ids.map(id=>UNITS.get(id)).filter(Boolean).map(u=>esc(unitName(u))).join(', ');
  return `<div class="panel note"><h3>${ic('chart')}${T(`${sign}${c.diff}% compared with ${day}`,`${sign}${c.diff} % respecto al ${day}`)}</h3>
    ${c.up.length?`<p class="small ok-t" style="margin:0 0 4px">${T('Better:','Mejor:')} ${names(c.up)}</p>`:''}${c.down.length?`<p class="small bad-t" style="margin:0">${T('Worse:','Peor:')} ${names(c.down)}</p>`:''}
    ${!c.up.length&&!c.down.length?`<p class="small" style="margin:0">${T('No unit changed from right to wrong or the other way round.','Ninguna unidad ha pasado de bien a mal ni al revés.')}</p>`:''}</div>`;
}

/* ---------- Route statistics ---------- */
function routeUnitRows(r){
  const last=new Map(); for(const a of S.attempts){ const u=unitOfAttempt(a); if(u) last.set(u, a); }
  return routeUnits(r).map(u=>{ const s=S.units[u.uid]||{}, a=last.get(u.uid);
    return { u, stage:s.seen?s.stage:0, seen:s.seen||0, acc:s.seen?Math.round(s.correct/s.seen*100):null, last:a?a.r:null, lastAt:s.lastSeen||0 }; });
}
function routeMinutes(id){ return Math.round(S.attempts.filter(a=>a.rid===id).reduce((s,a)=>s+Math.min(a.ms||0, MAX_ATTEMPT_MS), 0)/60000); }
function routeWeak(r, n=5){ return routeUnitRows(r).filter(x=>x.seen && x.acc<100).sort((a,b)=>a.acc-b.acc || b.seen-a.seen).slice(0, n); }
function renderRouteStats(){
  const r=routeById(routeRef); if(!r) return renderRoutes();
  const tests=routeTests(r.id), st=routeStats(r), rows=routeUnitRows(r), weak=routeWeak(r);
  const sorted=[...rows].sort(routeSort==='failed' ? (a,b)=>(a.acc??101)-(b.acc??101) || b.seen-a.seen : routeSort==='seen' ? (a,b)=>a.seen-b.seen : (a,b)=>a.stage-b.stage || a.seen-b.seen);
  const pts=tests.slice(-12), k=pts.length, chart=k>1 ? sparkSVG(pts.map((t,i)=>({ x:i/(k-1), y:Math.round(t.score/t.max*100), tip:`${fmtDate(t.at)}: ${t.score}/${t.max}` })), T('Route test scores over time','Notas de los tests de la ruta en el tiempo')).replace('class="spark"','class="spark wide"') : '';
  const resIc=x=>x==null?'–':`<span class="${x==='bad'?'bad-t':'ok-t'}">${ic(x==='bad'?'x':'check','sm')}</span>`;
  return `${backBar(T('Route stats','Estadísticas de la ruta'),'route')}
    <p class="small muted">${esc(routeName(r))}</p>
    <div class="stats"><div class="stat"><b>${st.n?Math.round(st.known/st.n*100):0}%</b><span>${T('Known or better','Conocidas o más')}</span></div><div class="stat"><b>${routeMinutes(r.id)}</b><span>${T('Minutes','Minutos')}</span></div><div class="stat"><b>${tests.length}</b><span>Tests</span></div></div>
    <table class="cd"><tbody>
      <tr><td class="k">${T('Theory read','Teoría leída')}</td><td>${st.theory?`${st.read}/${st.theory}`:'–'}</td></tr>
      <tr><td class="k">${T('Sessions','Sesiones')}</td><td>${r.sessions||0}</td></tr>
      <tr><td class="k">${T('Last activity','Última actividad')}</td><td>${r.lastActivity?esc(fmtDate(r.lastActivity)):'–'}</td></tr></tbody></table>
    <h2>${T('Test history','Historial de tests')}</h2>
    ${tests.length?`${chart?`<div class="row spread small muted" style="margin-bottom:6px"><span>${T('Score by date (%)','Nota por fecha (%)')}</span>${chart}</div>`:''}
      <table class="cd hist"><tbody>${tests.slice(-15).reverse().map(t=>`<tr data-result="${esc(t.id)}"><td><b>${esc(lab(RT_MODE_L, t.opts?.mode||'mixed'))}</b> · ${t.opts?.n==='full'?T('full','completo'):t.max}<div class="small muted">${esc(fmtDate(t.at))} · ${mmss(t.durationSec*1000)} min</div></td><td class="v">${t.score}/${t.max}</td></tr>`).join('')}</tbody></table>`
      :`<p class="small muted">${T('No tests yet.','Todavía no hay tests.')}</p>`}
    ${weak.length?`<h2>${T('Weak points','Puntos débiles')}</h2><ul class="list">${weak.map(x=>unitRow(x.u)).join('')}</ul><button class="btn block" data-act="rtweak" style="margin-top:10px">${T('Practise these','Practicar estos')}</button>`:''}
    <h2>${T('Units','Unidades')}</h2>
    <div class="seg" role="group" style="margin-bottom:10px">${[['failed',T('Most failed','Más falladas')],['seen',T('Least seen','Menos vistas')],['stage',T('Stage','Etapa')]].map(([v,l])=>`<button data-rsort="${v}" aria-pressed="${routeSort===v}">${l}</button>`).join('')}</div>
    ${rows.length?`<table class="cd"><tbody>${sorted.map(x=>`<tr ${x.u.item?`data-item="${esc(x.u.item.id)}"`:`data-unit="${esc(x.u.uid)}"`}><td><b>${esc(refTitle(x.u.uid))}</b><div class="small muted">${T(`Asked ${x.seen}×`,`Preguntada ${x.seen} veces`)}${x.acc!=null?` · ${x.acc}%`:''}${x.lastAt?` · ${esc(fmtDate(x.lastAt))}`:''}</div></td><td class="v">${resIc(x.last)}</td><td class="v">${stageChip(x.u.uid)}</td></tr>`).join('')}</tbody></table>`:`<p class="small muted">${T('No units in this route.','No hay unidades en esta ruta.')}</p>`}`;
}

/* ---------- Packs: routes prepared by the tutor ---------- */
function whyRoute(x){
  if(!x || typeof x.id!=='string' || !x.id.trim()) return T('missing "id"','falta "id"');
  if(typeof x.name!=='string' || !x.name.trim()) return T('missing "name"','falta "name"');
  if(!Array.isArray(x.items)) return T('"items" should be a list','"items" debería ser una lista');
  return null;
}
// The references of a pack route; those of an unknown kind are reported and left out
function packRouteRefs(x){ const good=[], bad=[];
  x.items.forEach((it,j)=>{ const ref=typeof it==='string' ? it.trim() : it && typeof it.ref==='string' ? it.ref.trim() : '';
    if(ref.includes(':') && REF_KINDS.includes(ref.split(':')[0])){ if(!good.includes(ref)) good.push(ref); } else bad.push(j); });
  return { good, bad }; }
// What the pack itself brings, so its routes can point at it before it is installed
function packProvides(P){ const s=new Set(), add=(k, pre, f)=>{ for(const x of P[k]||[]) if(x && f(x)) s.add(pre+f(x)); };
  add('phrasal','pv:',x=>x.v); add('connectors','cn:',x=>x.w); add('collocations','col:',x=>x.c); add('families','wf:',x=>x.base); add('transformations','tr:',x=>x.id);
  add('items','voc:',x=>x.id); add('grammar','grammar:',x=>x.id); add('pages','page:',x=>x.id); return s; }
function analyzePackRoutes(P, e){
  if(!Array.isArray(P.routes)) return;
  const brings=packProvides(P); e.routes=[];
  P.routes.forEach((x,i)=>{ const why=whyRoute(x), tag=`routes[${i}]${x&&typeof x.id==='string'?` (${x.id})`:''}`;
    if(why){ e.errors.push(`${tag}: ${why}`); return; }
    const refs=packRouteRefs(x), prev=routeById(x.id);
    for(const j of refs.bad) e.errors.push(`${tag}: ${T(`items[${j}] is not a valid reference (pv:…, cn:…, grammar:…, page:…)`,`items[${j}] no es una referencia válida (pv:…, cn:…, grammar:…, page:…)`)}`);
    e.routes.push({ x, refs:refs.good, pending:refs.good.filter(ref=>!refExists(ref) && !brings.has(ref)).length, prev:!!prev, modified:!!(prev && prev.updatedAt>(prev.importedAt||0)), choice:'keep' }); });
}
// A route already on the phone is updated, unless the learner changed it and chose to keep their version
function applyPackRoutes(e){
  let nw=0, up=0; const now=Date.now();
  for(const it of e.routes||[]){ const x=it.x, prev=routeById(x.id), base={ name:x.name.trim().slice(0,60), icon:typeof x.icon==='string'?x.icon:'' };
    if(typeof x.name_en==='string') base.name_en=x.name_en.trim().slice(0,60);
    if(!prev){ S.routes.push(Object.assign({ id:x.id, items:it.refs.map(ref=>({ ref, addedAt:now })), pinned:false, source:'pack', packId:e.id||null, createdAt:now, updatedAt:now, importedAt:now, sessions:0, lastActivity:0 }, base)); nw++; }
    else if(!it.modified || it.choice==='update'){ const old=new Map(prev.items.map(i=>[i.ref, i.addedAt]));
      delete prev.name_en; delete prev.renamed;
      Object.assign(prev, base, { items:it.refs.map(ref=>({ ref, addedAt:old.get(ref)||now })), source:'pack', packId:e.id||prev.packId||null, updatedAt:now, importedAt:now }); up++; } }
  return { nw, up };
}
function packRoutesPreview(e, ei){
  if(!e.routes || !e.routes.length) return '';
  const nw=e.routes.filter(r=>!r.prev).length, up=e.routes.length-nw, pending=e.routes.reduce((s,r)=>s+r.pending,0);
  const bits=[]; if(nw) bits.push(T(`${nw} new`,`${nw} nuevas`)); if(up) bits.push(T(`${up} already on this phone`,`${up} ya en este móvil`));
  return `<li>${T('Routes','Rutas')}: ${bits.join(', ')}${pending?` <span class="muted">(${T(`${pending} items not found: shown as pending`,`${pending} elementos no encontrados: se verán como pendientes`)})</span>`:''}</li>
    ${e.routes.map((r,ri)=>r.modified?`<li class="rchoice"><b>${esc(r.x.name)}</b>: ${T('you changed this route. Update it with the pack, or keep your version?','has cambiado esta ruta. ¿La actualizas con el pack o conservas tu versión?')}
      <div class="seg" role="group" style="margin-top:6px"><button data-rchoice="${ei}|${ri}|update" aria-pressed="${r.choice==='update'}">${T('Update','Actualizar')}</button><button data-rchoice="${ei}|${ri}|keep" aria-pressed="${r.choice==='keep'}">${T('Keep mine','Conservar la mía')}</button></div></li>`:'').join('')}`;
}

/* ---------- Export ---------- */
function routeSummaryOf(r){ const st=routeStats(r), tests=routeTests(r.id);
  return { knownPct:st.n?Math.round(st.known/st.n*100):0, units:st.n, theoryRead:st.read, theoryTotal:st.theory, minutes:routeMinutes(r.id), sessions:r.sessions||0, tests:tests.length,
    lastActivity:r.lastActivity?iso(r.lastActivity):null }; }
// Every route in a full export; in "Copy updates" only those changed or studied since the last one
function routesExport(since){
  const last=new Map(); for(const a of S.attempts){ const u=unitOfAttempt(a); if(u) last.set(u, a.r); }
  return S.routes.filter(r=>!since || r.updatedAt>since || r.lastActivity>since).map(r=>({ id:r.id, name:routeName(r), source:r.source||'user', packId:r.packId||undefined, icon:r.icon||undefined, pinned:!!r.pinned,
    createdAt:iso(r.createdAt), updatedAt:iso(r.updatedAt),
    items:r.items.map(x=>{ const o={ ref:x.ref, addedAt:iso(x.addedAt) }, k=refKind(x.ref);
      if(!refExists(x.ref)) o.pending=true;
      else if(k==='unit'){ const s=S.units[x.ref]; o.stage=s&&s.seen?s.stage:0; o.asked=s?.seen||0; o.accuracy=s&&s.seen?Math.round(s.correct/s.seen*100):null; o.lastResult=last.get(x.ref)||null; }
      else if(k==='grammar'){ o.questions=refUnits(x.ref).length; o.read=refRead(x.ref); }
      else if(k==='page') o.read=refRead(x.ref);
      return o; }),
    summary:routeSummaryOf(r) }));
}
function routeTestsExport(tests){
  return tests.filter(t=>t.kind==='route').map(t=>({ id:t.id, routeId:t.ref, at:iso(t.at), options:t.opts?{ length:t.opts.n, scope:t.opts.scope, mode:t.opts.mode, timer:!!t.opts.timer }:null,
    score:t.score, max:t.max, durationSec:t.durationSec, byType:t.breakdown?.byType||{}, bySkill:t.breakdown?.bySkill||{}, byFormat:t.breakdown?.byFormat||{},
    mistakes:t.detail.filter(d=>d.r==='bad').map(d=>({ question:d.stem, given:d.given, correct:d.correct, uid:d.uid, format:d.format })) }));
}
// Per route studied in the period: how the score moved and its weak points
function routesSummary(since){
  return S.routes.filter(r=>r.lastActivity>since || routeTests(r.id).some(t=>t.at>since)).map(r=>({ routeId:r.id, name:routeName(r),
    scores:routeTests(r.id).filter(t=>t.at>since).map(t=>({ at:iso(t.at), pct:t.max?Math.round(t.score/t.max*100):0 })),
    weak:routeWeak(r).map(x=>({ uid:x.u.uid, term:unitName(x.u), accuracy:x.acc, asked:x.seen })) }));
}

/* ---------- Taps ---------- */
// Returns true when the tap belonged to routes
function routeClick(ds){
  if(ds.save){ openSave(ds.save.split('|')); return true; }
  if(ds.undo!==undefined){ const f=undoFn; undoFn=null; document.querySelectorAll('.toast').forEach(t=>t.remove()); if(f) f(); return true; }
  if(ds.rtoggle){ const r=routeById(ds.rtoggle); if(!r || !sheet) return true;
    if(sheet.refs.every(ref=>routeHas(r, ref))) routeRemove(r, sheet.refs); else routeAdd(r, sheet.refs);
    S.routeLast=r.id; save(); render(); return true; }
  if(ds.remoji){ const f=sheet&&sheet.creating ? sheet : newForm && view==='routes' ? newForm : null;
    if(f){ f.name=$('#rname')?.value ?? f.name; f.icon=f.icon===ds.remoji?'':ds.remoji; render(); return true; }
    const r=routeById(routeRef); if(r && routeEdit){ r.icon=r.icon===ds.remoji?'':ds.remoji; r.updatedAt=Date.now(); save(); render(); } return true; }
  if(ds.route){ routeRef=ds.route; routeEdit=false; routeBack=view==='home'?'home':'routes'; pageRoute=null; go('route'); return true; }
  if(ds.routego){ routeGo(ds.routego, ds.rid); return true; }
  if(ds.rset){ S.settings.route=Object.assign({}, S.settings.route, { n:+ds.rset }); save(); const y=window.scrollY; render(); window.scrollTo(0,y); return true; }
  if(ds.rmove){ const r=routeById(routeRef), [i,d]=ds.rmove.split('|').map(Number), j=i+d; if(!r || j<0 || j>=r.items.length) return true;
    [r.items[i], r.items[j]]=[r.items[j], r.items[i]]; r.updatedAt=Date.now(); save(); const y=window.scrollY; render(); window.scrollTo(0,y); return true; }
  if(ds.rdel){ const r=routeById(routeRef); if(!r) return true; const snap=JSON.stringify(S.routes), x=r.items[+ds.rdel]; if(!x) return true;
    r.items.splice(+ds.rdel, 1); r.updatedAt=Date.now(); exportCache=null; save(); render();
    toast(T(`Removed: ${refTitle(x.ref)}`,`Quitado: ${refTitle(x.ref)}`), ()=>{ S.routes=JSON.parse(snap); save(); render(); }); return true; }
  if(ds.raddpick){ addSel.has(ds.raddpick) ? addSel.delete(ds.raddpick) : addSel.add(ds.raddpick); const y=window.scrollY; render(); window.scrollTo(0,y); return true; }
  if(ds.rt){ const c=S.settings.routetest, r=routeById(routeRef); c[ds.rt]= ds.rt==='n' ? (ds.val==='full'?'full':+ds.val) : ds.rt==='timer' ? ds.val==='true' : ds.val;
    // "One type" starts on the first type the route has
    if(c.scope==='type' && r){ const g=RGROUPS.find(g=>routeUnits(r).some(u=>(u.lib==='gr'?'theory':u.lib)===g)); if(g) c.scope='type:'+g; }
    save(); const y=window.scrollY; render(); window.scrollTo(0,y); return true; }
  if(ds.rsort){ routeSort=ds.rsort; render(); return true; }
  if(ds.lpick){ if(libSel){ libSel.has(ds.lpick) ? libSel.delete(ds.lpick) : libSel.add(ds.lpick); const y=window.scrollY; render(); window.scrollTo(0,y); } return true; }
  const r=routeById(routeRef);
  switch(ds.act){
    case 'sheetdone': case 'sheetclose': closeSheet(); return true;
    case 'rnewform': if(sheet){ sheet.creating=true; render(); } return true;
    case 'rcreatesave': { if(!sheet) return true; const nr=createRoute('sheet'); if(!nr) return true; routeAdd(nr, sheet.refs); sheet.creating=false; save(); render(); return true; }
    case 'rnewpage': newForm={ name:'', icon:'' }; render(); return true;
    case 'rcreate': { if(!newForm) return true; const nr=createRoute('page'); if(!nr) return true; newForm=null; save(); routeRef=nr.id; routeEdit=false; routeBack='routes'; go('route'); return true; }
    case 'redit': routeEdit=true; render(); return true;
    case 'reditdone': if(r){ const v=$('#redname')?.value; if(v!=null && v.trim() && v.trim()!==routeName(r)){ r.name=v.trim().slice(0,60); r.renamed=true; delete r.name_en; r.updatedAt=Date.now(); } }
      routeEdit=false; exportCache=null; save(); render(); return true;
    case 'rpin': if(r){ r.pinned=!r.pinned; r.updatedAt=Date.now(); save(); render(); } return true;
    case 'rdup': if(r){ const c=makeRoute(T(`${routeName(r)} (copy)`,`${routeName(r)} (copia)`), r.icon, { items:r.items.map(x=>Object.assign({}, x)) }); routeRef=c.id; routeEdit=false; save(); render(); toast(T('Route duplicated.','Ruta duplicada.')); } return true;
    case 'rdelete': if(r && confirm(T(`Delete the route "${routeName(r)}"? Your progress is kept.`,`¿Borrar la ruta "${routeName(r)}"? Tu progreso se conserva.`))){
      const snap=JSON.stringify(S.routes); S.routes=S.routes.filter(x=>x!==r); routeEdit=false; exportCache=null; save(); go('routes');
      toast(T('Route deleted.','Ruta borrada.'), ()=>{ S.routes=JSON.parse(snap); save(); render(); }); } return true;
    case 'radd': addQuery=''; addSel=new Set(); go('routeadd'); return true;
    case 'raddsave': if(r && addSel.size){ const n=routeAdd(r, [...addSel]); addSel=new Set(); exportCache=null; save(); go('route'); toast(T(`${n} added to ${routeName(r)}.`,`${n} añadidos a ${routeName(r)}.`)); } return true;
    case 'rtstart': startRouteTest(null, S.settings.routetest); return true;
    case 'rtretry': { const ss=S.session, ids=[...new Set((ss?.results||[]).filter(x=>x.r==='bad').map(x=>x.uid))].map(id=>UNITS.get(id)).filter(Boolean);
      if(ids.length){ routeRef=ss.routeId; startRouteTest(ids, Object.assign({}, ss.opts, { scope:'retry', n:ids.length, timer:false })); } return true; }
    case 'rtpractise': { const ss=S.session, ids=[...new Set((ss?.results||[]).filter(x=>x.r==='bad').map(x=>x.uid))].map(id=>UNITS.get(id)).filter(Boolean);
      if(ids.length) startEx(buildRoutePractise(ids, Math.max(10, ids.length*2)), { mode:'route', routeId:ss.routeId, routeMode:'practise' }); return true; }
    case 'rtweak': if(r){ const ids=routeWeak(r).map(x=>x.u); if(ids.length) startEx(buildRoutePractise(ids, 10), { mode:'route', routeId:r.id, routeMode:'practise' }); } return true;
    case 'libsel': libSel=libSel ? null : new Set(); render(); return true;
    case 'libselsave': if(libSel && libSel.size) openSave([...libSel], { fromSel:true }); return true;
  }
  return false;
}
