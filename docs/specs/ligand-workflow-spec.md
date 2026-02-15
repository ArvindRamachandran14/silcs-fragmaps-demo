# Ligand Workflow Specification

## 1. Purpose
Define an implementation-ready ligand interaction contract for the viewer so ligand selection and pose comparison behavior are consistent with:
- `AGENTS.md` instruction precedence
- `docs/plans/technical-plan.md`
- `docs/SilcsBio_Candidate_Exercise_Instructions.md`

This spec focuses on ligand controls and pose visibility behavior only.

## 2. Scope / Out of Scope
In scope:
- Right-panel ligand workflow UI.
- Ligand selection via featured quick-picks (required now) and searchable dropdown (deferred).
- Pose visibility controls using checkboxes (`baseline`, `refined`).
- Support for `baseline-only`, `refined-only`, `both-visible`, and `both-unchecked`.
- Zoom-to-selected-ligand action.
- In-place updates without page reload.
- Pose loading/fallback/error behavior for ligand assets.

Out of scope:
- Atom GFE analysis and related metrics panels.
- Frame/conformer frame controls.
- Local ligand upload controls.
- FragMap controls and iso-value behavior.
- Performance measurement harness and evidence reporting.

### 2.1 Delivery Phases (Locked)
- `M4A` (required): single-ligand core (`3fly_cryst_lig`) with 4 pose states, zoom, and failure/empty-state handling.
- `M4B` (required): featured-ligand switching only (fixed subset of curated ligands), preserving all M4A behaviors.
- `M4C` (deferred stretch): full ligand list searchable selector, deterministic ordering rules, and `No ligands found` state.
- Progression rule: `M4C` is not a blocker for `M5` and later milestones unless explicitly re-promoted.

## 3. Data and State Contracts
Core types:
- `type PoseKind = "baseline" | "refined"`
- `type LigandId = string`

Ligand asset contract:
- `interface LigandAsset { id: LigandId; label: string; featured: boolean; baselineSdf: string; refinedSdf: string; baselinePdbFallback?: string; refinedPdbFallback?: string }`

Viewer ligand state contract:
- `ligandId: LigandId`
- `visiblePoseKinds: PoseKind[]`
- `isLigandLoading: boolean`
- `poseErrors: Partial<Record<PoseKind, string>>`

State rules:
- `visiblePoseKinds` may be `[]`, `["baseline"]`, `["refined"]`, or `["baseline","refined"]`.
- Duplicate entries are invalid.
- Order should be normalized as `["baseline","refined"]` when both are selected.

### 3.1 Canonical Ligand Manifest Contract
Source of truth for full ligand scope (implemented in phases):
- Crystal ligand baseline: `from_silcsbio/3fly_cryst_lig.sdf` (`id = 3fly_cryst_lig`, display label `Crystal Ligand`).
- Crystal ligand refined: `from_silcsbio/3fly_cryst_lig_posref.sdf` (fallback `from_silcsbio/3fly_cryst_lig_posref.pdb`).
- Baseline ligand pool: all `.sdf` files in `from_silcsbio/ligands`.
- Refined ligand pool: files in `from_silcsbio/ligands_posref`.

ID derivation and inclusion rules:
- `LigandId` is derived from baseline `.sdf` basename without extension.
- Full selectable set is `3fly_cryst_lig` plus every baseline ligand ID derived from `from_silcsbio/ligands/*.sdf`.
- A ligand is included in the runtime manifest only if a baseline `.sdf` exists.
- For each included ligand ID, refined pose resolution is attempted in this order:
  1. `from_silcsbio/ligands_posref/<LigandId>.sdf`
  2. `from_silcsbio/ligands_posref/<LigandId>.pdb` (fallback)

Phase-specific required manifest scope:
- `M4A`: must support `3fly_cryst_lig` only.
- `M4B`: must support `3fly_cryst_lig` plus canonical featured ligand IDs from Section 4.
- `M4C` (deferred): must support full selectable set and deterministic ordering.

Deterministic ordering rules (deferred to `M4C`):
- Empty-query dropdown order: `Crystal Ligand` first, then remaining ligands sorted by display label ascending, ties by ligand ID ascending.
- Search-result order follows Section 6.1 ordering rules.
- Ordering must be stable across renders in the same session.

## 4. Layout and Control Organization
Use `docs/screenshots/GUI/GUI_ligand_analysis.png`, `docs/screenshots/GUI/GUI_ligand_dropdown.png`, `docs/screenshots/Ideas/ligand-controls-wireframe-collapsed-square.svg.png`, and `docs/screenshots/Ideas/ligand-controls-wireframe-expanded-square.svg.png` as structure references.

Right-panel ligand section order:
1. `Featured quick picks` chips (Crystal Ligand + 5 featured ligands).
   - Canonical featured ligand IDs: `3fly_cryst_lig`, `p38_goldstein_05_2e`, `p38_goldstein_06_2f`, `p38_goldstein_07_2g`, `p38_goldstein_08_2h`, `p38_goldstein_09_2i`.
   - Display label mapping: ligand ID `3fly_cryst_lig` must be shown to users as `Crystal Ligand`.
2. `Search all ligands` searchable dropdown (deferred to `M4C`).
3. `Pose visibility` checkboxes for `Baseline` and `Refined`.
4. Compact comparison legend (shown when both checked).
5. `Zoom` action button.

UI constraints:
- Keep ligand workflow controls grouped in one panel section.
- Keep viewport visually dominant.
- Do not include GFE analysis, frame controls, or upload controls in v1.

## 5. Default State Contract
On initial viewer-ready state:
- Selected ligand: `3fly_cryst_lig` (display label `Crystal Ligand`).
- Pose visibility: `baseline` checked, `refined` unchecked.
- Camera: preserved from viewer core default and not auto-reset by ligand control initialization.

## 6. Interaction Flows
### 6.1 Ligand Selection
User can select ligand by:
- Clicking a featured quick-pick chip.
- Searching/selecting from dropdown (`M4C` only).

On ligand selection:
- Preserve current camera orientation/zoom.
- Update active ligand state.
- Re-evaluate pose availability for selected ligand.
- Apply current `visiblePoseKinds` intent where possible.
- Do not trigger route change or full page reload.

Search/dropdown behavior contract (`M4C` deferred):
- Matching: case-insensitive substring match against ligand display label and ligand ID.
- Ordering:
  - If query matches `Crystal Ligand` (`3fly_cryst_lig`), pin it first.
  - Remaining matches sorted alphabetically by display label.
  - Ties broken by ligand ID ascending.
- Empty results: show explicit `No ligands found` state with no side effects to current selection.

### 6.2 Pose Visibility (Checkbox-Based)
Controls:
- Checkbox `Baseline`.
- Checkbox `Refined`.

Allowed states:
- Baseline only.
- Refined only.
- Both visible.
- Both unchecked.

Behavior:
- Toggling any checkbox updates ligand pose components in place.
- If both unchecked, no ligand poses are rendered; optional helper guidance may be shown.

### 6.3 Zoom Action
- `Zoom` focuses camera on the currently selected ligand.
- Zoom is explicit user action only.
- Ligand switching alone must not force auto-zoom.

## 7. Visual Differentiation Rules
When one pose is visible:
- Render visible pose with standard ligand styling.

When both poses are visible:
- `Baseline` is de-emphasized: thinner representation and lower opacity.
- `Refined` is emphasized: thicker representation and higher opacity.
- Show a small legend in panel clarifying baseline vs refined style mapping.

Style mapping must remain consistent across ligand switches.

## 8. Loading, Error, and Empty States
Loading:
- Use local ligand-control loading feedback during ligand/pose asset updates.
- Keep viewport interactive when safe; avoid global blocking overlays for normal ligand toggles.

Asset loading policy:
- Baseline: load `baselineSdf` first, fallback to `baselinePdbFallback` if needed.
- Refined: load `refinedSdf` first, fallback to `refinedPdbFallback` if needed.

Error handling:
- If a pose fails primary and fallback load, disable that pose checkbox and show non-blocking toast with actionable reason.
- If both poses fail for selected ligand, preserve previous valid rendered ligand state and surface error.

Empty state (both unchecked):
- Showing a dedicated empty-state panel is optional.
- If shown, keep it non-error and scoped to ligand controls (not a transient toast).
- Message (if present): no ligand poses are currently visible for the selected ligand.
- Maintain ligand selection context; do not clear selected ligand when both are unchecked.
- Ensure both pose checkboxes remain immediately available for keyboard recovery.

## 9. Accessibility and Usability Constraints
- All chips, dropdown items, checkboxes, and zoom action must be keyboard accessible.
- Checkbox labels must be explicit and programmatically associated.
- Dropdown search must remain usable at narrow panel widths.
- Empty/error states must use readable, plain language.
- Pose state changes must be understandable without color alone (legend + labels).

## 10. Spec-Level Acceptance Checks

### 10.1 M4A Required Checks
1. Right-panel ligand section contains pose checkboxes and zoom action for `3fly_cryst_lig`.
2. `3fly_cryst_lig` (display label `Crystal Ligand`) is default selected on first load.
3. Pose checkboxes support all four states (`baseline-only`, `refined-only`, `both-visible`, `both-unchecked`).
4. Both-unchecked state is clearly represented by unchecked pose toggles, with optional helper guidance.
5. Both-visible state applies baseline/refined differentiation rules and shows legend.
6. Pose visibility changes happen in place with no page reload.
7. Zoom occurs only when user invokes `Zoom`.
8. Pose load failures trigger non-blocking toast and disable only affected pose control.
9. No GFE panel, frame control, or local upload control appears in v1 ligand workflow.

### 10.2 M4B Required Checks
1. Right-panel ligand section contains featured quick-pick chips (`Crystal Ligand` + canonical featured set).
2. Users can switch ligands via featured quick picks only.
3. Ligand switches are in-place with no page reload.
4. Camera is preserved on ligand switch.
5. M4A checks remain passing after switching ligands.

### 10.3 M4C Deferred Stretch Checks
1. Searchable dropdown is present for full ligand set.
2. Users can select ligands from searchable list covering all baseline `.sdf` IDs.
3. Search behavior is case-insensitive on label and ligand ID.
4. Empty-query dropdown ordering is deterministic: `Crystal Ligand` first, then label/ID sorted entries.
5. Explicit `No ligands found` state appears for unmatched queries.

## 11. Traceability
- PRD mapping: `2.B Interactive Visualization Page (Required)` for multi-ligand and baseline/refined interaction (implemented incrementally via M4A/M4B, with M4C deferred).
- PRD mapping: `5. Acceptance Criteria` AC-3 and AC-4 behavior intent.
- Technical plan mapping: runtime flow for ligand selection and pose component updates.
- Technical plan mapping: data/file handling policy for `.sdf` primary and `.pdb` fallback.
- Technical plan mapping: updated state model using `visiblePoseKinds: PoseKind[]`.

## 12. Expert Workflow Enhancement Note
- This spec intentionally extends the baseline PRD toggle pattern into an expert-friendly pose visibility model.
- Enhancement rationale: `both-visible` supports direct pose-delta inspection for computational chemists/applications scientists.
- Enhancement rationale: `both-unchecked` supports temporary decluttering while preserving ligand context.
- Compatibility note: the enhancement is a superset of baseline/refined toggle behavior, not a replacement for it.

## 13. Open Dependencies
- `docs/specs/fragmap-controls-spec.md` will define map controls, color/labels, and iso behavior.
- `docs/specs/performance-and-validation-spec.md` will define timing measurement protocol and pass/fail evidence.
