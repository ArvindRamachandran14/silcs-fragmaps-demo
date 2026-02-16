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
  - Locked M5 exception: track previews under `docs/screenshots/Design_previews/m5-fragmap-controls/` with one front page plus one preview page per slice (`M5.1`..`M5.6`).

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
- M5 is executed as six gated slices (`M5.1`..`M5.6`) with Prompt A + Prompt B per slice.
- Preview packet path is locked to `docs/screenshots/Design_previews/m5-fragmap-controls/`.
- Packet structure is locked to one front page plus one preview page per slice.

### Slice Tracker
| Slice | Scope | Design Gate | Implementation Gate | Status |
|---|---|---|---|---|
| `M5.1` | Panel shell only (Primary/Advanced sections, labels/colors, all-hidden defaults) plus right-panel two-tab framework (`FragMap` + `Ligand`) with `FragMap` active by default and `Ligand` preserving existing M4B controls | PASS | PASS | Completed |
| `M5.2` | Primary-3 visibility engine (toggle + lazy load + cache reuse + camera preserved) | PASS | PASS | Completed |
| `M5.3` | Advanced rows + Exclusion map fixed behavior | Pending | Pending | Not started |
| `M5.4` | Per-map iso controls only (numeric contract for adjustable rows) | Pending | Pending | Not started |
| `M5.5` | Bulk actions only (`Hide all`, `Reset defaults`, `Reset view`) | Pending | Pending | Not started |
| `M5.6` | Reliability hardening (row-level failure isolation + retry + async race guards) + final M5 gate | Pending | Pending | Not started |

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
- M5.2 intentionally excludes Advanced/Exclusion runtime behavior, iso controls, bulk actions, and reliability retry UX; these remain scoped to `M5.3`..`M5.6`.

### M5.3 - Advanced Rows + Exclusion Map

#### Summary
- Pending.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M5.3 and why.` |

#### Commands Run
- Pending.

#### Gate Checklist
- Prompt A preview for `M5.3` approved (`APPROVED UI PREVIEW`): Pending.
- Prompt B implementation stayed within `M5.3` scope boundary: Pending.
- Advanced rows and Exclusion behavior match spec (toggleable visibility, fixed style, iso disabled): Pending.
- No regressions against completed slices (`M5.1`-`M5.2`) and M1-M4B baseline: Pending.

#### Residual Risks/Blockers
- Pending.

### M5.4 - Per-Map Iso Controls

#### Summary
- Pending.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M5.4 and why.` |

#### Commands Run
- Pending.

#### Gate Checklist
- Prompt A preview for `M5.4` approved (`APPROVED UI PREVIEW`): Pending.
- Prompt B implementation stayed within `M5.4` scope boundary: Pending.
- Per-map iso numeric contract matches spec in-place behavior: Pending.
- No regressions against completed slices (`M5.1`-`M5.3`) and M1-M4B baseline: Pending.

#### Residual Risks/Blockers
- Pending.

### M5.5 - Bulk Actions

#### Summary
- Pending.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M5.5 and why.` |

#### Commands Run
- Pending.

#### Gate Checklist
- Prompt A preview for `M5.5` approved (`APPROVED UI PREVIEW`): Pending.
- Prompt B implementation stayed within `M5.5` scope boundary: Pending.
- Bulk actions (`Hide all`, `Reset defaults`, `Reset view`) match spec in-place behavior: Pending.
- No regressions against completed slices (`M5.1`-`M5.4`) and M1-M4B baseline: Pending.

#### Residual Risks/Blockers
- Pending.

### M5.6 - Reliability Hardening + Final M5 Gate

#### Summary
- Pending.

#### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M5.6 and why.` |

#### Commands Run
- Pending.

#### Gate Checklist
- Prompt A preview for `M5.6` approved (`APPROVED UI PREVIEW`): Pending.
- Prompt B implementation stayed within `M5.6` scope boundary: Pending.
- Row-level failure isolation + retry + async race guards are validated: Pending.
- `validate:m5` and required sequential regression (`m1` through `m5`) are green: Pending.

#### Residual Risks/Blockers
- Pending.

---

## M6 - Overview Page Narrative + CTA + External Links

### Summary
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M6 and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Design Preview Gate approved (for UI scope): Pending.
- Pending.

### Residual Risks/Blockers
- Pending.

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
