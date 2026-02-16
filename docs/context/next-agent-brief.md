# Next Agent Brief

Last updated: 2026-02-16 (M5 slice renumber update to M5.6)

## Current Milestone Target
- Active target: `M5.1 FragMap Panel Shell` (M1-M4B validated complete; M5 now runs as slices `M5.1`..`M5.6`).

## Mandatory Execution Policy
- Use local host-terminal outputs as authoritative gate evidence.
- If tooling/sandbox prevents a required command, record `ENV-BLOCKED` (not `FAIL`) and include exact rerun command.
- After implementing milestone `Mn`, run sequential regression from `validate:m1` through `validate:mn`.

## Scope Policy (Locked)
- Required forward scope:
  - `M4A`: single-ligand core (`3fly_cryst_lig`) with four pose states, zoom, optional both-unchecked helper guidance, and per-pose error isolation.
  - `M4B`: featured-ligand switching only (fixed subset).
- Deferred scope:
  - `M4C`: full ligand list + searchable selector + deterministic ordering + `No ligands found`.
- Progression rule:
  - `M4C` is not a blocker for `M5`, `M6`, `M7`, or `M8` unless explicitly re-promoted.
- M5 slicing rule:
  - Execute M5 as `M5.1` -> `M5.2` -> `M5.3` -> `M5.4` -> `M5.5` -> `M5.6`.
  - Run Prompt A and Prompt B per slice.
  - Prompt B for a slice cannot start without that slice's `APPROVED UI PREVIEW`.
  - Preview packet path/structure is locked to `docs/screenshots/Design_previews/m5-fragmap-controls/` with one front page plus one page per slice.

## Priority Tasks (ordered)
1. Run `M5.1` Prompt A and obtain explicit `APPROVED UI PREVIEW`.
2. Implement `M5.1` Prompt B only (panel shell; no runtime map engine yet), then run sequential regression.
3. Repeat Prompt A/B loop for `M5.2` through `M5.6`, one slice at a time.
4. Add/enable `validate:m5` during `M5.6` and run full sequential regression through `validate:m5`.
5. Keep `M4C` documented as deferred stretch scope.

## Exact Commands To Run Next
- `npm run build`
  - Current signal: PASS.
- `npm run validate:m1`
  - Current signal: PASS after toast pointer-interception fix in `src/pages/ViewerPage.vue`.
- `npm run validate:m2`
  - Current signal: PASS.
- `npm run validate:m3`
  - Current signal: PASS.
- `npm run validate:m4a`
  - Current signal: PASS.
- `npm run validate:m4b`
  - Current signal: PASS.

## Stop/Go Criteria For M5
- Stop if the active slice Design Preview Gate is not approved (`BLOCKED-DESIGN`).
- Stop if any M1-M4B validator regresses.
- Stop if implementation crosses active slice scope boundaries.
- Go from `M5.6` to `M6` only after map controls are stable and `validate:m5` is green.

## Recent Hotfix Note
- Post-M4B manual QA camera drift issues (featured-switch and reset behavior) were addressed in `src/viewer/nglStage.ts`; current regression sequence (`validate:m1`..`validate:m4b`) is green after the second-pass camera fix.
- Follow-up fix removed transform replay sign inversion during featured switch restore (`viewerControls.center` after `orient`) and resynced live camera snapshots post-switch/resize; targeted runtime smoke sequence now keeps viewport centered across default reset and repeated featured switches.

## Known Divergences To Resolve Before M5
- Overview page content divergence (`docs/specs/overview-page-spec.md`) remains open.
- FragMap controls are unimplemented (`docs/specs/fragmap-controls-spec.md`).
- Performance evidence framework (`docs/specs/performance-and-validation-spec.md`) is unimplemented.
- Execution-plan Playwright command contract (`test:e2e:*`, `test:ac:*`, `playwright.config.ts`, `tests/e2e/*`) is not yet implemented.

## Risks and Escalation Rules
- Risk: async pose loading races during rapid toggles.
  - Mitigation: per-ligand request-id/single-flight guards.
- Risk: reintroducing startup instability from prior big-bang M4 attempt.
  - Mitigation: incremental commits and validator checks after each behavior slice.
- Risk: validator noise when milestone scripts are run concurrently.
  - Mitigation: run regression commands sequentially in milestone order (`m1` -> `mN`) for authoritative evidence.
- Escalate if:
  - manifest contract cannot express required featured-ligand scope,
  - NGL representation layering blocks both-visible differentiation,
  - validator instability returns in otherwise unchanged baseline routes.

## Session Exit Requirements
1. Append command outcomes and evidence paths to `docs/context/current-state.md` validation ledger.
2. Log any architecture or behavior decision in `docs/context/decision-log.md`.
3. Refresh this brief with the exact next unresolved `M5.x` slice task.

## Immediate Next Concrete Step
- Start `M5.1` Prompt-A design preview page (default/loading/empty/error/success) and update the M5 packet front page under `docs/screenshots/Design_previews/m5-fragmap-controls/` before any `M5.1` implementation edits.
