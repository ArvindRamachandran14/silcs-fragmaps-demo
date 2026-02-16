# Milestone Inventory

Use this file to track implementation and gate evidence for each milestone in `docs/plans/execution-plan.md`.

## How to Update
- Add one section per milestone (`M1`..`M8`).
- For each milestone, capture:
  - Brief summary
  - Files created/updated with file-level purpose and milestone-specific delta
  - Commands run
  - Design preview evidence and approval reference for user-facing UI changes
  - Gate checklist (pass/fail)
  - Residual risks/blockers
- Validation execution context rule:
  - Treat local host-terminal command runs as authoritative gate evidence.
  - If agent-side tooling is unavailable, record agent attempts as `ENV-BLOCKED` and continue with required local runs.
  - Mark milestone `PASS` only after required local validation command(s) complete and outputs are captured.
- File entry rule:
  - If file is new: describe what the file does.
  - If file already existed: describe what changed in this milestone and why it matters.
- Commands run entry format (recommended):
  - `Agent run:` include command + pass/fail/ENV-BLOCKED.
  - `Local run:` include command + pass/fail and key output lines used for gate evidence.
- Design preview gate rule:
  - For milestones that introduce/change user-facing UI, include artifact paths under `docs/design-previews/<milestone-or-feature>/` and an explicit in-thread approval reference (`APPROVED UI PREVIEW`) before implementation evidence.
  - If approval is missing, mark milestone as `BLOCKED-DESIGN` for that scope.
  - Locked M5 exception: track previews under `docs/screenshots/Design_previews/m5-fragmap-controls/` with one front page plus one preview page per required slice (`M5.1`, `M5.2`, `M5.2a`, `M5.2b`, `M5.3`, `M5.4`, `M5.5`, `M5.5a`, `M5.6`); optional exploratory `M5.2c` preview artifacts may be retained for reference.

## M1 - Project Scaffold + Routing Foundation

### Summary
- Implemented Vue 2 + TypeScript scaffold with Vue Router, Vuex, and Vuetify.
- Added routes for `/` and `/viewer`.
- Added automated M1 validation script for route render checks, SPA navigation checks, and unknown-route resilience.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `.gitignore` | Updated | Controls which local/generated files are excluded from git. | Added `node_modules/` and `dist/` so dependency/build outputs stay untracked for the new app scaffold. |
| `package.json` | Created | Defines project metadata, scripts, and runtime/dev dependencies. | Introduced Vue 2 + TypeScript + Vue Router + Vuex + Vuetify stack and M1 scripts (`build`, `serve`, `validate:m1`). |
| `package-lock.json` | Created | Locks exact dependency versions for reproducible installs. | Captured resolved dependency tree for the new scaffold. |
| `babel.config.js` | Created | Configures Babel for Vue CLI transpilation. | Added baseline Babel preset required by the scaffold build. |
| `tsconfig.json` | Created | Defines TypeScript compiler behavior and source inclusion. | Added strict TypeScript settings, DOM libs, and `@` path alias used by app/router imports. |
| `vue.config.js` | Created | Vue CLI project-level build configuration. | Enabled Vuetify transpilation compatibility for the chosen stack. |
| `public/index.html` | Created | Static HTML shell and app mount point. | Added root document with `#app` container for SPA bootstrap. |
| `src/main.ts` | Created | App entry point that mounts Vue instance. | Wired router, store, and Vuetify into the root app for M1 foundation. |
| `src/App.vue` | Created | Root layout and top-level navigation shell. | Added app bar and router-links to `/` and `/viewer`, plus `<router-view>` for page rendering. |
| `src/router/index.ts` | Created | Defines client-side routes and router behavior. | Added `/` and `/viewer` routes, history mode, and wildcard redirect for unknown routes. |
| `src/store/index.ts` | Created | Vuex store initialization point. | Added minimal empty store scaffold required by locked architecture. |
| `src/plugins/vuetify.ts` | Created | Initializes Vuetify and loads framework CSS. | Added Vuetify plugin integration used at app bootstrap. |
| `src/pages/HomePage.vue` | Created | Home (`/`) page component. | Added M1 placeholder content and button navigation to `/viewer`. |
| `src/pages/ViewerPage.vue` | Created | Viewer (`/viewer`) page component. | Added M1 placeholder viewer route with button back to `/`. |
| `src/shims-vue.d.ts` | Created | Type declaration shim for importing `.vue` files in TS. | Added required TS compatibility file for Vue SFC imports. |
| `scripts/validate-m1.js` | Created | Automated M1 gate verifier executed via Node/Playwright. | Added checks for route rendering, SPA navigation no-reload behavior, and unknown-route resilience. |

### Commands Run
- `node -v`
- `npm -v`
- `npm install`
- `npm run build`
- `npm run validate:m1`

### Gate Checklist
- Design Preview Gate approved (for UI scope): PASS/FAIL/BLOCKED-DESIGN
- Production build succeeds: PASS
- `/` renders: PASS
- `/viewer` renders: PASS
- Navigation `/` <-> `/viewer` is SPA (no full page reload): PASS
- Unknown route does not crash app: PASS

### Post-M1 Deployment Verification (GitHub Pages)
- Live URL verified working: `https://arvindramachandran14.github.io/silcs-fragmaps-demo/`.
- Deployment-fix commit tied to this verification: `c611f70` (`fix(deploy): configure GitHub Pages base path and SPA fallback`).
- Files changed for deployment fix:
  - `.github/workflows/deploy-pages.yml`: Added GitHub Actions workflow to build/deploy `dist` to GitHub Pages.
  - `vue.config.js`: Added production `publicPath` for project pages (`/silcs-fragmaps-demo/`).
  - `src/router/index.ts`: Added router `base: process.env.BASE_URL` for subpath hosting.
  - `public/index.html`: Added redirect recovery script for SPA deep-link restoration.
  - `public/404.html`: Added SPA fallback redirect page for GitHub Pages.

### Residual Risks/Blockers
- No M1 gate blockers.
- Non-blocking:
  - Dependency audit warnings (13 vulnerabilities reported during install).
  - Bundle-size warnings during production build.

---

## M2 - Data Manifest + Assets + Startup Validation

### Summary
- Added deterministic runtime asset staging from `from_silcsbio` into `public/assets/{protein,ligands,maps}`.
- Added typed manifest contracts and canonical FragMap inventory mapping checks.
- Added startup validation workflow that reports missing assets as non-blocking issues with disable-intent metadata.
- Added M2 validation script and npm command wiring for staging + gate verification.
- M2 gate verification completed locally with passing `validate:m2` output.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `package.json` | Updated | Defines project scripts and dependencies. | Added `stage:assets`, `prebuild`, `preserve`, `validate:m2`, and `prevalidate:m2` to enforce deterministic asset staging and M2 verification flow. |
| `scripts/stage-assets.js` | Created | Deterministic staging pipeline for runtime assets. | Copies protein/ligands/maps from `from_silcsbio` into `public/assets`, enforces required files, and emits `public/assets/manifest.json` with canonical FragMap mapping metadata. |
| `scripts/validate-m2.js` | Created | M2 gate verification utility. | Verifies manifest coverage (`3fly_cryst_lig` + all baseline ligands), runtime asset existence, non-blocking missing-asset simulation with disable-intent metadata, and exact FragMap ID/label mapping. |
| `src/data/manifest.ts` | Created | Typed manifest contracts and manifest loading helpers. | Added asset interfaces (protein/ligands/fragmaps), runtime manifest loading from `/assets/manifest.json`, and strict FragMap inventory mapping validation against spec labels. |
| `src/viewer/loaders.ts` | Created | Runtime asset reachability helper(s). | Added fetch-based asset existence check (`HEAD` with `GET` fallback) to support startup validation without introducing M3 viewer behavior. |
| `src/startup/startupValidation.ts` | Created | Startup validation engine and report types. | Added non-blocking startup checks for protein/ligands/maps and FragMap mapping, including structured disabled-control intent metadata for local UI controls. |
| `src/store/modules/startup.ts` | Created | Vuex startup validation state module. | Added `runValidation` action that loads manifest + startup report while preserving app availability on errors. |
| `src/store/index.ts` | Updated | Root Vuex store bootstrap. | Registered namespaced `startup` module and typed root state to expose startup validation report globally. |
| `src/main.ts` | Updated | App bootstrap entrypoint. | Triggers startup validation dispatch (`startup/runValidation`) immediately after app mount. |
| `src/App.vue` | Updated | App shell and global notifications. | Added non-blocking warning banner and debug-visible disable-intent payload output when startup validation reports missing assets. |

### Commands Run
- Local run: `npm run stage:assets` (pass)
- Local run: `npm run build` (pass)
- Local run: `npm run validate:m2` (pass)
- `validate:m2` evidence:
  - Manifest covers crystal and all baseline ligands
  - Startup validation checks runtime assets
  - Missing-asset simulation is non-blocking and sets disable intent metadata
  - FragMap IDs and labels match spec inventory

### Manual Verification
- Step 1 (run M2 commands): Verified.
- Step 2 (staged runtime structure exists under `public/assets/...`): Verified.
- Step 3 (manifest coverage includes crystal + all baseline ligand IDs): Verified.
- Step 4 (FragMap ID/label mapping matches canonical inventory): Verified.
- Step 5 (missing-asset behavior is non-blocking with disable-intent metadata): Verified.

### Gate Checklist
- Design Preview Gate approved (for UI scope): PASS/FAIL/BLOCKED-DESIGN
- Manifest includes `3fly_cryst_lig` and all baseline ligand IDs: PASS
- Startup validation checks required protein/ligand/map assets: PASS
- Missing-asset simulation triggers non-blocking error and local disable intent: PASS
- FragMap IDs and labels match spec inventory exactly: PASS
- Build succeeds in production mode: PASS

### Residual Risks/Blockers
- No M2 gate blockers after local validation pass.
- Non-blocking:
  - This execution environment still cannot run npm commands directly, so command evidence is host-reported for this milestone.

---

## M3 - Viewer Core Lifecycle/Layout/Defaults/Error Fallback

### Summary
- Implemented the M3 viewer shell with explicit loading/ready lifecycle, desktop/mobile scaffold, default-state store contract, camera baseline/reset contract, and catastrophic startup fallback with retry/home recovery actions.
- Implemented real NGL startup rendering in `nglStage`: 3FLY protein PDB loaded with cartoon representation plus default crystal ligand baseline loaded with ball+stick representation.
- Added deterministic startup-render debug instrumentation so M3 validation can assert real molecular startup content (not scaffold placeholder behavior).
- Added a dedicated `validate:m3` Playwright gate script and validated M3 locally with passing output.
- Validation command contract note: `validate:m3` intentionally runs `build` first via `prevalidate:m3` because the checker validates compiled `dist` output; this differs from milestones that validate staged assets/source contracts without requiring `dist`.
- Added a desktop layout hardening pass for fullscreen usage so the right controls panel remains fully visible and page-level horizontal overflow is prevented.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/store/modules/viewer.ts` | Created | Vuex module for viewer shell state/lifecycle. | Added M3 default-state contract (`3fly_cryst_lig`, baseline ON, refined OFF, no maps), camera baseline/snapshot state, and loading/ready/error mutations. |
| `src/store/index.ts` | Updated | Root Vuex store registration and root typing. | Registered new namespaced `viewer` module so `/viewer` lifecycle and default state are store-backed. |
| `src/viewer/nglStage.ts` | Created | Viewer-stage lifecycle adapter and camera contract source-of-truth. | Added canonical camera baseline constant, startup asset checks, real NGL stage initialization, protein cartoon + default ligand ball+stick startup rendering, resize-preserve behavior, cleanup API, deterministic forced-failure path (`m3StageFail=1`), and startup-render debug instrumentation for validation. |
| `src/components/NglViewport.vue` | Created | Viewport host for stage mount plus lifecycle UI states. | Added explicit loading and ready state UX and stage host container for lifecycle binding. |
| `src/components/ViewerTopBar.vue` | Created | Viewer page top-level shell heading and actions. | Added reset-view action, Home navigation affordance, status label, mobile controls toggle trigger, and overflow-safe topbar text behavior. |
| `src/components/ControlsPanel.vue` | Created | M3 controls/caption sidebar container. | Added compact viewer context caption, default-state readout, camera baseline/current snapshot contract display, and overflow-safe text/code block handling for narrow side-panel widths. |
| `src/pages/ViewerPage.vue` | Updated | `/viewer` route container and shell orchestration. | Replaced M1 placeholder with full M3 shell lifecycle and updated desktop grid spacing (`no-gutters`, responsive 8/4 -> 9/3 split, min-width guards) to prevent right-panel clipping. |
| `src/App.vue` | Updated | App shell container wrapping route content. | Switched to fluid container layout for viewer pages so fullscreen desktop space is fully usable and less prone to clipped right-edge content. |
| `scripts/validate-m3.js` | Created | Automated M3 gate validator (Playwright). | Added checks for loading->ready transition, default state, real NGL startup rendering evidence (engine + protein/ligand representation assertions + stage canvas), camera baseline/reset, resize preservation, remount listener hygiene, forced failure fallback/recovery, deterministic load timing, build-base-path detection, and desktop no-clipping/no-horizontal-overflow assertions. |
| `package.json` | Updated | Project command contracts. | Added `validate:m3` and `prevalidate:m3` scripts so M3 validation always runs on a fresh `dist` build before executing the gate checks. |

### Commands Run
- `npm run validate:m3` (pass)
  - `prevalidate:m3` -> `npm run build` (pass)
  - `validate:m3` -> `node scripts/validate-m3.js` (pass)
  - reported output:
    - `/viewer` shows loading then ready state
    - default state contract is applied
    - desktop layout keeps controls panel fully visible with no horizontal overflow
    - camera baseline contract and reset-view target are enforced
    - resize preserves camera snapshot
    - unmount/remount avoids listener duplication
    - forced stage-init failure shows fallback with retry/home recovery

### Gate Checklist
- Design Preview Gate approved (for UI scope): PASS/FAIL/BLOCKED-DESIGN
- `/viewer` shows explicit loading then ready state: PASS (evidence: `npm run validate:m3` output).
- Default state (`3fly_cryst_lig`, baseline ON, refined OFF, no FragMaps): PASS (evidence: `npm run validate:m3` output).
- Camera baseline snapshot constant + reset target defined: PASS (evidence: `npm run validate:m3` output).
- Resize preserves camera state: PASS (evidence: `npm run validate:m3` output).
- Unmount/remount does not duplicate listeners: PASS (evidence: `npm run validate:m3` output).
- Forced stage-init failure shows fallback with recovery action(s): PASS (evidence: `npm run validate:m3` output).
- Desktop fullscreen layout keeps controls panel visible with no page-level horizontal overflow/clipping: PASS (evidence: `npm run validate:m3` output).

### Residual Risks/Blockers
- No blocker for implementation scope.
- Deterministic failure trigger for local validation: navigate to `/viewer?m3StageFail=1`, confirm fallback UI, then click `Retry startup` (clears query flag and re-initializes) or `Go to Home`.

---

## M4A - Ligand Core Workflow (`3fly_cryst_lig` only)

### Summary
- Implemented single-ligand (`3fly_cryst_lig`) ligand-control workflow with four pose states, explicit zoom action, both-visible legend, both-unchecked recovery actions, and per-pose failure isolation.
- Added dedicated M4A validator and script wiring, then passed sequential regression through `validate:m4a`.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/store/modules/viewer.ts` | Updated | Vuex viewer state for route-level viewer behavior. | Added M4A pose-control state (`disabled`, `loading`, `error`) and mutations for pose visibility/loading/error transitions. |
| `src/viewer/nglStage.ts` | Updated | NGL stage lifecycle and camera orchestration. | Added M4A pose APIs (`setPoseVisibility`, `zoomToLigand`), refined-pose lazy loading with fallback URL path, both-visible style differentiation, and deterministic query failure injection (`m4FailPose`). |
| `src/components/ControlsPanel.vue` | Updated | Right-side controls panel UI. | Added M4A ligand controls UI (baseline/refined checkboxes, legend, both-unchecked recovery actions, zoom button) while preserving existing M3 debug/state selectors. |
| `src/pages/ViewerPage.vue` | Updated | Viewer orchestration and event handling. | Wired M4A control events to stage/store logic, added per-pose failure isolation toast flow, and passed refined pose/failure-query options into stage initialization. |
| `scripts/validate-m4a.js` | Created | Automated M4A milestone validator. | Added checks for default state, four pose states, persistent empty-state recovery actions, both-visible legend, explicit zoom behavior, per-pose failure isolation, and no-reload interaction contract. |
| `package.json` | Updated | Project script command contract. | Added `validate:m4a` and `prevalidate:m4a` commands for reproducible M4A gate runs. |

### Commands Run
- `npm run validate:m1` -> PASS
- `npm run validate:m2` -> PASS
- `npm run validate:m3` -> PASS
- `npm run validate:m4a` -> PASS

### Gate Checklist
- Design Preview Gate approved (for UI scope): PASS.
- Default ligand is `3fly_cryst_lig` / `Crystal Ligand`: PASS.
- Four pose states (`baseline-only`, `refined-only`, `both-visible`, `both-unchecked`) work in-place: PASS.
- Both-unchecked recovery actions (`Show Baseline`, `Show Refined`, `Show Both`) are persistent and functional: PASS.
- Both-visible legend is shown with baseline/refined differentiation intent: PASS.
- Zoom is explicit user action only: PASS.
- Per-pose failure isolates to affected control and keeps unaffected control active: PASS.
- No M1-M3 regressions: PASS.

### Residual Risks/Blockers
- No blocker for M4A gate.
- Residual risk: Playwright browser startup can be environment-sensitive; `validate:m4a` uses SwiftShader launch args to keep runs deterministic in headless environments.

---

## M4B - Featured Ligands Expansion (no full-list search)

### Summary
- Implemented M4B featured-ligand switching with a fixed approved subset (`Crystal Ligand`, `05_2e`, `06_2f`, `07_2g`) while preserving all M4A pose contracts.
- Added chip-based in-place ligand switching, camera-preservation behavior, per-switch loading state, and failure fallback that disables failed featured chips without changing routes.
- Fixed post-switch/reset regression by replaying preserved viewer orientation without center-sign inversion, then resyncing live camera snapshots in stage orchestration.
- Added dedicated `validate:m4b` milestone gate and passed sequential regression through M4B.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/components/ControlsPanel.vue` | Updated | Right-side controls panel UI. | Added featured quick-pick chip row, switch-loading feedback, unavailable-chip summary, and switch-aware disabling for pose/zoom controls. |
| `src/pages/ViewerPage.vue` | Updated | Viewer orchestration and event handling. | Added featured subset orchestration, chip-selection switch handler, per-ligand fallback disabling, and store updates for selected ligand + switch loading while preserving M4A interactions. |
| `src/store/modules/viewer.ts` | Updated | Vuex viewer state for route-level viewer behavior. | Added `ligandSwitchLoading` and `setSelectedLigand`/`setLigandSwitchLoading` mutations for M4B switching lifecycle state. |
| `src/viewer/nglStage.ts` | Updated | NGL stage lifecycle and camera orchestration. | Added in-place `switchLigand` API to replace ligand components while preserving camera state, plus deterministic reset-to-baseline restoration to prevent post-switch drift. |
| `scripts/validate-m4b.js` | Created | Automated M4B milestone validator. | Added checks for featured subset chips, in-place switching, camera preservation, reset-after-switch baseline restoration, post-switch M4A behavior continuity, refined failure isolation, and failed-feature disable fallback. |
| `package.json` | Updated | Project script command contract. | Added `validate:m4b` and `prevalidate:m4b` commands for reproducible M4B gate runs. |

### Commands Run
- `npm run build` -> PASS
- `npm run validate:m1` -> PASS
- `npm run validate:m2` -> PASS
- `npm run validate:m3` -> PASS
- `npm run validate:m4a` -> PASS
- `npm run validate:m4b` -> PASS (rerun confirmed PASS; required unsandboxed run due local port bind restriction)
- Targeted Playwright manual-sequence smoke (default reset + featured switches + reset-after-switch) -> PASS

### Gate Checklist
- Design Preview Gate approved (for UI scope): PASS.
- Featured quick-pick chips include approved M4B subset (`Crystal Ligand`, `05_2e`, `06_2f`, `07_2g`): PASS.
- Ligand switching across featured set is in-place with no route reload: PASS.
- Camera snapshot is preserved on ligand switch: PASS.
- M4A pose/error behavior remains correct after ligand switch: PASS.
- No searchable full-ligand selector was introduced in M4B: PASS.
- No M1-M4A regressions in sequential gate run: PASS.

### Residual Risks/Blockers
- No blocker for M4B gate.
- Residual risk: `docs/specs/ligand-workflow-spec.md` Section 4 still lists a larger canonical featured set; M4B implementation follows the approved 4-ligand subset decision and should be reconciled in spec docs to avoid future ambiguity.

---

## M4C (Deferred) - Full Ligand List + Search + Ordering

### Summary
- Deferred stretch scope; not a blocker for M5-M8 progression.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M4C and why.` |

### Commands Run
- Pending/deferred.

### Gate Checklist
- Not required for M5-M8 gate progression unless explicitly re-promoted.

### Residual Risks/Blockers
- Deferral risk: full-list selector/search may reintroduce state-management regressions if implemented late; isolate with dedicated validator.

---

## M5 - FragMap Controls (Sliced Delivery)

### Summary
- M5 is executed as nine required gated slices (`M5.1`, `M5.2`, `M5.2a`, `M5.2b`, `M5.3`, `M5.4`, `M5.5`, `M5.5a`, `M5.6`) with Prompt A + Prompt B per slice.
- `M5.2c` is tracked as optional exploratory parity investigation only (non-blocking, not part of required milestone flow).
- Preview packet path is locked to `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Packet structure is locked to one front page plus one preview page per slice.

### Slice Tracker
| Slice | Scope | Design Gate | Implementation Gate | Status |
|---|---|---|---|---|
| `M5.1` | Panel shell only (Primary/Advanced sections, labels/colors, all-hidden defaults) plus right-panel two-tab framework (`FragMap` + `Ligand`) with `FragMap` active by default and `Ligand` preserving existing M4B controls | PASS | PASS | Completed |
| `M5.2` | Primary-3 visibility engine (toggle + lazy load + cache reuse + camera preserved) | PASS | PASS | Completed |
| `M5.2a` | Wireframe rendering pass (triangulated wireframe style for all FragMaps including fixed gray Exclusion) | PASS | PASS | Completed |
| `M5.2b` | Protein visibility toggle only (`Protein cartoon` show/hide in FragMap tab; default on) | PASS | PASS | Completed |
| `M5.2c` | Optional/deferred wireframe parity investigation (docs + exploratory packet only; non-blocking) | N/A | N/A | Deferred exploratory |
| `M5.3` | Advanced rows + Exclusion map fixed wireframe behavior | PASS | PASS | Completed |
| `M5.4` | Per-map iso controls only (numeric contract for adjustable rows) | PASS | PASS | Completed |
| `M5.5` | Bulk actions only (`Hide all`, `Reset defaults`) | Completed | Completed | Prompt A approved; Prompt B implemented and validated |
| `M5.5a` | `Reset defaults` semantics refinement (iso-only reset, visibility unchanged) | PASS | PASS | Completed |
| `M5.6` | Reliability hardening (row-level failure isolation + retry + async race guards) + final M5 gate | PASS | PASS | Completed |

### M5.1 - FragMap Panel Shell

#### Summary
- Prompt A is approved; Prompt B implementation is complete.
- Approved design contract for this slice includes right-panel tabs (`FragMap` + `Ligand`) with `FragMap` active by default and `Ligand` preserving existing M4B controls.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/components/ControlsPanel.vue` | Updated | Right controls panel UI shell and ligand workflow controls. | Added `FragMap`/`Ligand` tab strip (FragMap default active), rendered M5.1 FragMap shell (action row + Primary/Advanced canonical rows, all-hidden defaults), and kept existing M4B ligand controls under `Ligand` tab. |
| `src/pages/ViewerPage.vue` | Updated | Viewer route orchestration and controls-panel wiring. | Added canonical FragMap shell row model + fallback mapping and passed it into `ControlsPanel` without introducing FragMap runtime toggle/load/iso behavior. |
| `scripts/validate-m4a.js` | Updated | M4A regression validator. | Scoped selectors to desktop controls panel and added explicit `Ligand` tab activation before ligand checks so M4A assertions remain deterministic with M5.1 tabs. |
| `scripts/validate-m4b.js` | Updated | M4B regression validator. | Scoped selectors to desktop controls panel and added explicit `Ligand` tab activation/waited text assertions before M4B ligand-switch checks. |
| `scripts/validate-m5-1.js` | Created | Dedicated M5.1 slice validator. | Adds explicit checks for M5.1 shell contract: default `FragMap` tab, disabled action row, canonical Primary/Advanced rows disabled+unchecked, `Ligand` tab accessibility, and no route reload on tab switch. |
| `package.json` | Updated | Project script command contract. | Added `validate:m5.1` and `prevalidate:m5.1` so M5.1 shell checks can be rerun during M5.2+ slice work to guard regressions. |

#### Commands Run
- `npm run build` -> PASS.
- `npm run validate:m1` -> FAIL (known intermittent snackbar click interception on first run), then PASS on rerun.
- `npm run validate:m2` -> PASS.
- `npm run validate:m3` -> PASS.
- `npm run validate:m4a` -> PASS.
- `npm run validate:m4b` -> PASS.
- `npm run validate:m5.1` -> PASS (first sandboxed attempt was `ENV-BLOCKED` on local port bind; unsandboxed rerun passed).

#### Gate Checklist
- Prompt A preview for `M5.1` approved (`APPROVED UI PREVIEW`): PASS (approved in-thread, 2026-02-16).
- Prompt B implementation stayed within `M5.1` scope boundary: PASS.
- Right-panel tab framework (`FragMap` + `Ligand`) is present and `Ligand` tab preserves existing M4B controls: PASS.
- No M1-M4B regressions after `M5.1` checks: PASS.

#### Residual Risks/Blockers
- `validate:m1` still shows intermittent snackbar click-interception on some runs; rerun currently clears and all required milestones are passing.
- M5.1 intentionally does not include FragMap runtime toggle/load/iso behavior; this begins in `M5.2`+ by plan.

### M5.2 - Primary-3 Visibility Engine

#### Summary
- Prompt A is approved; Prompt B implementation is complete.
- Added Primary-3 in-place visibility toggles with lazy first-load, cache reuse, and camera-preservation behavior.
- Locked M5.2 behavior decisions from approved preview:
  - loading lock `Option B` (temporarily disable non-loading Primary rows during first-load),
  - success feedback `Option A` (inline `Loaded from cache`),
  - retry UI deferred to `M5.6`.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/components/ControlsPanel.vue` | Updated | Right controls panel UI shell and ligand workflow controls. | Enabled Primary-3 runtime checkbox toggles, added row-level status/error text hooks, enforced loading-lock disable behavior, kept Advanced rows disabled, and updated M5 scope note for Primary-3-only runtime behavior. |
| `src/pages/ViewerPage.vue` | Updated | Viewer route orchestration and controls-panel wiring. | Added Primary-3 runtime state orchestration, toggle handler wiring, lazy-load/cache status updates, row disable-on-failure behavior, visible-map state commits, and map-failure/query wiring for deterministic validation. |
| `src/viewer/nglStage.ts` | Updated | NGL stage lifecycle and camera orchestration. | Added FragMap visibility API with lazy map loading, cache reuse, forced map-failure injection (`m5FailMap`), optional minimum map-load delay (`m5MapLoadMs`), and camera-preserving map show/hide updates. |
| `src/store/modules/viewer.ts` | Updated | Vuex viewer state for route-level viewer behavior. | Added mutation `setVisibleFragMapIds` so M5.2 map visibility state remains canonical and observable in diagnostics/validators. |
| `scripts/validate-m5-2.js` | Created | Automated M5.2 milestone validator. | Added checks for Primary-vs-Advanced row enablement, first-load row lock, cache-hit inline status (`Loaded from cache`), camera preservation, row-level failure isolation, and no-route-reload interactions. |
| `scripts/validate-m5-1.js` | Updated | Dedicated M5.1 shell validator. | Relaxed row-disable assertions so M5.1 shell checks remain valid after M5.2 enables Primary rows while still requiring Advanced rows disabled by default. |
| `package.json` | Updated | Project script command contract. | Added `validate:m5.2` and `prevalidate:m5.2` command wiring. |
| `scripts/run_checks.sh` | Updated | Local sequential gate runner. | Extended command list through `validate:m5.2`. |

#### Commands Run
- `npm run build` -> PASS.
- `npm run validate:m1` -> FAIL (intermittent snackbar click interception), rerun -> PASS.
- `npm run validate:m2` -> PASS.
- `npm run validate:m3` -> PASS.
- `npm run validate:m4a` -> PASS.
- `npm run validate:m4b` -> PASS.
- `npm run validate:m5.1` -> PASS.
- `npm run validate:m5.2` -> first run `ENV-BLOCKED` in sandbox (`listen EPERM 127.0.0.1:4177`), unsandboxed rerun -> FAIL (validator timing issue), final rerun after validator wait fix -> PASS.

#### Gate Checklist
- Prompt A preview for `M5.2` approved (`APPROVED UI PREVIEW`): PASS (explicit in-thread approval on 2026-02-16).
- Prompt B implementation stayed within `M5.2` scope boundary: PASS.
- Primary-3 toggles are in-place with lazy-first-load + cache reuse + camera preserved: PASS.
- No regressions against completed slices (`M5.1`) and M1-M4B baseline: PASS.

#### Residual Risks/Blockers
- `validate:m1` intermittently fails on first run due snackbar click interception, but rerun passes; continue to treat as harness flake until stabilized.
- M5.2 intentionally excludes wireframe rendering pass, protein visibility toggle, Advanced/Exclusion runtime behavior, iso controls, bulk actions, and reliability retry UX; these remain scoped to `M5.2a`..`M5.6`.

### M5.2a - Wireframe Rendering Pass

#### Summary
- Prompt A is approved; Prompt B implementation is complete.
- Rendering style changed from filled/translucent map surfaces to triangulated wireframe map rendering without changing M5.2 interaction behavior.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/viewer/nglStage.ts` | Updated | NGL stage lifecycle and FragMap rendering orchestration. | Updated FragMap representation creation to wireframe `surface` rendering (`wireframe: true`, `opacity: 1`) for all FragMaps, and enforced fixed gray color for `Exclusion Map` (`3fly.excl.dx`) regardless of requested color input. Added M5 debug state for representation-style validation evidence. |
| `scripts/validate-m5-2a.js` | Created | Automated M5.2a milestone validator. | Added wireframe rendering gate checks for Primary rows plus fixed-gray exclusion-wireframe enforcement; includes camera-preservation and in-place interaction checks. |
| `package.json` | Updated | Project script command contract. | Added `validate:m5.2a` and `prevalidate:m5.2a` script wiring. |
| `scripts/run_checks.sh` | Updated | Local sequential gate runner. | Extended sequential command list through `validate:m5.2a`. |

#### Commands Run
- `npm run build` -> PASS.
- `bash scripts/run_checks.sh` -> PASS.
  - Includes sequential checks:
    - `npm run build` -> PASS
    - `npm run validate:m1` -> PASS
    - `npm run validate:m2` -> PASS
    - `npm run validate:m3` -> PASS
    - `npm run validate:m4a` -> PASS
    - `npm run validate:m4b` -> PASS
    - `npm run validate:m5.1` -> PASS
    - `npm run validate:m5.2` -> PASS
    - `npm run validate:m5.2a` -> PASS

#### Gate Checklist
- Prompt A preview for `M5.2a` approved (`APPROVED UI PREVIEW`): PASS (explicit in-thread approval on 2026-02-16).
- Prompt B implementation stayed within `M5.2a` scope boundary: PASS.
- Triangulated wireframe rendering style is applied to all FragMaps, including fixed gray Exclusion style, without changing M5.2 interaction contracts: PASS.
- No regressions against completed slices (`M5.1`-`M5.2`) and M1-M4B baseline: PASS.

#### Residual Risks/Blockers
- Protein visibility toggle (`M5.2b`) is complete; Advanced/Exclusion interactive behavior remains deferred to `M5.3`.
- M5.2a style validation currently uses debug instrumentation and a direct test-path exclusion-map load call for deterministic enforcement checks.

### M5.2b - Protein Visibility Toggle

#### Summary
- Prompt A is approved; Prompt B implementation is complete.
- Added a tab-row `Show Protein` toggle (default ON) that controls protein cartoon visibility in-place without affecting map visibility, ligand pose state, or camera.
- Added dedicated `M5.2b` validator and extended sequential check runner through `validate:m5.2b`.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/components/ControlsPanel.vue` | Updated | Right controls panel UI shell and ligand/FragMap controls. | Added tab-row `Show Protein` checkbox control (`fragmap-show-protein-control` / `fragmap-protein-toggle`), new `toggle-protein` emit path, and hidden diagnostics probe for protein visibility state. |
| `src/pages/ViewerPage.vue` | Updated | Viewer route orchestration and controls-panel wiring. | Wired protein visibility props/events into desktop/mobile controls panels; added `handleProteinToggle` with ready/loading guards, in-place stage update, and camera snapshot refresh. |
| `src/store/modules/viewer.ts` | Updated | Vuex viewer state for route-level viewer behavior. | Added canonical `proteinVisible` state (default `true`) and `setProteinVisible` mutation, including reset-on-loading behavior. |
| `src/viewer/nglStage.ts` | Updated | NGL stage lifecycle and camera orchestration. | Added `setProteinVisibility(visible)` API with camera/transform preservation; retained protein component handle; exposed `proteinVisible` in M5 debug state. |
| `scripts/validate-m5-2b.js` | Created | Automated M5.2b milestone validator. | Added checks for default-on protein toggle, loading-phase disable behavior, in-place ON/OFF toggles, no-route-reload, and no regression to map/ligand/camera state contracts. |
| `package.json` | Updated | Project script command contract. | Added `validate:m5.2b` and `prevalidate:m5.2b` script wiring. |
| `scripts/run_checks.sh` | Updated | Local sequential gate runner. | Extended sequential command list through `validate:m5.2b`. |

#### Commands Run
- `bash scripts/run_checks.sh` -> FAIL (first pass only at `validate:m5.2b`; validator expected hidden diagnostics selector visibility).
- `bash scripts/run_checks.sh` -> PASS (after validator fix to use selector `state: "attached"` for hidden diagnostics probes).
  - Includes sequential checks:
    - `npm run build` -> PASS
    - `npm run validate:m1` -> PASS
    - `npm run validate:m2` -> PASS
    - `npm run validate:m3` -> PASS
    - `npm run validate:m4a` -> PASS
    - `npm run validate:m4b` -> PASS
    - `npm run validate:m5.1` -> PASS
    - `npm run validate:m5.2` -> PASS
    - `npm run validate:m5.2a` -> PASS
    - `npm run validate:m5.2b` -> PASS

#### Gate Checklist
- Prompt A preview for `M5.2b` approved (`APPROVED UI PREVIEW`): PASS (explicit in-thread approval on 2026-02-16).
- Prompt B implementation stayed within `M5.2b` scope boundary: PASS.
- Protein visibility toggle is in-place (`on` by default) and does not regress M5.1-M5.2a map/ligand behavior: PASS.
- No regressions against completed slices (`M5.1`-`M5.2a`) and M1-M4B baseline: PASS.

#### Residual Risks/Blockers
- M5.2b validator still depends on hidden diagnostics probes (`camera-snapshot`, pose/map state text) that should be retired once milestone validators migrate to explicit runtime APIs.
- Per-map iso controls (`M5.4`), bulk actions (`M5.5`), and reliability hardening (`M5.6`) remain pending.

### M5.2c - Wireframe Parity Tuning Pass

#### Summary
- `M5.2c` is reclassified as optional exploratory investigation, not a required milestone gate.
- Active implementation flow proceeds from `M5.2b` directly to `M5.3`.
- Investigation artifacts are retained for future optional parity work.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `docs/investigations/m5.2c-wireframe-parity-investigation.md` | Created | Investigation packet for parity mismatch learnings. | Captures symptoms, hypotheses, ruled-out causes, repro steps, and resume checklist for later optional parity work. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.2c-wireframe-parity-states.svg` | Created | Exploratory preview artifact. | Stores exploratory parity concept states for future reference (not a required gate artifact). |
| `docs/screenshots/Design_previews/m5-fragmap-controls/m5.2c-preview-index.md` | Created | Exploratory preview index. | Tracks exploratory parity scope and review notes (non-blocking). |

#### Commands Run
- No required milestone validation commands are tied to exploratory `M5.2c` while it remains deferred.

#### Gate Checklist
- Required gate for active milestone flow: N/A (exploratory/deferred).
- Investigation packet exists with clear resume path: PASS.

#### Residual Risks/Blockers
- Deferred parity investigation: remaining visual mismatch versus official screenshot references is tracked for later resume in `docs/investigations/m5.2c-wireframe-parity-investigation.md`.
- Per-map iso controls (`M5.4`), bulk actions (`M5.5`), and reliability hardening (`M5.6`) remain pending.

### M5.3 - Advanced Rows + Exclusion Map

#### Summary
- Prompt A is approved; Prompt B implementation is complete.
- Added in-place Advanced row visibility flow with default-collapsed Advanced section and toggleable Advanced map rows.
- Added Exclusion-row fixed-behavior cues (visibility-toggleable, fixed gray wireframe, iso-editing disabled in this slice).
- Added dedicated `validate:m5.3` milestone validator and extended sequential gate runner through `validate:m5.3`.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/components/ControlsPanel.vue` | Updated | Right controls panel UI shell and ligand/FragMap controls. | Enabled Advanced row runtime toggles, added default-collapsed Advanced section toggle, surfaced Exclusion iso-disabled helper note, and updated slice scope note to M5.3 behavior. |
| `src/pages/ViewerPage.vue` | Updated | Viewer route orchestration and controls-panel wiring. | Expanded FragMap runtime orchestration from Primary-only to all map rows (including Advanced and Exclusion) while preserving existing camera-preserving lazy-load/cache semantics. |
| `src/viewer/nglStage.ts` | Updated | NGL stage lifecycle and FragMap rendering orchestration. | Fixed Exclusion-map visibility by using fixed internal Exclusion isolevel `0.5` (instead of generic fallback `-0.8`) while keeping Exclusion iso controls disabled in UI. |
| `scripts/validate-m5-1.js` | Updated | M5.1 shell regression validator. | Updated shell assertions for post-M5.3 behavior: Advanced section now defaults collapsed and rows become visible when expanded; no longer expects Advanced rows to remain disabled. |
| `scripts/validate-m5-2.js` | Updated | M5.2 regression validator. | Updated expectations for post-M5.3 UI shape by expanding Advanced section before row assertions and removing obsolete Advanced-disabled expectation. |
| `scripts/validate-m5-3.js` | Created | Automated M5.3 milestone validator. | Added checks for default-collapsed Advanced section, Advanced row toggle behavior, Exclusion fixed-style/iso-disabled constraints, row-level failure isolation, and no-route-reload interactions. |
| `package.json` | Updated | Project script command contract. | Added `validate:m5.3` and `prevalidate:m5.3` script wiring. |
| `scripts/run_checks.sh` | Updated | Local sequential gate runner. | Extended sequential command list through `validate:m5.3`. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/README.md` | Updated | M5 preview packet front page. | Recorded M5.3 approval/completion and advanced active design gate to `M5.4` Prompt A. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md` | Updated | M5 preview packet approval ledger. | Recorded explicit `APPROVED UI PREVIEW` for M5.3 and Prompt-B completion note. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/m5.3-preview-index.md` | Updated | M5.3 Prompt-A preview index. | Updated approval state to pass after explicit in-thread approval token. |

#### Commands Run
- `bash scripts/run_checks.sh` -> FAIL (first pass only at `validate:m5.3`; validator asserted before row status transitioned from `Loading...`).
- `bash scripts/run_checks.sh` -> PASS (after `validate-m5-3.js` wait fix).
- `npm run validate:m5.3` -> first sandboxed attempt `ENV-BLOCKED` (`listen EPERM 127.0.0.1:4180`), unsandboxed rerun -> PASS after Exclusion isolevel hotfix.
  - Includes sequential checks:
    - `npm run build` -> PASS
    - `npm run validate:m1` -> PASS
    - `npm run validate:m2` -> PASS
    - `npm run validate:m3` -> PASS
    - `npm run validate:m4a` -> PASS
    - `npm run validate:m4b` -> PASS
    - `npm run validate:m5.1` -> PASS
    - `npm run validate:m5.2` -> PASS
    - `npm run validate:m5.2a` -> PASS
    - `npm run validate:m5.2b` -> PASS
    - `npm run validate:m5.3` -> PASS

#### Gate Checklist
- Prompt A preview for `M5.3` approved (`APPROVED UI PREVIEW`): PASS (explicit in-thread approval on 2026-02-16).
- Prompt B implementation stayed within `M5.3` scope boundary: PASS.
- Advanced rows and Exclusion behavior match spec (toggleable visibility, fixed gray triangulated wireframe style, iso disabled): PASS.
- No regressions against completed required slices (`M5.1`-`M5.2b`) and M1-M4B baseline: PASS.

#### Residual Risks/Blockers
- M5 validators still depend partly on hidden diagnostics probes (`camera-snapshot`, map/pose visibility text); migrating to explicit runtime APIs will reduce selector fragility.
- Per-map iso controls (`M5.4`), bulk actions (`M5.5`), and reliability hardening (`M5.6`) remain pending.

### M5.4 - Per-Map Iso Controls

#### Summary
- Completed (`PASS`): per-map iso controls are implemented for all iso-adjustable FragMap rows with row-level numeric contract enforcement (`step/min/max/precision`, clamp/revert), hidden-row iso persistence, and in-place visible-map isolevel updates while preserving camera and route state.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/components/ControlsPanel.vue` | Updated | Right-side controls UI for FragMap/Ligand tabs. | Added per-row iso controls (`-`, value, `+`) for adjustable rows, disabled fixed controls for Exclusion row, new iso events, and updated slice scope note for M5.4. |
| `src/pages/ViewerPage.vue` | Updated | Viewer-page orchestration between controls/store/stage controller. | Added per-row iso state initialization and handlers, clamp/revert logic, hidden-row iso persistence, and visible-row in-place isolevel updates via stage API. |
| `src/viewer/nglStage.ts` | Updated | NGL stage lifecycle and map/pose runtime APIs. | Added `setFragMapIso` API and `isoValue` propagation in `setFragMapVisibility` so cached maps render with current per-row iso while preserving camera. |
| `scripts/validate-m5-4.js` | Created | Playwright milestone validator for M5.4 gate. | Added automated checks for per-row iso controls, clamp/revert behavior, Exclusion iso disable contract, hidden-row iso persistence, and no-global-iso contract. |
| `package.json` | Updated | Command contract for build/validation scripts. | Added `validate:m5.4` and `prevalidate:m5.4`. |
| `scripts/run_checks.sh` | Updated | Sequential local regression runner. | Extended sequential run through `node scripts/validate-m5-4.js`. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/m5.4-preview-index.md` | Created/Updated | M5.4 Prompt-A preview index. | Added M5.4 state checklist and set approval state to pass after explicit token + Prompt-B completion. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.4-per-map-iso-controls-states.svg` | Created | M5.4 Prompt-A state artifact. | Added multi-panel default/loading/empty/error/success preview for per-map iso controls. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/README.md` | Updated | M5 preview packet front page. | Recorded M5.4 completion and advanced active design gate to `M5.5` Prompt A. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md` | Updated | M5 preview packet approval ledger. | Recorded explicit `APPROVED UI PREVIEW` for M5.4 and Prompt-B completion note. |

#### Commands Run
- `npm run build` -> PASS.
- `bash scripts/run_checks.sh` -> PASS.
  - Includes sequential checks:
    - `npm run build` -> PASS
    - `node scripts/validate-m1.js` -> PASS
    - `node scripts/validate-m2.js` -> PASS
    - `node scripts/validate-m3.js` -> PASS
    - `node scripts/validate-m4a.js` -> PASS
    - `node scripts/validate-m4b.js` -> PASS
    - `node scripts/validate-m5-1.js` -> PASS
    - `node scripts/validate-m5-2.js` -> PASS
    - `node scripts/validate-m5-2a.js` -> PASS
    - `node scripts/validate-m5-2b.js` -> PASS
    - `node scripts/validate-m5-3.js` -> PASS
    - `node scripts/validate-m5-4.js` -> PASS

#### Gate Checklist
- Prompt A preview for `M5.4` approved (`APPROVED UI PREVIEW`): PASS.
- Prompt B implementation stayed within `M5.4` scope boundary: PASS.
- Per-map iso numeric contract matches spec in-place behavior: PASS.
- No regressions against completed slices (`M5.1`-`M5.3`) and M1-M4B baseline: PASS.

#### Residual Risks/Blockers
- `Reset defaults` visibility-coupled behavior observed in M5.4/M5.5 has now been refined in `M5.5a` to iso-only semantics.
- Per-row retry/error recovery for iso update transport/runtime failures remains part of `M5.6` reliability hardening.
- `M5.6` reliability hardening is now the active next required slice.

### M5.5 - Bulk Actions

#### Summary
- Prompt A preview artifacts were approved via explicit `APPROVED UI PREVIEW`.
- Prompt B runtime implementation is complete for `Hide all` + `Reset defaults` only (no in-panel camera reset action).
- Sequential regression is green through `validate:m5.5`.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/components/ControlsPanel.vue` | Updated | Right-panel controls UI and action wiring. | Removed in-panel `Reset view`, enabled `Hide all` + `Reset defaults`, emitted bulk-action events, and updated M5 scope note text. |
| `src/pages/ViewerPage.vue` | Updated | FragMap runtime orchestration and UI event handlers. | Implemented `handleHideAllFragMaps` + `handleResetDefaultFragMaps`, added disabled-row retry-on-reset behavior, and locked action execution while bulk actions are in progress. |
| `src/viewer/nglStage.ts` | Updated | M5 debug telemetry baseline. | Extended `window.__viewerM5Debug` with bulk-action counters and retry-attempt tracking used by M5.5 validation. |
| `scripts/validate-m5-1.js` | Updated | M5.1 shell-contract validator. | Updated action-row assertions for the two-button contract (`Hide all`, `Reset defaults`) and explicit absence of in-panel `Reset view`. |
| `scripts/validate-m5-5.js` | Created | M5.5 milestone validator. | Added gate checks for bulk-action behavior, camera preservation, no-route-reload contract, and disabled-row retry isolation. |
| `package.json` | Updated | Validator command contract. | Added `validate:m5.5` / `prevalidate:m5.5` scripts. |
| `scripts/run_checks.sh` | Updated | Sequential validator runner. | Added `node scripts/validate-m5-5.js` to the single-build sequential suite. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5-preview-index.md` | Updated | M5.5 Prompt-A preview index. | Marked approval state as `PASS` after explicit approval and Prompt-B completion. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.5-bulk-actions-states.svg` | Updated | M5.5 Prompt-A state artifact. | Synced to final approved two-button contract (no in-panel `Reset view`). |
| `docs/screenshots/Design_previews/m5-fragmap-controls/README.md` | Updated | M5 preview packet front page. | Advanced active gate from `M5.5` to `M5.6` Prompt A. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md` | Updated | M5 preview packet approval ledger. | Added `M5.5` review record and Prompt-B completion note. |

#### Commands Run
- `node scripts/validate-m5-5.js` -> PASS.
- `bash scripts/run_checks.sh` -> PASS, including:
  - `npm run build` -> PASS
  - `node scripts/validate-m1.js` -> PASS
  - `node scripts/validate-m2.js` -> PASS
  - `node scripts/validate-m3.js` -> PASS
  - `node scripts/validate-m4a.js` -> PASS
  - `node scripts/validate-m4b.js` -> PASS
  - `node scripts/validate-m5-1.js` -> PASS
  - `node scripts/validate-m5-2.js` -> PASS
  - `node scripts/validate-m5-2a.js` -> PASS
  - `node scripts/validate-m5-2b.js` -> PASS
  - `node scripts/validate-m5-3.js` -> PASS
  - `node scripts/validate-m5-4.js` -> PASS
  - `node scripts/validate-m5-5.js` -> PASS

#### Gate Checklist
- Prompt A preview for `M5.5` approved (`APPROVED UI PREVIEW`): PASS.
- Prompt B implementation stayed within `M5.5` scope boundary: PASS.
- Bulk actions (`Hide all`, `Reset defaults`) match the approved `M5.5` contract at implementation time: PASS.
- No regressions against completed slices (`M5.1`-`M5.4`) and M1-M4B baseline: PASS.

#### Residual Risks/Blockers
- `M5.5a` refinement changed reset semantics in-place; future validator changes must preserve this contract.
- `M5.6` reliability hardening remains pending (row-level retry UX polish, async race guards, and final `validate:m5` umbrella gate).

### M5.5a - Reset Defaults Semantics Refinement

#### Summary
- Completed (`PASS`): `Reset defaults` now resets per-map iso values to canonical defaults while preserving current map visibility and avoiding retry/recovery side-effects.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `src/pages/ViewerPage.vue` | Updated | Viewer-page orchestration for FragMap actions and runtime state. | Refined `handleResetDefaultFragMaps` to perform iso-only reset semantics (no implicit hide/show, no row retry side-effects) and reapply default iso values in place for currently visible rows. |
| `src/components/ControlsPanel.vue` | Updated | Right-panel controls UI and action hints. | Updated scope note text to reflect M5.5a contract (`Reset defaults` is iso-only; `Hide all` unchanged). |
| `scripts/validate-m5-5.js` | Updated | M5 bulk-action validator script. | Updated gate assertions so reset action must preserve visibility, restore canonical iso values, avoid retry side-effects, and keep camera/route stable. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/README.md` | Updated | M5 preview packet front page. | Marked M5.5a design gate as approved/completed and advanced active gate to `M5.6` Prompt A. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md` | Updated | M5 preview approval ledger. | Added explicit M5.5a approval record and Prompt-B completion notes. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/m5.5a-preview-index.md` | Updated | M5.5a Prompt-A index and state checklist. | Updated approval state to `PASS` after explicit `APPROVED UI PREVIEW` and Prompt-B completion. |

#### Commands Run
- `npm run build` -> PASS.
- `node scripts/validate-m5-5.js` -> PASS.
- `bash scripts/run_checks.sh` -> PASS, including:
  - `npm run build` -> PASS
  - `node scripts/validate-m1.js` -> PASS
  - `node scripts/validate-m2.js` -> PASS
  - `node scripts/validate-m3.js` -> PASS
  - `node scripts/validate-m4a.js` -> PASS
  - `node scripts/validate-m4b.js` -> PASS
  - `node scripts/validate-m5-1.js` -> PASS
  - `node scripts/validate-m5-2.js` -> PASS
  - `node scripts/validate-m5-2a.js` -> PASS
  - `node scripts/validate-m5-2b.js` -> PASS
  - `node scripts/validate-m5-3.js` -> PASS
  - `node scripts/validate-m5-4.js` -> PASS
  - `node scripts/validate-m5-5.js` -> PASS

#### Gate Checklist
- Prompt A preview for `M5.5a` approved (`APPROVED UI PREVIEW`): PASS.
- Prompt B implementation stayed within `M5.5a` scope boundary: PASS.
- `Reset defaults` resets per-map iso values only and leaves visibility unchanged: PASS.
- No regressions against completed slices (`M5.1`-`M5.5`) and M1-M4B baseline: PASS.

#### Residual Risks/Blockers
- `M5.6` reliability hardening remains pending (row-level retry UX polish, async race guards, and final `validate:m5` umbrella gate).

### M5.6 - Reliability Hardening + Final M5 Gate

#### Summary
- Prompt A preview was approved via explicit `APPROVED UI PREVIEW`.
- Prompt B runtime implementation is complete for row-level failure isolation, row-level retry, and async-intent guard behavior.
- Final M5 umbrella gate is now enabled and passing (`validate:m5`).

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `docs/screenshots/Design_previews/m5-fragmap-controls/m5.6-preview-index.md` | Created | M5.6 Prompt-A preview index. | Added M5.6 scope lock, state coverage checklist, artifact matrix, and traceability for reliability + final-gate views. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.6-reliability-final-gate-states.svg` | Created | M5.6 Prompt-A state artifact. | Added multi-panel default/loading/empty/error/success preview focused on row-level retry isolation, async guard outcomes, and final `validate:m5` evidence view. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/README.md` | Updated | M5 preview packet front page. | Marked M5.6 gate as pass and recorded Prompt-B completion. |
| `docs/screenshots/Design_previews/m5-fragmap-controls/approval-log.md` | Updated | M5 preview packet approval ledger. | Recorded explicit M5.6 approval token and Prompt-B completion note. |
| `src/components/ControlsPanel.vue` | Updated | Right-panel FragMap controls UI. | Added row-level retry action UI (`Retry` button), removed global row lock behavior, added empty-state helper text, and updated M5 scope note to reliability-complete semantics. |
| `src/pages/ViewerPage.vue` | Updated | FragMap runtime orchestration and reliability guards. | Replaced global loading lock with per-row async-intent orchestration, added row-level retry handler, isolated row loading state, and ensured stale intents are resolved toward latest desired visibility. |
| `src/viewer/nglStage.ts` | Updated | Runtime debug telemetry contract. | Added `staleCompletionIgnoredById` debug bucket reset/init for M5.6 guardrail evidence. |
| `scripts/validate-m5-2.js` | Updated | M5.2 regression validator. | Updated expectation so non-loading rows remain interactive during another row's load (aligned with M5.6 reliability behavior). |
| `scripts/validate-m5-6.js` | Created | M5.6 milestone validator. | Added checks for row-level failure isolation, row-level retry behavior, and latest-intent preservation under rapid conflicting toggles. |
| `scripts/validate-m5.js` | Created | Final M5 umbrella validator. | Runs `validate-m5-1` through `validate-m5-6` in sequence for final M5 gate evidence. |
| `package.json` | Updated | Validation command contract. | Added `validate:m5.6` / `prevalidate:m5.6` and final `validate:m5` / `prevalidate:m5`. |
| `scripts/run_checks.sh` | Updated | Sequential local regression runner. | Extended single-build suite through `node scripts/validate-m5-6.js`. |

#### Commands Run
- `rg -n "A\\. Default|B\\. Loading|C\\. Empty|D\\. Error|E\\. Success|M5\\.6|validate:m5" docs/screenshots/Design_previews/m5-fragmap-controls/desktop/m5.6-reliability-final-gate-states.svg docs/screenshots/Design_previews/m5-fragmap-controls/m5.6-preview-index.md` -> PASS.
- `npm run build` -> PASS.
- `node scripts/validate-m5-6.js` -> PASS.
- `bash scripts/run_checks.sh` -> PASS (sequential through `validate-m5-6`).
- `npm run validate:m5` -> first run `ENV-BLOCKED` in sandbox (`listen EPERM 127.0.0.1:4176`), unsandboxed rerun -> PASS.

#### Gate Checklist
- Prompt A artifacts for `M5.6` produced with default/loading/empty/error/success coverage: PASS.
- Prompt A preview for `M5.6` approved (`APPROVED UI PREVIEW`): PASS.
- Prompt B implementation stayed within `M5.6` scope boundary: PASS.
- Row-level failure isolation + retry + async race guards are validated: PASS.
- `validate:m5` and required sequential regression (`m1` through `m5`) are green: PASS.

#### Residual Risks/Blockers
- No blocker remains for M5. Next required milestone is `M6`.

---

## M6 - Overview Page Narrative + CTA + External Links

### Summary
- Prompt A artifacts were produced and approved via explicit `APPROVED UI PREVIEW`.
- Prompt B runtime implementation is complete for overview narrative + CTA + required external link behavior.
- Sequential regression is green through `validate:m6`.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `docs/screenshots/Design_previews/m6-overview-page/README.md` | Created | M6 preview packet front page. | Added gate status, scope boundaries, packet structure, and final gate-complete state. |
| `docs/screenshots/Design_previews/m6-overview-page/approval-log.md` | Created | M6 review decision ledger. | Recorded explicit `APPROVED UI PREVIEW` and Prompt-B completion notes. |
| `docs/screenshots/Design_previews/m6-overview-page/m6-preview-index.md` | Created | M6 Prompt-A index and checklist. | Added scope lock, state coverage checklist, artifact matrix, traceability, and final approval state. |
| `docs/screenshots/Design_previews/m6-overview-page/desktop/m6-overview-states.svg` | Created | Desktop Prompt-A state artifact. | Added multi-panel desktop state sheet with `A. Default`, `B. Loading`, `C. Empty`, `D. Error`, `E. Success`. |
| `docs/screenshots/Design_previews/m6-overview-page/mobile/m6-overview-states-mobile.svg` | Created | Mobile Prompt-A state artifact. | Added multi-panel mobile state sheet with `A. Default`, `B. Loading`, `C. Empty`, `D. Error`, `E. Success`. |
| `src/pages/HomePage.vue` | Updated | Home/overview route content component. | Implemented final M6 narrative (2 paragraphs, required concepts), primary `Go to Viewer` CTA, and required RCSB 3FLY external link with new-tab behavior. |
| `scripts/validate-m6.js` | Created | M6 milestone validator. | Added checks for narrative concept coverage, CTA client-side navigation, external-link contract, and text-first overview constraints. |
| `package.json` | Updated | Validation command contract. | Added `validate:m6` and `prevalidate:m6` scripts. |
| `scripts/run_checks.sh` | Updated | Sequential local regression runner. | Extended single-build suite through `node scripts/validate-m6.js`. |

### Commands Run
- `rg -n "A\\. Default|B\\. Loading|C\\. Empty|D\\. Error|E\\. Success" docs/screenshots/Design_previews/m6-overview-page/desktop/m6-overview-states.svg docs/screenshots/Design_previews/m6-overview-page/mobile/m6-overview-states-mobile.svg` -> PASS.
- `rg -n "BLOCKED-DESIGN|APPROVED UI PREVIEW|default|loading|empty|error|success" docs/screenshots/Design_previews/m6-overview-page/README.md docs/screenshots/Design_previews/m6-overview-page/m6-preview-index.md docs/screenshots/Design_previews/m6-overview-page/approval-log.md` -> PASS.
- `bash scripts/run_checks.sh` -> PASS (sequential through `validate-m6`; includes one expected `validate-m1` retry).
- `npm run validate:m6` -> first sandboxed run `ENV-BLOCKED` (`listen EPERM 127.0.0.1:4184`), unsandboxed rerun -> PASS.

### Gate Checklist
- Prompt-A artifacts produced for M6 in the correct packet path: PASS.
- Default/loading/empty/error/success state coverage exists in Prompt-A artifacts: PASS.
- Desktop and mobile mockups are both present: PASS.
- Prompt-A preview for M6 approved (`APPROVED UI PREVIEW`): PASS.
- Prompt-B implementation stayed within M6 scope boundary: PASS.
- M6 acceptance checks for narrative/CTA/link/text-first behavior validated: PASS.
- Sequential regression (`m1`..`m6`) is green: PASS.

### Residual Risks/Blockers
- No blocker remains for M6. Next required milestone is `M7`.

---

## M7 - Performance Instrumentation + AC Validation Evidence

### Summary
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M7 and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Design Preview Gate approved (for UI scope): Pending.
- Pending.

### Residual Risks/Blockers
- Pending.

---

## M8 - Hardening + Final Regression + README/Deploy Readiness

### Summary
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M8 and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Design Preview Gate approved (for UI scope): Pending.
- Pending.

### Residual Risks/Blockers
- Pending.
