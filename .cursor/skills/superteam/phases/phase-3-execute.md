# Phase 3: Execute Loop (AUTOMATED)

Implement each increment with Generator/Evaluator pairs.

## Prerequisites
- State: phase=execute
- .superteam/plan.md exists with frozen contracts
- Gate scripts in .superteam/scripts/increment-N/

## Execution Loop

For each increment N (following dependency order from plan.md):

### Step 1: Dispatch Generator

Dispatch the Generator subagent:
- Task: "Implement increment N. Read contract at .superteam/contracts/increment-N.md. Read prior attempts at .superteam/attempts/increment-N.md if retry. Read .superteam/lessons-learned.md and .superteam/knowledge/index.md. Implement, run pre-validation via `node .cursor/skills/superteam/scripts/gate-runner.js run N`, fix failures, commit changes. Return when ready for evaluation."

### Step 2: Dispatch Evaluator

Dispatch the Evaluator subagent:
- Task: "Verify increment N against contract .superteam/contracts/increment-N.md. Run gates via `node .cursor/skills/superteam/scripts/gate-runner.js run N`. Check gate-results/increment-N.json. Verify soft gates with evidence. Write verdict to .superteam/verdicts/increment-N.md. Return APPROVED, REVISE, or GATE-CHALLENGE."

### Step 3: Handle Verdict

- **APPROVED**: Update state, proceed to next increment
- **REVISE**: Write feedback to attempts/increment-N.md, redispatch Generator with feedback
- **GATE-CHALLENGE**: Dispatch Architect to review the challenged script, then re-evaluate

### Step 4: Update State

```bash
node .cursor/skills/superteam/scripts/state-manager.js set loop.current_increment=N
node .cursor/skills/superteam/scripts/state-manager.js set loop.completed_increments=M
node .cursor/skills/superteam/scripts/record-event.js --actor manager --type decision --summary "Increment N complete"
```

## Anomaly Detection

Monitor for:
- Consecutive REVISE verdicts > 2 on same increment → escalation ladder
- Increment taking > 2x average time → investigate
- 3+ GATE-CHALLENGE on same script → infrastructure issue

## 5-Strike Escalation Ladder

| Strike | Action |
|--------|--------|
| 1 | Retry with feedback (automatic) |
| 2 | Suggest different approach in Generator prompt |
| 3 | Context reset: fresh Generator with prior attempts |
| 4 | Dispatch Architect to split/simplify increment |
| 5 | Escalate to user (auth/access blockers only) |

## Transition

When all increments complete:
```bash
node .cursor/skills/superteam/scripts/state-manager.js set phase=integrate
node .cursor/skills/superteam/scripts/record-event.js --actor orchestrator --type decision --summary "Phase 3 complete, all increments done"
```
