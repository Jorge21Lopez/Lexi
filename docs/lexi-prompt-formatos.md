# Lexi: formatos de pack (guía para Claude)

Esta guía describe qué JSON entiende Lexi (versión 7) al importar un pack y cómo lo convierte en ejercicios. El README tiene el resumen; aquí está el detalle con ejemplos.

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
    "learnList": ["cn:nevertheless", "pv:look out"]
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

Lista de uids que se añaden a "Mi lista de aprendizaje": van primero en *Learn new* y se pueden testear aparte.

## 4. Formatos que la app genera

| Habilidad | Formatos |
|---|---|
| Significado (`understand`) | meaning, reverse, match, synonym, samediff, situation, listen |
| Uso (`use`) | natural, oddone, spotfix, particle, verbchoice, colverb, connfn, join, order, mccloze, ktchoice, formchoice, gq |
| Reconocimiento (`recognise`) | choose, wfchoice, group, flash |
| Producción (`produce`) | gap_hint, gap, form, wordform, three, translate, dictation, listenwrite, kwt, wfgrid, opencloze, complete |

Cuanto más completos vengan los datos (dos ejemplos, `wrong`, `syn`, `confuseWith`, `sit`), más formatos puede generar cada unidad.

## 5. Lo que llega en la exportación (v4)

Cada intento lleva `uid`, `format`, `skill`, `mode` y `hintShown`. El resumen trae `units` (etapas por librería), `accuracyBySkill`, `accuracyByFormat` y `stuck` (unidades con 3 o más fallos en la última semana). `productions` trae las frases propias del alumno para que las corrijas. Al preparar un pack, prioriza las unidades de `stuck` y los formatos con menos acierto.
