# M6 Preview Index - Overview Narrative + CTA + External Links

## M6 Scope Lock
- `M6` only.
- Includes overview page visual contract for:
  - heading,
  - exactly 1-2 narrative paragraphs,
  - primary `Go to Viewer` CTA placement,
  - required external link block including RCSB 3FLY link.
- Excludes:
  - runtime implementation,
  - viewer controls,
  - performance instrumentation,
  - M7/M8 work.

## Coverage Checklist
- [x] `Default` state: narrative + CTA + external links visible.
- [x] `Loading` state: non-blocking page loading/skeleton treatment.
- [x] `Empty` state: missing narrative content fallback with CTA preserved.
- [x] `Error` state: external link failure is non-blocking and CTA remains usable.
- [x] `Success` state: links and CTA are both available and page is ready.
- [x] Desktop mockup included.
- [x] Mobile mockup included.

## Artifact Matrix
| State | Desktop artifact | Mobile artifact | Notes |
|---|---|---|---|
| Default | `desktop/m6-overview-states.svg` (Panel A) | `mobile/m6-overview-states-mobile.svg` (Panel A) | Text-first contract baseline |
| Loading | `desktop/m6-overview-states.svg` (Panel B) | `mobile/m6-overview-states-mobile.svg` (Panel B) | CTA temporarily disabled |
| Empty | `desktop/m6-overview-states.svg` (Panel C) | `mobile/m6-overview-states-mobile.svg` (Panel C) | Narrative unavailable message |
| Error | `desktop/m6-overview-states.svg` (Panel D) | `mobile/m6-overview-states-mobile.svg` (Panel D) | Link failure note is non-blocking |
| Success | `desktop/m6-overview-states.svg` (Panel E) | `mobile/m6-overview-states-mobile.svg` (Panel E) | Full content + link and CTA ready |

## Open UI Questions
1. None currently.

## Traceability
- Plan refs: `docs/plans/execution-plan.md` (`M6` row and stop/go rules).
- Spec refs: `docs/specs/overview-page-spec.md` Sections 3, 4, 5, 6, and 9.

## Approval State
- Current: `PASS` (`APPROVED UI PREVIEW` received and Prompt B completed).
