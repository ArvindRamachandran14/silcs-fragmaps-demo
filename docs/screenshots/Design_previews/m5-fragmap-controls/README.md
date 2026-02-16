# M5 FragMap Controls Design Preview Packet

This packet tracks the M5 sliced design gates under `docs/screenshots/Design_previews/m5-fragmap-controls/`.

## Gate Status
- Active slice: `M5.3 Advanced Rows + Exclusion Map`
- Gate state: `BLOCKED-DESIGN` (awaiting explicit `APPROVED UI PREVIEW` for `M5.3` Prompt A)
- Required token to unblock Prompt B: pending (`APPROVED UI PREVIEW` for `M5.3`)

## Scope for This Packet Revision
In scope:
- Historical record: completed `M5.2a` and `M5.2b` Prompt-A artifacts and approval evidence.
- Current execution scope: `M5.3` Prompt A preview artifacts (design-only gate for Advanced rows + Exclusion behavior).
- Deferred exploratory scope: `M5.2c` parity artifacts retained for optional later investigation; non-blocking for required M5 flow.

Out of scope in this revision:
- `M5.3+` behavior:
  - Advanced/Exclusion behavior runtime scope (`M5.3`),
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
- `m5.2b-preview-index.md`: `M5.2b` state checklist, artifact matrix, open UI questions, and traceability.
- `desktop/m5.2b-protein-visibility-states.svg`: single multi-panel `M5.2b` page covering default/loading/empty/error/success for protein visibility toggle behavior.
- `m5.2c-preview-index.md`: `M5.2c` state checklist, artifact matrix, open UI questions, and traceability.
- `desktop/m5.2c-wireframe-parity-states.svg`: single multi-panel `M5.2c` page covering default/loading/empty/error/success for wireframe parity tuning scope.
- `m5.3-preview-index.md`: `M5.3` planned state checklist for the current active required slice.
- `approval-log.md`: gate decisions and review notes.

## Reviewer Action
- Review `M5.3` Prompt A artifacts and provide explicit `APPROVED UI PREVIEW` (or revision feedback).
