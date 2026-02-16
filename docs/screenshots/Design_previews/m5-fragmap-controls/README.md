# M5 FragMap Controls Design Preview Packet

This packet tracks the M5 sliced design gates under `docs/screenshots/Design_previews/m5-fragmap-controls/`.

## Gate Status
- Active slice: `M5.1 FragMap Panel Shell`
- Gate state: `BLOCKED-DESIGN`
- Required token to unblock Prompt B: `APPROVED UI PREVIEW`

## Scope for This Packet Revision
In scope:
- Prompt A previews for `M5.1` only.
- Panel shell structure only: simplified tabbed right-panel framework (`FragMap`, `Ligand`) plus action row, `Primary 3`, expandable `Advanced`, canonical labels/colors, and default all-hidden state representation.

Out of scope in this revision:
- Runtime map loading/toggle behavior (`M5.2+`).
- Per-map iso controls runtime behavior (`M5.4`).
- Bulk action runtime behavior (`M5.5`).
- Reliability/error-isolation runtime contracts (`M5.6`).

## Packet Structure
- `m5.1-preview-index.md`: state checklist, artifact matrix, open questions, and traceability.
- `desktop/m5.1-fragmap-panel-shell-states.svg`: single multi-panel page covering default/loading/empty/error/success.
- `desktop/m5.1-viewer-context-placement.svg`: supplemental placement view showing where the M5.1 panel sits inside the full viewer layout.
- `approval-log.md`: gate decisions and review notes.

## Reviewer Action
- Review `m5.1-preview-index.md` and `desktop/m5.1-fragmap-panel-shell-states.svg`.
- Reply with `APPROVED UI PREVIEW` to allow `M5.1` Prompt B implementation.
