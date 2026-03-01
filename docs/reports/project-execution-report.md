# SILCS FragMaps Demo (3FLY): Project Execution Report

## Executive Summary

This project was executed as a milestone-driven, validation-first build of a client-side SILCS FragMaps demo for P38 MAP kinase (3FLY), with delivery concentrated on February 15-16, 2026. The implementation reached functional completion through M6 (Overview + Viewer with ligand and FragMap workflows), while M7 (formal AC evidence pipeline) and M8 (full release hardening/sign-off) were intentionally deferred in a time-boxed submission mode. The process emphasized incremental slices, deterministic validators, and strict UI design-gate approvals before coding user-facing changes. The result is a working Vue 2 + NGL application with repeatable milestone checks and submission packaging in place.

## Project Setup and Initial Architecture

The technical foundation aligned to a lightweight SPA architecture:

- Framework stack: Vue 2 + TypeScript + Vuetify + Vue Router + Vuex + NGL.
- Core route structure: `/` (overview) and `/viewer`.
- Runtime data model: manifest-driven staged assets (protein, ligands, maps).
- Viewer composition: page orchestrator + NGL viewport + right controls panel.
- Build/validation model: scripted milestone validators with sequential regression gates.

Key architectural files include `src/main.ts`, `src/router/index.ts`, `src/App.vue`, `src/pages/HomePage.vue`, `src/pages/ViewerPage.vue`, `src/components/ControlsPanel.vue`, and `src/viewer/nglStage.ts`. Asset ingestion and startup validation were intentionally separated into staging/runtime checks (`scripts/stage-assets.js`, `src/data/manifest.ts`, `src/startup/startupValidation.ts`) to keep failures explicit and actionable.

From a process perspective, the repository adopted durable context and handoff discipline on February 15, 2026: startup context reads were enforced, a decision log was formalized, and user-facing work was governed by Prompt A (preview) and Prompt B (implementation) with explicit `APPROVED UI PREVIEW` tokens.

## Milestone-by-Milestone Delivery Journey (M1 -> latest)

### M1 Scaffold + Routing (completed; validated February 15, 2026)

M1 implemented route shell and base navigation contracts in `src/router/index.ts` and `src/App.vue`, with Home/Viewer pages mounted through route containers.

Validation evidence:

- `npm run validate:m1` -> PASS.

### M2 Data Manifest + Startup Validation (completed; validated February 15, 2026)

M2 added manifest-based asset control and startup checks for inventory integrity and disable-intent handling. This avoided silent runtime failures when assets were missing or partial.

Validation evidence:

- `npm run validate:m2` -> PASS.

### M3 Viewer Core Lifecycle/Layout/Defaults/Error Fallback (completed; validated February 15, 2026)

M3 established stage lifecycle and viewer shell behavior: loading-to-ready transitions, fallback messaging for catastrophic failures, default camera/protein/ligand startup state, resize handling, cleanup on unmount, and mobile controls behavior.

Validation evidence:

- `npm run validate:m3` -> PASS.

### M4A Ligand Core Workflow (completed; validated February 15, 2026)

M4A delivered baseline/refined pose controls for the crystal ligand, including four pose visibility states (`baseline-only`, `refined-only`, `both-visible`, `both-hidden`), zoom action, and per-pose failure isolation. It added deterministic failure injection (`m4FailPose`) for validator coverage.

Validation evidence:

- Sequential `validate:m1` -> `validate:m4a` passed.

### M4B Featured Ligands Expansion (completed; validated February 15, 2026)

M4B expanded ligand switching to a fixed featured subset (`3fly_cryst_lig`, `p38_goldstein_05_2e`, `p38_goldstein_06_2f`, `p38_goldstein_07_2g`) with in-place switching and preserved camera context. Post-switch camera regressions were fixed by orientation/snapshot restore tuning in `src/viewer/nglStage.ts`.

Validation evidence:

- `npm run validate:m4b` -> PASS (rerun confirmed PASS).

### M4C Full Searchable Ligand List (deferred, non-blocking)

Full searchable ligand list and deterministic ordering were explicitly deferred so M5+ could proceed without destabilizing current delivery.

### M5 FragMap Controls (completed February 16, 2026 across slices M5.1-M5.6)

M5 was decomposed into required slices, each gated by preview approval and then implementation:

- M5.1: right-panel two-tab shell (`FragMap`/`Ligand`) with default FragMap framing.
- M5.2: Primary-3 map toggles, lazy-load/cache, row status messaging, failure isolation hooks.
- M5.2a: wireframe rendering contract and fixed gray exclusion map style.
- M5.2b: tab-row protein visibility toggle (`Show Protein`) with camera preservation.
- M5.3: advanced section behavior and corrected exclusion-map visibility contract.
- M5.4: per-map iso controls (`-`, value, `+`) with clamp/revert semantics and non-editable exclusion row.
- M5.5 + M5.5a: bulk actions finalized to `Hide all` and iso-only `Reset defaults` (visibility unchanged).
- M5.6: reliability hardening with row-level retry and stale-intent async guards.
- M5.2c: exploratory parity tuning retained as optional/non-blocking.

Validation strategy matured during this phase (single build + direct node validators in `scripts/run_checks.sh`), and the final M5 umbrella gate passed: `npm run validate:m5`.

### M6 Overview Page (completed February 16, 2026)

M6 implemented the final text-first overview narrative in `src/pages/HomePage.vue` with required concepts, `Go to Viewer` CTA behavior, and external 3FLY reference link. Narrative contract was adjusted to permit scientific-first or product-first ordering while preserving required concept coverage.

Validation evidence:

- `bash scripts/run_checks.sh` passed through M6.
- `npm run validate:m6` passed after copy and wording refinements.

### Latest Post-M6 Refinements (completed February 16, 2026)

Post-M6 work added approved viewer interaction hints in `src/components/NglViewport.vue`, removed redundant sub-header Home control, and moved `Reset view` into the viewer panel overlay while keeping behavior intact via existing handler wiring.

Validation evidence:

- `npm run build` -> PASS.
- `npm run validate:m3` -> PASS.
- `npm run validate:m5` -> PASS.
- `npm run validate:m6` -> PASS.

## UI Preview/Approval Workflow (Prompt A / Prompt B)

The project enforced a strict two-phase workflow for user-facing changes:

- Prompt A: design-preview artifacts with required states (`default`, `loading`, `empty`, `error`, `success`), including mobile coverage when layout behavior changed.
- Gate condition: explicit in-thread `APPROVED UI PREVIEW`.
- Prompt B: implementation work only after approval.

This was applied consistently through M4B, all M5 slices, M6 overview, and post-M6 interaction hints. It reduced rework, made UI deltas auditable, and ensured implementation matched approved interaction contracts rather than speculative interpretation.

## Key Technical Decisions and Tradeoffs

- Milestone slicing over monolithic delivery: M4 and M5 were broken into narrower slices to reduce regression blast radius and improve reviewability.
- Lazy-load + cache for FragMaps: improved first-load responsiveness and subsequent toggle speed, with added state complexity as an accepted tradeoff.
- Per-row failure isolation and retry: prioritized user continuity; one row failure does not collapse entire controls flow.
- Per-map iso controls replaced global slider: resolved a spec conflict in favor of direct map-level control and clearer operator intent.
- Manifest-first startup validation: preserved robustness under partial asset issues, avoiding hard-fail startup where possible.
- Submission-mode prioritization: with limited time, effort shifted from unfinished M7/M8 instrumentation to stable, demonstrable M1-M6 plus strong README packaging.

## Major Bugs/Blockers and How They Were Resolved

- Intermittent M1 nav flake (toast intercepting clicks): resolved by making snackbar non-interactive (`pointer-events: none`) and retaining one retry in sequential checks.
- Sandbox localhost bind failures (`listen EPERM`): standardized as `ENV-BLOCKED`, then reran unsandboxed for authoritative evidence.
- M5.2/M5.3 timing-related validator failures: fixed by explicit validator wait adjustments and state assertion timing improvements.
- M5.2b hidden-diagnostics assertion mismatch: corrected selector-state assumptions in validator.
- Exclusion map invisible in M5.3: root cause was fallback iso mismatch against non-negative map data; fixed by dedicated exclusion iso (`0.5`).
- Post-switch camera regressions in M4B: fixed by orientation-preserving restore and live camera snapshot updates.
- Parallel validator collisions (`ENOTEMPTY` during asset staging): mitigated by strict sequential validator policy.

## Validation and Quality Strategy

Validation was treated as a first-class delivery artifact, not a post-hoc check:

- Primary sequential command: `bash scripts/run_checks.sh`.
- Targeted milestone commands: `npm run validate:m1` through `npm run validate:m6`, plus slice-specific M5 scripts.
- Execution policy: after completing milestone `Mn`, run `validate:m1` through `validate:mn` in order.
- Environment policy: if blocked by tooling/sandbox, classify as `ENV-BLOCKED` and rerun in allowed environment; do not record as feature `FAIL`.
- Script optimization: moved to one upfront build and direct `node scripts/validate-*.js` execution to reduce runtime and duplicate prebuild churn.

By February 16, 2026, this produced stable evidence for M1-M6 completion and gave a clear regression safety net for incremental refinement.

## Final State at Handoff/Submission

As of February 16, 2026:

- Functional delivery is complete through M6.
- Viewer supports protein, featured ligands, baseline/refined pose workflows, FragMap controls, per-map iso management, and reliability guardrails.
- Overview page satisfies narrative/CTA/link requirements.
- Submission packaging was completed in `README.md`, including:
  - project overview and scientific summary,
  - local run instructions,
  - validation command set,
  - PRD mapping,
  - tradeoffs and known limitations,
  - repository and live deployment links.
- Post-M6 UI polish (interaction hints + reset control placement) is implemented and validated.

## Remaining Risks, Deferred Scope, and Next Steps

Open items are explicit and bounded:

- M7 not started: no formal AC evidence pipeline artifact yet (for AC-1..AC-6 reporting).
- M8 partial only: documentation improved, but full release hardening/deploy-readiness package remains incomplete.
- Deferred feature scope: M4C full searchable ligand selector remains intentionally deferred; M5.2c parity tuning is exploratory/non-blocking.
- Residual harness risk: intermittent validator flakes can still appear, though mitigated with sequencing and retries.
- Safari evidence gap: final browser sign-off evidence is still required for complete closure.

Recommended next execution sequence:

1. Complete M7 instrumentation and produce formal validation evidence artifact.
2. Run final M8 hardening/regression pass including Safari-specific sign-off.
3. Decide whether to promote M4C from deferred stretch to required scope based on submission constraints.
