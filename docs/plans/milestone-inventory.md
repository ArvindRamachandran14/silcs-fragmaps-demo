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
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M4A and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Design Preview Gate approved (for UI scope): Pending.
- Pending.

### Residual Risks/Blockers
- Pending.

---

## M4B - Featured Ligands Expansion (no full-list search)

### Summary
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M4B and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Design Preview Gate approved (for UI scope): Pending.
- Pending.

### Residual Risks/Blockers
- Pending.

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

## M5 - FragMap Controls

### Summary
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M5 and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Design Preview Gate approved (for UI scope): Pending.
- Pending.

### Residual Risks/Blockers
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
