# M6 Viewer Interaction Hints Preview Index

## Scope Lock
- Add viewer interaction hint chips below the stage only.
- No behavior change to map loading, camera state, ligand controls, or panel actions.

## Coverage Checklist
- [x] `Default` state with active hints.
- [x] `Loading` state with muted/disabled hint styling.
- [x] `Empty` state where hints still show.
- [x] `Error` state where fallback remains readable and hints stay present.
- [x] `Success` state with final expected hint strip.
- [x] Desktop mockup included.
- [x] Mobile mockup included.

## Artifact Matrix
| State | Desktop artifact | Mobile artifact | Notes |
|---|---|---|---|
| Default | `desktop/m6-viewer-interaction-hints-states.svg` (Panel A) | `mobile/m6-viewer-interaction-hints-states-mobile.svg` (Panel A) | Baseline placement |
| Loading | `desktop/m6-viewer-interaction-hints-states.svg` (Panel B) | `mobile/m6-viewer-interaction-hints-states-mobile.svg` (Panel B) | Muted chips while loading |
| Empty | `desktop/m6-viewer-interaction-hints-states.svg` (Panel C) | `mobile/m6-viewer-interaction-hints-states-mobile.svg` (Panel C) | Guidance still visible |
| Error | `desktop/m6-viewer-interaction-hints-states.svg` (Panel D) | `mobile/m6-viewer-interaction-hints-states-mobile.svg` (Panel D) | Non-blocking fallback state |
| Success | `desktop/m6-viewer-interaction-hints-states.svg` (Panel E) | `mobile/m6-viewer-interaction-hints-states-mobile.svg` (Panel E) | Final expected look |

## Open UI Questions
1. None currently.

## Approval State
- Current: `PASS` (`APPROVED UI PREVIEW` received and runtime implementation completed).
