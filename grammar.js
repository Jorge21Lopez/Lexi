// Temario de gramática basado en la lista oficial del B1 Preliminary (Language specifications), con extras de B2.
// Cada tema: teoría (HTML propio) + test. Pregunta: {q, o:[opciones], a:'correcta'} o {q, a:['respuestas escritas']}
window.LEXI_GRAMMAR = [
{ id:'g-present', title:'Present simple y present continuous', level:'B1', html:`
<p><b>Present simple</b>: hábitos, rutinas, verdades generales y horarios.</p>
<p class="ex">She <b>works</b> in a bank. Water <b>boils</b> at 100°C. The train <b>leaves</b> at 8.</p>
<p><b>Present continuous</b> (am/is/are + -ing): lo que pasa ahora, situaciones temporales y planes ya organizados.</p>
<p class="ex">I<b>'m reading</b> a great book at the moment. We<b>'re meeting</b> Tom tomorrow.</p>
<h4>Verbos de estado</h4>
<p>No suelen ir en continuo: <i>know, like, love, hate, want, need, believe, understand, remember, belong, seem, own</i>.</p>
<p class="ex">✗ I'm knowing the answer. ✓ I <b>know</b> the answer.</p>
<h4>Palabras pista</h4>
<table><tr><th>Simple</th><th>Continuous</th></tr><tr><td>always, usually, often, every day, never</td><td>now, at the moment, today, this week, currently</td></tr></table>
<p class="tip">Ojo con la -s de 3ª persona: es el error más común en el Writing del PET.</p>`,
test:[
{q:'My brother ___ football every Saturday.',o:['plays','is playing','play','playing'],a:'plays'},
{q:'Be quiet! The baby ___.',o:['is sleeping','sleeps','sleep','slept'],a:'is sleeping'},
{q:'I ___ what you mean.',o:['understand','am understanding','understands','am understand'],a:'understand'},
{q:'We ___ to Paris next Friday – we booked the tickets yesterday.',o:['are flying','fly','flies','flew'],a:'are flying'},
{q:'She ___ (not / like) spicy food.',a:["doesn't like",'does not like']},
{q:'What ___ you usually ___ at weekends?',o:['do / do','are / doing','does / do','do / doing'],a:'do / do'},
{q:'Look! It ___ (snow).',a:["'s snowing",'is snowing',"it's snowing"]},
{q:'This bag ___ to my sister.',o:['belongs','is belonging','belong','belonging'],a:'belongs'},
{q:"I ___ at my aunt's house this week because my flat is being painted.",o:["'m staying",'stay','stays','stayed'],a:"'m staying"},
{q:'The museum ___ at 10 a.m. every day.',o:['opens','is opening','open','opening'],a:'opens'}]},

{ id:'g-past', title:'Past simple, past continuous y used to', level:'B1', html:`
<p><b>Past simple</b>: acciones terminadas en un momento del pasado.</p>
<p class="ex">I <b>visited</b> Rome last year. She <b>didn't go</b> to the party.</p>
<p><b>Past continuous</b> (was/were + -ing): acción en progreso en el pasado, a menudo interrumpida por otra en past simple.</p>
<p class="ex">I <b>was having</b> a shower when the phone <b>rang</b>. While we <b>were walking</b>, it started to rain.</p>
<p><b>when</b> + past simple (la interrupción); <b>while</b> + past continuous (la acción larga).</p>
<h4>Used to</h4>
<p>Hábitos o estados pasados que ya no ocurren. Negativa e interrogativa: <b>use to</b> (sin d).</p>
<p class="ex">I <b>used to</b> live in Seville. <b>Did</b> you <b>use to</b> play tennis? I <b>didn't use to</b> like coffee.</p>
<p class="tip">No confundas con <i>be used to + -ing</i> (estar acostumbrado): I'm used to getting up early.</p>`,
test:[
{q:'I ___ my keys yesterday and had to call my dad.',o:['lost','was losing','lose','have lost'],a:'lost'},
{q:'She was cooking dinner when her friend ___.',o:['arrived','was arriving','arrives','arrive'],a:'arrived'},
{q:'While I ___ TV, the lights went out.',o:['was watching','watched','watch','am watching'],a:'was watching'},
{q:'We ___ (not / see) the film last night.',a:["didn't see",'did not see']},
{q:'When I was a child, I ___ be afraid of dogs.',o:['used to','use to','was used to','used'],a:'used to'},
{q:'___ you use to live in London?',o:['Did','Were','Do','Used'],a:'Did'},
{q:'What ___ you doing at 8 o\'clock last night?',o:['were','did','was','are'],a:'were'},
{q:'The past simple of "buy" is ___.',a:['bought']},
{q:'He ___ (fall) off his bike while he was riding to school.',a:['fell']},
{q:"I didn't ___ to like vegetables, but now I love them.",o:['use','used','using','uses'],a:'use'}]},

{ id:'g-perfect', title:'Present perfect vs past simple', level:'B1', html:`
<p><b>Present perfect</b> (have/has + participio): experiencias sin fecha, pasado reciente y situaciones que empezaron en el pasado y siguen.</p>
<p class="ex">I<b>'ve been</b> to Japan. She<b>'s just finished</b>. We<b>'ve lived</b> here <b>for</b> ten years / <b>since</b> 2015.</p>
<p><b>Past simple</b>: cuando decimos o está claro <i>cuándo</i> ocurrió.</p>
<p class="ex">I <b>went</b> to Japan in 2019. ✗ I have been to Japan in 2019.</p>
<table><tr><th>Palabra</th><th>Uso</th></tr>
<tr><td>just</td><td>hace un momento: I've just eaten.</td></tr>
<tr><td>already</td><td>ya (antes de lo esperado): He's already left.</td></tr>
<tr><td>yet</td><td>todavía/ya en negativas y preguntas: Have you finished yet? I haven't finished yet.</td></tr>
<tr><td>ever / never</td><td>alguna vez / nunca: Have you ever tried sushi?</td></tr>
<tr><td>for / since</td><td>for + periodo (for two years); since + punto de inicio (since Monday)</td></tr></table>
<p><b>been vs gone</b>: He's <b>been</b> to Paris (fue y volvió). He's <b>gone</b> to Paris (está allí ahora).</p>
<p class="tip">B2: present perfect continuous para duración de actividades: I've been waiting for an hour.</p>`,
test:[
{q:'I ___ this film three times.',o:["'ve seen",'saw','see','was seeing'],a:"'ve seen"},
{q:'We ___ to Italy last summer.',o:['went','have gone','have been','go'],a:'went'},
{q:'She has lived here ___ 2018.',o:['since','for','from','during'],a:'since'},
{q:"I've known him ___ ten years.",o:['for','since','during','ago'],a:'for'},
{q:"Have you finished your homework ___?",o:['yet','already','just','ever'],a:'yet'},
{q:'Have you ___ been to Scotland?',o:['ever','never','yet','already'],a:'ever'},
{q:'"Where\'s Anna?" "She\'s ___ to the shops. She\'ll be back soon."',o:['gone','been','went','go'],a:'gone'},
{q:'I ___ (just / finish) my exam!',a:["'ve just finished",'have just finished',"i've just finished"]},
{q:'When ___ you start learning English?',o:['did','have','do','has'],a:'did'},
{q:"I've been waiting ___ over an hour!",o:['for','since','from','by'],a:'for'},
{q:"They ___ (not / arrive) yet.",a:["haven't arrived",'have not arrived']}]},

{ id:'g-pastperfect', title:'Past perfect (narración)', level:'B1', html:`
<p><b>Past perfect</b> (had + participio): una acción anterior a otra acción pasada. Muy útil en las <b>stories</b> del Writing Part 2.</p>
<p class="ex">When I got to the station, the train <b>had</b> already <b>left</b>.<br>She was nervous because she <b>had never flown</b> before.</p>
<p>Compara: When I arrived, the film <b>started</b> (llegué y empezó) / When I arrived, the film <b>had started</b> (ya había empezado).</p>
<p>También aparece en el reported speech: "I saw it" → He said he <b>had seen</b> it.</p>
<p class="tip">En tu historia, usa al menos una vez past perfect y past continuous: los examinadores valoran la variedad de tiempos.</p>`,
test:[
{q:'When we arrived at the cinema, the film ___.',o:['had already started','already started','has already started','was already start'],a:'had already started'},
{q:"I didn't recognise him because he ___ a lot.",o:['had changed','has changed','changes','was change'],a:'had changed'},
{q:'She was tired because she ___ (not / sleep) well.',a:["hadn't slept",'had not slept']},
{q:'After I ___ my homework, I went out.',o:['had finished','have finished','finish','was finishing'],a:'had finished'},
{q:"It was the first time I ___ snow.",o:['had seen','have seen','saw','see'],a:'had seen'},
{q:'By the time the police came, the thief ___ (escape).',a:['had escaped']},
{q:'He told me he ___ the book before.',o:['had read','has read','reads','is reading'],a:'had read'},
{q:"We couldn't get in because we ___ our tickets at home.",o:['had left','have left','leave','are leaving'],a:'had left'}]},

{ id:'g-future', title:'El futuro: will, going to, present continuous', level:'B1', html:`
<table><tr><th>Forma</th><th>Uso</th><th>Ejemplo</th></tr>
<tr><td>will</td><td>decisiones en el momento, ofrecimientos, promesas, predicciones (opinión)</td><td>I'll help you. I think it'll rain.</td></tr>
<tr><td>going to</td><td>intenciones ya decididas; predicciones con evidencia</td><td>I'm going to study medicine. Look at those clouds – it's going to rain.</td></tr>
<tr><td>present continuous</td><td>planes organizados (con fecha, hora, entradas…)</td><td>I'm seeing the dentist at 5.</td></tr>
<tr><td>present simple</td><td>horarios y programas</td><td>The bus leaves at 7.15.</td></tr>
<tr><td>shall</td><td>sugerencias y ofrecimientos en preguntas</td><td>Shall we go? Shall I open the window?</td></tr></table>
<p><b>was/were going to</b>: planes que no se cumplieron. I <b>was going to</b> call you, but I forgot.</p>
<p class="tip">Después de when, as soon as, before, after, until → presente, no will: I'll call you when I <b>arrive</b>.</p>`,
test:[
{q:'"The phone\'s ringing." "OK, I ___ it."',o:["'ll answer","'m going to answer",'answer',"'m answering"],a:"'ll answer"},
{q:"I've decided – I ___ learn to drive this summer.",o:["'m going to",'will','shall',"'ll"],a:"'m going to"},
{q:'Look at that man! He ___ fall off the ladder!',o:["'s going to",'will','shall','falls'],a:"'s going to"},
{q:"We ___ dinner with Jo tonight – we booked a table last week.",o:["'re having",'have',"'ll have",'had'],a:"'re having"},
{q:'The film ___ at 8.30, so we need to leave at 8.',o:['starts','will start','is going to start','start'],a:'starts'},
{q:'___ we go to the beach this afternoon?',o:['Shall','Will','Are','Do'],a:'Shall'},
{q:"I'll text you as soon as I ___ home.",o:['get','will get','am going to get','got'],a:'get'},
{q:'I ___ (go) to call you, but my phone died.',a:['was going']},
{q:"I promise I ___ (not / tell) anyone.",a:["won't tell",'will not tell']}]},

{ id:'g-modal-oblig', title:'Modales: obligación, prohibición y consejo', level:'B1', html:`
<table><tr><th>Modal</th><th>Significado</th><th>Ejemplo</th></tr>
<tr><td>must</td><td>obligación (suele venir de quien habla o de normas escritas)</td><td>I must call my mum. Passengers must wear seat belts.</td></tr>
<tr><td>have to</td><td>obligación externa (reglas, circunstancias)</td><td>I have to wear a uniform at work.</td></tr>
<tr><td><b>mustn't</b></td><td><b>prohibición</b>: no está permitido</td><td>You mustn't smoke here.</td></tr>
<tr><td><b>don't have to</b></td><td><b>no es necesario</b> (pero puedes)</td><td>You don't have to come if you're busy.</td></tr>
<tr><td>should / ought to</td><td>consejo, lo recomendable</td><td>You should see a doctor. You ought to rest.</td></tr>
<tr><td>need to / needn't</td><td>necesidad / falta de necesidad</td><td>You needn't bring food – there's plenty.</td></tr></table>
<p>Pasado de must/have to: <b>had to</b>. I had to work late yesterday.</p>
<p class="tip">La diferencia mustn't / don't have to sale muchísimo en los exámenes: prohibido ≠ no necesario.</p>`,
test:[
{q:'You ___ use your phone during the exam. It\'s not allowed.',o:["mustn't","don't have to","needn't","shouldn't have"],a:"mustn't"},
{q:"It's Sunday tomorrow, so I ___ get up early.",o:["don't have to","mustn't","have to","must"],a:"don't have to"},
{q:"You look tired. You ___ go to bed earlier.",o:['should','must to','have','ought'],a:'should'},
{q:'Yesterday I ___ stay at work until 9 p.m.',o:['had to','must','have to','musted'],a:'had to'},
{q:'You ___ to apologise to her.',o:['ought','should','must','need not'],a:'ought'},
{q:'In the UK, you ___ drive on the left.',o:['have to','don\'t have to','needn\'t','ought'],a:'have to'},
{q:"You ___ bring anything to the party – we've got everything.",o:["needn't","mustn't","shouldn't","can't"],a:"needn't"},
{q:'Does she ___ wear a uniform at school?',o:['have to','must','has to','ought'],a:'have to'},
{q:'Visitors ___ (not / feed) the animals. It\'s dangerous for them.',a:["mustn't feed",'must not feed']}]},

{ id:'g-modal-poss', title:'Modales: posibilidad, habilidad y permiso', level:'B1', html:`
<table><tr><th>Modal</th><th>Uso</th><th>Ejemplo</th></tr>
<tr><td>can / can't</td><td>habilidad, permiso, peticiones</td><td>I can swim. Can I sit here? Can you help me?</td></tr>
<tr><td>could</td><td>habilidad en el pasado; peticiones educadas; posibilidad</td><td>I could read at four. Could you open the door? It could rain.</td></tr>
<tr><td>be able to</td><td>habilidad en otros tiempos</td><td>I'll be able to come. I've never been able to ski.</td></tr>
<tr><td>may / might</td><td>posibilidad (no seguro); may también permiso formal</td><td>I might go out later. May I come in?</td></tr>
<tr><td>would</td><td>peticiones educadas</td><td>Would you like a drink? Would you mind waiting?</td></tr></table>
<h4>Deducción (B2)</h4>
<p><b>must</b> = seguro que sí; <b>can't</b> = imposible; <b>might/could</b> = quizás.</p>
<p class="ex">He's been working all day – he <b>must</b> be tired. That <b>can't</b> be Tom – he's in Spain.</p>
<p class="tip">Would you mind + -ing: Would you mind <b>closing</b> the window?</p>`,
test:[
{q:'When I was five, I ___ ride a bike.',o:['could','can','might','may'],a:'could'},
{q:"I'm not sure. I ___ go to the party, but I might stay at home.",o:['might','must','can\'t','should'],a:'might'},
{q:'___ you pass me the salt, please?',o:['Could','Must','Should','May'],a:'Could'},
{q:"I won't ___ come tomorrow – I have to work.",o:['be able to','can','could','able to'],a:'be able to'},
{q:'Would you mind ___ a bit more quietly?',o:['speaking','to speak','speak','spoke'],a:'speaking'},
{q:"She's been running for two hours. She ___ be exhausted.",o:['must','can\'t','might not','should'],a:'must'},
{q:"That ___ be John's car – he sold it last year.",o:["can't","mustn't","couldn't to","shouldn't"],a:"can't"},
{q:'___ I use your phone?',o:['May','Must','Should','Would'],a:'May'},
{q:"I've never ___ (be able to) understand maths.",a:['been able to']}]},

{ id:'g-conditionals', title:'Condicionales (0, 1, 2 y 3)', level:'B1', html:`
<table><tr><th>Tipo</th><th>Estructura</th><th>Uso</th><th>Ejemplo</th></tr>
<tr><td>0</td><td>If + presente, presente</td><td>verdades generales</td><td>If you heat ice, it melts.</td></tr>
<tr><td>1</td><td>If + presente, will + verbo</td><td>situaciones reales/posibles</td><td>If it rains, I'll stay home.</td></tr>
<tr><td>2</td><td>If + pasado, would + verbo</td><td>situaciones imaginarias o poco probables</td><td>If I won the lottery, I'd travel.</td></tr>
<tr><td>3 (B2)</td><td>If + had + participio, would have + participio</td><td>pasado imposible de cambiar</td><td>If I had studied, I would have passed.</td></tr></table>
<p><b>If I were you</b>, I'd… → para dar consejos (were con todas las personas).</p>
<p><b>unless</b> = if not: I won't go <b>unless</b> you come (si no vienes).</p>
<p class="tip">Nunca pongas will/would en la parte del if: ✗ If it will rain…</p>`,
test:[
{q:"If you ___ water to 100°C, it boils.",o:['heat','will heat','heated','would heat'],a:'heat'},
{q:"If it ___ tomorrow, we'll cancel the picnic.",o:['rains','will rain','rained','would rain'],a:'rains'},
{q:'If I had more time, I ___ learn Japanese.',o:['would','will','had','did'],a:'would'},
{q:"If I ___ you, I'd tell her the truth.",o:['were','am','would be','will be'],a:'were'},
{q:"I won't go ___ you come with me.",o:['unless','if','when','because'],a:'unless'},
{q:'If she ___ (study) harder, she would have passed.',a:['had studied',"'d studied"]},
{q:"What would you do if you ___ a famous person in the street?",o:['saw','see','will see','would see'],a:'saw'},
{q:"If you don't hurry, you ___ (miss) the bus.",a:["'ll miss",'will miss']},
{q:"If we had left earlier, we ___ the train.",o:["wouldn't have missed","won't miss","didn't miss","wouldn't miss"],a:"wouldn't have missed"}]},

{ id:'g-passive', title:'La pasiva', level:'B1', html:`
<p>Se usa cuando importa más la acción o el objeto que quién la hace. Estructura: <b>be + participio</b>.</p>
<table><tr><th>Tiempo</th><th>Activa</th><th>Pasiva</th></tr>
<tr><td>Present simple</td><td>They make cars here.</td><td>Cars <b>are made</b> here.</td></tr>
<tr><td>Past simple</td><td>Someone stole my bike.</td><td>My bike <b>was stolen</b>.</td></tr>
<tr><td>Modal</td><td>You must wear a helmet.</td><td>A helmet <b>must be worn</b>.</td></tr>
<tr><td>Present perfect (B2)</td><td>They have closed the road.</td><td>The road <b>has been closed</b>.</td></tr>
<tr><td>Future (B2)</td><td>They will announce it.</td><td>It <b>will be announced</b>.</td></tr></table>
<p>Quién lo hace, con <b>by</b>: The Mona Lisa was painted <b>by</b> Leonardo.</p>
<p class="tip">Muy útil en artículos: "The festival is held every year…", "The building was built in…"</p>`,
test:[
{q:'English ___ in many countries.',o:['is spoken','speaks','is speaking','spoken'],a:'is spoken'},
{q:'The Harry Potter books ___ by J.K. Rowling.',o:['were written','wrote','are writing','was written'],a:'were written'},
{q:'My car ___ (steal) last night.',a:['was stolen']},
{q:'This room ___ every morning.',o:['is cleaned','cleans','is cleaning','cleaned'],a:'is cleaned'},
{q:'Mobile phones must ___ off during the flight.',o:['be switched','switched','switch','being switched'],a:'be switched'},
{q:'The new bridge ___ next year.',o:['will be built','will build','is built','builds'],a:'will be built'},
{q:"The concert has ___ cancelled because of the storm.",o:['been','be','being','was'],a:'been'},
{q:'Rice ___ (grow) in many parts of Asia.',a:['is grown']},
{q:'The window was broken ___ a football.',o:['by','with','from','of'],a:'by'}]},

{ id:'g-reported', title:'Estilo indirecto (reported speech)', level:'B1', html:`
<p>Al contar lo que alguien dijo, los tiempos suelen "retroceder" un paso:</p>
<table><tr><th>Directo</th><th>Indirecto</th></tr>
<tr><td>"I <b>am</b> tired."</td><td>She said she <b>was</b> tired.</td></tr>
<tr><td>"I <b>saw</b> it."</td><td>He said he <b>had seen</b> it.</td></tr>
<tr><td>"I<b>'ll</b> call you."</td><td>She said she <b>would</b> call me.</td></tr>
<tr><td>"I <b>can</b> swim."</td><td>He said he <b>could</b> swim.</td></tr></table>
<p><b>say</b> vs <b>tell</b>: say (something) / tell <b>someone</b> (something). She told <b>me</b> she was tired. ✗ She said me.</p>
<p>Preguntas: sin inversión ni do/did. "Where do you live?" → He asked me <b>where I lived</b>. Sí/no → <b>if/whether</b>: She asked if I was OK.</p>
<p>Órdenes: tell + persona + (not) to: He told me <b>to wait</b> / <b>not to touch</b> it.</p>
<p class="tip">Preguntas indirectas educadas: Do you know <b>where the station is</b>? (no "where is the station")</p>`,
test:[
{q:'"I\'m hungry." → She said she ___ hungry.',o:['was','is','has been','be'],a:'was'},
{q:'He ___ me that he would be late.',o:['told','said','asked','spoke'],a:'told'},
{q:'She ___ that she liked the film.',o:['said','told','told me to','asked'],a:'said'},
{q:'"Where do you live?" → He asked me where I ___.',o:['lived','did live','do live','live'],a:'lived'},
{q:'"Are you OK?" → She asked me ___ I was OK.',o:['if','that','what','do'],a:'if'},
{q:'"Don\'t touch it!" → He told me ___ it.',o:['not to touch','to not touching','don\'t touch','not touch'],a:'not to touch'},
{q:'"I will help you." → He said he ___ help me.',a:['would']},
{q:'Do you know what time ___?',o:['the film starts','does the film start','starts the film','the film does start'],a:'the film starts'},
{q:'"I saw Tom yesterday." → She said she ___ Tom the day before.',o:['had seen','has seen','saw','sees'],a:'had seen'}]},

{ id:'g-gerund', title:'Gerundio o infinitivo', level:'B1', html:`
<table><tr><th>Estructura</th><th>Verbos</th><th>Ejemplo</th></tr>
<tr><td>verbo + <b>-ing</b></td><td>enjoy, finish, mind, avoid, suggest, keep, miss, practise, can't stand, give up</td><td>I enjoy <b>cooking</b>.</td></tr>
<tr><td>verbo + <b>to</b> + inf.</td><td>want, decide, hope, plan, need, agree, promise, refuse, offer, manage, learn, would like</td><td>I decided <b>to leave</b>.</td></tr>
<tr><td>verbo + objeto + <b>to</b></td><td>ask, tell, want, help, allow, advise</td><td>She asked me <b>to wait</b>.</td></tr>
<tr><td>sin to</td><td>make, let, modales</td><td>He made me <b>laugh</b>. Let me <b>go</b>.</td></tr>
<tr><td>ambos</td><td>like, love, hate, start, begin</td><td>I like swimming / to swim.</td></tr></table>
<p>Después de <b>preposición</b> siempre -ing: I'm good <b>at drawing</b>. Thanks <b>for helping</b>. I'm looking forward <b>to seeing</b> you.</p>
<p>Como sujeto: <b>Swimming</b> is good for you.</p>
<p class="tip">B2: remember/stop/try cambian de significado. I stopped <b>smoking</b> (dejé de fumar) / I stopped <b>to smoke</b> (paré para fumar).</p>`,
test:[
{q:'I enjoy ___ to music.',o:['listening','to listen','listen','listened'],a:'listening'},
{q:'She decided ___ a new job.',o:['to look for','looking for','look for','looked for'],a:'to look for'},
{q:"I'm looking forward to ___ you.",o:['seeing','see','saw','to see'],a:'seeing'},
{q:'My parents let me ___ out until 11.',o:['stay','to stay','staying','stayed'],a:'stay'},
{q:'Would you mind ___ the door?',o:['closing','to close','close','closed'],a:'closing'},
{q:"He's very good at ___ (draw).",a:['drawing']},
{q:'She asked me ___ her with her homework.',o:['to help','helping','help','helped'],a:'to help'},
{q:'I need ___ (buy) some milk.',a:['to buy']},
{q:'___ is my favourite sport.',o:['Swimming','Swim','To swimming','Swam'],a:'Swimming'},
{q:"Remember ___ the lights when you leave!",o:['to turn off','turning off','turn off','turned off'],a:'to turn off'}]},

{ id:'g-relatives', title:'Oraciones de relativo', level:'B1', html:`
<table><tr><th>Pronombre</th><th>Para</th><th>Ejemplo</th></tr>
<tr><td>who</td><td>personas</td><td>The man <b>who</b> lives next door is a doctor.</td></tr>
<tr><td>which</td><td>cosas y animales</td><td>The book <b>which</b> I read was great.</td></tr>
<tr><td>that</td><td>personas o cosas (definitorias)</td><td>The film <b>that</b> we saw…</td></tr>
<tr><td>whose</td><td>posesión</td><td>The girl <b>whose</b> phone was stolen…</td></tr>
<tr><td>where</td><td>lugares</td><td>The town <b>where</b> I grew up…</td></tr>
<tr><td>when</td><td>momentos</td><td>The day <b>when</b> we met…</td></tr></table>
<p>Si el relativo es el objeto, se puede omitir: The book (that) I read.</p>
<p><b>Explicativas</b> (entre comas): no se usa <i>that</i>. My brother, <b>who</b> lives in Rome, is a chef.</p>
<p class="tip">", which" puede referirse a toda la frase anterior: I get up at 6, <b>which</b> is hard. Sale mucho en el open cloze.</p>`,
test:[
{q:"That's the woman ___ helped me yesterday.",o:['who','which','whose','where'],a:'who'},
{q:'This is the house ___ I was born.',o:['where','which','who','when'],a:'where'},
{q:"I met a boy ___ father is a famous actor.",o:['whose','who','which','that'],a:'whose'},
{q:"The phone ___ I bought last week has stopped working.",o:['that','who','where','whose'],a:'that'},
{q:'My sister, ___ lives in Madrid, is coming to visit.',o:['who','that','which','whose'],a:'who'},
{q:"He failed his driving test, ___ was a surprise to everyone.",o:['which','that','who','what'],a:'which'},
{q:"Do you remember the day ___ we first met?",o:['when','where','which','who'],a:'when'},
{q:"The film ___ we watched last night was brilliant.",o:['which','who','whose','where'],a:'which'}]},

{ id:'g-compare', title:'Comparativos, superlativos, too/enough, so/such', level:'B1', html:`
<table><tr><th>Adjetivo</th><th>Comparativo</th><th>Superlativo</th></tr>
<tr><td>cheap (1 sílaba)</td><td>cheaper than</td><td>the cheapest</td></tr>
<tr><td>big</td><td>bigger</td><td>the biggest</td></tr>
<tr><td>easy (-y)</td><td>easier</td><td>the easiest</td></tr>
<tr><td>expensive (2+ sílabas)</td><td>more expensive</td><td>the most expensive</td></tr>
<tr><td>good / bad / far</td><td>better / worse / further</td><td>the best / the worst / the furthest</td></tr></table>
<p><b>(not) as … as</b>: She's <b>as tall as</b> me. It's <b>not as cold as</b> yesterday.</p>
<p><b>too</b> + adj (demasiado): It's <b>too expensive</b> to buy. <b>adj + enough</b> (suficiente): He isn't <b>old enough</b> to drive.</p>
<p><b>so</b> + adjetivo / <b>such (a)</b> + (adj +) nombre: It was <b>so</b> cold. It was <b>such a</b> cold day.</p>
<p class="tip">"much/a lot/far + comparativo" para intensificar: much better, far more interesting.</p>`,
test:[
{q:'This book is ___ than the film.',o:['better','more good','best','gooder'],a:'better'},
{q:"It's the ___ day of the year.",o:['hottest','hotter','most hot','hotest'],a:'hottest'},
{q:'My flat is ___ expensive than yours.',o:['more','most','much','as'],a:'more'},
{q:"She isn't as tall ___ her brother.",o:['as','than','so','that'],a:'as'},
{q:"He's not old ___ to drive.",o:['enough','too','so','such'],a:'enough'},
{q:'The coffee was ___ hot to drink.',o:['too','enough','so','very'],a:'too'},
{q:'It was ___ a good film that I watched it twice.',o:['such','so','too','very'],a:'such'},
{q:'The exam was ___ difficult that nobody finished.',o:['so','such','too','enough'],a:'so'},
{q:"This is the ___ (bad) meal I've ever eaten.",a:['worst']},
{q:"Madrid is much ___ (big) than my town.",a:['bigger']}]},

{ id:'g-quantifiers', title:'Contables, incontables y cuantificadores', level:'B1', html:`
<p><b>Incontables</b> (sin plural ni "a"): advice, information, news, furniture, luggage, money, homework, work, weather, bread, equipment, traffic.</p>
<p class="ex">✗ an advice, informations → ✓ some advice, a piece of information</p>
<table><tr><th></th><th>Contables</th><th>Incontables</th></tr>
<tr><td>mucho</td><td>many (a lot of)</td><td>much (a lot of)</td></tr>
<tr><td>poco (positivo)</td><td>a few</td><td>a little</td></tr>
<tr><td>poco (negativo)</td><td>few</td><td>little</td></tr>
<tr><td>¿cuánto?</td><td>How many?</td><td>How much?</td></tr></table>
<p><b>some</b> en afirmativas y ofrecimientos; <b>any</b> en negativas y preguntas. Would you like <b>some</b> tea? There isn't <b>any</b> milk.</p>
<p>Compuestos: something/anything/nothing, someone/anyone/no one, somewhere/anywhere/nowhere.</p>
<p class="tip">"a lot of" sirve para ambos y es lo más natural en frases afirmativas.</p>`,
test:[
{q:'Can you give me some ___?',o:['advice','advices','an advice','advise'],a:'advice'},
{q:'How ___ money do you need?',o:['much','many','few','lot'],a:'much'},
{q:'There are only ___ tickets left.',o:['a few','a little','much','little'],a:'a few'},
{q:"I don't have ___ time today.",o:['much','many','few','a few'],a:'much'},
{q:'Is there ___ milk in the fridge?',o:['any','some','many','a'],a:'any'},
{q:'We need ___ new furniture for the flat.',o:['some','a','many','an'],a:'some'},
{q:"I didn't see ___ at the party I knew.",o:['anyone','someone','no one','nobody'],a:'anyone'},
{q:'How ___ people came?',o:['many','much','lot','little'],a:'many'},
{q:'The news ___ very bad today.',o:['is','are','were','have'],a:'is'},
{q:'Would you like ___ cake?',o:['some','any','many','few'],a:'some'}]},

{ id:'g-prepositions', title:'Preposiciones (tiempo, lugar y dependientes)', level:'B1', html:`
<h4>Tiempo</h4>
<table><tr><td><b>at</b></td><td>horas, momentos: at 5, at night, at the weekend, at Christmas</td></tr>
<tr><td><b>on</b></td><td>días y fechas: on Monday, on 3rd May, on my birthday</td></tr>
<tr><td><b>in</b></td><td>meses, años, estaciones, partes del día: in May, in 2020, in summer, in the morning</td></tr></table>
<p>during (durante algo), for (duración), since (desde), by (como muy tarde), until (hasta).</p>
<h4>Lugar</h4>
<p>at home/work/school, at the station · in the kitchen, in Spain · on the wall, on the bus, on the second floor · next to, opposite, between, behind.</p>
<h4>Dependientes (hay que aprenderlas)</h4>
<p>interested <b>in</b>, good <b>at</b>, afraid <b>of</b>, proud <b>of</b>, tired <b>of</b>, keen <b>on</b>, depend <b>on</b>, listen <b>to</b>, wait <b>for</b>, look <b>for</b>, pay <b>for</b>, laugh <b>at</b>, arrive <b>in</b> (ciudad)/<b>at</b> (edificio), different <b>from</b>, married <b>to</b>, famous <b>for</b>.</p>
<p class="tip">Frases fijas del open cloze: by car, on foot, on time, in time, for sale, at last, in advance, on purpose.</p>`,
test:[
{q:"The meeting is ___ Monday.",o:['on','in','at','by'],a:'on'},
{q:"I was born ___ 2001.",o:['in','on','at','during'],a:'in'},
{q:"See you ___ the weekend!",o:['at','in','on','by'],a:'at'},
{q:"She's very interested ___ history.",o:['in','on','at','for'],a:'in'},
{q:"I'm not very good ___ maths.",o:['at','in','on','with'],a:'at'},
{q:"He's afraid ___ spiders.",o:['of','from','at','with'],a:'of'},
{q:'We arrived ___ London at midnight.',o:['in','at','to','on'],a:'in'},
{q:"I always go to school ___ foot.",o:['on','by','with','at'],a:'on'},
{q:"It depends ___ the weather.",o:['on','of','from','in'],a:'on'},
{q:"Please send your homework ___ Friday at the latest.",o:['by','until','since','during'],a:'by'},
{q:'I fell asleep ___ the film.',o:['during','for','since','while'],a:'during'}]},

{ id:'g-linkers', title:'Conectores (linking words)', level:'B1', html:`
<p>Los conectores suben la nota de <b>Organisation</b> en el Writing. Úsalos con variedad.</p>
<table><tr><th>Función</th><th>Conectores</th></tr>
<tr><td>añadir</td><td>and, also, too, as well, what's more, in addition (B2)</td></tr>
<tr><td>contrastar</td><td>but, although + frase, however (al inicio, con coma), despite / in spite of + nombre/-ing, while</td></tr>
<tr><td>causa</td><td>because + frase, because of + nombre, as, since</td></tr>
<tr><td>resultado</td><td>so, that's why, as a result, therefore (B2)</td></tr>
<tr><td>finalidad</td><td>to + inf, in order to, so that</td></tr>
<tr><td>secuencia</td><td>first, then, after that, later, finally, in the end</td></tr>
<tr><td>ejemplos</td><td>for example, for instance, such as, like</td></tr></table>
<p class="ex">Although it was raining, we went out. = <b>Despite</b> the rain, we went out. = It was raining. <b>However</b>, we went out.</p>
<p class="tip">✗ Despite it was raining. ✓ Despite <b>the fact that</b> it was raining / Despite the rain.</p>`,
test:[
{q:'___ it was cold, we went swimming.',o:['Although','Despite','However','Because'],a:'Although'},
{q:'___ the rain, the match continued.',o:['Despite','Although','However','But'],a:'Despite'},
{q:"I was tired. ___, I finished my homework.",o:['However','Although','Despite','Because'],a:'However'},
{q:"We stayed at home ___ the storm.",o:['because of','because','so','although'],a:'because of'},
{q:"I went to the shop ___ buy some bread.",o:['to','for','so','because'],a:'to'},
{q:"It was late, ___ we took a taxi.",o:['so','because','although','despite'],a:'so'},
{q:'I like outdoor sports ___ climbing and surfing.',o:['such as','for example','so','as well'],a:'such as'},
{q:"In spite ___ feeling ill, she went to work.",o:['of','from','that','the'],a:'of'},
{q:"We left early ___ that we could get good seats.",o:['so','such','to','for'],a:'so'}]},

{ id:'g-questions', title:'Preguntas, preguntas indirectas y so/neither', level:'B1', html:`
<p><b>Orden</b>: (palabra interrogativa) + auxiliar + sujeto + verbo. <b>Where do</b> you work? <b>Have</b> you seen it?</p>
<p><b>Preguntas de sujeto</b> (sin do): <b>Who told</b> you? <b>What happened</b>?</p>
<p><b>Preposición al final</b>: Who are you talking <b>to</b>? What are you looking <b>for</b>?</p>
<p><b>Indirectas</b> (más educadas): Could you tell me <b>where the bank is</b>? I wonder <b>what he wants</b>.</p>
<h4>So / Neither (yo también, yo tampoco)</h4>
<p class="ex">"I love pizza." "<b>So do I</b>." · "I can't swim." "<b>Neither can I</b>." · "I went." "<b>So did I</b>."</p>
<p>Se repite el auxiliar del primer hablante.</p>`,
test:[
{q:'Where ___ you go on holiday last year?',o:['did','were','have','do'],a:'did'},
{q:'Who ___ the window?',o:['broke','did break','broken','does broke'],a:'broke'},
{q:'Can you tell me where ___?',o:['the station is','is the station','the station','does the station be'],a:'the station is'},
{q:'"I love chocolate." "So ___ I."',o:['do','am','have','love'],a:'do'},
{q:'"I can\'t drive." "Neither ___ I."',o:['can','do','am','can\'t'],a:'can'},
{q:'"I went to the concert." "So ___ I."',o:['did','do','was','went'],a:'did'},
{q:'Who are you waiting ___?',o:['for','to','at','on'],a:'for'},
{q:'How ___ does it take to get there?',o:['long','much','many','far'],a:'long'},
{q:'I wonder what time ___.',o:['it is','is it','does it','it does'],a:'it is'}]},

{ id:'g-b2-causative', title:'B2: causativa, wish e inversión básica', level:'B2', html:`
<h4>Causativa: have/get something done</h4>
<p>Cuando otra persona hace algo por ti: I <b>had my hair cut</b>. We're <b>getting the car repaired</b>.</p>
<h4>Wish / If only</h4>
<table><tr><td>deseo presente</td><td>wish + pasado</td><td>I wish I <b>had</b> more time.</td></tr>
<tr><td>arrepentimiento pasado</td><td>wish + past perfect</td><td>I wish I <b>had studied</b> harder.</td></tr>
<tr><td>queja por algo que molesta</td><td>wish + would</td><td>I wish you <b>would</b> stop talking.</td></tr></table>
<h4>Estructuras típicas de key word transformations</h4>
<p>It's the first time I've… = I've never… before · too + adj = not + adj + enough · It's worth + -ing · would rather + inf · used to / be used to · so…that / such…that · as long as / provided that.</p>`,
test:[
{q:'I ___ my car serviced every year.',o:['have','make','do','am'],a:'have'},
{q:'I wish I ___ speak French.',o:['could','can','will','would'],a:'could'},
{q:"I wish I ___ (not / eat) so much last night.",a:["hadn't eaten",'had not eaten']},
{q:'She had her photo ___ for her passport.',o:['taken','take','took','taking'],a:'taken'},
{q:'If only it ___ stop raining!',o:['would','will','can','is'],a:'would'},
{q:"I'd rather ___ at home tonight.",o:['stay','to stay','staying','stayed'],a:'stay'},
{q:"It's worth ___ the museum.",o:['visiting','to visit','visit','visited'],a:'visiting'},
{q:"I'm not used to ___ up so early.",o:['getting','get','got','to get'],a:'getting'}]}
];

// Verbos irregulares: base, pasado, participio, significado
window.LEXI_IRREGULAR = `be|was/were|been|ser, estar
beat|beat|beaten|vencer, golpear
become|became|become|convertirse
begin|began|begun|empezar
bite|bit|bitten|morder
blow|blew|blown|soplar
break|broke|broken|romper
bring|brought|brought|traer
build|built|built|construir
burn|burnt/burned|burnt/burned|quemar
buy|bought|bought|comprar
catch|caught|caught|coger, atrapar
choose|chose|chosen|elegir
come|came|come|venir
cost|cost|cost|costar
cut|cut|cut|cortar
deal|dealt|dealt|tratar
dig|dug|dug|cavar
do|did|done|hacer
draw|drew|drawn|dibujar
dream|dreamt/dreamed|dreamt/dreamed|soñar
drink|drank|drunk|beber
drive|drove|driven|conducir
eat|ate|eaten|comer
fall|fell|fallen|caer
feed|fed|fed|alimentar
feel|felt|felt|sentir
fight|fought|fought|pelear
find|found|found|encontrar
fly|flew|flown|volar
forget|forgot|forgotten|olvidar
forgive|forgave|forgiven|perdonar
freeze|froze|frozen|congelar
get|got|got|conseguir, llegar
give|gave|given|dar
go|went|gone|ir
grow|grew|grown|crecer, cultivar
hang|hung|hung|colgar
have|had|had|tener
hear|heard|heard|oír
hide|hid|hidden|esconder
hit|hit|hit|golpear
hold|held|held|sostener
hurt|hurt|hurt|herir, doler
keep|kept|kept|guardar, mantener
know|knew|known|saber, conocer
lay|laid|laid|poner, colocar
lead|led|led|guiar, dirigir
learn|learnt/learned|learnt/learned|aprender
leave|left|left|dejar, irse
lend|lent|lent|prestar
let|let|let|dejar, permitir
lie|lay|lain|tumbarse
light|lit|lit|encender
lose|lost|lost|perder
make|made|made|hacer, fabricar
mean|meant|meant|significar
meet|met|met|conocer, quedar
pay|paid|paid|pagar
put|put|put|poner
read|read|read|leer
ride|rode|ridden|montar
ring|rang|rung|llamar, sonar
rise|rose|risen|subir, elevarse
run|ran|run|correr
say|said|said|decir
see|saw|seen|ver
sell|sold|sold|vender
send|sent|sent|enviar
set|set|set|fijar, poner
shake|shook|shaken|agitar
shine|shone|shone|brillar
shoot|shot|shot|disparar
show|showed|shown|mostrar
shut|shut|shut|cerrar
sing|sang|sung|cantar
sink|sank|sunk|hundirse
sit|sat|sat|sentarse
sleep|slept|slept|dormir
speak|spoke|spoken|hablar
spell|spelt/spelled|spelt/spelled|deletrear
spend|spent|spent|gastar, pasar (tiempo)
spread|spread|spread|extender
stand|stood|stood|estar de pie
steal|stole|stolen|robar
stick|stuck|stuck|pegar
sting|stung|stung|picar
swim|swam|swum|nadar
take|took|taken|coger, llevar
teach|taught|taught|enseñar
tear|tore|torn|rasgar
tell|told|told|contar, decir
think|thought|thought|pensar
throw|threw|thrown|lanzar
understand|understood|understood|entender
wake|woke|woken|despertar
wear|wore|worn|llevar puesto
win|won|won|ganar
write|wrote|written|escribir`.split('\n').map(l=>{const [b,p,pp,es]=l.split('|');return {b,p,pp,es};});
