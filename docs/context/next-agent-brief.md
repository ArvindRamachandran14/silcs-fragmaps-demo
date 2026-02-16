# Next Agent Brief

Last updated: 2026-02-16 (`M6` final copy refresh complete; M6 gate PASS)

## Current Milestone Target
- Active target: `M7 Performance Instrumentation + AC Validation Evidence`.
- Baseline branch state at takeover: `M1` through `M6` are complete and validated.
- Deferred/non-blocking scopes remain `M4C` and exploratory `M5.2c` parity investigation.

## Takeover Checkpoint
- Required startup read order completed: `AGENTS.md` -> `docs/context/current-state.md` -> `docs/context/next-agent-brief.md` -> `docs/context/decision-log.md` -> `docs/plans/execution-plan.md`.
- Milestone alignment confirmed against execution plan ordering and dependencies.

## Mandatory Execution Policy
- Use local host-terminal outputs as authoritative gate evidence.
- If tooling/sandbox prevents a required command, record `ENV-BLOCKED` (not `FAIL`) and include exact rerun command.
- After implementing milestone `Mn`, run sequential regression from `validate:m1` through `validate:mn`.
- For full sequential runs, prefer `bash scripts/run_checks.sh` (single upfront build + direct `node scripts/validate-*.js` execution).

## M6 Completion Summary
- Prompt-A artifacts were produced and approved via explicit `APPROVED UI PREVIEW`.
- Prompt-B runtime implementation is complete:
  - `src/pages/HomePage.vue`: final reviewer-approved M6 narrative/CTA/link contract implemented.
  - `scripts/validate-m6.js`: new M6 gate validator.
  - `package.json`: added `validate:m6` / `prevalidate:m6`.
  - `scripts/run_checks.sh`: extended through `node scripts/validate-m6.js`.
- M6 gate evidence:
  - `bash scripts/run_checks.sh` -> PASS through `validate-m6`.
  - `npm run validate:m6` -> first sandboxed run `ENV-BLOCKED` (`listen EPERM 127.0.0.1:4184`), unsandboxed rerun -> PASS.
  - `npm run validate:m6` -> PASS after final narrative copy refresh.
  - `npm run validate:m6` -> PASS after minor readability polish in paragraph 1 wording.
  - `npm run validate:m6` -> PASS after removing literal backticks around ligand IDs in the overview narrative.

## Scope Policy (Locked)
- Deferred scope:
  - `M4C`: full ligand list + searchable selector + deterministic ordering + `No ligands found`.
  - `M5.2c`: exploratory wireframe parity investigation only.
- Progression rule:
  - Deferred items are non-blocking for `M7` and `M8` unless explicitly re-promoted.

## Priority Tasks (ordered)
1. Populate M7 prompt templates in `prompts/implementation.md` (Prompt A/B/verify) to remove TODO placeholders before execution.
2. Execute M7 implementation per spec (`docs/specs/performance-and-validation-spec.md`) and produce `docs/validation.md` evidence.
3. Preserve M1-M6 behavior contracts while adding instrumentation and AC evidence paths.

## Exact Commands To Run Next
- `bash scripts/run_checks.sh`
- `npm run validate:m6`
- `npm run build`

## Stop/Go Criteria
- Stop if any existing validator from `m1`..`m6` regresses.
- Stop if M7 work crosses scope boundaries into M8 hardening.
- Go from `M7` to `M8` only after AC evidence is complete and reproducible.

## Risks and Escalation Rules
- Risk: intermittent first-pass `validate:m1` flake.
  - Mitigation: one retry remains built into `scripts/run_checks.sh`.
- Risk: planned Playwright command contract in execution plan Section 1.1 is still partially unimplemented (`test:e2e:*`, `test:ac:*`, `playwright.config.ts`, `tests/e2e/*`).
  - Mitigation: establish M7 command contract before AC evidence collection.
- Escalate if:
  - AC evidence requirements conflict with current validator architecture.
  - Required browser evidence (especially Safari sign-off requirements) cannot be collected under current tooling.

## Immediate Next Concrete Step
- Add concrete M7 Prompt A/B/verify templates in `prompts/implementation.md`, then begin M7 implementation with instrumentation + evidence output in `docs/validation.md`.
