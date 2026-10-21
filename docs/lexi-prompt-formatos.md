# Lexi: formatos de pack (guía para Claude)

Esta guía describe qué JSON entiende Lexi (versión 7.1) al importar un pack y cómo lo convierte en ejercicios. El README tiene el resumen; aquí está el detalle con ejemplos.

## 1. Estructura general

```json
{
  "format": "lexi-pack",
  "pack": {
    "id": "pack-2026-10-20",
    "name": "Semana 4: conectores de contraste",
    "mode": "replace",
    "items": [], "tasks": [], "papers": [], "pages": [], "grammar": [], "phrasal": [],
    "connectors": [], "collocations": [], "families": [], "transformations": [],
    "learnList": ["cn:nevertheless", "pv:look out"],
    "routes": []
  },
  "feedback": [], "review": [], "retire": [], "convertedNotes": [], "message": "…"
}
```

Todo es opcional salvo `format`. Un pack con el mismo `id` sustituye al anterior (`replace`) o se fusiona (`merge`). Cada elemento se valida por separado: los que fallan no se cargan y la app muestra el motivo (por ejemplo `connectors[1] (bad one): "fn" must be one of…`).

### 1b. Bilingüe

La interfaz está en inglés por defecto. Cada texto explicativo lleva versión inglesa: `exp` / `exp_en`, `hint` / `hint_en`, `title` / `title_en`, `html` / `html_en`, `e` / `e_en` (gramática). En las librerías, el significado va en `es` (español) y `en` (definición sencilla en inglés). Los ejemplos y frases de ejercicio van siempre en inglés británico.

## 2. Unidades de aprendizaje

Desde la v7, Lexi no practica "ejercicios fijos", sino **unidades**: cada una tiene un estado (etapa 0–5, repaso espaciado, aciertos por habilidad) y la app genera para ella ejercicios de muchos formatos. Uids:

| Librería | uid | Viene de |
|---|---|---|
| Phrasal verbs | `pv:give up` | `phrasal[].v` |
| Conectores | `cn:however` | `connectors[].w` |
| Collocations | `col:make a decision` | `collocations[].c` |
| Irregulares | `irr:swim` | base de irregulares |
| Familias | `wf:employ` | `families[].base` |
| Transformaciones | `tr:kt01` | `transformations[].id` |
| Vocabulario | `voc:<id>` | `items[].id` (salvo `writing`) |
| Gramática | `gr:<tema>:<hash>` | preguntas de `grammar[].test` |

Etapas: 0 New, 1 Learning, 2 Familiar, 3 Known, 4 Strong, 5 Mastered. Para pasar de etapa 2 en adelante hay que acertar en dos habilidades distintas (significado, uso, producción…).

## 3. Colecciones nuevas

### `connectors`

```json
{ "w": "nevertheless", "fn": "contrast", "level": "B2", "register": "formal", "pattern": "sentence-initial + comma",
  "es": "no obstante", "en": "however (formal)",
  "ex": ["The test was very hard. *Nevertheless*, most students passed.", "It was a difficult year. *Nevertheless*, the company made a profit."],
  "wrong": "The test was hard. Nevertheless of that, most students passed. => The test was hard. Nevertheless, most students passed.",
  "confuseWith": ["however", "despite"], "alsoCorrect": ["nonetheless"],
  "join": "The test was very hard. Most students passed." }
```

- `fn`: add, contrast, reason, result, purpose, example, sequence, opinion, conclusion, condition, time.
- `pattern`: `+clause`, `+noun/-ing`, `+infinitive`, `sentence-initial + comma`, `sentence-initial`, `between clauses`, `mid-sentence`.
- Respuestas aceptadas: solo el conector y su `alsoCorrect`. Pon ahí los equivalentes reales en **todos** sus ejemplos (although: though, even though). "Same or different" solo usa esos como "iguales".
- Distractores: la app nunca ofrece como incorrecto un conector de la **misma función y el mismo patrón** (podría encajar), aunque no lo acepte. Usa `confuseWith` para los de misma función y distinto patrón (although/despite).
- `wrong`: frase incorrecta `=>` corregida. Lo ideal es que se diferencien en 1–3 palabras: así sirve también para "Spot and fix".
- `join`: las dos frases sueltas que une el **primer** ejemplo.

### `collocations`

```json
{ "c": "take a seat", "verb": "take", "noun": "a seat", "es": "sentarse", "en": "sit down",
  "ex": ["Please *take a seat*.", "She *took a seat* by the window."], "wrongVerb": "catch", "theme": "social", "alsoCorrect": ["have"], "avoid": ["get"] }
```

- En los ejemplos va entre asteriscos **toda** la collocation, con el verbo en la forma que toque.
- `wrongVerb`: el verbo que usaría un hispanohablante (do/make, take/have…). Es el distractor principal.
- `alsoCorrect`: otros verbos que también son correctos con ese nombre y el mismo sentido (take/have a break). Se aceptan como respuesta y nunca salen como distractor.
- `avoid`: verbos que con ese nombre forman otra expresión correcta con distinto sentido (catch/**miss** the bus, keep/**make** a promise). No se aceptan, pero tampoco salen como opción, para que no haya preguntas con dos respuestas posibles.
- `theme`: daily, study, work, social, health, money, travel, communication, freetime, feelings.

### `families`

```json
{ "base": "drive", "es": "conducir",
  "forms": { "verb": "drive", "person": "driver", "noun": "driving" },
  "ex": { "person": "The *driver* stopped at the lights.", "noun": "*Driving* in the city is stressful." } }
```

- Claves de `forms`: noun, noun2, verb, verb2, adj, adj2, adv, adv2, negAdj, person, person2. Una forma con variante se escribe `"organisation/organization"`.
- Un ejemplo por forma (salvo la base), con la palabra tal como aparece (plural, -ed…) entre asteriscos. Sirven para Word formation, Natural or not y Spot and fix.

### `transformations`

```json
{ "id": "px1", "structure": "present perfect", "from": "I started working here in May.", "key": "SINCE",
  "to": "I have worked here ___ May.", "answers": ["since"], "exp": "since + punto de partida.", "exp_en": "since + starting point." }
```

- `answers`: lista (o texto con `/`). La corrección es tolerante: compara la frase reconstruida completa e ignora mayúsculas, contracciones y espacios, así que vale que el alumno escriba también palabras de fuera del hueco.

### Campos nuevos en `phrasal`

```json
{ "v": "look out", "es": "tener cuidado", "en": "be careful", "theme": "problemas", "level": "B1", "sep": false,
  "ex": ["*Look out*! A car is coming.", "You should *look out* for pickpockets."],
  "syn": "be careful", "register": "informal", "confuseWith": ["look after", "watch out"],
  "wrong": "Look out the car! => Look out for the car!",
  "particleMeaning": "out = alerta", "particleMeaning_en": "out = alert",
  "sit": "You are crossing the road and you shout to warn your friend about a bike." }
```

- `syn` debe poder sustituir al phrasal verb en el **primer** ejemplo, conjugando solo su primera palabra (postpone → postponing). Se usa en Synonym swap y Same or different. Si solo es aproximado, escríbelo con `~` delante (`"~smile"`): se muestra como "parecido a" pero no se usa en esos ejercicios.
- `sit`: una situación que describa solo ese verbo (para "Which situation?").
- Cada ejemplo con **un solo** tramo entre asteriscos genera huecos y elección de partícula y verbo. Los separables partidos (`*wake* me *up*`) sirven para ordenar la frase.

### Campos nuevos en `items`

- `alsoCorrect`: otras respuestas válidas (se aceptan y nunca salen como distractor).
- `confuseWith`: palabras parecidas que la app usa como opciones (lend/borrow/rent/owe).
- `wrong`: una frase incorrecta para "Natural or not?" y "Spot and fix".
- `tags`: etiquetas libres para el cuaderno de errores y los tests enfocados.

### `learnList`

Lista de uids que se añaden a la ruta "My learning list" (se crea si no existe). Desde la 7.1 es una ruta más: lo que está en cualquier ruta va primero en *Learn new* y se puede testear aparte.

### `routes` (v7.1)

Rutas de estudio preparadas por ti. El alumno las ve en *Study → My routes* igual que las que crea él con el botón **Save**, y puede editarlas.

```json
"routes": [
  { "id": "pv-core-25", "name": "25 phrasal verbs activos", "name_en": "25 active phrasal verbs", "icon": "🎯",
    "items": ["pv:find out", "cn:in case", "col:make a decision", "grammar:g-future", "page:r-connectors", "voc:m01"] }
]
```

- `id` y `name` son obligatorios; `name_en` (se muestra en modo inglés) e `icon` (un emoji) son opcionales.
- `items` es la lista ordenada de referencias. Valen los uids de unidad (`pv:`, `cn:`, `col:`, `irr:`, `wf:`, `tr:`, `voc:`, `gr:`) y además `grammar:<id del tema>` (teoría + todas sus preguntas), `page:<id de página>` y `note:<id de apunte>`. También se acepta `{ "ref": "pv:find out" }`.
- Una referencia de tipo desconocido se descarta con su motivo (`routes[0] (pv-core-25): items[3] is not a valid reference…`). Una referencia válida que no existe (ni en la app ni en el mismo pack) no bloquea nada: se guarda y se muestra como **pendiente** hasta que llegue su contenido.
- Si el pack se vuelve a importar y la ruta no se ha tocado en el móvil, se actualiza sin preguntar (las fechas de alta de los elementos que ya estaban se conservan). Si el alumno la ha cambiado, la vista previa pregunta **Update / Keep mine** (por defecto, conservar la suya).
- Los bloques (`blocks`, `unlock`) llegarán en la 7.2: de momento se ignoran.

## 4. Formatos que la app genera

| Habilidad | Formatos |
|---|---|
| Significado (`understand`) | meaning, reverse, match, synonym, samediff, situation, listen |
| Uso (`use`) | natural, oddone, spotfix, particle, verbchoice, colverb, connfn, join, order, mccloze, ktchoice, formchoice, gq |
| Reconocimiento (`recognise`) | choose, wfchoice, group, flash |
| Producción (`produce`) | gap_hint, gap, form, wordform, three, translate, dictation, listenwrite, kwt, wfgrid, opencloze, complete |

Cuanto más completos vengan los datos (dos ejemplos, `wrong`, `syn`, `confuseWith`, `sit`), más formatos puede generar cada unidad.

## 5. Lo que llega en la exportación (v5)

Cada intento lleva `uid`, `format`, `skill`, `mode` y `hintShown`. El resumen trae `units` (etapas por librería), `accuracyBySkill`, `accuracyByFormat` y `stuck` (unidades con 3 o más fallos en la última semana). `productions` trae las frases propias del alumno para que las corrijas. Al preparar un pack, prioriza las unidades de `stuck` y los formatos con menos acierto.

### Rutas (v5, Lexi 7.1)

- `attempts[].routeId` y `attempts[].routeMode` (`learn`, `practise`, `flashcards`, `test`): solo cuando la actividad se hizo desde una ruta. `mode` vale entonces `learn`, `route` (Practise), `flash` o `routetest`.
- `routes`: en "Copy updates", solo las rutas creadas, cambiadas o estudiadas desde el último envío; en la copia completa, todas.

```json
"routes": [ { "id": "r_k3x9", "name": "Conectores para el writing", "source": "user", "pinned": true, "createdAt": "…", "updatedAt": "…",
  "items": [ { "ref": "cn:however", "addedAt": "…", "stage": 2, "asked": 5, "accuracy": 80, "lastResult": "ok" },
             { "ref": "grammar:g-linkers", "addedAt": "…", "questions": 9, "read": true },
             { "ref": "pv:no such verb", "addedAt": "…", "pending": true } ],
  "summary": { "knownPct": 40, "units": 15, "theoryRead": 1, "theoryTotal": 1, "minutes": 22, "sessions": 3, "tests": 2, "lastActivity": "…" } } ]
```

- `routeTests`: cada test de ruta del periodo, con **todos** sus fallos. Los tests de ruta ya no se repiten en `tests`.

```json
"routeTests": [ { "id": "t…", "routeId": "r_k3x9", "at": "…", "options": { "length": 10, "scope": "all", "mode": "mixed", "timer": false },
  "score": 7, "max": 10, "durationSec": 240, "byType": { "cn": { "n": 6, "ok": 4 }, "theory": { "n": 4, "ok": 3 } }, "bySkill": { … }, "byFormat": { … },
  "mistakes": [ { "question": "It was raining. ___, we went out.", "given": "despite", "correct": "However", "uid": "cn:however", "format": "connfn" } ] } ]
```

`options.length` es 10, 20, 30 o `"full"`; `scope` es `all`, `type:<pv|cn|col|irr|wf|tr|voc|theory>`, `lastfail`, `weak` o `retry` ("Retry my mistakes").
- `summary.routes`: por cada ruta con actividad en el periodo, `scores` (`at`, `pct` de cada test) y `weak` (las 5 unidades con peor acierto: `uid`, `term`, `accuracy`, `asked`).
- `summary.learnList`: las referencias de la ruta "My learning list".

Al preparar un pack, mira `routeTests[].mistakes` y `summary.routes[].weak`: son lo que el alumno ha elegido estudiar y aún falla.
