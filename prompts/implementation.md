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

## M4 - Ligand Workflow

### Prompt to assign M4
```text
Implement only M4 from docs/plans/execution-plan.md.

Scope:
- M4 only: ligand workflow (featured + searchable ligand selection, pose visibility states, zoom action, and ligand/pose error handling).
- Follow docs/specs/ligand-workflow-spec.md and keep architecture aligned with docs/plans/technical-plan.md.
- Build on existing M1-M3 outputs only.
- Create/complete M4-focused modules (as needed), such as:
  - src/components/LigandControls.vue
  - ligand state/store actions/getters
  - ligand pose representation management in viewer modules (for example src/viewer/reps.ts)

M4 required behavior:
1) Right-panel ligand section contains:
- featured quick picks
- searchable full-ligand selector
- baseline/refined checkboxes
- zoom action
2) Supports all four pose states:
- baseline-only
- refined-only
- both-visible
- both-unchecked
3) Both-unchecked shows persistent empty-state guidance with recovery actions:
- Show Baseline
- Show Refined
- Show Both
4) Search behavior:
- case-insensitive substring matching on label and ligand ID
- deterministic ordering
- explicit `No ligands found` state
5) Ligand switching and pose state changes are in-place (no route change, no full page reload).
6) Camera is preserved on ligand switch; zoom occurs only when user invokes `Zoom`.
7) Pose load failure path:
- disable only the affected pose control
- show non-blocking toast with actionable error context
- keep app responsive (no app crash)

Do NOT do:
- M5+ behavior (no FragMap controls/iso logic, no overview-page narrative work, no AC evidence instrumentation/hardening work).

Required deliverables:
1) Files created/updated.
2) What each changed file does (new file purpose or delta for existing file).
3) Commands run.
4) M4 gate evidence with pass/fail for each M4 exit criterion in docs/plans/execution-plan.md and docs/specs/ligand-workflow-spec.md.
5) Residual risks/blockers.
6) Update docs/plans/milestone-inventory.md for M4 using the existing table format.

Validation requirements:
- Run relevant checks (at minimum build + any new M4 validation script/checks introduced).
- Include one deterministic way to trigger per-pose load failure for validation and document exactly how to use it.
- If environment blocks execution, report ENV-BLOCKED (not FAIL) and provide exact local commands to run.

Return format:
- M4 status: PASS/FAIL/ENV-BLOCKED
- Gate checklist (item -> pass/fail/blocked + evidence)
- Files changed
- Command outputs summary
- Residual risks/blockers
```

### Prompt to verify M4
```text
Run the M4 gate verification now and return a PASS/FAIL table with evidence.

Sequential command set for M4 regression:
- `npm run validate:m1`
- `npm run validate:m2`
- `npm run validate:m3`
- `npm run validate:m4`

For each gate item include:
- check name
- exact command or manual step used
- observed result
- pass/fail (or blocked)

M4 gate items to verify (from docs/plans/execution-plan.md + docs/specs/ligand-workflow-spec.md):
1) Ligand section contains quick picks, searchable selector, pose checkboxes, and zoom action.
2) Default ligand on first viewer-ready state is `3fly_cryst_lig` shown as `Crystal Ligand`.
3) Users can select ligands from featured quick picks and full searchable list (full manifest scope).
4) Pose checkboxes support all four states: baseline-only, refined-only, both-visible, both-unchecked.
5) Both-unchecked shows persistent empty-state guidance with recovery actions (`Show Baseline`, `Show Refined`, `Show Both`).
6) Both-visible applies baseline/refined differentiation and shows legend.
7) Ligand switching and pose updates happen in-place with no full page reload.
8) Camera is preserved on ligand switch; zoom changes view only when user invokes `Zoom`.
9) Per-pose load failure disables only affected pose control and shows non-blocking toast.
10) Runtime ligand manifest scope/order checks pass:
- includes `3fly_cryst_lig` plus all baseline IDs from `from_silcsbio/ligands/*.sdf`
- empty-query ordering is deterministic (`Crystal Ligand` first, then sorted by label with ID tie-break)

Required evidence to include:
- `git status --short`
- `git diff --name-only`
- file list changed for M4
- command output summary for each verification command
- local host-terminal output for `npm run validate:m1`, `npm run validate:m2`, `npm run validate:m3`, and `npm run validate:m4` (authoritative gate evidence)
- exact failure-trigger method used for per-pose load failure test
- residual risks/blockers + exact fix needed

If environment/tooling prevents checks:
- mark status as `ENV-BLOCKED` (not FAIL)
- provide exact local commands to run to complete verification

Return format:
- M4 status: PASS/FAIL/ENV-BLOCKED
- Gate checklist table (item | command/step | observed result | status)
- Files changed
- Commands run
- Risks/blockers and fixes
```

### Manual verification for M4
1) Run from repo root:
```bash
npm run validate:m4
```

2) For manual UI inspection, run:
```bash
npm run serve
```
Then open `/viewer`.

3) Confirm ligand controls structure:
- featured quick-pick chips are visible and include `Crystal Ligand` + canonical featured ligands
- searchable ligand selector is present
- pose visibility checkboxes (`Baseline`, `Refined`) are present
- `Zoom` action is present

4) Confirm default ligand + default pose state:
- selected ligand is `Crystal Ligand` (`3fly_cryst_lig`)
- baseline is checked
- refined is unchecked

5) Confirm full ligand selection behavior:
- select one ligand from featured chips
- select one non-featured ligand from searchable dropdown
- verify updates happen in place (no route change/full reload)
- verify camera orientation is preserved across ligand switches

6) Confirm search behavior:
- case-insensitive query matches label and ligand ID
- with empty query, order is deterministic (`Crystal Ligand` first, then sorted entries)
- unmatched query shows explicit `No ligands found` state

7) Confirm all four pose visibility states:
- baseline-only
- refined-only
- both-visible (and legend shown)
- both-unchecked

8) Confirm both-unchecked empty-state contract:
- persistent guidance is shown in ligand section
- recovery actions are visible: `Show Baseline`, `Show Refined`, `Show Both`
- clicking each recovery action re-enables the expected pose visibility state

9) Confirm zoom behavior:
- ligand switching alone does not auto-zoom
- clicking `Zoom` focuses the selected ligand

10) Confirm per-pose failure handling:
- trigger deterministic per-pose load failure using the implementation-provided method
- only affected pose control is disabled
- non-blocking toast is shown
- app remains responsive and does not crash

If all steps pass, M4 manual verification is complete.

## M5 - FragMap Controls

### Prompt to assign M5
```text
TODO: Add M5 implementation prompt.
```

### Prompt to verify M5
```text
TODO: Add M5 verification prompt.
```

### Manual verification for M5
- TODO

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
