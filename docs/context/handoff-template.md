# Agent Handoff Template

Use this template when handing work to the next agent.

## 1) Pre-Handoff Maintainer Checklist
- Ensure working state is intentional (`commit` or clearly documented uncommitted changes).
- Update:
  - `docs/context/current-state.md`
  - `docs/context/decision-log.md`
  - `docs/context/next-agent-brief.md`
- Record validation outcomes as `PASS`, `FAIL`, or `ENV-BLOCKED` (with reason).

### Prompt: Pre-Handoff Update
```text
You are the current agent preparing a handoff.

Before handoff, update these files:
- docs/context/current-state.md
- docs/context/decision-log.md
- docs/context/next-agent-brief.md

Requirements:
1. current-state.md:
   - refresh milestone status
   - append validation ledger entries with command + outcome
   - note any spec/plan divergences and open risks
2. decision-log.md:
   - append any behavior/architecture decisions made this session
   - include rationale and impacted files
3. next-agent-brief.md:
   - set exact active milestone
   - list prioritized next tasks
   - include exact commands the next agent should run

Output format:
1. Files updated
2. What changed per file
3. Validation commands run + outcomes
4. Residual risks/blockers for next handoff
```

## 2) Copy-Paste Kickoff Prompt
Use this prompt when handing work to the incoming agent; it enforces startup reads, milestone scope, validation rules, and required response format.

```text
You are taking over this repository.

Required startup order:
1. Read AGENTS.md.
2. Read docs/context/current-state.md.
3. Read docs/context/next-agent-brief.md.
4. Read docs/context/decision-log.md.
5. Read docs/plans/execution-plan.md and confirm milestone alignment.

Execution rules:
- Respect AGENTS.md precedence and guardrails.
- Work only on the active milestone scope from docs/context/next-agent-brief.md.
- If blocked by environment/tooling, report ENV-BLOCKED (not FAIL) with exact rerun command.
- Use local host-terminal validation output as authoritative evidence.

Before completing:
- Update current-state.md with status/evidence deltas.
- Append new decisions to decision-log.md.
- Refresh next-agent-brief.md with the next concrete step.

Return format:
1. Status: PASS/FAIL/ENV-BLOCKED
2. Files changed
3. Commands run + outcomes
4. Milestone gate checklist (pass/fail per item)
5. Context files updated summary
6. Residual risks/blockers
```

## 3) Required Handoff Payload (from current agent)
- Active milestone and scope boundary.
- Exactly what was completed in this handoff window.
- Exact command outputs summary (especially `validate:m*` commands).
- Known divergences from specs/plans.
- Immediate next step (single highest-priority item).

### Prompt: Generate Required Handoff Payload
```text
Produce a handoff payload for the next agent using this exact structure.

Required sections:
1. Active milestone and scope boundary
2. Completed work in this handoff window
3. Validation commands and outcomes (PASS/FAIL/ENV-BLOCKED)
4. Files changed
5. Known divergences from specs/plans
6. Immediate next step (single highest-priority action)

Rules:
- Keep it factual and concise.
- Include exact command names and outcomes.
- Include file paths for all changed files.
```

## 4) Review Gate for New Agent Response
- Confirms startup files were read.
- Confirms active milestone before coding.
- Includes concrete validation evidence.
- Updates all three context files.
- Calls out residual risks/open blockers explicitly.

### Prompt: Review/QA Handoff Response
```text
Review the incoming agent response and determine if handoff quality is acceptable.

Pass criteria:
1. Confirms AGENTS.md + context files + execution plan were read.
2. Confirms active milestone and scope.
3. Provides command-based validation evidence with outcomes.
4. Updates all required context files:
   - docs/context/current-state.md
   - docs/context/decision-log.md
   - docs/context/next-agent-brief.md
5. Lists residual risks/blockers and next concrete step.

Return format:
- Handoff QA status: PASS/FAIL
- Checklist with pass/fail per criterion
- Missing items (if any)
- Required fixes before acceptance
```
