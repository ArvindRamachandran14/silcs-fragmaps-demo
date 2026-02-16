# Decision Log

Last updated: 2026-02-16
Purpose: persistent technical memory reconstructed from repo evidence.

## Explicit Documented Decisions

### 2026-02-16 - Accept M5.6 Prompt-A preview and unblock Prompt-B runtime slice
- Decision: accept `M5.6` Prompt-A preview via explicit in-thread `APPROVED UI PREVIEW` token and advance to `M5.6` Prompt-B implementation scope.
- Why: reviewer approval satisfies the UI-first design gate for `M5.6`, allowing reliability hardening and final M5 gate execution.
- Alternatives considered:
  - keep `M5.6` in `BLOCKED-DESIGN` and request additional Prompt-A revisions.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.6-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: no runtime behavior changed in this approval-record update; Prompt-B implementation is now permitted for `M5.6` only.

### 2026-02-16 - Implement M5.6 reliability hardening and close final M5 gate
- Decision: complete `M5.6` Prompt B by replacing global FragMap row lock with per-row async intent guards, adding row-level retry for failed rows, preserving latest-intent outcomes under rapid toggle races, and adding final M5 umbrella validation command coverage.
- Why: this is the approved `M5.6` scope and required final gate to close M5 before advancing to `M6`.
- Alternatives considered:
  - retain global row-lock behavior during map loads;
  - defer row-level retry and stale-intent protections to later milestones.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
  - `src/viewer/nglStage.ts`
  - `scripts/validate-m5-6.js`
  - `scripts/validate-m5.js`
  - `package.json`
  - `scripts/run_checks.sh`
  - `docs/plans/milestone-inventory.md`
- Validation/risk impact: `npm run build`, `node scripts/validate-m5-6.js`, and `bash scripts/run_checks.sh` pass through `validate:m5.6`; `npm run validate:m5` first sandboxed run was `ENV-BLOCKED` (`listen EPERM 127.0.0.1:4176`) and unsandboxed rerun passed. M5 is now fully closed; next required scope is `M6` Prompt A.

### 2026-02-16 - Execute M5.6 Prompt A as docs-only reliability/final-gate preview and keep Prompt B blocked pending approval
- Decision: produce `M5.6` Prompt-A design artifacts (`default/loading/empty/error/success`) and update packet tracking while keeping runtime implementation blocked until explicit in-thread `APPROVED UI PREVIEW`.
- Why: the UI-first protocol requires a design gate before user-facing reliability-hardening behavior is implemented.
- Alternatives considered:
  - start `M5.6` Prompt B without new Prompt-A artifacts;
  - split Prompt-A states into separate files instead of one multi-panel sheet.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.6-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.6-reliability-final-gate-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
  - `docs/plans/milestone-inventory.md`
- Validation/risk impact: docs-only change; milestone validators were intentionally not run in this window. Risk remains that `M5.6` runtime scope is blocked until approval token is provided.

### 2026-02-16 - Accept M5.5a Prompt-A preview and unblock Prompt-B runtime slice
- Decision: accept `M5.5a` Prompt-A preview via explicit in-thread `APPROVED UI PREVIEW` token and advance to `M5.5a` Prompt-B implementation scope.
- Why: reviewer approval satisfies the UI-first design gate for `M5.5a`, allowing reset-semantics refinement to proceed.
- Alternatives considered:
  - keep `M5.5a` in `BLOCKED-DESIGN` and request additional Prompt-A revisions.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5a-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: no runtime behavior changed in this approval-record update; Prompt-B implementation is now permitted for `M5.5a` only.

### 2026-02-16 - Implement M5.5a iso-only reset semantics (visibility preserved, no retry side-effects)
- Decision: complete `M5.5a` Prompt B by refining `Reset defaults` to reset per-map iso values only, preserve current visibility, and avoid row retry/recovery side-effects.
- Why: this is the approved M5.5a scope and aligns runtime behavior with the locked fragmap spec bulk-action semantics.
- Alternatives considered:
  - keep prior M5.5 reset behavior that hid all maps;
  - couple reset semantics changes with reliability/retry behavior (deferred to `M5.6`).
- Evidence:
  - `src/pages/ViewerPage.vue`
  - `src/components/ControlsPanel.vue`
  - `scripts/validate-m5-5.js`
  - `docs/plans/milestone-inventory.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5a-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: `npm run build`, `node scripts/validate-m5-5.js`, and full sequential `bash scripts/run_checks.sh` all pass; next required slice is `M5.6`.

### 2026-02-16 - Execute M5.5a Prompt A as a single multi-panel reset-semantics preview page
- Decision: produce `M5.5a` Prompt-A artifacts as one desktop multi-panel SVG (`default/loading/empty/error/success`) plus updated packet metadata/index while keeping milestone approval state at `BLOCKED-DESIGN` until explicit `APPROVED UI PREVIEW`.
- Why: this satisfies the UI-first design gate for `M5.5a` and makes iso-only `Reset defaults` semantics reviewable before runtime changes.
- Alternatives considered:
  - skip Prompt-A artifacts and implement `M5.5a` behavior directly;
  - split `M5.5a` previews into separate files per state.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.5a-reset-defaults-iso-only-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5a-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: docs-only design artifact update; no runtime behavior changes in this step; Prompt B remains blocked pending explicit approval.

### 2026-02-16 - Insert M5.5a mini-slice to refine `Reset defaults` to iso-only semantics
- Decision: add required slice `M5.5a` between `M5.5` and `M5.6` with narrow scope: `Reset defaults` resets per-map iso values to defaults and leaves map visibility unchanged.
- Why: reviewer feedback identified current `Reset defaults` behavior (also hiding maps) as unintuitive for bulk-action semantics.
- Alternatives considered:
  - keep current `M5.5` behavior where `Reset defaults` resets visibility and iso together;
  - defer the semantic change into `M5.6` reliability hardening.
- Evidence:
  - `docs/specs/fragmap-controls-spec.md`
  - `docs/plans/execution-plan.md`
  - `docs/plans/technical-plan.md`
  - `docs/plans/milestone-inventory.md`
  - `prompts/implementation.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5a-preview-index.md`
  - `docs/context/current-state.md`
  - `docs/context/next-agent-brief.md`
- Validation/risk impact: docs/planning-only change in this step; runtime still reflects pre-`M5.5a` behavior until Prompt A approval and Prompt B implementation are completed.

### 2026-02-16 - Accept M5.5 Prompt-A preview and unblock Prompt-B runtime slice
- Decision: accept `M5.5` Prompt-A preview via explicit in-thread `APPROVED UI PREVIEW` token and advance to `M5.5` Prompt-B implementation scope.
- Why: reviewer approval satisfies the UI-first design gate for `M5.5`, allowing bulk-action runtime implementation to proceed.
- Alternatives considered:
  - keep `M5.5` in `BLOCKED-DESIGN` and request additional Prompt-A revisions.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: no runtime behavior changed in this approval-record update; Prompt-B implementation is now permitted for `M5.5` only.

### 2026-02-16 - Implement M5.5 bulk actions (`Hide all`, `Reset defaults`) and keep camera reset top-bar only
- Decision: complete `M5.5` Prompt B by implementing in-panel `Hide all` and `Reset defaults` behavior only, removing in-panel `Reset view`, and preserving top-bar `Reset View` as the sole camera-reset control.
- Why: approved scope for `M5.5` is FragMap-specific bulk actions; duplicate reset controls were reviewer-identified UX confusion.
- Alternatives considered:
  - retain in-panel `Reset view` with duplicated camera-reset behavior;
  - defer bulk-action runtime behavior to `M5.6` (rejected to keep required slice progression intact).
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
  - `src/viewer/nglStage.ts`
  - `scripts/validate-m5-1.js`
  - `scripts/validate-m5-5.js`
  - `package.json`
  - `scripts/run_checks.sh`
  - `docs/plans/milestone-inventory.md`
- Validation/risk impact: `node scripts/validate-m5-5.js` passes and full sequential `bash scripts/run_checks.sh` passes through `validate:m5.5`; remaining M5 work is `M5.6` reliability hardening.

### 2026-02-16 - Remove in-panel `Reset view` from M5.5 bulk-actions contract
- Decision: keep `M5.5` bulk actions scoped to `Hide all` and `Reset defaults` only; remove in-panel `Reset view` from Prompt-A artifacts and keep camera reset as top-bar viewer control.
- Why: reviewer confirmed duplicate reset controls are confusing; FragMap-panel actions should remain FragMap-specific.
- Alternatives considered:
  - keep in-panel `Reset view` and document it as equivalent to top-bar reset;
  - defer this contract change to `M5.6` (rejected because this is a design-scope clarification for active `M5.5` Prompt A).
- Evidence:
  - `docs/specs/fragmap-controls-spec.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.5-bulk-actions-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
  - `docs/plans/execution-plan.md`
  - `docs/plans/milestone-inventory.md`
  - `prompts/implementation.md`
- Validation/risk impact: docs-only contract update; no runtime behavior changes in this window. `M5.5` remains `BLOCKED-DESIGN` pending explicit Prompt-A approval.

### 2026-02-16 - Execute M5.5 Prompt A as a single multi-panel bulk-actions preview page
- Decision: produce `M5.5` Prompt-A artifacts as one desktop multi-panel SVG (`default/loading/empty/error/success`) plus a dedicated `m5.5-preview-index.md`, while keeping milestone approval state at `BLOCKED-DESIGN` until explicit `APPROVED UI PREVIEW`.
- Why: this satisfies the UI-first design gate for `M5.5` and makes `Hide all` / `Reset defaults` behavior reviewable before runtime implementation.
- Alternatives considered:
  - split `M5.5` previews into separate files per state;
  - defer Prompt-A artifacts and move directly into `M5.5` Prompt-B runtime work (rejected by design gate policy).
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.5-bulk-actions-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: docs-only design artifact update; no runtime behavior changes in this window; Prompt B remains blocked pending explicit approval.

### 2026-02-16 - Align M5.4 header row to explicit two-column table contract (`FragMap` + centered `GFE (kcal/mol)`)
- Decision: render a visible `FragMap` column heading in Primary and Advanced sections and center `GFE (kcal/mol)` over the iso control/value column (rather than right-aligning to panel edge).
- Why: reviewer feedback requested stronger visual column semantics and more direct units-to-value alignment.
- Alternatives considered:
  - keep only a right-aligned `GFE (kcal/mol)` label with no left column heading;
  - place `FragMap` heading once at panel level instead of section-level headers.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `scripts/validate-m5-4.js`
- Validation/risk impact: no change to runtime iso behavior; M5.4 and full sequential regression are green after the visual contract update.

### 2026-02-16 - Refine M5.4 iso layout to inline row controls and add explicit `GFE (kcal/mol)` headings
- Decision: update the M5.4 controls presentation so each row renders `- value +` inline with the map label (instead of a separate line below), and add visible `GFE (kcal/mol)` headings for Primary and Advanced sections.
- Why: reviewer-confirmed usability feedback requested tighter row scanning and explicit units context parity with the reference SILCS GUI.
- Alternatives considered:
  - keep controls on a separate row under each map label;
  - add units text only in helper copy without a section heading.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `scripts/validate-m5-4.js`
- Validation/risk impact: targeted M5.4 validator and full sequential regression are green; scope remains within M5.4 UI presentation (no change to iso semantics or runtime contracts).

### 2026-02-16 - Accept M5.4 Prompt-A preview and unblock Prompt-B runtime slice
- Decision: accept `M5.4` Prompt-A preview via explicit in-thread `APPROVED UI PREVIEW` token and advance to `M5.4` Prompt-B implementation scope.
- Why: reviewer approval satisfies the UI-first design gate for `M5.4`, allowing runtime implementation of per-map iso controls.
- Alternatives considered:
  - keep `M5.4` in `BLOCKED-DESIGN` and request additional Prompt-A revisions.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.4-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: no runtime behavior changed in this approval-record update; Prompt-B implementation is now permitted for `M5.4` only.

### 2026-02-16 - Implement M5.4 as per-map iso controls with row-level clamp/revert and Exclusion iso lock
- Decision: complete `M5.4` Prompt B by adding row-level iso controls (`-`, value, `+`) for adjustable FragMap rows, enforcing numeric contract (`step 0.1`, `min -3.0`, `max 0.0`, precision `1`, clamp/revert), preserving Exclusion row non-editable iso behavior, and applying iso updates in place with camera preservation.
- Why: this is the approved M5.4 slice scope and unblocks progression to bulk-action slice `M5.5`.
- Alternatives considered:
  - defer per-map iso controls and jump directly to bulk actions;
  - introduce row-level retry/error-hardening in M5.4 (rejected to keep reliability work in M5.6).
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
  - `src/viewer/nglStage.ts`
  - `scripts/validate-m5-4.js`
  - `package.json`
  - `scripts/run_checks.sh`
  - `docs/plans/milestone-inventory.md`
- Validation/risk impact: sequential regression through `validate:m5.4` is green; next required slice is `M5.5`.

### 2026-02-16 - Execute M5.4 Prompt A as a single multi-panel per-map-iso preview page
- Decision: produce `M5.4` Prompt-A artifacts as one desktop multi-panel SVG (`default/loading/empty/error/success`) plus a dedicated `m5.4-preview-index.md`, while keeping milestone approval state at `BLOCKED-DESIGN` until explicit `APPROVED UI PREVIEW`.
- Why: this satisfies the UI-first design gate for `M5.4` and keeps per-map iso controls reviewable before runtime implementation.
- Alternatives considered:
  - split `M5.4` previews into separate images per state;
  - move directly to Prompt-B implementation without a completed Prompt-A artifact set.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.4-per-map-iso-controls-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.4-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: docs-only design artifact update; no runtime behavior changes in this window; Prompt B remains blocked pending explicit approval.

### 2026-02-16 - Optimize `run_checks.sh` to build once and execute validators directly
- Decision: keep one upfront `npm run build` in `scripts/run_checks.sh`, then execute milestone validators via direct `node scripts/validate-*.js` commands (instead of `npm run validate:*` wrappers), while preserving command order and the existing one-time M1 retry.
- Why: each `npm run validate:*` wrapper triggers `prevalidate:*` hooks that rebuild the app repeatedly, significantly lengthening full regression time.
- Alternatives considered:
  - keep current wrapper-based calls and accept repeated builds;
  - remove `prevalidate:*` hooks from `package.json` (rejected to preserve standalone validator safety outside `run_checks.sh`).
- Evidence:
  - `scripts/run_checks.sh`
- Validation/risk impact: `bash scripts/run_checks.sh` now performs a single build and still passes through `validate:m5.3`; direct-node calls rely on the upfront build step, so ad-hoc standalone runs should continue using `npm run validate:*` when prevalidate hooks are desired.

### 2026-02-16 - Fix Exclusion-map visibility by using a dedicated positive fixed isolevel
- Decision: keep Exclusion map iso controls disabled in UI, but set an internal fixed Exclusion render isolevel to `0.5` in `src/viewer/nglStage.ts` instead of inheriting the generic fallback `-0.8`.
- Why: `3fly.excl.dx` is non-negative (`min=0`), so contouring at `-0.8` produces no visible mesh despite checked/loaded state.
- Alternatives considered:
  - keep `-0.8` fallback and treat no visible Exclusion mesh as acceptable;
  - make Exclusion iso editable in M5.3 (out of slice scope).
- Evidence:
  - `src/viewer/nglStage.ts`
  - `scripts/validate-m5-3.js`
  - `docs/screenshots/Bugs/Exclusion_Map_bug.png`
- Validation/risk impact: targeted Exclusion visibility bug is fixed; `npm run validate:m5.3` passes on unsandboxed host run; M5.3 scope boundaries remain intact (Exclusion iso still non-editable).

### 2026-02-16 - Accept M5.3 Prompt-A preview and unblock Prompt-B runtime slice
- Decision: accept `M5.3` Prompt-A preview via explicit in-thread `APPROVED UI PREVIEW` token and advance to `M5.3` Prompt-B implementation scope.
- Why: reviewer approval satisfies the UI-first design gate for `M5.3`, allowing runtime implementation of Advanced rows + Exclusion behavior.
- Alternatives considered:
  - keep `M5.3` in `BLOCKED-DESIGN` and request additional Prompt-A revisions.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.3-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: no runtime behavior changed in this approval-record update; Prompt-B implementation is now permitted for `M5.3` only.

### 2026-02-16 - Implement M5.3 as Advanced-row runtime flow plus Exclusion fixed-behavior constraints
- Decision: complete `M5.3` Prompt B by enabling in-place Advanced row visibility toggles (with default-collapsed Advanced section) and Exclusion-row constraints (toggleable visibility, fixed gray wireframe rendering, iso-editing disabled cue), while preserving M5.1-M5.2b contracts and deferring per-map iso controls/reliability hardening.
- Why: this is the approved M5.3 slice scope and unblocks progress to `M5.4` without coupling in later-slice behavior.
- Alternatives considered:
  - keep Advanced rows disabled until `M5.4`;
  - bundle per-map iso controls into `M5.3` instead of preserving slice boundaries.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
  - `scripts/validate-m5-3.js`
  - `scripts/validate-m5-1.js`
  - `scripts/validate-m5-2.js`
  - `package.json`
  - `scripts/run_checks.sh`
  - `docs/plans/milestone-inventory.md`
- Validation/risk impact: full sequential regression through `validate:m5.3` is green after a validator wait fix; next required slice is `M5.4`.

### 2026-02-16 - Reclassify M5.2c as optional exploratory investigation; required flow resumes at M5.3 after M5.2b
- Decision: make `M5.2c` non-blocking exploratory scope and set required milestone progression to `M5.1` -> `M5.2` -> `M5.2a` -> `M5.2b` -> `M5.3` -> `M5.4` -> `M5.5` -> `M5.6`.
- Why: parity tuning remains unresolved and should not block delivery of required M5 behavior slices.
- Alternatives considered:
  - keep `M5.2c` as a required gated runtime slice before `M5.3`;
  - drop all parity investigation artifacts completely.
- Evidence:
  - `docs/plans/execution-plan.md`
  - `docs/plans/milestone-inventory.md`
  - `docs/plans/technical-plan.md`
  - `docs/context/current-state.md`
  - `docs/context/next-agent-brief.md`
  - `docs/investigations/m5.2c-wireframe-parity-investigation.md`
- Validation/risk impact: no functional runtime changes; planning/context docs now clearly route implementation from `M5.2b` to `M5.3`, with parity retained as deferred investigation only.

### 2026-02-16 - Defer deeper M5.2c wireframe parity investigation until after active M5 slice flow
- Decision: park the unresolved wireframe parity deep-dive as a documented investigation packet and continue milestone execution on `M5.3`..`M5.6` instead of continuing speculative code tuning now.
- Why: current parity tuning did not close the screenshot gap with confidence, and further implementation changes are high-risk without clearer evidence (data provenance, iso convention parity, renderer parity).
- Alternatives considered:
  - continue immediate renderer tuning/code changes in `src/viewer/nglStage.ts`;
  - revert M5.2c changes and abandon parity tracking.
- Evidence:
  - `docs/investigations/m5.2c-wireframe-parity-investigation.md`
  - `docs/context/current-state.md`
  - `docs/context/next-agent-brief.md`
  - `docs/plans/milestone-inventory.md`
- Validation/risk impact: no runtime behavior changed in this decision update; preserves forward milestone momentum while retaining a reproducible resume path for parity work.

### 2026-02-16 - Implement M5.2c parity profile `m5.2c-v1` as render-parameter tuning only
- Decision: complete `M5.2c` Prompt B by tuning wireframe surface render parameters in `src/viewer/nglStage.ts` to parity profile `m5.2c-v1` (`opacity: 0.9`, `opaqueBack: true`) while preserving triangulated wireframe representation, map IDs/default iso values, and existing map/protein/ligand behavior contracts.
- Why: approved Prompt-A artifacts require a focused visual parity pass without expanding runtime behavior scope.
- Alternatives considered:
  - keep M5.2a parameters unchanged and defer parity tuning to later slices;
  - combine parity tuning with `M5.3` behavior changes (rejected to avoid coupling style and behavior risk).
- Evidence:
  - `src/viewer/nglStage.ts`
  - `scripts/validate-m5-2c.js`
  - `scripts/validate-m5-2a.js`
  - `package.json`
  - `scripts/run_checks.sh`
  - `docs/plans/milestone-inventory.md`
- Validation/risk impact: sequential regression through `validate:m5.2c` is green; remaining M5 runtime scope is now `M5.3`..`M5.6`.

### 2026-02-16 - Accept `M5.2c` Prompt-A preview and unblock Prompt-B runtime slice
- Decision: accept `M5.2c` Prompt-A preview via explicit in-thread `APPROVED UI PREVIEW` token and advance to `M5.2c` Prompt B implementation scope.
- Why: reviewer approval satisfies the UI-first gate for `M5.2c`, so runtime parity-tuning work can proceed without crossing slice boundaries.
- Alternatives considered:
  - keep `M5.2c` in `BLOCKED-DESIGN` and request additional preview revisions.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2c-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
  - `docs/context/current-state.md`
  - `docs/context/next-agent-brief.md`
- Validation/risk impact: no runtime behavior changed in this approval-record update; next executable step is `M5.2c` Prompt B only.

### 2026-02-16 - Execute `M5.2c` Prompt A as a single multi-panel parity-preview page
- Decision: produce `M5.2c` Prompt-A artifacts as one multi-panel desktop SVG (`default/loading/empty/error/success`) plus updated packet metadata, while keeping approval state at `BLOCKED-DESIGN` until explicit `APPROVED UI PREVIEW`.
- Why: this satisfies the UI-first gate for the new `M5.2c` slice and keeps parity tuning reviewable before any runtime changes.
- Alternatives considered:
  - split `M5.2c` preview into separate files per state;
  - defer Prompt-A artifact creation and move directly to runtime tuning.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2c-wireframe-parity-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2c-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: docs-only design artifact update; no runtime behavior changes in this window; Prompt B remains blocked pending explicit approval.

### 2026-02-16 - Insert `M5.2c` mini-slice for wireframe parity tuning before `M5.3`
- Decision: add a dedicated `M5.2c` slice between `M5.2b` and `M5.3` for wireframe visual parity tuning only, with strict behavior lock (no map/protein/ligand control behavior changes, no map ID/label/default-iso changes).
- Why: reviewer requested a focused parity pass to align wireframe appearance with reference SILCS screenshots before continuing to new behavior slices.
- Alternatives considered:
  - fold parity tuning into `M5.3` and couple style calibration with Advanced/Exclusion behavior changes;
  - defer parity tuning until `M5.6`, risking repeated visual churn during later slices.
- Evidence:
  - `docs/plans/execution-plan.md`
  - `docs/plans/milestone-inventory.md`
  - `docs/plans/technical-plan.md`
  - `docs/specs/fragmap-controls-spec.md`
  - `prompts/implementation.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2c-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.3-preview-index.md`
- Validation/risk impact: docs-only planning/spec update with no runtime changes in this window; next execution target is `M5.2c` Prompt A and remains `BLOCKED-DESIGN` until explicit `APPROVED UI PREVIEW`.

### 2026-02-16 - Add one-time M1 retry in `run_checks.sh` to reduce false overall FAILs
- Decision: update `scripts/run_checks.sh` so `npm run validate:m1` is retried once automatically before marking the command as failed.
- Why: `validate:m1` has an intermittent harness flake; a single retry avoids frequent false negatives while preserving strict failure behavior for persistent regressions.
- Alternatives considered:
  - keep current behavior and require manual reruns;
  - add retries for all validators (rejected to avoid masking real failures in later milestones).
- Evidence:
  - `scripts/run_checks.sh`
- Validation/risk impact: lowers false overall FAIL noise for routine sequential runs; persistent M1 failures still fail the script after the retry.

### 2026-02-16 - Implement M5.2b as a tab-row `Show Protein` runtime toggle with camera-preserving stage updates
- Decision: complete `M5.2b` Prompt B by wiring an in-place `Show Protein` checkbox in the right-panel tab row that toggles protein-cartoon visibility (`ON` by default) through a dedicated stage API, while preserving map/ligand contracts and camera state.
- Why: this is the approved M5.2b slice scope and addresses the reviewer-prioritized need to reduce protein visual noise during FragMap/ligand overlap inspection without introducing broader M5.3+ behavior.
- Alternatives considered:
  - defer protein visibility to `M5.3`/`M5.6` and keep current always-on protein rendering;
  - place protein toggle as an in-panel row instead of the approved tab-row control.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
  - `src/store/modules/viewer.ts`
  - `src/viewer/nglStage.ts`
  - `scripts/validate-m5-2b.js`
  - `package.json`
  - `scripts/run_checks.sh`
- Validation/risk impact: sequential regression through `validate:m5.2b` is green after a validator-only fix for hidden diagnostics selector waiting semantics; remaining M5 work is now `M5.3`..`M5.6`.

### 2026-02-16 - Accept M5.2b Prompt-A preview and unblock Prompt-B runtime slice
- Decision: accept `M5.2b` Prompt-A preview via explicit in-thread `APPROVED UI PREVIEW` token and advance to `M5.2b` Prompt B implementation scope.
- Why: reviewer confirmed the final tab-row `Show Protein` design adjustments are approved, satisfying the UI-first gate requirement for this slice.
- Alternatives considered:
  - keep `M5.2b` in `BLOCKED-DESIGN` and request additional Prompt-A revisions.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2b-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: runtime implementation is now permitted for `M5.2b` only; no runtime behavior changed in this approval-record update.

### 2026-02-16 - Enforce tab-label font and checkbox-style parity for M5.2b `Show Protein`
- Decision: update the `M5.2b` Prompt-A artifact so `Show Protein` uses the same tab-label font class as `FragMap` and `Ligand`, and render the `Show Protein` control with the same checkbox style family used for existing map/ligand rows (including a disabled variant during loading).
- Why: reviewer requested visual consistency and explicit reuse of established UI control styling.
- Alternatives considered:
  - keep prior `body`/`muted` text classes for `Show Protein`;
  - keep prior green-highlight `checkbox-on` style for `Show Protein` checked state.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2b-protein-visibility-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2b-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: docs-only visual refinement; no runtime behavior impact; design gate remains `BLOCKED-DESIGN` pending explicit `APPROVED UI PREVIEW`.

### 2026-02-16 - Center `Show Protein` text+checkbox cluster inside M5.2b tab-row pill
- Decision: keep the `Show Protein` control in the tab row, and center the text plus checkbox as one grouped cluster within the pill (with small fixed spacing between label and checkbox) across all M5.2b state panels.
- Why: reviewer requested visual parity with centered `FragMap`/`Ligand` tab labels and clearer alignment consistency.
- Alternatives considered:
  - keep left-aligned label with right-anchored checkbox;
  - center text only while keeping checkbox pinned to pill edge.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2b-protein-visibility-states.svg`
- Validation/risk impact: docs-only visual refinement; no runtime behavior impact; design gate remains `BLOCKED-DESIGN` pending explicit `APPROVED UI PREVIEW`.

### 2026-02-16 - Place M5.2b protein toggle in tab row as `Show Protein` control
- Decision: revise `M5.2b` Prompt-A preview so protein visibility is controlled by a tab-row `Show Protein` checkbox positioned to the right of `FragMap` and `Ligand`, instead of a separate in-panel row.
- Why: reviewer clarified the intended control placement and requested explicit alignment before approving the design gate.
- Alternatives considered:
  - keep protein visibility as a top row within FragMap rows;
  - keep both tab-row and in-panel controls (duplicate affordance).
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2b-protein-visibility-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2b-preview-index.md`
- Validation/risk impact: docs-only Prompt-A revision; design gate remains `BLOCKED-DESIGN` pending explicit `APPROVED UI PREVIEW`.

### 2026-02-16 - Execute M5.2b Prompt A as one multi-panel state sheet with no open UI questions
- Decision: represent `M5.2b` Prompt-A coverage in one desktop multi-panel SVG (`default/loading/empty/error/success`) and keep open UI questions explicitly empty for this slice.
- Why: this satisfies the per-slice design-gate requirement while keeping the protein-visibility change isolated and reviewable before runtime implementation.
- Alternatives considered:
  - split `M5.2b` previews into separate per-state images;
  - defer explicit loading/error panel treatment and provide only default/success.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2b-protein-visibility-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2b-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: design gate remains `BLOCKED-DESIGN` until explicit `APPROVED UI PREVIEW`; no runtime behavior changed in this step.

### 2026-02-16 - Insert `M5.2b` mini-slice for protein visibility toggle before `M5.3`
- Decision: add a dedicated `M5.2b` slice between `M5.2a` and `M5.3` for one behavior only: in-place `Protein cartoon` show/hide in the FragMap tab (default `ON`), with no map/ligand behavior expansion in the same slice.
- Why: reviewer feedback prioritized overlap inspection between ligand and FragMaps; isolating this behavior keeps risk and gate evidence separate from upcoming Advanced/Exclusion behavior work.
- Alternatives considered:
  - fold protein visibility into `M5.3` and keep prior slice sequence;
  - defer protein visibility to `M5.6` reliability scope.
- Evidence:
  - `docs/plans/execution-plan.md`
  - `docs/plans/milestone-inventory.md`
  - `prompts/implementation.md`
  - `docs/specs/viewer-core-spec.md`
  - `docs/specs/fragmap-controls-spec.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2b-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.3-preview-index.md`
- Validation/risk impact: docs-only change with no runtime impact in this window; next execution target is `M5.2b` Prompt A and remains `BLOCKED-DESIGN` pending preview approval.

### 2026-02-16 - Implement M5.2a as a rendering-only change in `nglStage` with fixed exclusion-style enforcement
- Decision: complete `M5.2a` by changing FragMap representation parameters in `src/viewer/nglStage.ts` from filled/translucent surface style to wireframe surface style (`wireframe: true`, `opacity: 1`) and enforce fixed Exclusion-map color (`#9e9e9e`) by ID (`3fly.excl.dx`), while preserving existing M5.2 interaction behavior.
- Why: this satisfies the approved M5.2a runtime contract without crossing into M5.3 control-behavior scope.
- Alternatives considered:
  - defer style change until M5.3 and combine with Advanced/Exclusion behavior updates;
  - implement wireframe via separate representation types or overlay-only lines instead of parameterized surface reps.
- Evidence:
  - `src/viewer/nglStage.ts`
  - `scripts/validate-m5-2a.js`
  - `package.json`
  - `scripts/run_checks.sh`
- Validation/risk impact: sequential regression through `validate:m1`..`validate:m5.2a` is green; Advanced/Exclusion interaction logic remains intentionally deferred to M5.3+.

### 2026-02-16 - Accept M5.2a Prompt-A preview and unblock Prompt-B runtime slice
- Decision: accept `M5.2a` Prompt-A wireframe preview via explicit `APPROVED UI PREVIEW` token and advance to `M5.2a` Prompt B implementation scope.
- Why: reviewer confirmed the approved design direction for wireframe rendering, satisfying the UI-first gate requirement.
- Alternatives considered:
  - keep the slice in `BLOCKED-DESIGN` and request additional preview revisions before runtime work.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2a-preview-index.md`
- Validation/risk impact: runtime implementation is now permitted for `M5.2a` only; behavior scope boundaries remain unchanged.

### 2026-02-16 - Execute M5.2a Prompt-A as one multi-panel state sheet with explicit open UI questions
- Decision: represent `M5.2a` Prompt-A coverage in a single multi-panel SVG (`default/loading/empty/error/success`) and capture two targeted UI review questions (wireframe line weight and occluded-edge visibility) in the preview index.
- Why: execution plan Section 1.3 allows one per-slice multi-panel page, and explicit UI questions reduce ambiguity before `M5.2a` Prompt-B runtime work.
- Alternatives considered:
  - split `M5.2a` into multiple standalone images by state;
  - mark no open UI questions and defer style calibration decisions to implementation.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2a-wireframe-rendering-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2a-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: at decision time the design gate remained `BLOCKED-DESIGN`; this was superseded later the same day by explicit `APPROVED UI PREVIEW` and subsequent M5.2a Prompt-B implementation.

### 2026-02-16 - Insert `M5.2a` mini-slice to isolate wireframe rendering change before `M5.3`
- Decision: add a dedicated `M5.2a` slice between `M5.2` and `M5.3` for rendering-style conversion only (triangulated wireframe), without bundling this visual change into `M5.3` behavior work.
- Why: this reduces integration risk by separating representation-style change from upcoming Advanced/Exclusion control behavior, keeping gate evidence and rollback boundaries cleaner.
- Alternatives considered:
  - fold wireframe conversion into `M5.3` and keep existing six-slice order;
  - renumber all downstream slices (`M5.3` -> `M5.4`, etc.), causing broader doc churn.
- Evidence:
  - `docs/plans/execution-plan.md`
  - `docs/plans/milestone-inventory.md`
  - `prompts/implementation.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2a-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: isolates rendering-risk from behavior-risk; no runtime changes in this docs-only update.

### 2026-02-16 - Lock FragMap rendering contract to triangulated wireframe style for all rows (including Exclusion)
- Decision: update the M5 FragMap rendering contract from filled/translucent surface wording to triangulated wireframe isosurface wording, and explicitly apply it to `Exclusion Map` as fixed gray wireframe with iso controls still disabled.
- Why: reviewer requested visual parity with reference SILCS screenshots that show edge-visible triangulated mesh-like map rendering rather than blob-like translucent fills.
- Alternatives considered:
  - keep current filled translucent style for all maps;
  - use mixed style (wireframe for primary/advanced, translucent for `Exclusion Map`).
- Evidence:
  - `docs/specs/fragmap-controls-spec.md`
  - `docs/plans/technical-plan.md`
  - `docs/plans/execution-plan.md`
  - `docs/plans/milestone-inventory.md`
  - `prompts/implementation.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.3-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: aligns design and implementation targets before M5.3 work begins; no runtime behavior changed in this docs-only step.

### 2026-02-16 - Treat milestone validators as strictly sequential (no parallel launch) to avoid false gate failures
- Decision: run Playwright-backed milestone validators one at a time (`validate:m1` -> `validate:mN`) and avoid parallel validator launches in the same window.
- Why: concurrent runs caused non-product failures (`EADDRINUSE` on shared localhost ports), and even sequential runs can show occasional startup timing noise that needs clean reruns for authoritative evidence.
- Alternatives considered:
  - keep parallel reruns for faster turnaround when multiple validators fail;
  - relax gate enforcement when one validator fails due port contention.
- Evidence:
  - `scripts/run_checks.sh`
  - command outcomes in `docs/context/current-state.md` Validation Ledger (2026-02-16 rerun entry)
- Validation/risk impact: reduces false negatives in milestone gate checks and keeps pass/fail signals attributable to product behavior instead of harness contention.

### 2026-02-16 - Implement M5.2 Primary-3 runtime as lazy-loaded, cache-reused, camera-preserving toggles
- Decision: implement only `M5.2` scope by enabling runtime toggles for Primary-3 rows in the FragMap tab, with first-load lazy map creation, cached reuse on subsequent toggles, row-level disable on load failure, and camera preservation across map show/hide operations.
- Why: this is the approved `M5.2` Prompt-B contract and advances FragMap runtime behavior without crossing into `M5.3+` scope.
- Alternatives considered:
  - keep Primary rows non-interactive until `M5.3`;
  - implement broader runtime behavior (Advanced/Exclusion rows, bulk actions, retry UX) in this slice.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
  - `src/viewer/nglStage.ts`
  - `src/store/modules/viewer.ts`
  - `scripts/validate-m5-2.js`
  - `package.json`
- Validation/risk impact: sequential regression through `validate:m1`..`validate:m5.2` is green (with known `validate:m1` intermittent rerun behavior and initial `validate:m5.2` sandbox `ENV-BLOCKED`), establishing a stable baseline for `M5.3`.

### 2026-02-16 - Lock M5.2 UI behavior to B/A/B for implementation verification phase
- Decision: keep `Option B` loading lock behavior, switch success feedback to `Option A` inline text (`Loaded from cache`) for explicit debug visibility, and keep retry timing at `Option B` (deferred to `M5.6`).
- Why: reviewer requested explicit, persistent runtime confirmation for cache-hit behavior during M5.2 verification while preserving the earlier loading and retry scope boundaries.
- Alternatives considered:
  - retain `Option B` toast-only success feedback;
  - add inline retry immediately in M5.2.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2-primary3-visibility-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: improves manual observability during rollout; minor UI noise is acceptable for this slice and can be adjusted later.

### 2026-02-16 - Lock M5.2 Prompt-A review behavior to B/A/B (loading lock / inline success text / retry deferred)
- Decision: update M5.2 Prompt-A preview artifacts so Primary-row loading behavior stays on `Option B` (temporarily lock non-loading Primary rows), success feedback switches to `Option A` (inline `Loaded from cache` text), and retry timing remains `Option B` (defer inline retry UX to `M5.6`).
- Why: reviewer requested explicit/debuggable inline success confirmation during M5.2 review while preserving previous lock choices for loading and retry timing.
- Alternatives considered:
  - keep all three as `Option B` from the prior revision;
  - switch only to toast messaging and inspect via dev tools.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2-primary3-visibility-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: improves visibility for manual debugging in Prompt-A review; slight UI noise is accepted temporarily and can be reverted post-validation.

### 2026-02-16 - Hide non-essential right-panel context/debug blocks while retaining validator hooks
- Decision: remove visible right-panel `Viewer Context`, lower `Reset view`, and camera contract/snapshot debug blocks from the user-facing `Ligand` tab in `src/components/ControlsPanel.vue`, while preserving required `data-test-id` probes in a hidden diagnostics container.
- Why: reviewer feedback requested a cleaner controls UI and identified these items as non-essential for normal user interaction in the M5.1 shell.
- Alternatives considered:
  - keep all context/debug blocks visible until later milestones;
  - remove selectors entirely and rewrite older validators immediately.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
  - `scripts/validate-m3.js`
  - `scripts/validate-m4a.js`
  - `scripts/validate-m4b.js`
  - `scripts/validate-m5-1.js`
- Validation/risk impact: improves UI clarity with no regression in existing milestone validators (`build`, `validate:m3`, `validate:m4a`, `validate:m4b`, `validate:m5.1` all PASS); residual risk is hidden diagnostics markup debt that should be retired once validators no longer depend on these selectors.

### 2026-02-16 - Add dedicated `validate:m5.1` shell-gate command for repeatable slice regression checks
- Decision: add a new validator script (`scripts/validate-m5-1.js`) and npm scripts (`validate:m5.1`, `prevalidate:m5.1`) to enforce the M5.1 shell contract explicitly and reuse it during subsequent M5 slices.
- Why: upcoming `M5.2`/`M5.3` runtime work can unintentionally regress the approved M5.1 tabbed shell; a dedicated gate makes those regressions easy to catch.
- Alternatives considered:
  - continue using ad-hoc one-off shell checks (`node - <<'NODE' ...`) only;
  - wait until `M5.6` and rely exclusively on final `validate:m5`.
- Evidence:
  - `scripts/validate-m5-1.js`
  - `package.json`
  - `docs/plans/milestone-inventory.md` (`M5.1` commands/files section)
- Validation/risk impact: first sandboxed run was `ENV-BLOCKED` on local port bind (`EPERM`), unsandboxed run passed; adds low-overhead guardrail for future M5 slices.

### 2026-02-16 - Implement M5.1 shell with default FragMap tab and preserve ligand workflow under Ligand tab
- Decision: implement `M5.1` Prompt B as a UI-shell-only change by adding a right-panel two-tab framework (`FragMap`, `Ligand`) with `FragMap` active by default, render Primary/Advanced FragMap rows as non-runtime shell controls with all-hidden defaults, and keep existing M4B ligand controls functional under `Ligand`.
- Why: this is the approved M5.1 scope contract and establishes the shell boundary before runtime map behavior slices (`M5.2+`).
- Alternatives considered:
  - keep ligand panel as the only visible controls surface and defer tabs to a later slice;
  - wire partial FragMap runtime behavior (toggle/load/reset) during M5.1.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
  - `scripts/validate-m4a.js`
  - `scripts/validate-m4b.js`
  - `docs/plans/milestone-inventory.md` (`M5.1` section)
- Validation/risk impact: M1-M4B regressions remain green after selector-scoped validator updates; known intermittent `validate:m1` snackbar interception still appears on first run in some executions but clears on rerun.

### 2026-02-16 - Run docs-only consistency alignment across M5.1 packet/specs/plans/context/prompts
- Decision: reconcile cross-document drift by synchronizing M5.1 approval state, Prompt-B readiness, tab-framework wording, and featured-ligand subset wording in all authoritative docs.
- Why: docs audit identified conflicting status/scope statements that could cause incorrect implementation scope and handoff ambiguity.
- Alternatives considered: defer non-blocking wording fixes until after M5.1 Prompt B implementation.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.1-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
  - `docs/specs/viewer-core-spec.md`
  - `docs/specs/fragmap-controls-spec.md`
  - `docs/specs/ligand-workflow-spec.md`
  - `docs/plans/technical-plan.md`
  - `docs/plans/milestone-inventory.md`
  - `prompts/implementation.md`
  - `docs/context/current-state.md`
  - `docs/context/next-agent-brief.md`
- Validation/risk impact: reduces documentation ambiguity before M5.1 Prompt B implementation; no runtime behavior changes.

### 2026-02-16 - Encode approved M5.1 two-tab contract directly in plan files
- Decision: update `docs/plans/execution-plan.md` and `docs/plans/milestone-inventory.md` so M5.1 explicitly includes the right-panel two-tab framework (`FragMap` + `Ligand`) with `FragMap` active by default and `Ligand` preserving existing M4B controls.
- Why: reviewer requested explicit plan-level wording so M5.1 implementation scope is unambiguous without relying only on preview-packet docs.
- Alternatives considered: keep tab contract documented only in preview artifacts/context notes.
- Evidence:
  - `docs/plans/execution-plan.md` (M5 ordered table and M5.1 slice scope row)
  - `docs/plans/milestone-inventory.md` (M5.1 slice tracker/scope text and gate checklist)
- Validation/risk impact: reduces scope ambiguity before Prompt B implementation; no runtime behavior changes in this docs-only update.

### 2026-02-16 - Simplify M5.1 state-sheet tabs to match two-tab context framework
- Decision: finalize the M5.1 state-sheet preview with the same simplified tab strip as the context image: `FragMap` (active) and `Ligand` (inactive placeholder) only.
- Why: reviewer requested removal of extra tab complexity to prevent confusion before implementation and to keep packet artifacts internally consistent.
- Alternatives considered: keep four-tab state-sheet (`FragMap`, `Protein`, `Ligand`, `Components`) while only the context image stayed simplified.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.1-fragmap-panel-shell-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.1-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: removes packet-level tab-model mismatch and reduces review ambiguity; residual risk remains pending explicit `APPROVED UI PREVIEW` token.

### 2026-02-16 - Simplify M5.1 context-placement tabs to FragMap + Ligand
- Status: superseded by later same-day decision that also simplified the M5.1 state-sheet tabs.
- Decision: keep the M5.1 state-sheet artifact unchanged for now, but simplify the tab strip in the full-viewer context artifact to show only `FragMap` and `Ligand`.
- Why: reviewer confirmed these two are sufficient for planned usage and requested a cleaner context visualization.
- Alternatives considered: keep four tabs (`FragMap`, `Protein`, `Ligand`, `Components`) in the context-placement artifact.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.1-viewer-context-placement.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.1-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: reduces visual complexity in context review; residual risk is mismatch with the current state-sheet tab set until that artifact is optionally simplified in a follow-up revision.

### 2026-02-16 - Align M5.1 preview shell to tabbed right-panel framework from GUI layout reference
- Decision: keep M5.1 scope focused on FragMap shell content, but represent the right controls area as a tabbed framework (`FragMap`, `Protein`, `Ligand`, `Components`) with `FragMap` active in Prompt-A artifacts.
- Why: reviewer requested explicit alignment with `docs/screenshots/GUI/GUI_Layout.png` so M5 implementation direction is consistent with expected overall viewer structure.
- Alternatives considered: keep M5.1 artifacts as standalone FragMap-only panel without tabs.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.1-fragmap-panel-shell-states.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.1-viewer-context-placement.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.1-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
- Validation/risk impact: reduces ambiguity for downstream implementation architecture; residual risk is that tab switching behavior remains out of scope until explicitly scheduled in later slices.

### 2026-02-16 - Add M5.1 full-viewer placement preview as supplemental artifact
- Decision: keep the existing `M5.1` multi-state shell preview intact and add one supplemental context-placement image showing where the panel appears within the full viewer layout.
- Why: reviewer requested clearer page-level context without replacing the existing state-page artifact.
- Alternatives considered: replace the existing M5.1 state page with a single default-only panel image.
- Evidence:
  - `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.1-viewer-context-placement.svg`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/m5.1-preview-index.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/README.md`
  - `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md`
- Validation/risk impact: improves reviewer orientation for Prompt-A sign-off; residual risk is pending confirmation on whether to collapse final approval surface to default-only before `APPROVED UI PREVIEW`.

### 2026-02-16 - Record startup takeover checkpoint with no milestone scope change
- Decision: run a docs/context-only takeover checkpoint and keep the active execution scope unchanged at `M5.1 Prompt A` (design-preview gate first, no implementation in this window).
- Why: satisfy AGENTS startup-order compliance and provide fresh, explicit handoff memory without introducing runtime behavior changes.
- Alternatives considered: skip context updates because prior pre-handoff refresh already existed.
- Evidence:
  - `docs/context/current-state.md`
  - `docs/context/next-agent-brief.md`
  - `docs/context/decision-log.md`
  - startup command evidence (`git status -sb`, `git log --oneline -n 3`, `git rev-list --left-right --count origin/dev...dev`)
- Validation/risk impact: no application behavior or validator state changes; preserves the active next action as `M5.1` Prompt A preview work.

### 2026-02-16 - Pre-handoff context refresh as docs-only checkpoint (no feature/test scope change)
- Decision: run a docs/context-only pre-handoff refresh and keep active scope unchanged at `M5.1 Prompt A` (design preview only).
- Why: establish a clean, explicit handoff boundary after the M5 slice renumber push without introducing non-doc changes.
- Alternatives considered: no file updates because working tree was already clean.
- Evidence:
  - `docs/context/current-state.md`
  - `docs/context/next-agent-brief.md`
  - `docs/context/decision-log.md`
- Validation/risk impact: no runtime behavior impact; no validator commands were rerun in this window.

### 2026-02-16 - Split previous M5.4 into ISO-only and bulk-actions-only, renumber reliability to M5.6
- Decision: split old `M5.4` into two slices: `M5.4` (per-map ISO controls only) and `M5.5` (bulk actions only), then renumber prior reliability/final-gate slice from `M5.5` to `M5.6`.
- Why: isolate ISO numeric-contract risk from camera/state-reset bulk-action risk, so review, debugging, and rollback remain slice-scoped.
- Alternatives considered: keep five-slice M5 plan where ISO and bulk actions are merged.
- Evidence:
  - `docs/plans/execution-plan.md` (dependency graph and slice table updated to `M5.1`..`M5.6`)
  - `docs/plans/milestone-inventory.md` (M5 tracker + per-slice sections updated to include `M5.6`)
  - `prompts/implementation.md` (Prompt A/B templates updated for `M5.1`..`M5.6`)
  - `docs/context/next-agent-brief.md` (stop/go and priority tasks updated to `M5.6`)
- Validation/risk impact: smaller blast radius for each implementation gate; tradeoff is one additional Prompt A/B cycle.

### 2026-02-15 - Split M5 into five numbered slices with per-slice Prompt A/B and a fixed preview packet layout
- Status: superseded by the 2026-02-16 renumber decision (`M5.1`..`M5.6`).
- Decision: execute FragMap controls as `M5.1`..`M5.5`, each with its own Prompt A (design preview only) and Prompt B (post-approval implementation), and lock preview artifacts to `docs/screenshots/Design_previews/m5-fragmap-controls/` as one front page plus one page per slice.
- Why: reduce review and integration risk by keeping each design/implementation step small and independently gateable after M4 lessons.
- Alternatives considered: one combined M5 Prompt A for all slices followed by implementation prompts; one monolithic M5 implementation flow.
- Evidence:
  - `docs/plans/execution-plan.md` (M5 sliced plan + preview packet exception + dependency flow)
  - `docs/plans/milestone-inventory.md` (M5 slice tracker + per-slice inventory sections)
  - `prompts/implementation.md` (Prompt A/B templates for `M5.1`..`M5.5`)
  - `docs/context/next-agent-brief.md` (active target set to `M5.1`)
- Validation/risk impact: stronger scope control and easier approvals; tradeoff is more checkpoint overhead across five slices.

### 2026-02-15 - Restore switch camera with orientation-only transform replay to avoid scene inversion
- Decision: in M4B `switchLigand`, replay preserved `viewerControls` orientation only (no extra `center`/`distance` rewrite), then resync `currentCamera` from the live stage snapshot; keep `resetView` on `stage.autoView(0)` with live snapshot reads.
- Why: manual QA still observed scene disappearance on reset and inconsistent featured-ligand visibility after switches. The prior transform restore called `center` after `orient`, which inverted translation sign and could move the scene off-screen.
- Alternatives considered: continue transform replay with `center`/`distance` and tune reset logic only; fully revert to camera-only restore.
- Evidence:
  - `src/viewer/nglStage.ts` (`readSceneTransformSnapshot`, `applySceneTransformSnapshot`, `switchLigand`, `handleResize`)
  - targeted Playwright runtime smoke sequence output (default reset + featured switches + reset-after-switch)
- Validation/risk impact: preserves M4B camera-stability contract while removing reset blanking/switch inconsistency in manual reproduction; sequential validators remain green (`m1` rerun pass, `m2`, `m3`, `m4a`, `m4b`).

### 2026-02-15 - Stabilize post-switch camera behavior with viewer-controls transform restore plus baseline snapshot reset
- Decision: restore scene transform during featured-ligand switches using `viewerControls` orientation/center/distance, then apply the preserved camera snapshot deterministically; for `Reset view`, apply stored baseline transform and baseline camera snapshot instead of relying only on dynamic `autoView`.
- Why: manual QA found a regression where switching to featured ligands could drift the protein toward the viewport corner and reset would not reliably recenter.
- Alternatives considered: keep prior camera restore path (`applyStageCameraSnapshot` only during switch; `autoView` only during reset).
- Evidence:
  - `src/viewer/nglStage.ts`
  - `scripts/validate-m4b.js` (reset-after-switch assertion added)
- Validation/risk impact: fixes visible camera drift while preserving M4B in-place switching contract; sequential validators `m1` through `m4b` are green after the change.

### 2026-02-15 - Prefer transform-only restore path and deterministic resize rollback for camera stability
- Decision: remove mixed transform+direct-camera writes in switch/reset flows and preserve camera via viewer-controls transform snapshots; on resize, rollback to pre-resize snapshot if NGL introduces drift.
- Why: follow-up manual QA still reported corner drift after reset/switch in some interaction sequences despite initial fix.
- Alternatives considered: keep mixed restore path and add only more validator assertions.
- Evidence:
  - `src/viewer/nglStage.ts` (`switchLigand`, `resetView`, `handleResize`, `getCameraSnapshot`)
- Validation/risk impact: improves runtime camera stability for user-visible interactions while keeping M3/M4B strict snapshot validators green.

### 2026-02-15 - Implement M4B against approved 4-ligand featured subset and defer larger featured set
- Decision: implement M4B featured quick-pick switching with the approved fixed subset (`3fly_cryst_lig`, `p38_goldstein_05_2e`, `p38_goldstein_06_2f`, `p38_goldstein_07_2g`) and not the larger canonical list referenced in older spec wording.
- Why: approved design preview and explicit implementation request in-thread locked M4B to the 4-ligand subset for reduced risk and faster milestone completion.
- Alternatives considered: implement all canonical featured IDs listed in `docs/specs/ligand-workflow-spec.md` Section 4 in M4B.
- Evidence:
  - `src/pages/ViewerPage.vue` (`M4B_FEATURED_LIGAND_IDS`)
  - `src/components/ControlsPanel.vue`
  - `scripts/validate-m4b.js`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/m4b-preview-index.md`
- Validation/risk impact: delivered stable M4B behavior and green gate quickly; residual risk is documentation drift until the larger-set wording is reconciled.

### 2026-02-15 - Use in-place stage component replacement for M4B ligand switching
- Decision: add a `switchLigand` API to `NglStageController` that replaces ligand components in the existing stage and reapplies the preserved camera snapshot, instead of reinitializing the whole stage per switch.
- Why: this enforces no-route-reload switching and camera preservation while minimizing lifecycle churn and M1-M3 regression risk.
- Alternatives considered: destroy/reinitialize entire NGL stage on every ligand switch.
- Evidence:
  - `src/viewer/nglStage.ts` (`switchLigand`, component replacement helpers)
  - `src/pages/ViewerPage.vue` (featured-ligand switch orchestration)
- Validation/risk impact: supports AC-4 style in-place switching contract and keeps M4A pose controls intact after switches.

### 2026-02-15 - Enforce non-occluding M4B chip layout in preview artifacts before implementation
- Decision: reposition right-side viewer-context/info panels in all M4B desktop mockups so featured-ligand chips are fully visible and unobstructed.
- Why: reviewer identified that the fourth featured chip was partially hidden in the default preview, which would be an unacceptable persistent layout outcome if carried into implementation.
- Alternatives considered: keep existing geometry and treat overlap as preview-only artifact debt.
- Evidence:
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-default-state.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-switch-loading.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-switch-success.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-per-ligand-failure.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-fallback-disabled-state.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/m4b-preview-index.md`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/approval-log.md`
- Validation/risk impact: removes known layout defect from the design baseline and reduces risk of reproducing overlap in Prompt-B implementation.

### 2026-02-15 - Use Prompt-A-only artifacts for M4B and gate implementation on explicit approval
- Decision: produce M4B design-preview artifacts only (desktop state set) and stop before any M4B implementation until `APPROVED UI PREVIEW` is provided.
- Why: user invoked M4B Prompt A directly and requested design-gate execution with no code edits.
- Alternatives considered: begin M4B implementation in the same session without refreshed M4B previews.
- Evidence:
  - `docs/screenshots/Design_previews/m4-ligand-workflow/m4b-preview-index.md`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-default-state.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-switch-loading.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-switch-success.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-per-ligand-failure.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-fallback-disabled-state.svg`
- Validation/risk impact: keeps UI-first compliance for M4B and prevents premature implementation; residual risk is reviewer feedback requiring preview revisions before coding.

### 2026-02-15 - Propose M4B featured subset as 4 total ligands in design preview
- Decision: adjust M4B preview artifacts to show `Crystal Ligand` plus three featured options (4 total) as the proposed implementation subset for this phase.
- Why: reviewer requested expanding preview from 3 total to 4 total while keeping M4B scope constrained.
- Alternatives considered: keep prior smaller subset in preview and defer count change to implementation phase.
- Evidence:
  - `docs/screenshots/Design_previews/m4-ligand-workflow/m4b-preview-index.md`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-default-state.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-switch-loading.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-switch-success.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-per-ligand-failure.svg`
  - `docs/screenshots/Design_previews/m4-ligand-workflow/desktop/m4b-fallback-disabled-state.svg`
- Validation/risk impact: preserves small-scope strategy while improving switching coverage; if approved, specs/plans should be updated so implementation contract matches the new featured-count decision.

### 2026-02-15 - Apply two-step design gate workflow to M4B prompts
- Decision: mirror M4A prompt structure for M4B in `prompts/implementation.md` with `Prompt A` (design preview only) and `Prompt B` (post-approval implementation), including `BLOCKED-DESIGN` verification behavior.
- Why: user requested the same preview-approval gating strategy for M4B to reduce implementation rework risk.
- Alternatives considered: keep M4B as direct implementation-only prompt flow.
- Evidence:
  - `prompts/implementation.md`
- Validation/risk impact: enforces UI-first governance consistency across M4 phases; adds one explicit approval checkpoint before code changes.

### 2026-02-15 - Make viewer toast non-interactive to prevent navigation interception
- Decision: set the viewer snackbar to `pointer-events: none` so transient toasts cannot block top-nav button clicks.
- Why: `validate:m1` intermittently failed on `/viewer -> /` navigation because the `Viewer startup failed` toast overlapped and intercepted pointer events.
- Alternatives considered: only harden validator clicks with forced click/retry logic while keeping interactive toast behavior.
- Evidence:
  - `src/pages/ViewerPage.vue`
  - `scripts/validate-m1.js` failure traces (`nav-home` click intercepted by snackbar content)
- Validation/risk impact: improves route-navigation reliability and preserves non-blocking toast intent; tradeoff is toast action affordances would need a different pattern if added later.

### 2026-02-15 - Remove mandatory both-unchecked recovery panel UI from controls
- Decision: remove the yellow both-unchecked recovery panel/buttons from `ControlsPanel` and rely on checkbox state alone for recovery.
- Why: user feedback indicated the panel was unnecessary and cluttered the workflow.
- Alternatives considered: keep panel with toned-down styling instead of full removal.
- Evidence:
  - `src/components/ControlsPanel.vue`
- Validation/risk impact: simplifies panel UI and aligns with relaxed M4A contract; recovery remains available through direct checkbox toggles.

### 2026-02-15 - Relax M4A both-unchecked UX requirement from mandatory recovery panel to optional helper guidance
- Decision: treat both pose checkboxes unchecked as sufficient representation of the both-unchecked state; dedicated recovery panel/buttons are optional, not required.
- Why: user confirmed toggle semantics are self-explanatory and does not want recovery-panel UX to be a gate blocker.
- Alternatives considered: keep strict requirement for persistent recovery actions (`Show Baseline`, `Show Refined`, `Show Both`) in M4A.
- Evidence:
  - `docs/specs/ligand-workflow-spec.md`
  - `docs/plans/execution-plan.md`
  - `prompts/implementation.md`
  - `scripts/validate-m4a.js`
- Validation/risk impact: reduces UI and validator coupling for M4A while preserving required four-state behavior; minor risk is discoverability for first-time users if no helper text is shown.

### 2026-02-15 - Implement M4A on top of existing M3 panel instead of introducing a new LigandControls component
- Decision: add M4A controls directly to `src/components/ControlsPanel.vue` (checkboxes, legend, recovery actions, zoom) and wire behavior through existing `src/pages/ViewerPage.vue`.
- Why: minimizes integration surface and preserves existing M3 selectors/structure while adding M4A behavior with lower regression risk.
- Alternatives considered: create a separate `LigandControls.vue` and refactor panel composition before M4A gate.
- Evidence:
  - `src/components/ControlsPanel.vue`
  - `src/pages/ViewerPage.vue`
- Validation/risk impact: M4A features land with fewer moving parts; residual risk is eventual M4B panel complexity growth, to be managed in next milestone.

### 2026-02-15 - Add dedicated `validate:m4a` gate script with deterministic per-pose failure coverage
- Decision: add `scripts/validate-m4a.js` and `package.json` scripts (`validate:m4a`, `prevalidate:m4a`) to enforce M4A behavior checks after baseline regression commands.
- Why: M4A introduces multiple interaction states and failure-isolation rules that are hard to keep stable without a repeatable validator.
- Alternatives considered: rely on manual checks only or fold M4A assertions into M3 script.
- Evidence:
  - `scripts/validate-m4a.js`
  - `package.json`
- Validation/risk impact: improves regression confidence for M4A/M4B handoff; requires SwiftShader launch args for robust headless execution in constrained environments.

### 2026-02-15 - Re-scope ligand milestone into M4A/M4B required and M4C deferred non-blocking
- Decision: split prior M4 scope into `M4A` (single-ligand core) and `M4B` (featured-ligand subset) as required forward milestones, and move full-list search/ordering into `M4C` deferred stretch scope.
- Why: previous big-bang M4 integration attempt introduced regression risk and unstable validator outcomes; smaller slices reduce integration blast radius and protect M1-M3 baseline stability.
- Alternatives considered: keep full M4 scope (including full-list search) as a strict pre-M5 blocker.
- Evidence:
  - `docs/plans/execution-plan.md`
  - `docs/specs/ligand-workflow-spec.md`
  - `docs/context/next-agent-brief.md`
- Validation/risk impact: enables forward progress to M5+ once M4A/M4B pass; tradeoff is that full-list search UX is deferred and must be tracked explicitly as non-blocking stretch work.

### 2026-02-15 - Capture regression window in dedicated failure report before further M4 changes
- Decision: document the regression-fix window in a standalone file (`docs/context/failure-report-m4-2026-02-15.md`) and pause additional feature work until baseline validators are healthy.
- Why: failures span multiple validators (`m1`, `m3`, `m4`) and exceeded concise inline handoff notes; centralized evidence prevents repeated blind debugging.
- Alternatives considered: keep failure notes only in chat and context ledger bullet points.
- Evidence:
  - `docs/context/failure-report-m4-2026-02-15.md`
  - `docs/context/current-state.md` validation ledger entry (2026-02-15 regression-fix-only pass)
- Validation/risk impact: improves handoff quality and reproducibility; unresolved blocker remains baseline validator instability.

### 2026-02-15 - Adopt array-based M4 pose visibility model with per-pose failure isolation
- Decision: migrate viewer ligand pose state from booleans to `visiblePoseKinds: PoseKind[]` plus `poseControlDisabled` and `poseErrors` to support all four M4 states and isolate failures to a single pose control.
- Why: M4 requires `baseline-only`, `refined-only`, `both-visible`, and `both-unchecked` while keeping unaffected pose controls active on single-pose failures.
- Alternatives considered: keep boolean flags and infer extra states ad hoc in components.
- Evidence:
  - `src/store/modules/viewer.ts`
  - `src/pages/ViewerPage.vue`
  - `src/components/LigandControls.vue`
- Validation/risk impact: enables required M4 UI/state behavior; residual risk is unresolved startup/ready timeout in local Playwright validators.

### 2026-02-15 - Add deterministic M4 pose-failure trigger via query parameter
- Decision: support deterministic per-pose load failure injection using `m4FailPose=<baseline|refined>` query parsing in stage initialization.
- Why: M4 validation requires a repeatable way to exercise pose-failure handling (disable affected checkbox + non-blocking toast).
- Alternatives considered: random/mock failure injection or manual file renaming.
- Evidence:
  - `src/viewer/nglStage.ts` (`getForcedPoseFailuresFromQuery`)
  - `scripts/validate-m4.js`
- Validation/risk impact: improves reproducibility of failure-path testing; must not be enabled in normal routes unless explicitly requested by query param.

### 2026-02-15 - Treat M4 implementation as blocked until explicit preview approval token is present
- Decision: during takeover, keep M4 scope in `design-gate` state and do not start runtime implementation until the in-thread token `APPROVED UI PREVIEW` is recorded for `docs/screenshots/Design_previews/m4-ligand-workflow/`.
- Why: this is required by `AGENTS.md` UI-First Feature Protocol and reinforced in `docs/context/next-agent-brief.md`.
- Alternatives considered: starting M4 implementation immediately while approval is pending.
- Evidence:
  - `AGENTS.md` (`## UI-First Feature Protocol (Required)`)
  - `docs/context/next-agent-brief.md` (`## Stop/Go Criteria For M4`)
- Validation/risk impact: prevents process non-compliance and rework; primary risk is schedule delay until review approval is obtained.

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
