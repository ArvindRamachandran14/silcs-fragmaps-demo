# Next Agent Brief

Last updated: 2026-02-16 (submission-mode packaging pass; README drafted)

## Current Milestone Target
- Active target: submission-ready PRD deliverables packaging (README + repo/live links) using completed `M1`-`M6` functionality.
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

## Submission Packaging Summary
- Root `README.md` was added and aligned to PRD Deliverables Section 4:
  - Project overview + concise scientific explanation.
  - Development-process transparency note (AI-assisted coding via Codex with author review responsibility).
  - Local setup/run instructions.
  - Validation command references.
  - Full targeted validator command list through `validate:m6` (not abbreviated).
  - Explicit FragMap runtime tradeoff notes (lazy-load/cache reuse/in-place updates/retry isolation).
  - PRD requirement coverage mapping.
  - Design tradeoffs and known limitations.
- Live URL field remains a placeholder pending final hosting target.

## Scope Policy (Locked)
- Deferred scope:
  - `M4C`: full ligand list + searchable selector + deterministic ordering + `No ligands found`.
  - `M5.2c`: exploratory wireframe parity investigation only.
- Progression rule:
  - Deferred items are non-blocking for `M7` and `M8` unless explicitly re-promoted.
- Time-boxed submission rule:
  - M7/M8 execution is explicitly deferred in this window to prioritize PRD deliverable completeness.

## Priority Tasks (ordered)
1. Set final live deployment URL in `README.md` (`Submission Links` section).
2. Run one final sanity pass: `npm run validate:m6` and optionally `bash scripts/run_checks.sh`.
3. Submit PRD deliverables: GitHub URL + live URL + README.
4. Resume M7/M8 only if additional time remains after submission packaging.

## Exact Commands To Run Next
- `npm run validate:m6`
- `bash scripts/run_checks.sh`
- `npm run build`

## Stop/Go Criteria
- Stop if `validate:m6` regresses or Home/Viewer routes fail.
- Stop if last-minute changes expand scope beyond submission packaging.
- Go to M7/M8 only after submission package is finalized.

## Risks and Escalation Rules
- Risk: intermittent first-pass `validate:m1` flake.
  - Mitigation: one retry remains built into `scripts/run_checks.sh`.
- Risk: planned Playwright command contract in execution plan Section 1.1 is still partially unimplemented (`test:e2e:*`, `test:ac:*`, `playwright.config.ts`, `tests/e2e/*`).
  - Mitigation: establish M7 command contract before AC evidence collection.
- Escalate if:
  - AC evidence requirements conflict with current validator architecture.
  - Required browser evidence (especially Safari sign-off requirements) cannot be collected under current tooling.

## Immediate Next Concrete Step
- Fill the live URL placeholder in `README.md`, then run `npm run validate:m6` as final pre-submission confirmation.
