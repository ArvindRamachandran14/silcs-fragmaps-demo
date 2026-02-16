# Next Agent Brief

Last updated: 2026-02-16 (`M5.6` Prompt B complete; final M5 gate PASS)

## Current Milestone Target
- Active target: `M6 Overview Page` Prompt A design-preview gate.
- Baseline branch state at takeover: required M5 slices (`M5.1` -> `M5.2` -> `M5.2a` -> `M5.2b` -> `M5.3` -> `M5.4` -> `M5.5` -> `M5.5a` -> `M5.6`) are complete and validated.
- `M5.2c` remains deferred exploratory parity investigation only (non-blocking).

## Takeover Checkpoint
- Required startup read order completed: `AGENTS.md` -> `docs/context/current-state.md` -> `docs/context/next-agent-brief.md` -> `docs/context/decision-log.md` -> `docs/plans/execution-plan.md`.
- Milestone alignment confirmed against execution plan Section 3.1.

## Mandatory Execution Policy
- Use local host-terminal outputs as authoritative gate evidence.
- If tooling/sandbox prevents a required command, record `ENV-BLOCKED` (not `FAIL`) and include exact rerun command.
- After implementing milestone `Mn`, run sequential regression from `validate:m1` through `validate:mn`.
- For full sequential runs, prefer `bash scripts/run_checks.sh` (single upfront build + direct `node scripts/validate-*.js` execution).

## M5.6 Completion Summary
- Prompt A approval: explicit in-thread token `APPROVED UI PREVIEW` received.
- Prompt B scope implemented:
  - `src/components/ControlsPanel.vue`: row-level retry affordance; removed global row-lock behavior.
  - `src/pages/ViewerPage.vue`: per-row async intent guards, row-level retry flow, stale completion suppression.
  - `src/viewer/nglStage.ts`: debug state includes stale-completion counter bucket.
- Validation/tooling updates:
  - Added `scripts/validate-m5-6.js` and `scripts/validate-m5.js`.
  - Added npm scripts `validate:m5.6`, `prevalidate:m5.6`, `validate:m5`, `prevalidate:m5`.
  - Extended `scripts/run_checks.sh` through `node scripts/validate-m5-6.js`.
- M5.6 + final M5 gate evidence:
  - `npm run build` -> PASS
  - `node scripts/validate-m5-6.js` -> PASS
  - `bash scripts/run_checks.sh` -> PASS through `validate:m5.6`
  - `npm run validate:m5` -> first sandboxed run `ENV-BLOCKED` (`listen EPERM 127.0.0.1:4176`), unsandboxed rerun -> PASS

## Scope Policy (Locked)
- Required forward scope:
  - `M4A`: single-ligand core (`3fly_cryst_lig`) with four pose states and per-pose error isolation.
  - `M4B`: featured-ligand switching only (fixed subset).
- Deferred scope:
  - `M4C`: full ligand list + searchable selector + deterministic ordering + `No ligands found`.
- Progression rule:
  - `M4C` is non-blocking for `M6`, `M7`, and `M8` unless explicitly re-promoted.

## Priority Tasks (ordered)
1. Execute `M6` Prompt A only (design-preview artifacts + gate checklist), then wait for explicit `APPROVED UI PREVIEW`.
2. Execute `M6` Prompt B only after approval and run sequential regression (`validate:m1` through `validate:m6` when command contract exists).
3. Keep `M4C` and `M5.2c` documented as deferred/non-blocking.

## Exact Commands To Run Next
- `bash scripts/run_checks.sh`
- `npm run validate:m5`
- `npm run build`

## Stop/Go Criteria
- Stop if Prompt A approval token is missing for active user-facing scope (`BLOCKED-DESIGN`).
- Stop if any existing validator from `m1`..`m5` regresses.
- Stop if implementation crosses active milestone scope boundaries.
- Go from `M6` to `M7` only after M6 Prompt A approval + Prompt B completion and green regression evidence.

## Risks and Escalation Rules
- Risk: intermittent first-pass `validate:m1` flake.
  - Mitigation: one retry is already built into `scripts/run_checks.sh`.
- Risk: unresolved visual parity versus reference wireframe screenshots.
  - Mitigation: keep investigation deferred in `docs/investigations/m5.2c-wireframe-parity-investigation.md`.
- Escalate if:
  - M6 narrative/link requirements conflict with current overview architecture.
  - Existing M1-M5 validators regress after M6 changes.

## Immediate Next Concrete Step
- Start `M6` Prompt A (design preview only), produce required state artifacts, and request explicit `APPROVED UI PREVIEW` before any M6 runtime implementation.
