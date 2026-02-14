# Overview Page Specification

## 1. Purpose
Define the required behavior, content, and acceptance checks for the `Home / Overview` route so implementation is consistent with:
- PRD requirements in `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/docs/SilcsBio_Candidate_Exercise_Instructions.md`
- Technical decisions in `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/docs/plans/technical-plan.md`

## 2. Scope
In scope:
- One text-first overview page at route `/`.
- A concise narrative (1-2 paragraphs total) that introduces the demo and explains the scientific context.
- A single primary call-to-action button that navigates to `/viewer`.
- External reference links relevant to 3FLY and SILCS background.

Out of scope:
- Interactive 3D rendering on the overview page.
- Data controls (ligand/map/iso controls).
- Performance acceptance criteria AC-1..AC-6 validation logic (covered in viewer and validation specs).

## 3. Route and Navigation Contract
- Route path: `/`
- Route label in UI: `Home` or `Overview` (either is acceptable if consistent with navigation labels).
- Primary CTA label: `Go to Viewer`
- Primary CTA destination: `/viewer`
- Primary CTA interaction: client-side route navigation (no full page reload).

## 4. Content Requirements
The page must use exactly 1-2 paragraphs and cover all required concepts below.

### Paragraph Structure Requirement
- Paragraph 1: open with product-oriented framing of the demo purpose, then transition into scientific context.
- Paragraph 2: focus mainly on scientific interpretation value, then close with product-oriented guidance on what users can do in the viewer.

### Required Concepts (from PRD)
Each item must be explicitly addressed in the narrative:
- What P38 MAP Kinase (PDB: 3FLY) is and why it is relevant in this demo.
- The crystal ligand context being shown (`3fly_cryst_lig`, displayed as `Crystal Ligand`).
- What SILCS FragMaps represent.
- Why FragMaps help interpret ligand binding / pose quality.
- What users can explore in the demo (ligand comparison, baseline vs refined pose interpretation, map-assisted inspection).

### Content Scope Constraint
- Include only required PRD concepts.
- Do not add medicinal-chemistry recommendations, docking/scoring claims, or new domain claims not needed for the PRD overview.

## 5. External Links
Overview page should include external references as standard links, placed below or alongside the narrative text:
- PDB 3FLY entry (RCSB): `https://www.rcsb.org/structure/3FLY`

Link behavior:
- Open in a new tab.
- Include clear text labels indicating destination.

## 6. Presentation and UX Requirements
- Text-first presentation: prioritize readable body text and CTA; no required hero image or figure.
- Keep visual complexity low; this page is explanatory, not control-heavy.
- Ensure the CTA is visually primary and discoverable without scrolling on typical laptop viewport heights.

## 7. Accessibility and Quality Requirements
- Page must contain a single clear top-level heading.
- Paragraph text must be readable with sufficient contrast against background.
- CTA must be keyboard-focusable and activatable via keyboard.
- External links must have meaningful, non-ambiguous link text.

## 8. Implementation Notes (Non-Binding)
Suggested component placement per technical plan:
- `HomePage.vue` renders `Heading`.
- `HomePage.vue` renders `1-2 paragraph narrative`.
- `HomePage.vue` renders `External links block`.
- `HomePage.vue` renders `Primary Go to Viewer CTA`.

## 9. Acceptance Checks (Spec-Level)
The overview page is accepted when all checks pass:
1. Navigating to `/` renders overview content with no runtime errors.
2. Narrative is 1-2 paragraphs and includes all required concepts in Section 4.
3. Primary button labeled `Go to Viewer` routes to `/viewer` without full page reload.
4. All required external links are present and functional.
5. Page remains text-first (no required interactive visualization elements).

## 10. Traceability
- PRD mapping: `2.A Overview / Introduction Page`.
- PRD mapping: `2.C Navigation / Structure`.
- Technical plan mapping: `System Architecture` -> `HomePage.vue`.
- Technical plan mapping: `Requirement-to-Implementation Mapping` -> Home/Overview narrative + links.
