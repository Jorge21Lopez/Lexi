# Lexi

App para preparar el **Cambridge B1 Preliminary (PET)** y dar el salto a **B2**.
Incluye vocabulario con repetición espaciada, phrasal verbs en contexto, apuntes propios, plantillas y recursos de writing, libro de gramática, verbos irregulares, phrasal verbs, guías del examen, tests por temas, práctica por partes, simulacros cronometrados (Reading, Listening, Use of English B2, Writing) y práctica de Speaking.
Funciona sin conexión, guarda todo en tu móvil y se corrige junto con Claude mediante exportaciones.

## 1. Publicarla gratis (una sola vez, unos 10 minutos)

1. Crea una cuenta en https://github.com (gratis).
2. Pulsa **New repository**. Nombre: `lexi`. Marca **Public**. Pulsa **Create repository**.
3. En el repositorio vacío, pulsa **uploading an existing file** y arrastra **todos los archivos de esta carpeta** (no la carpeta, su contenido). Pulsa **Commit changes**.
4. Ve a **Settings → Pages**. En *Source* elige **Deploy from a branch**, rama **main**, carpeta **/ (root)**. Pulsa **Save**.
5. Espera 1–2 minutos. Tu app estará en `https://TU-USUARIO.github.io/lexi/`.

## 2. Instalarla en el móvil

- **Android (Chrome):** abre la dirección, menú ⋮ → **Instalar aplicación** (o *Añadir a pantalla de inicio*).
- **iPhone (Safari):** abre la dirección, botón Compartir → **Añadir a pantalla de inicio**.

Usa siempre la app desde el icono. En iPhone, Safari y la app instalada guardan los datos por separado.

## 3. Rutina con Claude (cada 1–2 semanas)

1. En la app: **Datos → Copiar novedades** (vocabulario, tests, simulacros y textos).
2. Pégalo en el chat del proyecto con Claude.
3. Claude analiza tus errores, corrige tus textos con los criterios oficiales y te devuelve un **pack** en JSON: vocabulario nuevo, tareas y simulacros nuevos, temas de gramática y correcciones.
4. En la app: **Datos → pega el pack → Revisar**. Verás qué se añade, qué se actualiza y qué falla (con el motivo). Pulsa **Aplicar**.

**Apuntes:** en *Estudiar → Plantillas de apuntes* tienes plantillas. Crea el apunte en la app y márcalo como "Listo" (irá en tu exportación), o cópialo, rellénalo fuera y pégalo en el chat. Claude te lo devuelve convertido en páginas de estudio y ejercicios.

**Contenido instalado** (en Datos): cada pack se puede activar/desactivar, ver, copiar o borrar. Borrar un pack no borra tu progreso.

Una vez al mes, descarga también una **copia de seguridad** (Datos). Tus datos solo existen en el móvil.

## 4. Actualizar la app

Sustituye los archivos en GitHub (Add file → Upload files) y sube el número de `VERSION` en `sw.js`. Tus datos no se tocan.

---

## Para Claude: formatos

**Exportación** (`format: "lexi-export"`, v2): `summary.vocab`, `summary.tests`, `summary.grammarBestPct`, `summary.irregularTrouble`, `summary.topErrorsAllTime`; `attempts` (vocabulario), `items`, `srs`, `tests` (con `parts` y `mistakes`: pregunta, respuesta dada y correcta), `writings` (con `form`, `task`, `text`, `timedMock`, `minutes`), `notes` (apuntes marcados como listos: `id`, `title`, `template`, `text`) e `installed` (ids de tareas, temas y simulacros ya instalados, para no repetir).

**Pack** que la app importa (todo opcional salvo `format`):

```json
{
  "format": "lexi-pack",
  "pack": {
    "id": "pack-2026-10-12",
    "name": "Semana 3: phrasal verbs y Reading Part 4",
    "items":   [ /* ejercicios de vocabulario (repetición espaciada) */ ],
    "tasks":   [ /* tareas de examen */ ],
    "papers":  [ { "id": "pet-r3", "title": "Reading PET: simulacro 3", "section": "reading", "minutes": 45, "max": 32 } ],
    "grammar": [ { "id": "g-x", "title": "…", "level": "B1", "html": "<p>…</p>", "test": [ { "q": "… ___ …", "o": ["a","b","c"], "a": "a" }, { "q": "… ___ …", "a": ["respuesta"] } ] } ],
    "pages":   [ { "id": "p-x", "section": "notes|exam|writing|speaking|other", "group": "Plantillas|Recursos (solo writing)", "title": "…", "html": "<p>…</p>" } ],
    "phrasal": [ { "v": "look out", "es": "tener cuidado", "theme": "problemas", "level": "B1", "sep": false, "ex": ["*Look out*! A car is coming.", "You should *look out* for pickpockets."] } ],
    "mode": "replace | merge"
  },
  "convertedNotes": [ { "noteId": "n…", "pageIds": ["note-x"] } ],
  "feedback": [ { "writingId": "w…", "score": "14/20", "bands": { "Content": 4, "Communicative": 3, "Organisation": 4, "Language": 3 }, "notes": "…", "corrected": "…" } ],
  "review": ["m04", "p05"],
  "retire": ["id-de-pack-antiguo"],
  "message": "Nota que aparece en la pantalla de inicio."
}
```

Un pack con el mismo `id` sustituye al anterior (`mode: "replace"`, por defecto) o se fusiona con él (`mode: "merge"`: añade y actualiza por id sin borrar lo demás). Se pueden pegar varios packs a la vez (lista JSON o uno detrás de otro). Un elemento con el mismo `id` que uno del banco base lo sobrescribe.

**Ejercicios de vocabulario** (`items`; campos comunes: `id`, `type`, `cat`, `level` B1/B2, `topic`, `word`, `exp` en español):

| type | campos | cat habitual |
|---|---|---|
| `mcq` | `prompt` con `___`, `options`, `answer` (debe estar en options) | vocab, phrasal, collocation, falsefriend |
| `gap` | `prompt` con `___`, `answers`, `hint` | spelling |
| `wordform` | `prompt` con `___`, `base` (en mayúsculas), `answers` | wordform |
| `translate` | `es`, `answers` | translate |
| `dictation` | `text` | listening |
| `writing` | `title`, `task`, `words`, `form` (email/article/story/essay/review), `part` (1/2) | writing |

**Tareas de examen** (`tasks`):

```json
{ "id": "r3p5", "section": "reading|listening|uoe|grammar", "paper": "pet-r3", "part": 5,
  "title": "Reading Part 5", "instructions": "…",
  "passage": "Texto con huecos marcados [21] … [22] …",
  "blocks":  [ { "label": "A", "title": "…", "text": "…" } ],
  "choices": [ { "label": "A", "text": "…" } ],
  "audio":   [ ["A", "voz 1"], ["B", "voz 2"] ],
  "questions": [
    { "n": 21, "kind": "mcq", "options": ["…","…","…","…"], "answer": "…" },
    { "n": 6,  "kind": "select", "stem": "Descripción de la persona", "options": ["A","B","C","D","E","F","G","H"], "answer": "C" },
    { "n": 27, "kind": "text", "stem": "opcional", "answers": ["for"], "audio": [["A","…"]] }
  ] }
```

Cada `[n]` del `passage` debe corresponder a una pregunta sin `stem`. Reading PET: partes 1–6 (5,5,5,5,6,6 preguntas); Listening PET: partes 1–4 (7,6,6,6); B2 Use of English: partes 1–4 (8,8,8,6). Para un simulacro nuevo, crea el `paper` y pon ese id en `paper` de cada tarea.

Topics: travel, work, shopping, health, education, relationships, freetime, environment, weather, house, technology, food, money, feelings, general.

**Apuntes → pack:** convierte cada apunte en una página `section: "notes"` (HTML con `<h4>`, `<table>`, `<p class="ex">` para ejemplos y `<p class="tip">` para consejos). Si pide ejercicios, añade `items` o un tema en `grammar` con `test`. Las listas de vocabulario van a `items`; los phrasal verbs, a `phrasal` (en cada ejemplo, el verbo va entre `*asteriscos*`; cada uno genera automáticamente un ejercicio en contexto). Incluye `convertedNotes` con los ids de los apuntes procesados.

Temas de phrasal (`theme`): rutina, relaciones, viajes, trabajo, problemas, comunicacion, dinero, salud, ocio.
