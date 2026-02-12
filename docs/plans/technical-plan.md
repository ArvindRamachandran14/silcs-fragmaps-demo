# Technical Implementation Plan: SILCS FragMaps Interactive Demo (3FLY)

## Brief Summary
This plan defines a decision-complete implementation for the PRD at `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/docs/SilcsBio_Candidate_Exercise_Instructions.md` using a client-side Vue 2 + TypeScript app hosted on GitHub Pages.
It prioritizes AC-1 through AC-6, uses PRD as authoritative requirements, and incorporates confirmed live-site technical findings (Vue/Vuetify/Webpack architecture) from `https://landing.silcsbio.com/newlandingpage`.

## 1. Executive Summary
- Build a static SPA with two routes: `Home/Overview` and `Interactive Viewer`.
- Use `NGL Viewer` for protein/ligand rendering and volumetric `.dx` FragMap overlays.
- Implement ligand workflow for `crystal + 5 ligands` (selected set below), each with baseline and refined poses.
- Follow a Vue architecture compatible with the observed SilcsBio reference stack: `Vue Router + Vuex + Vuetify`.
- Meet performance via lazy loading, caching, single-map-first render, and controlled iso updates.
- Deploy to GitHub Pages with reproducible local validation checklist mapped to AC-1..AC-6.

## 2. Technical Approach
- Frontend stack: `Vue 2 + TypeScript + Vue CLI (Webpack)`.
- UI framework: `Vuetify 2`.
- Routing/state: `Vue Router + Vuex`.
- Rendering engine: `NGL` embedded in a Vue component container.
- Data loading: static assets served from app `public/assets`, fetched on demand.
- State management: Vuex module with typed state/actions/mutations.
- Scope decision: include `crystal` ligand plus these 5 paired ligands:
- `p38_goldstein_05_2e`
- `p38_goldstein_06_2f`
- `p38_goldstein_07_2g`
- `p38_goldstein_08_2h`
- `p38_goldstein_09_2i`
- FragMaps used at runtime: `.dx` only (all 8 maps). `.map` retained but not parsed in v1.
- UX patterns may mirror SilcsBio interaction style (sidebar controls + viewport-first layout), but requirements come only from PRD.

### 2.1 Live-Site Findings and Plan Impact
- Confirmed fact: `https://landing.silcsbio.com/newlandingpage` is a Vue SPA with `Vue Router`, `Vuex`, `Vuetify 2.5.14`, and Webpack chunking.
- Confirmed fact: `NEXT` flow is in-route state progression (no URL change per step), with a later gated request dialog.
- Confirmed fact: site responses indicate static delivery via `nginx`.
- Plan impact: choose a Vue-based implementation to reduce mismatch risk with the demonstrated interaction model.
- Plan impact: keep gated lead-capture dialog behavior as optional parity work, not AC-critical scope unless explicitly requested.

## 3. System Architecture
- Route 1: `HomePage.vue` with scientific narrative and interaction instructions.
- Route 2: `ViewerPage.vue` split into `ControlsPanel.vue` and `NglViewport.vue`.
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
- Loads default ligand pair (`crystal`: baseline/refined toggle).
- Optional parity path: manage narrative slide progression as viewer-local state (not route changes), aligned with observed live flow.
- FragMaps remain unloaded until toggled on.
- On map toggle: load `.dx`, create surface rep, cache component+rep handle.
- On iso change: update visible map reps via parameter update path.
- On ligand change: remove current ligand component, load selected ligand pose component.

### Important APIs/Interfaces/Types
- No public backend APIs are introduced.
- Public app interface: static web UI + optional URL state (if added later, not required in v1).
- Internal TypeScript contracts:
- `type PoseKind = "baseline" | "refined"`
- `type LigandId = "crystal" | "p38_goldstein_05_2e" | "p38_goldstein_06_2f" | "p38_goldstein_07_2g" | "p38_goldstein_08_2h" | "p38_goldstein_09_2i"`
- `interface LigandAsset { id: LigandId; label: string; baselineSdf: string; refinedSdf: string }`
- `interface FragMapAsset { id: string; label: string; dxUrl: string; color: string; defaultIso: number }`
- `interface ViewerState { ligandId: LigandId; pose: PoseKind; iso: number; visibleMapIds: string[]; cameraSnapshot?: object }`

## 4. Data & File Handling Plan (.pdb, .sdf, .map/.dx)
- Source of truth files:
- Protein: `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/from_silcsbio/3fly.pdb`
- Crystal baseline: `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/from_silcsbio/3fly_cryst_lig.sdf`
- Crystal refined: `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/from_silcsbio/3fly_cryst_lig_posref.sdf`
- Ligand baseline dir: `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/from_silcsbio/ligands`
- Ligand refined dir: `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/from_silcsbio/ligands_posref`
- FragMaps runtime format: `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/from_silcsbio/maps/*.dx`
- Runtime asset strategy:
- Copy required assets into `/public/assets/protein`, `/public/assets/ligands`, `/public/assets/maps`.
- Load protein eagerly.
- Load ligand and map files lazily based on user actions.
- Cache parsed/loaded components keyed by ligand/map ID.
- Data validation checks at startup:
- Confirm selected ligand baseline/refined file pair exists.
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
- Phase 2 (2.0h): stage lifecycle + protein load + camera controls.
- Phase 3 (1.5h): ligand workflow (selector + baseline/refined toggle + no reload switch).
- Phase 4 (2.0h): FragMap overlays (toggle, color, visibility state, caching).
- Phase 5 (1.0h): iso-value control and fast update path for visible maps.
- Phase 6 (1.0h): Home page narrative, captions/sidebar explanations.
- Phase 7 (1.5h): performance tuning, AC verification, runtime hardening, deploy.
- Total: ~10.5h.

## 7. Requirement-to-Implementation Mapping
- PRD Requirement: Home / Overview + scientific narrative.
- Implementation: `HomePage` content blocks + concise explanation text + links.
- PRD Requirement: Interactive viewer with 3FLY protein.
- Implementation: `NglViewport` initialization + `3fly.pdb` load at route entry.
- PRD Requirement: show different ligands and baseline/refined without reload.
- Implementation: typed ligand manifest + in-place component swap + pose toggle control.
- PRD Requirement: show/hide individual FragMap surfaces.
- Implementation: map checklist controls + per-map component cache + visibility toggle.
- PRD Requirement: iso-value adjustment with fast response.
- Implementation: global iso slider + parameter update on visible map reps.
- PRD Requirement: client-side only, open source, Chrome/Safari.
- Implementation: static Vue bundle (Webpack via Vue CLI) + no backend code + cross-browser validation runbook.

## 8. Acceptance Criteria Test Plan (AC-1..AC-6)
- AC-1 (`<=5s load`):
- Scenario: cold start on local production build.
- Method: `performance.now()` from route mount to protein + default ligand visible.
- Pass: median of 3 runs <= 5000 ms.
- AC-2 (`map toggle <200 ms` + camera preserved):
- Scenario: toggle each map on/off with camera at non-default orientation.
- Method: interaction timer around toggle action; compare pre/post camera matrices.
- Pass: each toggle <200 ms; camera unchanged.
- AC-3 (baseline/refined toggle no reload):
- Scenario: selected ligand pose toggle repeatedly.
- Method: verify no navigation, no full app remount, component swap only.
- Pass: toggles occur in-place with continuous interaction.
- AC-4 (ligand switching no reload):
- Scenario: switch among crystal + 5 ligands.
- Method: in-app selector switches and pose options update in same session.
- Pass: no page reload; pose toggle remains functional post-switch.
- AC-5 (iso update <200 ms):
- Scenario: adjust slider across 3 values with at least one visible map.
- Method: timer from input event to visual rep update complete.
- Pass: each update <200 ms.
- AC-6 (no uncaught runtime errors in 5-minute exploration):
- Scenario: scripted manual session covering all controls.
- Method: monitor console errors and UI error boundaries.
- Pass: zero uncaught errors.

## 9. Risks, Unknowns, and Mitigations
- Risk: volume update performance exceeds 200 ms when many maps are visible.
- Mitigation: lazy load, cache reps, throttle slider updates to animation frame, update visible reps only.
- Risk: large map payloads increase initial latency.
- Mitigation: do not preload maps; load on first toggle only.
- Risk: file parsing edge cases for specific ligands.
- Mitigation: include per-ligand load error state and fallback to previous valid ligand.
- Risk: browser variance between Chrome/Safari.
- Mitigation: lock validation script and run both browsers before final delivery.
- Risk: Vue 2 ecosystem is legacy compared with modern Vue 3 tooling.
- Mitigation: pin dependencies, keep scope narrow, and avoid non-essential third-party plugins.
- Unknown: exact iso defaults for best scientific readability.
- Mitigation: set map-specific defaults from quick visual calibration and expose slider for adjustment.

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

## 11. Out-of-Scope Guardrails
- No backend services or APIs.
- No new docking/scoring or lead optimization inference engine.
- No support beyond provided 3FLY dataset for v1.
- No requirement to parse `.map` at runtime in v1.
- No medicinal chemistry recommendation layer.

## Explicit Assumptions and Defaults
- Framework fixed: Vue 2 + TypeScript + Vue Router + Vuex + Vuetify 2.
- Viewer fixed: NGL.
- Hosting fixed: GitHub Pages.
- Ligand scope fixed: crystal + 5 ligands (`05_2e` to `09_2i`) for v1.
- FragMap runtime format fixed: `.dx` only.
