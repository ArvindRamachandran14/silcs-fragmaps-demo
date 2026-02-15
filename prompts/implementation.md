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

## M4 - Ligand Workflow

### Prompt to assign M4
```text
TODO: Add M4 implementation prompt.
```

### Prompt to verify M4
```text
TODO: Add M4 verification prompt.
```

### Manual verification for M4
- TODO

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
