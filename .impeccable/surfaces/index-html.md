---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["app.js"]
---

# Lexi app shell (index.html + app.js views)

Scope: whole app redesign, all views rendered by app.js. Mode: Operate (with Read for grammar/guide pages and passages). Phone-first (≈99 % mobile, one-handed bursts + seated mock exams).

Audience/job: one owner preparing PET → B2; daily SRS session, tests, mocks, writing, Claude export/import loop.
Constraints: vanilla JS, no build; keep `data-*` hooks and state shape; keep the 5-tab bottom bar (Home/Study/Tests/Write/Data); offline (self-host fonts, add to sw.js SHELL); EN/ES.
Must not feel: childish, cold/corporate, generic.

## Direction contract

THESIS: Studying is running a course. Every day Lexi lays out today's course — numbered controls joined by a purple line — and you punch them one by one. Refuses the category default of rounded white cards, mascots, confetti and a daily-goal ring.

OWN-WORLD: ISOM orienteering inks on a working app: runnable-forest white surfaces, open-land yellow, thicket green, contour brown, marsh blue as section/terrain colours; course purple #7B2CBF reserved for the course (next action, active leg, primary button, active tab) and nothing else. One condensed-to-normal sans family (Barlow / Barlow Condensed): condensed caps for display, numerals and labels, tabular figures everywhere. Square-ish 6px corners, 1.5px ruled tables like IOF control-description sheets. Faint contour-line texture only in the header band.

STORY: Open the app → see today's course and how far along it you are → tap the big purple GO → punch controls (exercises) along the line → finish at the double circle; the week shows finished courses. The Claude loop is "new map arrived".

FIRST VIEWPORT: Home at 390×844. Top: wordmark + date + EN/ES. Hero block: "TODAY'S COURSE" with a horizontal purple course strip (△ start → ① Reviews 12 → ② New 4 → ③ suggested test → ◎ finish), punched controls filled. Under it a control-description table (number | terrain symbol | description | value; rows: reviews / new words / suggested test — the streak lives in the week caption) and the full-width purple GO button directly after it. Cited adaptation: at 390×844 GO sits at ~55–60% of the viewport height, inside the one-handed thumb arc; it is position:sticky above the tab bar, so once Home scrolls it stays pinned there. Legs with nothing to do today render as dashed 'none' controls, never punched. Below the fold: terrain-coloured tiles for Study/Tests/Write/Progress and the Claude note.

FORM: challenger "notation-diagram-systems-orienteering-map" (user adopted a declined challenger); seed key 625e472b, re-roll 1.

SIGNATURE: the course line — today's plan on Home and the per-exercise progress in the session are the same purple control-to-control line; each answer punches a control (ok = filled, bad = crossed). Motion: the line draws to the next control on advance (stroke-dashoffset), instant under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
