# Next Agent Brief

Last updated: 2026-02-15 (M4 scope replan)

## Current Milestone Target
- Active target: `M4A Ligand Core Workflow` (M1-M3 validated complete; M4A is first incomplete dependency for downstream milestones).

## Mandatory Execution Policy
- Use local host-terminal outputs as authoritative gate evidence.
- If tooling/sandbox prevents a required command, record `ENV-BLOCKED` (not `FAIL`) and include exact rerun command.
- After implementing milestone `Mn`, run sequential regression from `validate:m1` through `validate:mn`.

## Scope Policy (Locked)
- Required forward scope:
  - `M4A`: single-ligand core (`3fly_cryst_lig`) with four pose states, zoom, empty-state recovery, and per-pose error isolation.
  - `M4B`: featured-ligand switching only (fixed subset).
- Deferred scope:
  - `M4C`: full ligand list + searchable selector + deterministic ordering + `No ligands found`.
- Progression rule:
  - `M4C` is not a blocker for `M5`, `M6`, `M7`, or `M8` unless explicitly re-promoted.

## Priority Tasks (ordered)
1. Deliver `M4A` with minimal blast radius and no M1-M3 regressions.
   - keep initial implementation to `3fly_cryst_lig` only
   - prove all four pose states and recovery flows in place
   - add deterministic per-pose failure trigger and validation evidence
2. Deliver `M4B` featured-ligand switching (small fixed set) while preserving all `M4A` behavior.
3. Proceed to `M5` once `M4A` + `M4B` gates are green.
4. Keep `M4C` documented as deferred stretch scope.

## Exact Commands To Run Next
- `npm run build`
  - Current signal: PASS.
- `npm run validate:m1`
  - Current signal: PASS.
- `npm run validate:m2`
  - Current signal: PASS.
- `npm run validate:m3`
  - Current signal: PASS.

## Stop/Go Criteria For M4A/M4B
- Stop if Design Preview Gate is not approved (`BLOCKED-DESIGN`).
- Stop if any M1-M3 validator regresses.
- Go from `M4A` to `M4B` only after `M4A` acceptance checks are evidenced.
- Go from `M4B` to `M5` only after featured-ligand switching is stable and `M4A` behaviors remain green.

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
- Escalate if:
  - manifest contract cannot express required featured-ligand scope,
  - NGL representation layering blocks both-visible differentiation,
  - validator instability returns in otherwise unchanged baseline routes.

## Session Exit Requirements
1. Append command outcomes and evidence paths to `docs/context/current-state.md` validation ledger.
2. Log any architecture or behavior decision in `docs/context/decision-log.md`.
3. Refresh this brief with the exact next unresolved `M4A`/`M4B` (or `M5`) task.

## Immediate Next Concrete Step
- Implement `M4A` slice 1: add ligand controls shell for `3fly_cryst_lig` only with baseline/refined checkboxes and in-place four-state behavior, then run `npm run validate:m1 && npm run validate:m2 && npm run validate:m3`.
