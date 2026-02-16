# M6 Viewer Interaction Hints Design Preview Packet

This packet tracks a post-M6 viewer UI refinement: add interaction hint chips below the 3D stage.

## Gate Status
- Scope: viewer interaction-hint chips in the viewer window
- Gate state: `PASS` (`APPROVED UI PREVIEW` received and implementation completed)
- Required token to unblock implementation: satisfied (`APPROVED UI PREVIEW`)

## Scope for This Packet
In scope:
- Three interaction hints shown beneath the viewer stage:
  - `Scroll Up/Down` -> `Zoom In/Out`
  - `Left + Move` -> `Rotation`
  - `Right + Move` -> `Move`
- Desktop and mobile preview coverage.
- State coverage: `default`, `loading`, `empty`, `error`, `success`.

Out of scope:
- FragMap control behavior changes.
- Ligand workflow changes.
- Camera/reset behavior changes.

## Packet Structure
- `m6-viewer-interaction-hints-index.md`
- `desktop/m6-viewer-interaction-hints-states.svg`
- `mobile/m6-viewer-interaction-hints-states-mobile.svg`
- `approval-log.md`
