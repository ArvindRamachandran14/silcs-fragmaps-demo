# Current State

Last updated: 2026-02-16 (M5 slice renumber update to M5.6)
Audit type: one-time reconstruction audit after local thread-history loss

## Project Snapshot
- Project: SILCS FragMaps interactive demo (3FLY)
- Primary requirement source: `docs/SilcsBio_Candidate_Exercise_Instructions.md`
- Spec set: `docs/specs/*.md`
- Planning baselines: `docs/plans/technical-plan.md`, `docs/plans/execution-plan.md`

## Locked Execution Policies (Recovered)
- Validation evidence authority:
  - Local host-terminal validation output is authoritative per `docs/plans/execution-plan.md` Section 1.2.
  - Agent-side blocked runs must be recorded as `ENV-BLOCKED`, not `FAIL`.
- Sequential regression expectation:
  - After milestone `Mn` work, run `validate:m1` through `validate:mn` in order.
- Browser sign-off policy:
  - Final AC validation requires latest stable Chrome and real Safari evidence in `docs/validation.md`.

## Milestone Status (M1-M8)

### M1 Scaffold + Routing
- Status: `completed`
- Evidence:
  - Router contracts present in `src/router/index.ts` (`/`, `/viewer`, wildcard redirect).
  - App shell + nav buttons present in `src/App.vue`.
  - Home and Viewer routes render components in `src/pages/HomePage.vue` and `src/pages/ViewerPage.vue`.
- Validation signal:
  - `npm run validate:m1` -> `PASS` (executed 2026-02-15; local-server run).
- Gaps to exit criteria:
  - None for M1 gate.

### M2 Data Manifest + Assets + Startup Validation
- Status: `completed`
- Evidence:
  - Runtime manifest loader and fragmap inventory checks in `src/data/manifest.ts`.
  - Startup validation and disable-intent generation in `src/startup/startupValidation.ts`.
  - Asset staging and manifest generation in `scripts/stage-assets.js`.
  - Runtime asset existence check in `src/viewer/loaders.ts`.
- Validation signal:
  - `npm run validate:m2` -> `PASS` (executed 2026-02-15).
- Gaps to exit criteria:
  - None for M2 gate.

### M3 Viewer Core Lifecycle/Layout/Defaults/Error Fallback
- Status: `completed`
- Evidence:
  - Viewer shell layout, fallback UI, reset flow, mobile drawer in `src/pages/ViewerPage.vue`.
  - Stage host and loading/ready states in `src/components/NglViewport.vue`.
  - Top bar and reset/home actions in `src/components/ViewerTopBar.vue`.
  - NGL stage lifecycle, camera baseline/snapshot, resize+destroy behavior in `src/viewer/nglStage.ts`.
  - Viewer default-state mutations in `src/store/modules/viewer.ts`.
- Validation signal:
  - `npm run validate:m3` -> `PASS` (executed 2026-02-15; includes build + browser checks).
- Gaps to exit criteria:
  - Core M3 gate passed; known cross-spec divergences documented below are outside strict M3 script checks.

### M4A Ligand Core Workflow
- Status: `completed`
- Evidence:
  - Ligand controls UI added in `src/components/ControlsPanel.vue` (baseline/refined checkboxes, both-visible legend, both-unchecked recovery actions, zoom action).
  - Viewer orchestration wiring added in `src/pages/ViewerPage.vue` for in-place pose toggles/recovery and per-pose failure isolation toast flow.
  - Stage pose APIs added in `src/viewer/nglStage.ts` (`setPoseVisibility`, `zoomToLigand`) with deterministic `m4FailPose` query failure injection.
  - Viewer store pose state model extended in `src/store/modules/viewer.ts`.
  - M4A validator added in `scripts/validate-m4a.js` and wired in `package.json`.
- Validation signal:
  - `npm run validate:m1` -> `PASS` (2026-02-15).
  - `npm run validate:m2` -> `PASS` (2026-02-15).
  - `npm run validate:m3` -> `PASS` (2026-02-15).
  - `npm run validate:m4a` -> `PASS` (2026-02-15).
- Gaps to exit criteria:
  - None for M4A gate.

### M4B Featured Ligands Expansion
- Status: `completed`
- Evidence:
  - Scope is restricted to featured-ligand switching only.
  - Searchable full-ligand selection is intentionally excluded from this phase.
  - Prompt-A preview artifacts were revised so featured chips are fully visible (no right-panel occlusion) across all desktop M4B state mockups.
  - Featured quick-pick switching implemented in `src/components/ControlsPanel.vue` and `src/pages/ViewerPage.vue` for approved fixed subset (`3fly_cryst_lig`, `p38_goldstein_05_2e`, `p38_goldstein_06_2f`, `p38_goldstein_07_2g`).
  - In-place ligand switching with camera preservation and per-ligand fallback-disable behavior implemented in `src/viewer/nglStage.ts` and `src/store/modules/viewer.ts`.
  - Post-switch/reset camera regression was hotfixed in `src/viewer/nglStage.ts` by restoring viewer orientation without re-centering inversion, then reading live stage camera snapshots after switch/resize/reset.
  - M4B validator added and wired via `scripts/validate-m4b.js` and `package.json` (`validate:m4b`, `prevalidate:m4b`).
- Validation signal:
  - `npm run validate:m1` -> `PASS` (2026-02-15).
  - `npm run validate:m2` -> `PASS` (2026-02-15).
  - `npm run validate:m3` -> `PASS` (2026-02-15).
  - `npm run validate:m4a` -> `PASS` (2026-02-15).
  - `npm run validate:m4b` -> `PASS` (2026-02-15; rerun confirmed PASS).
- Gaps to exit criteria:
  - None for M4B gate.

### M4C Full Ligand List + Search (Deferred)
- Status: `deferred (non-blocking stretch)`
- Evidence:
  - Full-list searchable selector and deterministic ordering have been moved to deferred scope.
- Validation signal:
  - Not required for M5-M8 progression.
- Gaps to exit criteria:
  - Add implementation and validation only if stretch scope is reactivated.

### M5 FragMap Controls (Sliced: M5.1..M5.6)
- Status: `not started`
- Evidence:
  - M5 execution is now locked to six slices (`M5.1` -> `M5.6`) with Prompt A + Prompt B per slice.
  - Preview packet structure is locked to one front page plus one page per slice at `docs/screenshots/Design_previews/m5-fragmap-controls/`.
  - Active next scope is `M5.1` Prompt A (design preview only).
  - No fragmap control panel rows, no per-map toggle, no per-map iso controls in `src/components/`.
  - `visibleFragMapIds` exists in store but has no mutation/action workflow wired to UI.
  - No map component load/render/update logic exists yet for runtime toggles.
- Validation signal:
  - `not run` (no M5 gate command exists in `package.json`).
- Gaps to exit criteria:
  - Implement map UI/state/runtime behavior from `docs/specs/fragmap-controls-spec.md` Sections 5-11.

### M6 Overview Page
- Status: `not started`
- Evidence:
  - Current page is scaffold text only in `src/pages/HomePage.vue`.
  - Required scientific narrative and required external link are absent.
- Validation signal:
  - `not run` (no M6 gate command exists in `package.json`).
- Gaps to exit criteria:
  - Implement 1-2 paragraph required narrative + `Go to Viewer` CTA semantics + required external links per `docs/specs/overview-page-spec.md`.

### M7 Performance Instrumentation + AC Validation Evidence
- Status: `not started`
- Evidence:
  - No `src/perf/metrics.ts` present.
  - No `docs/validation.md` present.
  - No AC-specific command scripts in `package.json`.
- Validation signal:
  - `not run`.
- Gaps to exit criteria:
  - Add instrumentation boundaries and produce AC-1..AC-6 evidence format per `docs/specs/performance-and-validation-spec.md`.

### M8 Hardening + Final Regression + README/Deploy Readiness
- Status: `not started`
- Evidence:
  - No `README.md` present.
  - No deploy readiness and final regression artifacts documented.
- Validation signal:
  - `not run`.
- Gaps to exit criteria:
  - Final regression pass + docs/deploy package completion per execution plan M8 gate.

## Implemented Behavior Inventory
- Viewer core:
  - NGL-based startup rendering, loading/ready states, fallback retry/home flow, camera reset/resize lifecycle are implemented.
- Ligand workflow:
  - M4A and M4B are implemented: baseline/refined pose controls with in-place switching plus featured-ligand quick picks (`Crystal Ligand`, `05_2e`, `06_2f`, `07_2g`) and camera-preserving ligand switches.
  - M4C full-list searchable ligand selector remains deferred.
- FragMap controls:
  - Manifest metadata and startup validation exist; interactive controls/render toggles are not implemented.
- Overview page:
  - Route and CTA scaffold exist; required narrative and links are not implemented.
- Performance/validation instrumentation:
  - Milestone scripts exist through M4B; AC instrumentation/evidence pipeline is not implemented.

## Spec Divergence Register
- `medium` - `docs/specs/ligand-workflow-spec.md` Section 4 canonical featured set:
  - Observed: spec text still references a larger canonical featured set, while approved M4B implementation is intentionally constrained to 4 featured chips (`Crystal Ligand`, `05_2e`, `06_2f`, `07_2g`).
  - Impact: implementation follows approved preview/plan decision, but spec wording should be reconciled to avoid future ambiguity.
- `medium` - `docs/specs/ligand-workflow-spec.md` (M4C deferred scope):
  - Observed: searchable full-ligand selector and ordering behavior are not implemented.
  - Impact: deferred by plan; non-blocking for M5-M8 progression.
- `high` - `docs/specs/fragmap-controls-spec.md`:
  - Observed: no Primary/Advanced map rows, per-map toggles, per-map iso controls, exclusion-map behavior, or bulk actions.
  - Impact: AC-2 and AC-5 cannot be met.
- `high` - `docs/specs/overview-page-spec.md`:
  - Observed: overview narrative and required external reference link are missing.
  - Impact: PRD overview acceptance is not met.
- `medium` - `docs/specs/performance-and-validation-spec.md`:
  - Observed: no `docs/validation.md`, no AC runbook evidence outputs, no Safari evidence capture.
  - Impact: final AC sign-off impossible today.
- `medium` - `docs/specs/viewer-core-spec.md` Section 7:
  - Observed: app-level startup warnings are rendered as persistent inline alerts and a `<pre>` debug block in `src/App.vue`.
  - Impact: deviates from v1 guidance emphasizing non-blocking toast behavior for core errors.
- `medium` - `docs/plans/execution-plan.md` Section 1.1 command contract:
  - Observed: expected Playwright suite structure/commands are not present (`tests/e2e/...`, `playwright.config.ts`, `npm run test:e2e:*`, `npm run test:ac:*`).
  - Impact: planned cross-browser AC automation path is currently unavailable; only milestone validators `validate:m1..m3` exist.

## Validation Ledger (append-only)
- 2026-02-15: Ran `npm run validate:m1` -> PASS.
- 2026-02-15: Ran `npm run validate:m2` -> PASS.
- 2026-02-15: Ran `npm run validate:m3` -> PASS.
- 2026-02-15: Reconstruction audit established evidence-based milestone status M1-M8.
- 2026-02-15: Handoff protocol hardening completed (`AGENTS.md` startup-context requirement + `docs/context/handoff-template.md` with 4 prompt blocks). No new milestone validator commands run in this handoff refresh.
- 2026-02-15: Added repo-wide UI-first feature protocol and locked Design Preview Gate requirements to planning artifacts (`AGENTS.md`, `docs/plans/execution-plan.md`, `docs/plans/milestone-inventory.md`) plus kickoff template (`docs/context/feature-kickoff-template.md`). No milestone validator command was run for this documentation policy update.
- 2026-02-15: Created first M4 design-preview packet skeleton under `docs/screenshots/Design_previews/m4-ligand-workflow/` (README, preview index, approval log, state guidance files, desktop/mobile placeholders). This is a user-requested artifact-location override from the execution-plan default path format. No validator command was run (docs-only change).
- 2026-02-15: Updated `prompts/implementation.md` M4 assignment pattern to two-step flow: Prompt A (`DESIGN PREVIEW ONLY`) then Prompt B (`post-approval implementation`), with explicit `BLOCKED-DESIGN` behavior when approval token is missing. No validator command was run (prompt-doc update only).
- 2026-02-15: Generated visual comparison artifacts for existing ligand preview pair (`collapsed` vs `expanded`) at `docs/screenshots/Design_previews/m4-ligand-workflow/ligand-controls-collapsed-vs-expanded-xray.png` and `docs/screenshots/Design_previews/m4-ligand-workflow/ligand-controls-collapsed-vs-expanded-diff-heatmap.png` to support preview review.
- 2026-02-15: Removed intermediate visual-comparison artifacts (`...xray.png`, `...diff-heatmap.png`) per user request. Current standalone preview files are `ligand-controls-expanded.png` and `ligand-controls-collapsed.png`, where the collapsed file is a dimension-reduced placeholder rather than a validated collapsed-state UI design.
- 2026-02-15: Updated `docs/context/handoff-template.md` section ordering to explicit operational sequence: `Pre-Handoff Update` -> `Required Handoff Payload` -> `Review Gate` -> `Copy-Paste Kickoff Prompt`.
- 2026-02-15: Enhanced `docs/context/handoff-template.md` pre-handoff prompt to require changed-file clustering for commit sequencing and added optional `COMMIT=YES` auto-commit workflow (clustered `git add`/`git commit` output contract).
- 2026-02-15: Executed pre-handoff dry run without `COMMIT=YES`; generated clustered commit plan from current working tree for review before commit execution.
- 2026-02-15: Executed `COMMIT=YES` pre-handoff automation (cluster order): committed preview-assets cluster via `git add ... && git commit -m "docs(preview): add m4 packet and relocate design preview assets"` -> `PASS` (`9f2e95c`). Remaining non-empty clusters: `docs/context`, `handoff/process docs`.
- 2026-02-15: Startup takeover sequence re-validated in required order: `AGENTS.md` -> `docs/context/current-state.md` -> `docs/context/next-agent-brief.md` -> `docs/context/decision-log.md` -> `docs/plans/execution-plan.md`. Confirmed active milestone alignment remains `M4 Ligand Workflow` and execution is design-gated until explicit `APPROVED UI PREVIEW`. No milestone validator command was run in this takeover checkpoint (context-only update).
- 2026-02-15: Implemented M4 ligand workflow code path (UI + store + stage orchestration) with new files `src/components/LigandControls.vue` and `scripts/validate-m4.js`; updated `package.json` with `validate:m4`.
- 2026-02-15: Validation runs: `npm run validate:m2` -> PASS; `npm run build` -> PASS; `npm run validate:m1` -> FAIL (viewer navigation click timeout); `npm run validate:m3` -> FAIL (loading-state timeout); `npm run validate:m4` -> FAIL (viewer-ready timeout). Failures are reproducible in this environment and currently block M4 gate closure.
- 2026-02-15: Regression-fix-only pass ran strict sequence attempt. Outcomes: `validate:m1` -> FAIL (`nav-viewer` click timeout), `validate:m2` -> PASS, `validate:m3` -> FAIL (missing loading-state selector), `validate:m4` -> ENV-BLOCKED (hung validator process terminated). See `docs/context/failure-report-m4-2026-02-15.md`.
- 2026-02-15: Re-validated baseline with fresh build chain. Outcomes: `npm run build` -> PASS; `npm run validate:m1` -> PASS; `npm run validate:m2` -> PASS; `npm run validate:m3` -> PASS. Intermittent earlier M1/M3 failures treated as non-deterministic and not currently reproducible after rebuild.
- 2026-02-15: Planning decision adopted: split prior M4 scope into `M4A` (single-ligand core) + `M4B` (featured ligands only), and defer `M4C` (full list/search/ordering) as non-blocking stretch scope for post-M8 unless explicitly re-promoted.
- 2026-02-15: Implemented M4A code path (`src/store/modules/viewer.ts`, `src/viewer/nglStage.ts`, `src/components/ControlsPanel.vue`, `src/pages/ViewerPage.vue`) plus validator (`scripts/validate-m4a.js`, `package.json` script wiring). Sequential regression outcomes: `validate:m1` PASS, `validate:m2` PASS, `validate:m3` PASS, `validate:m4a` PASS.
- 2026-02-15: Adjusted M4A contract to make both-unchecked recovery panel/actions optional (unchecked pose toggles are sufficient state representation). Updated `docs/specs/ligand-workflow-spec.md`, `docs/plans/execution-plan.md`, `prompts/implementation.md`, and `scripts/validate-m4a.js` accordingly. Validation outcomes in this window: `validate:m1` FAIL (intermittent nav click timeout due snackbar pointer interception), `validate:m2` PASS, `validate:m3` PASS, `validate:m4a` PASS.
- 2026-02-15: Fixed intermittent `validate:m1` nav interception by making viewer toast non-interactive (`pointer-events: none`) in `src/pages/ViewerPage.vue` (`viewer-page__toast`). Post-fix local validation evidence: `npm run validate:m1` -> PASS (two sequential direct runs).
- 2026-02-15: Removed both-unchecked yellow recovery panel/buttons from `src/components/ControlsPanel.vue` per UX decision. Validation evidence after removal: `npm run validate:m4a` -> PASS and `npm run validate:m1` -> PASS.
- 2026-02-15: Updated `prompts/implementation.md` so M4B now follows the same two-step design gate as M4A (`Prompt A` preview-only + `Prompt B` post-approval) with explicit `BLOCKED-DESIGN` verify behavior. No validator commands were run (prompt-doc update only).
- 2026-02-15: Executed M4B Prompt A (design-preview only): added desktop M4B preview artifacts for default, switch-loading, switch-success, per-ligand failure, and fallback/disabled states under `docs/screenshots/Design_previews/m4-ligand-workflow/`; updated packet index/state guidance and approval log. No validator commands were run (design-doc/artifact update only).
- 2026-02-15: Revised M4B Prompt-A previews to proposed 4-ligand subset (`Crystal Ligand` + 3 featured options) across desktop state artifacts and guidance docs. No validator commands were run (design-doc/artifact update only).
- 2026-02-15: Addressed reviewer feedback on M4B preview layout by repositioning right-side context panels in all M4B desktop state artifacts so no featured chip is occluded. Updated `m4b-preview-index.md` and `approval-log.md`. No validator commands were run (design-doc/artifact update only).
- 2026-02-15: Recorded M4B design gate approval in `docs/screenshots/Design_previews/m4-ligand-workflow/approval-log.md` and set packet gate state to `APPROVED UI PREVIEW` in `README.md`.
- 2026-02-15: Implemented M4B featured-ligand switching (`src/components/ControlsPanel.vue`, `src/pages/ViewerPage.vue`, `src/viewer/nglStage.ts`, `src/store/modules/viewer.ts`) using approved fixed subset (`Crystal Ligand`, `05_2e`, `06_2f`, `07_2g`), preserving in-place interactions and M4A pose contracts.
- 2026-02-15: Added `scripts/validate-m4b.js` and `package.json` script wiring (`validate:m4b`, `prevalidate:m4b`).
- 2026-02-15: Sequential regression outcomes after M4B implementation: `npm run validate:m1` PASS, `npm run validate:m2` PASS, `npm run validate:m3` PASS, `npm run validate:m4a` PASS, `npm run validate:m4b` PASS (rerun confirmed PASS). Initial agent-side `validate:m4b` attempts were `ENV-BLOCKED` by sandbox local-port bind restrictions (`listen EPERM`); unsandboxed rerun succeeded.
- 2026-02-15: Resolved post-switch camera-position regression reported during manual QA (protein drifting to top-left after selecting featured ligands and reset not restoring center). Updated `src/viewer/nglStage.ts` switch/reset camera restoration strategy and added an explicit reset-after-switch check in `scripts/validate-m4b.js`. Sequential verification in this window: `validate:m1` PASS, `validate:m2` PASS, `validate:m3` PASS, `validate:m4a` PASS, `validate:m4b` PASS (unsandboxed run for local port bind).
- 2026-02-15: Applied second-pass camera stabilization after additional manual QA: removed mixed transform+direct-camera restore during switch/reset (transform-first deterministic path), enforced resize preservation by restoring prior snapshot when NGL perturbs camera on resize, and kept `validate:m4b` reset-after-switch assertion active. Sequential verification in this window: `validate:m1` PASS, `validate:m2` PASS, `validate:m3` PASS, `validate:m4a` PASS, `validate:m4b` PASS (unsandboxed run for local port bind).
- 2026-02-15: Resolved follow-up M4B manual QA issues where `Reset view` could blank the scene and featured switching was inconsistent across ligands. Root cause was transform restore sign inversion (`viewerControls.center`) after `orient` in `src/viewer/nglStage.ts`; hotfix switched to orientation-only restore and live snapshot resync. Verification sequence in this window: `validate:m1` FAIL (intermittent snackbar click interception) then rerun `validate:m1` PASS, `validate:m2` PASS, `validate:m3` PASS, `validate:m4a` PASS, `validate:m4b` PASS.
- 2026-02-15: Ran targeted Playwright runtime smoke script mirroring manual QA sequence (default reset, switch among `05_2e`/`06_2f`/`07_2g`, reset after each switch); camera snapshots remained stable and viewport stayed centered.
- 2026-02-15: Updated planning/prompt/handoff docs to lock M5 sliced execution (`M5.1`..`M5.5`) with per-slice Prompt A + Prompt B and preview packet structure (front page + one page per slice) under `docs/screenshots/Design_previews/m5-fragmap-controls/`. No validator commands were run (docs-only alignment update).
- 2026-02-16: Updated planning/prompt/handoff docs to split prior `M5.4` into separate slices (`M5.4` per-map iso controls only, `M5.5` bulk actions only) and renumber reliability/final gate to `M5.6`. No validator commands were run (docs-only renumber/scope update).

## Open Risks
- Major feature milestones remain incomplete: M5 slices (`M5.1`..`M5.6`) and M6 are not started while M1-M4B are complete.
- M4C (full list/search/ordering) is deferred by plan and does not block M5-M8.
- Baseline validators currently pass after rebuild; intermittent harness instability remains a residual risk during future UI integrations.
- M4A validator depends on SwiftShader-enabled Playwright launch args for reliable headless runs.
- AC evidence path (M7) and release readiness (M8) are currently absent.
- Execution-plan automation contract is partially missing and will need alignment before M7/M8 sign-off.
