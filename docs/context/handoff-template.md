# Agent Handoff Template

Use this template when handing work to the next agent.

## Overall Run Order
1. Pre-Handoff Update
2. Required Handoff Payload
3. Review Gate for New Agent Response
4. Copy-Paste Kickoff Prompt

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
3. Changed-file clusters (group related files so commits can be sequenced)
4. Validation commands run + outcomes
5. Residual risks/blockers for next handoff

Cluster requirements:
- Group changed files into practical commit sets (for example: `feature code`, `tests/validation`, `docs/context`, `handoff/process docs`).
- For each cluster include:
  - cluster name
  - file list
  - one-line rationale
  - suggested commit message
- If any changed file does not fit a cluster, list it under `unclustered` with reason.

Optional commit automation:
- If the user includes `COMMIT=YES`, stage and commit each cluster in order.
- For each cluster commit, output exact commands run:
  - `git add <files...>`
  - `git commit -m "<message>"`
- Do not include unrelated files in a cluster commit.
- If blocked (permissions/hooks/conflicts), report `ENV-BLOCKED` with exact rerun command.
```

### Optional Prompt: Pre-Handoff Update + Auto-Commit
```text
Run the Pre-Handoff Update process and enable commit automation.

Flag:
- COMMIT=YES

Commit policy:
- Stage and commit by cluster in this order:
  1) feature code
  2) tests/validation
  3) docs/context
  4) handoff/process docs
- Skip empty clusters.
- Never include unrelated files in a cluster commit.

Return format:
1. Files updated
2. What changed per file
3. Changed-file clusters
4. Validation commands run + outcomes
5. Commit commands run + commit hashes
6. Residual risks/blockers for next handoff
```

## 2) Required Handoff Payload (from current agent)
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

## 3) Review Gate for New Agent Response
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

## 4) Copy-Paste Kickoff Prompt
Use this prompt after the review gate passes; it enforces startup reads, milestone scope, validation rules, and required response format.

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

## 5) Reopen Milestone Protocol (Regression Fixes)
Use this when work must temporarily move back to an earlier milestone (for example, active M4 but M3 bug/fix required).

### Reopen Steps
1. Declare temporary target in `docs/context/next-agent-brief.md`:
   - `Temporary target: Mx regression fix`
   - reason, strict scope boundary, and return point (`back to Mn`).
2. Log reopen decision in `docs/context/decision-log.md`:
   - why reopening is required
   - alternatives considered
   - downstream risk
3. Implement the smallest possible fix scoped to the reopened milestone.
4. Re-run milestone validators in order up to reopened milestone:
   - `npm run validate:m1`
   - `npm run validate:m2`
   - ...
   - `npm run validate:mx`
5. Record outcomes in `docs/context/current-state.md` ledger as:
   - `PASS`, `FAIL`, or `ENV-BLOCKED` (with reason + rerun command).
6. Return `next-agent-brief.md` to the active forward milestone and list next concrete task.

### Prompt: Reopen Milestone Fix
```text
Temporarily reopen milestone Mx for a regression fix.

Required steps:
1. Update docs/context/next-agent-brief.md with:
   - Temporary target: Mx regression fix
   - Reason, scope boundary, and explicit return target
2. Append a decision entry in docs/context/decision-log.md explaining why Mx is reopened.
3. Implement only the minimal fix needed for Mx.
4. Run sequential validators up to Mx (validate:m1 ... validate:mx).
5. Append command outcomes to docs/context/current-state.md ledger with PASS/FAIL/ENV-BLOCKED.
6. Switch docs/context/next-agent-brief.md back to the forward milestone with next task.

Return format:
1. Reopen status: PASS/FAIL/ENV-BLOCKED
2. Files changed
3. Commands run + outcomes
4. Residual risks and whether return-to-forward-milestone is cleared
```
