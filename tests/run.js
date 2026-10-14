'use strict';
// Lexi tests: node tests/run.js
const assert = require('assert');
const { boot } = require('./harness');
const { NOW, DAY, v5State } = require('./fixtures');

const results = [], report = {};
function test(name, fn){
  try{ fn(); results.push([true, name]); }
  catch(e){ results.push([false, name, e]); }
}
const H = 3600e3;
// Values from the app live in another vm realm: compare them as JSON
const same = (a, b, msg) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b), msg);
const areaOf = lib => lib==='wf' || lib==='tr' ? 'uoe' : lib;

// Visible text of a screen, without tags or attributes
const visible = html => html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');
// Spanish that should never show in English mode (content without an English version aside)
const SPANISH = /[¿¡ñ]|\b(el|los|las|una|para|pero|tus|sesión|ejercicios?|palabras?|repaso|también|aquí|está|todavía)\b/i;
const ALLOWED_ES = [/ ES: /, /Españ/];
// Content marked lang="es" (translation prompts, meanings that only exist in Spanish) is allowed
const dropSpanish = html => html.replace(/<div class="es">[\s\S]*?<\/div>/g, ' ').replace(/<(div|span)[^>]* lang="es">[\s\S]*?<\/\1>/g, ' ');

/* ---------- Answering any exercise ---------- */
function rightAnswer(ex){
  switch(ex.kind){
    case 'choice': return ex.ans;
    case 'text': return (ex.answers||[])[0] ?? ex.text;
    case 'multi': return ex.fields.map(f=>f.answers[0]);
    case 'order': return ex.sol;
    case 'tap': return { tok:ex.bad[0], fix:(ex.fixes||[])[0] ?? ex.fix };
    case 'match': return Object.fromEntries(ex.pairs.map(p=>[p.uid, p.uid]));
    case 'self': return 'ok';
    case 'flash': return 'good';
  }
}
function wrongAnswer(ex){
  switch(ex.kind){
    case 'choice': return (ex.ans+1)%ex.opts.length;
    case 'text': return 'zzz';
    case 'multi': return ex.fields.map(()=>'zzz');
    case 'order': return [...ex.sol].reverse();
    case 'tap': return { tok:ex.toks.findIndex((_,i)=>!ex.bad.includes(i)), fix:'' };
    case 'match': { const u=ex.pairs.map(p=>p.uid); return Object.fromEntries(u.map((id,i)=>[id, u[(i+1)%u.length]])); }
    case 'self': return 'bad';
    case 'flash': return 'again';
  }
}
// Plays the running session: pick(ex, k) returns the answer; presentation cards are acknowledged
function play(a, pick, max=400){
  let k=0;
  for(let n=0;n<max;n++){
    if(!a.run('!!(S.session && S.session.i<S.session.q.length && view==="session")')) return k;
    a.run('render()');
    const ex=a.run('current.ex');
    if(ex.kind==='present'){ a.click({ act:'gotit' }); continue; }
    a.run(`check(${JSON.stringify(pick(ex, k))})`); a.click({ act:'next' }); k++;
  }
  return k;
}
const right = () => ex => rightAnswer(ex);
const halfRight = () => (ex, k) => k%2 ? wrongAnswer(ex) : rightAnswer(ex);
const mostlyRight = (p=0.75) => { let s=7; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; return ex => rnd()<p ? rightAnswer(ex) : wrongAnswer(ex); };

/* ---------- Every screen, in English and Spanish ---------- */
const TOUR = [
  ['home', a=>a.click({ go:'home' })],
  ['daily practice', a=>a.click({ act:'start' })],
  ['session answered', a=>{ a.run('render()'); const ex=a.run('current.ex'); if(ex.kind==='present'){ a.click({ act:'gotit' }); a.run('render()'); } const e2=a.run('current.ex'); a.run(`check(${JSON.stringify(wrongAnswer(e2))})`); }],
  ['session summary', a=>{ a.click({ act:'next' }); play(a, halfRight()); }],
  ['keep going', a=>{ a.click({ act:'keepgoing' }); play(a, right()); }],
  ['progress', a=>a.click({ go:'progress' })],
  ['study', a=>a.click({ go:'study' })],
  ['library pv', a=>a.click({ lib:'pv' })],
  ['library filtered', a=>{ a.click({ lfilter:'state:0' }); a.click({ lsort:'failed' }); }],
  ['unit card', a=>a.click({ unit:'pv:give up' })],
  ['practise this one', a=>{ a.click({ practise:'pv:give up' }); play(a, halfRight()); }],
  ['library cn', a=>{ a.click({ act:'finish' }); a.click({ lib:'cn' }); }],
  ['library col', a=>a.click({ lib:'col' })],
  ['library irr', a=>a.click({ lib:'irr' })],
  ['irr unit', a=>a.click({ unit:'irr:swim' })],
  ['library wf', a=>a.click({ lib:'wf' })],
  ['wf unit', a=>a.click({ unit:'wf:employ' })],
  ['library tr', a=>a.click({ lib:'tr' })],
  ['tr unit', a=>a.click({ unit:'tr:kt01' })],
  ['cn unit', a=>a.click({ unit:'cn:although' })],
  ['learn setup', a=>{ a.click({ learnlib:'col' }); a.click({ lrnn:'3' }); }],
  ['learn session', a=>{ a.click({ act:'learnstart' }); }],
  ['learn session done', a=>play(a, halfRight())],
  ['flashcards', a=>{ a.click({ flashlib:'pv' }); a.run('render()'); a.click({ act:'flip' }); }],
  ['flashcards done', a=>play(a, right())],
  ['guide page', a=>{ a.click({ act:'finish' }); a.click({ page:'guide:'+a.run('[...PAGES.keys()][0]') }); }],
  ['grammar page', a=>a.click({ page:'grammar:'+a.run('[...GRAMMAR.keys()][0]') })],
  ['old irregular page', a=>a.click({ page:'irregular:' })],
  ['old phrasal page', a=>a.click({ page:'phrasal:' })],
  ['templates', a=>a.click({ go:'templates' })],
  ['note', a=>a.click({ newnote:'general' })],
  ['speaking', a=>a.click({ go:'speak' })],
  ['tests', a=>a.click({ go:'tests' })],
  ['library test options', a=>{ a.click({ lt:'lib', val:'cn' }); a.click({ lt:'scope', val:'theme' }); a.click({ lt:'mode', val:'meaning' }); }],
  ['library test', a=>{ a.click({ lt:'scope', val:'all' }); a.click({ act:'libtest' }); }],
  ['library test result', a=>play(a, halfRight())],
  ['library test in history', a=>{ a.click({ result:a.run('S.tests.filter(t=>t.kind==="library").pop().id') }); }],
  ['topic test', a=>a.click({ topic:a.run('[...GRAMMAR.keys()][0]') })],
  ['topic test checked', a=>a.click({ act:'checktask' })],
  ['result', a=>a.click({ act:'finishrun' })],
  ['part', a=>a.click({ part:'uoe:4' })],
  ['part checked', a=>{ a.click({ act:'checktask' }); a.click({ act:'finishrun' }); }],
  ['mock exam', a=>a.click({ paper:'pet-r1' })],
  ['mock handed in', a=>a.click({ act:'finishrun' })],
  ['phrasal test (old button)', a=>{ a.click({ act:'phrtest' }); play(a, right()); }],
  ['writing', a=>a.click({ go:'writing' })],
  ['write', a=>a.click({ new:'free' })],
  ['writing mock', a=>a.click({ act:'wmock' })],
  ['mixed test', a=>{ a.click({ go:'tests' }); a.click({ mix:'n', val:'10' }); a.click({ act:'mixed' }); }],
  ['mixed test summary', a=>play(a, halfRight())],
  ['practise my mistakes', a=>a.click({ act:'mixmistakes' })],
  ['mixed result', a=>{ play(a, right()); a.click({ result:a.run('S.tests.filter(t=>t.kind==="mixed")[0].id') }); }],
  ['daily challenge', a=>a.click({ ch:'daily' })],
  ['daily challenge done', a=>play(a, halfRight())],
  ['speed round', a=>a.click({ ch:'speed' })],
  ['speed round over', a=>{ play(a, right(), 5); a.run('sessionTimeUp()'); }],
  ['sudden death', a=>{ a.click({ ch:'sudden' }); play(a, (ex,k)=>k<3?rightAnswer(ex):wrongAnswer(ex)); }],
  ['no hints', a=>{ a.click({ ch:'nohints' }); }],
  ['b2 only', a=>{ a.click({ ch:'b2' }); play(a, halfRight()); }],
  ['mistakes review', a=>{ a.click({ ch:'mistakes' }); }],
  ['home after challenges', a=>a.click({ act:'finish' })],
  ['progress full', a=>a.click({ go:'progress' })],
  ['mistake notebook', a=>a.click({ go:'mistakes' })],
  ['notebook filtered', a=>a.click({ mfilter:a.run('mistakeLog()[0].cat') })],
  ['item card', a=>{ const id=a.run('mistakeLog().find(e=>e.id)?.id'); if(id) a.click({ item:id }); }],
  ['weak point practice', a=>{ a.click({ go:'progress' }); const f=a.run('weakPoints()[0]?.only'); if(f) a.click({ focus:f }); }],
  ['lesson page', a=>{ a.click({ act:'finish' }); a.click({ page:'grammar:'+a.run('lessonOfDay().g.id') }); }],
  ['data', a=>a.click({ go:'data' })],
  ['data mix tuned', a=>{ a.click({ preset:'exam' }); a.click({ share:'irr', d:'5' }); }],
];
for(const [label, state] of [['empty', null], ['v6 state', v5State]]){
  for(const lang of ['en', 'es']){
    test(`tour (${label}, ${lang}): every screen renders`, ()=>{
      const a = boot({ state:state && state(), lang, now:NOW });
      a.run('S.settings.grammarAll=true; buildUnits()');
      const leaks = [];
      for(const [name, step] of TOUR){
        step(a);
        const html = a.html();
        assert.ok(html.length > 50, `${name}: empty screen`);
        assert.ok(!/undefined|NaN|\[object Object\]/.test(visible(html)), `${name}: shows undefined/NaN: ${visible(html).match(/.{0,60}(undefined|NaN|\[object Object\]).{0,30}/)?.[0]}`);
        if(lang === 'en'){
          const m = visible(dropSpanish(html)).match(new RegExp('.{0,40}(?:' + SPANISH.source + ').{0,40}', 'i'));
          if(m && !ALLOWED_ES.some(r => r.test(m[0]))) leaks.push(`${name}: …${m[0]}…`);
        }
      }
      assert.deepStrictEqual(leaks, [], 'Spanish text in English mode');
    });
  }
}

/* ---------- 11.1 Migration ---------- */
test('migration: a v6 state opens without losses and each item’s progress is on its unit', ()=>{
  const st = v5State(), a = boot({ state:st, now:NOW });
  assert.strictEqual(a.run('S.v'), 3);
  assert.strictEqual(a.run('S.packs.length'), 1);
  assert.strictEqual(a.run('S.attempts.length'), st.attempts.length);
  assert.strictEqual(a.run('S.writings.length'), 1);
  assert.deepStrictEqual(Object.keys(a.run('S.srs')).sort(), Object.keys(st.srs).sort(), 'S.srs kept as it was');
  assert.strictEqual(a.run('S.tests.length'), 1);
  assert.ok(a.run('ITEMS.has("pk-prep-1") && GRAMMAR.has("g-pack-1") && PAPERS.has("gen-b1-1") && PHRASAL.has("set off")'));
  const u = a.run('S.units');
  for(const id of ['m01','m02','m03','pk-prep-1','pk-tr-1','m04']) assert.ok(u['voc:'+id], 'unit for '+id);
  assert.strictEqual(u['voc:m04'].stage, 5, 'interval 25 days → Mastered');
  assert.strictEqual(u['voc:m02'].lapses, 1);
  assert.ok(u['pv:give up'] && u['pv:give up'].stage>=3 && u['pv:give up'].interval===8, 'ph-give-up → pv:give up');
  assert.strictEqual(u['irr:go'].lapses, 2, 'irregular test mistakes');
  assert.strictEqual(u['pv:put off'].lapses, 3, 'phrasal test mistakes');
  assert.ok(UNITSHAS(a, 'cn:however') && UNITSHAS(a, 'col:make a decision'), 'new libraries built');
  a.run('save()');
  const saved = JSON.parse(a.store.get('lexi:v1'));
  for(const k of Object.keys(st)) assert.ok(k in saved, `field ${k} lost on save`);
  // A second load does not migrate again
  const b = boot({ state:saved, now:NOW });
  same(b.run('S.units["voc:m01"]'), saved.units['voc:m01']);
  // The unfinished v6 session (item ids) is turned into exercises
  assert.ok(a.run('S.session.q.every(x=>typeof x==="object")'));
});
function UNITSHAS(a, uid){ return a.run(`UNITS.has(${JSON.stringify(uid)})`); }

test('a backup made with v6 restores into v7 with defaults and units', ()=>{
  const a = boot({ now:NOW });
  a.run(`applyImport({ entries:[{ kind:'backup', data:{ state:${JSON.stringify(v5State())} } }] })`);
  assert.strictEqual(a.run('S.packs.length'), 1);
  assert.ok(a.run('S.settings.grammarDaily === true && S.settings.mix.n === 20 && Array.isArray(S.challenges.hist) && S.settings.newItems===10 && S.settings.dailySize===15'));
  assert.ok(a.run('!!S.units["pv:give up"]'));
});

/* ---------- 11.2 Generators ---------- */
test('generators: 5 exercises of every format for every base unit are valid', ()=>{
  const a = boot({ now:NOW });
  // Seen state for everything, so formats that need seen units (matching) can run
  a.run('for(const u of UNITS.values()) S.units[u.uid]=Object.assign(newUnitState(Date.now()), { seen:3, stage:3, correct:2 })');
  const out = a.run(`(()=>{
    const bad=[], made={}, tried={};
    const ok = s => s!=null && String(s).trim()!=='';
    for(const u of UNITS.values()) for(const f of Object.keys(GEN[u.lib])){
      tried[u.lib+'.'+f]=(tried[u.lib+'.'+f]||0)+1;
      for(let k=0;k<5;k++){
        const ex=GEN[u.lib][f](u, { rnd:seeded(u.uid+f+k), stage:3, tier:3 }); if(!ex) continue;
        made[u.lib+'.'+f]=(made[u.lib+'.'+f]||0)+1;
        const where=u.uid+' '+f;
        if(!ok(ex.exp?.es) || !ok(ex.exp?.en)) bad.push(where+': explanation EN/ES');
        if(ex.kind==='choice'){
          const t=ex.opts.map(o=>lc(o.t));
          if(!(ex.ans>=0 && ex.ans<ex.opts.length)) bad.push(where+': answer not in options');
          if(new Set(t).size!==t.length) bad.push(where+': repeated options '+t.join('/'));
          if(ex.opts.length<2) bad.push(where+': too few options');
          // No distractor accepted as correct: not an answer of the unit and graded wrong
          const accepted=[...(u.alsoCorrect||[]), ...(u.item?itemAnswers(u.item):[]), ...(u.lib==='cn'?[...cnOk(u)]:[])].map(lc);
          ex.opts.forEach((o,i)=>{ if(i===ex.ans) return; if(gradeEx(ex, i).r!=='bad') bad.push(where+': wrong option graded right');
            if(!['natural','samediff','oddone','join','listen','meaning','reverse','situation','synonym','group','ktchoice'].includes(f) && accepted.includes(lc(o.t))) bad.push(where+': distractor is also correct: '+o.t); });
        }
        if(ex.kind==='text' && !(ex.answers||[]).some(ok) && !ok(ex.text)) bad.push(where+': no answer');
        if(ex.kind==='multi' && !ex.fields.every(fl=>fl.answers.some(ok))) bad.push(where+': empty field answer');
        if(ex.kind==='order' && [...ex.tiles].sort().join('|')!==[...ex.sol].sort().join('|')) bad.push(where+': tiles differ from the sentence');
        if(ex.kind==='tap' && !(ex.bad.length && ex.bad.every(i=>i>=0 && i<ex.toks.length))) bad.push(where+': bad token out of range');
        if(ex.kind==='match' && new Set(ex.pairs.map(p=>p.uid)).size!==5) bad.push(where+': matching needs 5 units');
        if(gradeEx(ex, rightAnswerIn(ex)).r!=='ok' && ex.kind!=='present') bad.push(where+': right answer not accepted');
      }
    }
    function rightAnswerIn(ex){ switch(ex.kind){ case 'choice': return ex.ans; case 'text': return (ex.answers||[])[0] ?? ex.text; case 'multi': return ex.fields.map(f=>f.answers[0]); case 'order': return ex.sol;
      case 'tap': return { tok:ex.bad[0], fix:(ex.fixes||[])[0] ?? ex.fix }; case 'match': return Object.fromEntries(ex.pairs.map(p=>[p.uid,p.uid])); case 'self': return 'ok'; case 'flash': return 'good'; } }
    return { bad, made, tried };
  })()`);
  report.generators = out;
  const formats = new Set(Object.keys(out.made).map(k=>k.split('.')[1]));
  assert.ok(formats.size >= 33, `only ${formats.size} formats generated`);
  const kinds={}; for(const b of out.bad){ const k=b.replace(/^\S+ /,'').replace(/^(\S+): /,'$1|').split(':')[0]; kinds[k]=(kinds[k]||0)+1; }
  report.genProblems = kinds;
  same(out.bad.slice(0,15), [], `${out.bad.length} problems: ${JSON.stringify(kinds)}`);
});

/* ---------- 11.3 Coverage ---------- */
test('coverage: 10 phrasal-verb tests of 10 questions show at least 80 different verbs', ()=>{
  const a = boot({ now:NOW });
  const seen = new Set();
  for(let t=0;t<10;t++){
    a.setNow(NOW + t*2*H);
    a.click({ lt:'lib', val:'pv' }); a.click({ lt:'n', val:'10' }); a.click({ lt:'scope', val:'all' }); a.click({ lt:'mode', val:'mixed' });
    a.click({ act:'libtest' });
    a.run('S.session.q').forEach(x=>(x.uids||[x.uid]).forEach(u=>seen.add(u)));
    play(a, mostlyRight(0.7));
    a.click({ act:'finish' });
  }
  report.coverage = { distinct:seen.size, total:a.run('BYLIB.pv.length') };
  assert.ok(seen.size >= 80, `only ${seen.size} different phrasal verbs`);
});

/* ---------- 11.4 Variety ---------- */
test('variety: 50 daily sessions of 25 — ≥6 formats, every area, no format or unit twice in a row', ()=>{
  const a = boot({ now:NOW });
  a.run('S.settings.grammarAll=true; S.settings.dailySize=25; S.settings.newItems=10');
  const issues = [], formatsPer = [];
  for(let d=0; d<50; d++){
    a.setNow(NOW + d*DAY);
    a.run('S.session=null'); a.click({ act:'start' });
    const q = a.run('S.session.q.filter(isExercise)');
    const areas = new Set(q.flatMap(x=>(x.uids||[x.uid]).map(u=>areaOf(u.split(':')[0]))));
    const fm = new Set(q.map(x=>x.format)); formatsPer.push(fm.size);
    if(q.length < 25) issues.push(`day ${d}: only ${q.length} exercises`);
    if(fm.size < 6) issues.push(`day ${d}: ${fm.size} formats`);
    for(const ar of ['voc','pv','col','cn','irr','uoe','gr']) if(!areas.has(ar)) issues.push(`day ${d}: no ${ar}`);
    for(let i=1;i<q.length;i++){
      if(q[i].format===q[i-1].format) issues.push(`day ${d}: format ${q[i].format} twice`);
      if(q[i].uid===q[i-1].uid) issues.push(`day ${d}: unit ${q[i].uid} twice`);
    }
    const sk = q.reduce((m,x)=>(m[x.skill]=(m[x.skill]||0)+1, m), {});
    if((sk.produce||0) < Math.ceil(q.length*0.25)) issues.push(`day ${d}: production ${sk.produce||0}/${q.length}`);
    if((sk.understand||0)+(sk.use||0) < Math.ceil(q.length*0.4)) issues.push(`day ${d}: meaning+usage ${(sk.understand||0)+(sk.use||0)}/${q.length}`);
    play(a, mostlyRight(0.75));
  }
  report.variety = { minFormats:Math.min(...formatsPer), avgFormats:+(formatsPer.reduce((s,x)=>s+x,0)/formatsPer.length).toFixed(1), issues:issues.length };
  assert.deepStrictEqual(issues.slice(0,12), [], `${issues.length} issues`);
});

/* ---------- 11.5 Cool-down ---------- */
test('cool-down: a unit answered right does not come back for 4 hours unless it is due', ()=>{
  const a = boot({ now:NOW });
  a.run('learnUnit("pv:give up","ok","understand","meaning"); learnUnit("pv:give up","ok","use","particle")');
  const inDaily = () => a.run('buildDaily(40).some(x=>(x.uids||[x.uid]).includes("pv:give up"))');
  // Make it the only phrasal verb with history, and not due
  a.setNow(NOW + 1*H); assert.ok(!inDaily(), 'came back 1 h later');
  a.setNow(NOW + 3.9*H); assert.ok(!inDaily(), 'came back 3.9 h later');
  a.run('S.units["pv:give up"].due=Date.now()-1'); assert.ok(inDaily(), 'due units come back even while cooling');
  a.setNow(NOW); a.run('S.units["pv:give up"].due=Date.now()+5*DAY; learnUnit("pv:give up","bad","use","gap")');
  a.setNow(NOW + 1*H); a.run('S.units["pv:give up"].due=Date.now()+DAY'); assert.ok(a.run('!cooling(S.units["pv:give up"], Date.now())'), 'failed units are not cooling');
  // Library tests: no unit from the last two tests while others are left
  const b = boot({ now:NOW }), t1 = b.run('buildLibTest("pv",10,"all","mixed").map(x=>x.uid)'); b.run('rememberLibTest("pv", buildLibTest("pv",10,"all","mixed"))');
  b.run(`S.libHist.pv=[${JSON.stringify(t1)}]`);
  const t2 = b.run('buildLibTest("pv",10,"all","mixed").map(x=>x.uid)');
  assert.ok(!t2.some(u=>t1.includes(u)), 'repeated units from the previous test');
});

/* ---------- 11.6 Stage ladder ---------- */
test('ladder: a unit does not go from stage 2 to 3 without right answers in two skills', ()=>{
  const a = boot({ now:NOW });
  a.run('learnUnit("cn:however","ok","understand","meaning"); learnUnit("cn:however","ok","understand","reverse")');
  assert.strictEqual(a.run('S.units["cn:however"].stage'), 2);
  for(let k=0;k<5;k++) a.run('learnUnit("cn:however","ok","understand","meaning")');
  assert.strictEqual(a.run('S.units["cn:however"].stage'), 2, 'same skill again and again');
  a.run('learnUnit("cn:however","ok","use","connfn")');
  assert.strictEqual(a.run('S.units["cn:however"].stage'), 3, 'a second skill moves it up');
  a.run('learnUnit("cn:however","bad","produce","gap")');
  assert.strictEqual(a.run('S.units["cn:however"].stage'), 2, 'a mistake takes it down one stage');
  assert.ok(a.run('S.units["cn:however"].due') <= NOW + 11*60000, 'and it comes back soon');
  // A retry in the session uses an easier format with the explanation visible
  a.run('S.session=null'); a.run('startEx([genFor(UNITS.get("cn:however"), { only:["gap"] }), genFor(UNITS.get("pv:give up"),{ tier:1 }), genFor(UNITS.get("col:make a decision"),{ tier:1 }), genFor(UNITS.get("irr:swim"),{ tier:1 }), genFor(UNITS.get("wf:care"),{ tier:1 })], { mode:"daily" })');
  a.run('render()'); a.run('check("zzz")');
  const retry = a.run('S.session.q.find(x=>x.retry)');
  assert.ok(retry && retry.uid==='cn:however' && retry.showExp && FMTTIER(a, retry.format) < 3, 'easier retry with explanation');
  // Production gaps are detected: right in meaning, wrong in production → production formats preferred
  a.run('S.units["pv:get up"]=Object.assign(newUnitState(Date.now()), { seen:6, stage:2, bySkill:{ understand:{ n:4, ok:4 }, produce:{ n:2, ok:0 } } })');
  assert.ok(a.run('needsProduction(S.units["pv:get up"])'));
  const sk = a.run('Array.from({length:20},()=>genFor(UNITS.get("pv:get up")).skill)');
  assert.ok(sk.filter(s=>s==='produce').length >= 10, 'production chosen more often: '+sk.join(','));
});
function FMTTIER(a, f){ return a.run(`FMT[${JSON.stringify(f)}].tier`); }

/* ---------- 11.7 Performance ---------- */
test('performance: building a 40-exercise session takes under 100 ms', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  a.run('S.settings.grammarAll=true; for(const u of [...UNITS.values()].slice(0,400)) S.units[u.uid]=Object.assign(newUnitState(Date.now()-5*DAY), { seen:4, stage:1+(u.uid.length%5), correct:3, due:Date.now()-DAY*(u.uid.length%3), lastSeen:Date.now()-2*DAY })');
  const times = a.run('Array.from({length:20},()=>{ const t=performance.now(); buildDaily(40); return performance.now()-t; })');
  const avg = times.reduce((s,x)=>s+x,0)/times.length, max = Math.max(...times);
  report.performance = { avgMs:+avg.toFixed(1), maxMs:+max.toFixed(1) };
  assert.ok(max < 100, `max ${max.toFixed(1)} ms`);
});

/* ---------- Daily practice, learn new, library tests ---------- */
test('daily practice: new units get a presentation card before their first exercise', ()=>{
  const a = boot({ now:NOW });
  a.click({ act:'start' });
  const q = a.run('S.session.q');
  const firstSeen = new Set();
  for(const x of q){ if(x.kind==='present'){ firstSeen.add(x.uid); continue; }
    if(x.fresh && ['pv','cn','col','irr','wf','tr'].includes(x.lib)) assert.ok(firstSeen.has(x.uid), 'no card before '+x.uid); }
  assert.ok(firstSeen.size>0);
  assert.strictEqual(a.run('S.session.q.filter(isExercise).length'), 25);
  a.click({ act:'gotit' });
  const uid = q[0].uid;
  assert.ok(a.run(`!!S.units[${JSON.stringify(uid)}].introduced`), 'card marks the unit as introduced');
});

test('new items per day: the daily limit holds and "Learn more today" goes past it', ()=>{
  const a = boot({ now:NOW });
  // 5 new units × 3 exercises fill a session of 15, so the limit holds and nothing is announced
  a.run('S.settings.newItems=5; S.settings.dailySize=15');
  a.click({ act:'start' }); play(a, right());
  assert.strictEqual(a.run('today().nw'), 5);
  assert.ok(!a.toasts.some(t=>/fill the session/.test(t)));
  a.click({ act:'finish' });
  assert.strictEqual(a.run('counts().newAvail'), 0);
  a.click({ act:'learnauto' });
  assert.strictEqual(a.run('S.session.mode'), 'learn');
  const q = a.run('S.session.q');
  const cards = q.filter(x=>x.kind==='present').length, exs = q.filter(x=>x.kind!=='present');
  assert.strictEqual(cards, 5, 'all the cards first');
  assert.ok(q.slice(0,5).every(x=>x.kind==='present'));
  assert.ok(exs.length >= 12, '≈3 exercises per unit');
  for(let i=1;i<exs.length;i++) assert.notStrictEqual(exs[i].uid, exs[i-1].uid, 'same unit twice in a row');
  const tiers = exs.map(x=>a.run(`FMT[${JSON.stringify(x.format)}].skill`));
  assert.ok(['understand','recognise'].includes(tiers[0]), 'starts with meaning');
  play(a, right());
  assert.ok(a.html().includes('Learnt today'));
});

test('library test: length, scope, modes and the result by skill and format', ()=>{
  const a = boot({ now:NOW });
  for(const [mode, skills] of [['meaning',['understand','recognise']],['usage',['use']]]){
    a.run('S.session=null'); a.click({ lt:'lib', val:'pv' }); a.click({ lt:'n', val:'20' }); a.click({ lt:'mode', val:mode }); a.click({ act:'libtest' });
    const q = a.run('S.session.q');
    assert.strictEqual(q.length, 20);
    assert.ok(q.every(x=>skills.includes(x.skill)), mode+': '+[...new Set(q.map(x=>x.skill))]);
    assert.ok(q.every(x=>x.lib==='pv'));
    play(a, halfRight());
    const html = a.html();
    assert.ok(/Meaning <b>|Usage <b>/.test(html) && html.includes('By format') && html.includes('Learn these'), 'result screen');
  }
  const rec = a.run('S.tests[S.tests.length-1]');
  assert.strictEqual(rec.kind, 'library'); assert.strictEqual(rec.ref, 'pv');
  assert.ok(rec.breakdown.bySkill && rec.breakdown.byFormat && rec.detail.every(d=>d.uid && d.format));
  a.click({ learnthese:rec.detail.filter(d=>d.r!=='ok').map(d=>d.uid).join('|') });
  assert.strictEqual(a.run('S.session.mode'), 'learn');
  // Scope: my list
  a.run('S.session=null; S.learnList=["pv:give up","pv:put off","pv:look after"]');
  a.click({ lt:'scope', val:'list' }); a.click({ lt:'n', val:'10' }); a.click({ act:'libtest' });
  same([...new Set(a.run('S.session.q').map(x=>x.uid))].sort(), ['pv:give up','pv:look after','pv:put off']);
});

test('flashcards and "practise this one" feed the same learning state', ()=>{
  const a = boot({ now:NOW });
  a.click({ practise:'col:make a decision' });
  const q = a.run('S.session.q');
  assert.strictEqual(q.length, 5); assert.strictEqual(new Set(q.map(x=>x.format)).size, 5, 'five different formats');
  play(a, right());
  assert.ok(a.run('S.units["col:make a decision"].seen') >= 5);
  a.click({ act:'finish' }); a.click({ flashlib:'col' });
  a.run('render()'); a.click({ act:'flip' }); a.click({ flash:'easy' });
  const s = a.run('S.units[S.session.q[0].uid]');
  assert.ok(s.interval >= 2, 'easy gives a longer interval');
});

test('unit card shows meaning, examples, mistake, confusions, data and actions', ()=>{
  const a = boot({ now:NOW });
  a.run('learnUnit("pv:come across","bad","use","natural")');
  a.click({ unit:'pv:come across' });
  const h = a.html();
  for(const s of ['came across','find something or someone by chance','I came across with an old photo','Don\'t confuse with','Your data','Practise this one','Add to my learning list','across = from one side to the other'])
    assert.ok(h.includes(s) || h.includes(s.replace("'", '&#39;')), 'missing: '+s);
  a.click({ learnlist:'pv:come across' });
  assert.ok(a.run('S.learnList.includes("pv:come across")'));
});

/* ---------- Grading ---------- */
test('vocabulary answers ignore a leading article or "to"', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  const g = (id, ans) => a.run(`grade(ITEMS.get(${JSON.stringify(id)}), ${JSON.stringify(ans)})`);
  assert.strictEqual(g('pk-tr-1', 'the personal growth'), 'ok');
  assert.strictEqual(g('pk-tr-2', 'to agree'), 'ok');
  assert.strictEqual(g('pk-tr-3', 'be honest'), 'bad', '"to" is part of the expected answer');
  assert.strictEqual(g('pk-tr-1', 'the personal grwth'), 'near');
  assert.strictEqual(g('pk-prep-1', 'arrived in'), 'ok', 'words already in the sentence');
});
test('key word transformations compare the rebuilt sentence', ()=>{
  const a = boot({ now:NOW });
  const ex = a.run('GEN.tr.kwt(UNITS.get("tr:kt42"), { rnd:Math.random })');
  const g = v => a.run(`gradeEx(${JSON.stringify(ex)}, ${JSON.stringify(v)}).r`);
  assert.strictEqual(g('since I last went'), 'ok');
  assert.strictEqual(g("It's months since I last went to the cinema."), 'ok', 'whole sentence');
  assert.strictEqual(g('SINCE I LAST WENT'), 'ok', 'capitals');
  assert.strictEqual(g('since I went last'), 'bad');
  const e2 = a.run('GEN.tr.kwt(UNITS.get("tr:kt19"), { rnd:Math.random })');
  assert.strictEqual(a.run(`gradeEx(${JSON.stringify(e2)}, "have not seen him for").r`), 'ok', 'contractions');
});
test('verb forms: inflection and detection', ()=>{
  const a = boot({ now:NOW });
  const r = a.run(`[inflect('postpone','ing'), inflect('swim','pp'), inflect('stop','past'), inflect('outgrow','pp'), inflect('quit','past'), inflectPhrase('take care of','past'),
    detectForm('gave','give','dad'), detectForm('grown','grow',"has"), detectForm('Put','put',''), detectForm('set','set','she'), detectForm('putting','put','stop')]`);
  same(r, ['postponing','swum','stopped','outgrown','quit','took care of','past','pp','base',null,'ing']);
});

/* ---------- Packs ---------- */
test('packs: new collections load, are validated with reasons and fill the learning list', ()=>{
  const a = boot({ now:NOW });
  const pack = { format:'lexi-pack', pack:{ id:'p7', name:'v7 pack',
    connectors:[{ w:'nonetheless', fn:'contrast', level:'B2', register:'formal', pattern:'sentence-initial + comma', es:'no obstante', en:'however', ex:['It was cold. *Nonetheless*, we swam.','He was tired. *Nonetheless*, he went on.'] }, { w:'bad one', fn:'xx', es:'x', ex:['*bad one*'] }],
    collocations:[{ c:'take a seat', verb:'take', noun:'a seat', es:'sentarse', en:'sit down', ex:['Please *take a seat*.','She *took a seat* by the window.'], wrongVerb:'catch', theme:'social' }],
    families:[{ base:'drive', forms:{ verb:'drive', person:'driver', noun:'driving' }, ex:{ person:'The *driver* stopped.', noun:'*Driving* in the city is stressful.' } }],
    transformations:[{ id:'px1', from:'I started here in May.', key:'SINCE', to:'I have worked here ___ May.', answers:['since'] }],
    phrasal:[{ v:'look out', es:'tener cuidado', en:'be careful', theme:'problemas', level:'B1', ex:['*Look out*! A car!','You should *look out* for pickpockets.'], syn:'be careful', wrong:'Look out of the car! => Look out for the car!' }],
    learnList:['cn:nonetheless','pv:look out'] } };
  const rep = a.run(`analyzeImport(parseImport(${JSON.stringify(JSON.stringify(pack))}))`);
  const e = rep.entries[0];
  assert.strictEqual(e.counts.connectors.nw, 1); assert.strictEqual(e.counts.connectors.bad, 1);
  assert.ok(e.errors.some(x=>/connectors\[1\].*"fn"/.test(x)), 'reason for the bad connector');
  a.run(`applyImport(analyzeImport(parseImport(${JSON.stringify(JSON.stringify(pack))})))`);
  for(const uid of ['cn:nonetheless','col:take a seat','wf:drive','tr:px1','pv:look out']) assert.ok(UNITSHAS(a, uid), uid);
  same(a.run('S.learnList'), ['cn:nonetheless','pv:look out']);
  assert.ok(a.run('!!genFor(UNITS.get("col:take a seat"), { only:["colverb"] })'));
  assert.ok(a.run('UNITS.get("pv:look out").wrong.good')==='Look out for the car!');
});

/* ---------- Export ---------- */
test('export v4: uid, format, skill, mode and hint per attempt; units, skills, stuck and own sentences', ()=>{
  const st = v5State();
  const a = boot({ state:st, now:NOW });
  a.run('S.session=null'); a.click({ practise:'pv:give up' }); play(a, halfRight());
  a.run('S.session=null'); a.run('startEx([GEN.pv.complete(UNITS.get("pv:put off"), { rnd:Math.random })], { mode:"practise", uids:["pv:put off"] })');
  a.run('render(); current.ui.text="I always put off my homework."; check("ok")');
  for(let k=0;k<3;k++) a.run(`S.attempts.push({ id:"cn:although", u:"cn:although", t:Date.now()-${k}*60000, r:"bad", ms:1, a:"despite", f:"connfn", s:"use", m:"daily", h:0, q:"x", c:"although" })`);
  const e = a.run('buildExport(true)');
  assert.strictEqual(e.version, 4);
  const last = e.attempts.filter(x=>x.uid==='pv:give up').pop();
  assert.ok(last.format && last.skill && last.mode==='practise' && typeof last.hintShown==='boolean');
  assert.strictEqual(e.attempts[0].uid, 'voc:m01', 'old attempts get their uid');
  assert.ok(e.summary.units.pv.total===84 && e.summary.accuracyBySkill && e.summary.accuracyByFormat && e.summary.accuracyByFormatGroup);
  assert.ok(e.summary.stuck.some(s=>s.uid==='cn:although'));
  assert.ok(e.productions.some(p=>p.uid==='pv:put off' && /homework/.test(p.text)));
  assert.ok(e.unitState['pv:give up'] && e.units['pv:give up'].term==='give up');
  assert.ok(e.summary.minutesPerDay && e.summary.challenges && e.summary.leeches);
});

/* ---------- v6 behaviour that stays ---------- */
test('extra practice skips units answered right recently and offers new ones when nothing is left', ()=>{
  const a = boot({ now:NOW });
  a.run('learnUnit("voc:m01","ok","recognise","choose"); learnUnit("voc:m02","bad","recognise","choose")');
  a.setNow(NOW+H);
  const q = a.run('buildDaily(10, { newBudget:0, noCool:true }).map(x=>x.uid)');
  assert.ok(!q.includes('voc:m01')); assert.ok(q.includes('voc:m02'));
  const b = boot({ now:NOW });
  b.run('learnUnit("voc:m01","ok","recognise","choose")'); b.setNow(NOW+H);
  b.click({ act:'extra' });
  assert.strictEqual(b.run('S.session.mode'), 'extra');
  assert.ok(!b.run('S.session.q').some(x=>x.uid==='voc:m01'), 'the unit right 1 h ago does not come back');
  assert.ok(b.run('S.session.q.filter(isExercise).length') >= 20, 'the session is not short');
  assert.ok(b.toasts.some(t => /new items fill the session/.test(t)), 'the user is told');
});

/* ---------- Review fixes (after the first v7 report) ---------- */
test('short sessions are filled with new units, never with units right in the last 4 hours', ()=>{
  const a = boot({ now:NOW });
  a.run('S.settings.grammarAll=true');
  // Everything seen so far was answered right a moment ago
  a.click({ act:'start' }); play(a, right()); a.click({ act:'finish' });
  const seen = new Set(Object.keys(a.run('S.units')));
  a.setNow(NOW + H); a.toasts.length = 0;
  a.click({ act:'start' });
  const q = a.run('S.session.q.filter(isExercise)');
  assert.ok(q.length >= 20, `only ${q.length} exercises`);
  assert.ok(!q.some(x=>(x.uids||[x.uid]).some(u=>seen.has(u))), 'a cooling unit came back');
  assert.ok(a.toasts.some(t=>/new items fill/.test(t)), 'the user is told');
  // A brand-new user does not get 25 new units on day one: new units get a 2nd and 3rd exercise first
  const b = boot({ now:NOW }); b.click({ act:'start' });
  assert.ok(b.run('new Set(S.session.q.filter(isExercise).map(x=>x.uid)).size') <= 12);
});
test('collocations: verbs that change the meaning are never offered nor accepted (catch / miss the bus)', ()=>{
  const a = boot({ now:NOW });
  for(let k=0;k<30;k++){
    const ex = a.run(`GEN.col.colverb(UNITS.get("col:catch the bus"), { rnd:seeded("c${k}") })`);
    if(!ex) continue;
    assert.ok(!ex.opts.some(o=>/^miss/i.test(o.t)), 'miss offered');
  }
  const g = a.run('GEN.col.gap(UNITS.get("col:catch the bus"), { rnd:seeded("g") })');
  assert.strictEqual(a.run(`gradeEx(${JSON.stringify(g)}, "missed").r`), 'bad');
  assert.strictEqual(a.run(`gradeEx(${JSON.stringify(g)}, ${JSON.stringify(g.answers.find(x=>/^take|^took|^get|^got/i.test(x))||g.answers[0])}).r`), 'ok', 'take/get the bus is right');
  assert.ok(!a.run('UNITS.get("col:make friends").alsoCorrect.includes("have")'), '"have friends" is not accepted');
});
test('connectors: only real equivalents are accepted; same function is not "the same"', ()=>{
  const a = boot({ now:NOW });
  const ex = a.run('GEN.cn.gap(UNITS.get("cn:unless"), { rnd:seeded("u") })');
  assert.strictEqual(a.run(`gradeEx(${JSON.stringify(ex)}, "as long as").r`), 'bad', 'unless ≠ as long as');
  const ex2 = a.run('GEN.cn.gap(UNITS.get("cn:although"), { rnd:seeded("a") })');
  assert.strictEqual(a.run(`gradeEx(${JSON.stringify(ex2)}, "even though").r`), 'ok', 'although = even though');
  for(let k=0;k<20;k++){ const s=a.run(`GEN.cn.samediff(UNITS.get("cn:as soon as"), { rnd:seeded("s${k}") })`); if(s) assert.strictEqual(s.ans, 1, 'as soon as has no listed equivalent here'); }
  // Never offered as a wrong option: one with the same function and pattern
  for(let k=0;k<20;k++){ const c=a.run(`GEN.cn.connfn(UNITS.get("cn:unless"), { rnd:seeded("f${k}"), stage:3 })`); if(c) assert.ok(!c.opts.some(o=>/as long as|in case/i.test(o.t))); }
});
test('verb choice and particle choice always show the meaning (so "took up smoking" is clearly wrong)', ()=>{
  const a = boot({ now:NOW });
  for(const f of ['verbchoice','particle']){
    const ex = a.run(`GEN.pv.${f}(UNITS.get("pv:give up"), { rnd:seeded("v") })`);
    assert.ok(ex && ex.hint && /dejar/.test(ex.hint.es) && /stop/.test(ex.hint.en), f+' has the meaning');
    a.run(`S.session=null; startEx([${JSON.stringify(ex)}, GEN.cn.gap(UNITS.get("cn:although"), { rnd:Math.random })], { mode:"practise", uids:["pv:give up"] })`);
    assert.ok(a.html().includes('stop doing a habit'), f+': meaning on screen');
  }
});
test('approximate synonyms are not used to ask about synonyms', ()=>{
  const a = boot({ now:NOW });
  assert.strictEqual(a.run('UNITS.get("pv:cheer up").syn'), '');
  assert.ok(a.run('expOf(UNITS.get("pv:cheer up")).en.includes("smile")'), 'still shown as "similar to"');
  for(const f of ['synonym','samediff']) assert.strictEqual(a.run(`GEN.pv.${f}(UNITS.get("pv:cheer up"), { rnd:Math.random })`), null);
});
test('irregular verbs have an English meaning, shown in English mode', ()=>{
  const a = boot({ now:NOW, lang:'en' });
  assert.strictEqual(a.run('UNITS.get("irr:swim").en'), 'move through water');
  a.click({ unit:'irr:swim' });
  assert.ok(a.html().includes('move through water') && !a.html().includes('lang="es">nadar'));
  const ex = a.run('GEN.irr.reverse(UNITS.get("irr:swim"), { rnd:seeded("r") })');
  assert.ok(/move through water/.test(ex.pr.en) && !ex.es);
});
test('build the sentence accepts a time/place phrase or a clause moved to the other end', ()=>{
  const a = boot({ now:NOW });
  const ex = { kind:'order', uid:'pv:get up', sol:['I','usually','get','up','at','seven','on','weekdays.'], alts:a.run('orderAlts("I usually *get up* at seven on weekdays.")') };
  const g = arr => a.run(`gradeEx(${JSON.stringify(ex)}, ${JSON.stringify(arr)}).r`);
  assert.strictEqual(g(['I','usually','get','up','at','seven','on','weekdays.']), 'ok');
  assert.strictEqual(g(['On','weekdays','I','usually','get','up','at','seven']), 'ok');
  assert.strictEqual(g(['I','usually','up','get','at','seven','on','weekdays.']), 'bad');
  same(a.run('orderAlts("*Despite* the rain, the match went ahead.")'), ['the match went ahead despite the rain']);
  same(a.run('orderAlts("My grandmother *looked after* me when I was little.")'), ['when i was little my grandmother looked after me']);
  same(a.run('orderAlts("Could you *turn up* the radio?")'), [], 'the practised words never split');
});
test('mixed test: kinds of content, level filter, timer, breakdown and my mistakes', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  a.run(`S.session=null; S.settings.mix={ n:20, level:'all', focus:'balanced', timer:false }`);
  a.click({ act:'mixed' });
  const q = a.run('S.session.q');
  assert.strictEqual(q.length, 20);
  assert.ok(new Set(q.map(x=>areaOf(x.lib))).size >= 5, 'areas');
  play(a, halfRight());
  const html = a.html(); assert.ok(html.includes('By format') && html.includes('By area'));
  a.click({ act:'mixmistakes' });
  assert.strictEqual(a.run('S.session.q.length'), 10, 'only the failed ones');
  const b = boot({ now:NOW });
  b.run(`S.settings.mix={ n:30, level:'B2', focus:'balanced', timer:true }`); b.click({ act:'mixed' });
  assert.ok(b.run('S.session.q').every(x=>x.level==='B2'), 'only B2');
  assert.ok(b.run('S.session.deadline') > NOW);
});
test('daily challenge: same 10 questions all day, writing only, no hints, once a day', ()=>{
  const a = boot({ now:NOW });
  const d1 = a.run('dailyChallengeEx().map(x=>x.key)');
  assert.strictEqual(d1.length, 10);
  a.setNow(NOW + 5*H); same(a.run('dailyChallengeEx().map(x=>x.key)'), d1, 'same day');
  const b = boot({ now:NOW }); b.run('learnUnit("pv:give up","ok","use","particle")');
  same(b.run('dailyChallengeEx().map(x=>x.key)'), d1, 'does not depend on your history');
  a.setNow(NOW + DAY); assert.notStrictEqual(JSON.stringify(a.run('dailyChallengeEx().map(x=>x.key)')), JSON.stringify(d1), 'next day');
  a.setNow(NOW); a.click({ ch:'daily' });
  const q = a.run('S.session.q');
  assert.ok(q.every(x=>['text','multi'].includes(x.kind) && x.skill==='produce' && (!x.hint || x.format==='three')), 'writing only, no hints');
  play(a, ()=>'zzz'.length && 'zzz');
  assert.strictEqual(a.run('S.challenges.daily[dayKey()].max'), 10);
  assert.strictEqual(a.run('Object.keys(S.units).length'), 0, 'challenges do not move the learning state');
  a.click({ ch:'daily' }); assert.ok(a.toasts.some(t => /Already done today/.test(t)));
});
test('speed round and sudden death keep a personal best', ()=>{
  const a = boot({ now:NOW });
  a.click({ ch:'speed' });
  assert.ok(a.run('S.session.deadline') === NOW + 90e3);
  assert.ok(a.run('S.session.q.every(x=>x.kind==="choice")'));
  play(a, right(), 7);
  a.setNow(NOW + 91e3); a.run('sessionTimeUp()');
  assert.strictEqual(a.run('S.challenges.best.speed'), 7);
  a.click({ ch:'sudden' }); play(a, (ex,k) => k<4 ? rightAnswer(ex) : wrongAnswer(ex));
  assert.strictEqual(a.run('S.session.q.length'), 5, 'ends at the first mistake');
  assert.strictEqual(a.run('S.challenges.best.sudden'), 4);
});
test('mistakes review uses only what failed in the last 14 days', ()=>{
  const st = v5State(); st.session = null;
  st.attempts.push({ id:'m05', t:NOW-20*DAY, r:'bad', ms:1, a:'x' });
  const a = boot({ state:st, now:NOW });
  const ids = a.run('recentMistakeUnits()');
  assert.ok(ids.includes('voc:m02') && ids.includes('voc:pk-prep-1'));
  assert.ok(!ids.includes('voc:m05'), 'older than 14 days');
  assert.ok(ids.some(id => id.startsWith('gr:g-pack-1:')), 'grammar test mistakes too');
});
test('grammar in daily practice: only from read topics unless "all topics" is on', ()=>{
  const a = boot({ now:NOW });
  a.run('S.read={ "g-present":1 }');
  const gr = a.run('areaUnits("gr").map(u=>u.item.gtopic)');
  assert.ok(gr.length && gr.every(t=>t==='g-present'));
  a.run('S.settings.grammarAll=true'); assert.ok(a.run('areaUnits("gr").some(u=>u.item.gtopic!=="g-present")'));
  a.run('S.settings.grammarDaily=false'); assert.strictEqual(a.run('areaUnits("gr").length'), 0);
});
test('lesson of the day points at the weakest topic and stays all day', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  const l = a.run('lessonOfDay()');
  assert.strictEqual(l.g.id, 'g-pack-1'); assert.strictEqual(l.why, 'weak');
});
test('Progress shows stages, skills, formats, stuck units, calendar, notebook and records', ()=>{
  const st = v5State(); st.session = null;
  for(let k=0;k<30;k++) st.attempts.push({ id:['m01','m02','g01','w01','t01'][k%5], t:NOW-(k%20)*DAY-k*60e3, r:k%3?'ok':'bad', ms:20000, a:'x', f:k%2?'mcq':'gap' });
  st.challenges = { daily:{}, best:{ speed:9 }, hist:[{ ch:'speed', at:NOW-DAY, score:9, max:12, sec:90 }] };
  const a = boot({ state:st, now:NOW });
  for(let k=0;k<3;k++) a.run(`S.attempts.push({ id:"pv:put off", u:"pv:put off", t:Date.now()-${k}*864e5, r:"bad", ms:1, a:"x", f:"particle", s:"use" })`);
  a.click({ go:'progress' });
  const html = a.html();
  for(const s of ['Libraries by stage', 'Accuracy by skill', 'Accuracy by format', 'Stuck', 'data-unit="pv:put off"', 'Last 8 weeks', 'Mistake notebook', 'Challenge records', 'Learning bank'])
    assert.ok(html.includes(s), 'missing: '+s);
});
test('tags group the mistake notebook and the focused test', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  a.click({ go:'mistakes' });
  assert.ok(a.html().includes('#place-prepositions'));
  a.run('S.session=null'); a.click({ focus:'tag:place-prepositions' });
  same(a.run('S.session.q.map(x=>x.uid)'), ['voc:pk-prep-1']);
  assert.strictEqual(a.run('S.session.mode'), 'focused');
});

/* ---------- Report ---------- */
let failed = 0;
for(const [ok, name, err] of results){
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  if(!ok){ failed++; console.log('    ' + String(err && err.message || err).split('\n').join('\n    ')); }
}
console.log(`\n${results.length - failed}/${results.length} passed`);
if(report.coverage) console.log('coverage:', JSON.stringify(report.coverage));
if(report.variety) console.log('variety:', JSON.stringify(report.variety));
if(report.performance) console.log('performance:', JSON.stringify(report.performance));
if(report.generators) console.log('generated formats:', Object.keys(report.generators.made).length, 'lib.format pairs;', new Set(Object.keys(report.generators.made).map(k=>k.split('.')[1])).size, 'formats');
process.exit(failed ? 1 : 0);
