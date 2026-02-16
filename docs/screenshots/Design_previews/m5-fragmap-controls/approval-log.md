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
- Date: 2026-02-16
- Reviewer: Project reviewer (in-thread)
- Thread/message reference: In-thread approval message on 2026-02-16 (`APPROVED UI PREVIEW`)
- Decision: `APPROVED UI PREVIEW`

## Review Record (M5.2c)
- Date: 2026-02-16
- Reviewer: Project reviewer (in-thread)
- Thread/message reference: In-thread approval message on 2026-02-16 (`APPROVED UI PREVIEW`)
- Decision: `APPROVED UI PREVIEW`

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
- Prompt-A artifact set now includes one multi-panel state sheet (`default/loading/empty/error/success`) and an updated slice index for traceability.
- Open UI questions: none currently.
- Reviewer provided explicit `APPROVED UI PREVIEW`; Prompt B is now unblocked for `M5.2b`.

## Comments (M5.2c)
- `M5.2c` was inserted between `M5.2b` and `M5.3` as a docs-gated visual parity tuning slice.
- Scope is rendering-parameter calibration only (wireframe appearance parity against approved/reference snapshots), with no control-behavior changes.
- Existing contracts from `M5.1`-`M5.2b` remain locked.
- Prompt-A artifact set now includes one multi-panel state sheet (`default/loading/empty/error/success`) and updated slice index metadata.
- Open UI questions are narrowed to parity-tuning target breadth and far-field edge emphasis.
- Reviewer provided explicit `APPROVED UI PREVIEW`; Prompt B is now unblocked for `M5.2c`.

## Comments (M5.3)
- `M5.3` is the active required next slice and is currently `BLOCKED-DESIGN` pending explicit `APPROVED UI PREVIEW`.
- `M5.2c` remains optional exploratory/deferred and does not block progression to `M5.3`.

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
- 2026-02-16: Added `M5.2b` Prompt-A artifact `desktop/m5.2b-protein-visibility-states.svg` and updated `m5.2b-preview-index.md` with checklist coverage, artifact matrix, traceability, and open UI-question status.
- 2026-02-16: Revised `M5.2b` Prompt-A layout per reviewer feedback so protein visibility uses a tab-row `Show Protein` checkbox to the right of `FragMap`/`Ligand` in all states (replacing in-panel protein row placement).
- 2026-02-16: Applied minor alignment refinement in `M5.2b` Prompt-A so `Show Protein` text+checkbox are centered as a single cluster within the tab-row pill in all states.
- 2026-02-16: Applied style consistency refinement in `M5.2b` Prompt-A so `Show Protein` uses the same tab-label font as `FragMap`/`Ligand` and the same checkbox style family as existing row checkboxes (including loading-state disabled variant).
- 2026-02-16: Received explicit in-thread approval token `APPROVED UI PREVIEW` for `M5.2b` Prompt A.
- 2026-02-16: Added docs-only `M5.2c` parity-tuning slice between `M5.2b` and `M5.3`; updated packet front page and added `m5.2c-preview-index.md` as the new active Prompt-A planning page.
- 2026-02-16: Executed `M5.2c` Prompt A (design-preview only): added `desktop/m5.2c-wireframe-parity-states.svg`, updated `m5.2c-preview-index.md`, and refreshed packet front-page scope/reviewer action in `README.md`.
- 2026-02-16: Received explicit in-thread approval token `APPROVED UI PREVIEW` for `M5.2c` Prompt A.
