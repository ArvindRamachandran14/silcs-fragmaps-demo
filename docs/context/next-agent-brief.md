# Next Agent Brief

Last updated: 2026-02-16 (M5.2a Prompt-B complete; next is M5.3 Prompt A)

## Current Milestone Target
- Active target: `M5.3 Advanced + Exclusion Behavior` Prompt A (M1-M4B and M5.1-M5.2a validated complete; M5 continues as slices `M5.1`, `M5.2`, `M5.2a`, `M5.3`, `M5.4`, `M5.5`, `M5.6`).
- Baseline branch state at takeover: `M5.2a` Prompt-B implementation and validator wiring are complete in the working tree with green sequential regression evidence through `validate:m5.2a`.
- M5.2 Prompt-A packet is approved, and M5.2 Prompt-B runtime implementation is complete with reviewer-locked behavior set (B/A/B).

## Takeover Checkpoint
- Required startup read order completed: `AGENTS.md` -> `docs/context/current-state.md` -> `docs/context/next-agent-brief.md` -> `docs/context/decision-log.md` -> `docs/plans/execution-plan.md`.
- Milestone alignment confirmed against execution plan Section 3.1: `M5.1`, `M5.2`, and `M5.2a` Prompt B are complete, and slice ordering remains `M5.1` -> `M5.2` -> `M5.2a` -> `M5.3` -> `M5.4` -> `M5.5` -> `M5.6`.

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
  - Execute M5 as `M5.1` -> `M5.2` -> `M5.2a` -> `M5.3` -> `M5.4` -> `M5.5` -> `M5.6`.
  - Run Prompt A and Prompt B per slice.
  - Prompt B for a slice cannot start without that slice's `APPROVED UI PREVIEW`.
  - Preview packet path/structure is locked to `docs/screenshots/Design_previews/m5-fragmap-controls/` with one front page plus one page per slice.

## Priority Tasks (ordered)
1. Execute `M5.3` Prompt A (design preview only) and update the M5 packet for Advanced rows + Exclusion behavior.
2. Obtain explicit `APPROVED UI PREVIEW` for `M5.3`, then implement `M5.3` Prompt B only within slice scope.
3. Add/enable `validate:m5` during `M5.6` and run full sequential regression through `validate:m5`.
4. Keep `M4C` documented as deferred stretch scope.

## M5.1 Implementation Status
- `M5.1` Prompt B is implemented in code:
  - `src/components/ControlsPanel.vue`: two-tab framework (`FragMap` default active, `Ligand` secondary), FragMap shell action row + Primary/Advanced rows (all-hidden defaults), ligand controls preserved under `Ligand`.
  - M5.1 cleanup: visible right-panel context/debug blocks were removed from the user UI (`Viewer Context`, lower `Reset view`, camera contract/snapshot blocks) while preserving hidden diagnostics selectors for validator compatibility.
  - `src/pages/ViewerPage.vue`: canonical FragMap shell row data passed into controls panel (manifest-backed with fallback constants).
- M4 validators were updated for deterministic tabbed UI checks:
  - `scripts/validate-m4a.js`, `scripts/validate-m4b.js`.
- Gate evidence: `npm run validate:m1` (PASS on rerun after known intermittent first-run fail), `npm run validate:m2` PASS, `npm run validate:m3` PASS, `npm run validate:m4a` PASS, `npm run validate:m4b` PASS, targeted M5.1 shell check PASS.

## M5.2 Implementation Status
- `M5.2` Prompt A approved with explicit in-thread `APPROVED UI PREVIEW`.
- `M5.2` Prompt B is implemented in code:
  - `src/components/ControlsPanel.vue`: Primary-3 runtime toggles enabled, row status/error text shown, loading-lock disable behavior applied, Advanced rows kept disabled.
  - `src/pages/ViewerPage.vue`: Primary-3 toggle orchestration added (lazy first load, cache reuse status, row disable-on-failure, visible-map synchronization).
  - `src/viewer/nglStage.ts`: FragMap visibility API added with lazy load/cache, camera-preserving updates, and deterministic query hooks (`m5FailMap`, `m5MapLoadMs`) for validation.
  - `src/store/modules/viewer.ts`: `setVisibleFragMapIds` mutation added.
  - `scripts/validate-m5-2.js`: new M5.2 validator; `scripts/validate-m5-1.js` adjusted for post-M5.2 shell expectations.
- Gate evidence: `npm run build` PASS, `npm run validate:m1` FAIL then PASS on rerun, `npm run validate:m2` PASS, `npm run validate:m3` PASS, `npm run validate:m4a` PASS, `npm run validate:m4b` PASS, `npm run validate:m5.1` PASS, `npm run validate:m5.2` PASS (first sandboxed attempt `ENV-BLOCKED`; unsandboxed rerun passed after validator timing fix).
- Fresh rerun note (same day): full unsandboxed `bash scripts/run_checks.sh` rerun showed transient `viewer-ready-state` timeout noise in `validate:m4b`/`validate:m5.2`; both passed on immediate sequential rerun (`npm run validate:m4b`, `npm run validate:m5.2`). Do not parallelize validator reruns to avoid port collisions.

## M5.2a Design Contract Note
- Rendering direction is now docs-locked before `M5.2a` implementation:
  - FragMaps use triangulated wireframe isosurface rendering (polygon edges visible).
  - `Exclusion Map` follows the same wireframe rendering direction with fixed gray styling.
  - `Exclusion Map` remains iso-disabled/non-editable.
- Prompt-A preview artifact is now produced:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2a-wireframe-rendering-states.svg` (single multi-panel default/loading/empty/error/success page).
- Prompt-B implementation status:
  - `src/viewer/nglStage.ts`: wireframe surface style applied for FragMaps with fixed-gray Exclusion-map enforcement.
  - `scripts/validate-m5-2a.js`, `package.json`, and `scripts/run_checks.sh`: new M5.2a command contract and gate coverage.
- Related docs were synchronized in this window: spec, technical plan, execution plan, milestone inventory, implementation prompts, and M5 preview packet docs.

## Exact Commands To Run Next
- `npm run build`
  - Current signal: PASS.
- `npm run validate:m1`
  - Current signal: PASS on rerun; first-run intermittent snackbar click interception can still occur.
- `npm run validate:m2`
  - Current signal: PASS.
- `npm run validate:m3`
  - Current signal: PASS (post-cleanup rerun 2026-02-16).
- `npm run validate:m4a`
  - Current signal: PASS (post-cleanup rerun 2026-02-16).
- `npm run validate:m4b`
  - Current signal: PASS (post-cleanup rerun 2026-02-16).
- `npm run validate:m5.1`
  - Current signal: PASS (post-cleanup rerun 2026-02-16; first sandboxed attempt earlier in session was `ENV-BLOCKED` on localhost bind, unsandboxed run passed).
- `npm run validate:m5.2`
  - Current signal: PASS (first sandboxed attempt `ENV-BLOCKED` on localhost bind; unsandboxed rerun passed after validator timing wait fix).
- `npm run validate:m5.2a`
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
- FragMap runtime behavior beyond M5.2a remains unimplemented (`M5.3` Advanced/Exclusion behavior, `M5.4` per-map iso controls, `M5.5` bulk actions, `M5.6` reliability hardening).
- Performance evidence framework (`docs/specs/performance-and-validation-spec.md`) is unimplemented.
- Execution-plan Playwright command contract (`test:e2e:*`, `test:ac:*`, `playwright.config.ts`, `tests/e2e/*`) is not yet implemented.

## Risks and Escalation Rules
- Risk: async pose loading races during rapid toggles.
  - Mitigation: per-ligand request-id/single-flight guards.
- Risk: reintroducing startup instability from prior big-bang M4 attempt.
  - Mitigation: incremental commits and validator checks after each behavior slice.
- Risk: validator noise when milestone scripts are run concurrently.
  - Mitigation: run regression commands sequentially in milestone order (`m1` -> `mN`) for authoritative evidence.
- Risk: M5.1 shell regressions while implementing later M5 runtime slices.
  - Mitigation: include `npm run validate:m5.1` in post-slice regression runs until `validate:m5` is introduced at `M5.6`.
- Escalate if:
  - manifest contract cannot express required featured-ligand scope,
  - NGL representation layering blocks both-visible differentiation,
  - validator instability returns in otherwise unchanged baseline routes.

## Session Exit Requirements
1. Append command outcomes and evidence paths to `docs/context/current-state.md` validation ledger.
2. Log any architecture or behavior decision in `docs/context/decision-log.md`.
3. Refresh this brief with the exact next unresolved `M5.x` slice task.

## Immediate Next Concrete Step
- Execute `M5.3` Prompt A (design preview only) and produce/update the M5.3 preview page in `docs/screenshots/Design_previews/m5-fragmap-controls/`, then request explicit `APPROVED UI PREVIEW`.
