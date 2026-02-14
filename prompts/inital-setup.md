# Product Requirement Document (PRD)

I am staring a project to build an Interactive Visualization Demo for P38 MAP Kinase (PDB: 3FLY) Using SILCS FragMaps. The SILCS FragMaps technology has been developed by the company SilcsBio (url - https://silcsbio.com).

This project is part of their interview process for a the Applications Scientist -- Scientific Software Development role. I have the instructions for this project in the file docs/SilcsBio\_Candidate\_Exercise\_Instructions.pdf

I want to start by creating a product requirement document (prd) and the instructions file is a good starting point. Please convert it to a .md file and put it in docs. I will then edit the prd to clarify the goals of the project.

---

Audit this PRD and tell me what else would need to go in there to clearly define the problem, goals, user outcomes, constraints, acceptance criteria.

---

I made some changes to PRD. Please conduct another audit to see if there has been improvments and tell me if more changes are needed

# Technical Plan

Create a prompt to create a technical plan for this PRD

---

Create a decision-complete technical implementation plan for the PRD at: docs/SilcsBio_Candidate_Exercise_Instructions.md and save it as docs/technical-plan.md

Constraints:
- Plan only. Do not write or modify code/files.
- Use the PRD as the authoritative source of truth.
- Use the SilcsBio interactive demo (url https://landing.silcsbio.com/newlandingpage) only as a reference for UX patterns and interaction ideas, not as a requirements source.
- Prioritize meeting Acceptance Criteria AC-1 through AC-6.

Output format (required):
1. Executive Summary
2. Technical Approach
3. System Architecture
4. Data & File Handling Plan (.pdb, .sdf, .map/.dx)
5. Viewer/Library Selection Rationale (with tradeoffs)
6. Detailed Implementation Phases (time-boxed milestones)
7. Requirement-to-Implementation Mapping
8. Acceptance Criteria Test Plan (explicit AC-1..AC-6 mapping)
9. Risks, Unknowns, and Mitigations
10. Deliverables Checklist
11. Out-of-Scope Guardrails

Quality bar:
- Be specific enough that another engineer can implement without making design decisions.
- Include concrete interfaces/components, state model, and interaction flows.
- Include performance strategy for <200 ms interactions.
- Include local validation steps and final demo readiness checks.

---

Investigate the frontend technology stack used by [https://landing.silcsbio.com/newlandingpage](https://landing.silcsbio.com/newlandingpage). Please run a live click-through of the Next flow in-browser to do this investigation 

Requirements:
- Primary evidence must come from live-site technical signals (HTML source, script bundles, meta tags, framework/runtime fingerprints, network/static asset patterns).
- Use files in `docs/screenshots` only as secondary corroboration.
- Do not treat visual style alone as proof of stack.

Output format:
1. Most likely frontend stack (framework, build tool, UI/CSS approach, hosting/CDN if inferable).
2. Evidence table: `signal | observation | implication`.
3. Confidence score (0–100) with brief rationale.
4. Alternative hypotheses (max 2) and why they are less likely.
5. Unknowns and exact next checks to raise confidence.

Constraints:
- Distinguish confirmed facts vs inference.
- If evidence is insufficient, state that explicitly instead of over-claiming.

---

You are a computational chemistry + web-visualization architect.

Context:
- Project root: repository root
- Available data includes protein (.pdb), ligands (.sdf and some .pdb), and FragMaps (.dx and .map).
- Target app behavior: fast interactive visualization with ligand switching, pose toggles, FragMap toggles, and iso-value updates.
- Constraints: client-side app, no backend, prioritize scientific correctness and interactive performance.

Task:
Decide the optimal file format per data category for this project:
1) protein
2) ligands (baseline/refined)
3) FragMaps

Output requirements:
1. Final recommendation table: category | chosen format | reason | fallback format
2. Tradeoff analysis (accuracy, interoperability, runtime performance, parsing complexity)
3. Risks of each chosen format and mitigations
4. Explicit implementation policy:
   - which format is “runtime primary”
   - which formats are “retained but not parsed”
5. Confidence score (0-100) with brief rationale

Important:
- Prefer decisions that are practical for this exact repo and dataset.
- If a format is more accurate in theory but not practical here, say that explicitly.

--- 

I now want to move on to revisting and potentially revising "Scope decision: include `crystal` ligand plus these 5 paired ligands:" 

Do achieve the goals outlined in docs/SilcsBio_Candidate_Exercise_Instructions.pdf, what is the best strategy? Should be have 5 pre selected ligands or have the user choose any of the 30 ligands? SHould we have a drop down to choose from the 30? Maybe with autocomplete suggestions for names? I think including an option to choose the file form local computer is an overkill? What are your thoughts?

# Spec Documents 

Let's create one spec doc at a time. What open questions do you have to prepare overview-page-spec.md?

---

## Overview Page

Here are specific decisions to make the overview-page-spec.md file

1. Narrative style: Start with product style narrative to introduce the product, then focus on scientific narrative - this is the major part of the overview page, then back to the product to explain what the user can do or explore in the demo
2. Length target: 1–2 paragraphs only 
3. Content scope: include only required concepts from PRD
4. CTA behavior: single primary button `Go to Viewer` to `/viewer` 
5. Reference links: include external links (e.g., PDB 3FLY / SILCS docs) 
6. Visual requirements: text-first spec

--- 

## Viewer Core

Create `docs/specs/viewer-core-spec.md` as an implementation-ready spec.

Follow instruction precedence from `AGENTS.md`. Use `docs/plans/technical-plan.md` as technical design input and cross-check against `docs/SilcsBio_Candidate_Exercise_Instructions.md`.

Use `docs/screenshots/GUI_Layout.png` as the visual guide for layout decision #6 (structure and emphasis), while keeping scope aligned to PRD + technical plan.

Lock these decisions:
1) Default viewer state: crystal ligand selected, `baseline` pose selected, no FragMaps visible.
2) Initial visual baseline: fixed default camera orientation + protein cartoon representation.
3) Scope boundary: this spec covers only viewer stage lifecycle, layout, and navigation. Do not define ligand/map/iso behavior details here; those belong in later specs.
4) Load UX: explicit loading state during initial viewer load (protein + default ligand), then normal interactive state.
5) Error UX: non-blocking toast + disable affected control; no persistent inline error panel in v1.
6) Layout contract: top bar + viewport-dominant two-column desktop layout (`NglViewport` + `ControlsPanel`), with responsive mobile behavior where controls collapse and viewport stays primary. Base this on the layout direction shown in `docs/screenshots/GUI_Layout.png` (large central viewport, controls panel on the side, minimal top navigation).

Include:
- Purpose, scope, out-of-scope
- Route/layout contracts
- Stage lifecycle contract (init, ready, cleanup, resize)
- Default state contract
- Loading/error states
- Accessibility/usability constraints
- Spec-level acceptance checks
- Traceability back to PRD + technical plan

--- 

## Ligand Workflow

Create `docs/specs/ligand-workflow-spec.md` as an implementation-ready spec.

Follow instruction precedence from `AGENTS.md`.

Source of truth:
1) `docs/plans/technical-plan.md`
2) `docs/SilcsBio_Candidate_Exercise_Instructions.md`
Use these as UI reference guides (structure only, not feature-complete scope):
- `docs/screenshots/GUI_ligand_analysis.png`
- `docs/screenshots/GUI_ligand_dropdown.png`
- `docs/screenshots/ligand-controls-wireframe-collapsed-square.svg.png`
- `docs/screenshots/ligand-controls-wireframe-expanded-square.svg.png`

Lock these decisions:
1. Ligand UI is in the right panel and focused on ligand selection/pose visibility only.
2. Remove GFE analysis section from this workflow (out of scope).
3. Ligand selection uses `featured quick-picks + searchable dropdown`.
4. Ligand scope in UI: crystal + all provided ligands.
5. Default selected ligand is the bound crystal ligand.
6. Pose controls use checkboxes (not radio/segmented).
7. Users can view baseline only, refined only, both, or both unchecked.
8. If both unchecked, define a clear empty-state message and recovery action in the ligand panel.
9. Camera is preserved on ligand switch.
10. Include explicit `Zoom` action to focus selected ligand.
11. `Frame` control is out of scope.
12. No local file upload controls in v1.
13. Runtime format policy for ligands: `.sdf` primary with `.pdb` fallback per pose, per technical plan.
14. Error behavior: non-blocking toast + disable affected control item.
15. Switching ligands/pose visibility must be in-place without page reload.

Define explicit visual differentiation rules for comparison mode (both poses checked):
- Baseline is de-emphasized (thinner + lower opacity).
- Refined is emphasized (thicker + higher opacity).
- Include a small in-panel legend so users can interpret baseline vs refined consistently.

Include these sections:
- Purpose
- Scope / Out of Scope
- Data and State Contracts (including `PoseKind` and `visiblePoseKinds: PoseKind[]`)
- Layout and Control Organization
- Default State Contract
- Interaction Flows (select ligand, toggle baseline/refined/both/none, zoom)
- Loading/Error/Empty States
- Accessibility and Usability Constraints
- Spec-Level Acceptance Checks
- Traceability to PRD and technical plan
- Open Dependencies (what remains for fragmap and performance specs)
 
---

## FragMaps 

Create `docs/specs/fragmap-controls-spec.md` as an implementation-ready spec.

Follow instruction precedence from `AGENTS.md`.
If any source conflicts with this prompt, follow this prompt and explicitly flag the conflict in the spec (do not silently resolve).

Primary sources:
1. `docs/plans/technical-plan.md`
2. `docs/SilcsBio_Candidate_Exercise_Instructions.md`
3. `docs/specs/viewer-core-spec.md`
4. `docs/specs/ligand-workflow-spec.md`

UI reference sources:
1. `docs/screenshots/GUI/GUI_fragmaps.png`
2. `docs/screenshots/Ideas/fragmap-primary3-advanced-per-map-iso.svg` (canonical)
3. `docs/screenshots/Ideas/fragmap-primary3-advanced-per-map-iso.png` (preview)

Lock these product decisions:
1. FragMap controls are in the right panel, viewport remains dominant.
2. Control model is `Primary 3 + Advanced full list`.
3. Primary 3 rows are always visible: `Generic Donor`, `Generic Acceptor`, `Generic Apolar`.
4. Advanced section is expandable and contains the remaining provided 3FLY maps (full coverage retained).
5. Visibility is per-map checkbox, multi-select, any combination allowed.
6. Default state on viewer load: all FragMaps hidden.
7. Include quick actions: `Hide all`, `Reset defaults`, `Reset view`.
8. Preserve camera on map toggle and iso edits; only `Reset view` can change camera.
9. No global iso control. Use per-map iso controls only.
10. Each map row has per-map iso controls (`-`, value, `+`) similar to `GUI_fragmaps.png`.
11. Each map has independent default iso and current iso state.
12. No local upload controls in v1.
13. Friendly labels in UI; raw filenames are implementation detail only.
14. Include UI constraints so labels do not overlap and controls never overflow panel bounds.
15. Mobile behavior follows `viewer-core-spec.md` collapsed-controls pattern.

Lock these robustness/reliability decisions (based on prior `dev-AR` failure analysis):
1. Lazy-load each map on first toggle.
2. Cache loaded map component/representation handles for reuse.
3. Do in-place visibility updates; do not clear/rebuild all surfaces on each toggle.
4. Add async race protection for rapid toggle/iso edits (request-id or single-flight guard).
5. Per-map failure isolation: toast + disable only failed map row + retry action.
6. Keep previously valid visible maps stable when one map load fails.

Include a brief “why this strategy is more robust” section:
1. Prior approach issues: heavy eager preload, global clear/rebuild per toggle, race-prone async updates, weak error isolation.
2. New approach benefits: lower latency, better reliability, stable camera/context, per-map fault isolation.

Required spec sections:
1. Purpose
2. Scope / Out of Scope
3. Map Inventory and Label Contract
4. Layout and Control Organization
5. State and Data Contracts
6. Default State Contract
7. Interaction Flows (toggle, bulk actions, per-map iso edit, reset actions)
8. Loading/Caching Strategy
9. Concurrency and Reliability Guardrails
10. Error and Empty States
11. Accessibility and Usability Constraints
12. Spec-Level Acceptance Checks
13. Traceability to PRD and technical plan
14. Open Dependencies

Acceptance checks must explicitly cover:
1. AC-2 behavior intent: map show/hide fast and camera preserved.
2. AC-5 behavior intent: per-map iso updates are fast and only affect intended map surfaces.
3. No page reload for map toggles, bulk actions, or iso edits.
4. Primary 3 + Advanced behavior works with full provided map set.


## Performance and Validation Spec

What is the point of this spec foc, when AC-1 thorugh AC-6 is already defined in the technical plan

---

Got it. Do you have any open questions to make performance-and-validation-spec.md?

---

Got it. Please go ahead and make docs/specs/performance-and-validation-spec.md

## Audit Spec Docs 

Help me create a prompt to do a through audit of all the spec docs in docs/specs. 

We want to make sure all the features are well defined and implementation-ready

We also want to ensure there are no conflicts between the files in docs/specs amd docs/plans

--- 

Updated version with relative paths only:

```text
You are a senior technical program architect doing a documentation audit.

Repository root:
Current working directory (use relative paths only).

Audit scope:
1) All spec docs in `docs/specs`
2) All planning docs in `docs/plans`

Goal:
- Verify every feature in `docs/specs` is clearly defined and implementation-ready.
- Detect and report any conflicts between `docs/specs` and `docs/plans`.

Instructions:
1) Read all files in both directories before concluding anything.
2) Build a feature inventory from `docs/specs` (feature name, owner/module, status).
3) For each feature, assess implementation readiness using this checklist:
   - Problem statement and scope are explicit
   - Functional requirements are testable
   - Inputs/outputs and data contracts are defined
   - Error states and edge cases are defined
   - Non-functional requirements are stated (performance, reliability, security, usability)
   - Dependencies and assumptions are listed
   - Acceptance criteria are measurable
   - Open questions/unknowns are explicitly called out
4) Cross-check each spec item against `docs/plans` for:
   - Scope mismatches
   - Contradictory behavior
   - Timeline/dependency conflicts
   - Naming/terminology inconsistencies
   - Missing implementation tasks for required features
5) Do not rewrite docs. Produce an audit report with exact file references.

Output format (strict):
A) Executive summary (5-10 bullets)
B) Readiness scorecard table:
   - Columns: Feature | Spec File | Ready? (Yes/Partial/No) | Gaps | Severity (High/Med/Low)
C) Conflict report table:
   - Columns: Conflict ID | Spec Reference | Plan Reference | Conflict Type | Why It Matters | Recommended Resolution
D) Missing-definition list:
   - Prioritized by implementation risk
E) Recommended edits:
   - Concrete, minimal wording suggestions per file
F) Final gate decision:
   - “Implementation-ready” or “Not implementation-ready”
   - If not ready, list top 5 blockers

Rules:
- Cite every finding with relative path + section heading (or nearest line reference).
- Use only relative paths in all outputs (for example, `docs/specs/viewer-core-spec.md`).
- Be explicit about assumptions.
- If something is ambiguous, mark it as ambiguity (not fact).
- Prioritize high-risk gaps and conflicts first.

--- 

Apply the recommended edits 

--- 

Use the one canonical internal ID 3fly_cryst_lig. Display label should be bound ligand. Ensure this is set consistently across all relevant files in the repo

--- 

Set default iso values for each map type based on the values in docs/screenshots/GUI/GUI_fragmaps_isovalues_default.png

# Execution Plan 

First let's make a prompt to create this execution-plan.md. Besides what you already mentioned, it should have a clear order of features to implement, and how to test each feature before moving on to the next.

--- 

Create `docs/plans/execution-plan.md` as a concrete implementation runbook for this project.

Context:
- Project root: repository root
- Specs: `docs/specs/*.md`
- Technical plan: `docs/plans/technical-plan.md`
- PRD: `docs/SilcsBio_Candidate_Exercise_Instructions.md`

Requirements:
1. Read all spec docs and `docs/plans/technical-plan.md` before drafting.
2. Define a strict, dependency-aware feature execution order.
3. For each feature/milestone, define exactly how to validate it before moving to the next.
4. Include explicit gating: no milestone starts until prior milestone exit criteria pass.
5. Keep scope aligned with current specs and technical plan only (no new feature scope).

Mandatory feature order to use:
1. Project scaffold + routing foundation (`/`, `/viewer`)
2. Data manifest + asset pipeline + startup data validation
3. Viewer core lifecycle/layout/default state/error fallback
4. Ligand workflow (featured + searchable list, 4 pose visibility states, zoom, empty/error handling)
5. FragMap controls (Primary/Advanced sections, per-map toggles, per-map iso, exclusion-map behavior, retry/failure isolation)
6. Overview page narrative + CTA + external links behavior
7. Performance instrumentation + AC-1..AC-6 validation evidence (`docs/validation.md`)
8. Hardening, final regression pass, README/deploy readiness

Output format (strict):
1. Execution strategy summary (5-8 bullets)
2. Milestone dependency diagram (text or mermaid)
3. Ordered milestone table with columns:
   - Milestone ID
   - Feature scope
   - Depends on
   - Implement first (files/modules)
   - Test/validation steps
   - Exit gate (pass/fail criteria)
   - Risks and mitigations
4. “Stop/Go” checklist to run before advancing from each milestone
5. AC coverage matrix (AC-1..AC-6 mapped to milestone + validation step)
6. Open assumptions and unresolved decisions

Quality bar:
- Make each milestone implementation-ready (another engineer should execute without guessing).
- Test steps must be explicit and measurable (not generic).
- Include both functional checks and failure-path checks.
- Call out ambiguity as ambiguity; do not invent hidden requirements.
