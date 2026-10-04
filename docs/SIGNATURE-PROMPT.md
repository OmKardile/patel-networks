# Signature Development Pass — reusable prompt

Paste this into any project session to replicate the Patel Networks treatment
(what Tasks 58→62 did here: responsive standard, dark-mode contract, evidence
showcase, admin/DB hardening, deploy blueprint, verification discipline).

Fill the placeholders in the backticks before sending.

---

## FULL VERSION (one-shot master prompt)

```
Run a full "signature development pass" on this project: `{{APP_NAME}}`
(repo `{{REPO_URL}}`, prod `{{PROD_URL}}`, framework `{{FRAMEWORK}}`).
Work in phases; after EVERY phase: append a section to /worklog.md at repo
root (Task ID, Work Log, Stage Summary — never overwrite, always append),
commit with a dense message, push, and verify the deploy.

PHASE 0 — ORIENT
Map the codebase before touching anything: enumerate every route, every API
endpoint, every DB model, every env var read. Build a reusable QA sweep
script and keep it for future rounds. Read any existing handover docs first.

PHASE 1 — RESPONSIVE INTEGRITY (site-wide, non-negotiable standard: 0px
horizontal overflow on every route at every width)
1. Sweep EVERY route at 360 / 390 / 430 / 768 / 1024 / 1280 / 1440 measuring
   document scrollWidth − clientWidth, and report the unclipped offender
   elements for any route that overflows.
2. Fix root causes, not symptoms. Desktop-only chrome (wide nav rows, labeled
   buttons, multi-column bars) switches on ONLY at the breakpoint where it
   actually fits — measure the real pixel need, don't guess. Below that
   breakpoint users get full-featured hamburger/sheet navigation with the
   theme toggle reachable.
3. Mobile contract: sticky footer that never floats (min-h-screen flex
   flex-col, mt-auto footer), 44px minimum touch targets, full-screen search
   sheets, tables live in smooth overflow-x-auto wrappers, carousels use
   scroll-snap with intentional peek.
4. Dark mode contract: 3-state light/dark/auto toggle, persisted to
   localStorage, data-theme attribute + pre-paint boot script so there is
   ZERO flash on load, theme-color meta synced, and dark verified at phone
   AND laptop widths (no white bands, theme-aware surfaces).

PHASE 2 — SIGNATURE SHOWCASE PAGE
Build a standalone single-file HTML page (e.g. /showcase) served as a static
artifact (rewrite, not a React route shadowing it) that pitches the product:
- Embedded REAL screenshots of the live UI (storefront, key flows, admin
  consoles) as base64 JPEG face-cards — evidence, not promises — plus a
  screenshots gallery, palette specimen row, and architecture summary.
- 3-zone nav: pinned brand | scrollable links strip | pinned right controls
  (theme toggle + Print/Save-PDF never scroll out of view). Two-row layout
  ≤560px with full-bleed swipeable links. Print styles force light theme.
- Same light/dark/auto toggle contract as the main site (shared key,
  flash-free).

PHASE 3 — ADMIN + API + DB HARDENING
1. Read-only DB audit: row counts, 1:1 invariants, money/status invariants,
   no negatives, no orphans. Report a green/red verdict.
2. Smoke every API: auth guards return 401 without a session, validation
   rejects bad input with field-level messages, pagination works.
3. E2E one full state-machine transition through BOTH the API and the UI
   (e.g. order lifecycle), verifying persistence and history.
4. One full CRUD cycle per core entity — and DELETE every test entity in the
   same session; hunt for leftover SMOKE/TASK* test rows from earlier rounds
   and remove them.
5. UI sweep: every admin page at desktop AND 390px — correct headings, 0
   overflow, console clean.

PHASE 4 — DEPLOY BLUEPRINT
Write a render.yaml (or platform equivalent) carrying the COMPLETE env
surface: grep every env var read; hardcode every key — real values for core
(DB, secrets, origin), and for optional integrations use behavior-identical
sim-safe sentinels (the exact strings the code falls back to when unset —
never a value that would activate live behavior like webhook enforcement).
Zero sync:false prompts, zero generated secrets. Document in the file: the
sentinel convention, the one line to edit, the first-deploy URL fix, and any
shared-DB safety audit (schema-subset proof) if two services share a
database. Require a /health endpoint; verify each deploy by grepping a
marker in the built bundle, then browser-verify prod itself.

PHASE 5 — VERIFICATION DISCIPLINE (applies to every phase above)
lint + typecheck clean; nothing counts as done from a clean build alone —
drive the golden paths in a real browser and confirm data actually
displays; the browser console is the source of truth for errors; review
screenshots at 390/768/1024/1280; after every push, poll the deploy and
re-probe prod. Priority order: bugs → QA gaps → styling detail polish → new
features.

Begin with Phase 0 now and proceed phase by phase without asking me
questions unless something is genuinely ambiguous.
```

---

## COMPACT VERSION (quick rounds / smaller apps)

```
Run a signature pass on `{{APP_NAME}}`: (1) sweep every route at
360→1440 and fix ALL horizontal overflow at its root (desktop chrome only
where it fits, full hamburger nav below, sticky footer, 44px touch
targets); (2) enforce the dark-mode contract — persisted 3-state toggle,
data-theme + pre-paint script, zero flash, verified in both themes;
(3) build a standalone /showcase HTML page with real embedded UI
screenshots, pinned brand/links/controls nav, and print styles;
(4) audit admin + APIs + DB (auth guards, validation, invariants, one E2E
state transition, full CRUD cycle — delete all test entities same-session);
(5) write a render.yaml with the COMPLETE env surface hardcoded
(real values + sim-safe sentinels matching the code's own fallbacks, zero
prompts); (6) verify everything in a real browser + lint + tsc, commit,
push, and confirm the prod deploy. Log every phase in /worklog.md (append
only).
```

---

## Why these phases (provenance)

| Phase | Provenance in this repo |
|---|---|
| 1 Responsive | Task 60 — 171px overflow at 1024 found by a 7-width sweep; fixed by breakpoint migration, verified 11 routes × 7 widths |
| 2 Showcase | Tasks 58–59 — standalone HTML, route rewrites, real screenshots, 3-zone nav, flash-free theming |
| 3 Hardening | Task 61 — 182-order money invariant audit, 22 API smokes, FSM E2E, orphaned test-coupon cleanup |
| 4 Deploy | Task 62 — 26-key prompt-free blueprints on both repos, sim-safe sentinels, shared-DB proof, prod marker verification |
| 5 Discipline | Every task — worklog protocol, browser evidence, deploy polling, cron QA sweeps |
