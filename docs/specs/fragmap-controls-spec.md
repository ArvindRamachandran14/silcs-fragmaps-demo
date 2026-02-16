# FragMap Controls Specification

## 1. Purpose
Define implementation-ready behavior for FragMap controls in the viewer, consistent with:
- `AGENTS.md` instruction precedence.
- `docs/SilcsBio_Candidate_Exercise_Instructions.md`.
- `docs/specs/viewer-core-spec.md` and `docs/specs/ligand-workflow-spec.md`.

This spec defines map control UI, protein-visibility behavior in the FragMap tab, per-map iso behavior for GFE maps, exclusion-map behavior, loading/caching strategy, and reliability guardrails.

## 2. Conflict Resolution Note
Prior conflict (now resolved):
- `docs/plans/technical-plan.md` previously referenced a global iso slider in requirement mapping.

Resolution adopted across docs:
- Per explicit user direction, this spec uses per-map iso controls only (`-`, value, `+`) and no global iso control.
- This is an intentional replacement, not an addition.

## 3. Scope / Out of Scope
In scope:
- Right-panel FragMap controls.
- Required M5 runtime flow for this spec: `M5.1` -> `M5.2` -> `M5.2a` -> `M5.2b` -> `M5.3` -> `M5.4` -> `M5.5` -> `M5.5a` -> `M5.6`.
- Placement within shared right-panel two-tab framework (`FragMap`, `Ligand`) for `M5.1+`, with FragMap behavior defined under the `FragMap` tab.
- Protein cartoon visibility toggle (`M5.2b+`) for overlap inspection while using FragMap controls.
- `Primary 3 + Advanced full list` organization.
- Per-map checkbox visibility controls.
- Per-map iso controls for iso-adjustable GFE maps.
- Exclusion-map fixed-style behavior with non-editable iso controls.
- Bulk actions: `Hide all`, `Reset defaults`.
- Lazy-load/cache behavior and reliability guardrails.
- Error handling for map load/update failures.
- Optional exploratory wireframe parity investigation (`M5.2c`) for map mesh appearance only (deferred/non-blocking unless explicitly promoted).

Out of scope:
- Ligand selection/pose controls.
- Protein representation controls beyond a single show/hide toggle (for example style, color, surface mode).
- Scientific narrative content.
- Final performance evidence collection protocol details.

## 4. Map Inventory and Labels
Canonical dataset mapping for 3FLY:

Primary 3:
- `3fly.hbdon.gfe.dx` -> `Generic Donor`
- `3fly.hbacc.gfe.dx` -> `Generic Acceptor`
- `3fly.apolar.gfe.dx` -> `Generic Apolar`

Advanced:
- `3fly.mamn.gfe.dx` -> `Positively Charged`
- `3fly.acec.gfe.dx` -> `Negatively Charged`
- `3fly.meoo.gfe.dx` -> `Hydroxyl Oxygen`
- `3fly.tipo.gfe.dx` -> `Water Oxygen`
- `3fly.excl.dx` -> `Exclusion Map`

Labeling rules:
- UI uses friendly labels above.
- Filenames remain implementation details.
- Screenshot labels are reference-only and do not override this mapping.

### 4.1 Canonical Color Mapping (v1)
Each map has one canonical display color for row legend and wireframe isosurface rendering:
- `Generic Donor` (`3fly.hbdon.gfe.dx`): `blue` (`#1976d2`)
- `Generic Acceptor` (`3fly.hbacc.gfe.dx`): `red` (`#d32f2f`)
- `Generic Apolar` (`3fly.apolar.gfe.dx`): `green` (`#2e7d32`)
- `Positively Charged` (`3fly.mamn.gfe.dx`): `orange` (`#f57c00`)
- `Negatively Charged` (`3fly.acec.gfe.dx`): `magenta` (`#c2185b`)
- `Hydroxyl Oxygen` (`3fly.meoo.gfe.dx`): `cyan` (`#0097a7`)
- `Water Oxygen` (`3fly.tipo.gfe.dx`): `yellow` (`#f9a825`)
- `Exclusion Map` (`3fly.excl.dx`): `gray` (`#9e9e9e`) with fixed wireframe isosurface style

Color contract:
- The first three mappings above are fixed user-provided inputs and must not be changed without explicit spec update.
- Legend and rendered map wireframes must use this same canonical mapping.
- Color choices do not replace text labels; labels remain required for accessibility.

## 5. Layout and Control Organization
Use structure direction from:
- `docs/screenshots/GUI/GUI_fragmaps.png`
- `docs/screenshots/Ideas/fragmap-primary3-advanced-per-map-iso.svg`

Control layout order:
1. Shared tab strip context (`M5.1+`): `FragMap` tab active with `Ligand` as sibling tab.
2. Action row: `Hide all`, `Reset defaults`.
3. Protein visibility row: `Protein cartoon` toggle (default on).
4. `Primary 3` section (always visible).
5. `Advanced` section (expandable, includes remaining maps).
6. Per-map row controls include `visibility checkbox`, `map label`, and per-map iso controls (`-`, numeric value, `+`) for iso-adjustable GFE maps.
7. `Exclusion Map` row remains visibility-toggleable but its iso controls are disabled/read-only (no editable value).

Layout constraints:
- Viewport remains dominant over control panel.
- Text labels must not overlap.
- Controls must remain within panel bounds at supported widths.
- Mobile behavior follows collapsed controls pattern from `docs/specs/viewer-core-spec.md`.

### 5.1 Optional Exploratory Wireframe Parity Note (`M5.2c` Deferred)
Objective:
- Keep triangulated wireframe representation while improving visual parity with approved/reference SILCS wireframe screenshots for overlap inspection.

Scope boundaries:
- Allowed:
  - rendering-parameter tuning for map wireframes (for example opacity/alpha, line visibility, depth-cue settings).
  - consistent tuning across Primary and Advanced rows, with `Exclusion Map` remaining fixed gray.
- Not allowed:
  - changing map ID-to-label mapping,
  - changing default iso values,
  - changing toggle/load/cache behavior,
  - adding/removing controls or changing tab layout.

Reference artifacts for parity review:
- `docs/screenshots/GUI/GUI_3fly_ligand_apolar_fragmap.png` (official reference snapshot)
- `docs/screenshots/Bugs/3fly_ligand_fragmaps_apolar.png` (current app comparison snapshot)

If this optional exploration is reactivated, acceptance intent for that pass is:
- Wireframe edges remain clearly visible (triangulated look preserved).
- Rendered density/legibility is closer to approved/reference look for the same map and iso context.
- Existing behavior contracts from `M5.1`-`M5.2b` remain unchanged.

## 6. State and Data Contracts
Core types:
- `type FragMapId = string`
- `interface FragMapAsset { id: FragMapId; label: string; dxUrl: string; color: string; isoAdjustable: boolean; defaultIso?: number }`

FragMap UI/runtime state:
- `proteinVisible: boolean`
- `visibleMapIds: FragMapId[]`
- `expandedSections: { advanced: boolean }`
- `perMapIso: Record<FragMapId, number>`
- `mapLoadStatus: Record<FragMapId, "idle" | "loading" | "loaded" | "error">`
- `mapError: Partial<Record<FragMapId, string>>`

State rules:
- `proteinVisible` defaults to `true` on first viewer-ready state.
- Toggling `proteinVisible` affects only protein-cartoon visibility and does not change ligand/map visibility or per-map iso state.
- `visibleMapIds` supports any combination including none.
- `perMapIso[id]` is tracked only for `isoAdjustable` maps and initializes from each map’s `defaultIso`.
- Map visibility and map iso state are independent.
- `Exclusion Map` has `isoAdjustable: false` and does not expose editable iso state.
- Map row is disable-only when its own load/update fails.

## 7. Default State Contract
On first viewer-ready state:
- Protein cartoon visible.
- All maps hidden.
- `Primary 3` section visible.
- `Advanced` section collapsed by default.
- Iso-adjustable map rows initialize to map defaults.
- No map network/data load until first map toggle-on.

Default iso values (v1 canonical):
- Source: `docs/screenshots/GUI/GUI_fragmaps_isovalues_default.png`.
- `3fly.hbdon.gfe.dx` (`Generic Donor`): `-0.8`
- `3fly.hbacc.gfe.dx` (`Generic Acceptor`): `-0.8`
- `3fly.apolar.gfe.dx` (`Generic Apolar`): `-1.0`
- `3fly.mamn.gfe.dx` (`Positively Charged`): `-1.2`
- `3fly.acec.gfe.dx` (`Negatively Charged`): `-1.2`
- `3fly.meoo.gfe.dx` (`Hydroxyl Oxygen`): `-0.8`
- `3fly.tipo.gfe.dx` (`Water Oxygen`): `-0.3`
- `3fly.excl.dx` (`Exclusion Map`): no editable iso value in UI.
- Exclusion render contract: fixed gray triangulated wireframe isosurface representation.

## 8. Interaction Flows
### 8.1 Single Map Toggle
- Toggling a map on:
1. If not loaded, lazy-load map `.dx`.
2. Create and cache map component/representation handle.
3. If map is iso-adjustable, apply current `perMapIso` for that map.
4. If map is `Exclusion Map`, render using fixed gray triangulated wireframe style.
5. Set map visible.
- Toggling a map off:
1. Set map invisible in place.
2. Keep cached handle for fast reuse.

### 8.2 Protein Visibility Toggle
- `Protein cartoon` toggle ON:
1. Ensure protein cartoon representation is visible.
2. Do not change map/ligand visibility state or camera.
- `Protein cartoon` toggle OFF:
1. Hide protein cartoon representation in place.
2. Keep ligand and FragMap representations unchanged.
3. Do not change camera.

### 8.3 Bulk Actions
- `Hide all`: set all currently visible maps invisible; keep caches.
- `Reset defaults`:
1. Reset all iso-adjustable map `perMapIso` values to defaults.
2. Keep current map visibility unchanged (no implicit hide/show side effects).
3. Do not trigger row retries as a side effect of this action.
- Camera baseline reset remains a top-bar viewer control (`M3`) and is intentionally outside FragMap-panel bulk actions.

### 8.4 Per-Map Iso Controls
- Controls for iso-adjustable rows: decrement button, numeric value, increment button.
- Numeric contract for iso-adjustable rows:
  - `step = 0.1`
  - `min = -3.0`
  - `max = 0.0`
  - Display precision: `1` decimal place
  - Out-of-range inputs clamp to `[min, max]`
  - Invalid typed input reverts to the last valid row value
- Iso change updates only that map’s visible representation(s).
- If map is hidden, store iso value and apply when map becomes visible.
- `Exclusion Map` iso controls are disabled/read-only in the row and do not trigger iso updates.
- No global iso exists in this spec.

### 8.5 Section Expand/Collapse
- Advanced section expand/collapse must not affect current map visibility.
- Expand state persists during route session.

## 9. Loading and Caching Strategy
- Load maps lazily on first toggle.
- Cache loaded map component/rep handles keyed by `FragMapId`.
- Reuse cached handles for subsequent show/hide.
- Do not execute global surface clear/rebuild for single-map changes.
- Preserve camera during map load/show/hide, protein visibility toggles, and iso changes.

## 10. Concurrency and Reliability Guardrails
- Guard async map operations with single-flight or request-id logic.
- Ignore stale async completions when newer user intent exists.
- Serialize conflicting updates per map row where needed.
- Keep unaffected maps stable when one map operation fails.

Why this is more robust than prior approach:
- Avoids heavy eager preload of all maps before use.
- Avoids global teardown/rebuild on each checkbox change.
- Reduces race-condition risk from rapid user toggles.
- Isolates failures per map row instead of destabilizing all map state.

## 11. Error and Empty States
Error behavior:
- Show non-blocking toast on map load/update failure.
- Disable only failed map row controls.
- Provide row-level retry action.
- Preserve visible unaffected maps and current camera.

Empty map state:
- If no maps visible, show non-error helper text in panel.
- No blocking overlays.

## 12. Accessibility and Usability Constraints
- Protein toggle, all row checkboxes, iso controls (where enabled), and action buttons keyboard accessible.
- Row labels programmatically associated with checkboxes.
- Per-map iso value readable and update feedback visible.
- Disabled iso controls for `Exclusion Map` must expose disabled state semantics to assistive technology.
- Color is not the only map identity signal; include text label and legend semantics.
- Advanced section toggle must be keyboard and screen-reader discoverable.

## 13. Spec-Level Acceptance Checks
FragMap controls are accepted when all checks pass:
1. Right controls framework exposes `FragMap` and `Ligand` tabs (`M5.1+`), and FragMap controls are rendered under the `FragMap` tab.
2. `Protein cartoon` toggle exists in the FragMap tab, defaults to `ON`, and only changes protein visibility.
3. Panel includes `Primary 3` and expandable `Advanced` full list.
4. Canonical 3FLY map-to-label mapping in this spec is used.
5. All maps default hidden on first viewer-ready state.
6. Single map toggle-on lazy-loads only that map and caches it.
7. Subsequent toggles reuse cache and do not re-fetch/re-parse unnecessarily.
8. Per-map iso controls exist for iso-adjustable GFE map rows and update only intended map surfaces.
9. `Exclusion Map` row does not expose editable iso controls and renders as fixed gray triangulated wireframe isosurface.
10. No global iso control appears.
11. `Hide all` and `Reset defaults` behaviors match this spec, including iso-only `Reset defaults` semantics with visibility unchanged.
12. Map toggle, protein toggle, and iso update actions happen with no page reload.
13. Camera preserved for map toggle/protein toggle/iso updates and FragMap-panel bulk actions; camera reset is only available via top-bar viewer `Reset View`.
14. Map failures are isolated to affected row and surfaced with toast + retry.
15. UI labels and controls remain non-overlapping and in-bounds at supported widths.
16. Row legends and rendered surfaces use the canonical map-color mapping defined in Section 4.1.
17. Optional exploration guardrail: if deferred `M5.2c` parity work is reactivated, it must change rendering parameters only and must not change map IDs, default iso values, or map/protein/ligand behavior contracts.

AC intent coverage:
- AC-2 behavior intent: map show/hide updates are fast and preserve camera.
- AC-5 behavior intent: per-map iso updates are fast and targeted.

## 14. Traceability
- PRD mapping: `2.B Interactive Visualization Page (Required)` map controls and iso behavior.
- PRD mapping: `5. Acceptance Criteria` AC-2 and AC-5 behavior intent.
- Technical plan mapping: runtime map toggle flow and lazy-load/cache direction.
- Technical plan mapping: FragMap asset model and per-map state handling.

## 15. Open Dependencies
- `docs/specs/performance-and-validation-spec.md` should define measurement protocol and pass/fail evidence format for AC-2/AC-5.
- If future calibration changes default iso values, this spec must be updated with revised canonical numbers.
