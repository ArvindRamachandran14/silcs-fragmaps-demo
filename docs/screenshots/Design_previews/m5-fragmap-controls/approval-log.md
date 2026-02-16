# Approval Log - M5 FragMap Controls Preview

## Review Record (M5.1)
- Date: 2026-02-16
- Reviewer: Project reviewer (in-thread)
- Thread/message reference: In-thread approval message on 2026-02-16
- Decision: `APPROVED UI PREVIEW`

## Review Record (M5.2)
- Date: Pending
- Reviewer: Pending
- Thread/message reference: Pending
- Decision: `BLOCKED-DESIGN` (awaiting explicit `APPROVED UI PREVIEW`)

## Comments (M5.1)
- Reviewer approved the M5.1 Prompt-A preview packet and confirmed progression to Prompt B.

## Comments (M5.2)
- Prompt-A preview artifacts for `M5.2` are prepared and awaiting review.
- Reviewer preference lock (in-thread): mixed decision set for M5.2 UI behavior:
  - temporary Primary-row lock during first-load,
  - inline `Loaded from cache` success text for explicit/debuggable confirmation,
  - inline retry deferred to `M5.6`.

## Revision Notes
- 2026-02-16: Created initial M5 packet front page and M5.1 Prompt-A preview page with one multi-panel desktop SVG covering default/loading/empty/error/success.
- 2026-02-16: Added supplemental context-placement artifact (`desktop/m5.1-viewer-context-placement.svg`) to show where the M5.1 panel sits in the full viewer layout; existing state artifact retained unchanged.
- 2026-02-16: Updated M5.1 state and context artifacts to use a tabbed right-panel framework aligned to `docs/screenshots/GUI/GUI_Layout.png` (`FragMap` active; `Protein`, `Ligand`, `Components` as inactive placeholders in M5.1 scope). (Superseded by later same-day simplification.)
- 2026-02-16: Simplified the context-placement artifact tab strip to `FragMap` + `Ligand` only per reviewer feedback; state artifact remains unchanged for this revision. (Superseded by later same-day simplification.)
- 2026-02-16: Finalized alignment pass so the M5.1 state-sheet artifact also uses the simplified `FragMap` + `Ligand` two-tab framework, matching the context-placement artifact and packet docs.
- 2026-02-16: Received explicit in-thread approval token `APPROVED UI PREVIEW` for M5.1 Prompt A.
- 2026-02-16: Added `M5.2` Prompt-A artifacts:
  - `desktop/m5.2-primary3-visibility-states.svg` (multi-panel default/loading/empty/error/success page),
  - `m5.2-preview-index.md`,
  - packet front-page update in `README.md` to set active slice to `M5.2` and gate state to `BLOCKED-DESIGN`.
- 2026-02-16: Applied reviewer-preferred M5.2 decision lock to Prompt-A artifacts:
  - loading panel now shows temporary lock for non-loading Primary rows,
  - success panel now uses inline `Loaded from cache` confirmation for explicit/debuggable review,
  - retry remains deferred to `M5.6` reliability scope.
