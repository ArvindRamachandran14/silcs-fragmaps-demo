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
- Use files in `/Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo/docs/screenshots` only as secondary corroboration.
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
- Project root: /Users/arvindramachandran/Dropbox/Development/SilcsBio_Exercise/silcs-fragmaps-demo
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

I now want to move on to revisting and potentially revising "Scope decision: include `3fly_cryst_lig` (display label `Crystal Ligand`) plus these 5 paired ligands:" 

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
1) Default viewer state: `3fly_cryst_lig` selected (display label `Crystal Ligand`), `baseline` pose selected, no FragMaps visible.
2) Initial visual baseline: fixed default camera orientation + protein cartoon representation.
3) Scope boundary: this spec covers only viewer stage lifecycle, layout, and navigation. Do not define ligand/map/iso behavior details here; those belong in later specs.
4) Load UX: explicit loading state during initial viewer load (protein + default crystal ligand), then normal interactive state.
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
4. Ligand scope in UI: `Crystal Ligand` (`3fly_cryst_lig`) + all provided ligands.
5. Default selected ligand is `3fly_cryst_lig` (display label `Crystal Ligand`).
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

1. Should **all FragMaps default to hidden** on viewer load? (recommended: yes)  
2. Do you want **per-map checkboxes** only, or checkboxes + quick actions (`Show all`, `Hide all`, `Reset defaults`)?  
3. Should iso be a **single global slider** for all visible maps, or per-map iso controls? (recommended: global)  
4. What iso slider contract do you want: **range, step, default** (or I define practical defaults)?  
5. When toggling a map on first time, should it **lazy-load + cache** and reuse thereafter? (recommended: yes)  
6. On map toggle, should camera always be **fully preserved** (position, zoom, orientation)? (recommended: yes)  
7. Do you want a fixed **map color/label legend** in-panel, and should labels match provided file names or friendly names?  
8. If map load fails, should behavior be **toast + disable only that map control**? (recommended: yes)  
9. Should toggling multiple maps be allowed with **no exclusivity** (any combination visible)? (recommended: yes)  
10. Should map surface style be fixed (wire/surface + opacity) or user-adjustable in v1? (recommended: fixed in v1)  
11. For AC-2, do you want this spec to include only behavior requirements, with timing protocol deferred to `docs/specs/performance-and-validation-spec.md`? (recommended: yes)  
12. On mobile, should map controls stay in the same collapsed controls panel pattern defined in `docs/specs/viewer-core-spec.md`? (recommended: yes)
