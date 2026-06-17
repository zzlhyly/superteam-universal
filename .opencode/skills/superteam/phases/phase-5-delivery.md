# Phase 5: Delivery (AUTOMATED - TERMINAL)

Extract knowledge and present results to user.

## Prerequisites

- State: `phase=deliver`
- Phase 4 PASS achieved
- Read `.opencode/skills/superteam/phases/phase-5-delivery.md` before starting

## Step 1: Dispatch Curator

Spawn the Curator subagent:

```typescript
task(
  description="Curator - Knowledge Extraction",
  prompt="Session complete. Read all .superteam/ artifacts (knowledge/, lessons-learned.md, events.jsonl, attempts/, metrics.md). Extract reusable knowledge. Apply value filter: not already known, cost significant time, likely encountered again, durable. Write verified items to ~/.superteam/ global wiki. Return summary of what was persisted and what was skipped."
)
```

## Step 2: Value Gate (4-Step Filter)

Before persisting knowledge to the global wiki, Curator applies:

1. **Novelty**: Not already in `~/.superteam/` or session knowledge
2. **Cost**: Discovery took significant time or effort
3. **Recurrence**: Likely to be encountered again in future sessions
4. **Durability**: Will remain valid (not version-specific hacks)

Skip items that fail any filter. Log skipped items with rationale.

## Step 3: Present Results

Compile delivery report for user:

- Summary of what was implemented
- All increments and their verdicts
- Gate results from Phase 4
- Knowledge extracted to global wiki
- Metrics (time, iterations, anomalies from `metrics.md`)

## Step 4: Finalize

```bash
node .opencode/skills/superteam/scripts/state-manager.js set phase=complete
node .opencode/skills/superteam/scripts/record-event.js --actor orchestrator --type decision --summary "Phase 5 complete, session finished"
```

## State Files Summary

| File | Purpose |
|------|---------|
| `.superteam/state.json` | Pipeline state |
| `.superteam/events.jsonl` | Append-only event log |
| `.superteam/spec.md` | Approved requirements |
| `.superteam/plan.md` | Architecture plan |
| `.superteam/contracts/` | Frozen increment contracts |
| `.superteam/scripts/` | Gate verification scripts |
| `.superteam/attempts/` | Implementation attempt records |
| `.superteam/verdicts/` | Evaluation verdicts |
| `.superteam/gate-results/` | Gate execution results |
| `.superteam/knowledge/` | Accumulated knowledge |
| `.superteam/lessons-learned.md` | Cross-increment discoveries |
| `.superteam/metrics.md` | Performance data |
| `.superteam/strict-evaluations.jsonl` | Phase 4 verdict log |
| `~/.superteam/` | Global wiki (cross-project) |

## Notes

- Phase 5 is terminal — no further pipeline phases after completion
- User must explicitly acknowledge delivery before session is considered done
- Update `WORKFLOW_STATE.md` with final status before closing
