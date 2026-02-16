# M5 FragMap Controls Design Preview Packet

This packet tracks the M5 sliced design gates under `docs/screenshots/Design_previews/m5-fragmap-controls/`.

## Gate Status
- Active slice: `M5.2b Protein Visibility Toggle`
- Gate state: `BLOCKED-DESIGN`
- Required token to unblock Prompt B: `APPROVED UI PREVIEW` (pending for `M5.2b`)

## Scope for This Packet Revision
In scope:
- Historical record: completed `M5.2a` Prompt-A wireframe preview artifacts and approval evidence.
- Next required design-gate scope: `M5.2b` Prompt-A previews only.

Out of scope in this revision:
- `M5.4+` behavior:
  - per-map iso controls runtime behavior (`M5.4`),
  - bulk action runtime behavior (`M5.5`),
  - reliability/error-isolation runtime contracts (`M5.6`).

## Packet Structure
- `m5.1-preview-index.md`: approved `M5.1` preview index (historical reference).
- `desktop/m5.1-fragmap-panel-shell-states.svg`: approved `M5.1` shell states page.
- `desktop/m5.1-viewer-context-placement.svg`: approved `M5.1` context placement page.
- `m5.2-preview-index.md`: `M5.2` state checklist, artifact matrix, open questions, and traceability.
- `desktop/m5.2-primary3-visibility-states.svg`: single multi-panel `M5.2` page covering default/loading/empty/error/success for Primary-3 visibility engine behavior.
- `m5.2a-preview-index.md`: `M5.2a` state checklist, artifact matrix, open questions, and traceability (wireframe rendering contract).
- `desktop/m5.2a-wireframe-rendering-states.svg`: single multi-panel `M5.2a` page covering default/loading/empty/error/success for wireframe rendering conversion (including fixed gray `Exclusion Map` style).
- `m5.2b-preview-index.md`: `M5.2b` planned state checklist for protein visibility toggle previews.
- `m5.3-preview-index.md`: `M5.3` planned state checklist for the slice after `M5.2b` closure.
- `approval-log.md`: gate decisions and review notes.

## Reviewer Action
- Produce/review `M5.2b` Prompt-A artifacts and provide explicit `APPROVED UI PREVIEW` before `M5.2b` Prompt B implementation begins.
