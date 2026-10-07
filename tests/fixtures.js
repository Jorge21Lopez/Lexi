'use strict';
// A saved state as v5 left it: packs loaded, history, an unfinished session and test.
const DAY = 864e5;
const NOW = Date.UTC(2026, 9, 7, 10, 0, 0);

const PACK = {
  id:'pack-2026-10-05', name:'Week 1: prepositions and growth', importedAt:NOW-2*DAY, updatedFrom:null, off:false,
  items:[
    { id:'pk-prep-1', type:'gap', cat:'preposition', level:'B1', topic:'travel', word:'arrive in', prompt:'We arrived ___ London at midnight.', answers:['in'], hint:'city or country', hint_en:'city or country', hintAlways:true, tags:['place-prepositions'], exp:'arrive in + ciudad', exp_en:'arrive in + city' },
    { id:'pk-tr-1', type:'translate', cat:'translate', level:'B2', topic:'education', word:'personal growth', es:'el crecimiento personal', answers:['personal growth'], exp:'Sin artículo en inglés.', exp_en:'No article in English.' },
    { id:'pk-tr-2', type:'translate', cat:'translate', level:'B1', topic:'general', word:'agree', es:'estar de acuerdo', answers:['agree'], exp:'agree es un verbo.', exp_en:'agree is a verb.' },
    { id:'pk-tr-3', type:'translate', cat:'translate', level:'B1', topic:'general', word:'to be honest', es:'para ser sincero', answers:['to be honest'], exp:'Expresión fija.', exp_en:'Fixed phrase.' },
    { id:'pk-mcq-1', type:'mcq', cat:'collocation', level:'B1', topic:'work', word:'make a decision', prompt:'I need to ___ a decision.', options:['make','do','take','have'], answer:'make', exp:'make a decision', exp_en:'make a decision' },
  ],
  tasks:[
    { id:'gen-b1-1-t1', section:'grammar', paper:'gen-b1-1', part:1, title:'General test B1', instructions:'Choose the answer.',
      questions:[ { n:1, kind:'mcq', stem:'She ___ here since 2020.', options:['lives','has lived','is living'], answer:'has lived' },
                  { n:2, kind:'text', stem:'I look forward ___ hearing from you.', answers:['to'] } ] },
  ],
  papers:[ { id:'gen-b1-1', title:'General test B1 (1)', section:'grammar', minutes:20, max:2 } ],
  pages:[], phrasal:[ { v:'set off', es:'salir de viaje', en:'start a journey', theme:'viajes', level:'B1', sep:false, ex:['We *set off* at dawn.', 'They *set off* for Rome.'] } ],
  grammar:[ { id:'g-pack-1', title:'Artículos', title_en:'Articles', level:'B1', html:'<p>a / an / the</p>', html_en:'<p>a / an / the</p>',
    test:[ { q:'She is ___ engineer.', o:['a','an','the'], a:'an' }, { q:'I need some ___ (advice).', a:['advice'] } ] } ],
};

function v5State(){
  const srs = {}, attempts = [];
  for(const [i,id] of ['m01','m02','m03','pk-prep-1','pk-tr-1'].entries()){
    srs[id] = { e:2.5, i:1, r:1, l:i%2, first:NOW-2*DAY, last:NOW-DAY, due:NOW+DAY };
    attempts.push({ id, t:NOW-DAY, r:i%2?'bad':'ok', ms:5000, a:'x' });
  }
  return {
    v:2, createdAt:NOW-3*DAY, srs, attempts, writings:[], packs:[PACK], exports:[], lastExportAt:0,
    daily:{ '2026-10-06':{ n:5, ok:3, nw:5 } }, session:{ q:['m01','m02'], i:1, retried:[], results:[{ id:'m01', r:'ok' }], started:NOW-DAY, answered:-1 },
    messages:[{ at:NOW-DAY, text:'Hello from Claude', read:false }],
    settings:{ sessionSize:10, newPerDay:12, lang:'en', theme:'auto' },
    tests:[{ id:'t1', kind:'topic', ref:'g-pack-1', title:'Test: Articles', mode:'practice', section:'grammar', at:NOW-DAY, durationSec:60, score:1, max:2,
      parts:[{ task:'topic-g-pack-1', part:null, title:'Articles', score:1, max:2 }], detail:[{ task:'topic-g-pack-1', part:null, n:2, stem:'I need some ___', given:'advices', correct:'advice', r:'bad' }], tasks:['topic-g-pack-1'], auto:false }],
    run:null, wmock:null, read:{ 'g-pack-1':NOW-DAY }, irr:{ go:2 }, speak:{}, phr:{}, rawNotes:[],
  };
}

module.exports = { NOW, DAY, PACK, v5State };
