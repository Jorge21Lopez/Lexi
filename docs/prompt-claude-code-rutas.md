 # Prompt para Claude Code: "Save to route" (rutas propias tipo playlist)

> Copia todo lo que hay debajo de la línea y pégalo en Claude Code, abierto en la carpeta del repositorio de Lexi (v7).

---

Quiero que el alumno pueda **crearse sus propias rutas de estudio desde la app, sin JSON**. Funciona como guardar canciones en una playlist o pines en un tablero:

1. Abre la ficha de cualquier cosa: un conector (*however*), un phrasal verb (*give up*), una collocation, un irregular, una familia, una transformación, una palabra de vocabulario, un tema de gramática, una guía o un apunte.
2. Pulsa **Save** (icono de marcador).
3. Se abre una hoja inferior con sus rutas. Marca una o varias, o crea una nueva escribiendo el nombre ahí mismo.
4. Listo. Luego abre la ruta y la estudia: aprender, practicar, flashcards, test y leer la teoría guardada.

## 0. Antes de tocar nada
Lee el código actual (`engine.js`, `study.js`, `app.js`, `practice.js`, `stats.js`), `docs/lexi-prompt-formatos.md` y `docs/CAMBIOS-v7.md`. Dime qué existe ya de la `learnList` y de las fichas, y propón un plan breve. Espera mi OK.

## 1. Restricciones
Las mismas de siempre:
- JavaScript vanilla y offline.
- Migración sin pérdidas con la clave `lexi:v1`.
- Packs retrocompatibles (todo lo nuevo es opcional).
- Bilingüe con `T()`/`L()`, inglés por defecto.
- Subir `APP_VERSION` y `VERSION` (7.1.0).
- Tests en `tests/` en verde.
- Objetivos táctiles de 44 px y diseño móvil primero.

## 2. Modelo de datos

```js
S.routes = [{
  id: 'r_k3x9',               // generado
  name: 'Conectores para el writing',
  icon: '✍️',                 // opcional, elegido de una lista corta de emojis
  items: [                    // en el orden en que se guardaron (reordenable)
    { ref: 'cn:however',        addedAt: 1729411200000 },
    { ref: 'pv:give up',        addedAt: … },
    { ref: 'grammar:g-linkers', addedAt: … },   // tema de gramática (teoría + su test)
    { ref: 'page:r-connectors', addedAt: … },   // guía, plantilla o apunte convertido
    { ref: 'note:n1a2b',        addedAt: … }    // apunte propio
  ],
  pinned: false, source: 'user', createdAt, updatedAt
}]
```

- `ref` admite **todos** los uids de unidades (`pv:`, `cn:`, `col:`, `irr:`, `wf:`, `tr:`, `voc:`, `gr:`) y las referencias `grammar:`, `page:` y `note:`.
- Un mismo elemento puede estar en varias rutas.
- El progreso es **por unidad**, no por ruta: quitar un elemento o borrar una ruta nunca borra progreso.
- **Migración:** si la `learnList` tiene elementos, crea una ruta "My learning list" con ellos, en el mismo orden. "Add to my learning list" pasa a ser este mismo sistema.

### 2.1 Bloques (opcional)
Una ruta puede dividirse en **bloques** para estudiarla por etapas (por ejemplo, 5 bloques de 5 phrasal verbs, uno por semana):
```js
blocks: [ { title: 'Semana 1: planes', refs: ['pv:find out', 'pv:end up', …] }, … ],
unlock: 'stage' | 'manual' | 'open', unlockStage: 3
```
- Sin `blocks`, la ruta es una lista simple: es el caso por defecto al crearla desde "Save".
- En el detalle de la ruta, **"Split into blocks"**: el alumno crea bloques y mueve elementos entre ellos (o elige "dividir automáticamente en bloques de N").
- `unlock: 'stage'`: el bloque siguiente se abre cuando todas las unidades del actual llegan a `unlockStage` (por defecto 3, Known) y su teoría está leída. `manual`: el alumno avanza cuando quiere. `open`: todo abierto.
- Con bloques, **Learn / Practise / Test** se aplican por defecto al **bloque actual**, con la opción "whole route". El test de ruta añade "Alcance: bloque actual".
- Al guardar desde la hoja "Save" en una ruta con bloques, el elemento va al último bloque (o al que elija el alumno en un selector secundario).
- En packs, `routes[].blocks` con el mismo formato. La ruta de los 25 phrasal verbs (`pv-core-25`) debe poder venir así.

## 3. El botón "Save" y la hoja de rutas (lo principal)

- **Dónde aparece:**
  - En la cabecera de **todas** las fichas de unidad.
  - En la página de cada tema de gramática, guía y apunte.
  - Como icono pequeño en cada fila de las listas de las librerías.
  - En la tarjeta de corrección tras responder un ejercicio ("Save" junto a la explicación).
  - En cada fallo del resultado de un test.
- **Estado del icono:** vacío si no está en ninguna ruta; relleno si está en alguna, y el número si está en varias.
- **Al pulsarlo se abre una hoja inferior (bottom sheet):**
  - Título: "Save *however* to…".
  - Lista de rutas con **casilla** (marcada si ya está dentro). Marcar o desmarcar guarda al momento.
  - Arriba, la última ruta usada.
  - Al final, **"+ New route"**: campo de nombre en línea, emoji opcional y "Create and save". Crea la ruta y guarda el elemento en un solo paso.
  - Botón "Done". Toast "Saved to Conectores para el writing" con **Undo**.
- **Guardar varios a la vez:** en las listas de las librerías, modo selección múltiple → "Save selected to…", con la misma hoja.

## 4. Pantalla de rutas

### 4.1 Study → My routes (y acceso desde Home)
- Tarjetas de ruta: icono, nombre, número de elementos por tipo ("8 connectors · 5 phrasal verbs · 1 grammar topic") y progreso (cuántas unidades en Known o más).
- **"+ New route"**. Las rutas fijadas aparecen primero.

### 4.2 Detalle de una ruta
- **Agrupado por tipo**, con secciones plegables: Phrasal verbs, Connectors, Collocations, Irregular verbs, Word families, Transformations, Vocabulary, Grammar & theory.
- Cada unidad muestra su etapa (New → Mastered) y abre su ficha.
- La teoría muestra "leído / sin leer".
- **Acciones de la ruta**, que actúan solo sobre sus elementos:
  - **Learn:** *Learn new* con las unidades aún no vistas.
  - **Practise:** sesión mezclada de 10/20/30 con todos los formatos. Incluye las preguntas de los temas de gramática guardados.
  - **Flashcards.**
  - **Test:** test propio de la ruta (sección 5).
  - **Read theory:** abre en orden los temas y páginas sin leer.
  - **Stats:** seguimiento de la ruta (sección 5.3).
- **Editar:**
  - Renombrar y cambiar el emoji.
  - Reordenar (arrastrar o subir/bajar).
  - Quitar elementos (deslizar o botón).
  - Fijar en Home, duplicar y borrar (con confirmación; no borra progreso).
  - **"Add more"**: abre un buscador global de todas las librerías, temas y páginas, en inglés y español (buscar "aplazar" encuentra *put off*), con selección múltiple.

### 4.3 Home
Las rutas fijadas aparecen como tarjetas con su progreso y un botón **Practise** directo.

## 5. Tests de ruta y seguimiento

### 5.1 Crear un test de ruta
Al pulsar **Test** en una ruta, se abre una pantalla de opciones:
- **Longitud:** 10 / 20 / 30 / **Full** (todas las unidades de la ruta al menos una vez, más las preguntas de sus temas de gramática).
- **Alcance:** toda la ruta / solo un tipo (phrasal verbs, conectores, gramática…) / **solo lo que fallé en el último test de esta ruta** / solo las unidades por debajo de Known.
- **Modo:** Meaning / Usage / Production / Mixed.
- **Cronómetro:** sí / no.
- **Sin repeticiones:** en "Full" ninguna unidad sale dos veces. En el resto, cobertura primero: las menos preguntadas en los tests anteriores de esta ruta van antes.
- **Las preguntas de gramática** salen de los temas guardados en la ruta, en su formato original.

### 5.2 Resultado del test de ruta
- Nota global y desglose **por tipo** (phrasal verbs 7/8, conectores 4/6, gramática 5/6…), **por skill** (meaning, usage, production) y **por formato**.
- **Comparación con el test anterior de esta ruta:** "+12 % respecto al 14/10", y qué unidades han mejorado o empeorado.
- Lista de fallos con: pregunta, mi respuesta, la correcta, explicación y enlace a la ficha.
- Botones: **"Retry my mistakes"** (test solo con los fallos), **"Learn these"** y **"Practise these"**.
- El test actualiza el estado de aprendizaje de cada unidad, igual que el resto de tests.

### 5.3 Seguimiento de la ruta (pantalla Stats)
- **Historial de tests** de la ruta: fecha, modo, longitud, nota y duración, con un gráfico de evolución de la nota (SVG simple, sin librerías). Al tocar un test, se ve su resultado completo.
- **Tabla de unidades:** etapa actual, veces preguntada, % de acierto, último resultado y fecha del último repaso. Ordenable por "más falladas", "menos vistas" o "etapa".
- **Resumen:** % de unidades en Known o más, teoría leída, minutos dedicados a la ruta, número de sesiones y tests, y fecha de la última actividad.
- **Puntos débiles de la ruta:** las 5 unidades con peor acierto, con botón de practicarlas.
- Toda actividad hecha desde una ruta (Learn, Practise, Flashcards y Test) se registra con su `routeId`, para que estas estadísticas sean exactas.

## 6. Lógica
- Ajuste en *Settings*: **"Prioritise my routes in daily practice"**, activado por defecto. Las unidades guardadas en rutas tienen prioridad para entrar como nuevas y para el refuerzo, dentro del porcentaje de cada área.
- Las unidades guardadas en rutas tienen **meta "use"**: la escalera exige producción (frase propia, traducción, hueco sin pista) antes de darlas por dominadas.
- Ajuste por librería: **"Only learn new [phrasal verbs / connectors / collocations] from my routes"**. Por defecto está activado para phrasal verbs si alguna ruta tiene phrasal verbs, y desactivado para el resto. Con él activado, la práctica diaria solo introduce unidades nuevas de esa librería que estén en una ruta (del **bloque actual** si la ruta tiene bloques). Si se agotan, avisa en vez de meter otras.
- Ajuste opcional: **"Units not saved in any route: recognise only"**, desactivado por defecto. Con él activado, esas unidades solo reciben formatos de significado y se dan por dominadas en la etapa 3.

## 7. Packs y exportación
- **Packs**, para cuando el tutor prepare una ruta:
  ```json
  "routes": [ { "id": "pv-core-25", "name": "25 phrasal verbs activos", "name_en": "25 active phrasal verbs", "icon": "🎯",
                "items": ["pv:find out", "cn:in case", "grammar:g-future"] } ]
  ```
  - Valídalas con motivos. Una referencia inexistente se avisa sin bloquear y se muestra como "pendiente".
  - Se marcan como `source: 'pack'` y se pueden editar igual. Si se reimporta el pack, la app pregunta si actualizar la ruta o conservar mi versión.
  - `learnList` sigue funcionando y añade a "My learning list".
- **Exportación** (sube la `version` del export y no rompas campos existentes):
  - `routes`: por ruta, `id`, `name`, `source`, `createdAt`, elementos (`ref`, `addedAt`, etapa, veces preguntada, % de acierto, último resultado) y resumen (% en Known o más, teoría leída, minutos, sesiones, tests, última actividad).
  - `routeTests`: cada test de ruta del periodo con `routeId`, fecha, opciones (longitud, alcance, modo, cronómetro), nota, duración, desglose por tipo, skill y formato, y **todos los fallos** (pregunta, respuesta dada, correcta, `uid`, `format`).
  - En cada intento de `attempts`: `routeId` y `routeMode` (learn, practise, flashcards, test) cuando la actividad se hizo desde una ruta.
  - En el `summary`: `routes` con la evolución de la nota de cada ruta en el periodo y sus puntos débiles.
  - Las exportaciones parciales ("Copy updates") incluyen los tests y la actividad de ruta desde el último envío. La exportación completa incluye todo el historial de rutas.

## 8. Pruebas
1. Desde la ficha de *however*: Save → "+ New route" → "Writing" → la ruta existe y contiene *however*. El icono aparece relleno.
2. Guardar *give up*, la collocation *make a decision* y el tema de gramática de conectores en "Writing". El detalle los agrupa por tipo.
3. Guardar el mismo elemento en dos rutas; desmarcarlo en una sigue dejándolo en la otra. "Undo" funciona.
4. Selección múltiple en la lista de conectores: guardar 5 de una vez.
5. Practise, Flashcards y Test de la ruta solo usan sus elementos, incluidas las preguntas del tema de gramática guardado.
6. Reordenar, renombrar, quitar y borrar persisten tras recargar. Borrar no toca el progreso.
7. Migración: una `learnList` existente se convierte en la ruta "My learning list".
8. Un pack con `routes` crea la ruta. Reimportarlo pregunta antes de pisar cambios.
9. **Test de ruta "Full":** pregunta cada unidad de la ruta exactamente una vez, más las preguntas de sus temas de gramática. "Retry my mistakes" solo incluye los fallos.
10. **Dos tests seguidos de 10** en una ruta de 20 unidades cubren las 20 unidades.
11. **El resultado muestra la comparación** con el test anterior de la misma ruta, y el historial y el gráfico de Stats se actualizan.
12. **Exportación:** tras un test de ruta y una sesión de Practise de la ruta, "Copy updates" incluye `routeTests` con los fallos, los `attempts` con `routeId` y el resumen de la ruta. Una segunda exportación sin actividad nueva no los repite.
13. **Bloques:** una ruta de 25 phrasal verbs en 5 bloques con `unlock: 'stage'` solo abre el bloque 2 cuando las 5 unidades del bloque 1 llegan a la etapa 3. "Dividir automáticamente en bloques de 5" funciona sobre una ruta simple.
14. **Con "Only learn new phrasal verbs from my routes" activado,** 30 sesiones diarias simuladas solo introducen phrasal verbs de rutas (del bloque actual si hay bloques).
15. Recorrido de las pantallas nuevas en EN y ES.

## 9. Documentación y entrega
- Documenta `routes` (en packs) y los campos nuevos de la exportación (`routes`, `routeTests`, `routeId`) en `docs/lexi-prompt-formatos.md` y `README.md`, con ejemplos JSON.
- Añade al final de `docs/CAMBIOS-v7.md` una sección **"v7.1: Save to route"** con lo hecho, las pruebas y las limitaciones.
- Haz el commit y el push a `main`.
