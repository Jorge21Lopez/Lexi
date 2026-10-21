# Lexi v7: informe de cambios

## 1. Resumen (5–8 líneas, en español)

Lexi 7.0.0 cambia de "ejercicios fijos" a **unidades de aprendizaje**: cada phrasal verb, conector, collocation, irregular, familia de palabras, transformación, ítem de vocabulario y pregunta de gramática tiene un estado propio (etapas 0–5, repaso espaciado, aciertos por habilidad). La app genera los ejercicios al vuelo con **35 formatos** que van del significado al uso y a la producción.
Hay cuatro librerías nuevas (54 conectores, 94 collocations, 47 familias y 42 transformaciones), y se han completado los 84 phrasal verbs y los 99 irregulares.
La práctica diaria mezcla 7 áreas con presets configurables (15/25/40 ejercicios y "Keep going"). Las unidades nuevas se presentan con tarjeta, y hay sesión *Learn new*, flashcards, ficha de cada unidad con "Practise this one" y tests por librería con modo Meaning/Usage/Mixed.
El problema de los phrasal verbs repetidos está resuelto: en 10 tests seguidos salen **84 de 84** (antes, unos 52).
Los datos de la v6 se migran sin pérdidas, la exportación pasa a la versión 4 y los 31 tests automáticos pasan.

## 2. Auditoría inicial (qué había y por qué se repetía)

- **Versión de partida:** 6.0.0, con 26 tests en verde. Del prompt v6 estaba todo implementado. `lexi-prompt-formatos.md` y `lexi-mejoras-logica-ejercicios.md` no existían en el repo (el README citaba el primero; ahora existe).
- **Generación de ejercicios en la v6:** un único motor por ítem con 6 formatos (`mcq`, `gap_hint`, `gap`, `wordform`, `translate`, `dictation`) que rotaban según los aciertos seguidos.
  - Los phrasal verbs eran un ítem automático `ph-…` con **un solo ejemplo** y la pista "verbo: significado". En la práctica solo se pedía la forma conjugada.
  - Los irregulares solo tenían "escribe el pasado o el participio".
  - Los conectores no existían como unidad (solo había preguntas del tema `g-linkers`).
  - Use of English tenía 4 tareas fijas.
  - Había un único formato de significado: el mcq "¿qué significa?" del test de phrasal verbs.
- **Por qué se repetían los phrasal verbs.** Simulé 20 veces 10 tests de 10 preguntas:

  | Acierto | Verbos distintos (de 84) |
  |---|---|
  | 100 % | 52–65 (media 59,5) |
  | 70 % | 48–57 (media 51,8) |
  | 40 % | 49–58 (media 51,6) |

  Hay tres causas:
  1. Cada test cogía siempre los 3 verbos con más fallos (`S.phr`).
  2. Los otros 7 se elegían al azar sin memoria de los tests anteriores.
  3. El estado de los tests (`S.phr`) y el de las sesiones (`S.srs`) iban por separado.

## 3. Formatos implementados

| # | Formato | Skill | Librerías donde aplica | Notas |
|---|---|---|---|---|
| 1 | Meaning in context (`meaning`) | understand | pv, cn, col | Término resaltado en la frase; opciones en EN o ES según el idioma. |
| 2 | Reverse meaning (`reverse`) | understand | pv, cn, col, irr | En los irregulares, el significado está en español (marcado `lang="es"`). |
| 3 | Synonym swap (`synonym`) | understand | pv | Usa `syn` conjugado en el ejemplo 1 (postpone → POSTPONING). Si la forma es ambigua (cut/put/set tras un sujeto), no se genera. |
| 4 | Same or different? (`samediff`) | understand | pv, cn | "Igual": sinónimo propio o conector de la misma función y el mismo patrón. "Distinto": sinónimo de un `confuseWith`, o un conector de otra función. |
| 5 | Matching (`match`) | understand | pv, cn, col | 5 unidades, todas ya vistas (nunca se usa para conocer algo nuevo). Cuenta para las 5. |
| 6 | Odd one out (`oddone`) | use | pv, cn | "¿Qué frase es incorrecta?": `wrong` + 3 frases correctas. Ver limitaciones. |
| 7 | Which situation? (`situation`) | understand | pv | Usa `sit`. Los distractores son de otros temas. |
| 8 | Listen and choose (`listen`) | understand | pv, cn, col | La frase solo se oye (TTS); se ve al corregir. |
| 9 | Natural or not? (`natural`) | use | pv, cn, col, irr, wf, voc, gr | Errores reales de `wrong`, `wrongVerb`, forma irregular mal, otra forma de la familia, preposición o opción de gramática incorrecta. |
| 10 | Spot and fix (`spotfix`) | use | pv, cn, col, irr, wf, voc, gr | Se toca la palabra y se escribe la corrección. Si sobra una palabra, basta con tocarla. |
| 11 | Particle choice (`particle`) | use | pv | Los distractores son partículas que forman phrasal verbs reales con ese verbo; el significado se ve como pista. |
| 12 | Verb choice (`verbchoice`) | use | pv | Verbos que forman phrasal verbs reales con esa partícula, conjugados igual que la respuesta. |
| 13 | Collocation verb (`colverb`) | use | col | `wrongVerb` + verbos comunes, conjugados. Nunca ofrece los de `alsoCorrect` (se aceptan) ni los de `avoid` (cambian el sentido sin ser un error claro: *miss the bus*). |
| 14 | Connector by function (`connfn`) | use | cn | Etapas ≤2: otra función. Etapa 3+: también `confuseWith` de la misma función con otro patrón. Nunca la misma función con el mismo patrón. |
| 15 | Join the sentences (`join`) | use | cn | Dos frases → 4 versiones unidas; las incorrectas cambian el conector por otro de distinto patrón (Despite it rained…). |
| 16 | Build the sentence (`order`) | use | pv, cn, col | Fichas. Se omiten los separables con objeto detrás (tienen dos órdenes correctos). |
| 17 | Your own sentence (`complete`) | produce | pv, cn, col | Autoevaluado contra el modelo; la frase va a `productions` en la exportación. |
| 18 | Gap with hint / gap (`gap_hint`, `gap`) | produce | pv, cn, col, voc | En pv sin pista se da el número de palabras y la inicial. |
| 19 | Correct form (`form`) | produce | pv, irr | El formato de la v6, ahora uno más. |
| 20 | Translate the chunk (`translate`) | produce | pv, cn, col, voc | Acepta los equivalentes con el mismo significado en español. |
| 21 | Dictation (`dictation`) | produce | pv, cn, col, irr, voc | Frases de ejemplo de hasta 16 palabras. |
| 22 | Three forms (`three`) | produce | irr | Pasado y participio. |
| 23 | Form in context (`formchoice`, `form`) | use / produce | irr | Elegir o escribir la forma (swum/swam/swimmed…). |
| 24 | Spot the wrong form (`spotfix`) | use | irr | Participio cambiado por pasado (o al revés, o regularizado). |
| 25 | Pattern groups (`group`) | recognise | irr | 13 grupos; los distractores son de familias de patrón distintas. |
| 26 | Listen and write (`listenwrite`) | produce | irr | Se oyen las tres formas. |
| 27 | Word formation (`wordform`) | produce | wf, voc | Base en mayúsculas. |
| 28 | Word family grid (`wfgrid`) | produce | wf | Nombre/verbo/adjetivo/adverbio; acepta cualquier forma del grupo (employer o employee). |
| 29 | Open cloze (`opencloze`) | produce | cn | 3–4 frases con conectores de una palabra. Cada hueco cuenta para su unidad. |
| 30 | Multiple-choice cloze (`mccloze`) | use | voc | Ítems mcq de vocabulario, falsos amigos, collocations y phrasal verbs; admite `confuseWith`. |
| 31 | Key word transformation (`kwt`) | produce | tr | Corrección tolerante (frase completa, mayúsculas, contracciones). |
| 32 | Grammar question (`gq`) | use / produce | gr | El formato original de la pregunta. |
| 33 | Grammar error / natural (`spotfix`, `natural`) | use | gr | Se inserta una opción incorrecta del mcq. |
| + | Choose (`choose`) | recognise | voc | Un `gap` presentado como elección (derivación 4.7). |
| + | Word form choice (`wfchoice`) | recognise | wf | Para las primeras etapas de las familias. |
| + | Transformation choice (`ktchoice`) | use | tr | Para las primeras etapas de las transformaciones. |
| + | Presentation card y Flashcard | – / recognise | todas las de estudio | Tarjeta "Got it" y tarjetas con Again/Hard/Good/Easy. |

Validación (prueba 2): 5 ejercicios de cada formato para cada una de las 714 unidades base (74 combinaciones librería-formato). Resultado: **0 problemas**. Se comprueba que la respuesta esté entre las opciones, que no haya opciones repetidas, que ningún distractor se acepte como correcto, que haya explicación en EN y ES y que la respuesta correcta se acepte.

## 4. Librerías nuevas o ampliadas (con número de entradas)

| Librería | Archivo | Entradas | Campos |
|---|---|---|---|
| Conectores (nueva) | `connectors.js` | **54** (11 funciones) | w, fn, level, register, pattern, es, en, 2 ejemplos, wrong, confuseWith, alsoCorrect, join |
| Collocations (nueva) | `collocations.js` | **94** | c, verb, noun, es, en, 2 ejemplos, wrongVerb, theme, alsoCorrect, avoid |
| Familias de palabras (nueva) | `families.js` | **47** | base, es, forms (2–6 por familia), una frase por forma |
| Transformaciones (nueva) | `transformations.js` | **42** (17 estructuras) | id, structure, from, key, to, answers, exp, exp_en |
| Phrasal verbs (ampliada) | `phrasal.js` (`LEXI_PHRASAL_EXTRA`) | **84 de 84** | syn, register, confuseWith, wrong, particleMeaning (ES/EN), sit |
| Irregulares (ampliada) | `grammar.js` (`LEXI_IRREGULAR_EXTRA`) y `content_en.js` (`LEXI_EN.irregular`) | **99 de 99** | group (13 patrones), ex (pasado y participio), significado en inglés |

Todo el contenido nuevo lo he redactado yo, en inglés británico B1–B2. **Conviene que el tutor lo revise.**

**Revisión hecha después del primer informe** (a raíz de la revisión del usuario):
- **Collocations:** separé "también correcto" (`alsoCorrect`, se acepta) de "no usar como opción" (`avoid`, ni se ofrece ni se acepta). Antes, por ejemplo, *miss* se aceptaba en *catch the bus* y *have* en *make friends*. Revisadas las 60 que tenían alternativas: 36 collocations tienen equivalentes reales y 41 tienen `avoid`.
- **Conectores:** ya no se acepta cualquiera con la misma función y el mismo patrón (*unless* ≠ *as long as*, *until* ≠ *as soon as*). Solo se aceptan los equivalentes reales listados en `alsoCorrect` (revisé 30 conectores; 52 de 54 tienen alguno) (although = though = even though, because = since = as…). "Same or different" solo usa esos como "iguales". La misma función y el mismo patrón siguen sirviendo para no ofrecerlos nunca como incorrectos.
- **Sinónimos de phrasal verbs:** 5 eran solo aproximados (cheer up ≈ smile, warm up ≈ prepare, go out ≈ go somewhere, end up ≈ arrive, fall out with ≈ argue with). Ahora van marcados con `~`: aparecen en la explicación como "parecido a", pero no se usan en Synonym swap ni en Same or different.
- **Verb choice:** muestra siempre el significado como pista (igual que Particle choice), así que *took up smoking* es claramente incorrecto si la pista dice "dejar (un hábito)". Lo cubre un test.

## 5. Algoritmo: etapas, escalera de formatos, cobertura, enfriamiento (cómo quedó realmente)

- **Estado por unidad** (`S.units[uid]`): `stage`, `due`, `interval`, `ease`, `reps`, `seen`, `correct`, `lapses`, `lastSeen`, `lastOk`, `lastBad`, `lastFormats` (5), `bySkill`, `okSkills`, `introduced`. El repaso espaciado mantiene el algoritmo de la v6 (1, 3, intervalo × ease…).
- **Etapas:** un acierto lleva de 0 a 1 y de 1 a 2. De 2 en adelante, para subir hace falta acertar en **dos skills distintos** desde el último cambio de etapa. Un fallo baja una etapa (mínimo 1) y programa el repaso en 10 minutos.
- **Escalera:** cada formato tiene un nivel (1 = etapas 0–1 … 4 = etapas 4–5). Se eligen los formatos del nivel de la unidad con más peso y los vecinos con menos. Además:
  - se penalizan los 3 últimos formatos de esa unidad y el formato del ejercicio anterior;
  - si `bySkill` muestra ≥80 % en significado/uso y <60 % en producción (o ninguna producción desde la etapa 2), los formatos de producción pesan el triple.
- **Reintroducción tras un fallo:** 4–7 posiciones más tarde, con un formato de nivel 1 distinto y la explicación visible antes de contestar.
- **Cobertura:** a igual prioridad, gana la unidad menos vista y la que hace más tiempo que no sale. En los tests de librería, las unidades de los **2 últimos tests** solo vuelven si no quedan otras.
- **Enfriamiento:** una unidad acertada no vuelve en 4 horas salvo que esté vencida o que su último resultado sea un fallo. Las unidades en enfriamiento **nunca** rellenan una sesión. Lo que falta se completa primero con el 2.º y 3.º ejercicio de las unidades nuevas de hoy y, si aún faltan, con más unidades nuevas, aunque se pase del límite diario. En ese caso la app avisa ("Not enough reviews right now, so N new items fill the session"). Solo si no queda nada nuevo se ofrece un test mixto.
- **Intercalado:** nunca dos seguidos del mismo formato, de la misma unidad ni (salvo sesiones de una librería) de la misma librería. Primero se ordena con un algoritmo voraz y después una pasada de intercambios repara los choques del final.
- **Semilla:** el reto diario usa mulberry32 con semilla por día y no depende del historial del usuario.

## 6. Sesión diaria y tests: composición final y ajustes disponibles

- **Daily practice:** 15 / 25 / 40 ejercicios (por defecto 25), más "Keep going" (+10).
  - Presets: Balanced 20/20/10/15/10/15/10, Exam focus y Vocabulary boost (los del prompt), con ajuste fino por área en pasos de 5 % (preset "Custom").
  - En cada área: vencidas → nuevas (con tarjeta de presentación antes) → refuerzo de etapas 1–2 → el resto, de menos a más vistas.
  - Si faltan repasos (un usuario nuevo), cada unidad nueva recibe un 2.º y un 3.º ejercicio más difíciles.
  - Después se equilibra: ≥25 % de producción, ≥40 % de significado + uso y ≥6 formatos. El primer ejercicio de una unidad nueva no se toca nunca.
- **New items per day:** 5 / 10 / 15 / 20 / 30 (por defecto 10), repartido entre áreas según el preset. "Learn more today" abre *Learn new* aunque se haya llegado al límite, con un aviso suave.
- **Learn new:** librería (o "que elija la app": lista de aprendizaje y librería más floja), tema y 3/5/8 unidades. Primero todas las tarjetas, luego 3 rondas mezcladas: significado → uso → producción.
- **Home:** recorrido Práctica → Aprender → Test, mini barras por área del día, etapas por librería y aviso cuando un área tiene menos de 20 unidades nuevas.
- **Library test:**
  - Opciones: phrasal verbs, conectores, collocations, irregulares, familias o transformaciones; 10/20/30 preguntas; alcance (todas, mi lista, aprendiendo, más falladas, un tema); modo Meaning / Usage / Mixed.
  - Resultado: "Meaning x/y · Usage x/y · Production x/y", desglose por formato y área, fallos con enlace a la ficha, "Learn these" y "Practise my mistakes".
- **Test mixto y retos:** usan el motor nuevo.
  - Daily challenge: 10 de producción escrita sin pistas, igual todo el día.
  - Speed round: 90 s, solo elección.
  - Sudden death, No hints, B2 only y Mistakes review.
  - Los tres primeros no tocan el estado de aprendizaje.

## 7. Cambios en el formato de packs (campos y ejemplo JSON mínimo de cada colección nueva)

```json
{ "format": "lexi-pack", "pack": { "id": "p-v7-demo", "name": "Demo v7",
  "connectors": [ { "w": "nonetheless", "fn": "contrast", "level": "B2", "register": "formal", "pattern": "sentence-initial + comma", "es": "no obstante", "en": "however",
                    "ex": ["It was cold. *Nonetheless*, we swam.", "He was tired. *Nonetheless*, he went on."], "wrong": "It was cold. Nonetheless of it, we swam. => It was cold. Nonetheless, we swam.", "confuseWith": ["despite"] } ],
  "collocations": [ { "c": "take a seat", "verb": "take", "noun": "a seat", "es": "sentarse", "en": "sit down", "ex": ["Please *take a seat*.", "She *took a seat* by the window."], "wrongVerb": "catch", "theme": "social", "alsoCorrect": ["have"], "avoid": ["get"] } ],
  "families": [ { "base": "drive", "es": "conducir", "forms": { "verb": "drive", "person": "driver", "noun": "driving" }, "ex": { "person": "The *driver* stopped.", "noun": "*Driving* in the city is stressful." } } ],
  "transformations": [ { "id": "px1", "structure": "present perfect", "from": "I started here in May.", "key": "SINCE", "to": "I have worked here ___ May.", "answers": ["since"], "exp": "since + punto de partida.", "exp_en": "since + starting point." } ],
  "phrasal": [ { "v": "look out", "es": "tener cuidado", "en": "be careful", "theme": "problemas", "level": "B1", "ex": ["*Look out*! A car!", "You should *look out* for pickpockets."],
                 "syn": "be careful", "register": "informal", "confuseWith": ["look after"], "wrong": "Look out the car! => Look out for the car!", "particleMeaning": "out = alerta", "particleMeaning_en": "out = alert", "sit": "You shout to warn a friend about a bike." } ],
  "items": [ { "id": "v7-1", "type": "mcq", "cat": "vocab", "level": "B1", "topic": "money", "word": "lend", "prompt": "Can you ___ me ten euros?", "options": ["lend","borrow","rent","owe"], "answer": "lend",
               "confuseWith": ["borrow","rent","owe"], "alsoCorrect": [], "wrong": "Can you borrow me ten euros?", "tags": ["lend-borrow"], "exp": "lend = prestar (dar).", "exp_en": "lend = give for a time." } ],
  "learnList": ["cn:nonetheless", "pv:look out"] } }
```

- Las colecciones se validan con motivos, como el resto: `connectors[1] (bad one): "fn" must be one of…`, falta de asteriscos, `to` sin `___`, etc.
- Un elemento con la misma clave que uno base (w, c, base, id, v) lo sustituye.
- Documentado en `README.md` y en `lexi-prompt-formatos.md` (nuevo).

## 8. Cambios en la exportación (campos nuevos con ejemplo)

La exportación pasa a `version: 4` y conserva todos los campos de la v3. La única excepción es `summary.accuracyByFormat`, que ahora es por formato exacto; el agrupado anterior sigue en `accuracyByFormatGroup`.

```json
{ "attempts": [ { "id": "pv:give up", "uid": "pv:give up", "at": "2026-10-14T09:12:00.000Z", "result": "bad", "answer": "in", "format": "particle", "skill": "use", "mode": "daily", "hintShown": true,
                  "question": "My dad gave ___ smoking ten years ago.", "correct": "up" } ],
  "units": { "pv:give up": { "lib": "pv", "term": "give up", "level": "B1", "theme": "salud" } },
  "unitState": { "pv:give up": { "stage": 2, "seen": 5, "correct": 3, "lapses": 2, "intervalDays": 1, "ease": 2.3, "due": "…", "bySkill": { "understand": { "n": 3, "ok": 3 }, "use": { "n": 2, "ok": 0 } }, "lastFormats": ["meaning","particle"] } },
  "productions": [ { "uid": "pv:put off", "term": "put off", "at": "…", "prompt": "Write your own sentence with \"put off\".", "text": "I always put off my homework.", "selfAssessed": "ok" } ],
  "summary": { "units": { "pv": { "total": 84, "new": 60, "learning": 12, "familiar": 6, "known": 4, "strong": 2, "mastered": 0 } },
               "accuracyBySkill": { "understand": { "n": 40, "ok": 35 }, "produce": { "n": 20, "ok": 11 } },
               "accuracyByFormat": { "particle": { "n": 6, "ok": 3 } },
               "stuck": [ { "uid": "cn:although", "term": "although", "fails": 3, "recent": [ { "at": "…", "answer": "despite", "format": "connfn" } ] } ],
               "learnList": ["cn:nonetheless"] } }
```

Los intentos antiguos reciben `uid` y `skill` deducidos de su `id` y su formato.

## 9. Resultados de las pruebas (antes/después de cobertura y variedad, tiempos)

`node tests/run.js` → **38/38** tests superados (estables en ejecuciones repetidas). Los 7 últimos cubren la revisión: sesiones rellenadas sin repetir, `avoid` en collocations, equivalentes de conectores, pista en Verb choice, sinónimos aproximados, significado inglés de los irregulares y órdenes alternativos en Build the sentence.

| Prueba | Antes (v6) | Después (v7) |
|---|---|---|
| Cobertura: verbos distintos en 10 tests de 10 phrasal verbs | 48–57 de 84 (media 51,8 con 70 % de acierto) | **84 de 84** |
| Variedad: 50 sesiones diarias de 25 | 6 formatos posibles en total; solo se evitaba repetir categoría | 0 incidencias. Formatos por sesión: mínimo 10–13, media ≈15,5. Todas las áreas en cada sesión, ningún formato ni unidad dos veces seguidos, ≥25 % de producción y ≥40 % de significado + uso |
| Rendimiento: generar una sesión de 40 | – | Media 3–9 ms, máximo 6–23 ms (Node en este PC, 400 unidades con historial) |
| Generadores (35 formatos × 714 unidades × 5) | – | 0 problemas |
| Migración de un estado v6 | – | Sin pérdidas: srs, intentos, tests, writings y packs intactos. Progreso en `voc:`, `pv:` (desde `ph-…`), `irr:` y `gr:`. La sesión a medias se convierte |
| Enfriamiento, escalera, Learn new, límite diario, tests por librería, flashcards, ficha, packs, exportación v4 | – | En verde |
| Recorrido bilingüe (69 pantallas y estados, EN y ES, estado vacío y v6) | – | Sin `undefined`/`NaN` y sin español en modo EN (salvo contenido sin `_en`, marcado `lang="es"`) |

También revisé a mano en Chrome (escritorio) matching, spot and fix, three forms, open cloze, Home y la ficha de unidad. Ahí encontré y corregí un fallo de color en la corrección del matching.

## 10. Limitaciones conocidas y lo que no se hizo

- **Revisión de contenido:** las 237 entradas nuevas y el enriquecimiento de 183 los he escrito yo y los he revisado una vez (ver sección 4), pero no los ha revisado un profesor. Pueden quedar distractores gramaticales aunque no idiomáticos; la pista de significado, `alsoCorrect` y `avoid` lo reducen.
- **Odd one out** es "¿qué frase es incorrecta?" (un uso erróneo entre tres correctos), no "el término con otro significado". Por eso cuenta como *use*.
- **Open cloze** no es un texto conectado: son 3–4 frases de ejemplo de conectores de una palabra.
- **Which situation?** solo existe para phrasal verbs (solo ellos tienen `sit`). **Synonym swap** solo para phrasal verbs, y no se genera cuando la forma verbal es ambigua.
- **Build the sentence** acepta la frase original y los órdenes con un complemento de tiempo o lugar o una subordinada movidos al otro extremo (*On weekdays I usually get up at seven*, *The match went ahead despite the rain*), sin partir nunca la expresión practicada. Otros órdenes válidos menos frecuentes (adverbios de frecuencia en otra posición, dos complementos intercambiados) no se aceptan, y siguen omitiéndose las frases con separables seguidos de objeto.
- **Spot and fix** pide escribir la corrección; no hay versión de elegirla.
- **uid de gramática:** `gr:<tema>:<hash del enunciado>`, no `gr:<tema>:<n>`. La posición cambia si se añaden preguntas, el hash no (es el mismo criterio de los ids `gq:` de la v6).
- `S.srs`, `S.phr` y `S.irr` se conservan sin cambios, pero ya no se actualizan: el estado vivo está en `S.units`.
- Para no acortar sesiones, la app puede pasarse del límite de nuevos al día (siempre avisando). Si prefieres respetar el límite estricto, es un cambio de una línea (`fillNew:false`).
- No he probado en un móvil real: los tiempos son de Node en este PC, con mucho margen sobre los 100 ms. Antes de abrir la v7: Data → Download backup, y probarla unos días.

## 11. Sugerencias de contenido que haría falta añadir por packs

1. `sit` para conectores y collocations, para tener "Which situation?" en esas librerías.
2. Un segundo `wrong` por phrasal verb y por conector (errores reales del alumno sacados de `stuck` y de los writings), para que "Natural or not?" y "Spot and fix" no repitan frase.
3. `alsoCorrect` y `confuseWith` en los ítems mcq de vocabulario (lend/borrow/rent/owe, say/tell, win/earn), para enriquecer el multiple-choice cloze.
4. Más familias B2 (ahora 47), sobre todo prefijos negativos (dis-, im-, ir-, mis-) y sufijos -ness/-ment/-ity, y más transformaciones de wish, passive y reported speech, que son las más preguntadas en B2 First.
5. Textos de open cloze conectados de verdad (pueden entrar como `tasks` de `uoe` Part 2) y unidades de preposiciones dependientes (interested in, depend on…) como `items` con `cat: "preposition"`.
6. Más phrasal verbs B2 y conectores de registro formal para el writing de B2.
7. Revisar las `productions` de cada exportación y devolver la corrección en `message` o como ítems nuevos.

## 12. Instrucciones para publicar (archivos tocados, versión, pasos en GitHub)

- **Versión:** `APP_VERSION = '7.0.0'` y `VERSION = 'lexi-7.0.0'` en `sw.js` (al desplegar, el workflow la sustituye por una basada en el commit).
- **Archivos nuevos:** `engine.js` (unidades, generadores, estado y selección), `study.js` (pantallas y sesión), `connectors.js`, `collocations.js`, `families.js`, `transformations.js`, `lexi-prompt-formatos.md` y `CAMBIOS-v7.md`.
- **Archivos modificados:** `app.js`, `practice.js`, `stats.js`, `phrasal.js`, `grammar.js`, `index.html` (scripts y estilos), `sw.js` (SHELL y VERSION), `README.md`, `tests/run.js`, `tests/fixtures.js` y `tests/harness.js`.
- **Pasos:**
  1. `node tests/run.js` (debe dar 38/38).
  2. Commit y push a `main`: GitHub Actions publica la app en 1–2 minutos (pestaña **Actions**).
  3. Si se sube a mano: Add file → Upload files con **todos** los archivos nuevos, sobre todo los 6 `.js` nuevos. Sin ellos la app no arranca.
  4. En el móvil, abrir la app una vez con conexión: el service worker descarga la versión nueva y los datos se migran solos al abrirla.
  5. Recomendado: descargar una copia de seguridad (Datos) **antes** de abrir la v7 por primera vez.

---

# v7.1: Save to route

## 1. Resumen

Lexi 7.1.0 permite crear **rutas de estudio propias sin JSON**, como una playlist. Cualquier cosa se guarda con el botón **Save** (marcador): un conector, un phrasal verb, una collocation, un irregular, una familia, una transformación, una palabra, una pregunta o un tema de gramática, una página o un apunte. La hoja inferior permite marcar una o varias rutas o crear una nueva en el mismo paso, y el toast permite deshacer.
Cada ruta tiene su pantalla, con los elementos agrupados por tipo, y sus propias acciones: Learn, Practise 10/20/30, Flashcards, Test, Read theory y Stats. Se puede editar (renombrar, emoji, subir/bajar, quitar, fijar en Home, duplicar, borrar) y ampliar con un buscador global en inglés y español.
El progreso sigue siendo por unidad: quitar elementos o borrar rutas nunca lo toca. La "learning list" de la 7.0 se convierte en la ruta "My learning list".
Los packs pueden traer `routes` y la exportación pasa a la **versión 5** (`routes`, `routeTests`, `routeId` en los intentos y `summary.routes`). Pasan los **51 tests** (38 anteriores y 13 nuevos).
Lo pactado para la **7.2** (bloques y ajustes de lógica de la práctica diaria) no está en esta entrega.

## 2. Qué se hizo y dónde

- **Archivo nuevo `routes.js`** (≈480 líneas, cargado entre `study.js` y `app.js`). Contiene:
  - referencias y rutas (`refUnits`, `routeUnits`, `routedUids`, con caché);
  - el botón y la hoja "Save to…";
  - las pantallas My routes, ruta, edición, Add more, test de ruta y Stats;
  - la práctica de ruta, los tests de ruta con comparación, el import de `routes` y la exportación.
- **`app.js`**:
  - estado v4 y migración `migrateRoutes`;
  - toast con "Undo";
  - iconos nuevos;
  - vistas nuevas en el router;
  - la hoja se pinta encima de cualquier pantalla;
  - teclado: Esc, foco atrapado y Enter;
  - marcador en páginas, temas y apuntes;
  - import de `routes` y `learnList` con pregunta en la vista previa;
  - exportación v5;
  - `APP_VERSION` 7.1.0.
- **`study.js`**:
  - filas de librería con marcador y modo "Select";
  - marcador en la ficha y en la tarjeta de corrección;
  - sesiones de ruta (`routeId`/`routeMode` en cada intento);
  - "My routes" en Study y rutas fijadas en Home.
- **`practice.js`**: cierre del test de ruta (`kind:'route'`, desglose por tipo), títulos de las sesiones de ruta y resumen con comparación, "Retry my mistakes" y "Practise these".
- **`engine.js`**: los 4 usos de `learnList` pasan a "está en alguna ruta". Afecta a la prioridad de nuevas, a *Learn new*, a la librería más floja y al alcance "In my routes" del test de librería.
- **`stats.js`**: marcador en la vista de ítem (vocabulario y gramática) y "Save the topic"; el cuaderno de errores no duplica los tests de ruta, porque sus fallos ya están en los intentos.
- **Resto**: estilos en `index.html`, `routes.js` en `sw.js` (`VERSION` lexi-7.1.0), documentación en `README.md` y `docs/lexi-prompt-formatos.md`, y tests en `tests/run.js`.

## 3. Auditoría final (requisito por requisito)

Leyenda: ✅ hecho · 🟡 hecho con matiz · ⏭️ pasa a la 7.2 (acordado con el usuario antes de empezar).

| Requisito del prompt | Estado | Dónde | Cómo se comprueba |
|---|---|---|---|
| 2. Modelo `S.routes` (`id`, `name`, `icon`, `items[{ref, addedAt}]`, `pinned`, `source`, fechas) | ✅ | `routes.js` `makeRoute` | tests "routes 1–8" |
| 2. `ref` admite todos los uids y `grammar:`, `page:`, `note:` | ✅ | `refKind`, `refUnits`, `refExists` | routes 2, 5 y "Add more" |
| 2. Un elemento en varias rutas | ✅ | `routesWith` | routes 3 |
| 2. Progreso por unidad; quitar o borrar no lo toca | ✅ | las rutas solo guardan referencias | routes 6 (compara `S.units` antes y después) |
| 2. Migración de la `learnList` a "My learning list", en el mismo orden | ✅ | `app.js` `migrateRoutes` (estado v3 → v4) | routes 7 y "migration" |
| 2.1 Bloques | ⏭️ | – | – |
| 3. Save en fichas de unidad, ítems de vocabulario y gramática, temas, guías y apuntes | ✅ | `backBar(…, saveBtn())` | routes 1 y recorrido |
| 3. Save en cada fila de las librerías | ✅ | `unitRow(u, { save:true })` | recorrido |
| 3. Save en la tarjeta de corrección | ✅ | `exerciseHTML` (veredicto) | recorrido (sesiones) |
| 3. Save en cada fallo del resultado del test | ✅ | `quizSummaryHTML` y `renderResult` | recorrido |
| 3. Icono vacío / relleno / número | ✅ | `saveBtn` | routes 1 |
| 3. Hoja con casillas, última ruta arriba, "+ New route" con emoji, Done y toast con Undo | ✅ | `sheetHTML`, `closeSheet` | routes 1 y 3 |
| 3. Selección múltiple → "Save selected to…" | ✅ | modo "Select" de la librería | routes 4 |
| 4.1 My routes: tarjetas con tipos y progreso, "+ New route", fijadas primero | ✅ | `renderRoutes` | recorrido |
| 4.2 Detalle agrupado por tipo, etapa por unidad, teoría leída/sin leer | ✅ | `renderRoute` | routes 2 |
| 4.2 Learn / Practise (con preguntas de gramática) / Flashcards / Test / Read theory / Stats | ✅ | `routeGo` | routes 5 y "Add more / read" |
| 4.2 Editar: renombrar, emoji, reordenar, quitar, fijar, duplicar, borrar con confirmación | 🟡 | `routeEditHTML` | routes 6 (reordenar solo con subir/bajar, como se acordó) |
| 4.2 "Add more": buscador global EN/ES con selección múltiple | ✅ | `addCandidates` (sin tildes) | "aplazar" → *put off* |
| 4.3 Home: rutas fijadas con Practise directo | ✅ | `homeRoutesHTML` | recorrido |
| 5.1 Test: longitud 10/20/30/Full, alcance (todo, un tipo, fallos del último, bajo Known), modo (incl. Production), cronómetro | ✅ | `renderRouteTest`, `buildRouteTest` | routes 9 |
| 5.1 Sin repeticiones en Full; cobertura en el resto | ✅ | `routeAsked` | routes 9 y 10 |
| 5.1 Gramática en su formato original | ✅ | `genFor(u, { only:['gq'] })` | routes 5 |
| 5.2 Desglose por tipo, skill y formato | ✅ | `typeBreakdown` + `breakdownOf` | routes 9 |
| 5.2 Comparación con el test anterior y unidades mejor/peor | ✅ | `routeCompare` | routes 11 |
| 5.2 Fallos con enlace; Retry my mistakes / Learn these / Practise these | ✅ | `quizSummaryHTML` | routes 9 |
| 5.2 El test actualiza el aprendizaje | ✅ | igual que el resto de tests | – |
| 5.3 Historial con gráfico SVG, tabla ordenable, resumen y puntos débiles | ✅ | `renderRouteStats` | routes 11 |
| 5.3 Toda la actividad de ruta lleva `routeId` | ✅ | `check()` → `rid`/`rm` | routes 5 y 12 |
| 6. "Prioritise my routes", meta "use", "Only learn new … from my routes", "recognise only" | ⏭️ | – | Lo guardado en rutas ya va primero entre las nuevas, como hacía la `learnList` |
| 7. `routes` en packs: validación con motivos, pendientes, `source:'pack'`, editables | ✅ | `analyzePackRoutes` | routes 8 |
| 7. Reimportar: preguntar si se cambió | ✅ | vista previa "Update / Keep mine" | routes 8 |
| 7. `learnList` de los packs → "My learning list" | ✅ | `applyImport` | "packs" |
| 7. Exportación v5: `routes`, `routeTests` con todos los fallos, `routeId`/`routeMode` en `attempts`, `summary.routes`; parcial sin repetir y completa con todo | ✅ | `routesExport`, `routeTestsExport`, `routesSummary` | routes 12 |
| 8. Pruebas 1–12 y 15 | ✅ | `tests/run.js` | 13 tests nuevos y recorrido ampliado |
| 8. Pruebas 13–14 (bloques y "solo nuevas de mis rutas") | ⏭️ | – | – |
| 1. `APP_VERSION`/`VERSION` 7.1.0, tests en verde, 44 px, móvil primero | ✅ | – | 51/51 |

### Desviaciones e interpretaciones

- **Reordenar** se hace con botones de subir y bajar, sin arrastrar. Se acordó así por fiabilidad en móvil y por accesibilidad.
- **Hoja inferior.** El Undo deshace todo lo hecho desde que se abrió la hoja, también una ruta creada en ella. Al cerrarse, el foco vuelve al marcador.
- **Practise de ruta.** Es la única práctica que ignora el enfriamiento de 4 horas, porque el alumno la pide explícitamente. Si la ruta es corta, sus unidades se repiten en otros formatos hasta llenar la sesión. Las unidades nuevas cuentan para el límite diario de nuevas.
- **Learn y Flashcards de ruta** usan las librerías de estudio y el vocabulario. Las preguntas de gramática solo entran en Practise y en Test.
- **"Leído"** solo existe para temas y páginas. Los apuntes propios no tienen estado de lectura.
- **"Veces preguntada"** en Stats es el total de ejercicios de esa unidad en toda la app, no solo dentro de la ruta. El progreso es por unidad.
- **Exportación.** Los tests de ruta salen en `routeTests` y ya no en `tests`, para no duplicarlos. `summary.tests` los sigue resumiendo.
- **Estado y datos antiguos.** El estado pasa a la versión 4. `S.learnList` se conserva sin tocar, igual que `S.srs` en la 7.0, pero ya no se actualiza.

### Revisión del código

- Revisé el diff completo, unas 480 líneas añadidas y 90 cambiadas en 10 archivos, más `routes.js`. No hay cambios de saltos de línea ni de archivos enteros.
- Ningún atributo `data-*` nuevo choca con los existentes.
- Encontré y corregí dos fallos:
  - El alcance "Un tipo" del test preguntaba toda la ruta hasta elegir un tipo. Ahora se elige el primero automáticamente.
  - El foco no volvía al marcador al cerrar la hoja.
- **Rendimiento:** `routedUids()` va con caché por contenido, para no recalcularse en cada fila de la librería. Una sesión de 40 sigue tardando de media 3–5 ms.

### Regresión

- `node tests/run.js` → **51/51**, estable en 4 ejecuciones seguidas.
- Los 38 tests anteriores siguen pasando. Cinco se han adaptado porque comprobaban el comportamiento de la 7.0: estado v3, export v4, botón "Add to my learning list" y `S.learnList`.
- El recorrido de pantallas (vacío y estado v6, en EN y ES) tiene ahora 20 pasos más con todas las pantallas de rutas. No aparece `undefined` ni `NaN`, y no hay español en modo EN.
- **Navegador real** (Chrome, servidor local): ficha → Save → crear ruta con Enter → Esc → toast con Undo → marcador relleno; pantalla de la ruta; Home con la ruta fijada. Sin errores en la consola.

## 4. Limitaciones conocidas

- **No se ha probado con un backup real del alumno**, solo con los estados de prueba (v6 y v3 con `learnList`). Antes de abrir la 7.1: Data → Download backup.
- **Sin probar en un móvil real:** la hoja inferior se ha visto en Chrome de escritorio, no en un móvil.
- **Packs:** las rutas sin tocar se actualizan sin preguntar. Si el alumno solo las ha estudiado, sin cambiarlas, cuentan como "no tocadas".
- **Una ruta borrada a mitad de sesión** termina la sesión con normalidad, pero sin el botón "Volver a la ruta".

## 5. Para la 7.2 (pendiente, acordado)

1. **Bloques** (`blocks`, `unlock: stage|manual|open`, "Split into blocks", división automática en bloques de N), alcance "bloque actual" en Learn, Practise y Test, y `routes[].blocks` en los packs (`pv-core-25` en 5 bloques).
2. **Ajustes de lógica:**
   - "Prioritise my routes in daily practice";
   - meta "use": para pasar de la etapa 4 a la 5, acierto de producción desde el último cambio de etapa;
   - "Only learn new [librería] from my routes", activado por defecto en phrasal verbs si alguna ruta los tiene;
   - "Units not saved in any route: recognise only", con el mínimo de producción calculado solo sobre las unidades de rutas.
3. **Pruebas 13 y 14 del prompt.**

## 6. Publicar

- `node tests/run.js` debe dar 51/51.
- Commit y push a `main`: GitHub Actions la publica. Si se sube a mano, hay que incluir el archivo nuevo `routes.js`, porque sin él la app no arranca.
