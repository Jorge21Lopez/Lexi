# Prompt para Claude Code: Lexi v6 (más práctica mezclada, retos y seguimiento)

> Copia todo lo que hay debajo de la línea y pégalo en Claude Code, abierto en la carpeta del repositorio de Lexi.

---

Eres el desarrollador de **Lexi**, una PWA offline en JavaScript vanilla (sin frameworks ni build) para preparar el Cambridge B1 Preliminary y el B2 First. Quiero la versión **6.0.0**.

## 0. Antes de tocar nada
1. Lee todo el código: `index.html`, `app.js`, `sw.js`, los archivos de contenido (`content.js`, `grammar.js`, `guides.js`, `exams.js`, `phrasal.js`, `writing.js`, `content_en.js`), el `README.md` y, si existen, `lexi-prompt-formatos.md` y `lexi-mejoras-logica-ejercicios.md`.
2. Hazme un resumen breve de lo que ya hace la v5: qué partes del documento de mejoras ya están implementadas y cuáles no. No dupliques lo que ya exista.
3. Propón un plan por fases y espera mi OK antes de implementar.

## 1. Restricciones (no negociables)
- JavaScript vanilla, sin dependencias nuevas ni paso de build. Debe seguir funcionando offline.
- **Compatibilidad de datos:** misma clave de `localStorage` (`lexi:v1`). Los estados y packs de versiones anteriores deben cargarse sin pérdidas. Los campos nuevos del estado se añaden con valores por defecto en `defaultState()`/`load()`.
- **Formato de packs retrocompatible:** todo campo nuevo es opcional.
- **Bilingüe:** todo texto nuevo de interfaz con `T(en, es)`; el contenido con campos `_en` y `L()`. Inglés por defecto.
- Sube `VERSION` en `sw.js` y `APP_VERSION`. Añade al `SHELL` cualquier archivo nuevo.
- Mantén el estilo visual actual: tokens CSS, modo claro/oscuro y diseño móvil primero.
- Escribe pruebas en Node (stub mínimo de `document`/`localStorage`, como las existentes si las hay) que recorran todas las pantallas en los dos idiomas y los flujos nuevos. Ejecútalas antes de dar nada por terminado.

## 2. Problemas detectados con datos reales (corregir primero)
Datos de los primeros 2 días: 75 intentos, 77% de acierto, 32 ítems distintos.

1. **El repaso extra repite lo que acabas de hacer.** El usuario rehízo los mismos 12 ítems 30 minutos después. El repaso extra debe excluir los ítems respondidos correctamente en las últimas 3 horas. Si no queda nada, que ofrezca palabras nuevas o un test mixto.
2. **Tolerancia de respuestas en `translate`/`gap`:** se marcó como fallo *"the personal growth"* cuando lo válido era *"personal growth"*. Normaliza ignorando el artículo inicial (`the/a/an`) y el `to` de infinitivo, salvo que la respuesta esperada lo incluya.
3. **Transformaciones (key word transformations):** si el usuario escribe también palabras que están fuera del hueco (por ejemplo, el sujeto "I"), compara la frase reconstruida completa: texto antes + respuesta + texto después.
4. **Etiqueta de los huecos de preposición:** ahora salen como "Write the word" y el usuario no sabe que se pide una preposición. Admite la `cat` nueva `preposition` (etiqueta: "Preposition" / "Preposición") y muestra siempre la pista si `hintAlways`.
5. **Poca lectura de teoría** (2 páginas leídas). Ver la tarjeta "Lesson of the day" en 4.3.

## 3. Práctica mezclada y tests generales

### 3.1 Test mixto generado automáticamente ("Mixed test")
En *Tests*, una sección nueva, **Mixed practice**, que genera un test a partir de TODO el contenido instalado:
- Preguntas de los tests de `grammar` (todos los temas, base y packs).
- Ítems de vocabulario (`items`, excepto `writing`), en su formato o rotado si la v5 ya rota formatos.
- Phrasal verbs (formatos generados desde la biblioteca).
- Verbos irregulares.

**Opciones:**
- Longitud: 10 / 20 / 30.
- Nivel: B1 / B1+B2 / B2.
- Enfoque: equilibrado / mis puntos débiles.
- Con cronómetro o sin él.

**Composición "equilibrado":** ≈40% gramática, 35% vocabulario y collocations, 15% phrasal verbs, 10% irregulares.

**Composición "puntos débiles":** prioriza las categorías y temas con peor porcentaje en los últimos 14 días, los ítems con fallos y los temas de gramática por debajo del 70%.

**Al terminar:** resultado con desglose por categoría y por tema de gramática, y botón "Practise my mistakes" que lanza un test solo con lo fallado.

Las preguntas de vocabulario que aparezcan aquí actualizan también su repetición espaciada.

Los packs pueden traer además tests generales hechos a mano como `papers` con `section:"grammar"` (ya existen `gen-b1-1`, `gen-b1-2` y `reto-b2-1`). Agrúpalos en la misma sección **Mixed practice**, no en "Mock exams".

### 3.2 Gramática en las sesiones diarias
Ajuste en *Data → Settings*: **"Include grammar in daily sessions"**, activado por defecto.
- Las preguntas de los tests de gramática se convierten en ítems de repetición espaciada con id estable `gq:<topicId>:<index>`.
- Entran en la cola diaria como un 25% de los nuevos y siguen el mismo algoritmo.
- Solo de temas cuya teoría se ha leído, o de cualquiera si el usuario lo activa en el ajuste.

## 4. Variedad y retos

### 4.1 Retos (sección *Challenges* en Home y en Tests)
- **Daily challenge:** 10 preguntas iguales para todo el día (semilla = fecha), mezcla de B1+ y B2, más difícil que la sesión normal: sin pistas y solo producción (escribir). Una vez al día. Se guarda la racha de retos completados.
- **Speed round:** 90 segundos, tantas preguntas de elección como puedas. Récord personal.
- **Sudden death:** preguntas mixtas hasta el primer fallo. Récord personal.
- **No hints:** sesión de vocabulario en la que todo es escribir, sin pistas ni opciones.
- **B2 only:** test mixto solo con contenido B2.
- **Mistakes review:** solo ítems y preguntas falladas en los últimos 14 días.

Cada reto guarda un historial (fecha, puntuación, duración) y un récord personal visibles en *Progress*.

### 4.2 Variedad en la sesión diaria
Si la v5 no lo tiene ya:
- Rotación de formato por madurez del ítem (elegir → escribir con pista → escribir → traducir o dictado).
- Nunca dos ítems seguidos de la misma `cat`.
- Al menos un 40% de producción.

### 4.3 "Lesson of the day"
Tarjeta en Home con el tema de gramática más flojo, o uno no leído. Lleva a la teoría y, al terminar de leer, ofrece su test.

## 5. Seguimiento (Progress)
- **Calendario de actividad** de las últimas 8 semanas (heatmap) con minutos por día. Mide el tiempo activo de las sesiones.
- **Evolución semanal** del % de acierto por categoría (vocab, collocation, phrasal, preposition, wordform, grammar…). Gráfico de líneas en SVG generado a mano, sin librerías.
- **Acierto por formato:** elección, escribir, traducir, dictado. Así se ve si falla reconocer o producir.
- **Puntos débiles:** top 5 (categoría, tema o tema de gramática) con un botón "Practise now" que lanza un test mixto enfocado.
- **Cuaderno de errores:** lista de todo lo fallado (pregunta, mi respuesta, la correcta, fecha y veces fallado). Filtrable por categoría y exportable.
- **Ficha de ítem:** al tocar un ítem en cualquier lista, su historial de intentos, el próximo repaso y la explicación.
- **Récords** de retos y evolución de los simulacros (puntuación por fecha).
- **Banco:** ítems vistos / total, nuevos disponibles y aviso si quedan menos de 30.

## 6. Exportación (para el análisis de Claude)
Añade sin romper lo existente:
- En cada intento: `format`, `mode` (daily / extra / mixed / challenge / focused) y `hintShown`.
- `summary.minutesPerDay`, `summary.accuracyByFormat`, `summary.challenges` (récords e historial del periodo) y `summary.leeches` (ítems con ≥4 fallos).
- En los tests mixtos: `breakdown` por categoría y tema.
- Sube `version` del export a 3 y documenta el formato en `README.md`.

## 7. Formato de packs (opcional, documentar)
- `items[].cat` admite `preposition`.
- `items[].tags`: lista libre (por ejemplo, `["been-gone","time-prepositions"]`), para que el test mixto enfocado y el cuaderno de errores agrupen por etiqueta.
- `papers[].section: "grammar"`: se muestran en *Mixed practice*.
- `grammar[].test[].level`: B1/B2, para filtrar por nivel en el test mixto.

Actualiza `lexi-prompt-formatos.md` (o la sección de formatos del README) con estos campos.

## 8. Criterios de aceptación
- [ ] Un test mixto de 20 preguntas incluye al menos 3 tipos de contenido y su resultado muestra el desglose.
- [ ] El repaso extra no muestra ítems acertados en las últimas 3 horas.
- [ ] "the personal growth" cuenta como correcto si se espera "personal growth"; "to agree" igual que "agree".
- [ ] El reto diario da las mismas 10 preguntas durante todo el día y distintas al día siguiente.
- [ ] Speed round y Sudden death guardan récord personal.
- [ ] Progress muestra el heatmap, la evolución semanal, el acierto por formato, los puntos débiles con botón, el cuaderno de errores y la ficha de ítem.
- [ ] Un estado guardado de la v5 (con packs cargados) se abre en la v6 sin perder nada.
- [ ] Las pruebas pasan en inglés y en español, sin texto en español visible en modo inglés salvo contenido de packs sin `_en`.
- [ ] `VERSION` y `APP_VERSION` actualizados; la app se actualiza sola al publicar.

Cuando termines, dame un resumen de los cambios, los archivos tocados y las instrucciones para subirlo a GitHub Pages.
