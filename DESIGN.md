---
name: Lexi
description: A personal Cambridge PET-to-B2 trainer drawn as an orienteering map; every day is a course of controls joined by a purple line.
colors:
  course: "#7B2CBF"
  course-ink: "#FFFFFF"
  course-soft: "#F2E9FB"
  course-line: "#9B5BD6"
  map-white: "#F3F5EF"
  surface: "#FFFFFF"
  surface-2: "#ECEFE6"
  ink: "#1E2118"
  muted: "#665A48"
  line: "#DCDFD3"
  rule: "#CDBFA9"
  contour: "#8C5A2B"
  open: "#FFD24D"
  open-bg: "#FFF4CC"
  open-ink: "#6E5200"
  thicket: "#A5B36A"
  thicket-bg: "#EDF1DD"
  thicket-ink: "#47601A"
  water: "#5FA7D6"
  water-bg: "#E3F0F8"
  water-ink: "#1D628F"
  ok: "#47601A"
  ok-bg: "#EDF1DD"
  near: "#7A5400"
  near-bg: "#FFF1C7"
  bad: "#B5341F"
  bad-bg: "#FBE6E1"
  heat-0: "#E6E9DE"
  heat-1: "#DCE5BE"
  heat-2: "#B8C886"
  heat-3: "#8FA05A"
  heat-4: "#47601A"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "46px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.005em"
  numeral:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "72px"
    fontWeight: 700
    lineHeight: 0.9
    fontFeature: "tnum"
  headline:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.03em"
  prompt:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.06em"
  section:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  tag: "4px"
  control: "5px"
  container: "6px"
  sheet: "0px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "6px"
  md: "10px"
  row: "14px"
  gutter: "16px"
  lg: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.course}"
    textColor: "{colors.course-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "50px"
  button-primary-big:
    backgroundColor: "{colors.course}"
    textColor: "{colors.course-ink}"
    rounded: "{rounded.control}"
    height: "60px"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "50px"
  button-ghost:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "44px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
    height: "56px"
  option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
    height: "58px"
  option-selected:
    backgroundColor: "{colors.course-soft}"
    textColor: "{colors.ink}"
  option-ok:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok}"
  option-bad:
    backgroundColor: "{colors.bad-bg}"
    textColor: "{colors.bad}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.container}"
    padding: "16px"
  control-description-table:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "9px 10px"
  question-sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sheet}"
    padding: "22px 18px 24px"
  control-open:
    backgroundColor: "{colors.map-white}"
    rounded: "{rounded.round}"
    size: "44px"
  control-done:
    backgroundColor: "{colors.course}"
    textColor: "{colors.course-ink}"
    rounded: "{rounded.round}"
    size: "44px"
  tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    height: "64px"
  tab-active:
    textColor: "{colors.course}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.contour}"
    rounded: "{rounded.tag}"
    padding: "1px 7px"
---

# Design System: Lexi

## Overview

**Creative North Star: "The Day's Course"**

Lexi is drawn as an ISOM orienteering map and its IOF control-description sheet. Studying is running a course: today's work is laid out as numbered controls joined by a purple line, and each exercise answered punches a control. The map supplies everything else. Surfaces are runnable-forest white, sections carry terrain inks (open-land yellow, thicket green, rough, marsh blue, contour brown, rock grey), and data is set in ruled sheets with condensed caps headers, the way a control-description card is printed.

The system is dense, ruled and flat. Depth comes from rules and ink weight (a 1.5px ink border marks a sheet, a 1px rule marks a row), not from soft shadows or rounded white cards. Type is one family in two widths: Barlow Condensed caps for display, numerals and labels; Barlow for reading, with tabular figures everywhere. The world ships in a light map (paper) and a dark map (night run) with the same roles in both.

It refuses the category default of study apps: rounded white cards, mascots, confetti and a daily-goal ring. Purple is never decoration; it is the course.

**Key Characteristics:**
- Course purple marks the route and your next move, nothing else.
- One skill, one terrain symbol, on every screen.
- Ruled sheets (1.5px ink frame, 1px rule cells) in place of cards for data and exercises.
- Condensed caps for labels and numerals, Barlow for prose, tabular figures throughout.
- Square-ish corners (5–6px), sheets fully square; no ambient card shadows.
- Motion is the line drawing to the next control; all of it is off under reduced motion.

## Colors

ISOM map inks on a warm off-white map, with one reserved overprint colour (course purple) and three semantic answer inks. Every role has a light and a dark value; dark is applied by `prefers-color-scheme: dark` unless the user forces `data-theme="light"`, and `data-theme="dark"` forces it regardless of system setting (Automatic / Light / Dark in Data settings).

### Primary
- **Course Overprint Purple** (course): the orienteering overprint. Used for the course line and its controls, control numbers, the active tab and its top bar, primary buttons (GO, Next), the answer-gap underline, focus outline, text caret, selected answers and letters, the session progress track, and links. In dark it lifts to a lighter violet with dark ink on it (see sidecar).
- **Course Soft** (course-soft): the visited-control fill, selected-option wash, text selection, the in-progress note panel and the field focus halo.
- **Course Ink** (course-ink): text and glyphs on purple.

### Secondary: the terrain key
- **Open Land Yellow** (open / open-bg / open-ink): vocabulary. Also tips, highlights and the "short-term" band of the word bank.
- **Thicket Green** (thicket / thicket-bg / thicket-ink): grammar and Use of English. Also the "learnt" bars, meters and switches-on state.
- **Marsh Blue** (water / water-bg / water-ink): listening. Also the Claude note panel and "feedback received" status.
- **Contour Brown** (contour): writing, and the ink of section headings, table header cells, sheet captions and terrain glyphs.
- **Rough** (light yellow with black dot screen) and **Rock** (grey with black dot screen): reading and speaking swatches. These two are literal values inside the swatch, not tokens.

### Tertiary: answer inks
- **Correct Green** (ok / ok-bg), **Near Amber** (near / near-bg), **Mistake Red** (bad / bad-bg): the only colours for answer verdicts, option states, gap states, percentage badges and the timer's urgent state.

### Neutral
- **Map White** (map-white): page background and the inside of open controls.
- **Sheet White** (surface) and **Shaded Row** (surface-2): sheets, lists, fields; alternate table rows, transcripts and model answers.
- **Map Black** (ink): text, sheet frames (1.5px) and pressed segmented/chip states (ink fill, map-white text).
- **Brown Grey** (muted): secondary text, inactive tab labels, day letters.
- **Rule** (rule) and **Hairline** (line): component borders and table cells; row dividers inside lists.
- **Heat ramp** (heat-0…heat-4): the training-log heatmap, thicket-hued from empty to dense.

### Named Rules
**The Overprint Rule.** Course purple marks the course and the user's own move on it: the line, controls, control numbers, primary action, active tab, selection, focus and the gap to fill. It never marks a section, a category, a chart series or decoration. Toggles that are not "the course" use ink (segmented, chips) or thicket-ink (switches).

**The One Key Rule.** Each skill has exactly one terrain symbol across the app: vocabulary = open land, grammar and Use of English = thicket, reading = rough, listening = marsh/water, writing = contour, speaking = rock. A section spanning several skills (Study, Tests, Write, Progress on Home's map legend) uses its tab icon, never a swatch.

**The Verdict Inks Rule.** Green, amber and red mean correct, near and wrong, and nothing else.

## Typography

**Display Font:** Barlow Condensed 600/700 (fallback Barlow, ui-sans-serif, system-ui)
**Body Font:** Barlow 400/500/600/700 (fallback ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto)

Both are self-hosted woff2 in `fonts/`, preloaded (Barlow 400, Condensed 700) and cached offline.

**Character:** One family in two widths, like a map legend: narrow caps for everything that is a label or a number, normal width for anything you read.

### Hierarchy
- **Display** (Condensed 700, 46px, 0.95, uppercase, balanced): one view title per screen ("Today's course").
- **Numeral** (Condensed 700, 72px, 0.9): session score and the big timer; stat values at 32px, band scores at 26px, control-table values at 20px.
- **Headline** (Condensed 700, 22–24px, uppercase, 0.03em): verdicts ("Correct", "Not quite"), feedback heads, session top-bar title, page sub-heads (20px).
- **Prompt** (Barlow 500, 26px, 1.45): the exercise sentence; Spanish cue at 30px/700.
- **Title** (Barlow 700, 18px, 1.3): panel and card titles.
- **Body** (Barlow 400, 17px, 1.5, tabular figures): all reading; grammar pages at 1.62, reading passages at 1.7 capped at 70ch; small text 14–15px.
- **Section** (Condensed 700, 16px, 0.08em, uppercase, contour brown, trailing 1px rule): section headings inside a view.
- **Label** (Condensed 700, 13–15px, 0.05–0.08em, uppercase): control labels, tab labels, table header cells, sheet headers, status, day letters.

### Named Rules
**The Two Widths Rule.** Condensed caps label and count; normal width explains. Never set a paragraph in Condensed, never set a number in a proportional figure.

## Layout

Phone-first single column, max 560px centred, 16px gutters, with bottom padding that clears the 64px fixed tab bar and the safe-area inset. Home stacks: header band, display title and lead, the course strip, the control-description table, then the sticky GO block (pinned 10px above the tab bar), then week, map legend and notes. Focus screens (session, test, mock) hide the tab bar, pin a top bar with close, the course track and count, and pin a footer with the verdict and Next.

Rhythm: 10px is the default gap between stacked controls and grid cells; 12–14px row padding inside lists and tables; 16px panel padding; 18–24px inside exercise sheets; 32px above section headings. Hit targets are at least 44px (controls, icon buttons, letters, tabs 64px; options 58px; primary 50–60px). Grids are small and fixed: 2 columns for test topics, 3 for exam parts and stats, 4 for writing bands, 12 weeks for the heatmap.

## Elevation & Depth

Flat. Depth is expressed with rules and ink weight: a 1.5px ink frame for sheets (control-description tables, question sheets, stats, bands, word bank, timer), a 1px rule border for lists, panels and controls, a 1px hairline between rows. Panels and cards carry no shadow.

### Shadow Vocabulary
- **GO lift** (`box-shadow: 0 6px 18px rgba(123,44,191,.32)`): only on the sticky primary GO button on Home, so it reads as floating above the scrolling map.
- **Pinned footer** (`box-shadow: var(--shadow-up)`, a 1px line plus a soft upward fade): the sticky session footer separating from content scrolling under it.
- **Toast** (`box-shadow: var(--shadow)`): transient messages only.

### Named Rules
**The Ruled Not Raised Rule.** If a container needs separation, give it a rule or an ink frame, not a shadow. The three shadows above are the whole vocabulary.

## Shapes

Square-ish and drafted. Interactive controls (buttons, fields, options, chips, segmented, icon buttons, part buttons) use 5px corners; containers (panels, lists, legend, pages, passages, heatmap) use 6px; small tags and percentage badges 4px. Ruled sheets (control-description tables, question sheets, stats, bands, timer, word bank) are fully square, like printed IOF cards. Circles are reserved for map semantics: controls, the week dots, option letters, question numbers, verdict marks, play button. The start is a purple triangle and the finish a double circle, as on a real course; the triangle is also the wordmark glyph.

The only texture is a faint contour-line pattern in the header band. Terrain swatches (40x30, rectangular, 1px dark hairline) carry the map's dot screens and hatching.

## Components

### Buttons
- **Shape:** gently squared (5px), min height 50px; `big` 60px.
- **Primary:** course purple fill and border, course-ink text in Condensed 700 caps 19px (22px big), trailing arrow. GO and Next are full width.
- **Secondary:** sheet white, rule border, Barlow 600 16px, ink text.
- **Ghost:** transparent, muted text, 44px; danger variants use mistake red.
- **Press / Focus:** scale to 0.98 on press (120ms, expo ease-out); 2px purple focus outline offset 2px; disabled 45% opacity.

### Chips and segmented choices
- **Chips:** sheet white, rule border, 5px, 14px/600; level tags are Condensed caps in contour brown at 4px.
- **Selected:** ink fill with map-white text (not purple). Switch-on is thicket-ink.

### Cards / Containers
- **Panels and lists:** sheet white, 1px rule border, 6px, 16px padding, no shadow. Note panels drop the border and take a marsh-blue wash (Claude) or course-soft wash (run in progress).
- **Pages and passages:** same frame, roomier padding (18–20px), longer leading; tables inside get Condensed contour header cells over a 1.5px ink rule and shaded even rows.

### Inputs / Fields
- **Style:** sheet white, 1px rule border, 5px, 56px tall, 19px text (textarea 17px, 220px min); purple caret.
- **Focus:** border turns purple plus a 3px course-soft halo.
- **States:** correct = ok border on ok-bg; wrong or near = bad border on bad-bg.

### Navigation
- **Tab bar:** fixed bottom, sheet white, 1px rule top, five equal tabs (Home, Study, Tests, Write, Data), 64px, line icon over Condensed caps 14px label in muted. Active tab turns course purple and grows a 3px purple bar along its top edge (scaleX draw, 350ms). Hidden on focus screens.
- **Header band:** wordmark (purple triangle + "LEXI" Condensed caps 26px), date in Condensed caps muted, EN/ES toggle; contour texture along the bottom.

### The Course (signature)
Controls joined by the purple line. Each control is a 44px circle with a 3px purple ring on map white and its number set top-right in Condensed purple. States: **open** (empty ring, tappable), **done** (purple fill, check), **none** (dashed ring at half opacity; nothing to do today, never punched), **visited** (course-soft fill, 4px ring). The line underneath is the purple at 25% with a solid purple leg that draws to the reached control. The same grammar appears as the Home course strip, the exam-part strips on Tests, and the compact session **track** (12px controls, current one 20px; correct = filled, near = filled at 60%, wrong = red cross).

### Control-description table (signature)
The IOF sheet: full-width table, 1.5px ink frame, 1px rule cells, square corners. Columns: control number (Condensed 18px, centred, 44px), terrain symbol, description (Barlow 16px), value (Condensed 20px, right-aligned). Variants: key column in Condensed contour caps for answer/why feedback; history rows tappable.

### Question sheet (signature)
The exercise card is a sheet: 1.5px ink frame, square, with a ruled header row (number in purple | category in contour caps | level), then the prompt at 26px with the gap as a purple 3px underline that turns green, amber or red on answer. Options below are 58px rows with a lettered circle; correct = ok wash and filled letter, wrong = bad wash with struck text.

### Verdict
A 34px mark (filled green check, filled amber, or red-ringed cross) stamped in beside a Condensed caps headline in the verdict ink.

### Motion
One ease, expo out (`cubic-bezier(.16,1,.3,1)`). The course leg draws by scaleX (700ms Home, 600ms track); the current track control pops in (450ms); verdict marks stamp (400ms, from 1.6x); wrong answers shake (400ms); view changes use the View Transitions API (220ms crossfade); haptic buzz on answer. Under `prefers-reduced-motion` every transition, animation, view transition and vibration is off and legs render at their final position.

### Inherited-only views
Writing and Speaking use the tokens, type, buttons, fields, panels and terrain swatches, but their layouts were not restructured into the course grammar in this pass.

## Do's and Don'ts

### Do:
- **Do** keep course purple to the course and the user's move: line, controls, numbers, primary button, active tab, gap underline, selection, focus.
- **Do** tag every single-skill surface with its terrain symbol from the one key, and use tab icons for multi-skill sections.
- **Do** set data and exercises as ruled sheets: 1.5px ink frame, 1px rule cells, square corners, Condensed caps header cells in contour brown.
- **Do** use Condensed caps for labels and every number, with tabular figures.
- **Do** render a leg with nothing to do as a dashed `none` control, never as punched.
- **Do** define every new colour as a light/dark token pair and check it under both `prefers-color-scheme` and the `data-theme` override.
- **Do** gate every new animation behind `prefers-reduced-motion`.

### Don't:
- **Don't** use purple for sections, categories, chart series, badges or decoration.
- **Don't** give two skills the same swatch or one skill two swatches.
- **Don't** put soft shadows on panels or cards; separation is a rule or an ink frame. GO, the pinned footer and toasts are the only shadows.
- **Don't** round past 6px or build rounded white cards, mascots, confetti or a daily-goal ring.
- **Don't** add texture outside the header band and the terrain swatches.
- **Don't** set prose in Barlow Condensed.
