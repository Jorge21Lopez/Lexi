# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner, an adult Spanish speaker preparing Cambridge B1 Preliminary (PET) and the step up to B2 First. No other users. Usage is about 99 % on their own phone, as an installed PWA.

## Product Purpose

Lexi is a personal exam-prep trainer: spaced-repetition vocabulary, phrasal verbs in context, a grammar book, irregular verbs, exam guides, tests by topic and by part, timed mock exams (Reading, Listening, B2 Use of English, Writing) and Speaking practice. Success is steady daily practice that turns into exam readiness; there is no exam date yet, so the product must sustain motivation over an open-ended period rather than count down to a deadline.

## Positioning

Lexi is tutored by Claude through a manual loop: the app exports activity (mistakes, tests, writings, notes), the owner pastes it into a Claude chat, and Claude returns a JSON "pack" with new exercises, mock papers, grammar topics, corrected writings and a message that the app imports. Content grows around the owner's actual mistakes. No commercial app has this loop.

## Operating Context

- Mixed usage: short daily bursts of 5–10 minutes (vocabulary sessions, often one-handed, on the move) and longer seated sessions of 30–60 minutes (mock exams, writing, grammar reading).
- Every 1–2 weeks: export → Claude chat → paste pack → review → apply. Monthly backup download.
- Works offline; all data lives only on the device (localStorage key `lexi:v1`). On iPhone, Safari and the installed app keep separate data.

## Capabilities and Constraints

- Static site: plain HTML/CSS/vanilla JS, no build, no framework (a React + Vite migration was considered and rejected). Deployed on GitHub Pages via GitHub Actions; the service worker caches a fixed file list and its VERSION is set per commit.
- Rendering is template strings into `#app` from `app.js`; interaction hooks are `data-act`, `data-go`, `data-page`, etc.
- The stored state shape must stay backward compatible; progress must never be lost on update.
- Bilingual UI: English by default, Spanish selectable (EN/ES); content carries `_en` variants.
- Exam structure is fixed by Cambridge: Reading PET parts 1–6, Listening PET 1–4, B2 Use of English 1–4, Writing (email/article/story/essay/review), Speaking.
- Text-to-speech (browser speech synthesis) is used for dictation and listening.

## Brand Commitments

- Name: Lexi. Existing mark: the wordmark "Lexi" followed by a short yellow bar (echo of the exercise gap `___`). The visual style itself is not binding; the owner asked for a redesign because the current UI feels flat and dull.

## Evidence on Hand

Real content in the repo: `content.js`, `content_en.js` (vocabulary items), `grammar.js`, `guides.js`, `exams.js`, `phrasal.js`, `writing.js`. No testimonials, users or metrics beyond the owner's own progress data.

## Product Principles

1. The daily vocabulary session is the heartbeat; opening the app and starting it must be effortless and rewarding.
2. Motivation over a long horizon matters more than urgency — there is no deadline to lean on.
3. Exam fidelity: tests and mocks should feel like the real Cambridge papers when it matters.
4. The Claude loop is the differentiator; exporting and importing must feel like part of studying, not admin.
5. Offline, private and lossless: the phone is the only source of truth.
