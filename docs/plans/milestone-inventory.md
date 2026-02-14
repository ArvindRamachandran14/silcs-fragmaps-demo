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

### Residual Risks/Blockers
- No M1 gate blockers.
- Non-blocking:
  - Dependency audit warnings (13 vulnerabilities reported during install).
  - Bundle-size warnings during production build.

---

## M2 - Data Manifest + Assets + Startup Validation

### Summary
- Pending.

### Files Created/Updated
| File | Status | What it does | Milestone-specific delta |
|---|---|---|---|
| `TBD` | `Created/Updated` | `Describe file purpose.` | `Describe exactly what changed in M2 and why.` |

### Commands Run
- Pending.

### Gate Checklist
- Pending.

### Residual Risks/Blockers
- Pending.

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
