# Milestone Inventory

Use this file to track implementation and gate evidence for each milestone in `docs/plans/execution-plan.md`.

## How to Update
- Add one section per milestone (`M1`..`M8`).
- For each milestone, capture:
  - Brief summary
  - Files created/updated with file-level purpose and milestone-specific delta
  - Commands run
  - Gate checklist (pass/fail)
  - Residual risks/blockers
- File entry rule:
  - If file is new: describe what the file does.
  - If file already existed: describe what changed in this milestone and why it matters.

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
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M3 and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Pending.

### Residual Risks/Blockers
- Pending.

---

## M4 - Ligand Workflow

### Summary
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M4 and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Pending.

### Residual Risks/Blockers
- Pending.

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
- Pending.

### Residual Risks/Blockers
- Pending.
