# Implementation Prompts by Milestone

Use this file to assign milestone work to an agent, request proof of completion, and manually verify outcomes.

## Validation Execution Policy
- Required milestone validation commands (`npm run validate:mX` or equivalent) must be run in a local host terminal with working Node/npm tooling.
- If an agent environment cannot run tooling, it should report `ENV-BLOCKED` and provide exact local commands; local command output then becomes authoritative evidence.
- A milestone should be marked `PASS` only after required local validation command output is captured.
- Agent-side blocked runs are diagnostic context, not final gate evidence.
- Use sequential regression validation after implementing milestone `Mn`: run `validate:m1` through `validate:mn` in order.
- If any earlier milestone validator fails during sequential regression, stop and report that failure before accepting `Mn`.

## M1 - Project Scaffold + Routing Foundation

### Prompt to assign M1
```text
Implement only M1 from docs/plans/execution-plan.md.

Scope:
- M1 only: project scaffold + routing foundation.
- Use stack from docs/plans/technical-plan.md (Vue 2 + TypeScript + Vue Router + Vuex + Vuetify).
- Create routes `/` and `/viewer`.
- Ensure client-side navigation between `/` and `/viewer` (no full page reload).

Do NOT do:
- M2+ work (no data manifest, no viewer features, no ligand/fragmap logic).

Required deliverables:
1) Files created/updated.
2) Commands run.
3) Validation evidence for M1 gate:
   - production build succeeds
   - `/` renders
   - `/viewer` renders
   - navigation `/` <-> `/viewer` is SPA (no full page reload)
   - unknown route does not crash app
4) Residual risks/blockers.

Return format:
- M1 status: PASS/FAIL
- Gate checklist with pass/fail per item
- File list
- Command outputs summary
```

### Prompt to verify M1
```text
Run the M1 gate verification now and return a PASS/FAIL table with evidence.

Sequential command set for M1:
- `npm run validate:m1`

For each gate item include:
- check name
- exact command or manual step used
- observed result
- pass/fail

Also include:
- `git status --short`
- `git diff --name-only`
- any failures and exact fix needed
- local host-terminal output for required validation command(s)
```

### Manual verification for M1
```bash
# from repo root
git diff --name-only
git status --short
```
Confirm scaffold files exist (package, src, router, pages).

Then run:
```bash
npm install
npm run build
npm run serve   # or npm run dev (use whichever scripts were added)
```

In browser:
1. Open `/` -> page loads.
2. Navigate to `/viewer` -> page loads.
3. Navigate back to `/` via app nav.
4. Open DevTools Network, filter `document`: should stay at initial document load during in-app nav (no new full document request).
5. Go to an unknown route like `/not-found` and confirm app does not hard-crash.

If all 5 pass, M1 is done and you can start M2.

## M2 - Data Manifest + Assets + Startup Validation

### Prompt to assign M2
```text
Implement only M2 from docs/plans/execution-plan.md.

Scope:
- M2 only: data manifest + asset pipeline + startup data validation.
- Keep stack/architecture aligned with docs/plans/technical-plan.md.
- Use from_silcsbio as source input, and stage runtime assets into:
  - public/assets/protein
  - public/assets/ligands
  - public/assets/maps
- Add deterministic staging/copy logic (scripted, repeatable; no manual one-off copying).
- Add typed manifest definitions for protein, ligands, and fragmaps.
- Add startup validation utility for required runtime assets.

M2 required behavior:
1) Manifest coverage:
- Include `3fly_cryst_lig`.
- Include all baseline ligand IDs from `from_silcsbio/ligands/*.sdf`.
2) Startup validation:
- Check required protein/ligand/map runtime assets.
- If an asset is missing: non-blocking error path and disable-intent metadata/state (no app crash).
3) FragMap mapping:
- FragMap IDs and labels must match spec inventory exactly.

Do NOT do:
- M3+ work (no viewer lifecycle features, no ligand interaction UI behavior, no fragmap control UI behavior, no perf instrumentation work).

Required deliverables:
1) Files created/updated.
2) What each changed file does (new file purpose or delta for existing file).
3) Commands run.
4) M2 gate evidence with pass/fail for each item in execution-plan M2 exit criteria.
5) Residual risks/blockers.
6) Update docs/plans/milestone-inventory.md for M2 using the existing table format.

Validation requirements:
- Run relevant checks (at minimum build + any new script checks introduced for M2).
- If environment blocks execution (tooling/network), report ENV-BLOCKED (not FAIL) and provide exact local commands to run.

Return format:
- M2 status: PASS/FAIL/ENV-BLOCKED
- Gate checklist (item -> pass/fail/blocked + evidence)
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt to verify M2
```text
Run the M2 gate verification now and return a PASS/FAIL table with evidence.

Sequential command set for M2 regression:
- `npm run validate:m1`
- `npm run validate:m2`

For each gate item include:
- check name
- exact command or manual step used
- observed result
- pass/fail (or blocked)

M2 gate items to verify (from docs/plans/execution-plan.md):
1) Manifest includes `3fly_cryst_lig` and all baseline ligand IDs from `from_silcsbio/ligands/*.sdf`.
2) Startup validation checks required protein/ligand/map runtime assets.
3) Missing-asset simulation triggers non-blocking error and local control-disable intent (no app crash).
4) FragMap IDs and labels match spec inventory exactly.
5) Build succeeds in production mode.

Required evidence to include:
- `git status --short`
- `git diff --name-only`
- file list changed for M2
- command output summary for each verification command
- local host-terminal output for `npm run validate:m1` and `npm run validate:m2` (authoritative gate evidence)
- exact path(s) of generated/staged runtime assets under `public/assets/...`
- residual risks/blockers + exact fix needed

If environment/tooling prevents checks:
- mark status as `ENV-BLOCKED` (not FAIL)
- provide exact local commands to run to complete verification

Return format:
- M2 status: PASS/FAIL/ENV-BLOCKED
- Gate checklist table (item | command/step | observed result | status)
- Files changed
- Commands run
- Risks/blockers and fixes
```

### Manual verification for M2
- TODO

## M3 - Viewer Core Lifecycle/Layout/Defaults/Error Fallback

### Prompt to assign M3
```text
Implement only M3 from docs/plans/execution-plan.md.

Scope:
- M3 only: viewer core lifecycle, layout scaffold, default state contract, and startup failure fallback.
- Follow docs/specs/viewer-core-spec.md and keep architecture aligned with docs/plans/technical-plan.md.
- Build on existing M1/M2 outputs only (routes + manifest/startup validation).
- Create/complete M3-focused modules (as needed), such as:
  - src/components/NglViewport.vue
  - src/components/ControlsPanel.vue
  - src/components/ViewerTopBar.vue
  - src/viewer/nglStage.ts
  - viewer shell state/store wiring

M3 required behavior:
1) `/viewer` shows explicit loading state, then ready state.
2) Default viewer state is set to:
- ligand: `3fly_cryst_lig`
- baseline pose: ON
- refined pose: OFF
- no FragMaps visible
3) Camera baseline contract exists and `Reset view` target is defined.
4) Resize preserves camera state.
5) Unmount/remount does not duplicate listeners.
6) Failure path: forced stage-init failure shows fallback UI with recovery action(s) (retry and/or navigate home), not an app crash.

Do NOT do:
- M4+ behavior (no ligand workflow UI logic, no FragMap control logic, no iso interaction logic, no performance instrumentation work).

Required deliverables:
1) Files created/updated.
2) What each changed file does (new file purpose or delta for existing file).
3) Commands run.
4) M3 gate evidence with pass/fail for each M3 exit criterion in docs/plans/execution-plan.md.
5) Residual risks/blockers.
6) Update docs/plans/milestone-inventory.md for M3 using the existing table format.

Validation requirements:
- Run relevant checks (at minimum build + any new M3 validation script/checks introduced).
- Include one deterministic way to trigger startup failure for validation (for example query param or dev/test flag) and document exactly how to use it.
- If environment blocks execution, report ENV-BLOCKED (not FAIL) and provide exact local commands to run.

Return format:
- M3 status: PASS/FAIL/ENV-BLOCKED
- Gate checklist (item -> pass/fail/blocked + evidence)
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt to verify M3
```text
Run the M3 gate verification now and return a PASS/FAIL table with evidence.

Sequential command set for M3 regression:
- `npm run validate:m1`
- `npm run validate:m2`
- `npm run validate:m3`

For each gate item include:
- check name
- exact command or manual step used
- observed result
- pass/fail (or blocked)

M3 gate items to verify (from docs/plans/execution-plan.md + docs/specs/viewer-core-spec.md):
1) `/viewer` shows explicit loading state then ready state.
2) Default state is `3fly_cryst_lig`, baseline ON, refined OFF, maps hidden.
3) Camera baseline snapshot/target exists and `Reset view` is defined.
4) Resize preserves camera state.
5) Unmount/remount does not duplicate listeners.
6) Forced startup failure shows fallback message + recovery action and does not crash app.
7) Desktop fullscreen layout keeps controls panel fully visible with no page-level horizontal overflow/clipping.
8) Production build succeeds.

Validation command note:
- `npm run validate:m3` intentionally runs `npm run build` first via `prevalidate:m3`.
- Reason: `scripts/validate-m3.js` validates the compiled `dist` app, not source files directly.
- This pre-step may differ from milestone validators that only validate source-level or staged-asset outputs.

Required evidence to include:
- `git status --short`
- `git diff --name-only`
- file list changed for M3
- command output summary for each verification command
- local host-terminal output for `npm run validate:m1`, `npm run validate:m2`, and `npm run validate:m3` (authoritative gate evidence)
- exact failure-trigger method used for forced startup failure test
- residual risks/blockers + exact fix needed

If environment/tooling prevents checks:
- mark status as `ENV-BLOCKED` (not FAIL)
- provide exact local commands to run to complete verification

Return format:
- M3 status: PASS/FAIL/ENV-BLOCKED
- Gate checklist table (item | command/step | observed result | status)
- Files changed
- Commands run
- Risks/blockers and fixes
```

### Manual verification for M3
1) Run from repo root:
```bash
npm run validate:m3
```

Note:
- `validate:m3` runs `build` first by design (through `prevalidate:m3`) to ensure checks run against fresh `dist` output.

2) For manual UI inspection, run:
```bash
npm run serve
```
Then open `/viewer` and confirm lifecycle transition:
- loading indicator is visible first
- ready viewer state appears after init completes

3) Confirm default state contract on `/viewer`:
- selected ligand context is `3fly_cryst_lig`
- baseline pose is ON
- refined pose is OFF
- FragMaps are hidden by default

4) Confirm camera + resize contract:
- change camera orientation in viewer
- resize browser window
- camera context is preserved
- `Reset view` returns to defined baseline view

5) Confirm remount stability:
- navigate `/viewer` -> `/` -> `/viewer` multiple times
- no obvious duplicated listeners/handlers (for example duplicate reactions per single action)
- no uncaught runtime errors in browser console

6) Confirm fullscreen desktop layout fit:
- maximize browser window (desktop viewport)
- controls panel remains fully visible on the right (no clipping at viewport edge)
- page does not introduce horizontal scrolling

7) Confirm failure fallback contract:
- trigger forced startup failure using the implementation-provided method
- fallback message is shown
- recovery action works (`Retry` and/or `Back to Home`)
- app does not hard-crash

If all steps pass, M3 manual verification is complete.

### Prompt to remediate M3 rendering gap (real startup rendering)
```text
Remediate the M3 rendering gap only (do not start M4).

Context:
- M3 currently passes shell/lifecycle checks but still uses a stage scaffold placeholder instead of real molecular rendering.
- This conflicts with docs/specs/viewer-core-spec.md, which requires startup protein + default crystal ligand rendering and protein cartoon baseline representation.

Scope:
- M3 remediation only.
- Implement real NGL startup rendering for:
  - protein (PDB) from runtime manifest
  - default crystal ligand baseline pose (`3fly_cryst_lig`) from runtime manifest
- Preserve existing M3 lifecycle behavior:
  - loading -> ready transition
  - camera baseline/reset contract
  - resize camera preservation
  - unmount/remount listener hygiene
  - catastrophic startup fallback (`m3StageFail=1`) with recovery actions
- Keep M4+ out of scope (no ligand workflow UI, no FragMap controls/iso logic, no performance milestone work).

Required implementation changes:
1) Replace scaffold stage behavior in `src/viewer/nglStage.ts` with real NGL stage setup and component loading.
2) Ensure startup default visual baseline includes:
- protein cartoon representation
- default crystal ligand representation loaded and visible
3) Keep `ViewerPage` default-state contract unchanged:
- selected ligand `3fly_cryst_lig`
- baseline ON, refined OFF
- no FragMaps visible
4) Strengthen `scripts/validate-m3.js` so it fails unless real startup rendering is present.
- Do not rely on placeholder DOM text.
- Add deterministic assertions for loaded startup content (for example via controlled debug instrumentation exposed only for validation).
5) Update `docs/plans/milestone-inventory.md` M3 section to remove/resolve the known risk that says M3 lacks real rendering.

Validation requirements:
- Run:
  - `npm run validate:m1`
  - `npm run validate:m2`
  - `npm run validate:m3`
- Include command output summary and explicit pass/fail evidence for each M3 gate item.
- If blocked by environment/tooling, report `ENV-BLOCKED` with exact local commands to run.

Required deliverables:
1) Files created/updated.
2) Exact behavior changes per file.
3) Commands run + outcomes.
4) M3 gate checklist with evidence (including real startup rendering checks).
5) Residual risks/blockers.
6) Updated M3 documentation in `docs/plans/milestone-inventory.md` aligned with implemented behavior.

Return format:
- M3 remediation status: PASS/FAIL/ENV-BLOCKED
- Gate checklist (item | command/step | observed result | status)
- Files changed
- Command outputs summary
- Residual risks/blockers
```

## M4 - Ligand Workflow (Phased: M4A, M4B, M4C Deferred)

### Prompt to assign M4A
```text
Use a two-step assignment flow for M4A.

Prompt A (Design Preview Gate only; no implementation):
- Milestone target: M4A only.
- Mode: DESIGN PREVIEW ONLY (no code edits).
- Create/refresh preview packet under `docs/screenshots/Design_previews/m4-ligand-workflow/`.
- Provide desktop previews only for default, loading, empty, error, success states for single-ligand core workflow.
- Stop and wait for explicit approval token: `APPROVED UI PREVIEW`.
- If approval is not provided, return `BLOCKED-DESIGN`.
- Do not run milestone validation scripts in this phase.

Prompt B (Post-approval implementation only):
- Milestone target: M4A only.
- Scope: `3fly_cryst_lig` only.
- Implement pose checkboxes, four pose states, both-visible legend, zoom action, and per-pose failure isolation.
- Keep updates in-place (no route change/full reload).
- Do not implement featured switching or searchable full-ligand selector in this phase.
- Keep M5+ work out of scope.

Required deliverables:
1) Prompt A deliverables (preview-only):
- files created/updated
- preview checklist coverage
- open UI questions
- approval state (`BLOCKED-DESIGN` until token is present)
2) Prompt B deliverables (post-approval implementation):
- files created/updated
- behavior deltas per file
- commands run
- M4A gate evidence with pass/fail per acceptance check
- residual risks/blockers
- update `docs/plans/milestone-inventory.md` (M4A section)

Return format:
- M4A status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt to verify M4A
```text
Use this only after Prompt B implementation starts.

If work is still in Prompt A (DESIGN PREVIEW ONLY), do not run validation scripts.
Return:
- M4A status: BLOCKED-DESIGN
- preview checklist coverage
- missing approval token (`APPROVED UI PREVIEW`)

If Prompt B implementation has started, run M4A gate verification and return a PASS/FAIL table with evidence.

Sequential regression commands:
- `npm run validate:m1`
- `npm run validate:m2`
- `npm run validate:m3`
- `<M4A validator command if added>`

M4A checks:
1) Default ligand is `3fly_cryst_lig` (`Crystal Ligand`).
2) Pose controls support baseline-only/refined-only/both-visible/both-unchecked.
3) Both-unchecked is represented by unchecked pose toggles (helper guidance optional).
4) Both-visible shows legend and differentiation.
5) Zoom only on explicit action.
6) Per-pose failure isolates to affected pose and shows non-blocking toast.
7) No M1-M3 regressions.

Return format:
- M4A status: PASS/FAIL/ENV-BLOCKED
- Gate checklist table
- Files changed
- Commands run
- Risks/blockers and fixes
```

### Prompt to assign M4B
```text
Use a two-step assignment flow for M4B.

Prompt A (Design Preview Gate only; no implementation):
- Milestone target: M4B only.
- Mode: DESIGN PREVIEW ONLY (no code edits).
- Scope: featured ligands only (fixed subset), preserving M4A interaction patterns.
- Create/refresh preview packet under `docs/screenshots/Design_previews/m4-ligand-workflow/` for M4B additions.
- Provide desktop previews for featured-ligand switching states: default, switch-loading, switch-success, per-ligand failure, and fallback/disabled state.
- Stop and wait for explicit approval token: `APPROVED UI PREVIEW`.
- If approval is not provided, return `BLOCKED-DESIGN`.
- Do not run milestone validation scripts in this phase.

Prompt B (Post-approval implementation only):
- Implement only M4B from docs/plans/execution-plan.md.

Scope:
- Expand from M4A to featured ligands only (fixed subset).
- Add/enable featured quick-pick switching.
- Preserve M4A behavior contracts after each ligand switch.
- Do not implement searchable full-ligand selector or full-list ordering/search in this phase (deferred to M4C).

Required deliverables:
1) Prompt A deliverables (preview-only):
- files created/updated
- preview checklist coverage
- open UI questions
- approval state (`BLOCKED-DESIGN` until token is present)
2) Prompt B deliverables (post-approval implementation):
- files created/updated
- behavior deltas per file
- commands run
- M4B gate evidence with pass/fail per acceptance checks
- residual risks/blockers
- update docs/plans/milestone-inventory.md (M4B section)

Return format:
- M4B status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt to verify M4B
```text
Use this only after Prompt B implementation starts.

If work is still in Prompt A (DESIGN PREVIEW ONLY), do not run validation scripts.
Return:
- M4B status: BLOCKED-DESIGN
- preview checklist coverage
- missing approval token (`APPROVED UI PREVIEW`)

If Prompt B implementation has started, run M4B gate verification and return a PASS/FAIL table with evidence.

Sequential regression commands:
- `npm run validate:m1`
- `npm run validate:m2`
- `npm run validate:m3`
- `<M4A validator command if added>`
- `<M4B validator command if added>`

M4B checks:
1) Featured quick picks include `Crystal Ligand` and canonical featured IDs.
2) Switching among featured ligands is in-place (no reload).
3) Camera is preserved on ligand switch.
4) M4A checks remain passing after ligand changes.
5) No M1-M3 regressions.

Return format:
- M4B status: PASS/FAIL/ENV-BLOCKED
- Gate checklist table
- Files changed
- Commands run
- Risks/blockers and fixes
```

### Deferred note for M4C
- `M4C` (full ligand list + searchable selector + deterministic ordering + `No ligands found`) is deferred stretch scope and not required for M5-M8 progression unless re-promoted.

## M5 - FragMap Controls (Sliced: M5.1..M5.6)

### M5 Preview Packet Contract (locked)
- Packet path: `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Packet structure:
  - One front page (`README.md` and/or index page).
  - One preview page per slice (`M5.1`, `M5.2`, `M5.3`, `M5.4`, `M5.5`, `M5.6`).
- Per-slice Prompt A can use a single multi-panel SVG page as long as it covers default/loading/empty/error/success for that slice.
- Prompt B for a slice cannot begin until that slice has explicit `APPROVED UI PREVIEW`.

### Prompt A to assign M5.1 (Design Preview only)
```text
Implement Prompt A only for M5.1 from docs/plans/execution-plan.md.

Scope:
- M5.1 design-preview only.
- Produce/update only M5.1 preview artifacts in `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Include/update packet front page plus M5.1 page.
- M5.1 scope: FragMap panel shell only (Primary/Advanced sections, canonical labels/colors, default all-hidden state).
- Do not implement runtime map loading/toggling/iso behavior in Prompt A.

Required deliverables:
1) files created/updated
2) preview checklist coverage (default/loading/empty/error/success on M5.1 page)
3) open UI questions
4) approval state (`BLOCKED-DESIGN` until `APPROVED UI PREVIEW`)

Return format:
- M5.1 status: BLOCKED-DESIGN/PASS
- Gate checklist
- Files changed
- Residual risks/blockers
```

### Prompt B to assign M5.1 (Post-approval implementation only)
```text
Implement Prompt B only for M5.1 from docs/plans/execution-plan.md.

Precondition:
- M5.1 Prompt A is approved with explicit `APPROVED UI PREVIEW`.

Scope:
- M5.1 only: FragMap panel shell.
- Include right-panel two-tab framework (`FragMap` + `Ligand`) with `FragMap` active by default and `Ligand` preserving existing M4B ligand controls.
- Include Primary/Advanced sections with canonical labels/colors and all-hidden defaults.
- No runtime map load/toggle engine, no advanced behavior wiring, no iso controls, no reliability hardening in this slice.
- Preserve M1-M4B behavior contracts.

Required deliverables:
1) files created/updated
2) behavior deltas per file
3) commands run
4) M5.1 gate evidence with pass/fail per acceptance checks
5) residual risks/blockers
6) update docs/plans/milestone-inventory.md (M5.1 section)

Return format:
- M5.1 status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt A to assign M5.2 (Design Preview only)
```text
Implement Prompt A only for M5.2 from docs/plans/execution-plan.md.

Scope:
- M5.2 design-preview only.
- Produce/update only M5.2 preview artifacts in `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Include/update packet front page plus M5.2 page.
- M5.2 scope: Primary-3 visibility engine only (toggle, lazy first load, cache reuse, camera preserved).
- Do not implement M5.3+ behavior in this slice preview.

Required deliverables:
1) files created/updated
2) preview checklist coverage (default/loading/empty/error/success on M5.2 page)
3) open UI questions
4) approval state (`BLOCKED-DESIGN` until `APPROVED UI PREVIEW`)

Return format:
- M5.2 status: BLOCKED-DESIGN/PASS
- Gate checklist
- Files changed
- Residual risks/blockers
```

### Prompt B to assign M5.2 (Post-approval implementation only)
```text
Implement Prompt B only for M5.2 from docs/plans/execution-plan.md.

Precondition:
- M5.2 Prompt A is approved with explicit `APPROVED UI PREVIEW`.

Scope:
- M5.2 only: Primary-3 visibility engine.
- Add in-place toggles, lazy first load, cache reuse, and camera preservation for Primary-3 rows.
- Do not implement Advanced/Exclusion behavior, per-map iso controls, or reliability hardening in this slice.
- Preserve M5.1 contracts and M1-M4B behavior.

Required deliverables:
1) files created/updated
2) behavior deltas per file
3) commands run
4) M5.2 gate evidence with pass/fail per acceptance checks
5) residual risks/blockers
6) update docs/plans/milestone-inventory.md (M5.2 section)

Return format:
- M5.2 status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt A to assign M5.3 (Design Preview only)
```text
Implement Prompt A only for M5.3 from docs/plans/execution-plan.md.

Scope:
- M5.3 design-preview only.
- Produce/update only M5.3 preview artifacts in `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Include/update packet front page plus M5.3 page.
- M5.3 scope: Advanced rows + Exclusion map fixed behavior.
- Show Exclusion map visibility-toggleable with fixed style and disabled iso.

Required deliverables:
1) files created/updated
2) preview checklist coverage (default/loading/empty/error/success on M5.3 page)
3) open UI questions
4) approval state (`BLOCKED-DESIGN` until `APPROVED UI PREVIEW`)

Return format:
- M5.3 status: BLOCKED-DESIGN/PASS
- Gate checklist
- Files changed
- Residual risks/blockers
```

### Prompt B to assign M5.3 (Post-approval implementation only)
```text
Implement Prompt B only for M5.3 from docs/plans/execution-plan.md.

Precondition:
- M5.3 Prompt A is approved with explicit `APPROVED UI PREVIEW`.

Scope:
- M5.3 only: Advanced rows + Exclusion map behavior.
- Implement Advanced row visibility flow and Exclusion map constraints (visibility-toggleable, fixed style, no editable iso).
- Do not implement per-map iso controls for adjustable maps or reliability hardening in this slice.
- Preserve M5.1-M5.2 contracts and M1-M4B behavior.

Required deliverables:
1) files created/updated
2) behavior deltas per file
3) commands run
4) M5.3 gate evidence with pass/fail per acceptance checks
5) residual risks/blockers
6) update docs/plans/milestone-inventory.md (M5.3 section)

Return format:
- M5.3 status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt A to assign M5.4 (Design Preview only)
```text
Implement Prompt A only for M5.4 from docs/plans/execution-plan.md.

Scope:
- M5.4 design-preview only.
- Produce/update only M5.4 preview artifacts in `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Include/update packet front page plus M5.4 page.
- M5.4 scope: per-map iso controls only.

Required deliverables:
1) files created/updated
2) preview checklist coverage (default/loading/empty/error/success on M5.4 page)
3) open UI questions
4) approval state (`BLOCKED-DESIGN` until `APPROVED UI PREVIEW`)

Return format:
- M5.4 status: BLOCKED-DESIGN/PASS
- Gate checklist
- Files changed
- Residual risks/blockers
```

### Prompt B to assign M5.4 (Post-approval implementation only)
```text
Implement Prompt B only for M5.4 from docs/plans/execution-plan.md.

Precondition:
- M5.4 Prompt A is approved with explicit `APPROVED UI PREVIEW`.

Scope:
- M5.4 only: per-map iso controls.
- Implement iso numeric contract (`step`, `min`, `max`, precision, clamp/revert) for adjustable rows.
- Preserve Exclusion map non-editable iso rule.
- Preserve M5.1-M5.3 contracts and M1-M4B behavior.

Required deliverables:
1) files created/updated
2) behavior deltas per file
3) commands run
4) M5.4 gate evidence with pass/fail per acceptance checks
5) residual risks/blockers
6) update docs/plans/milestone-inventory.md (M5.4 section)

Return format:
- M5.4 status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt A to assign M5.5 (Design Preview only)
```text
Implement Prompt A only for M5.5 from docs/plans/execution-plan.md.

Scope:
- M5.5 design-preview only.
- Produce/update only M5.5 preview artifacts in `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Include/update packet front page plus M5.5 page.
- M5.5 scope: bulk actions only (`Hide all`, `Reset defaults`, `Reset view`).

Required deliverables:
1) files created/updated
2) preview checklist coverage (default/loading/empty/error/success on M5.5 page)
3) open UI questions
4) approval state (`BLOCKED-DESIGN` until `APPROVED UI PREVIEW`)

Return format:
- M5.5 status: BLOCKED-DESIGN/PASS
- Gate checklist
- Files changed
- Residual risks/blockers
```

### Prompt B to assign M5.5 (Post-approval implementation only)
```text
Implement Prompt B only for M5.5 from docs/plans/execution-plan.md.

Precondition:
- M5.5 Prompt A is approved with explicit `APPROVED UI PREVIEW`.

Scope:
- M5.5 only: bulk actions.
- Implement `Hide all`, `Reset defaults`, and `Reset view` to match spec behavior.
- Preserve M5.1-M5.4 contracts and M1-M4B behavior.

Required deliverables:
1) files created/updated
2) behavior deltas per file
3) commands run
4) M5.5 gate evidence with pass/fail per acceptance checks
5) residual risks/blockers
6) update docs/plans/milestone-inventory.md (M5.5 section)

Return format:
- M5.5 status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt A to assign M5.6 (Design Preview only)
```text
Implement Prompt A only for M5.6 from docs/plans/execution-plan.md.

Scope:
- M5.6 design-preview only.
- Produce/update only M5.6 preview artifacts in `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Include/update packet front page plus M5.6 page.
- M5.6 scope: reliability hardening UX (row-level failure isolation, retry affordance, async guard outcomes) and final M5 gate evidence views.

Required deliverables:
1) files created/updated
2) preview checklist coverage (default/loading/empty/error/success on M5.6 page)
3) open UI questions
4) approval state (`BLOCKED-DESIGN` until `APPROVED UI PREVIEW`)

Return format:
- M5.6 status: BLOCKED-DESIGN/PASS
- Gate checklist
- Files changed
- Residual risks/blockers
```

### Prompt B to assign M5.6 (Post-approval implementation only)
```text
Implement Prompt B only for M5.6 from docs/plans/execution-plan.md.

Precondition:
- M5.6 Prompt A is approved with explicit `APPROVED UI PREVIEW`.

Scope:
- M5.6 only: reliability hardening and final M5 gate closure.
- Implement row-level failure isolation, retry path, and async race guards.
- Keep unaffected rows stable on failures.
- Preserve M5.1-M5.5 contracts and M1-M4B behavior.
- Add/enable `validate:m5` and run sequential regression through M5.

Required deliverables:
1) files created/updated
2) behavior deltas per file
3) commands run
4) M5.6/final M5 gate evidence with pass/fail per acceptance checks
5) residual risks/blockers
6) update docs/plans/milestone-inventory.md (M5.6 and M5 tracker)

Return format:
- M5.6 status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Final M5 status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt to verify M5 slice (use for M5.1..M5.6)
```text
Use this only after Prompt B implementation starts for the target M5 slice.

If work is still in Prompt A (DESIGN PREVIEW ONLY), do not run validation scripts.
Return:
- <slice> status: BLOCKED-DESIGN
- preview checklist coverage
- missing approval token (`APPROVED UI PREVIEW`)

If Prompt B implementation has started, run gate verification and return a PASS/FAIL table with evidence.

Sequential regression commands:
- `npm run validate:m1`
- `npm run validate:m2`
- `npm run validate:m3`
- `npm run validate:m4a`
- `npm run validate:m4b`
- `<slice-specific validator command if added>`
- `npm run validate:m5` (required at M5.6/final gate)

Return format:
- <slice> status: PASS/FAIL/ENV-BLOCKED/BLOCKED-DESIGN
- Gate checklist table
- Files changed
- Commands run
- Risks/blockers and fixes
```

### Manual verification for M5
- Execute one slice at a time (`M5.1` then `M5.2` ... `M5.6`).
- For each slice:
  - Finish Prompt A preview and collect explicit `APPROVED UI PREVIEW`.
  - Run Prompt B implementation only for that slice scope.
  - Run sequential regression through the highest available validator.
  - Update `docs/plans/milestone-inventory.md` for that slice before starting the next slice.

## M6 - Overview Page Narrative + CTA + External Links

### Prompt to assign M6
```text
TODO: Add M6 implementation prompt.
```

### Prompt to verify M6
```text
TODO: Add M6 verification prompt.
```

### Manual verification for M6
- TODO

## M7 - Performance Instrumentation + AC Validation Evidence

### Prompt to assign M7
```text
TODO: Add M7 implementation prompt.
```

### Prompt to verify M7
```text
TODO: Add M7 verification prompt.
```

### Manual verification for M7
- TODO

## M8 - Hardening + Final Regression + README/Deploy Readiness

### Prompt to assign M8
```text
Add M8 implementation prompt when entering final hardening.
```

### Prompt to verify M8
```text
Add M8 verification prompt when final regression scope is fixed.
```

### Manual verification for M8
- Define final manual checklist at M8 start.
