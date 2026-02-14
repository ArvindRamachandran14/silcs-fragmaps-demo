# Implementation Prompts by Milestone

Use this file to assign milestone work to an agent, request proof of completion, and manually verify outcomes.

## M1 - Project Scaffold + Routing Foundation

### Prompt to assign M1
```text
Implement only M1 from docs/plans/execution-plan.md.

Scope:
- M1 only: project scaffold + routing foundation.
- Use stack from docs/plans/technical-plan.md (Vue 2 + TypeScript + Vue Router + Vuex + Vuetify).
- Create routes `/` and `/viewer`.
- Ensure client-side navigation between `/` and `/viewer` (no full page reload).

Do NOT do:
- M2+ work (no data manifest, no viewer features, no ligand/fragmap logic).

Required deliverables:
1) Files created/updated.
2) Commands run.
3) Validation evidence for M1 gate:
   - production build succeeds
   - `/` renders
   - `/viewer` renders
   - navigation `/` <-> `/viewer` is SPA (no full page reload)
   - unknown route does not crash app
4) Residual risks/blockers.

Return format:
- M1 status: PASS/FAIL
- Gate checklist with pass/fail per item
- File list
- Command outputs summary
```

### Prompt to verify M1
```text
Run the M1 gate verification now and return a PASS/FAIL table with evidence.

For each gate item include:
- check name
- exact command or manual step used
- observed result
- pass/fail

Also include:
- `git status --short`
- `git diff --name-only`
- any failures and exact fix needed
```

### Manual verification for M1
```bash
# from repo root
git diff --name-only
git status --short
```
Confirm scaffold files exist (package, src, router, pages).

Then run:
```bash
npm install
npm run build
npm run serve   # or npm run dev (use whichever scripts were added)
```

In browser:
1. Open `/` -> page loads.
2. Navigate to `/viewer` -> page loads.
3. Navigate back to `/` via app nav.
4. Open DevTools Network, filter `document`: should stay at initial document load during in-app nav (no new full document request).
5. Go to an unknown route like `/not-found` and confirm app does not hard-crash.

If all 5 pass, M1 is done and you can start M2.

## M2 - Data Manifest + Assets + Startup Validation

### Prompt to assign M2
```text
TODO: Add M2 implementation prompt.
```

### Prompt to verify M2
```text
TODO: Add M2 verification prompt.
```

### Manual verification for M2
- TODO

## M3 - Viewer Core Lifecycle/Layout/Defaults/Error Fallback

### Prompt to assign M3
```text
TODO: Add M3 implementation prompt.
```

### Prompt to verify M3
```text
TODO: Add M3 verification prompt.
```

### Manual verification for M3
- TODO

## M4 - Ligand Workflow

### Prompt to assign M4
```text
TODO: Add M4 implementation prompt.
```

### Prompt to verify M4
```text
TODO: Add M4 verification prompt.
```

### Manual verification for M4
- TODO

## M5 - FragMap Controls

### Prompt to assign M5
```text
TODO: Add M5 implementation prompt.
```

### Prompt to verify M5
```text
TODO: Add M5 verification prompt.
```

### Manual verification for M5
- TODO

## M6 - Overview Page Narrative + CTA + External Links

### Prompt to assign M6
```text
TODO: Add M6 implementation prompt.
```

### Prompt to verify M6
```text
TODO: Add M6 verification prompt.
```

### Manual verification for M6
- TODO

## M7 - Performance Instrumentation + AC Validation Evidence

### Prompt to assign M7
```text
TODO: Add M7 implementation prompt.
```

### Prompt to verify M7
```text
TODO: Add M7 verification prompt.
```

### Manual verification for M7
- TODO

## M8 - Hardening + Final Regression + README/Deploy Readiness

### Prompt to assign M8
```text
Add M8 implementation prompt when entering final hardening.
```

### Prompt to verify M8
```text
Add M8 verification prompt when final regression scope is fixed.
```

### Manual verification for M8
- Define final manual checklist at M8 start.
