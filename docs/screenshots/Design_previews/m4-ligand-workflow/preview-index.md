# Preview Index - M4A Ligand Workflow

## Coverage Checklist
- [x] Controls include baseline/refined checkboxes and zoom action.
- [x] Four pose states represented: baseline-only, refined-only, both-visible, both-unchecked.
- [x] Persistent empty-state guidance includes: Show Baseline, Show Refined, Show Both.
- [x] Both-visible legend differentiates baseline and refined styles.
- [x] Error state shows per-pose failure with non-blocking context and affected-control isolation.
- [x] Camera-preservation expectation documented (no auto-zoom except explicit zoom action).
- [x] M4A scope boundaries documented (single ligand only).

## Artifact Matrix
| State | Desktop artifact | Notes |
|---|---|---|
| Default | `desktop/default-state.svg` | Crystal Ligand selected, baseline on, refined off |
| Loading | `desktop/loading-state.svg` | Local control loading, app remains responsive |
| Empty | `desktop/empty-state-both-unchecked.svg` | Recovery actions visible |
| Error | `desktop/error-state-pose-failure.svg` | Only failed pose control disabled |
| Success | `desktop/success-state-both-visible.svg` | Legend visible + differentiation |

## M4A Acceptance Mapping
- Spec refs: `docs/specs/ligand-workflow-spec.md` Section `10.1 M4A Required Checks`.
- Plan refs: `docs/plans/execution-plan.md` row `M4A` and Section `1.3 UI Design Preview Gate`.

## Completion Criteria
- [x] All required states have desktop artifacts.
- [ ] Reviewer feedback addressed.
- [ ] Approval recorded in `approval-log.md` with token `APPROVED UI PREVIEW`.

## Open UI Questions
- Should the legend be always visible in both-visible state or be collapsible?
