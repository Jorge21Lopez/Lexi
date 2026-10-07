'use strict';
// Lexi tests: node tests/run.js
const assert = require('assert');
const { boot } = require('./harness');
const { NOW, DAY, v5State } = require('./fixtures');

const results = [];
function test(name, fn){
  try{ fn(); results.push([true, name]); }
  catch(e){ results.push([false, name, e]); }
}

// Visible text of a screen, without tags or attributes
const visible = html => html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');
// Spanish that should never show in English mode (content without _en from packs aside)
const SPANISH = /[¿¡ñ]|\b(el|los|las|una|para|pero|tus|sesión|ejercicios?|palabras?|repaso|también|aquí|está|todavía)\b/i;

// Spanish shown on purpose in English mode: translate prompts, Spanish meanings next to verbs
// (the irregular-verbs table lists the Spanish meaning of each verb on purpose)
const ALLOWED_ES = [/ ES: /, /Españ/];
const SKIP_ES = ['irregular verbs'];
const dropSpanishPrompt = html => html.replace(/<div class="es">[\s\S]*?<\/div>/g, ' ').replace(/<div[^>]* lang="es">[\s\S]*?<\/div>/g, ' ');

// Answers every question of the running session: pick(card, k) returns the answer to give
function play(a, pick, max=200){
  for(let k=0;k<max;k++){
    if(!a.run('!!(S.session && S.session.i<S.session.q.length && view==="session")')) return k;
    if(!a.run('!!current')) a.run('render()');
    const card=a.run('current.card');
    a.run(`check(${JSON.stringify(pick(card, k))})`); a.click({ act:'next' });
  }
  return max;
}
const right = a => card => a.run('correctText(current.card)');
const halfRight = a => (card, k) => k%2 ? 'zzz' : a.run('correctText(current.card)');

// Every screen reachable from the tabs, in the order a user would visit them
const TOUR = [
  ['home', a=>a.click({ go:'home' })],
  ['session', a=>a.click({ act:'start' })],
  ['session answered', a=>{ const it=a.run('current.card'); a.click(it.type==='mcq'?{ opt:'zzz' }:{ act:'dunno' }); }],
  ['session summary', a=>play(a, halfRight(a))],
  ['progress', a=>a.click({ go:'progress' })],
  ['study', a=>a.click({ go:'study' })],
  ['guide page', a=>a.click({ page:'guide:'+a.run('[...PAGES.keys()][0]') })],
  ['grammar page', a=>a.click({ page:'grammar:'+a.run('[...GRAMMAR.keys()][0]') })],
  ['irregular verbs', a=>a.click({ page:'irregular:' })],
  ['phrasal verbs', a=>a.click({ page:'phrasal:' })],
  ['templates', a=>a.click({ go:'templates' })],
  ['note', a=>a.click({ newnote:'general' })],
  ['speaking', a=>a.click({ go:'speak' })],
  ['tests', a=>a.click({ go:'tests' })],
  ['topic test', a=>a.click({ topic:a.run('[...GRAMMAR.keys()][0]') })],
  ['topic test checked', a=>a.click({ act:'checktask' })],
  ['result', a=>a.click({ act:'finishrun' })],
  ['part', a=>a.click({ part:'uoe:4' })],
  ['part checked', a=>{ a.click({ act:'checktask' }); a.click({ act:'finishrun' }); }],
  ['mock exam', a=>a.click({ paper:'pet-r1' })],
  ['mock handed in', a=>a.click({ act:'finishrun' })],
  ['irregular test', a=>{ a.click({ act:'irrtest' }); a.click({ act:'checktask' }); }],
  ['phrasal test', a=>{ a.click({ act:'quitrun' }); a.click({ act:'phrtest' }); }],
  ['writing', a=>a.click({ go:'writing' })],
  ['write', a=>a.click({ new:'free' })],
  ['writing mock', a=>a.click({ act:'wmock' })],
  ['mixed test', a=>{ a.click({ go:'tests' }); a.click({ mix:'n', val:'10' }); a.click({ act:'mixed' }); }],
  ['mixed test summary', a=>play(a, halfRight(a))],
  ['practise my mistakes', a=>a.click({ act:'mixmistakes' })],
  ['mixed result', a=>{ play(a, right(a)); a.click({ result:a.run('S.tests.filter(t=>t.kind==="mixed")[0].id') }); }],
  ['daily challenge', a=>a.click({ ch:'daily' })],
  ['daily challenge done', a=>play(a, halfRight(a))],
  ['speed round', a=>a.click({ ch:'speed' })],
  ['speed round over', a=>{ play(a, right(a), 5); a.run('sessionTimeUp()'); }],
  ['sudden death', a=>{ a.click({ ch:'sudden' }); play(a, (c,k)=>k<3?a.run('correctText(current.card)'):'zzz'); }],
  ['no hints', a=>{ a.click({ ch:'nohints' }); }],
  ['b2 only', a=>{ a.click({ ch:'b2' }); play(a, halfRight(a)); }],
  ['mistakes review', a=>{ a.click({ ch:'mistakes' }); }],
  ['home after challenges', a=>a.click({ act:'finish' })],
  ['progress full', a=>a.click({ go:'progress' })],
  ['mistake notebook', a=>a.click({ go:'mistakes' })],
  ['notebook filtered', a=>a.click({ mfilter:a.run('mistakeLog()[0].cat') })],
  ['item card', a=>a.click({ item:a.run('mistakeLog().find(e=>e.id).id') })],
  ['weak point practice', a=>{ a.click({ go:'progress' }); const f=a.run('weakPoints()[0]?.only'); if(f) a.click({ focus:f }); }],
  ['lesson page', a=>{ a.click({ act:'finish' }); a.click({ page:'grammar:'+a.run('lessonOfDay().g.id') }); }],
  ['data', a=>a.click({ go:'data' })],
];

for(const [label, state] of [['empty', null], ['v5 state', v5State]]){
  for(const lang of ['en', 'es']){
    test(`tour (${label}, ${lang}): every screen renders`, ()=>{
      const a = boot({ state:state && state(), lang, now:NOW });
      const leaks = [];
      for(const [name, step] of TOUR){
        step(a);
        const html = a.html();
        assert.ok(html.length > 50, `${name}: empty screen`);
        assert.ok(!/undefined|NaN|\[object Object\]/.test(visible(html)), `${name}: shows undefined/NaN: ${visible(html).match(/.{0,60}(undefined|NaN|\[object Object\]).{0,30}/)?.[0]}`);
        if(lang === 'en' && !SKIP_ES.includes(name)){
          const m = visible(dropSpanishPrompt(html)).match(new RegExp('.{0,40}' + SPANISH.source + '.{0,40}', 'i'));
          if(m && !ALLOWED_ES.some(r => r.test(m[0]))) leaks.push(`${name}: …${m[0]}…`);
        }
      }
      assert.deepStrictEqual(leaks, [], 'Spanish text in English mode');
    });
  }
}

test('v5 state loads without losing anything', ()=>{
  const st = v5State(), a = boot({ state:st, now:NOW });
  assert.strictEqual(a.run('S.packs.length'), 1);
  assert.strictEqual(a.run('S.attempts.length'), st.attempts.length);
  assert.deepStrictEqual(Object.keys(a.run('S.srs')).sort(), Object.keys(st.srs).sort());
  assert.strictEqual(a.run('S.tests.length'), 1);
  assert.ok(a.run('ITEMS.has("pk-prep-1") && GRAMMAR.has("g-pack-1") && PAPERS.has("gen-b1-1") && PHRASAL.has("set off")'));
  a.run('save()');
  const saved = JSON.parse(a.store.get('lexi:v1'));
  for(const k of Object.keys(st)) assert.ok(k in saved, `field ${k} lost on save`);
});

/* ---------- v6 phase 1: fixes from real data ---------- */
const H = 3600e3;
function srsState(entries){
  const st = v5State(); st.session = null; st.srs = {};
  for(const [id, hoursAgo, r] of entries) st.srs[id] = { e:2.5, i:1, r, l:r?0:1, first:NOW-2*DAY, last:NOW-hoursAgo*H, due:NOW+DAY };
  return st;
}

test('extra review skips items answered right in the last 3 hours', ()=>{
  const a = boot({ state:srsState([['m01',1,1], ['m02',1,0], ['m03',5,1]]), now:NOW });
  const q = a.run('buildQueue(10, "extra")');
  assert.ok(!q.includes('m01'), 'right 1 h ago must not come back');
  assert.ok(q.includes('m02'), 'wrong 1 h ago should come back');
  assert.ok(q.includes('m03'), 'right 5 h ago can come back');
});

test('extra review with nothing left offers new words', ()=>{
  const a = boot({ state:srsState([['m01',1,1], ['m02',2,1]]), now:NOW });
  a.click({ act:'extra' });
  assert.strictEqual(a.run('S.session.mode'), 'new');
  assert.ok(a.run('S.session.q.every(id=>!S.srs[id])'), 'only unseen items');
  assert.ok(a.toasts.some(t => /new words/.test(t)));
});

test('vocabulary answers ignore a leading article or "to"', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  const g = (id, ans) => a.run(`grade(ITEMS.get(${JSON.stringify(id)}), ${JSON.stringify(ans)})`);
  assert.strictEqual(g('pk-tr-1', 'the personal growth'), 'ok');
  assert.strictEqual(g('pk-tr-1', 'personal growth'), 'ok');
  assert.strictEqual(g('pk-tr-2', 'to agree'), 'ok');
  assert.strictEqual(g('pk-tr-2', 'agree'), 'ok');
  assert.strictEqual(g('pk-tr-3', 'to be honest'), 'ok');
  assert.strictEqual(g('pk-tr-3', 'be honest'), 'bad', '"to" is part of the expected answer');
  assert.strictEqual(g('pk-tr-1', 'the personal grwth'), 'near');
  assert.strictEqual(g('pk-prep-1', 'arrived in'), 'ok', 'words already in the sentence');
});

test('grammar answers keep articles and "to" strict', ()=>{
  const a = boot({ now:NOW });
  const q = (answers, v, stem='I need some ___.') => a.run(`gradeQ(${JSON.stringify({ kind:'text', stem, answers })}, ${JSON.stringify(v)})`);
  assert.strictEqual(q(['advice'], 'an advice'), 'bad');
  assert.strictEqual(q(['go'], 'to go', 'It made me ___ home.'), 'bad');
  assert.strictEqual(a.run(`grade({ type:'gap', cat:'grammar', prompt:'I need some ___.', answers:['advice'] }, 'an advice')`), 'bad');
});

test('key word transformations compare the rebuilt sentence', ()=>{
  const a = boot({ now:NOW });
  const q = a.run('TASKS.get("u1p4").questions.find(q=>/LAST/.test(q.stem))');
  const g = v => a.run(`gradeQ(${JSON.stringify(q)}, ${JSON.stringify(v)})`);
  assert.strictEqual(g('since I last went'), 'ok');
  assert.strictEqual(g("It's months since I last went to the cinema."), 'ok', 'whole sentence');
  assert.strictEqual(g('months since I last went'), 'ok', 'word before the gap');
  assert.strictEqual(g('since I last went to the cinema'), 'ok', 'words after the gap');
  assert.strictEqual(g('since I went last'), 'bad');
  assert.strictEqual(a.run(`gradeQ({ kind:'text', stem:'Sue ___ the job.\\nI', answers:['was offered'] }, 'Sue was offered')`), 'ok');
});

test('preposition gaps are labelled and show their hint', ()=>{
  for(const lang of ['en', 'es']){
    const st = v5State(); st.session = { q:['pk-prep-1'], i:0, retried:[], results:[], started:NOW, answered:-1 };
    const a = boot({ state:st, lang, now:NOW });
    a.click({ act:'resume' });
    const html = a.html();
    assert.ok(html.includes(lang === 'en' ? '>Preposition<' : '>Preposición<'), 'category label');
    assert.ok(html.includes('city or country'), 'hint visible before answering');
  }
});

/* ---------- v6: formats and variety ---------- */
test('format rotates with maturity: choose → write with hint → write → write/dictation', ()=>{
  const a = boot({ now:NOW });
  const f = (id, r) => a.run(`S.srs[${JSON.stringify(id)}]=${r===null?'undefined':`{ e:2.5, i:1, r:${r}, l:0, due:0, last:0 }`}; pickFormat(ITEMS.get(${JSON.stringify(id)}))`);
  assert.strictEqual(f('g01', null), 'mcq', 'new gap item with enough distractors → choose');
  assert.strictEqual(f('g01', 1), 'gap_hint');
  assert.strictEqual(f('g01', 2), 'gap');
  assert.strictEqual(f('g01', 3), 'gap');
  const late = new Set([4,5,6,7].map(r => f('g01', r)));
  assert.ok(late.has('gap') && late.has('dictation'), 'mature items alternate write and dictation: '+[...late]);
  assert.strictEqual(f('m01', 1), 'gap_hint', 'mcq item moves to writing');
  const card = a.run('presentAs(ITEMS.get("m01"), { force:"gap_hint" })');
  assert.strictEqual(card.type, 'gap'); assert.ok(card.hintAlways && /Starts with/.test(card.hint_en));
  assert.strictEqual(a.run('grade(presentAs(ITEMS.get("m01"), { force:"gap" }), "cancel")'), 'ok');
  const mcq = a.run('presentAs(ITEMS.get("g01"), { force:"mcq" })');
  assert.strictEqual(mcq.options.length, 4); assert.ok(mcq.options.includes('advice'));
  assert.strictEqual(new Set(mcq.options).size, 4, 'no repeated options');
  const dict = a.run('presentAs(ITEMS.get("g01"), { force:"dictation" })');
  assert.ok(dict.text.includes('advice') && !dict.text.includes('___'));
});

test('daily sessions: never two of the same category in a row, at least 40 % production (50 sessions)', ()=>{
  const a = boot({ now:NOW });
  let consecutive = 0, checked = 0;
  for(let k=0;k<50;k++){
    a.run('S.daily={}; S.srs={}; S.session=null');
    // Some seen items so that reviews and new ones mix
    if(k%2) a.run('practiceItems().slice(0,40).forEach((it,i)=>{ S.srs[it.id]={ e:2.5, i:1, r:i%5, l:0, due:0, last:0 }; })');
    a.click({ act:'start' });
    const q = a.run('S.session.q'), fmt = a.run('S.session.fmt'), cats = q.map(id => a.run(`ITEMS.get(${JSON.stringify(id)}).cat`));
    // Only count it when it could be avoided: no category takes more than half the session
    const most = Math.max(...Object.values(cats.reduce((m,c)=>(m[c]=(m[c]||0)+1, m), {})));
    if(most <= Math.ceil(cats.length/2)) for(let i=1;i<cats.length;i++) if(cats[i]===cats[i-1]) consecutive++;
    const formats = q.map(id => fmt[id] || a.run(`pickFormat(ITEMS.get(${JSON.stringify(id)}))`));
    const prod = formats.filter(f => f !== 'mcq').length;
    assert.ok(prod/q.length >= 0.4, `session ${k}: ${prod}/${q.length} production`);
    checked++;
  }
  assert.strictEqual(consecutive, 0, 'same category twice in a row');
  assert.strictEqual(checked, 50);
});

test('every attempt records format, mode and whether the hint was shown', ()=>{
  const a = boot({ now:NOW });
  a.click({ act:'start' }); play(a, right(a), 3);
  const at = a.run('S.attempts');
  assert.ok(at.length >= 3);
  for(const x of at){ assert.ok(x.f, 'format'); assert.strictEqual(x.m, 'daily'); assert.ok(x.h===0 || x.h===1); }
});

/* ---------- v6: mixed practice ---------- */
test('a 20-question mixed test mixes at least 3 kinds of content and shows the breakdown', ()=>{
  for(const focus of ['balanced', 'weak']){
    const a = boot({ state:v5State(), now:NOW });
    a.run(`S.session=null; S.settings.mix={ n:20, level:'all', focus:'${focus}', timer:false }`);
    a.click({ act:'mixed' });
    const q = a.run('S.session.q');
    assert.strictEqual(q.length, 20);
    const groups = new Set(q.map(id => a.run(`mixGroup(ITEMS.get(${JSON.stringify(id)}))`)));
    assert.ok(groups.size >= 3, `${focus}: only ${[...groups]}`);
    const g = q.filter(id => id.startsWith('gq:')).length;
    if(focus==='balanced') assert.ok(g >= 7 && g <= 9, `≈40 % grammar, got ${g}`);
    play(a, halfRight(a));
    const html = a.html();
    assert.ok(html.includes('By category') && html.includes('By grammar topic'), 'breakdown on screen');
    const rec = a.run('S.tests[S.tests.length-1]');
    assert.strictEqual(rec.kind, 'mixed'); assert.strictEqual(rec.max, 20);
    assert.ok(Object.keys(rec.breakdown.byCategory).length >= 3);
    a.click({ act:'mixmistakes' });
    assert.strictEqual(a.run('S.session.q.length'), 10, 'practise my mistakes = only the failed ones');
  }
});

test('mixed test: level filter, timer and spaced repetition for vocabulary', ()=>{
  const a = boot({ now:NOW });
  a.run(`S.settings.mix={ n:30, level:'B2', focus:'balanced', timer:true }`);
  a.click({ act:'mixed' });
  const q = a.run('S.session.q');
  assert.ok(q.every(id => a.run(`ITEMS.get(${JSON.stringify(id)}).level`) === 'B2'), 'only B2');
  assert.ok(a.run('S.session.deadline') > NOW);
  const vocab = q.find(id => !id.includes(':'));
  play(a, right(a));
  assert.ok(a.run(`!!S.srs[${JSON.stringify(vocab)}]`), 'vocabulary updates spaced repetition');
  assert.ok(!a.run('Object.keys(S.srs).some(id=>id.startsWith("irr:"))'), 'irregular verbs stay out of it');
});

test('grammar papers from packs are listed in Mixed practice, not in Mock exams', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  a.click({ go:'tests' });
  const html = a.html(), mix = html.indexOf('Mixed practice'), mock = html.indexOf('Mock exams'), at = html.indexOf('data-paper="gen-b1-1"');
  assert.ok(at > mix && at < mock, 'gen-b1-1 sits in the mixed section');
});

test('grammar in daily sessions: from read topics, ~25 % of the new ones, stable ids', ()=>{
  const a = boot({ now:NOW });
  a.run('S.read={ "g-present":1 }');
  const q = a.run('buildQueue(12, "daily")'), g = q.filter(id => id.startsWith('gq:'));
  assert.strictEqual(g.length, 3, '3 of 12 new');
  assert.ok(g.every(id => id.startsWith('gq:g-present:')), 'only from the topic read');
  a.run('S.settings.grammarAll=true');
  assert.ok(a.run('grammarNew().some(i=>i.gtopic!=="g-present")'));
  a.run('S.settings.grammarDaily=false');
  assert.ok(!a.run('buildQueue(12, "daily")').some(id => id.startsWith('gq:')));
  const id1 = a.run('gqId("g-present", { q:"My brother ___ football every Saturday." })');
  assert.ok(a.run(`ITEMS.has(${JSON.stringify(id1)})`), 'id depends on the question, not its position');
  assert.ok(!a.run('practiceItems().some(i=>i.virtual)'), 'grammar does not count as words');
});

/* ---------- v6: challenges ---------- */
test('daily challenge: same 10 questions all day, different the next day, once a day', ()=>{
  const a = boot({ now:NOW });
  const d1 = a.run('dailyChallengeIds()');
  assert.strictEqual(d1.length, 10);
  a.setNow(NOW + 5*H);
  const ids = x => JSON.stringify(x);
  assert.strictEqual(ids(a.run('dailyChallengeIds()')), ids(d1), 'same day');
  const b = boot({ now:NOW });
  assert.strictEqual(ids(b.run('dailyChallengeIds()')), ids(d1), 'same on another run');
  a.setNow(NOW + DAY);
  assert.notStrictEqual(ids(a.run('dailyChallengeIds()')), ids(d1), 'next day');
  assert.ok(d1.some(id => a.run(`ITEMS.get(${JSON.stringify(id)}).level`) === 'B2'), 'includes B2');
  a.setNow(NOW);
  a.click({ ch:'daily' });
  for(let k=0;k<10;k++){ a.run('render()'); const c=a.run('current.card'); assert.notStrictEqual(c.type, 'mcq', 'writing only'); assert.ok(c.hintAlways || !c.hint, 'no optional hints'); a.run('check("zzz")'); a.click({ act:'next' }); }
  assert.strictEqual(JSON.stringify(a.run('S.challenges.daily[dayKey()]')), JSON.stringify({ score:0, max:10 }));
  assert.strictEqual(a.run('Object.keys(S.srs).length'), 0, 'challenges do not move the spaced repetition');
  a.click({ ch:'daily' });
  assert.ok(a.toasts.some(t => /Already done today/.test(t)));
});

test('speed round and sudden death keep a personal best', ()=>{
  const a = boot({ now:NOW });
  a.click({ ch:'speed' });
  assert.ok(a.run('S.session.deadline') === NOW + 90e3);
  play(a, right(a), 7); a.run('render()');
  assert.strictEqual(a.run('current.card.type'), 'mcq', 'choice questions');
  a.setNow(NOW + 91e3); a.run('sessionTimeUp()');
  assert.strictEqual(a.run('S.challenges.best.speed'), 7);
  a.click({ ch:'sudden' });
  play(a, (c,k) => k<4 ? a.run('correctText(current.card)') : 'zzz');
  assert.strictEqual(a.run('S.session.q.length'), 5, 'ends at the first mistake');
  assert.strictEqual(a.run('S.challenges.best.sudden'), 4);
  a.click({ ch:'sudden' }); play(a, (c,k) => k<2 ? a.run('correctText(current.card)') : 'zzz');
  assert.strictEqual(a.run('S.challenges.best.sudden'), 4, 'a worse run keeps the record');
  assert.strictEqual(a.run('S.challenges.hist.length'), 3);
});

test('mistakes review uses only what failed in the last 14 days', ()=>{
  const st = v5State(); st.session = null;
  st.attempts.push({ id:'m05', t:NOW-20*DAY, r:'bad', ms:1, a:'x' });
  const a = boot({ state:st, now:NOW });
  const ids = a.run('recentMistakeIds()');
  assert.ok(ids.includes('m02') && ids.includes('pk-prep-1'));
  assert.ok(!ids.includes('m05'), 'older than 14 days');
  assert.ok(ids.some(id => id.startsWith('gq:g-pack-1:')), 'grammar test mistakes too');
});

/* ---------- v6: Home and Progress ---------- */
test('lesson of the day points at the weakest topic and stays all day', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  const l = a.run('lessonOfDay()');
  assert.strictEqual(l.g.id, 'g-pack-1'); assert.strictEqual(l.why, 'weak');
  a.click({ go:'home' });
  assert.ok(a.html().includes('Lesson of the day') && a.html().includes('data-page="grammar:g-pack-1"'));
});

test('Progress shows calendar, weekly lines, formats, weak points, notebook and records', ()=>{
  const st = v5State(); st.session = null;
  for(let k=0;k<30;k++) st.attempts.push({ id:['m01','m02','g01','w01','t01'][k%5], t:NOW-(k%20)*DAY-k*60e3, r:k%3?'ok':'bad', ms:20000, a:'x', f:k%2?'mcq':'gap' });
  st.challenges = { daily:{}, best:{ speed:9 }, hist:[{ ch:'speed', at:NOW-DAY, score:9, max:12, sec:90 }] };
  st.tests.push({ id:'mk1', kind:'mock', ref:'pet-r1', title:'Reading 1', section:'reading', at:NOW-5*DAY, durationSec:2400, score:20, max:32, parts:[], detail:[], tasks:[] },
                { id:'mk2', kind:'mock', ref:'pet-r1', title:'Reading 1', section:'reading', at:NOW-DAY, durationSec:2400, score:25, max:32, parts:[], detail:[], tasks:[] });
  const a = boot({ state:st, now:NOW });
  a.click({ go:'progress' });
  const html = a.html();
  for(const s of ['Last 8 weeks', 'Accuracy week by week', '<svg class="spark"', 'Accuracy by format', 'Weak points', 'data-focus=', 'Mistake notebook', 'Challenge records', 'Speed round', 'Word bank', 'new available'])
    assert.ok(html.includes(s), 'missing: '+s);
  assert.ok(/class="h[1-4]"/.test(html), 'calendar has active days');
  assert.ok(a.run(`minutesByDay()[dayKey(${NOW-DAY})]`) > 0);
  a.click({ item:'m02' });
  const card = a.html();
  assert.ok(card.includes('Next review') && card.includes('History'), 'item card');
});

test('tags group the mistake notebook and the focused test', ()=>{
  const a = boot({ state:v5State(), now:NOW });
  a.click({ go:'mistakes' });
  assert.ok(a.html().includes('#place-prepositions'));
  a.click({ mfilter:'tag:place-prepositions' });
  assert.ok(a.html().includes('arrived ___ London') && !a.html().includes('crecimiento'));
  a.run('S.session=null'); a.click({ focus:'tag:place-prepositions' });
  assert.strictEqual(JSON.stringify(a.run('S.session.q')), JSON.stringify(['pk-prep-1']));
  assert.strictEqual(a.run('S.session.mode'), 'focused');
});

/* ---------- v6: export ---------- */
test('export v3 carries format, mode, minutes, challenges, leeches and breakdowns', ()=>{
  const st = v5State(); st.srs.m02.l = 5;
  const a = boot({ state:st, now:NOW });
  a.run('S.session=null'); a.click({ act:'mixed' }); play(a, halfRight(a));
  const e = a.run('buildExport(true)');
  assert.strictEqual(e.version, 3);
  const last = e.attempts[e.attempts.length-1];
  assert.ok(last.format && last.mode === 'mixed' && typeof last.hintShown === 'boolean');
  assert.strictEqual(e.attempts[0].mode, 'daily', 'old attempts default to daily');
  assert.ok(e.summary.minutesPerDay && e.summary.accuracyByFormat && e.summary.challenges);
  assert.ok(e.summary.leeches.some(l => l.id === 'm02'));
  const mixed = e.tests.find(t => t.kind === 'mixed');
  assert.ok(mixed.breakdown.byCategory);
});

test('a backup made with v5 restores into v6 with defaults', ()=>{
  const a = boot({ now:NOW });
  a.run(`applyImport({ entries:[{ kind:'backup', data:{ state:${JSON.stringify(v5State())} } }] })`);
  assert.strictEqual(a.run('S.packs.length'), 1);
  assert.ok(a.run('S.settings.grammarDaily === true && S.settings.mix.n === 20 && Array.isArray(S.challenges.hist)'));
});

/* ---------- Report ---------- */
let failed = 0;
for(const [ok, name, err] of results){
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  if(!ok){ failed++; console.log('    ' + String(err && err.message || err).split('\n').join('\n    ')); }
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
