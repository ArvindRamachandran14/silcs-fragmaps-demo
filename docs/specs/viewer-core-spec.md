# Viewer Core Specification

## 1. Purpose
Define the implementation contract for the `Interactive Viewer` page core shell and lifecycle, consistent with:
- `AGENTS.md` instruction precedence.
- Technical decisions in `docs/plans/technical-plan.md`.
- Product requirements in `docs/SilcsBio_Candidate_Exercise_Instructions.md`.

This spec establishes the viewer page foundation only: route, layout, rendering stage lifecycle, startup state, and shared UX/system behavior.

## 2. Scope
In scope:
- Viewer route contract for `/viewer`.
- Viewer shell layout contract based on `docs/screenshots/GUI/GUI_Layout.png`.
- NGL stage lifecycle: initialize, ready, resize, cleanup.
- Initial default state contract: crystal ligand selected (`3fly_cryst_lig`, display label `Crystal Ligand`), baseline visible and refined hidden by default (with both-allowed support defined in ligand workflow spec), no FragMaps visible.
- Initial display baseline: fixed default camera orientation and protein cartoon representation.
- Initial loading UX and core error UX.
- Viewer caption/sidebar context describing what is currently shown in the viewport.
- Accessibility/usability requirements for viewer shell.

Out of scope:
- Detailed ligand workflow behavior (selection, pose availability rules, switching logic).
- Detailed FragMap behavior (per-map toggles, map labels/colors, iso semantics).
- Performance measurement protocol and AC timing evidence process.
- Long-form scientific narrative text (covered by overview spec).

## 3. Route Contract
- Route path: `/viewer`.
- Route entry must render viewer shell with no full page reload from internal navigation.
- Route must be reachable from overview CTA (`Go to Viewer`).
- Route leave/unmount must dispose stage resources and listeners cleanly.

## 4. Layout Contract
Layout direction must follow the structure emphasis in `docs/screenshots/GUI/GUI_Layout.png`:
- dominant central viewport
- side controls region
- lightweight top navigation/header
- shared right-controls framework (`M5.1+`) with two tabs: `FragMap` and `Ligand`

Desktop contract:
- Top bar/header across full width.
- Main content as two columns with primary `NglViewport` region at approximately 70-80% width.
- Main content as two columns with secondary `ControlsPanel` region at approximately 20-30% width.
- Viewport remains the visual priority.
- At common desktop widths (>=1280 px), layout must keep the controls panel fully visible with no right-edge clipping.
- Viewer shell must not introduce page-level horizontal scrolling in standard desktop fullscreen usage.
- Right controls tab switching (`FragMap` <-> `Ligand`) occurs in-place with no route navigation or full page reload.

Mobile/small-screen contract:
- `NglViewport` remains primary visible region.
- Controls collapse into a drawer, sheet, or equivalent compact pattern.
- Navigation and primary actions remain reachable without forcing horizontal scroll.

Core layout components (logical):
- `ViewerPage` (route container)
- `ViewerTopBar` (title + navigation affordance)
- `NglViewport` (stage host container)
- `ControlsPanel` (container only; control details specified in later specs)

## 5. Stage Lifecycle Contract
The viewer stage lifecycle must support predictable transitions:

Initialization:
- On `/viewer` mount, create and bind NGL stage to `NglViewport`.
- Register required stage and window resize listeners.

Ready transition:
- Load required startup assets for initial state: protein + default crystal ligand representation (`3fly_cryst_lig` / `Crystal Ligand`).
- Apply fixed default camera orientation after initial objects are available.
- Mark viewer as `ready` when first interactive frame is available.

Resize behavior:
- On viewport/container size change, recalculate stage dimensions.
- Maintain current camera orientation and zoom state across layout-driven resize events.

Cleanup:
- On route unmount, dispose stage components/resources.
- Remove event listeners/timers to prevent leaks and duplicate handlers on remount.

## 6. Default State Contract
On first successful viewer load:
- Selected ligand ID: `3fly_cryst_lig` (display label `Crystal Ligand`).
- Visible ligand poses: baseline only by default (`baseline` on, `refined` off).
- Visible FragMaps: none.
- Protein representation baseline: cartoon style.
- Camera baseline: fixed default orientation.

Canonical camera baseline contract:
- Define one canonical camera snapshot constant in implementation (single source of truth) with shape:
  - `{ position: [x, y, z], target: [x, y, z], up: [x, y, z], zoom: number }`
- Startup initialization and `Reset view` must both restore this same snapshot.
- Conformance is measured using AC-2 tolerances defined in `docs/specs/performance-and-validation-spec.md`.

Constraint:
- This spec defines only startup/default state. Detailed user interaction behavior for ligands/maps/iso is defined in later specs.

## 7. Loading and Error UX Contract
Loading UX:
- Display an explicit loading state while initial viewer assets load (protein + default crystal ligand).
- Loading state ends when viewer reaches `ready`.
- After ready state, normal interaction should proceed without global blocking loaders for standard actions.

Error UX (core-level):
- Use non-blocking toast notifications for actionable errors.
- Disable only the affected control or action when error scope is local.
- Do not render a persistent inline error panel in v1.
- Catastrophic startup failure (stage cannot initialize) must show a clear fallback message and a retry/navigation option.

## 8. Viewer Context Caption Contract
- Viewer page must include a compact caption/sidebar context block describing what is currently being shown (protein, selected ligand, visible map context).
- This block is concise and task-oriented (not long-form narrative).
- Caption/sidebar content updates in place as ligand/map visibility changes.
- Caption/sidebar updates must not trigger route navigation or full page reload.
- Caption/sidebar failure must be non-blocking to core viewer interaction.

## 9. Accessibility and Usability Constraints
- Viewer page must provide a clear, unique top-level heading or page title.
- Interactive controls in the shell must be keyboard-focusable and visible on focus.
- Layout must not require horizontal scrolling at common mobile widths.
- Viewer shell must preserve usability when controls are collapsed (mobile) or expanded (desktop).
- Navigation back to Home must remain discoverable from viewer shell.

## 10. Spec-Level Acceptance Checks
Viewer core is accepted when all checks pass:
1. Navigating to `/viewer` renders shell with top bar, viewport, and controls container.
2. Initial load shows explicit loading state, then transitions to interactive viewer.
3. Initial default state is applied: `3fly_cryst_lig` (`Crystal Ligand`) selected, baseline visible/refined hidden, no FragMaps visible.
4. Initial visual baseline is applied: fixed default camera and protein cartoon representation.
5. Desktop layout preserves viewport-dominant split with side controls panel.
6. Mobile layout keeps viewport primary and provides collapsed controls access pattern.
7. Route unmount/remount does not produce duplicate listeners or stale stage artifacts.
8. Core errors are surfaced via non-blocking toast behavior; no persistent inline error panel.
9. Viewer includes a compact caption/sidebar context block that updates in place with viewer state changes.
10. Desktop fullscreen layout keeps controls panel fully visible and avoids page-level horizontal overflow.
11. Right controls framework exposes `FragMap` and `Ligand` tabs (`M5.1+`) and tab switching is in-place (no route change/reload).

## 11. Traceability
- PRD mapping: `2.B Interactive Visualization Page (Required)` for viewer availability and control environment.
- PRD mapping: `2.B Interactive Visualization Page (Required)` caption/sidebar describing what the user is seeing.
- PRD mapping: `2.C Navigation / Structure` for route-level organization.
- Technical plan mapping: `System Architecture` for `ViewerPage.vue`, `ControlsPanel.vue`, `NglViewport.vue`.
- Technical plan mapping: runtime flow for stage init, startup load, and route-level behavior.
- Technical plan mapping: `Requirement-to-Implementation Mapping` for route and viewer-shell intent.

## 12. Open Dependencies
The following are intentionally deferred to subsequent specs:
- `ligand-workflow-spec.md`: ligand selection and baseline/refined pose-visibility behavior details, including both-visible mode.
- `fragmap-controls-spec.md`: FragMap toggle semantics, map labels/colors, iso control details.
- `performance-and-validation-spec.md`: AC-1..AC-6 test protocol and evidence format.
