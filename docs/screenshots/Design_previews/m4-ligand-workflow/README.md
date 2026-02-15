# M4A Ligand Workflow Design Preview Packet

This packet covers the M4A Design Preview Gate only (single-ligand core).

## Gate Status
- Milestone: `M4A`
- Gate state: `PENDING`
- Required approval token: `APPROVED UI PREVIEW`

## Scope
In scope for this packet:
- `3fly_cryst_lig` only (`Crystal Ligand` display label)
- baseline/refined pose checkboxes
- four pose states (baseline-only, refined-only, both-visible, both-unchecked)
- both-visible legend
- both-unchecked persistent empty-state with recovery actions
- zoom action
- per-pose failure isolation UX

Out of scope for this packet:
- featured multi-ligand switching (`M4B`)
- full searchable ligand list and ordering (`M4C` deferred)

## Packet Structure
- `preview-index.md`: artifact checklist and acceptance traceability.
- `approval-log.md`: approval record and reviewer comments.
- `desktop/`: desktop preview artifacts.
- `states/`: per-state guidance and artifact links.

## Rendering Policy
- Desktop artifacts are required for M4A preview approval.
- Mobile artifacts are intentionally omitted for this scope per current reviewer instruction.
