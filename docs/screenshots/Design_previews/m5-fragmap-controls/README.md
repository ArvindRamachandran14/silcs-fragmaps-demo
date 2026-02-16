# M5 FragMap Controls Design Preview Packet

This packet tracks the M5 sliced design gates under `docs/screenshots/Design_previews/m5-fragmap-controls/`.

## Gate Status
- Active slice: `M5.6 Reliability Hardening + Final M5 Gate`
- Gate state: `PASS` (`APPROVED UI PREVIEW` received for `M5.6` Prompt A and Prompt B completed)
- Required token to unblock Prompt B: satisfied (`APPROVED UI PREVIEW` for `M5.6`)

## Scope for This Packet Revision
In scope:
- Historical record: completed `M5.2a` and `M5.2b` Prompt-A artifacts and approval evidence.
- Historical record: `M5.3` Prompt A preview was approved and Prompt B runtime behavior is implemented.
- Historical record: `M5.4` Prompt A preview was approved and Prompt B runtime behavior is implemented.
- Historical record: `M5.5` Prompt A preview was approved and Prompt B runtime behavior is implemented.
- Historical record: `M5.5a` Prompt A preview was approved and Prompt B runtime behavior is implemented.
- Current execution scope: `M5.6` Prompt-A artifacts are approved and Prompt-B reliability behavior is implemented.
- Deferred exploratory scope: `M5.2c` parity artifacts retained for optional later investigation; non-blocking for required M5 flow.

Out of scope in this revision:
- Post-M5 work (`M6` onward).

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
- `m5.3-preview-index.md`: `M5.3` state checklist and traceability (approved historical slice).
- `desktop/m5.3-advanced-exclusion-wireframe-states.svg`: single multi-panel `M5.3` page covering default/loading/empty/error/success for Advanced rows + Exclusion fixed behavior.
- `m5.4-preview-index.md`: `M5.4` state checklist, artifact matrix, and traceability for per-map iso controls.
- `desktop/m5.4-per-map-iso-controls-states.svg`: single multi-panel `M5.4` page covering default/loading/empty/error/success for row-level iso controls.
- `m5.5-preview-index.md`: `M5.5` state checklist, artifact matrix, open UI questions, and traceability for bulk actions.
- `desktop/m5.5-bulk-actions-states.svg`: single multi-panel `M5.5` page covering default/loading/empty/error/success for bulk actions only.
- `m5.5a-preview-index.md`: `M5.5a` state checklist, artifact matrix, open UI questions, and traceability for reset-default semantics refinement.
- `desktop/m5.5a-reset-defaults-iso-only-states.svg`: single multi-panel `M5.5a` page covering default/loading/empty/error/success for iso-only `Reset defaults` semantics with visibility preserved.
- `m5.6-preview-index.md`: `M5.6` state checklist, artifact matrix, open UI questions, and traceability for reliability hardening and final-gate evidence views.
- `desktop/m5.6-reliability-final-gate-states.svg`: single multi-panel `M5.6` page covering default/loading/empty/error/success for row-level retry isolation, async guards, and final M5 gate evidence view.
- `approval-log.md`: gate decisions and review notes.

## Reviewer Action
- `M5` preview packet is complete. Use this packet as historical design evidence while implementation progresses to `M6`.
