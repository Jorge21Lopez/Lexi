# Prompt para Claude Code: Lexi v7, nuevo motor de ejercicios, estudio y repaso

> Copia todo lo que hay debajo de la línea y pégalo en Claude Code, abierto en la carpeta del repositorio de Lexi.

---

Eres el desarrollador de **Lexi**, una PWA offline en JavaScript vanilla (sin frameworks ni build) para preparar el Cambridge B1 Preliminary y el B2 First. El usuario es hispanohablante, de nivel B1, y quiere usar la app para **aprender cosas nuevas e interiorizarlas**, no solo para repasar.

Esta versión (**7.0.0**) rediseña el sistema de ejercicios: cómo se genera cada ejercicio, qué tipos existen, cómo se eligen para el repaso diario y para los tests, y cómo se estudia el contenido antes de practicarlo.

## 0. Antes de tocar nada

1. Lee todo el código y la documentación: `index.html`, `app.js`, `sw.js`, los archivos de contenido (`content.js`, `grammar.js`, `guides.js`, `exams.js`, `phrasal.js`, `writing.js`, `content_en.js` y los que se hayan añadido), `README.md` y, si existen, `lexi-prompt-formatos.md`, `lexi-mejoras-logica-ejercicios.md` y `prompt-claude-code-lexi-v6.md`.
2. Dame un **informe de auditoría** breve:
   - Qué versión hay y qué partes de los documentos de mejoras anteriores ya están implementadas.
   - Cómo se generan hoy los ejercicios de cada tipo de contenido (vocabulario, phrasal verbs, irregulares, gramática, conectores, Use of English) y cuántos formatos distintos existen realmente.
   - Por qué se repiten los phrasal verbs en tests y sesiones (con datos: simula 10 tests de phrasal verbs y cuenta cuántos verbos distintos salen de los ~90).
3. Propón un plan por fases y **espera mi OK** antes de implementar.

## 1. El problema, con las palabras del usuario

- Hay más de 90 phrasal verbs, pero en tests y sesiones **se repiten siempre los mismos**.
- **No hay forma de estudiar cada uno tal cual**: ver su ficha, sus ejemplos, sus confusiones, practicar solo ese.
- Los ejercicios son **siempre iguales**: poner el verbo en el tiempo correcto o elegir el significado. El usuario quiere ejercicios donde lo que importe sea **saber qué significa y cómo se usa**, no la conjugación.
- Sospecha que **lo mismo pasa en el resto de la app**, y es así.
- Las sesiones diarias le parecen **pocas y poco variadas**. Quiere que incluyan más **conectores, Use of English, verbos irregulares y phrasal verbs**.

## 2. Restricciones (no negociables)

- JavaScript vanilla, sin dependencias nuevas ni paso de build. Debe seguir funcionando offline.
- **Compatibilidad de datos:** misma clave de `localStorage` (`lexi:v1`). El progreso, el historial (`attempts`, `srs`, `tests`), los writings, los apuntes y los packs instalados de versiones anteriores se conservan. Escribe una **migración explícita** en `load()` (con `S.v` como número de esquema) y pruébala con un estado real de la versión anterior.
- **Formato de packs retrocompatible:** los packs actuales (`items`, `tasks`, `papers`, `grammar`, `pages`, `phrasal`) siguen cargando igual. Todo campo o colección nueva es opcional.
- **Bilingüe:** textos de interfaz con `T(en, es)`; contenido con campos `_en` y `L()`. Inglés por defecto.
- Mantén el estilo visual actual (tokens CSS, claro/oscuro, móvil primero, objetivos táctiles de 44 px).
- Sube `VERSION` en `sw.js` y `APP_VERSION`, y añade al `SHELL` cualquier archivo nuevo.
- **Rendimiento:** generar una sesión de 40 ejercicios debe tardar menos de 100 ms en un móvil medio. Nada de recalcular todo en cada `render()`.

## 3. Idea central: unidades de aprendizaje + generadores de ejercicios

Hoy cada ejercicio es un objeto fijo (`items`) con un único formato. Pasa a este modelo:

### 3.1 Unidad de aprendizaje (`unit`)
Lo que el usuario aprende: un phrasal verb, un conector, un verbo irregular, una collocation, una familia de palabras, una palabra de vocabulario o un punto de gramática. Cada unidad tiene:
- `uid` estable: `pv:give up`, `cn:however`, `irr:swim`, `col:make a decision`, `wf:employ`, `voc:<itemId>`, `gr:<topicId>:<n>`.
- Sus datos (significado EN/ES, ejemplos, confusiones…).
- **Un único estado de aprendizaje** (sección 6), compartido por todos los ejercicios que se generen de ella.

### 3.2 Generadores
Funciones puras `(unit, context) → exercise | null` que crean un ejercicio de un **formato** concreto a partir de una unidad. `context` da acceso al resto de unidades (para distractores), al idioma, a la semilla aleatoria y al historial reciente.

Cada ejercicio generado lleva: `uid`, `format`, `skill` (`recognise` | `understand` | `use` | `produce`), datos de presentación, respuesta(s) válida(s), explicación EN/ES y un `exerciseKey` estable (uid + formato + variante) para el historial.

### 3.3 Los `items` actuales
- Cada ítem existente se convierte en una unidad `voc:<id>` y conserva su formato original como un generador más.
- Además, si es posible, se derivan formatos nuevos (sección 4.7).
- Su historial `srs[id]` se migra al estado de la unidad.
- Los ejercicios auto-generados de phrasal verbs (`ph-…`) se migran a `pv:<verbo>`.

### 3.4 Tipos de contenido y librerías
Ya existen como datos estructurados la biblioteca de phrasal verbs (`LEXI_PHRASAL`) y los irregulares (`LEXI_IRREGULAR`). **Crea las que faltan** como archivos de datos nuevos, con contenido base suficiente (en inglés británico, nivel B1–B2, explicaciones EN/ES):

| Librería | Archivo | Mínimo de entradas | Campos |
|---|---|---|---|
| Conectores | `connectors.js` | 45 | `w`, `fn` (add, contrast, reason, result, purpose, example, sequence, opinion, conclusion, condition, time), `level`, `register` (neutral/formal/informal), `pattern` (`+clause`, `+noun/-ing`, `sentence-initial + comma`, `between clauses`), `es`, `en`, `ex` (2+ ejemplos con el conector entre `*asteriscos*`), `wrong` (error típico con su corrección), `confuseWith` |
| Collocations | `collocations.js` | 80 | `c` (la collocation), `verb`, `noun`, `es`, `en`, `ex`, `wrongVerb` (el verbo que usaría un hispanohablante), `theme` |
| Familias de palabras | `families.js` | 40 | `base`, `forms` (`{noun, verb, adj, adv, negAdj, person…}`), `ex` (una frase por forma) |
| Transformaciones | `transformations.js` | 40 | `from`, `key`, `to` (con `___`), `answers`, `structure` (etiqueta: passive, reported, wish, conditional…), `exp`, `exp_en` |

Amplía además los datos existentes:
- **Phrasal verbs:** campos opcionales `syn` (verbo de una palabra equivalente: *postpone* para *put off*), `register`, `confuseWith` (lista de `v`), `wrong` (error típico, por ejemplo *come across ~~with~~*), `particleMeaning` (por ejemplo *up = completamente*). Rellénalos para **todos** los phrasal verbs base.
- **Irregulares:** `ex` (una frase en pasado y otra con participio), `group` (patrón: `i-a-u` como sing/sang/sung, `same-3` como cut/cut/cut, `-ought`…).

## 4. Catálogo de formatos (lo más importante)

Implementa **todos** estos formatos. El objetivo es que el usuario practique cada unidad desde muchos ángulos. Si un formato no aplica a una unidad o no se pueden generar distractores válidos, el generador devuelve `null` y se elige otro.

### 4.1 Formatos de significado (`understand`): el foco que pide el usuario
1. **Meaning in context:** frase con el término resaltado → elegir el significado (EN o ES según idioma).
2. **Reverse meaning:** definición → elegir el término.
3. **Synonym swap:** frase con un verbo o expresión "neutro" (*postpone*) → elegir o escribir el equivalente (*put off*). Usa `syn`.
4. **Same or different?:** dos frases, una con el término y otra parafraseada → ¿significan lo mismo? (Sí/No).
5. **Matching:** 5 términos con 5 significados, emparejar tocando. Es un ejercicio que cuenta para 5 unidades.
6. **Odd one out:** 4 frases y una usa el término con un significado distinto o incorrecto.
7. **Which situation?:** una situación descrita ("Your car stopped working on the motorway") → elegir el término que la describe (*break down*).
8. **Listen and choose meaning:** escuchar la frase (TTS) → elegir el significado.

### 4.2 Formatos de uso (`use`)
9. **Natural or not?:** ¿esta frase es correcta y natural? Incluye errores reales de hispanohablantes (`wrong`): *I came across with an old photo*, *discuss about*, *Despite it was raining*.
10. **Spot and fix:** frase con un error marcado o sin marcar → tocar la palabra incorrecta y luego elegir o escribir la corrección.
11. **Particle choice:** *I gave ___ smoking* → up / in / out / away. Distractores: partículas que forman otros phrasal verbs **reales** con ese verbo (give in, give away), para que haya que saber el significado.
12. **Verb choice:** *I ___ up smoking* → gave / took / put / made. Distractores: verbos que forman phrasal verbs reales con esa partícula.
13. **Collocation verb:** *___ a decision* → make / do / take / have. Usa `wrongVerb` como distractor.
14. **Connector by function:** frase con hueco → elegir el conector. Los distractores tienen la **misma función pero otro patrón** (although frente a despite) o **distinta función** (however frente a therefore), según el nivel de madurez.
15. **Join the sentences:** dos frases → unirlas con el conector dado, eligiendo la versión correcta entre 3–4 (puntuación y estructura): *Although it rained, we went out.* / ✗ *Despite it rained…* / ✗ *However it rained…*
16. **Word order / build the sentence:** palabras desordenadas como fichas → tocar en orden. Muy útil para separables (*turn it off*), adverbios de frecuencia y preguntas indirectas.
17. **Sentence completion with your own words** (`produce`, autoevaluado): "Complete: *If I hadn't…*". El usuario escribe y se autoevalúa comparando con un modelo, y la frase se guarda para la exportación (Claude la revisa).

### 4.3 Formatos de forma (`recognise` / `produce`)
18. **Gap with hint** (el actual) y **gap without hint**.
19. **Correct form in context:** el término en infinitivo entre paréntesis → escribirlo conjugado. Se mantiene, pero es **un formato más**, no el principal.
20. **Translate the chunk:** frase en español → escribir solo el chunk en inglés (*dejar de fumar* → *give up smoking*), con respuestas alternativas.
21. **Dictation** de una frase de ejemplo.

### 4.4 Verbos irregulares
22. **Three forms:** escribir pasado y participio (el actual).
23. **Form in context:** frase → elegir o escribir la forma correcta (*Have you ever ___ (swim) in a lake?*).
24. **Spot the wrong form:** *She has swam…* → corregir.
25. **Pattern groups:** "¿Cuál sigue el patrón sing–sang–sung?" (usa `group`).
26. **Listen and write:** escuchar las tres formas y escribirlas.

### 4.5 Use of English (generado desde las librerías)
27. **Word formation:** desde `families.js`, frase con la base en mayúsculas.
28. **Word family grid:** completar la tabla noun / verb / adj / adv de una familia.
29. **Open cloze mini-text:** 3–4 frases conectadas (con ejemplos de conectores, preposiciones y auxiliares) y 3–4 huecos de una palabra.
30. **Multiple-choice cloze:** hueco con 4 opciones de significado parecido (*lend/borrow/rent/owe*). Usa `confuseWith`.
31. **Key word transformation:** desde `transformations.js`. Corrección tolerante: compara la frase reconstruida completa, ignora mayúsculas, contracciones y espacios.

### 4.6 Gramática
32. Preguntas de los tests de `grammar`, en su formato.
33. **Error correction** y **natural or not?** generados a partir de las preguntas de opción múltiple: se inserta una opción incorrecta en la frase.

### 4.7 Derivación automática desde ítems existentes
- `mcq` → `gap` (respuesta = `answer`) y viceversa (distractores de la misma `cat` y `topic`, excluyendo cualquier respuesta válida).
- Cualquier ítem con `prompt` → dictado de la frase completa.
- `gap` de preposición → "natural or not?" insertando una preposición incorrecta frecuente.

### 4.8 Calidad de los distractores (obligatorio)
- **Nunca** un distractor que también sea correcto: comprueba contra `answers`, sinónimos conocidos (*turn on* / *switch on*) y una lista `alsoCorrect` opcional.
- Prioriza distractores **plausibles**: misma partícula, mismo verbo, misma función, misma familia o `confuseWith`. Si no hay suficientes, completa con otros del mismo tema.
- Distractores con la **misma forma gramatical** que la respuesta (mismo tiempo, misma persona).
- Escribe un **test de validación** que genere 5 ejercicios de cada formato por cada unidad y compruebe: respuesta correcta presente, sin duplicados, ningún distractor aceptado como correcto y explicaciones en EN y ES.

## 5. Modo estudio: aprender antes de practicar

### 5.1 Biblioteca navegable (para cada librería)
En *Study*: Phrasal verbs, Connectors, Collocations, Irregular verbs, Word families, Transformations.
- **Lista** con buscador, filtros (tema, función, nivel, estado de aprendizaje) y orden (A–Z, más fallados, menos vistos, nuevos).
- Cada fila muestra el **estado** (New / Learning / Familiar / Known / Mastered) con un indicador de color.
- **Ficha de unidad** al tocarla:
  - Significado EN y ES, registro, patrón gramatical.
  - Todos los ejemplos, con audio y el término resaltado.
  - Error típico ✗ → ✓.
  - "No confundir con…" (enlaza a las fichas de `confuseWith`).
  - En los phrasal verbs, el significado de la partícula.
  - **Tus datos:** veces vista, % de acierto por tipo de formato, próximo repaso y últimos intentos.
  - Botones: **"Practise this one"** (mini-sesión de 5 ejercicios en formatos distintos solo de esta unidad) y **"Add to my learning list"**.

### 5.2 Sesión "Learn new"
Para interiorizar unidades nuevas, siguiendo presentación → reconocimiento → uso:
1. El usuario elige el tema y el número (3 / 5 / 8) o deja que la app elija (prioriza no vistas del tema más débil o de su lista).
2. Para cada unidad: **tarjeta de presentación** (significado, 2 ejemplos con audio, error típico). El usuario pulsa "Got it".
3. Después de presentar todas, **práctica intercalada**: 3 ejercicios por unidad en formatos de dificultad creciente (significado → uso → producción), mezclados entre sí.
4. Al final: resumen y programación del primer repaso.

### 5.3 Flashcards
Para repaso rápido de cualquier librería: anverso (término o frase con hueco) → reverso (significado, ejemplo y audio). Autoevaluación con **Again / Hard / Good / Easy**, que alimenta el mismo estado de aprendizaje.

## 6. Estado de aprendizaje y algoritmo

### 6.1 Por unidad, no por ejercicio
```
state[uid] = {
  stage: 0..5,             // 0 New, 1 Learning, 2 Familiar, 3 Known, 4 Strong, 5 Mastered
  due, interval, ease,     // repetición espaciada (mantén el algoritmo actual o mejóralo)
  seen, correct, lapses,
  lastSeen, lastFormats: [...],   // últimos 5 formatos usados
  bySkill: { understand:{n,ok}, use:{n,ok}, recognise:{n,ok}, produce:{n,ok} },
  introduced: timestamp | null    // cuándo se presentó con tarjeta
}
```

### 6.2 Escalera de formatos según la etapa
| Etapa | Formatos preferidos |
|---|---|
| 0–1 | presentación, meaning in context, reverse meaning, matching, particle/verb choice con distractores fáciles |
| 2 | synonym swap, which situation, natural or not, connector by function, collocation verb |
| 3 | gap sin pista, spot and fix, join the sentences, word order, form in context |
| 4–5 | translate the chunk, dictation, key word transformation, sentence completion propia, open cloze |

- **Subir de etapa** requiere acertar en al menos 2 `skill` distintos, no solo repetir el mismo formato.
- Un fallo baja una etapa y programa el repaso pronto. La reintroducción en la sesión usa un formato **más fácil** con la explicación visible.
- Si una unidad acierta siempre en significado pero falla en producción, la app lo detecta (`bySkill`) y prioriza formatos de producción para esa unidad.

### 6.3 Selección sin repeticiones (soluciona el problema de los phrasal verbs)
- **Cobertura primero:** en tests y sesiones, entre unidades igual de prioritarias, gana la **menos vista** y la que hace **más tiempo** que no sale (`lastSeen`).
- **Enfriamiento:** una unidad acertada no vuelve a aparecer en las siguientes 4 horas, salvo que esté vencida o fallada. En los tests de una librería, no repetir unidades de los 2 últimos tests de esa librería mientras haya otras disponibles.
- **Formato:** no repetir el mismo formato para la misma unidad en sus 3 últimas apariciones.
- **Intercalado:** nunca dos ejercicios seguidos del mismo formato ni de la misma librería (salvo sesiones de una sola librería), y nunca dos seguidos de la misma unidad.
- **Semilla:** usa un generador aleatorio con semilla (por ejemplo mulberry32) para que el reto diario sea reproducible y los tests se puedan depurar.

## 7. Sesión diaria nueva ("Daily practice")

### 7.1 Tamaño y composición
- Tamaño configurable: **15 / 25 / 40** ejercicios (por defecto 25), más el botón **"Keep going"** al terminar: otra ronda de 10 sin salir.
- **Mezcla por áreas**, configurable en *Settings* con presets y ajuste fino:

| Preset | Vocabulario | Phrasal verbs | Collocations | Conectores | Irregulares | Use of English | Gramática |
|---|---|---|---|---|---|---|---|
| Balanced (por defecto) | 20% | 20% | 10% | 15% | 10% | 15% | 10% |
| Exam focus | 10% | 15% | 10% | 15% | 5% | 30% | 15% |
| Vocabulary boost | 30% | 30% | 20% | 10% | 10% | 0% | 0% |

- Dentro de cada área: primero las unidades **vencidas**, luego **nuevas** (presentadas con tarjeta antes del primer ejercicio, sección 5.2), y luego **refuerzo** de unidades en etapas 1–2.
- Al menos un **40% de ejercicios de `understand` y `use`** (significado y uso) y al menos un **25% de `produce`**.
- Al menos **6 formatos distintos** en una sesión de 25.

### 7.2 Nuevas unidades por día
- Sustituye "New words per day" por **"New items per day"** (5 / 10 / 15 / 20 / 30), repartido entre áreas según el preset.
- Botón **"Learn more today"**, que abre la sesión 5.2 aunque se haya llegado al límite (con aviso suave).

### 7.3 Indicadores en Home
- Progreso del día por área (mini barras).
- Unidades por etapa en cada librería ("Phrasal verbs: 23 Known · 41 Learning · 28 New").
- Aviso si a un área le quedan menos de 20 unidades nuevas.

## 8. Tests

- **Library test** (phrasal verbs, conectores, collocations, irregulares, word formation): el usuario elige longitud (10/20/30), alcance (todas / mi lista / las que estoy aprendiendo / las más falladas / un tema) y modo (**Meaning** solo formatos de significado, **Usage** solo de uso, **Mixed**). Cobertura y enfriamiento según 6.3.
- **Mixed test**, si ya existe por la v6: debe usar el nuevo motor y todos los formatos.
- **Resultado:** desglose por **formato y skill** ("Meaning 9/10 · Usage 5/10 · Production 3/5"), lista de fallos con enlace a la ficha de cada unidad y botón **"Learn these"**, que lanza una sesión 5.2 con las falladas.

## 9. Seguimiento y exportación

- En *Progress*:
  - Una tabla por librería con unidades por etapa.
  - % de acierto por **skill** y por **formato** (últimos 14 días).
  - Lista de unidades "atascadas" (≥3 fallos en la última semana) con enlace a su ficha.
- En la exportación, sin romper campos existentes (sube `version` del export):
  - En cada intento: `uid`, `format`, `skill`, `mode`, `hintShown`.
  - En el resumen: `units` (por librería: cuántas en cada etapa), `accuracyBySkill`, `accuracyByFormat`, `stuck` (uids atascados con sus fallos más recientes).
  - Las frases propias de "sentence completion" (formato 17), para que Claude las corrija.

## 10. Formato de packs (ampliación, todo opcional)

Documenta en `README.md` y en `lexi-prompt-formatos.md`:
- Nuevas colecciones en `pack`: `connectors`, `collocations`, `families`, `transformations` (mismos campos que las librerías base). Valídalas con motivos de error, como el resto.
- Campos nuevos en `phrasal`: `syn`, `register`, `confuseWith`, `wrong`, `particleMeaning`.
- Campos nuevos en `items`: `alsoCorrect`, `confuseWith`, `wrong` (frase incorrecta para formatos de error), `tags`.
- Un pack puede traer `learnList`: uids que se añaden a la lista "Mi lista de aprendizaje".

## 11. Pruebas (obligatorias antes de dar nada por terminado)

Escribe pruebas en Node (stub mínimo de `document` y `localStorage`) en una carpeta `tests/` y ejecútalas:
1. **Migración:** un estado de la versión anterior con packs cargados, historial y writings abre sin pérdidas, y el progreso de cada ítem aparece en su unidad.
2. **Generadores:** la validación de 4.8 para todos los formatos y todas las unidades base.
3. **Cobertura:** 10 tests seguidos de phrasal verbs de 10 preguntas muestran al menos 80 verbos distintos (con ~90 disponibles). Hoy son muy pocos: incluye el antes y el después en el informe.
4. **Variedad:** en 50 sesiones diarias simuladas de 25 ejercicios, cada sesión tiene al menos 6 formatos, todas las áreas del preset y ningún par consecutivo con el mismo formato o la misma unidad.
5. **Enfriamiento:** una unidad acertada no reaparece en las 4 horas siguientes salvo que esté vencida.
6. **Escalera:** una unidad no pasa de etapa 2 a 3 sin acertar en al menos 2 skills distintos.
7. **Rendimiento:** generar una sesión de 40 tarda menos de 100 ms.
8. **Bilingüe:** recorrer todas las pantallas nuevas en EN y ES. En modo EN no aparece texto en español salvo contenido sin `_en`.

## 12. Entregable final: informe para el usuario

Al terminar, crea el archivo **`CAMBIOS-v7.md`** en la raíz del repositorio con esta estructura exacta. El usuario se lo pasará a su tutor (otro Claude) para revisarlo y preparar contenido nuevo:

```markdown
# Lexi v7: informe de cambios

## 1. Resumen (5–8 líneas, en español)
## 2. Auditoría inicial (qué había y por qué se repetía)
## 3. Formatos implementados
| # | Formato | Skill | Librerías donde aplica | Notas |
## 4. Librerías nuevas o ampliadas (con número de entradas)
## 5. Algoritmo: etapas, escalera de formatos, cobertura, enfriamiento (cómo quedó realmente)
## 6. Sesión diaria y tests: composición final y ajustes disponibles
## 7. Cambios en el formato de packs (campos y ejemplo JSON mínimo de cada colección nueva)
## 8. Cambios en la exportación (campos nuevos con ejemplo)
## 9. Resultados de las pruebas (antes/después de cobertura y variedad, tiempos)
## 10. Limitaciones conocidas y lo que no se hizo
## 11. Sugerencias de contenido que haría falta añadir por packs
## 12. Instrucciones para publicar (archivos tocados, versión, pasos en GitHub)
```

Al final, dame también un resumen corto en el chat.
