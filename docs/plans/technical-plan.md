# Technical Implementation Plan: SILCS FragMaps Interactive Demo (3FLY)

## Brief Summary
This plan defines a decision-complete implementation for the PRD at `docs/SilcsBio_Candidate_Exercise_Instructions.md` using a client-side Vue 2 + TypeScript app hosted on GitHub Pages.
It prioritizes AC-1 through AC-6 and uses PRD plus repository specs as authoritative requirements.
Companion planning artifacts in `docs/plans` must mirror this document's framework and control-model decisions.

## 1. Executive Summary
- Build a static SPA with two routes: `Home/Overview` and `Interactive Viewer`.
- Use `NGL Viewer` for protein/ligand rendering and `.dx` FragMap wireframe-isosurface overlays.
- Implement ligand workflow incrementally: `M4A` single-ligand core, then `M4B` curated featured subset (`3fly_cryst_lig` shown as `Crystal Ligand` + 3); defer full-list searchable access to `M4C` stretch scope.
- Execute FragMap controls as required sliced milestones through `M5.6` (`M5.1`, `M5.2`, `M5.2a`, `M5.2b`, `M5.3`, `M5.4`, `M5.5`, `M5.5a`, `M5.6`).
- Treat `M5.2c` wireframe parity work as optional exploratory/deferred investigation (non-blocking unless explicitly promoted).
- Follow a Vue architecture with `Vue Router + Vuex + Vuetify`.
- Meet performance via lazy loading, caching, single-map-first render, and controlled iso updates.
- Deploy to GitHub Pages with reproducible local validation checklist mapped to AC-1..AC-6.

## 2. Technical Approach
- Frontend stack: `Vue 2 + TypeScript + Vue CLI (Webpack)`.
- UI framework: `Vuetify 2`.
- Routing/state: `Vue Router + Vuex`.
- Rendering engine: `NGL` embedded in a Vue component container.
- Data loading: static assets served from app `public/assets`, fetched on demand.
- State management: Vuex module with typed state/actions/mutations.
- Scope decision: require featured-ligand path for baseline delivery and defer full searchable selection to `M4C` (non-blocking for M5-M8).
- Featured ligands (`3fly_cryst_lig` shown as `Crystal Ligand` + 3) for guided flow:
- `3fly_cryst_lig` (display label: `Crystal Ligand`)
- `p38_goldstein_05_2e`
- `p38_goldstein_06_2f`
- `p38_goldstein_07_2g`
- Full exploratory set remains defined for deferred `M4C`: all 30 provided ligand IDs plus `3fly_cryst_lig` (displayed as `Crystal Ligand`) via searchable autocomplete/dropdown.
- UI decision: M4A/M4B ship without full-list autocomplete; keep no local file-upload control in v1.
- Runtime format policy: protein `.pdb` primary, ligands `.sdf` primary with `.pdb` fallback only when needed, FragMaps `.dx` primary.
- FragMaps used at runtime: `.dx` only (all 8 maps). `.map` retained but not parsed in v1.
- UX patterns use sidebar controls + viewport-first layout; for M5.1+ the right controls region uses a two-tab framework (`FragMap`, `Ligand`).

### 2.1 Authority Note
- Authoritative implementation inputs for this project are:
  - `docs/SilcsBio_Candidate_Exercise_Instructions.md`
  - Repository specs under `docs/specs/`
- External product observations are context only and non-authoritative.

## 3. System Architecture
- Route 1: `HomePage.vue` with scientific narrative and interaction instructions.
- Route 2: `ViewerPage.vue` split into `ControlsPanel.vue` and `NglViewport.vue`.
- Right controls framework (`M5.1+`): two tabs, `FragMap` and `Ligand`, with `Ligand` preserving existing M4B ligand controls.
- Core modules:
- `data/manifest.ts` for typed asset definitions.
- `viewer/nglStage.ts` for stage lifecycle.
- `viewer/loaders.ts` for protein/ligand/map load functions.
- `viewer/reps.ts` for representation creation/update.
- `store/viewer.ts` for Vuex state/actions/mutations/getters.
- `router/index.ts` for route configuration and navigation behavior.
- `perf/metrics.ts` for interaction timing.
- Runtime flow:
- App initializes stage and loads protein (`3fly.pdb`).
- Loads default crystal ligand state (`3fly_cryst_lig`, displayed as `Crystal Ligand`, with baseline visible by default and refined available) and exposes featured quick-select controls.
- `M4A/M4B` path does not require searchable full-ligand selector; full selector is deferred to `M4C`.
- Optional parity path: manage narrative slide progression as viewer-local state (not route changes).
- FragMaps remain unloaded until toggled on.
- On map toggle: load `.dx`, create wireframe isosurface representation, cache component+rep handle.
- Optional exploratory parity path (`M5.2c` deferred): if explicitly reactivated, adjust wireframe rendering parameters in-place (for example line visibility/opacity and depth-cue choices) to match approved reference look without changing map IDs, default iso values, or toggle behavior.
- On per-map iso change (GFE maps only): update only the targeted map representation via parameter update path.
- On `Exclusion Map` toggle: render fixed gray triangulated wireframe isosurface; iso controls remain disabled/non-editable.
- On ligand change: remove current ligand pose components and load selected ligand pose component(s) based on pose-visibility controls (baseline-only, refined-only, both-visible, or both-hidden).

### Important APIs/Interfaces/Types
- No public backend APIs are introduced.
- Public app interface: static web UI + optional URL state (if added later, not required in v1).
- Internal TypeScript contracts:
- `type PoseKind = "baseline" | "refined"`
- `type LigandId = string` (derived from runtime manifest keys; includes `3fly_cryst_lig` + all provided ligands)
- `interface ProteinAsset { pdbUrl: string; mmcifUrl?: string }`
- `interface LigandAsset { id: LigandId; label: string; featured: boolean; baselineSdf: string; refinedSdf: string; baselinePdbFallback?: string; refinedPdbFallback?: string }`
- `interface FragMapAsset { id: string; label: string; dxUrl: string; color: string; isoAdjustable: boolean; defaultIso?: number }`
- `interface ViewerState { ligandId: LigandId; visiblePoseKinds: PoseKind[]; perMapIso: Record<string, number>; visibleMapIds: string[]; cameraSnapshot?: object }`

## 4. Data & File Handling Plan (.pdb, .sdf, .map/.dx)
- Runtime primary format by category:
- Protein: `.pdb` (primary runtime format).
- Ligands (baseline/refined): `.sdf` (primary runtime format).
- FragMaps: `.dx` (primary runtime format).
- Retained but not parsed at runtime:
- FragMaps `.map` files.
- Ligand `.pdb` files when corresponding `.sdf` loads successfully.
- Source of truth files:
- Protein: `from_silcsbio/3fly.pdb`
- Crystal-ligand baseline (`3fly_cryst_lig`): `from_silcsbio/3fly_cryst_lig.sdf`
- Crystal-ligand refined (`3fly_cryst_lig`): `from_silcsbio/3fly_cryst_lig_posref.sdf`
- Ligand baseline dir: `from_silcsbio/ligands`
- Ligand refined dir: `from_silcsbio/ligands_posref`
- FragMaps runtime format: `from_silcsbio/maps/*.dx`
- Runtime asset strategy:
- Copy required assets into `/public/assets/protein`, `/public/assets/ligands`, `/public/assets/maps`.
- Load protein eagerly.
- Load ligand and map files lazily based on user actions.
- Cache parsed/loaded components keyed by ligand/map ID.
- Ligand load order policy:
- Baseline pose: load `baselineSdf` first; if missing/unreadable and baseline fallback exists, load fallback PDB.
- Refined pose: load `refinedSdf` first; if missing/unreadable and refined fallback exists, load fallback PDB.
- If both primary and fallback fail for a ligand pose, disable that pose option and show actionable error.
- Data validation checks at startup:
- Confirm `3fly.pdb` resolves.
- Confirm baseline `.sdf` exists for every ligand in the runtime manifest.
- Confirm refined `.sdf` exists for every ligand in the runtime manifest, or refined fallback `.pdb` exists.
- Confirm all 8 `.dx` map files resolve.
- If asset missing: show non-blocking UI error toast and disable that control item.

## 5. Viewer/Library Selection Rationale (with tradeoffs)
- Selected: `NGL Viewer`.
- Why:
- Fast protein/ligand rendering for PDB/SDF workflows.
- Good fit for direct web molecular visualization in prototype timeline.
- Supports volumetric workflows compatible with `.dx` plan.
- Tradeoffs:
- Less out-of-box UI framework than full-featured platforms; custom controls required.
- Volume/iso tuning behavior must be profiled per map to enforce `<200 ms`.
- Alternatives considered:
- `Mol*`: strong ecosystem, but steeper integration for this scoped prototype.
- `3Dmol.js`: lightweight, but NGL provides a cleaner path for this exact molecular + map control mix in the time budget.

## 6. Detailed Implementation Phases (time-boxed milestones)
- Phase 0 (0.5h): scaffold app, routing, base layout, static hosting config.
- Phase 1 (1.0h): define typed manifests, wire asset paths, data existence checks.
- Phase 2 (2.0h): stage lifecycle + protein load + camera controls + catastrophic startup failure fallback UX (clear message + retry/navigation option).
- Phase 3A (1.0h): M4A ligand core (`3fly_cryst_lig` only) with baseline/refined controls, both-visible/both-hidden, zoom, and failure/empty-state handling.
- Phase 3B (1.0h): M4B featured-ligand switching with no reload and camera preservation.
- Phase 3C (deferred stretch): M4C searchable full-ligand selector + deterministic ordering + `No ligands found`.
- Phase 4 (2.0h): FragMap overlays (toggle, color, visibility state, caching, and per-row failure isolation with retry action).
- Phase 4B (optional, deferred): M5.2c wireframe parity investigation (render-parameter calibration against approved/reference snapshots, behavior-preserving, non-blocking).
- Phase 5 (1.0h): per-map iso controls for GFE maps, exclusion-map fixed-style behavior, fast targeted-update path, and row-level retry/reset precondition handling.
- Phase 6 (1.0h): Home page narrative, captions/sidebar explanations, and external-link failure handling that does not block viewer navigation CTA.
- Phase 7 (1.5h): performance tuning, AC verification, runtime hardening, deploy.
- Total: ~11.5h.

## 7. Requirement-to-Implementation Mapping
- PRD Requirement: Home / Overview + scientific narrative.
- Implementation: `HomePage` content blocks + concise explanation text + links.
- PRD Requirement: Interactive viewer with 3FLY protein.
- Implementation: `NglViewport` initialization + `3fly.pdb` load at route entry.
- PRD Requirement: show different ligands and baseline/refined without reload.
- Implementation: typed ligand manifest + featured quick-picks + in-place component swap + pose-visibility controls (baseline-only, refined-only, both-visible, or both-hidden) using `.sdf` as primary and `.pdb` fallback only when required. Full searchable selector is deferred to `M4C`.
- UI Framework Requirement (approved M5.1 direction): right controls region supports in-place `FragMap` / `Ligand` tab navigation, with `Ligand` preserving existing M4B controls.
- PRD Requirement: show/hide individual FragMap surfaces.
- Implementation: map checklist controls + per-map component cache + visibility toggle + bulk actions (`Hide all`, `Reset defaults`), with `Reset defaults` constrained to iso-only reset semantics (visibility unchanged) and camera reset retained as top-bar viewer control.
- Visual parity note (deferred exploration): preserve triangulated wireframe rendering while optionally tuning rendering parameters in `M5.2c` to better match approved/reference SILCS wireframe appearance.
- PRD Requirement: iso-value adjustment with fast response.
- Implementation: per-map iso controls (`-`, value, `+`) on GFE rows + targeted parameter updates on the selected map representation; `Exclusion Map` uses fixed gray triangulated wireframe isosurface with disabled iso controls.
- PRD Requirement: client-side only, open source, Chrome/Safari.
- Implementation: static Vue bundle (Webpack via Vue CLI) + no backend code + cross-browser validation runbook.
- Spec Requirement: catastrophic viewer startup failures must be recoverable.
- Implementation: startup-failure fallback with retry/navigation option at viewer shell level.
- Spec Requirement: map failures are row-local, recoverable, and non-disruptive to unrelated visible maps.
- Implementation: row-level disable/retry controls + single-flight/request-id guards to isolate failures.

## 8. Acceptance Criteria Test Plan (AC-1..AC-6)
- AC-1 (`<=5s load`):
- Scenario: cold start on local production build.
- Method: `performance.now()` from route mount to protein + default crystal ligand (`3fly_cryst_lig`) visible.
- Pass: median of 3 runs <= 5000 ms.
- AC-2 (`map toggle <200 ms` + camera preserved):
- Scenario: toggle representative maps on/off with camera at non-default orientation using `3fly.hbdon.gfe.dx` (`Primary 3`) and `3fly.mamn.gfe.dx` (`Advanced`).
- Method: interaction timer around toggle action; compare pre/post camera matrices.
- Pass: every measured run per tested representative map <200 ms in each browser; median reported for observability; camera unchanged within defined tolerances.
- AC-3 (baseline/refined pose visibility changes no reload):
- Scenario: selected ligand pose visibility changes repeatedly across baseline-only, refined-only, both-visible, and both-hidden states.
- Method: verify no navigation, no full app remount, and in-place component add/remove only.
- Pass: pose visibility changes occur in-place with continuous interaction.
- AC-4 (ligand switching no reload):
- Scenario: switch among featured ligands only for baseline AC execution; treat non-featured full-list switching as deferred `M4C` coverage.
- Method: in-app selector switches and pose options update in same session.
- Pass: no page reload; pose-visibility controls remain functional post-switch.
- AC-5 (iso update <200 ms):
- Scenario: adjust per-map iso controls across 3 values on representative visible iso-adjustable GFE maps.
- Method: timer from per-map input event to target map visual update complete.
- Pass: every measured per-map update run <200 ms; median reported for observability.
- AC-6 (no uncaught runtime errors in 5-minute exploration):
- Scenario: scripted manual session covering all controls.
- Method: monitor console errors and UI error boundaries.
- Pass: zero uncaught errors.

## 9. Risks, Unknowns, and Mitigations
- Risk: volume update performance exceeds 200 ms when many maps are visible.
- Mitigation: lazy load, cache reps, coalesce rapid per-map iso inputs to animation frame, and update only the targeted visible iso-adjustable map rep.
- Risk: large map payloads increase initial latency.
- Mitigation: do not preload maps; load on first toggle only.
- Risk: file parsing edge cases for specific ligands.
- Mitigation: include per-ligand load error state and fallback to previous valid ligand.
- Risk: mixed ligand source format (`.sdf` primary, occasional `.pdb` fallback) can cause representation inconsistencies.
- Mitigation: normalize post-load representations (color/radius/selection policies) independent of source file type.
- Risk: full ligand list can increase UI complexity and selection friction.
- Mitigation: defer full-list selector to `M4C`; ship featured quick-picks first and isolate full-list work later.
- Risk: browser variance between Chrome/Safari.
- Mitigation: lock validation script and run both browsers before final delivery.
- Risk: Vue 2 ecosystem is legacy compared with modern Vue 3 tooling.
- Mitigation: pin dependencies, keep scope narrow, and avoid non-essential third-party plugins.
- Default per-map iso values are fixed by spec from `docs/screenshots/GUI/GUI_fragmaps_isovalues_default.png`.
- Mitigation for future tuning: adjust per-map defaults only through controlled spec updates and re-validation.

## 10. Deliverables Checklist
- Source code for static client-side app.
- `Home` and `Interactive Viewer` routes.
- Protein + ligand + FragMap controls wired.
- Performance instrumentation utility for AC timing.
- README with:
- project overview.
- scientific explanation.
- local run instructions.
- design tradeoffs.
- GitHub Pages deployment.
- Final validation note documenting AC-1..AC-6 pass results.
- `docs/validation.md` with environment details, AC-by-AC evidence tables, raw timings, camera checks, and runtime error summary.

## 11. Out-of-Scope Guardrails
- No backend services or APIs.
- No new docking/scoring or lead optimization inference engine.
- No support beyond provided 3FLY dataset for v1.
- No requirement to parse `.map` at runtime in v1.
- No user-provided local ligand/protein/map file upload in v1.
- No medicinal chemistry recommendation layer.

## Explicit Assumptions and Defaults
- Framework fixed: Vue 2 + TypeScript + Vue Router + Vuex + Vuetify 2.
- Viewer fixed: NGL.
- Hosting fixed: GitHub Pages.
- Ligand scope fixed for required path: `M4A` single ligand + `M4B` featured subset (`3fly_cryst_lig` displayed as `Crystal Ligand` + 3).
- Deferred stretch scope: `M4C` enables full provided ligand selection via searchable selector.
- Pose visibility fixed: users can view baseline only, refined only, both simultaneously, or temporarily hide both for decluttered context.
- Protein runtime format fixed: `.pdb` primary.
- Ligand runtime format fixed: `.sdf` primary with optional `.pdb` fallback.
- FragMap runtime format fixed: `.dx` only; `.map` retained but not parsed in v1.

## Appendix A: External Product Observations (Context Only)
- Snapshot observations of `https://landing.silcsbio.com/newlandingpage` may inform non-binding UX inspiration.
- These observations are not requirements and must not override PRD or repository specs.
- Any parity behavior derived from external products remains optional unless explicitly added to repository specs.
