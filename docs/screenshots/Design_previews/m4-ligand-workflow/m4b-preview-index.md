# Preview Index - M4B Featured Ligands Expansion

## Coverage Checklist
- [x] Featured subset is constrained to 4 total entries (`Crystal Ligand` + 3 featured ligands).
- [x] Featured quick-pick switching represented for fixed subset scope.
- [x] Default featured state represented with `Crystal Ligand` selected.
- [x] Switch-loading state represented without route reload implications.
- [x] Switch-success state represented with camera-preservation expectation.
- [x] Per-ligand failure state represented with isolated control impact.
- [x] Fallback/disabled state represented for unavailable featured entries.
- [x] M4A behavior continuity is explicitly called out (pose toggles/zoom/failure isolation).
- [x] Featured chips are fully visible and not occluded by the viewer-context panel.

## Artifact Matrix (Desktop)
| State | Artifact | Notes |
|---|---|---|
| Default | `desktop/m4b-default-state.svg` | Crystal Ligand active, featured chips visible |
| Switch-loading | `desktop/m4b-switch-loading.svg` | In-place loading feedback during featured switch |
| Switch-success | `desktop/m4b-switch-success.svg` | Featured ligand switched, camera preserved |
| Per-ligand failure | `desktop/m4b-per-ligand-failure.svg` | Affected pose disabled, non-blocking UX |
| Fallback/disabled | `desktop/m4b-fallback-disabled-state.svg` | Unavailable featured entry disabled, previous valid ligand preserved |

## Proposed M4B Featured Subset (Preview)
- `3fly_cryst_lig` (`Crystal Ligand`)
- `p38_goldstein_05_2e`
- `p38_goldstein_06_2f`
- `p38_goldstein_07_2g`

## M4B Acceptance Mapping
- Spec refs: `docs/specs/ligand-workflow-spec.md` Section `10.2 M4B Required Checks`.
- Plan refs: `docs/plans/execution-plan.md` row `M4B` and Section `1.3 UI Design Preview Gate`.

## Completion Criteria
- [x] Required desktop states are present for M4B additions.
- [x] Reviewer feedback addressed (chip occlusion resolved in all M4B desktop states).
- [ ] Approval recorded in `approval-log.md` with token `APPROVED UI PREVIEW`.

## Open UI Questions
- Should disabled featured chips show tooltip text with failure reason (`asset missing`, `load failed`, or generic `Unavailable`)?
- Should switch-loading use a chip-level spinner only, or also show a lightweight text status line for accessibility?
