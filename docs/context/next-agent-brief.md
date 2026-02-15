# Next Agent Brief

Last updated: 2026-02-15 (ui-protocol update)

## Current Milestone Target
- Active target: `M4 Ligand Workflow` (M1-M3 validated complete; M4 is first incomplete dependency for downstream milestones).

## Mandatory Execution Policy
- Use local host-terminal outputs as authoritative gate evidence.
- If tooling/sandbox prevents a required command, record `ENV-BLOCKED` (not `FAIL`) and include exact rerun command.
- After implementing milestone `Mn`, run sequential regression from `validate:m1` through `validate:mn`.

## Priority Tasks (ordered)
1. Use `docs/context/handoff-template.md` order exactly for handoff operations:
   - Pre-Handoff Update
   - Required Handoff Payload
   - Review Gate
   - Copy-Paste Kickoff Prompt
2. In pre-handoff runs, execute dry-run clustering first; use `COMMIT=YES` only after human review of cluster boundaries.
   - Validation note: one `COMMIT=YES` cluster commit has been successfully exercised (`9f2e95c`).
3. In the current dirty working tree, separate unrelated deletions under `docs/screenshots/Ideas/*` from M4/doc-process commits unless explicitly intended.
4. Complete M4 Design Preview Gate before any M4 implementation code:
   - create preview artifacts in `docs/screenshots/Design_previews/m4-ligand-workflow/` (current user-requested path)
   - include default/loading/empty/error/success states
   - obtain explicit in-thread approval token: `APPROVED UI PREVIEW`
5. Use `prompts/implementation.md` M4 two-step assignment flow:
   - Prompt A: `DESIGN PREVIEW ONLY`
   - Prompt B: implementation only after `APPROVED UI PREVIEW`
6. Commit governance/context baseline updates before starting M4 implementation.
7. Implement ligand workflow UI section in controls panel:
   - featured quick-pick chips
   - searchable all-ligands dropdown
   - baseline/refined checkbox controls
   - zoom action
8. Implement four-state pose visibility model (`baseline-only`, `refined-only`, `both-visible`, `both-unchecked`) in store + viewer orchestration.
9. Implement both-unchecked persistent empty-state with recovery actions (`Show Baseline`, `Show Refined`, `Show Both`).
10. Implement pose loading/fallback/error behavior per ligand (`.sdf` primary, `.pdb` fallback) with per-pose disable + non-blocking toast.
11. Implement style differentiation + legend when both poses are visible.
12. Add M4 validation script (`scripts/validate-m4.js`) and npm command.
13. Align automation contract incrementally toward execution plan Section 1.1 (introduce missing Playwright test structure/commands when appropriate for milestone scope).

## Exact Commands To Run Next
- `npm run stage:assets`
  - Expected output: `Staged runtime assets successfully.` with ligand/map counts.
- `npm run validate:m1`
  - Expected output includes `M1 validation passed`.
- `npm run validate:m2`
  - Expected output includes `M2 validation passed`.
- `npm run validate:m3`
  - Expected output includes `M3 validation passed`.
- After M4 implementation, run:
  - `npm run validate:m4` (must be added in `package.json` alongside script file).

Note: M1/M3 run local HTTP servers and browser automation; if sandbox blocks port binding, rerun with elevated permission and record outcome.

## Stop/Go Criteria For M4
- Stop if M4 Design Preview Gate is not approved (`BLOCKED-DESIGN`).
- Stop if any M1-M3 validation regresses.
- Go only when all M4 acceptance checks from `docs/specs/ligand-workflow-spec.md` Section 10 are evidenced.
- Required M4 completion evidence:
  - in-place ligand switching (no page reload)
  - all four pose visibility states working
  - both-visible differentiation + legend
  - both-unchecked persistent recovery UI
  - per-pose failure isolation behavior

## Known Divergences To Resolve Before M5
- Overview page content divergence (`docs/specs/overview-page-spec.md`) remains open.
- FragMap controls are unimplemented (`docs/specs/fragmap-controls-spec.md`).
- Performance evidence framework (`docs/specs/performance-and-validation-spec.md`) is unimplemented.
- Execution-plan Playwright command contract (`test:e2e:*`, `test:ac:*`, `playwright.config.ts`, `tests/e2e/*`) is not yet implemented.

## Risks and Escalation Rules
- Risk: M4 state model may conflict with current boolean-only pose state.
  - Mitigation: migrate state to `visiblePoseKinds` array contract and adapt existing defaults.
- Risk: async pose loading races during rapid toggles.
  - Mitigation: per-ligand request-id/single-flight guards.
- Escalate if:
  - manifest contract cannot express required pose availability,
  - NGL representation layering blocks both-visible differentiation,
  - M4 behavior requires spec interpretation not explicit in `docs/specs/ligand-workflow-spec.md`.

## Session Exit Requirements
1. Append command outcomes and evidence paths to `docs/context/current-state.md` validation ledger.
2. Log any architecture or behavior decision in `docs/context/decision-log.md`.
3. Refresh this brief with the exact next unresolved M4 (or M5) task.
