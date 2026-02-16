# M5 FragMap Controls Design Preview Packet

This packet tracks the M5 sliced design gates under `docs/screenshots/Design_previews/m5-fragmap-controls/`.

## Gate Status
- Active slice: `M5.2a Wireframe Rendering Pass`
- Gate state: `BLOCKED-DESIGN`
- Required token to unblock Prompt B: `APPROVED UI PREVIEW` (pending for `M5.2a`)

## Scope for This Packet Revision
In scope:
- Prompt A previews for `M5.2a` only.
- Wireframe rendering pass preview:
  - triangulated wireframe style for Primary and Advanced FragMaps,
  - fixed gray triangulated wireframe style for `Exclusion Map`,
  - no control-behavior changes from completed `M5.2` contract.

Out of scope in this revision:
- `M5.3+` behavior:
  - advanced/exclusion runtime behavior (`M5.3`),
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
- `m5.3-preview-index.md`: `M5.3` planned state checklist for the next slice after `M5.2a` closure.
- `approval-log.md`: gate decisions and review notes.

## Reviewer Action
- Review and approve the `M5.2a` Prompt-A artifacts with explicit `APPROVED UI PREVIEW` before `M5.2a` Prompt B implementation begins.
