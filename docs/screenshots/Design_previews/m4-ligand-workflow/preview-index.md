# Preview Index - M4 Ligand Workflow

## Coverage Checklist
- [ ] Right-panel ligand section contains quick picks, searchable selector, pose checkboxes, and Zoom action.
- [ ] Four pose states represented: baseline-only, refined-only, both-visible, both-unchecked.
- [ ] Persistent empty-state guidance includes: Show Baseline, Show Refined, Show Both.
- [ ] Both-visible legend clearly differentiates baseline and refined styles.
- [ ] Error state shows per-pose failure with non-blocking message context.
- [ ] Camera-preservation expectation is documented (no auto-zoom on switch).

## Artifact Matrix
| State | Desktop artifact | Mobile artifact (if needed) | Notes |
|---|---|---|---|
| Default | `desktop/default-state.png` | `mobile/default-state.png` | Crystal Ligand selected, baseline on, refined off |
| Loading | `desktop/loading-state.png` | `mobile/loading-state.png` | Local control loading only |
| Empty | `desktop/empty-state-both-unchecked.png` | `mobile/empty-state-both-unchecked.png` | Recovery actions visible |
| Error | `desktop/error-state-pose-failure.png` | `mobile/error-state-pose-failure.png` | Affected pose disabled only |
| Success | `desktop/success-state-both-visible.png` | `mobile/success-state-both-visible.png` | Legend visible + visual differentiation |

## M4 Acceptance Mapping
- Spec refs: `docs/specs/ligand-workflow-spec.md` Sections 4-10.
- Plan refs: `docs/plans/execution-plan.md` M4 row + Design Preview Gate.

## Completion Criteria
- [ ] All required states have artifacts.
- [ ] Review feedback addressed.
- [ ] Approval recorded in `approval-log.md` with token `APPROVED UI PREVIEW`.
