# Decision Log

Last updated: 2026-02-15
Purpose: persistent technical memory reconstructed from repo evidence.

## Explicit Documented Decisions

### 2026-02-15 - Enforce startup context reads in repository policy
- Decision: add required startup-context section to `AGENTS.md` so agents must read/update context files each task.
- Why: prevent future reliance on ephemeral thread memory and ensure deterministic handoffs.
- Alternatives considered: rely on optional team convention without AGENTS enforcement.
- Evidence:
  - `AGENTS.md` (`## Agent Startup Context (Required)`)
- Validation/risk impact: improves process reliability; no runtime app behavior impact.

### 2026-02-15 - Standardize handoff with reusable 4-prompt template
- Decision: add `docs/context/handoff-template.md` with prompts for pre-handoff update, kickoff, payload generation, and QA review.
- Why: reduce handoff drift and make next-agent expectations explicit and repeatable.
- Alternatives considered: ad hoc handoff messaging in chat only.
- Evidence:
  - `docs/context/handoff-template.md`
- Validation/risk impact: improves operational consistency; no runtime app behavior impact.

### 2026-02-15 - Repo-native context pack is canonical handoff memory
- Decision: maintain project memory in `docs/context/current-state.md`, `docs/context/decision-log.md`, `docs/context/next-agent-brief.md`.
- Why: local Codex thread history can be lost; repo-tracked context is durable and reviewable.
- Alternatives considered: relying on app thread history only, or PR text only.
- Evidence:
  - `docs/context/current-state.md`
  - `docs/context/decision-log.md`
  - `docs/context/next-agent-brief.md`
- Validation/risk impact: improves restart reliability; no runtime behavior impact.

### 2026-02-15 - Enforce UI Design Preview Gate before user-facing feature implementation
- Decision: require UI preview artifacts and explicit approval (`APPROVED UI PREVIEW`) before coding any new or changed user-facing feature.
- Why: reduce rework and ensure feature implementation follows approved UI direction.
- Alternatives considered: begin coding immediately and iterate UI after implementation.
- Evidence:
  - `AGENTS.md` (`## UI-First Feature Protocol (Required)`)
  - `docs/plans/execution-plan.md` (`## 1.3 UI Design Preview Gate (Locked)`)
  - `docs/plans/milestone-inventory.md` (`## How to Update` design preview rules)
  - `docs/context/feature-kickoff-template.md`
- Validation/risk impact: increases upfront design alignment; introduces intentional `BLOCKED-DESIGN` stop state when approval is missing.

### 2026-02-15 - Use screenshots preview path for first M4 packet per explicit user request
- Decision: create the first M4 preview packet in `docs/screenshots/Design_previews/m4-ligand-workflow/`.
- Why: explicit user request in-thread overrides default artifact path convention.
- Alternatives considered: use execution-plan default `docs/design-previews/<milestone-or-feature>/`.
- Evidence:
  - `docs/screenshots/Design_previews/m4-ligand-workflow/README.md`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/preview-index.md`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/approval-log.md`
- Validation/risk impact: immediate usability for this workflow; path-convention split should be normalized later to avoid confusion.

### 2026-02-15 - Standardize M4 assignment as two prompts (design gate then implementation)
- Decision: split M4 assignment prompt in `prompts/implementation.md` into Prompt A (design previews only) and Prompt B (implementation only after approval token).
- Why: operationalize the UI-first gate and prevent accidental coding before preview approval.
- Alternatives considered: single combined M4 implementation prompt with optional design pre-step.
- Evidence:
  - `prompts/implementation.md` (`## M4 - Ligand Workflow`, `### Prompt to assign M4`)
- Validation/risk impact: reduces premature implementation risk; adds one extra handoff step that depends on explicit reviewer response.

### 2026-02-15 - Align handoff template order with operational sequence
- Decision: reorder `docs/context/handoff-template.md` to canonical sequence: pre-handoff update -> required handoff payload -> review gate -> kickoff prompt.
- Why: prevent ordering confusion between sender and receiver steps during context handoffs.
- Alternatives considered: keep existing sections and rely on ad hoc interpretation.
- Evidence:
  - `docs/context/handoff-template.md` (`## Overall Run Order`)
  - `docs/context/handoff-template.md` (`## 1) Pre-Handoff Maintainer Checklist` to `## 4) Copy-Paste Kickoff Prompt`)
- Validation/risk impact: improves handoff consistency; no runtime app behavior impact.

### 2026-02-15 - Add clustered commit planning and optional auto-commit to pre-handoff flow
- Decision: extend pre-handoff template output to include changed-file clusters (with suggested commit messages) and optional `COMMIT=YES` automation for staged cluster commits.
- Why: improve commit sequencing quality and reduce manual handoff overhead during time-constrained execution.
- Alternatives considered: leave commit grouping as manual/free-form after handoff output.
- Evidence:
  - `docs/context/handoff-template.md` (`### Prompt: Pre-Handoff Update`, `### Optional Prompt: Pre-Handoff Update + Auto-Commit`)
- Validation/risk impact: improves commit hygiene and reproducibility; commit automation must still avoid unrelated file staging.

### 2026-02-15 - Use pre-handoff dry-run review before enabling auto-commit
- Decision: run pre-handoff update in non-commit mode first and review clusters before any `COMMIT=YES` execution.
- Why: maintain commit safety in a dirty working tree and avoid bundling unrelated changes.
- Alternatives considered: immediate auto-commit execution from first handoff run.
- Evidence:
  - `docs/context/current-state.md` (validation ledger entry for dry-run clustering)
- Validation/risk impact: reduces accidental commit scope bleed; adds one manual review step.

### 2026-02-15 - Execute clustered auto-commit flow after dry-run review
- Decision: proceed with `COMMIT=YES` and commit clusters sequentially after dry-run cluster validation.
- Why: user requested end-to-end test of automated pre-handoff clustering + commit workflow.
- Alternatives considered: keep dry-run only and defer commits to manual execution.
- Evidence:
  - Git commit `9f2e95c` (`docs(preview): add m4 packet and relocate design preview assets`)
  - `docs/context/current-state.md` validation ledger entry for auto-commit execution
- Validation/risk impact: confirms automation workflow viability; reinforces requirement to keep cluster boundaries strict.

### Inferred from repo state - Framework and viewer stack are fixed to Vue 2 + NGL
- Decision: build on Vue 2 + TypeScript + Vuetify + Vuex + Vue Router; use NGL for 3D.
- Why: consistent with scaffold and milestones already implemented.
- Alternatives considered: Vue 3 / React / Mol* / 3Dmol.js were not chosen in current code.
- Evidence:
  - `package.json`
  - `src/main.ts`
  - `src/plugins/vuetify.ts`
  - `src/viewer/nglStage.ts`
  - `docs/plans/technical-plan.md`
- Validation/risk impact: stable foundation for M1-M3; legacy-stack maintenance risk remains.

### Inferred from repo state - Asset pipeline is generated-manifest-first
- Decision: runtime assets are staged into `public/assets` and consumed via generated `manifest.json`.
- Why: deterministic runtime paths and manifest-driven startup validation.
- Alternatives considered: hardcoded in-app asset list or dynamic filesystem discovery in browser.
- Evidence:
  - `scripts/stage-assets.js`
  - `src/data/manifest.ts`
  - `src/startup/startupValidation.ts`
- Validation/risk impact: enabled successful `validate:m2`; staging step is now a hard dependency.

### Inferred from repo state - Startup validation is non-blocking with disable-intent metadata
- Decision: missing assets do not block app startup; warnings and disable-intent metadata are surfaced.
- Why: keep viewer usable even with partial asset issues.
- Alternatives considered: hard-fail startup when any asset is missing.
- Evidence:
  - `src/startup/startupValidation.ts`
  - `src/store/modules/startup.ts`
  - `src/App.vue`
  - `scripts/validate-m2.js`
- Validation/risk impact: resilient startup behavior; requires control-level enforcement in later milestones.

### Inferred from repo state - M3 validation relies on debug hooks and query-flag fault injection
- Decision: expose `window.__viewerM3Debug` and query switches (`m3StageFail`, `m3LoadMs`) to validate lifecycle/failure paths.
- Why: deterministic verification of stage lifecycle and fallback behavior.
- Alternatives considered: purely black-box UI checks without internal telemetry.
- Evidence:
  - `src/viewer/nglStage.ts`
  - `src/pages/ViewerPage.vue`
  - `scripts/validate-m3.js`
- Validation/risk impact: strong M3 gate confidence; debug surface should remain intentional and controlled.

### Inferred from execution-plan policy - Local host-terminal outputs are the validation source of truth
- Decision: treat local host-terminal validation output as authoritative; classify tooling/sandbox inability as `ENV-BLOCKED`.
- Why: aligns milestone gating with reproducible environment policy in execution plan.
- Alternatives considered: relying on agent-only runs even when blocked.
- Evidence:
  - `docs/plans/execution-plan.md` Section 1.2
  - `prompts/implementation.md` validation policy
- Validation/risk impact: reduces false negatives from sandbox limits and keeps milestone status defensible.

## Inferred Implicit Decisions (not previously logged as such)

### Inferred from repo state - M1-M3-first execution ordering is being followed in practice
- Decision: implement and validate M1-M3 before ligand/fragmap/overview feature completeness.
- Why: current code and scripts cover M1-M3 deeply while M4+ remains absent.
- Evidence:
  - `scripts/validate-m1.js`
  - `scripts/validate-m2.js`
  - `scripts/validate-m3.js`
  - absence of M4+ validation scripts in `package.json`
- Validation/risk impact: foundation is stable; feature gap risk is concentrated in M4-M8.

### Inferred from repo state - Build-time asset size warnings are accepted at current stage
- Decision: proceed despite large bundle and map asset size warnings during production build.
- Why: milestone validation currently prioritizes behavior correctness over optimization.
- Evidence:
  - `npm run validate:m3` build output (asset/entrypoint size warnings)
- Validation/risk impact: potential AC-1/AC-2/AC-5 performance risk for later milestones.

### Inferred from repo state - Execution-plan Playwright command contract has not been implemented yet
- Decision: continue using milestone-specific validators (`validate:m1..m3`) while full Playwright command contract is pending.
- Why: repository currently contains milestone validators but lacks `tests/e2e` structure and `playwright.config.ts`.
- Evidence:
  - `package.json` scripts
  - missing `tests/` and missing `playwright.config.ts`
  - `docs/plans/execution-plan.md` Section 1.1
- Validation/risk impact: acceptable for current M1-M3 evidence, but creates a gap for M7/M8 automation expectations.

## Backfill Notes
- Where exact historical dates are unknown, entries are marked `Inferred from repo state`.
- Add new entries for all behavior-changing decisions before implementation expands into M4+.
