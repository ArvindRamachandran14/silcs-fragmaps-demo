# AGENTS.md

## Purpose
This file defines how Codex should execute tasks in this repository.

## Project Context
- Primary objective: deliver the SILCS candidate exercise implementation.
- Prefer incremental, reviewable changes over large rewrites.

## Source Documents
- PRD and core exercise requirements: `docs/SilcsBio_Candidate_Exercise_Instructions.md`
- Reference PDF: `docs/SilcsBio_Candidate_Exercise_Instructions.pdf`

## Instruction Precedence (highest to lowest)
1. Explicit user request in the current thread
2. Constraints and guardrails in `AGENTS.md`
3. Feature specs / technical design decisions
4. PRD intent and acceptance criteria
5. Plan and task-breakdown docs

If sources conflict:
- Follow the higher-precedence source.
- Flag the conflict explicitly.
- Do not silently make high-impact assumptions.

## Engineering Guardrails
- Keep changes scoped to the request; avoid unrelated refactors.
- Preserve stable interfaces unless change is requested.
- Prefer backward-compatible behavior for file formats and outputs unless approved.
- Document behavior changes in the relevant docs when needed.

## Data and File Format Rules
- Treat approved input and output formats as spec-level constraints.
- Validate inputs explicitly and return actionable error messages.
- When multiple file format options exist, implement only the approved option(s) in the spec.

## Code Quality
- Prefer clear, maintainable implementations over clever shortcuts.
- Add or update tests for behavior changes.
- Cover edge cases in parsing, validation, and failure handling.

## Verification
Before marking work complete:
- Run relevant tests, lint, and type checks where available.
- Confirm implemented behavior matches acceptance criteria.
- Report what changed, what was validated, and residual risks.

## Response Format
When reporting completed work:
- Brief change summary
- Files changed
- Validation steps and outcomes
- Open questions or risks (if any)

## Out of Scope by Default
- Dependency or toolchain migrations unless explicitly requested.
- Formatting-only churn across unrelated files.
- Changes to unrelated components.
