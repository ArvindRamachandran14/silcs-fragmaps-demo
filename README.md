# SILCS FragMaps Demo (3FLY)

Browser-based interactive visualization demo for **P38 MAP Kinase (PDB: 3FLY)** using SILCS FragMaps and ligand pose controls.

## Submission Links
- GitHub repository: `https://github.com/ArvindRamachandran14/silcs-fragmaps-demo`
- Live URL: `ADD_LIVE_URL_HERE`

## Project Overview
This prototype focuses on a lightweight, client-side workflow for inspecting ligand pose quality against SILCS FragMap interaction hotspots in the 3FLY binding site.

The app provides:
- A **Home / Overview** page with scientific context and usage guidance.
- An **Interactive Viewer** page with protein, ligand, and FragMap controls.

## Scientific Context (Concise)
- **p38 MAP kinase** is a stress-activated serine/threonine kinase involved in inflammatory signaling and cellular stress responses.
- The demo starts from crystal ligand baseline pose **`3fly_cryst_lig`** (displayed as **Crystal Ligand**) and includes featured ligands:
  - `p38_goldstein_05_2e`
  - `p38_goldstein_06_2f`
  - `p38_goldstein_07_2g`
- **SILCS FragMaps** are 3D free-energy maps indicating favorable interaction regions for chemical features (donor, acceptor, hydrophobic, charged, etc.).
- Users can compare ligand poses to FragMap hotspots to interpret binding interactions and pose quality.

## PRD Requirement Coverage
| PRD area | Status | Implementation |
|---|---|---|
| Overview / Introduction page (1-2 paragraph narrative) | Implemented | `src/pages/HomePage.vue` |
| Home + Viewer navigation | Implemented | `src/router/index.ts`, `src/App.vue` |
| 3FLY protein rendering | Implemented | `src/viewer/nglStage.ts`, `src/components/NglViewport.vue` |
| Multiple ligands + in-place switching | Implemented (featured subset) | `src/components/ControlsPanel.vue`, `src/pages/ViewerPage.vue` |
| Baseline/refined pose controls (no reload) | Implemented | `src/components/ControlsPanel.vue`, `src/pages/ViewerPage.vue`, `src/viewer/nglStage.ts` |
| FragMap show/hide controls | Implemented | `src/components/ControlsPanel.vue`, `src/pages/ViewerPage.vue` |
| Iso-value controls | Implemented (per-map, exclusion fixed) | `src/components/ControlsPanel.vue`, `src/pages/ViewerPage.vue` |
| Caption/sidebar context | Implemented | Right controls panel (`src/components/ControlsPanel.vue`) |
| Client-side only architecture | Implemented | Vue SPA; static assets staged under `public/assets` |

## Core Features Implemented
- Viewer lifecycle: loading/ready/fallback states.
- Ligand tab:
  - Baseline/refined toggles.
  - In-place pose visibility transitions.
  - Featured ligand switching with camera preservation.
- FragMap tab:
  - Primary + Advanced map groups.
  - Wireframe map rendering.
  - Per-map iso adjustment (`-`, value input, `+`) for editable rows.
  - Fixed Exclusion-map iso behavior.
  - Bulk actions (`Hide all`, `Reset defaults` with iso-only semantics).
  - Row-level reliability handling with retry paths.
- Home page:
  - Final scientific narrative.
  - CTA to viewer.
  - RCSB 3FLY external link.

## Technology Stack
- Vue 2 + TypeScript
- Vue Router + Vuex
- Vuetify
- NGL Viewer (`ngl`)
- Node/npm build + validator scripts

## Development Process
- This project was developed with AI-assisted coding support using OpenAI Codex.
- All architectural decisions, scope choices, and final validation were reviewed and approved by the author.

## Local Setup
### Prerequisites
- Node.js 18+
- npm 9+

### Install
```bash
npm install
```

### Run locally (dev)
```bash
npm run serve
```
Then open:
- `http://localhost:8080/` (Home)
- `http://localhost:8080/viewer` (Viewer)

### Production build
```bash
npm run build
```

## Validation Commands
Primary sequential check:
```bash
bash scripts/run_checks.sh
```

Targeted milestone checks:
```bash
npm run validate:m1
npm run validate:m2
npm run validate:m3
npm run validate:m4a
npm run validate:m4b
npm run validate:m5.1
npm run validate:m5.2
npm run validate:m5.2a
npm run validate:m5.2b
npm run validate:m5.3
npm run validate:m5.4
npm run validate:m5.5
npm run validate:m5.6
npm run validate:m5
npm run validate:m6
```

## Directory Highlights
- `src/pages/HomePage.vue`: overview narrative + CTA + external link.
- `src/pages/ViewerPage.vue`: viewer orchestration and control wiring.
- `src/components/ControlsPanel.vue`: ligand + FragMap controls.
- `src/viewer/nglStage.ts`: NGL stage lifecycle and representation control.
- `scripts/validate-*.js`: milestone validator scripts.
- `public/assets/`: staged runtime assets.
- `from_silcsbio/`: source exercise input files.

## Design Decisions and Tradeoffs
- **NGL chosen** for practical molecular visualization in a browser and manageable integration in Vue.
- **Milestone-based implementation** reduced regression risk by locking behavior slice-by-slice.
- **Featured ligand subset** is implemented for guided UX and stability.
- **FragMap lazy-load on first toggle**: avoids loading all `.dx` files at startup, improving initial responsiveness.
- **FragMap cache reuse after first load**: subsequent show/hide actions are faster and avoid repeated asset fetch/parse work.
- **In-place FragMap and ligand updates**: preserves camera orientation/zoom and keeps exploration flow uninterrupted.
- **Row-level failure isolation + retry**: one FragMap failure does not break the full panel; users can recover per-row.
- **Tradeoff accepted**: additional UI/runtime state complexity in exchange for smoother interaction and better perceived performance.
- **M4C deferred** (full searchable ligand list) as non-blocking stretch scope.
- **M7/M8 not completed** in this submission pass:
  - M7 (formal AC evidence instrumentation and reporting in `docs/validation.md`)
  - M8 (final hardening + deployment/readiness pass)

## Known Limitations
- Full AC evidence pack (`docs/validation.md`) is not finalized.
- Final Safari sign-off evidence is not included in this submission pass.
- Full-ligand searchable selector (M4C) is deferred.

## Optional Future Improvements
- Complete M7 instrumentation and publish full AC evidence report.
- Complete M8 final regression and release packaging.
- Implement deferred M4C full searchable ligand workflow.
