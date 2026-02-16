# Approval Log - M5 FragMap Controls Preview

## Review Record (M5.1)
- Date: 2026-02-16
- Reviewer: Project reviewer (in-thread)
- Thread/message reference: In-thread approval message on 2026-02-16
- Decision: `APPROVED UI PREVIEW`

## Review Record (M5.2)
- Date: 2026-02-16
- Reviewer: Project reviewer (in-thread)
- Thread/message reference: In-thread approval message on 2026-02-16
- Decision: `APPROVED UI PREVIEW`

## Review Record (M5.2a)
- Date: 2026-02-16
- Reviewer: Project reviewer (in-thread)
- Thread/message reference: In-thread approval message on 2026-02-16 (`APPROVED UI PREVIEW`)
- Decision: `APPROVED UI PREVIEW`

## Review Record (M5.2b)
- Date: Pending
- Reviewer: Pending
- Thread/message reference: Pending
- Decision: `BLOCKED-DESIGN`

## Review Record (M5.3)
- Date: Pending
- Reviewer: Pending
- Thread/message reference: Pending
- Decision: `BLOCKED-DESIGN`

## Comments (M5.1)
- Reviewer approved the M5.1 Prompt-A preview packet and confirmed progression to Prompt B.

## Comments (M5.2)
- Prompt-A preview artifacts for `M5.2` were approved and unblocked for Prompt B.
- Reviewer preference lock (in-thread): mixed decision set for M5.2 UI behavior:
  - temporary Primary-row lock during first-load,
  - inline `Loaded from cache` success text for explicit/debuggable confirmation,
  - inline retry deferred to `M5.6`.

## Comments (M5.2a)
- Rendering contract update requested in-thread: use triangulated wireframe FragMap rendering for all rows, including `Exclusion Map`.
- `M5.2a` is inserted as an isolated rendering-style slice between `M5.2` and `M5.3` to avoid coupling style changes with new behavior changes.
- Exclusion-specific behavior remains unchanged for controls: visibility-toggleable and iso-disabled.
- Prompt-A artifact now includes one multi-panel state sheet covering `default/loading/empty/error/success` for wireframe conversion while preserving M5.2 behavior semantics.
- Open UI questions captured for review:
  - default wireframe line weight calibration across rows,
  - whether occluded/back edges should remain depth-clipped or be made more visible for debugging.
- Reviewer approved Prompt-A packet (`APPROVED UI PREVIEW`), unblocking `M5.2a` Prompt B implementation.

## Comments (M5.2b)
- `M5.2b` is inserted as an isolated behavior slice between `M5.2a` and `M5.3` for protein-cartoon visibility toggle only.
- Slice intent: improve FragMap/ligand overlap inspection by allowing temporary protein hide/show without changing map or ligand state contracts.

## Comments (M5.3)
- `M5.3` remains pending and starts only after `M5.2b` design/implementation gates close.

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
- 2026-02-16: Received explicit in-thread approval token `APPROVED UI PREVIEW` for M5.2 Prompt A.
- 2026-02-16: Started rendering-contract docs refresh and locked direction to triangulated wireframe style for all maps, including `Exclusion Map`.
- 2026-02-16: Inserted `M5.2a` mini-slice between `M5.2` and `M5.3` to isolate wireframe rendering pass; active gate moved to `M5.2a` (`BLOCKED-DESIGN` pending Prompt-A preview approval).
- 2026-02-16: Added `M5.2a` Prompt-A artifact `desktop/m5.2a-wireframe-rendering-states.svg` and updated `m5.2a-preview-index.md` with checklist coverage, artifact matrix, traceability, and open UI questions.
- 2026-02-16: Received explicit in-thread approval token `APPROVED UI PREVIEW` for `M5.2a` Prompt A.
- 2026-02-16: `M5.2a` Prompt B runtime implementation completed and validated; active design gate advanced to `M5.3`.
- 2026-02-16: Inserted `M5.2b` mini-slice between `M5.2a` and `M5.3` for protein visibility toggle; active gate set to `M5.2b` (`BLOCKED-DESIGN` pending Prompt-A preview artifacts/approval).
