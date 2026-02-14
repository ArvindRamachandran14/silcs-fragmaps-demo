# Performance and Validation Specification

## 1. Purpose
Define the validation contract for proving AC-1 through AC-6 with repeatable measurements and explicit evidence artifacts.

This spec does not define product behavior. It defines how behavior is measured, validated, and reported.

## 2. Scope / Out of Scope
In scope:
- Validation scenarios for AC-1..AC-6.
- Test environment and run conditions.
- Instrumentation requirements and timing boundaries.
- Pass/fail thresholds and aggregation rules.
- Evidence/reporting format in `docs/validation.md`.

Out of scope:
- Feature design details (covered in other spec docs).
- Browser automation framework choice.
- CI/CD integration details.

## 3. Source and Traceability
Primary references:
- `docs/SilcsBio_Candidate_Exercise_Instructions.md` (AC-1..AC-6).
- `docs/plans/technical-plan.md` (measurement intent and runtime strategy).
- `docs/specs/viewer-core-spec.md`
- `docs/specs/ligand-workflow-spec.md`
- `docs/specs/fragmap-controls-spec.md`

## 4. Validation Principles
- Run validation on production build only.
- Use measured timings (`performance.now`) over subjective judgment.
- Use median of 3 runs for timing scenarios unless otherwise specified.
- Capture evidence for both latest stable Chrome and latest stable Safari.
- Treat uncaught runtime errors as hard failures.

## 5. Test Environment Contract
Run mode:
- Build and serve production artifacts (no dev server timings).

Browser matrix:
- Latest stable Chrome.
- Latest stable Safari.

Environment recording requirements:
- OS version.
- Browser versions.
- Hardware summary (CPU, memory).
- Date/time of run.
- Git commit SHA.

Environment policy:
- Results are machine-specific; report exact environment in `docs/validation.md`.

## 6. Instrumentation Contract
Timing source:
- Primary: `performance.now()`.
- Fallback: manual stopwatch only if instrumentation is temporarily unavailable; mark results as fallback.

Instrumentation boundaries:
- AC-1 timer starts at viewer route mount and ends when protein + default crystal ligand (`3fly_cryst_lig`, shown as `Crystal Ligand`) are visible and viewer is interactive.
- AC-2 timer starts at map visibility toggle input event and ends when map visibility update is visually applied.
- AC-5 timer starts at per-map iso control input event on an iso-adjustable GFE map row and ends when the targeted map surface update is visually applied.

Camera preservation check (AC-2):
- Compare camera state before/after toggle using tolerance-based checks.
- Default tolerances: orientation delta <= 0.5 degrees, camera position delta <= 0.5% of camera-target distance, zoom delta <= 0.5%.

Error capture:
- Record uncaught exceptions and unhandled promise rejections during every scenario.

## 7. Scenario Definitions
### AC-1
Requirement:
- 3FLY and default crystal ligand (`3fly_cryst_lig`) load in <=5 seconds.

Scenario:
- Cold start viewer route in production build.

Run count:
- 3 runs per browser, median used for pass/fail.

Pass:
- Median <= 5000 ms in each browser.

### AC-2
Requirement:
- FragMap toggle updates in <200 ms and preserves camera state.

Scenario:
- Start from non-default camera orientation.
- Toggle representative maps on and off from both `Primary 3` and `Advanced`.
- Fixed representative map IDs for required runs:
  - `Primary 3`: `3fly.hbdon.gfe.dx`
  - `Advanced`: `3fly.mamn.gfe.dx`

Run count:
- 3 runs per tested map and browser; median used per map.

Pass:
- Median <200 ms per tested map in each browser.
- Camera preservation tolerances satisfied on each toggle.

### AC-3
Requirement:
- Pose visibility updates work per ligand without page reload.

Scenario:
- For selected ligand, cycle through pose visibility states: baseline-only, refined-only, both-visible, and both-hidden.

Pass:
- No page reload/navigation.
- State transitions happen in place.
- No uncaught runtime errors.

### AC-4
Requirement:
- Ligand switching updates available poses without page reload.

Scenario:
- Switch across featured and non-featured ligands.
- Verify pose controls update for selected ligand and remain functional.

Pass:
- No page reload/navigation.
- Pose visibility controls remain operational after switch.
- No uncaught runtime errors.

### AC-5
Requirement:
- Iso-value change updates surface in <200 ms.

Scenario:
- Make multiple maps visible.
- Change iso via per-map controls on iso-adjustable GFE map rows.
- Measure update for the targeted map row each run.

Run count:
- 3 runs per browser, median used for pass/fail.

Pass:
- Median <200 ms per run set in each browser.
- The targeted map reflects the updated iso state correctly on every run.
- `Exclusion Map` is excluded from AC-5 iso timing because its iso controls are disabled/non-editable by spec.

### AC-6
Requirement:
- No uncaught runtime errors during 5-minute exploratory session.

Scenario:
- 5-minute exploratory run covering map toggles, per-map iso edits, ligand switches, pose visibility transitions, and camera interactions.

Run count:
- 1 full run per browser minimum.

Pass:
- Zero uncaught runtime errors.
- Handled toasts/warnings are allowed if non-fatal and documented.

## 8. Reporting and Evidence Contract
Evidence file:
- `docs/validation.md` is required.

README integration:
- `README.md` must link to `docs/validation.md`.

Required sections in `docs/validation.md`:
- Environment summary.
- AC-by-AC results table.
- Raw timing samples and medians.
- Camera preservation checks for AC-2.
- Console/runtime error summary.
- Known limitations or anomalies.

Required AC results table fields:
- AC ID.
- Browser.
- Scenario name.
- Runs (ms).
- Median (ms) when applicable.
- Pass/Fail.
- Notes.

## 9. Failure Classification and Triage
Failure classes:
- `Performance regression`: threshold exceeded.
- `Behavioral regression`: scenario behavior mismatches spec.
- `Stability regression`: uncaught errors.
- `Environment issue`: external/local issue not attributable to app behavior.

Triage rules:
- Re-run once to rule out transient noise.
- If still failing, classify and document root-cause hypothesis.
- Do not mark final validation complete while any AC remains failing.

## 10. Exit Criteria
Validation is complete when:
- AC-1..AC-6 all pass per this spec.
- `docs/validation.md` is complete and committed.
- `README.md` includes a link to `docs/validation.md`.

## 11. Open Dependencies
- Implementation must expose or log sufficient timing hooks for AC-1, AC-2, and AC-5.
- Map-level iso update instrumentation must support all-visible-maps checks per run.
