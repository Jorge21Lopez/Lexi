'use strict';
/* Lexi v7: learning units, exercise generators, learning state and the selection engine.
   Loaded before app.js and only defines things: app.js calls buildUnits() from rebuild(). */

/* ---------- Libraries, areas and stages ---------- */
const LIB_L = { pv:['Phrasal verbs','Phrasal verbs'], cn:['Connectors','Conectores'], col:['Collocations','Collocations'], irr:['Irregular verbs','Verbos irregulares'],
  wf:['Word families','Familias de palabras'], tr:['Transformations','Transformaciones'], voc:['Vocabulary','Vocabulario'], gr:['Grammar','Gramática'] };
const STUDY_LIBS = ['pv','cn','col','irr','wf','tr'];
const AREAS = ['voc','pv','col','cn','irr','uoe','gr'];
const AREA_L = { voc:['Vocabulary','Vocabulario'], pv:['Phrasal verbs','Phrasal verbs'], col:['Collocations','Collocations'], cn:['Connectors','Conectores'],
  irr:['Irregular verbs','Irregulares'], uoe:['Use of English','Use of English'], gr:['Grammar','Gramática'] };
const areaOf = lib => lib==='wf' || lib==='tr' ? 'uoe' : lib;
const PRESETS = {
  balanced:{ voc:20, pv:20, col:10, cn:15, irr:10, uoe:15, gr:10 },
  exam:{ voc:10, pv:15, col:10, cn:15, irr:5, uoe:30, gr:15 },
  vocab:{ voc:30, pv:30, col:20, cn:10, irr:10, uoe:0, gr:0 } };
const PRESET_L = { balanced:['Balanced','Equilibrado'], exam:['Exam focus','Enfoque examen'], vocab:['Vocabulary boost','Más vocabulario'], custom:['Custom','Personalizado'] };
const STAGE_L = [['New','Nueva'],['Learning','Aprendiendo'],['Familiar','Familiar'],['Known','Conocida'],['Strong','Afianzada'],['Mastered','Dominada']];
const SKILLS = ['recognise','understand','use','produce'];
const SKILL_L = { recognise:['Recognition','Reconocimiento'], understand:['Meaning','Significado'], use:['Usage','Uso'], produce:['Production','Producción'] };
const COOL = 4*3600e3;
const stageTier = s => s<=1 ? 1 : s===2 ? 2 : s===3 ? 3 : 4;

/* ---------- Formats ---------- */
// tier = the stage where the format is preferred (1: stages 0–1 … 4: stages 4–5)
const FMT = {
  present:{ skill:null, tier:0, kind:'present', l:['New','Nuevo'] },
  flash:{ skill:'recognise', tier:0, kind:'flash', l:['Flashcard','Tarjeta'] },
  meaning:{ skill:'understand', tier:1, kind:'choice', l:['Meaning in context','Significado en contexto'], ins:['What does the highlighted part mean here?','¿Qué significa aquí la parte resaltada?'] },
  reverse:{ skill:'understand', tier:1, kind:'choice', l:['Which one means…?','¿Cuál significa…?'], ins:['Which one has this meaning?','¿Cuál tiene este significado?'] },
  match:{ skill:'understand', tier:1, kind:'match', l:['Matching','Emparejar'], ins:['Match each one with its meaning.','Empareja cada uno con su significado.'] },
  synonym:{ skill:'understand', tier:2, kind:'choice', l:['Synonym swap','Sinónimo'], ins:['Which one could replace the words in capitals?','¿Cuál puede sustituir a lo que está en mayúsculas?'] },
  samediff:{ skill:'understand', tier:2, kind:'choice', l:['Same or different?','¿Igual o distinto?'], ins:['Do these two sentences mean the same?','¿Significan lo mismo estas dos frases?'] },
  situation:{ skill:'understand', tier:2, kind:'choice', l:['Which situation?','¿Qué situación?'], ins:['Which one describes this situation?','¿Cuál describe esta situación?'] },
  listen:{ skill:'understand', tier:2, kind:'choice', l:['Listen and choose','Escucha y elige'], ins:['Listen to the sentence and choose the meaning.','Escucha la frase y elige el significado.'] },
  oddone:{ skill:'use', tier:2, kind:'choice', l:['Odd one out','La que sobra'], ins:['Which sentence is wrong?','¿Qué frase es incorrecta?'] },
  natural:{ skill:'use', tier:2, kind:'choice', l:['Natural or not?','¿Natural o no?'], ins:['Is this sentence correct and natural?','¿Es esta frase correcta y natural?'] },
  particle:{ skill:'use', tier:1, kind:'choice', l:['Particle choice','Elige la partícula'], ins:['Choose the particle that gives this meaning.','Elige la partícula que da este significado.'] },
  verbchoice:{ skill:'use', tier:1, kind:'choice', l:['Verb choice','Elige el verbo'], ins:['Choose the verb that gives this meaning.','Elige el verbo que da este significado.'] },
  colverb:{ skill:'use', tier:2, kind:'choice', l:['Collocation','Collocation'], ins:['Which verb goes with the noun?','¿Qué verbo va con el nombre?'] },
  connfn:{ skill:'use', tier:2, kind:'choice', l:['Linking word','Conector'], ins:['Choose the right linking word.','Elige el conector correcto.'] },
  mccloze:{ skill:'use', tier:2, kind:'choice', l:['Multiple-choice cloze','Elige la palabra'], ins:['Choose the word that best fits the gap.','Elige la palabra que mejor encaja en el hueco.'] },
  ktchoice:{ skill:'use', tier:2, kind:'choice', l:['Transformation','Transformación'], ins:['Which words complete the second sentence so it means the same?','¿Qué palabras completan la segunda frase para que signifique lo mismo?'] },
  formchoice:{ skill:'use', tier:2, kind:'choice', l:['Form in context','Forma en contexto'], ins:['Choose the correct form of the verb.','Elige la forma correcta del verbo.'] },
  wfchoice:{ skill:'recognise', tier:1, kind:'choice', l:['Word form','Forma de la palabra'], ins:['Which form of the word fits the gap?','¿Qué forma de la palabra encaja en el hueco?'] },
  group:{ skill:'recognise', tier:1, kind:'choice', l:['Pattern groups','Grupos de verbos'], ins:['Which verb follows the same pattern?','¿Qué verbo sigue el mismo patrón?'] },
  choose:{ skill:'recognise', tier:1, kind:'choice', l:['Choose the word','Elige la palabra'], ins:['Choose the word that fits.','Elige la palabra que encaja.'] },
  gq:{ skill:'use', tier:1, kind:'choice', l:['Grammar','Gramática'], ins:['Choose or write the correct answer.','Elige o escribe la respuesta correcta.'] },
  join:{ skill:'use', tier:3, kind:'choice', l:['Join the sentences','Une las frases'], ins:['Which sentence joins the two ideas correctly?','¿Qué frase une bien las dos ideas?'] },
  spotfix:{ skill:'use', tier:3, kind:'tap', l:['Spot and fix','Encuentra el error'], ins:['Tap the mistake, then write the correction.','Toca el error y escribe la corrección.'] },
  order:{ skill:'use', tier:3, kind:'order', l:['Build the sentence','Ordena la frase'], ins:['Tap the words in the right order.','Toca las palabras en el orden correcto.'] },
  gap_hint:{ skill:'produce', tier:2, kind:'text', l:['Gap with a hint','Hueco con pista'], ins:['Complete the sentence. The hint gives the meaning.','Completa la frase. La pista da el significado.'] },
  gap:{ skill:'produce', tier:3, kind:'text', l:['Gap','Hueco'], ins:['Complete the sentence.','Completa la frase.'] },
  form:{ skill:'produce', tier:3, kind:'text', l:['Correct form','Forma correcta'], ins:['Write the words in brackets in the correct form.','Escribe lo que va entre paréntesis en la forma correcta.'] },
  wordform:{ skill:'produce', tier:3, kind:'text', l:['Word formation','Formación de palabras'], ins:['Use the word in capitals to form a word that fits the gap.','Usa la palabra en mayúsculas para formar una que encaje en el hueco.'] },
  three:{ skill:'produce', tier:1, kind:'multi', l:['Three forms','Tres formas'], ins:['Write the past simple and the past participle.','Escribe el pasado y el participio.'] },
  translate:{ skill:'produce', tier:4, kind:'text', l:['Say it in English','Dilo en inglés'], ins:['Write it in English.','Escríbelo en inglés.'] },
  dictation:{ skill:'produce', tier:4, kind:'text', l:['Dictation','Dictado'], ins:['Listen and write the sentence.','Escucha y escribe la frase.'] },
  listenwrite:{ skill:'produce', tier:4, kind:'multi', l:['Listen and write','Escucha y escribe'], ins:['Listen and write the three forms.','Escucha y escribe las tres formas.'] },
  kwt:{ skill:'produce', tier:4, kind:'text', l:['Key word transformation','Transformación con palabra clave'], ins:['Complete the second sentence so it means the same as the first. Use the word given (2–5 words).','Completa la segunda frase para que signifique lo mismo que la primera. Usa la palabra dada (2–5 palabras).'] },
  wfgrid:{ skill:'produce', tier:4, kind:'multi', l:['Word family grid','Tabla de la familia'], ins:['Complete the word family.','Completa la familia de palabras.'] },
  opencloze:{ skill:'produce', tier:4, kind:'multi', l:['Open cloze','Huecos abiertos'], ins:['Write one word in each gap.','Escribe una palabra en cada hueco.'] },
  complete:{ skill:'produce', tier:4, kind:'self', l:['Your own sentence','Tu propia frase'], ins:['Write your own sentence, then compare it with the model.','Escribe tu propia frase y compárala con el modelo.'] }
};
const MULTI_UNIT = ['match','opencloze'];

/* ---------- Units ---------- */
let UNITS = new Map(), BYLIB = {}, PV_BY_VERB = new Map(), PV_BY_PART = new Map();
const lc = s => String(s||'').toLowerCase().replace(/[’‘]/g,"'");
const list = v => Array.isArray(v) ? v : String(v||'').split(',').map(s=>s.trim()).filter(Boolean);
const wrongOf = w => !w ? null : typeof w==='string' ? (w.includes('=>') ? { bad:w.split('=>')[0].trim(), good:w.split('=>')[1].trim() } : null) : (w.bad && w.good ? w : null);
// Base library plus the active packs; a pack entry with the same key replaces the base one
function libEntries(base, packKey, keyFn){
  const m=new Map(); for(const x of window[base]||[]) m.set(keyFn(x), x);
  for(const p of S.packs) if(!p.off) for(const x of p[packKey]||[]) if(x) m.set(keyFn(x), Object.assign({}, x, { pack:p.id }));
  return [...m.values()];
}
function buildUnits(){
  UNITS=new Map(); BYLIB={}; PV_BY_VERB=new Map(); PV_BY_PART=new Map();
  for(const l of Object.keys(LIB_L)) BYLIB[l]=[];
  const add=u=>{ UNITS.set(u.uid, u); BYLIB[u.lib].push(u); };
  const PX=window.LEXI_PHRASAL_EXTRA||{};
  for(const p of PHRASAL.values()){
    const x=Object.assign({}, PX[p.v]||{}, p), parts=p.v.split(' ');
    const u={ uid:'pv:'+p.v, lib:'pv', term:p.v, level:x.level||'B1', theme:x.theme||'otros', es:x.es||x.en, en:x.en||x.es, ex:x.ex||[], sep:!!x.sep,
      syn:/^~/.test(x.syn||'')?'':(x.syn||''), synNear:String(x.syn||'').replace(/^~/,''), register:x.register||'', confuseWith:list(x.confuseWith), alsoCorrect:list(x.alsoCorrect), wrong:wrongOf(x.wrong),
      pm:x.particleMeaning||'', pm_en:x.particleMeaning_en||x.particleMeaning||'', sit:x.sit||'', verb:parts[0], part:parts.slice(1).join(' '), pack:x.pack };
    add(u);
    if(!PV_BY_VERB.has(u.verb)) PV_BY_VERB.set(u.verb, []); PV_BY_VERB.get(u.verb).push(u);
    if(!PV_BY_PART.has(u.part)) PV_BY_PART.set(u.part, []); PV_BY_PART.get(u.part).push(u);
  }
  for(const x of libEntries('LEXI_CONNECTORS','connectors',x=>x.w)) add({ uid:'cn:'+x.w, lib:'cn', term:x.w, level:x.level||'B1', theme:x.fn, fn:x.fn, register:x.register||'neutral',
    pattern:x.pattern||'', es:x.es, en:x.en||x.es, ex:x.ex||[], wrong:wrongOf(x.wrong), confuseWith:list(x.confuseWith), alsoCorrect:list(x.alsoCorrect), join:x.join||null, pack:x.pack });
  for(const x of libEntries('LEXI_COLLOCATIONS','collocations',x=>x.c)) add({ uid:'col:'+x.c, lib:'col', term:x.c, level:x.level||'B1', theme:x.theme||'daily', verb:x.verb,
    noun:x.noun, es:x.es, en:x.en||x.es, ex:x.ex||[], wrongVerb:x.wrongVerb||'', alsoCorrect:list(x.alsoCorrect), avoid:list(x.avoid), confuseWith:list(x.confuseWith), pack:x.pack });
  const IX=window.LEXI_IRREGULAR_EXTRA||{};
  for(const v of window.LEXI_IRREGULAR||[]){ const x=IX[v.b]||{};
    add({ uid:'irr:'+v.b, lib:'irr', term:v.b, level:'B1', theme:x.group||'other', group:x.group||'other', p:v.p.split('/'), pp:v.pp.split('/'), es:v.es, en:(window.LEXI_EN?.irregular||{})[v.b]||'', ex:x.ex||[] }); }
  for(const x of libEntries('LEXI_FAMILIES','families',x=>x.base)) add({ uid:'wf:'+x.base, lib:'wf', term:x.base, level:x.level||'B1', theme:'wf', es:x.es||'', en:x.en||'',
    forms:x.forms||{}, alts:x.alts||{}, ex:x.ex||{}, pack:x.pack });
  for(const x of libEntries('LEXI_TRANSFORMATIONS','transformations',x=>x.id)) add({ uid:'tr:'+x.id, lib:'tr', term:x.from, level:x.level||'B2', theme:x.structure||'other',
    structure:x.structure||'', from:x.from, key:x.key, to:x.to, answers:Array.isArray(x.answers)?x.answers:String(x.answers||'').split('/').filter(Boolean), exp:x.exp||'', exp_en:x.exp_en||x.exp||'', pack:x.pack });
  for(const it of ITEMS.values()){
    if(it.retired || it.type==='writing') continue;
    if(!it.virtual) add({ uid:'voc:'+it.id, lib:'voc', term:it.word||correctText(it), level:it.level||'B1', theme:it.topic||'general', item:it });
    else if(it.virtual==='gq') add({ uid:'gr:'+it.id.slice(3), lib:'gr', term:it.word||correctText(it), level:it.level||'B1', theme:it.gtopic, item:it });
  }
}
// The id an attempt is stored under: vocabulary and grammar keep their item ids so older statistics still work
const legacyId = uid => uid.startsWith('voc:') ? uid.slice(4) : uid.startsWith('gr:') ? 'gq:'+uid.slice(3) : uid;
function uidOfItem(id){
  if(UNITS.has('voc:'+id)) return 'voc:'+id;
  if(id.startsWith('gq:')) return 'gr:'+id.slice(3);
  if(id.startsWith('irr:')) return 'irr:'+id.split(':')[1];
  if(id.startsWith('ph-')){ for(const v of PHRASAL.keys()) if(phId(v)===id) return 'pv:'+v; }
  if(UNITS.has(id)) return id;
  return null;
}
const unitOfAttempt = a => a.u || uidOfItem(a.id);
const unitName = u => u.lib==='tr' ? u.from : u.term;
const meaningOf = u => u.lib==='voc'||u.lib==='gr' ? { es:u.item.exp||'', en:u.item.exp_en||'' } : { es:u.es||u.en||'', en:u.en||'' };

/* ---------- Learning state per unit ---------- */
function newUnitState(now){ return { stage:0, due:now, interval:0, ease:2.5, reps:0, seen:0, correct:0, lapses:0, lastSeen:0, lastOk:0, lastBad:0, lastFormats:[], bySkill:{}, okSkills:[], introduced:null, first:now }; }
const ust = uid => S.units[uid] || null;
const stageOf = uid => S.units[uid]?.stage || 0;
// res: ok | near | bad; easy: flashcards "Easy"
function learnUnit(uid, res, skill, format, o={}){
  const now=Date.now(); let s=S.units[uid]; const isNew=!s || !s.seen;
  if(!s) s=S.units[uid]=newUnitState(now);
  s.seen++; s.lastSeen=now; if(format) s.lastFormats=[...(s.lastFormats||[]), format].slice(-5);
  if(skill){ const b=s.bySkill[skill]||(s.bySkill[skill]={ n:0, ok:0 }); b.n++; if(res!=='bad') b.ok++; }
  if(res==='bad'){
    s.lapses++; s.reps=0; s.interval=0; s.ease=Math.max(1.3, s.ease-0.2); s.due=now+10*60000; s.lastBad=now;
    s.stage=Math.max(1, s.stage-1); s.okSkills=[];
  } else {
    s.correct++; s.reps++; s.lastOk=now;
    s.interval = s.reps===1 ? 1 : s.reps===2 ? 3 : Math.round(Math.max(1, s.interval)*s.ease);
    if(res==='near'){ s.ease=Math.max(1.3, s.ease-0.15); s.interval=Math.max(1, Math.round(s.interval*0.6)); } else s.ease=Math.min(3, s.ease+0.05);
    if(o.easy) s.interval=Math.round(s.interval*1.5)+1;
    s.due=startOfDay(now)+s.interval*DAY+4*3600e3;
    if(skill && !s.okSkills.includes(skill)) s.okSkills.push(skill);
    // Up to Familiar with any right answer; from there, right answers in two different skills
    if(s.stage<2){ s.stage++; s.okSkills=[]; }
    else if(s.stage<5 && s.okSkills.length>=2){ s.stage++; s.okSkills=[]; }
  }
  if(!s.introduced && o.introduced) s.introduced=now;
  return isNew;
}
const cooling = (s, now) => s && s.lastOk && now-s.lastOk<COOL && s.due>now && !(s.lastBad>=s.lastOk);
function needsProduction(s){
  if(!s || s.stage<2) return false;
  const und=['understand','use','recognise'].reduce((m,k)=>{ const b=s.bySkill[k]; if(b){ m.n+=b.n; m.ok+=b.ok; } return m; }, { n:0, ok:0 }), pr=s.bySkill.produce;
  return und.n>=3 && und.ok/und.n>=0.8 && (!pr || !pr.n || pr.ok/pr.n<0.6);
}

/* ---------- Verb forms ---------- */
let IRRF=null;
const IRR_EXTRA = { quit:['quit','quit'], split:['split','split'], bet:['bet','bet'], upset:['upset','upset'], wake:['woke','woken'] };
function irrForms(v){
  if(!IRRF){ IRRF=new Map(); for(const x of window.LEXI_IRREGULAR||[]) IRRF.set(x.b, { p:x.p.split('/'), pp:x.pp.split('/') });
    for(const [k,[p,pp]] of Object.entries(IRR_EXTRA)) if(!IRRF.has(k)) IRRF.set(k, { p:[p], pp:[pp] }); }
  if(IRRF.has(v)) return IRRF.get(v);
  for(const pre of ['out','over','under','re','mis','with','fore']) if(v.startsWith(pre) && v.length-pre.length>=2 && IRRF.has(v.slice(pre.length))){
    const f=IRRF.get(v.slice(pre.length)); return { p:f.p.map(x=>pre+x), pp:f.pp.map(x=>pre+x) }; }
  return null;
}
const DOUBLE = new Set(['forget','begin','regret','prefer','occur','admit','travel','cancel','control','refer','permit','label','level','model','quarrel','signal','total','fulfil','compel','equip']);
const cvc = v => DOUBLE.has(v) || /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(v);
function regPast(v){ return /e$/.test(v) ? v+'d' : /[^aeiou]y$/.test(v) ? v.slice(0,-1)+'ied' : cvc(v) ? v+v.slice(-1)+'ed' : v+'ed'; }
function vforms(v){
  const irr=irrForms(v);
  const s = v==='be'?'is' : v==='have'?'has' : v==='do'?'does' : v==='go'?'goes' : /(s|x|z|ch|sh|o)$/.test(v) ? v+'es' : /[^aeiou]y$/.test(v) ? v.slice(0,-1)+'ies' : v+'s';
  const ing = v==='be'?'being' : /ie$/.test(v) ? v.slice(0,-2)+'ying' : /[^aeiouy]e$/.test(v) ? v.slice(0,-1)+'ing' : cvc(v) ? v+v.slice(-1)+'ing' : v+'ing';
  return { base:v, s, ing, past:irr?irr.p:[regPast(v)], pp:irr?irr.pp:[regPast(v)] };
}
function inflect(v, form){ const f=vforms(v); return form==='past'?f.past[0] : form==='pp'?f.pp[0] : form==='s'?f.s : form==='ing'?f.ing : v; }
function inflectPhrase(ph, form){ const [h,...r]=String(ph).split(' '); return [inflect(h, form), ...r].join(' '); }
const BASE_PREV = /^(to|can|could|will|would|shall|should|must|might|may|do|does|did|don't|doesn't|didn't|can't|cannot|won't|wouldn't|couldn't|shouldn't|mustn't|let's|please|always|never)$/;
// Which form of `base` the word is, looking at the word before it; null when it can't be told apart
function detectForm(word, base, prev){
  const w=lc(word), p=lc(prev), f=vforms(base);
  if(w===f.ing) return 'ing';
  if(w===f.s && w!==base) return 's';
  const isB=w===base, isP=f.past.includes(w), isPP=f.pp.includes(w);
  if(!isB && !isP && !isPP) return null;
  const aux=/^(have|has|had|having|am|is|are|was|were|be|been|being|get|got|gets)$/.test(p) || /'(ve|s|d|m|re)$/.test(p);
  if(isPP && aux) return 'pp';
  if(isB && (!p || BASE_PREV.test(p) || /'ll$/.test(p))) return 'base';
  if(isP && !isB) return 'past';
  if(isPP && !isB) return 'pp';
  if(isB && !isP) return 'base';
  return null;
}

/* ---------- Text helpers ---------- */
const oneStar = e => (String(e).match(/\*/g)||[]).length===2;
function splitStar(e){ const m=String(e).match(/^([\s\S]*?)\*([^*]+)\*([\s\S]*)$/); return m ? { pre:m[1], chunk:m[2], post:m[3] } : null; }
const plain = e => String(e||'').replace(/\*/g,'');
const lastWord = s => lc((String(s).trim().split(/\s+/).pop()||'')).replace(/[^a-z']/g,'');
const capFirst = s => s ? s[0].toUpperCase()+s.slice(1) : s;
const matchCase = (model, s) => /^[A-Z]/.test(model) ? capFirst(s) : s;
const toks = s => String(s).trim().split(/\s+/).filter(Boolean);
const normTok = t => lc(t).replace(/[^a-z0-9']/g,'');
function uniqBy(arr, f=x=>lc(x)){ const seen=new Set(), out=[]; for(const x of arr){ const k=f(x); if(!k || seen.has(k)) continue; seen.add(k); out.push(x); } return out; }
function pickOne(arr, rnd){ return arr.length ? arr[Math.floor(rnd()*arr.length)] : null; }
function shuf(arr, rnd){ return shuffleWith([...arr], rnd); }
function pickEx(u, rnd, pred=()=>true){ return pickOne((u.ex||[]).filter(pred), rnd); }
// Where the bad sentence differs from the good one: the tokens to tap and the words that fix them
function diffFix(bad, good){
  const tb=toks(bad), tg=toks(good), nb=tb.map(normTok), ng=tg.map(normTok);
  let p=0; while(p<nb.length && p<ng.length && nb[p]===ng[p]) p++;
  let s=0; while(s<nb.length-p && s<ng.length-p && nb[nb.length-1-s]===ng[ng.length-1-s]) s++;
  const bad_=[]; for(let k=p;k<nb.length-s;k++) if(nb[k]) bad_.push(k);
  if(!bad_.length || bad_.length>3) return null;
  return { toks:tb, bad:bad_, fix:tg.slice(p, tg.length-s).join(' ').replace(/[.,!?;:]+$/,''), good };
}
// Words that tell meanings apart, to avoid two options that both fit
const STOPW = new Set('algo alguien para como sobre desde hasta otra otro una unos unas cosa algun alguna something someone somebody with from that this into your about after them their make have more very when what start stop used'.split(' '));
function keyWords(s){ return new Set(String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').split(/[^a-z]+/).filter(w=>w.length>=4 && !STOPW.has(w))); }
function kw(u){ if(!u._kw) u._kw={ es:keyWords(u.es), en:keyWords(u.en) }; return u._kw; }
function clash(a, b){
  if(a===b || a.uid===b.uid) return true;
  if(a.syn && b.syn && lc(a.syn)===lc(b.syn)) return true;
  if((a.alsoCorrect||[]).map(lc).includes(lc(b.term)) || (b.alsoCorrect||[]).map(lc).includes(lc(a.term))) return true;
  if(a.lib==='cn' && b.lib==='cn' && a.fn===b.fn && a.pattern===b.pattern) return true;
  const A=kw(a), B=kw(b);
  for(const w of A.es) if(B.es.has(w)) return true;
  for(const w of A.en) if(B.en.has(w)) return true;
  return false;
}
// n units of the same library that can't be confused with u (nor with each other); `prefer` go first
function distinctUnits(u, n, rnd, o={}){
  const pool=(o.pool||BYLIB[u.lib]).filter(x=>x!==u && (!o.pred || o.pred(x)));
  const pref=(o.prefer||[]).map(t=>UNITS.get(u.lib+':'+t)).filter(x=>x && pool.includes(x));
  const out=[];
  for(const x of [...shuf(pref, rnd), ...shuf(pool, rnd)]){ if(out.length>=n) break; if(out.includes(x) || clash(u,x) || out.some(y=>clash(x,y))) continue; out.push(x); }
  return out.length>=n ? out : null;
}
const meanOpt = u => ({ t:u.es||u.en, t_en:u.en||u.es });
const termOpt = u => ({ t:unitName(u) });
function choice(right, wrong, rnd){ const all=shuf([right, ...wrong], rnd); return { opts:all, ans:all.indexOf(right) }; }
const YES = { t:'Sí', t_en:'Yes' }, NO = { t:'No', t_en:'No' };
function mk(u, f, o, variant){ return Object.assign({ uid:u.uid, lib:u.lib, format:f, skill:FMT[f].skill, kind:FMT[f].kind, level:u.level||'B1', key:u.uid+'|'+f+(variant!=null?'|'+variant:'') }, o); }

/* ---------- Explanations ---------- */
const PATTERN_L = { '+clause':['+ subject + verb','+ sujeto + verbo'], '+noun/-ing':['+ noun or -ing','+ nombre o -ing'], '+infinitive':['+ infinitive','+ infinitivo'],
  'sentence-initial + comma':['at the start of a sentence, + comma','al principio de la frase, + coma'], 'sentence-initial':['at the start of a sentence','al principio de la frase'],
  'between clauses':['between two clauses','entre dos frases'], 'mid-sentence':['before the main verb','delante del verbo principal'] };
function expOf(u){
  if(u.lib==='pv'){ const sy=u.syn||u.synNear; return { es:`${u.term} = ${u.es}.${sy?` Parecido a "${sy}".`:''}`, en:`${u.term} = ${u.en}.${sy?` Similar to "${sy}".`:''}` }; }
  if(u.lib==='cn'){ const p=PATTERN_L[u.pattern]||[u.pattern,u.pattern]; return { es:`${u.term} = ${u.es} (${p[1]}).`, en:`${u.term} = ${u.en} (${p[0]}).` }; }
  if(u.lib==='col') return { es:`${u.term} = ${u.es}.${u.wrongVerb?` No se dice "${u.wrongVerb} ${u.noun}".`:''}`, en:`${u.term} = ${u.en}.${u.wrongVerb?` Not "${u.wrongVerb} ${u.noun}".`:''}` };
  if(u.lib==='irr'){ const f=`${u.term} – ${u.p.join('/')} – ${u.pp.join('/')}`; return { es:`${f} (${u.es}).`, en:u.en?`${f} (${u.en}).`:`${f}.` }; }
  if(u.lib==='wf'){ const f=Object.values(u.forms).join(', '); return { es:`Familia de ${u.term}: ${f}.`, en:`The ${u.term} family: ${f}.` }; }
  if(u.lib==='tr') return { es:u.exp, en:u.exp_en };
  return { es:u.item?.exp||'', en:u.item?.exp_en||u.item?.exp||'' };
}
const wrongExp = (u, w) => { const base=expOf(u); return { es:`✗ ${w.bad}\n✓ ${w.good}\n${base.es}`, en:`✗ ${w.bad}\n✓ ${w.good}\n${base.en}` }; };

/* ---------- Generators shared by several libraries ---------- */
const G = {
  meaning(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const d=distinctUnits(u, 3, c.rnd, { prefer:u.confuseWith, pred:u.lib==='cn'?x=>x.fn!==u.fn:null }); if(!d) return null;
    return mk(u, 'meaning', Object.assign({ q:e, exp:expOf(u), show:plain(e) }, choice(meanOpt(u), d.map(meanOpt), c.rnd))); },
  reverse(u, c){ const d=distinctUnits(u, 3, c.rnd, { prefer:u.confuseWith, pred:u.lib==='cn'?x=>x.fn!==u.fn:null }); if(!d) return null;
    const m=meaningOf(u); return mk(u, 'reverse', Object.assign({ pr:{ es:m.es, en:m.en }, big:true, exp:expOf(u) }, choice(termOpt(u), d.map(termOpt), c.rnd))); },
  // Only with units already seen: matching is no way to meet a word for the first time
  match(u, c){ if(!c.ignoreState && !S.units[u.uid]?.seen) return null; const seen=BYLIB[u.lib].filter(x=>x!==u && (c.ignoreState || S.units[x.uid]?.seen));
    const d=distinctUnits(u, 4, c.rnd, { pool:seen, pred:u.lib==='cn'?x=>x.fn!==u.fn:null }); if(!d) return null;
    const all=[u, ...d], right=shuf(all.map(x=>x.uid), c.rnd);
    return mk(u, 'match', { uids:all.map(x=>x.uid), pairs:all.map(x=>({ uid:x.uid, l:x.term, r:meanOpt(x) })), rorder:right, exp:expOf(u) }); },
  listen(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const d=distinctUnits(u, 3, c.rnd, { prefer:u.confuseWith, pred:u.lib==='cn'?x=>x.fn!==u.fn:null }); if(!d) return null;
    return mk(u, 'listen', Object.assign({ say:plain(e), auto:true, hide:true, q:e, pr:{ en:`What does "${u.term}" mean in the sentence you heard?`, es:`¿Qué significa "${u.term}" en la frase que has oído?` }, exp:expOf(u), show:plain(e) }, choice(meanOpt(u), d.map(meanOpt), c.rnd))); },
  natural(u, c){ if(!u.wrong) return null; const bad=c.rnd()<0.5, e=bad?u.wrong.bad:plain(pickEx(u, c.rnd)||u.wrong.good);
    return mk(u, 'natural', { q:e, opts:[YES, NO], ans:bad?1:0, exp:wrongExp(u, u.wrong), show:bad?u.wrong.good:e }, bad?'b':'g'); },
  spotfix(u, c){ if(!u.wrong) return null; const d=diffFix(u.wrong.bad, u.wrong.good); if(!d) return null;
    return mk(u, 'spotfix', { toks:d.toks, bad:d.bad, fix:d.fix, show:d.good, exp:wrongExp(u, u.wrong) }); },
  oddone(u, c){ if(!u.wrong) return null; const others=distinctUnits(u, 1, c.rnd, { prefer:u.confuseWith, pred:x=>(x.ex||[]).length });
    const good=uniqBy([...u.ex.map(plain), ...(others?[plain(others[0].ex[0])]:[])]).filter(s=>lc(s)!==lc(u.wrong.bad)).slice(0,3); if(good.length<3) return null;
    const all=shuf([u.wrong.bad, ...good], c.rnd); return mk(u, 'oddone', { opts:all.map(t=>({ t })), ans:all.indexOf(u.wrong.bad), exp:wrongExp(u, u.wrong), show:u.wrong.good }); },
  order(u, c){
    const e=pickEx(u, c.rnd, e=>{ const n=toks(plain(e)).length; if(n<4 || n>11) return false;
      // A separable verb with its object after the particle has two right orders: skip it
      if(u.lib==='pv' && u.sep && oneStar(e)){ const s=splitStar(e); if(s.post.trim() && !/^[.,!?–-]/.test(s.post.trim())) return false; }
      return true; });
    if(!e) return null; const sol=toks(plain(e)); let tiles=shuf(sol, c.rnd), g=0; while(tiles.join(' ')===sol.join(' ') && g++<5) tiles=shuf(sol, c.rnd);
    return mk(u, 'order', { tiles, sol, alts:orderAlts(e), show:plain(e), exp:expOf(u) }); },
  complete(u, c){ if(!(u.ex||[]).length) return null; const start=u.lib==='cn' && /sentence-initial|\+clause/.test(u.pattern) ? capFirst(u.term)+' …' : '';
    return mk(u, 'complete', { pr:{ en:`Write your own sentence with "${u.term}".`, es:`Escribe tu propia frase con "${u.term}".` }, start, model:u.ex.map(plain), exp:expOf(u) }); },
  dictation(u, c){ const e=pickEx(u, c.rnd, e=>toks(plain(e)).length<=16); if(!e) return null; const t=plain(e); return mk(u, 'dictation', { say:t, auto:true, text:t, show:t, exp:expOf(u) }); }
};

/* ---------- Other right orders for "Build the sentence" ---------- */
// A time or place phrase can go at the start or at the end ("I get up at seven on weekdays" / "On weekdays I get up at seven"),
// and a clause opening with a comma can move to the end ("Despite the rain, the match went ahead" / "The match went ahead despite the rain").
// The words practised (between asterisks) never move. Compared as plain words: lower case, no punctuation.
const MOVABLE_END = /^(on|at|in|every|last|next|after|before|during|since|yesterday|today|tomorrow|tonight|this|when|while|if|because|until|as)$/;
const MOVABLE_START = /^(on|at|in|every|last|next|after|before|during|since|when|while|if|although|though|even|despite|because|as|once|until|by)$/;
function orderAlts(e){
  const raw=toks(String(e)), w=raw.map(t=>normTok(t.replace(/\*/g,''))), n=w.length, alts=[];
  let star0=-1, star1=-1; raw.forEach((t,i)=>{ if(t.includes('*')){ if(star0<0) star0=i; star1=i; } });
  // A phrase that moves must hold the practised words entirely or not at all
  const splits=at=>star0>=0 && star0<at && star1>=at;
  // End → start: a time/place phrase or a clause of up to 6 words, never cutting the practised words
  for(let k=1;k<=6;k++){ const at=n-k; if(at<=0) break; if(splits(at)) continue;
    if(MOVABLE_END.test(w[at])) alts.push([...w.slice(at), ...w.slice(0, at)].join(' ')); }
  // Start → end: an opening phrase or clause closed by a comma
  for(let k=1;k<=7 && k<n;k++){ if(!/,$/.test(raw[k-1])) continue; if(MOVABLE_START.test(w[0]) && !splits(k)) alts.push([...w.slice(k), ...w.slice(0, k)].join(' ')); break; }
  return uniqBy(alts.filter(a=>a!==w.join(' ')));
}

/* ---------- Phrasal verbs ---------- */
function pvSplit(u, e){ const s=splitStar(e); if(!s || !oneStar(e)) return null; const w=s.chunk.split(' '), vw=w[0], rest=w.slice(1).join(' ');
  if(lc(rest)!==lc(u.part)) return null; return Object.assign(s, { vw, rest }); }
const GEN_PV = {
  meaning:G.meaning, reverse:G.reverse, match:G.match, listen:G.listen, natural:G.natural, spotfix:G.spotfix, oddone:G.oddone, order:G.order, complete:G.complete, dictation:G.dictation,
  synonym(u, c){ if(!u.syn || !u.ex[0]) return null; const s=pvSplit(u, u.ex[0]); if(!s) return null; const form=detectForm(s.vw, u.verb, lastWord(s.pre)); if(!form || (form==='ing' && /^be /.test(u.syn))) return null;
    const d=distinctUnits(u, 3, c.rnd, { prefer:u.confuseWith }); if(!d) return null;
    return mk(u, 'synonym', Object.assign({ q:`${s.pre}*${inflectPhrase(u.syn, form).toUpperCase()}*${s.post}`, exp:expOf(u), show:plain(u.ex[0]) }, choice(termOpt(u), d.map(termOpt), c.rnd))); },
  samediff(u, c){ if(!u.syn || !u.ex[0]) return null; const s=pvSplit(u, u.ex[0]); if(!s) return null; const form=detectForm(s.vw, u.verb, lastWord(s.pre)); if(!form) return null;
    const same=c.rnd()<0.5; let other=null;
    if(!same){ const d=distinctUnits(u, 1, c.rnd, { prefer:u.confuseWith, pred:x=>x.syn && !(form==='ing' && /^be /.test(x.syn)) }); if(!d) return null; other=d[0]; }
    if(same && form==='ing' && /^be /.test(u.syn)) return null;
    const rep=matchCase(s.chunk, inflectPhrase((other||u).syn, form));
    const exp=other ? { es:`${u.term} = ${u.es}; ${other.syn} = ${other.term} (${other.es}).`, en:`${u.term} = ${u.en}; ${other.syn} = ${other.term} (${other.en}).` } : expOf(u);
    return mk(u, 'samediff', { q:u.ex[0], q2:`${s.pre}*${rep}*${s.post}`, opts:[YES, NO], ans:same?0:1, exp, show:plain(u.ex[0]) }, same?'s':'d'); },
  situation(u, c){ if(!u.sit) return null; const d=distinctUnits(u, 3, c.rnd, { pred:x=>x.theme!==u.theme }); if(!d) return null;
    return mk(u, 'situation', Object.assign({ q:u.sit, exp:expOf(u), show:u.sit }, choice(termOpt(u), d.map(termOpt), c.rnd))); },
  particle(u, c){ const e=pickEx(u, c.rnd, e=>pvSplit(u, e)); if(!e) return null; const s=pvSplit(u, e);
    const real=(PV_BY_VERB.get(u.verb)||[]).filter(x=>x!==u && !clash(u,x)).map(x=>x.part);
    const fill=shuf(['up','down','on','off','out','in','away','back','over','into','for','with','about'], c.rnd);
    const wrong=uniqBy([...shuf(real, c.rnd), ...fill]).filter(p=>lc(p)!==lc(u.part)).slice(0,3); if(wrong.length<3) return null;
    return mk(u, 'particle', Object.assign({ q:`${s.pre}${s.vw} ___${s.post}`, hint:{ es:u.es, en:u.en }, exp:expOf(u), show:plain(e) }, choice({ t:u.part }, wrong.map(t=>({ t })), c.rnd))); },
  verbchoice(u, c){ const e=pickEx(u, c.rnd, e=>pvSplit(u, e)); if(!e) return null; const s=pvSplit(u, e); const form=detectForm(s.vw, u.verb, lastWord(s.pre)); if(!form) return null;
    const real=(PV_BY_PART.get(u.part)||[]).filter(x=>x.verb!==u.verb && !clash(u,x)).map(x=>x.verb);
    const fill=shuf(['get','put','take','make','come','go','look','turn','give','bring','set','keep','break','run'], c.rnd);
    const wrong=uniqBy([...shuf(real, c.rnd), ...fill]).filter(v=>v!==u.verb).map(v=>matchCase(s.vw, inflect(v, form))).filter(v=>lc(v)!==lc(s.vw));
    const w3=uniqBy(wrong).slice(0,3); if(w3.length<3) return null;
    return mk(u, 'verbchoice', Object.assign({ q:`${s.pre}___ ${s.rest}${s.post}`, hint:{ es:u.es, en:u.en }, exp:expOf(u), show:plain(e) }, choice({ t:s.vw }, w3.map(t=>({ t })), c.rnd))); },
  gap_hint(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const s=splitStar(e);
    return mk(u, 'gap_hint', { q:`${s.pre}___${s.post}`, answers:[s.chunk], hint:{ es:u.es, en:u.en }, exp:expOf(u), show:plain(e) }); },
  gap(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const s=splitStar(e), n=toks(s.chunk).length;
    return mk(u, 'gap', { q:`${s.pre}___${s.post}`, answers:[s.chunk], hint:{ es:`${n} palabras, empieza por "${s.chunk[0].toLowerCase()}"`, en:`${n} words, starts with "${s.chunk[0].toLowerCase()}"` }, exp:expOf(u), show:plain(e) }); },
  form(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const s=splitStar(e);
    return mk(u, 'form', { q:`${s.pre}___${s.post}\n(${u.term})`, answers:[s.chunk], exp:expOf(u), show:plain(e) }); },
  translate(u, c){ const es=String(u.es).split(';')[0].trim(), same=BYLIB.pv.filter(x=>String(x.es).split(';')[0].trim()===es).map(x=>x.term);
    return mk(u, 'translate', { es, answers:uniqBy([u.term, ...same, ...u.alsoCorrect]), exp:expOf(u), show:u.term }); }
};

/* ---------- Connectors ---------- */
// Accepted answers: the connector and the ones listed as also correct in its examples
function cnOk(u){ return new Set([u.term, ...u.alsoCorrect].map(lc)); }
// Never offered as a wrong option: the accepted ones plus any with the same function and pattern (they might fit too)
function cnNo(u){ return new Set([...cnOk(u), ...BYLIB.cn.filter(x=>x.fn===u.fn && x.pattern===u.pattern).map(x=>lc(x.term))]); }
const cnWrong = (u, x, no) => !no.has(lc(x.term)) && !(x.alsoCorrect||[]).map(lc).includes(lc(u.term));
const GEN_CN = {
  meaning:G.meaning, reverse:G.reverse, match:G.match, listen:G.listen, natural:G.natural, spotfix:G.spotfix, oddone:G.oddone, order:G.order, complete:G.complete, dictation:G.dictation,
  connfn(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const s=splitStar(e), ok=cnNo(u);
    const hard=c.stage>=3 ? u.confuseWith.map(t=>UNITS.get('cn:'+t)).filter(x=>x && cnWrong(u,x,ok) && (x.pattern!==u.pattern || x.fn!==u.fn)) : [];
    const other=BYLIB.cn.filter(x=>x.fn!==u.fn && cnWrong(u,x,ok)).sort((a,b)=>(b.pattern===u.pattern)-(a.pattern===u.pattern) || c.rnd()-0.5);
    const wrong=uniqBy([...shuf(hard, c.rnd).slice(0,2), ...other.slice(0,6)], x=>x.uid).slice(0,3); if(wrong.length<3) return null;
    return mk(u, 'connfn', Object.assign({ q:`${s.pre}___${s.post}`, exp:expOf(u), show:plain(e) }, choice({ t:s.chunk }, wrong.map(x=>({ t:matchCase(s.chunk, x.term) })), c.rnd))); },
  samediff(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const s=splitStar(e), same=c.rnd()<0.5;
    // "Same": only a connector listed as also correct; "different": another function with the same pattern
    const pool=same ? u.alsoCorrect.map(t=>UNITS.get('cn:'+t)).filter(Boolean) : BYLIB.cn.filter(x=>x.fn!==u.fn && x.pattern===u.pattern && !cnNo(u).has(lc(x.term)));
    const x=pickOne(pool, c.rnd); if(!x) return null;
    const exp={ es:`${u.term} = ${u.es}; ${x.term} = ${x.es}.`, en:`${u.term} = ${u.en}; ${x.term} = ${x.en}.` };
    return mk(u, 'samediff', { q:e, q2:`${s.pre}*${matchCase(s.chunk, x.term)}*${s.post}`, opts:[YES, NO], ans:same?0:1, exp, show:plain(e) }, same?'s':'d'); },
  join(u, c){ if(!u.join) return null; const e=u.ex[0]; if(!oneStar(e)) return null; const s=splitStar(e), ok=cnNo(u);
    const pool=[...u.confuseWith.map(t=>UNITS.get('cn:'+t)).filter(Boolean), ...shuf(BYLIB.cn, c.rnd)].filter(x=>x.pattern!==u.pattern && cnWrong(u,x,ok));
    const wrong=uniqBy(pool, x=>x.uid).slice(0,3).map(x=>`${s.pre}${matchCase(s.chunk, x.term)}${s.post}`); if(wrong.length<3) return null;
    return mk(u, 'join', Object.assign({ q:u.join, exp:expOf(u), show:plain(e) }, choice({ t:plain(e) }, wrong.map(t=>({ t })), c.rnd))); },
  gap(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const s=splitStar(e);
    return mk(u, 'gap', { q:`${s.pre}___${s.post}`, answers:uniqBy([s.chunk, ...[...cnOk(u)].map(t=>matchCase(s.chunk, t))]), hint:{ es:u.es, en:u.en }, exp:expOf(u), show:plain(e) }); },
  translate(u, c){ const same=BYLIB.cn.filter(x=>x.es===u.es).map(x=>x.term); return mk(u, 'translate', { es:u.es, answers:uniqBy([u.term, ...same, ...u.alsoCorrect]), exp:expOf(u), show:u.term }); },
  opencloze(u, c){
    const single=x=>!x.term.includes(' ') && x.ex.some(oneStar);
    if(!single(u)) return null;
    const others=distinctUnits(u, 2+(c.rnd()<0.5?1:0), c.rnd, { pred:x=>single(x) && x.fn!==u.fn }); if(!others) return null;
    const all=[u, ...others], lines=[], fields=[];
    all.forEach((x,i)=>{ const e=pickEx(x, c.rnd, oneStar), s=splitStar(e); lines.push(`${s.pre}(${i+1}) ___${s.post}`);
      fields.push({ lab:{ es:String(i+1), en:String(i+1) }, uid:x.uid, answers:uniqBy([s.chunk, ...[...cnOk(x)].filter(t=>!t.includes(' ')).map(t=>matchCase(s.chunk, t))]) }); });
    return mk(u, 'opencloze', { uids:all.map(x=>x.uid), q:lines.join('\n'), fields, exp:{ es:all.map(x=>`${x.term} = ${x.es}`).join(' · '), en:all.map(x=>`${x.term} = ${x.en}`).join(' · ') } }); }
};

/* ---------- Collocations ---------- */
function colSplit(u, e){ const s=splitStar(e); if(!s || !oneStar(e)) return null; const vb=u.verb.split(' ')[0], vw=s.chunk.split(' ')[0];
  const form=detectForm(vw, vb, lastWord(s.pre)); if(!form) return null; return Object.assign(s, { vw, vb, rest:s.chunk.slice(vw.length), form }); }
const colOk = u => new Set([u.verb.split(' ')[0], ...u.alsoCorrect.map(v=>v.split(' ')[0])]);
// Verbs never offered as a wrong option: the accepted ones plus those that only change the meaning (catch/miss the bus)
const colNo = u => new Set([...colOk(u), ...(u.avoid||[]).map(v=>v.split(' ')[0])]);
function colBad(u, c){ if(!u.wrongVerb || colNo(u).has(u.wrongVerb)) return null; const e=pickEx(u, c.rnd, e=>colSplit(u, e)); if(!e) return null; const s=colSplit(u, e);
  const wv=matchCase(s.vw, inflect(u.wrongVerb, s.form)); if(lc(wv)===lc(s.vw)) return null;
  return { bad:`${s.pre}${wv}${s.rest}${s.post}`, good:plain(e), at:toks(s.pre).length, fix:s.vw }; }
const GEN_COL = {
  meaning:G.meaning, reverse:G.reverse, match:G.match, listen:G.listen, order:G.order, complete:G.complete, dictation:G.dictation,
  colverb(u, c){ const e=pickEx(u, c.rnd, e=>colSplit(u, e)); if(!e) return null; const s=colSplit(u, e), ok=colNo(u);
    const pool=uniqBy([u.wrongVerb, ...shuf(['make','do','take','have','get','give','put','keep','catch'], c.rnd)]).filter(v=>v && !ok.has(v));
    const wrong=uniqBy(pool.map(v=>matchCase(s.vw, inflect(v, s.form)))).filter(v=>lc(v)!==lc(s.vw)).slice(0,3); if(wrong.length<3) return null;
    return mk(u, 'colverb', Object.assign({ q:`${s.pre}___${s.rest}${s.post}`, exp:expOf(u), show:plain(e) }, choice({ t:s.vw }, wrong.map(t=>({ t })), c.rnd))); },
  natural(u, c){ const b=colBad(u, c); if(!b) return null; const bad=c.rnd()<0.5;
    return mk(u, 'natural', { q:bad?b.bad:b.good, opts:[YES, NO], ans:bad?1:0, exp:wrongExp(u, b), show:b.good }, bad?'b':'g'); },
  spotfix(u, c){ const b=colBad(u, c); if(!b) return null;
    return mk(u, 'spotfix', { toks:toks(b.bad), bad:[b.at], fix:b.fix, show:b.good, exp:wrongExp(u, b) }); },
  gap(u, c){ const e=pickEx(u, c.rnd, e=>colSplit(u, e)); if(!e) return null; const s=colSplit(u, e);
    const answers=uniqBy([s.vw, ...u.alsoCorrect.map(v=>matchCase(s.vw, inflectPhrase(v, s.form)))]);
    return mk(u, 'gap', { q:`${s.pre}___${s.rest}${s.post}`, answers, hint:{ es:u.es, en:u.en }, exp:expOf(u), show:plain(e) }); },
  gap_hint(u, c){ const e=pickEx(u, c.rnd, oneStar); if(!e) return null; const s=splitStar(e);
    return mk(u, 'gap_hint', { q:`${s.pre}___${s.post}`, answers:[s.chunk], hint:{ es:u.es, en:u.en }, exp:expOf(u), show:plain(e) }); },
  translate(u, c){ return mk(u, 'translate', { es:u.es, answers:uniqBy([u.term, ...u.alsoCorrect.map(v=>`${v} ${u.noun}`)]), exp:expOf(u), show:u.term }); }
};

/* ---------- Irregular verbs ---------- */
const GROUP_FAM = { 'same-3':'A', 't-ending':'B', ought:'B', 'd-ending':'B', 'i-u-u':'B', 'o-en':'C', 'ew-own':'C', 'i-o-en':'C', 'en-pp':'C', 'ore-orn':'C', 'i-a-u':'D', 'base-pp':'E' };
function irrPick(u, c){ const k=c.rnd()<0.5?0:1, e=u.ex[k]; if(!e || !oneStar(e)) return null; const s=splitStar(e); return Object.assign(s, { k, right:k?u.pp:u.p }); }
function irrBad(u, c){
  const s=irrPick(u, c); if(!s) return null;
  const other=s.k ? u.p : u.pp, wrongForm=other.find(x=>!s.right.includes(x)) || regPast(u.term);
  if(s.right.includes(wrongForm)) return null;
  return { bad:`${s.pre}${wrongForm}${s.post}`, good:plain(`${s.pre}${s.chunk}${s.post}`), at:toks(s.pre).length, fix:s.chunk, right:s.right };
}
const irrExp = u => expOf(u);
const GEN_IRR = {
  dictation:G.dictation,
  three(u, c){ return mk(u, 'three', { q:u.term, hint:{ es:u.es, en:u.en }, fields:[{ lab:{ en:'Past simple', es:'Pasado' }, answers:u.p }, { lab:{ en:'Past participle', es:'Participio' }, answers:u.pp }], exp:irrExp(u), show:`${u.term}, ${u.p[0]}, ${u.pp[0]}` }); },
  formchoice(u, c){ const s=irrPick(u, c); if(!s) return null;
    const wrong=uniqBy([u.term, ...u.p, ...u.pp, regPast(u.term), vforms(u.term).s]).filter(x=>!s.right.map(lc).includes(lc(x))).slice(0,3); if(wrong.length<2) return null;
    return mk(u, 'formchoice', Object.assign({ q:`${s.pre}___${s.post} (${u.term})`, exp:irrExp(u), show:plain(`${s.pre}${s.chunk}${s.post}`) }, choice({ t:s.chunk }, wrong.map(t=>({ t })), c.rnd)), s.k); },
  form(u, c){ const s=irrPick(u, c); if(!s) return null;
    return mk(u, 'form', { q:`${s.pre}___${s.post}\n(${u.term})`, answers:s.right, exp:irrExp(u), show:plain(`${s.pre}${s.chunk}${s.post}`) }, s.k); },
  spotfix(u, c){ const b=irrBad(u, c); if(!b) return null; return mk(u, 'spotfix', { toks:toks(b.bad), bad:[b.at], fix:b.fix, fixes:b.right, show:b.good, exp:wrongExp(u, b) }); },
  natural(u, c){ const b=irrBad(u, c); if(!b) return null; const bad=c.rnd()<0.5;
    return mk(u, 'natural', { q:bad?b.bad:b.good, opts:[YES, NO], ans:bad?1:0, exp:wrongExp(u, b), show:b.good }, bad?'b':'g'); },
  group(u, c){ if(!GROUP_FAM[u.group]) return null; const same=BYLIB.irr.filter(x=>x!==u && x.group===u.group); if(!same.length) return null;
    const right=pickOne(same, c.rnd), wrong=shuf(BYLIB.irr.filter(x=>GROUP_FAM[x.group] && GROUP_FAM[x.group]!==GROUP_FAM[u.group]), c.rnd).slice(0,3); if(wrong.length<3) return null;
    const f=x=>`${x.term} – ${x.p[0]} – ${x.pp[0]}`;
    return mk(u, 'group', Object.assign({ q:f(u), exp:{ es:`${f(u)} y ${f(right)} siguen el mismo patrón.`, en:`${f(u)} and ${f(right)} follow the same pattern.` }, show:f(right) }, choice({ t:right.term }, wrong.map(x=>({ t:x.term })), c.rnd))); },
  reverse(u, c){ const mine=keyWords(u.es), wrong=shuf(BYLIB.irr.filter(x=>x!==u && lc(x.es)!==lc(u.es) && ![...keyWords(x.es)].some(w=>mine.has(w))), c.rnd).slice(0,3);
    if(wrong.length<3) return null;
    const pr = u.en ? { en:`Which verb means "${u.en}"?`, es:`¿Qué verbo significa «${u.es}»?` } : { en:'Which verb means this?', es:'¿Qué verbo significa esto?' };
    return mk(u, 'reverse', Object.assign({ es:u.en?null:u.es, pr, exp:irrExp(u), show:u.term }, choice(termOpt(u), wrong.map(termOpt), c.rnd))); },
  listenwrite(u, c){ return mk(u, 'listenwrite', { say:`${u.term}, ${u.p.join(' or ')}, ${u.pp.join(' or ')}`, auto:true,
    fields:[{ lab:{ en:'Infinitive', es:'Infinitivo' }, answers:[u.term] }, { lab:{ en:'Past simple', es:'Pasado' }, answers:u.p }, { lab:{ en:'Past participle', es:'Participio' }, answers:u.pp }], exp:irrExp(u), show:`${u.term}, ${u.p[0]}, ${u.pp[0]}` }); }
};

/* ---------- Word families ---------- */
const WF_GROUP = { noun:['noun','noun2','person','person2'], verb:['verb','verb2'], adj:['adj','adj2','negAdj'], adv:['adv','adv2'] };
const WF_L = { noun:['Noun','Nombre'], verb:['Verb','Verbo'], adj:['Adjective','Adjetivo'], adv:['Adverb','Adverbio'] };
const groupOfKey = k => Object.keys(WF_GROUP).find(g=>WF_GROUP[g].includes(k));
function wfPick(u, c){ const ks=Object.keys(u.ex).filter(k=>{ const s=splitStar(u.ex[k]); return s && oneStar(u.ex[k]) && lc(s.chunk)!==lc(u.term); }); const k=pickOne(ks, c.rnd); if(!k) return null;
  const s=splitStar(u.ex[k]), alts=(u.alts[k]||[]).map(a=>lc(s.chunk).includes(lc(u.forms[k])) ? s.chunk.replace(new RegExp(u.forms[k],'i'), a) : null).filter(Boolean);
  return Object.assign(s, { k, answers:uniqBy([s.chunk, ...alts]) }); }
function wfBad(u, c){ const s=wfPick(u, c); if(!s) return null; const g=groupOfKey(s.k);
  const other=pickOne(Object.keys(u.forms).filter(k=>groupOfKey(k)!==g && !s.answers.map(lc).includes(lc(u.forms[k]))), c.rnd); if(!other) return null;
  const w=matchCase(s.chunk, u.forms[other]); return { bad:`${s.pre}${w}${s.post}`, good:plain(u.ex[s.k]), at:toks(s.pre).length, fix:s.chunk, fixes:s.answers }; }
const GEN_WF = {
  wordform(u, c){ const s=wfPick(u, c); if(!s) return null; return mk(u, 'wordform', { q:`${s.pre}___${s.post}`, base:u.term.toUpperCase(), answers:s.answers, exp:expOf(u), show:plain(u.ex[s.k]) }, s.k); },
  wfchoice(u, c){ const s=wfPick(u, c); if(!s) return null; const wrong=uniqBy(Object.values(u.forms)).filter(f=>!s.answers.map(lc).includes(lc(f))); if(wrong.length<2) return null;
    return mk(u, 'wfchoice', Object.assign({ q:`${s.pre}___${s.post}`, base:u.term.toUpperCase(), exp:expOf(u), show:plain(u.ex[s.k]) }, choice({ t:s.chunk }, shuf(wrong, c.rnd).slice(0,3).map(t=>({ t })), c.rnd)), s.k); },
  wfgrid(u, c){ const fields=[];
    for(const [g,keys] of Object.entries(WF_GROUP)){ const forms=keys.filter(k=>u.forms[k]).flatMap(k=>[u.forms[k], ...(u.alts[k]||[])]);
      if(!forms.length || forms.map(lc).includes(lc(u.term))) continue; fields.push({ lab:{ en:WF_L[g][0], es:WF_L[g][1] }, answers:forms }); }
    if(fields.length<2) return null; return mk(u, 'wfgrid', { q:u.term, fields, exp:expOf(u), show:Object.values(u.forms).join(', ') }); },
  natural(u, c){ const b=wfBad(u, c); if(!b) return null; const bad=c.rnd()<0.5; return mk(u, 'natural', { q:bad?b.bad:b.good, opts:[YES, NO], ans:bad?1:0, exp:wrongExp(u, b), show:b.good }, bad?'b':'g'); },
  spotfix(u, c){ const b=wfBad(u, c); if(!b) return null; return mk(u, 'spotfix', { toks:toks(b.bad), bad:[b.at], fix:b.fix, fixes:b.fixes, show:b.good, exp:wrongExp(u, b) }); }
};

/* ---------- Transformations ---------- */
const GEN_TR = {
  kwt(u, c){ return mk(u, 'kwt', { from:u.from, kw:u.key, q:u.to, answers:u.answers, strict:true, exp:expOf(u), show:u.to.replace('___', u.answers[0]) }); },
  ktchoice(u, c){ const right=u.answers[0], w=toks(right), swaps=[];
    if(w.length>=2){ const a=[...w]; [a[0],a[1]]=[a[1],a[0]]; swaps.push(a.join(' ')); const b=[...w]; [b[b.length-1],b[b.length-2]]=[b[b.length-2],b[b.length-1]]; swaps.push(b.join(' ')); }
    const others=shuf(BYLIB.tr.filter(x=>x!==u), c.rnd).sort((a,b)=>(b.structure===u.structure)-(a.structure===u.structure)).map(x=>x.answers[0]);
    const ok=u.answers.map(lc), wrong=uniqBy([...swaps, ...others]).filter(x=>!ok.includes(lc(x))).slice(0,3); if(wrong.length<3) return null;
    return mk(u, 'ktchoice', Object.assign({ from:u.from, kw:u.key, q:u.to, exp:expOf(u), show:u.to.replace('___', right) }, choice({ t:right }, wrong.map(t=>({ t })), c.rnd))); }
};

/* ---------- Vocabulary items and grammar questions ---------- */
const PREP_SWAP = { in:['at','on'], on:['in','at'], at:['in','on'], to:['at','in'], for:['to','since'], of:['from','about'], with:['to','of'], about:['of','on'], from:['of','by'], by:['with','in'], into:['in','to'], since:['for','from'] };
const itemAnswers = it => uniqBy([...answersOf(it), ...list(it.alsoCorrect)]);
function itemBad(u, c){ const it=u.item;
  if(it.wrong){ const good=it.prompt?filled(it.prompt, answersOf(it)[0]):''; if(good) return { bad:String(it.wrong), good }; }
  if(it.cat!=='preposition' || !it.prompt || !it.prompt.includes('___')) return null;
  const ans=answersOf(it), a=lc(ans[0]), w=(PREP_SWAP[a]||[]).find(x=>!ans.map(lc).includes(x)); if(!w) return null;
  const line=String(it.prompt).split('\n').filter(l=>l.includes('___')).pop();
  return { bad:line.replace('___', w), good:line.replace('___', ans[0]) };
}
// Grammar questions without an explanation still say what the answer is and which topic it belongs to
function itemExp(it){
  if(it.exp || it.exp_en) return { es:it.exp||it.exp_en, en:it.exp_en||it.exp };
  const ans=it.type==='mcq' ? it.answer : answersOf(it)[0], g=it.gtopic && GRAMMAR.get(it.gtopic);
  return { es:`Respuesta: ${ans}.${g?` Tema: ${g.title}.`:''}`, en:`Answer: ${ans}.${g?` Topic: ${g.title_en||g.title}.`:''}` };
}
const MCC_CATS = ['vocab','falsefriend','collocation','phrasal'];
const GEN_VOC = {
  // Use of English Part 1 style: four words of similar meaning (lend/borrow/rent/owe); a pack item can add its own confuseWith
  mccloze(u, c){ const it=u.item; if(it.type!=='mcq' || !MCC_CATS.includes(it.cat)) return null; const ok=itemAnswers(it).map(lc);
    const wrong=uniqBy([...list(it.confuseWith), ...it.options]).filter(o=>!ok.includes(lc(o))).slice(0,3); if(wrong.length<3) return null;
    return mk(u, 'mccloze', Object.assign({ q:it.prompt, exp:itemExp(it), show:filled(it.prompt, it.answer) }, choice({ t:it.answer }, wrong.map(t=>({ t })), c.rnd))); },
  choose(u, c){ const it=u.item; if(it.type==='mcq' && MCC_CATS.includes(it.cat)) return null; if(it.type==='mcq') return mk(u, 'choose', Object.assign({ q:it.prompt, exp:itemExp(it), show:filled(it.prompt, it.answer) }, choice({ t:it.answer }, it.options.filter(o=>o!==it.answer).map(t=>({ t })), c.rnd)));
    if(!['gap','wordform'].includes(it.type)) return null; const ans=answersOf(it), ok=itemAnswers(it).map(lc);
    const d=uniqBy([...list(it.confuseWith), ...distractors(it)]).filter(x=>!ok.includes(lc(x))).slice(0,3); if(d.length<3) return null;
    return mk(u, 'choose', Object.assign({ q:it.prompt, base:it.base, exp:itemExp(it), show:filled(it.prompt, ans[0]) }, choice({ t:ans[0] }, d.map(t=>({ t })), c.rnd))); },
  gap_hint(u, c){ const it=u.item; if(!it.prompt || !it.prompt.includes('___') || !['gap','mcq','wordform'].includes(it.type)) return null; const ans=itemAnswers(it);
    return mk(u, 'gap_hint', { q:it.prompt, base:it.base, answers:ans, hint:L(it,'hint') ? { es:it.hint, en:it.hint_en||it.hint } : { es:`Empieza por "${ans[0][0]}", ${ans[0].length} letras`, en:`Starts with "${ans[0][0]}", ${ans[0].length} letters` }, exp:itemExp(it), show:filled(it.prompt, ans[0]) }); },
  gap(u, c){ const it=u.item; if(!it.prompt || !it.prompt.includes('___') || !['gap','mcq'].includes(it.type)) return null; const ans=itemAnswers(it);
    return mk(u, 'gap', { q:it.prompt, answers:ans, hint:L(it,'hint') ? { es:it.hint, en:it.hint_en||it.hint } : null, hintAlways:!!it.hintAlways, exp:itemExp(it), show:filled(it.prompt, ans[0]) }); },
  wordform(u, c){ const it=u.item; if(it.type!=='wordform') return null; return mk(u, 'wordform', { q:it.prompt, base:it.base, answers:itemAnswers(it), exp:itemExp(it), show:filled(it.prompt, answersOf(it)[0]) }); },
  translate(u, c){ const it=u.item;
    if(it.type==='translate') return mk(u, 'translate', { es:it.es, answers:itemAnswers(it), exp:itemExp(it), show:answersOf(it)[0] });
    if(it.es_sentence && it.prompt) return mk(u, 'translate', { es:it.es_sentence, answers:[filled(it.prompt, answersOf(it)[0])], exp:itemExp(it), show:filled(it.prompt, answersOf(it)[0]) });
    return null; },
  dictation(u, c){ const it=u.item; const t=it.type==='dictation' ? it.text : canDictate(it) ? filled(it.prompt, answersOf(it)[0]) : null; if(!t) return null;
    return mk(u, 'dictation', { say:t, auto:true, text:t, show:t, exp:itemExp(it) }); },
  natural(u, c){ const b=itemBad(u, c); if(!b) return null; const bad=c.rnd()<0.5, e=Object.assign({}, itemExp(u.item));
    return mk(u, 'natural', { q:bad?b.bad:b.good, opts:[YES, NO], ans:bad?1:0, exp:{ es:`✗ ${b.bad}\n✓ ${b.good}\n${e.es}`, en:`✗ ${b.bad}\n✓ ${b.good}\n${e.en}` }, show:b.good }, bad?'b':'g'); },
  spotfix(u, c){ const b=itemBad(u, c); if(!b) return null; const d=diffFix(b.bad, b.good); if(!d) return null; const e=itemExp(u.item);
    return mk(u, 'spotfix', { toks:d.toks, bad:d.bad, fix:d.fix, show:b.good, exp:{ es:`✗ ${b.bad}\n✓ ${b.good}\n${e.es}`, en:`✗ ${b.bad}\n✓ ${b.good}\n${e.en}` } }); }
};
function grWrong(u, c){ const it=u.item; if(it.type!=='mcq' || !it.prompt || !it.prompt.includes('___')) return null;
  const w=pickOne(it.options.filter(o=>o!==it.answer && toks(o).length<=3), c.rnd); if(!w) return null;
  const lines=String(it.prompt).split('\n'), i=lines.map(l=>l.includes('___')).lastIndexOf(true), line=lines[i];
  const ctx=lines.slice(0,i).join('\n');
  return { ctx, bad:line.replace('___', w), good:line.replace('___', it.answer), at:toks(line.slice(0, line.indexOf('___'))).length, n:toks(w).length, fix:it.answer }; }
const GEN_GR = {
  gq(u, c){ const it=u.item;
    if(it.type==='mcq') return mk(u, 'gq', Object.assign({ q:it.prompt, exp:itemExp(it), strict:true, show:filled(it.prompt, it.answer) }, choice({ t:it.answer }, it.options.filter(o=>o!==it.answer).map(t=>({ t })), c.rnd)));
    return mk(u, 'gq', { kind:'text', skill:'produce', q:it.prompt, answers:answersOf(it), strict:true, exp:itemExp(it), show:filled(it.prompt, answersOf(it)[0]) }); },
  natural(u, c){ const b=grWrong(u, c); if(!b) return null; const bad=c.rnd()<0.5, e=itemExp(u.item);
    return mk(u, 'natural', { ctx:b.ctx, q:bad?b.bad:b.good, opts:[YES, NO], ans:bad?1:0, exp:{ es:`✗ ${b.bad}\n✓ ${b.good}\n${e.es}`, en:`✗ ${b.bad}\n✓ ${b.good}\n${e.en}` }, show:b.good }, bad?'b':'g'); },
  spotfix(u, c){ const b=grWrong(u, c); if(!b) return null; const e=itemExp(u.item), bad=[]; for(let k=0;k<b.n;k++) bad.push(b.at+k);
    return mk(u, 'spotfix', { ctx:b.ctx, toks:toks(b.bad), bad, fix:b.fix, strict:true, show:b.good, exp:{ es:`✗ ${b.bad}\n✓ ${b.good}\n${e.es}`, en:`✗ ${b.bad}\n✓ ${b.good}\n${e.en}` } }); }
};
const GEN = { pv:GEN_PV, cn:GEN_CN, col:GEN_COL, irr:GEN_IRR, wf:GEN_WF, tr:GEN_TR, voc:GEN_VOC, gr:GEN_GR };

/* ---------- Presentation cards and flashcards ---------- */
function cardOf(u){
  const c={ term:unitName(u), mean:meaningOf(u), ex:[], wrong:u.wrong||null, lines:[] };
  if(u.lib==='pv'){ c.ex=u.ex; if(u.pm) c.lines.push({ es:u.pm, en:u.pm_en }); if(u.sep) c.lines.push({ es:'Separable: turn it off, turn off the light', en:'Separable: turn it off, turn off the light' }); }
  if(u.lib==='cn'){ c.ex=u.ex; const p=PATTERN_L[u.pattern]; if(p) c.lines.push({ es:`Patrón: ${p[1]}`, en:`Pattern: ${p[0]}` }); }
  if(u.lib==='col'){ c.ex=u.ex; if(u.wrongVerb) c.wrong={ bad:`${u.wrongVerb} ${u.noun}`, good:u.term }; }
  if(u.lib==='irr'){ c.ex=u.ex; c.lines.push({ es:`${u.term} – ${u.p.join('/')} – ${u.pp.join('/')}`, en:`${u.term} – ${u.p.join('/')} – ${u.pp.join('/')}` }); }
  if(u.lib==='wf'){ c.ex=Object.values(u.ex); c.lines.push({ es:Object.values(u.forms).join(' · '), en:Object.values(u.forms).join(' · ') }); }
  if(u.lib==='tr'){ c.term=u.structure; c.ex=[u.from, `${u.to.replace('___', '*'+u.answers[0]+'*')}`]; c.lines.push({ es:u.exp, en:u.exp_en }); }
  return c;
}
function presentEx(u){ return mk(u, 'present', { card:cardOf(u), skill:null }); }
// Front: the term, or (for every other card) one of its sentences with a gap
function flashEx(u, k=0){ const e=(Array.isArray(u.ex) ? u.ex : Object.values(u.ex||{})).find(oneStar) || null;
  const front = u.lib==='irr' ? u.term : u.lib==='tr' ? u.from : e && k%2 ? splitStar(e).pre+'___'+splitStar(e).post : unitName(u);
  return mk(u, 'flash', { front, card:cardOf(u) }); }

/* ---------- Choosing a format and generating ---------- */
// o: { tier, stage, only:[formats], skills:[...], kinds:[...], exclude:[formats], avoid:format, rnd, noHint, ignoreState, single }
function genFor(u, o={}){
  if(!u) return null;
  const s=o.ignoreState ? null : S.units[u.uid], stage=o.stage ?? (s?.stage||0), tier=o.tier ?? stageTier(stage), rnd=o.rnd||Math.random;
  let fs=Object.keys(GEN[u.lib]||{});
  if(o.only) fs=fs.filter(f=>o.only.includes(f));
  if(o.exclude) fs=fs.filter(f=>!o.exclude.includes(f));
  if(o.single) fs=fs.filter(f=>!MULTI_UNIT.includes(f) && f!=='complete');
  if(o.skills) fs=fs.filter(f=>o.skills.includes(FMT[f].skill) || (f==='gq' && o.skills.some(k=>k==='use'||k==='produce')));
  if(o.kinds) fs=fs.filter(f=>o.kinds.includes(FMT[f].kind));
  const last=(s?.lastFormats||[]).slice(-3), prod=needsProduction(s);
  const scored=fs.map(f=>{ const d=FMT[f].tier-tier; let w = d===0 ? 10 : Math.abs(d)===1 ? 3 : 0.6; if(d>1) w*=0.3;
    if(last.includes(f)) w*=0.05; if(f===o.avoid) w*=0.02; if(prod && FMT[f].skill==='produce') w*=3; return { f, w:w*(0.5+rnd()) }; }).sort((a,b)=>b.w-a.w);
  const ctx={ rnd, stage, tier, ignoreState:!!o.ignoreState };
  for(const { f } of scored){
    let ex=null; try{ ex=GEN[u.lib][f](u, ctx); }catch(e){ ex=null; }
    if(!ex) continue;
    if(o.kinds && !o.kinds.includes(ex.kind)) continue;
    if(o.noHint && ex.hint && !ex.hintAlways) delete ex.hint;
    if(o.noHint && ex.format==='gap_hint') continue;
    return ex;
  }
  return null;
}

/* ---------- Ordering: never the same format, library or unit twice in a row ---------- */
function interleave(exs, singleLib){
  const rest=[...exs], out=[];
  const fits=(x, last, lib, fmt)=>!last || (x.uid!==last.uid && (!fmt || x.format!==last.format) && (!lib || singleLib || x.lib!==last.lib));
  while(rest.length){
    const last=out[out.length-1];
    let k=rest.findIndex(x=>fits(x, last, true, true));
    if(k<0) k=rest.findIndex(x=>fits(x, last, false, true));
    if(k<0) k=rest.findIndex(x=>fits(x, last, false, false));
    if(k<0) k=0;
    out.push(rest.splice(k,1)[0]);
  }
  // Greedy can paint itself into a corner at the end: swap a clashing exercise with one that fits both places
  const clashAt=(i)=>i>0 && i<out.length && (out[i].uid===out[i-1].uid || out[i].format===out[i-1].format || (!singleLib && out[i].lib===out[i-1].lib));
  const okAt=(x, i, skip)=>{ const prev=i-1===skip?null:out[i-1], nxt=i+1===skip?null:out[i+1];
    const f=y=>!y || (y.uid!==x.uid && y.format!==x.format && (singleLib || y.lib!==x.lib)); return f(prev) && f(nxt); };
  for(let pass=0; pass<2; pass++) for(let i=1;i<out.length;i++){
    if(!clashAt(i)) continue;
    for(let j=0;j<out.length;j++){ if(Math.abs(j-i)<=1) continue;
      const a=out[i], b=out[j];
      out[i]=b; out[j]=a;
      if(okAt(b, i) && okAt(a, j)) break;
      out[i]=a; out[j]=b; }
  }
  return out;
}
// Presentation cards go right before the first exercise of their unit
function withCards(exs, cards){ const out=[], done=new Set(); for(const x of exs){ const c=cards.get(x.uid); if(c && !done.has(x.uid)){ out.push(c); done.add(x.uid); } out.push(x); } return out; }

/* ---------- Shares and selection ---------- */
function currentShares(){ const p=S.settings.mixPreset||'balanced'; return p==='custom' && S.settings.mixShares ? S.settings.mixShares : PRESETS[p]||PRESETS.balanced; }
// Largest remainder; what an area can't use goes to the others
function apportion(n, shares, cap){
  const keys=Object.keys(shares).filter(k=>shares[k]>0 && (cap?cap[k]>0:true)), out={}; for(const k of Object.keys(shares)) out[k]=0;
  let left=n;
  for(let round=0; round<10 && left>0; round++){
    const open=keys.filter(k=>!cap || out[k]<cap[k]); if(!open.length) break;
    const tot=open.reduce((s,k)=>s+shares[k],0), raw=open.map(k=>({ k, v:left*shares[k]/tot }));
    let given=0; for(const r of raw){ const add=Math.min(Math.floor(r.v), cap?cap[r.k]-out[r.k]:Infinity); out[r.k]+=add; given+=add; }
    for(const r of raw.sort((a,b)=>(b.v-Math.floor(b.v))-(a.v-Math.floor(a.v)))){ if(given>=left) break; if(!cap || out[r.k]<cap[r.k]){ out[r.k]++; given++; } }
    left-=given;
  }
  return out;
}
function areaUnits(area){
  if(area==='uoe') return [...BYLIB.wf, ...BYLIB.tr];
  if(area==='gr'){ if(!S.settings.grammarDaily) return []; return BYLIB.gr.filter(u=>S.units[u.uid] || S.settings.grammarAll || S.read[u.item.gtopic]); }
  return BYLIB[area]||[];
}
function freshOrder(list, rnd){
  const ll=routedUids(), mine=list.filter(u=>ll.has(u.uid)), packs=shuf(list.filter(u=>!ll.has(u.uid) && u.item?.pack), rnd);
  const b1=shuf(list.filter(u=>!ll.has(u.uid) && !u.item?.pack && u.level!=='B2'), rnd), b2=shuf(list.filter(u=>!ll.has(u.uid) && !u.item?.pack && u.level==='B2'), rnd), base=[];
  while(b1.length||b2.length){ for(let k=0;k<3&&b1.length;k++) base.push(b1.shift()); if(b2.length) base.push(b2.shift()); }
  return [...mine, ...packs, ...base];
}
function rankUnits(units, now, rnd, used=new Set()){
  const due=[], fresh=[], reinf=[], rest=[], cool=[];
  for(const u of units){ if(used.has(u.uid)) continue; const s=S.units[u.uid];
    if(!s || !s.seen){ fresh.push(u); continue; }
    if(s.due<=now){ due.push(u); continue; }
    if(cooling(s, now)){ cool.push(u); continue; }
    (s.stage<=2 ? reinf : rest).push(u); }
  const tie=()=>rnd()-0.5;
  due.sort((a,b)=>S.units[a.uid].due-S.units[b.uid].due);
  reinf.sort((a,b)=>S.units[a.uid].lastSeen-S.units[b.uid].lastSeen || tie());
  rest.sort((a,b)=>S.units[a.uid].seen-S.units[b.uid].seen || S.units[a.uid].lastSeen-S.units[b.uid].lastSeen || tie());
  cool.sort((a,b)=>S.units[a.uid].lastOk-S.units[b.uid].lastOk);
  return { due, fresh:freshOrder(fresh, rnd), reinf, rest, cool };
}
function newLeftToday(){ return Math.max(0, (S.settings.newItems||10) - (today().nw||0)); }
// The daily practice: due first, then new (with a presentation card), then reinforcement, area by area
function buildDaily(size, o={}){
  const now=Date.now(), rnd=o.rnd||Math.random, shares=o.shares||currentShares(), used=new Set(o.exclude||[]);
  const ranked={}, cap={};
  for(const a of AREAS){ ranked[a]=rankUnits(areaUnits(a), now, rnd, used); const r=ranked[a];
    if(o.onlyNew){ r.due=[]; r.reinf=[]; r.rest=[]; r.cool=[]; }
    if((o.newBudget ?? 1)===0){ r.freshAll=r.fresh; r.fresh=[]; }
    cap[a]=r.due.length+r.fresh.length+r.reinf.length+r.rest.length; }
  const want=apportion(size, shares, cap), newWant=apportion(o.newBudget ?? newLeftToday(), shares, Object.fromEntries(AREAS.map(a=>[a, Math.min(ranked[a].fresh.length, want[a])])));
  const picked=[];
  for(const a of AREAS){ const r=ranked[a], n=want[a]; if(!n) continue; const take=[];
    for(const u of r.due){ if(take.length>=n) break; take.push([u,'due']); }
    for(const u of r.fresh.slice(0, newWant[a])){ if(take.length>=n) break; take.push([u,'new']); }
    for(const u of r.reinf){ if(take.length>=n) break; take.push([u,'reinf']); }
    for(const u of r.rest){ if(take.length>=n) break; take.push([u,'rest']); }
    picked.push(...take); }
  // Units cooling down (right in the last 4 hours) never fill a session. What is missing is filled with new units,
  // even past today's limit, area by area following the mix; the caller tells the user
  // Each new unit can give up to 3 exercises (see exercisesFor), so those are counted before adding more new units
  let extraNew=0;
  const deficit=()=>size-picked.length-2*picked.filter(p=>p[1]==='new').length;
  if(deficit()>0 && o.fillNew!==false && !o.onlyNew){
    const used2=new Set(picked.map(p=>p[0].uid)), order=AREAS.filter(a=>shares[a]>0).sort((a,b)=>shares[b]-shares[a]);
    for(let round=0; deficit()>0 && round<size; round++){ let added=false;
      for(const a of order){ if(deficit()<=0) break; const u=(ranked[a].freshAll||ranked[a].fresh).find(x=>!used2.has(x.uid)); if(!u) continue;
        used2.add(u.uid); picked.push([u,'new']); extraNew++; added=true; }
      if(!added) break; }
  }
  const out=exercisesFor(picked, { rnd, cards:true, noMulti:o.noMulti, gen:o.gen, fill:size, noBalance:o.noBalance });
  out.extraNew=extraNew;
  return out;
}
function exercisesFor(picked, o){
  const rnd=o.rnd||Math.random, cards=new Map(), exs=[];
  let prevFormat=null;
  for(const [u, why] of picked){
    const fresh=why==='new';
    const go=Object.assign({ rnd, avoid:prevFormat, exclude:o.noMulti?MULTI_UNIT:undefined }, fresh ? { tier:1 } : {}, o.gen||{});
    const ex=genFor(u, go) || genFor(u, { rnd }); if(!ex) continue;
    if(fresh) ex.fresh=true;
    if(fresh && o.cards && STUDY_LIBS.includes(u.lib)) cards.set(u.uid, presentEx(u));
    exs.push(ex); prevFormat=ex.format;
  }
  // Short of reviews (a new user): each new unit gets a second and third exercise, a step harder each time
  if(o.fill) for(const tier of [2,3]) for(const x of exs.filter(e=>e.fresh && e.uid===e.uid)){
    if(exs.length>=o.fill) break; const u=UNITS.get(x.uid), mine=exs.filter(e=>e.uid===u.uid);
    if(mine.length>=tier) continue;
    const ex=genFor(u, Object.assign({ rnd, tier, single:true, exclude:mine.map(e=>e.format) }, o.gen||{})); if(ex){ ex.fresh=true; ex.extra=true; exs.push(ex); }
  }
  if(!o.noBalance) balanceSkills(exs, rnd, o.gen);
  return withCards(interleave(exs, o.singleLib), cards);
}
// At least 25 % production, at least 40 % meaning + usage, and at least 6 different formats in a session of 25
function balanceSkills(exs, rnd, gen){
  const n=exs.length; if(n<4) return;
  const redo=(i, o)=>{ const x=exs[i], u=UNITS.get(x.uid); const ex=genFor(u, Object.assign({ rnd, exclude:MULTI_UNIT }, gen||{}, o)); if(ex){ if(x.fresh){ ex.fresh=true; ex.extra=x.extra; } exs[i]=ex; return true; } return false; };
  // The first exercise of a new unit stays easy; its second and third ones can change
  const locked=x=>x.fresh && !x.extra;
  const count=k=>exs.filter(x=>k.includes(x.skill)).length;
  const order=exs.map((x,i)=>i).sort((a,b)=>stageOf(exs[b].uid)-stageOf(exs[a].uid));
  for(const i of order){ if(count(['produce'])>=Math.ceil(n*0.25)) break; const x=exs[i]; if(x.skill==='produce' || locked(x)) continue; redo(i, { skills:['produce'] }); }
  for(const i of [...order].reverse()){ if(count(['understand','use'])>=Math.ceil(n*0.4)) break; const x=exs[i]; if(['understand','use'].includes(x.skill) || locked(x)) continue;
    if(x.skill==='produce' && count(['produce'])<=Math.ceil(n*0.25)) continue; redo(i, { skills:['understand','use'] }); }
  const need=Math.min(6, Math.floor(n*6/25)||1);
  for(let guard=0; guard<n && new Set(exs.map(x=>x.format)).size<need; guard++){
    const fc={}; exs.forEach(x=>fc[x.format]=(fc[x.format]||0)+1);
    const i=exs.findIndex(x=>fc[x.format]>1 && !locked(x)); if(i<0) break;
    const x=exs[i], keep=x.skill==='produce' && count(['produce'])<=Math.ceil(n*0.25) ? ['produce'] : x.skill && ['understand','use'].includes(x.skill) && count(['understand','use'])<=Math.ceil(n*0.4) ? ['understand','use'] : null;
    if(!redo(i, Object.assign({ exclude:[...new Set([...Object.keys(fc), ...MULTI_UNIT])] }, keep?{ skills:keep }:{}))) fc[x.format]=1;
  }
}

/* ---------- Learn new (present → recognise → use → produce) ---------- */
function chooseNewUnits(lib, theme, n){
  const rnd=Math.random, ll=routedUids();
  const libs=lib ? [lib] : weakestLibs();
  for(const l of libs){
    let fresh=BYLIB[l].filter(u=>!S.units[u.uid]?.seen && (!theme || u.theme===theme));
    if(!fresh.length && !lib) continue;
    fresh=[...fresh.filter(u=>ll.has(u.uid)), ...freshOrder(fresh.filter(u=>!ll.has(u.uid)), rnd)];
    if(fresh.length) return fresh.slice(0,n);
  }
  return [];
}
// Study libraries ordered from the weakest (last 14 days) to the strongest; untouched ones in the middle
function weakestLibs(){
  const since=Date.now()-14*DAY, acc={};
  for(const a of S.attempts){ if(a.t<since || !a.u) continue; const l=a.u.split(':')[0]; if(!STUDY_LIBS.includes(l)) continue; (acc[l]||(acc[l]={ n:0, ok:0 })); acc[l].n++; if(a.r!=='bad') acc[l].ok++; }
  const ll=new Set([...routedUids()].map(x=>x.split(':')[0]));
  return [...STUDY_LIBS].sort((a,b)=>(ll.has(b)-ll.has(a)) || ((acc[a]?acc[a].ok/acc[a].n:0.75)-(acc[b]?acc[b].ok/acc[b].n:0.75)));
}
function buildLearn(units){
  const rnd=Math.random, cards=units.map(presentEx), rounds=[['understand','recognise'], ['use'], ['produce']], exs=[];
  rounds.forEach((skills, k)=>{ const round=[];
    for(const u of units){ const ex=genFor(u, { rnd, skills, tier:k+1, single:true, ignoreState:true, exclude:exs.filter(x=>x.uid===u.uid).map(x=>x.format) })
      || genFor(u, { rnd, tier:k+1, single:true, ignoreState:true, exclude:exs.filter(x=>x.uid===u.uid).map(x=>x.format) }); if(ex) round.push(ex); }
    // Rounds stay in order (meaning → use → production); only the join between two rounds is fixed, by rotating the new one
    let r=interleave(shuf(round, rnd), true); const last=exs[exs.length-1];
    for(let g=0; g<r.length && last && (r[0].uid===last.uid || r[0].format===last.format); g++) r=[...r.slice(1), r[0]];
    exs.push(...r); });
  return [...cards, ...exs];
}
// "Practise this one": five exercises in different formats, from easy to hard
function buildPractiseOne(u){
  const out=[]; for(const tier of [1,2,3,4,4]){ const ex=genFor(u, { tier, single:true, exclude:out.map(x=>x.format) }); if(ex) out.push(ex); }
  return out;
}
function buildFlash(lib, n=20){
  const now=Date.now(), r=rankUnits(BYLIB[lib], now, Math.random);
  return [...r.due, ...r.reinf, ...r.cool, ...r.rest, ...r.fresh].slice(0,n).map((u,k)=>flashEx(u,k));
}

/* ---------- Library tests ---------- */
const TEST_MODES = { meaning:['understand','recognise'], usage:['use'], mixed:null };
function libTestPool(lib, scope, theme){
  let pool=BYLIB[lib]||[];
  if(scope==='list'){ const ll=routedUids(); pool=pool.filter(u=>ll.has(u.uid)); }
  else if(scope==='learning') pool=pool.filter(u=>{ const s=S.units[u.uid]; return s && s.stage>=1 && s.stage<=3; });
  else if(scope==='weak') pool=pool.filter(u=>(S.units[u.uid]?.lapses||0)>0);
  else if(scope==='theme' && theme) pool=pool.filter(u=>u.theme===theme);
  return pool;
}
function buildLibTest(lib, n, scope, mode, theme){
  const rnd=Math.random, now=Date.now(), recent=new Set((S.libHist?.[lib]||[]).slice(-2).flat());
  let pool=libTestPool(lib, scope, theme);
  const key=u=>{ const s=S.units[u.uid]; return scope==='weak' ? -(s?.lapses||0) : (s?.seen||0); };
  const sorted=shuf(pool, rnd).sort((a,b)=>key(a)-key(b) || ((S.units[a.uid]?.lastSeen||0)-(S.units[b.uid]?.lastSeen||0)));
  // Coverage: units from the last two tests of this library only come back when nothing else is left
  const pick=[...sorted.filter(u=>!recent.has(u.uid)), ...sorted.filter(u=>recent.has(u.uid))].slice(0,n);
  const skills=TEST_MODES[mode], exs=[];
  for(const u of pick){ const ex=genFor(u, { rnd, skills:skills||undefined, single:true, avoid:exs[exs.length-1]?.format }) || genFor(u, { rnd, single:true }); if(ex) exs.push(ex); }
  return interleave(exs, true);
}
function rememberLibTest(lib, exs){ S.libHist=S.libHist||{}; const h=S.libHist[lib]||(S.libHist[lib]=[]); h.push(exs.flatMap(x=>x.uids||[x.uid])); if(h.length>5) h.splice(0, h.length-5); }

/* ---------- Mixed tests and challenges ---------- */
function unitMatches(u, only){
  if(!only) return true;
  const [k,v]=String(only).split(/:(.*)/s);
  if(k==='lib') return u.lib===v;
  if(k==='unit') return u.uid===v;
  if(u.item) return matchesOnly(u.item, only);
  if(k==='cat') return u.lib===v || ({ phrasal:'pv', irregular:'irr', collocation:'col', wordform:'wf' })[v]===u.lib;
  return false;
}
// opts: { n, level, focus: balanced|weak, only }
function buildMixedEx(opts){
  const n=opts.n||20, rnd=opts.rnd||Math.random, w=weakStats(), now=Date.now();
  const all=[...UNITS.values()].filter(u=>levelOk(u.level, opts.level) && unitMatches(u, opts.only) && (u.lib!=='gr' || true));
  const by={}; for(const u of all) (by[areaOf(u.lib)]||(by[areaOf(u.lib)]=[])).push(u);
  const shares={}; for(const a of AREAS) shares[a]=by[a]?.length ? (opts.only ? 1 : PRESETS.balanced[a]||5) : 0;
  const want=apportion(n, shares, Object.fromEntries(AREAS.map(a=>[a, by[a]?.length||0])));
  const weight=u=>{ const s=S.units[u.uid]; let x=1+3*(s?.lapses||0); if(u.item) x+=itemWeight(u.item, w)-1; if(s && s.seen>2 && s.correct/s.seen<0.6) x+=3; return x; };
  const picked=[];
  for(const a of AREAS){ const list=by[a]||[]; if(!want[a]) continue;
    const chosen = opts.focus==='weak' || opts.only ? weightedPick(list, want[a], weight)
      : shuf(list, rnd).sort((x,y)=>(S.units[x.uid]?.seen||0)-(S.units[y.uid]?.seen||0) || (S.units[x.uid]?.lastSeen||0)-(S.units[y.uid]?.lastSeen||0)).slice(0, want[a]);
    picked.push(...chosen.map(u=>[u,'mixed'])); }
  return exercisesFor(shuf(picked, rnd), { rnd, noMulti:true, gen:{ single:true } });
}
function dailyChallengeEx(day=dayKey()){
  const rnd=seeded('lexi-daily:'+day), pool=[...UNITS.values()].filter(u=>u.lib!=='voc' || writable(u.item)).sort((a,b)=>a.uid<b.uid?-1:a.uid>b.uid?1:0);
  const b2=shuffleWith(pool.filter(u=>u.level==='B2'), rnd), b1=shuffleWith(pool.filter(u=>u.level!=='B2'), rnd), cap={}, out=[];
  const take=(arr, max)=>{ for(const u of arr){ if(out.length>=max) break; if((cap[u.lib]||0)>=2 || out.some(x=>x.uid===u.uid)) continue;
    const ex=genFor(u, { rnd, ignoreState:true, stage:3, skills:['produce'], kinds:['text','multi'], noHint:true, single:true }); if(!ex) continue; cap[u.lib]=(cap[u.lib]||0)+1; out.push(ex); } };
  take(b2, 5); take(b1, 10); take(b2, 10);
  return interleave(shuffleWith(out, rnd));
}
function recentMistakeUnits(days=14){
  const since=Date.now()-days*DAY, ids=new Set();
  for(const a of S.attempts) if(a.t>since && a.r==='bad'){ const u=unitOfAttempt(a); if(u && UNITS.has(u)) ids.add(u); }
  for(const t of S.tests) if(t.at>since) for(const d of t.detail||[]) if(d.r!=='ok'){ const id=d.uid || (()=>{ const r=detailRef(t,d); return r && uidOfItem(r); })(); if(id && UNITS.has(id)) ids.add(id); }
  return [...ids];
}
