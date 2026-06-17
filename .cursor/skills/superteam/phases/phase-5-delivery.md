# Phase 5: Delivery (AUTOMATED - TERMINAL)

Extract knowledge and present results to user.

## Prerequisites
- State: phase=deliver
- Phase 4 PASS achieved

## Step 1: Dispatch Curator

Dispatch the Curator subagent:
- Task: "Session complete. Read all .superteam/ artifacts (knowledge/, lessons-learned.md, events.jsonl, traces/, attempts/, metrics.md). Extract reusable knowledge. Apply value filter: not already known, cost significant time, likely encountered again, durable. Write verified items to ~/.superteam/ global wiki. Return summary of what was persisted and what was skipped."

## Step 2: Present Results

Compile delivery report for user:
- Summary of what was implemented
- All increments and their verdicts
- Gate results from Phase 4
- Knowledge extracted
- Metrics (time, iterations, anomalies)

## Step 3: Finalize

```bash
node .cursor/skills/superteam/scripts/state-manager.js set phase=complete
node .cursor/skills/superteam/scripts/record-event.js --actor orchestrator --type decision --summary "Phase 5 complete, session finished"
```

## State Files Summary

| File | Purpose |
|------|---------|
| .superteam/state.json | Pipeline state |
| .superteam/events.jsonl | Append-only event log |
| .superteam/spec.md | Approved requirements |
| .superteam/plan.md | Architecture plan |
| .superteam/contracts/ | Frozen increment contracts |
| .superteam/scripts/ | Gate verification scripts |
| .superteam/attempts/ | Implementation attempt records |
| .superteam/verdicts/ | Evaluation verdicts |
| .superteam/gate-results/ | Gate execution results |
| .superteam/knowledge/ | Accumulated knowledge |
| .superteam/lessons-learned.md | Cross-increment discoveries |
| .superteam/metrics.md | Performance data |
| .superteam/strict-evaluations.jsonl | Phase 4 verdict log |
