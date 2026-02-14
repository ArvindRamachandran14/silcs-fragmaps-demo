# FragMap Controls Specification

## 1. Purpose
Define implementation-ready behavior for FragMap controls in the viewer, consistent with:
- `AGENTS.md` instruction precedence.
- `docs/SilcsBio_Candidate_Exercise_Instructions.md`.
- `docs/specs/viewer-core-spec.md` and `docs/specs/ligand-workflow-spec.md`.

This spec defines map control UI, per-map iso behavior for GFE maps, exclusion-map behavior, loading/caching strategy, and reliability guardrails.

## 2. Conflict Resolution Note
Prior conflict (now resolved):
- `docs/plans/technical-plan.md` previously referenced a global iso slider in requirement mapping.

Resolution adopted across docs:
- Per explicit user direction, this spec uses per-map iso controls only (`-`, value, `+`) and no global iso control.
- This is an intentional replacement, not an addition.

## 3. Scope / Out of Scope
In scope:
- Right-panel FragMap controls.
- `Primary 3 + Advanced full list` organization.
- Per-map checkbox visibility controls.
- Per-map iso controls for iso-adjustable GFE maps.
- Exclusion-map fixed-style behavior with non-editable iso controls.
- Bulk actions: `Hide all`, `Reset defaults`, `Reset view`.
- Lazy-load/cache behavior and reliability guardrails.
- Error handling for map load/update failures.

Out of scope:
- Ligand selection/pose controls.
- Protein representation controls.
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

## 5. Layout and Control Organization
Use structure direction from:
- `docs/screenshots/GUI/GUI_fragmaps.png`
- `docs/screenshots/Ideas/fragmap-primary3-advanced-per-map-iso.svg`

Control layout order:
1. Action row: `Hide all`, `Reset defaults`, `Reset view`.
2. `Primary 3` section (always visible).
3. `Advanced` section (expandable, includes remaining maps).
4. Per-map row controls include `visibility checkbox`, `map label`, and per-map iso controls (`-`, numeric value, `+`) for iso-adjustable GFE maps.
5. `Exclusion Map` row remains visibility-toggleable but its iso controls are disabled/read-only (no editable value).

Layout constraints:
- Viewport remains dominant over control panel.
- Text labels must not overlap.
- Controls must remain within panel bounds at supported widths.
- Mobile behavior follows collapsed controls pattern from `docs/specs/viewer-core-spec.md`.

## 6. State and Data Contracts
Core types:
- `type FragMapId = string`
- `interface FragMapAsset { id: FragMapId; label: string; dxUrl: string; color: string; isoAdjustable: boolean; defaultIso?: number }`

FragMap UI/runtime state:
- `visibleMapIds: FragMapId[]`
- `expandedSections: { advanced: boolean }`
- `perMapIso: Record<FragMapId, number>`
- `mapLoadStatus: Record<FragMapId, "idle" | "loading" | "loaded" | "error">`
- `mapError: Partial<Record<FragMapId, string>>`

State rules:
- `visibleMapIds` supports any combination including none.
- `perMapIso[id]` is tracked only for `isoAdjustable` maps and initializes from each map’s `defaultIso`.
- Map visibility and map iso state are independent.
- `Exclusion Map` has `isoAdjustable: false` and does not expose editable iso state.
- Map row is disable-only when its own load/update fails.

## 7. Default State Contract
On first viewer-ready state:
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
- Exclusion render contract: fixed translucent gray volume representation.

## 8. Interaction Flows
### 8.1 Single Map Toggle
- Toggling a map on:
1. If not loaded, lazy-load map `.dx`.
2. Create and cache map component/representation handle.
3. If map is iso-adjustable, apply current `perMapIso` for that map.
4. If map is `Exclusion Map`, render using fixed translucent gray style.
5. Set map visible.
- Toggling a map off:
1. Set map invisible in place.
2. Keep cached handle for fast reuse.

### 8.2 Bulk Actions
- `Hide all`: set all currently visible maps invisible; keep caches.
- `Reset defaults`:
1. Reset all map visibility to default (all hidden).
2. Reset all iso-adjustable map `perMapIso` values to defaults.
3. For rows currently disabled by prior errors, execute one retry per disabled row.
4. Clear row disable state only when that row retry succeeds; keep row disabled when retry fails.
- `Reset view`: restore the viewer camera to the same baseline state defined by viewer startup defaults (fixed orientation, position, and zoom captured after initial protein + default crystal ligand (`3fly_cryst_lig`) ready state), without changing ligand selection, map visibility, or per-map iso values.

### 8.3 Per-Map Iso Controls
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

### 8.4 Section Expand/Collapse
- Advanced section expand/collapse must not affect current map visibility.
- Expand state persists during route session.

## 9. Loading and Caching Strategy
- Load maps lazily on first toggle.
- Cache loaded map component/rep handles keyed by `FragMapId`.
- Reuse cached handles for subsequent show/hide.
- Do not execute global surface clear/rebuild for single-map changes.
- Preserve camera during map load/show/hide and iso changes.

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
- All row checkboxes, iso controls (where enabled), and action buttons keyboard accessible.
- Row labels programmatically associated with checkboxes.
- Per-map iso value readable and update feedback visible.
- Disabled iso controls for `Exclusion Map` must expose disabled state semantics to assistive technology.
- Color is not the only map identity signal; include text label and legend semantics.
- Advanced section toggle must be keyboard and screen-reader discoverable.

## 13. Spec-Level Acceptance Checks
FragMap controls are accepted when all checks pass:
1. Panel includes `Primary 3` and expandable `Advanced` full list.
2. Canonical 3FLY map-to-label mapping in this spec is used.
3. All maps default hidden on first viewer-ready state.
4. Single map toggle-on lazy-loads only that map and caches it.
5. Subsequent toggles reuse cache and do not re-fetch/re-parse unnecessarily.
6. Per-map iso controls exist for iso-adjustable GFE map rows and update only intended map surfaces.
7. `Exclusion Map` row does not expose editable iso controls and renders as fixed translucent gray volume.
8. No global iso control appears.
9. `Hide all`, `Reset defaults`, and `Reset view` behaviors match this spec.
10. Map toggle and iso update actions happen with no page reload.
11. Camera preserved for map toggle/iso updates; only `Reset view` changes camera.
12. Map failures are isolated to affected row and surfaced with toast + retry.
13. UI labels and controls remain non-overlapping and in-bounds at supported widths.

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
