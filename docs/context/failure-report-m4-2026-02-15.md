# Failure Report - M4 Regression Window (2026-02-15)

## Scope
- Window focus: regression-fix-only pass to restore baseline validator behavior before continuing M4.
- Intended command order: `validate:m1` -> `validate:m2` -> `validate:m3` -> `validate:m4`.

## Failing Commands
1. `npm run validate:m1`
2. `npm run validate:m3`
3. `npm run validate:m4` (hung run; process terminated)

## Exact Observed Errors
- `validate:m1`:
  - `M1 validation failed: page.click: Timeout 30000ms exceeded.`
  - failing locator: `[data-test-id="nav-viewer"]`
- `validate:m3`:
  - `M3 validation failed: page.waitForSelector: Timeout 15000ms exceeded.`
  - failing selector: `[data-test-id="viewer-loading-state"]`
- `validate:m4`:
  - command did not return within expected window under local harness; process was terminated manually.

## Suspected Root Cause (file/path level)
- `src/App.vue`:
  - top-nav interaction path remains unstable under Playwright click flow (`nav-viewer` timeout), indicating routing click-handling or page-interactivity issue.
- `src/pages/ViewerPage.vue`:
  - viewer startup sequence does not reliably surface expected loading/ready states under validator harness timing.
- `src/viewer/nglStage.ts`:
  - startup path complexity increased during M4 changes (protein + ligand stage orchestration and async state transitions), likely interacting with the M3 loading-state expectation.

## Attempted Fixes
- Patched `src/App.vue` nav buttons from `to="/..."` to explicit router push handlers (`@click="$router.push(...)"`).
- Added `await this.$nextTick()` immediately after `viewer/setLoading` in `src/pages/ViewerPage.vue` to ensure loading state render opportunity.
- Re-ran validators after each fix attempt in strict order where possible.
- Cleared stale Playwright/Chromium processes multiple times to eliminate harness contamination.

## Unresolved Blockers
- Baseline validators remain red:
  - `validate:m1` still fails at `nav-viewer` click timeout.
  - `validate:m3` still fails waiting for loading-state selector.
- `validate:m4` run stability is currently unreliable (hung run observed), so M4 gate evidence is incomplete.
- Until baseline validators are green, M4 completion cannot be claimed.

## Next Action
- Perform targeted isolation on `/ -> /viewer` interaction and viewer startup lifecycle with bounded diagnostics, then rerun full strict chain:
  - `npm run validate:m1`
  - `npm run validate:m2`
  - `npm run validate:m3`
  - `npm run validate:m4`
