# Phase 4: Strict Evaluation (MANDATORY)

Final evaluation of the entire implementation against spec.md. Binary PASS or FAIL.

## Prerequisites
- State: phase=integrate
- All increments have APPROVED verdicts

## Step 1: Run Final Gates

Dispatch an Evaluator subagent for strict evaluation:
- Task: "Phase 4 strict evaluation. Read .superteam/spec.md for all requirements and final acceptance gates. Run ALL final gate scripts via `node .cursor/skills/superteam/scripts/gate-runner.js final`. Check gate-results/final-integration.json. Verify all soft gates with evidence. Write verdict to .superteam/verdicts/strict-evaluation.md. Return binary PASS or FAIL with detailed report."

## Step 2: Handle Verdict

### On PASS
1. Record: append PASS to .superteam/strict-evaluations.jsonl
2. Transition to Phase 5

### On FAIL
1. Record: append FAIL to .superteam/strict-evaluations.jsonl
2. Count prior FAILs (read strict-evaluations.jsonl)
3. If FAIL count >= 3: escalate to user with all failure reports
4. Otherwise: dispatch Architect with failure report + progressive context
5. Architect creates targeted fix increments
6. Return to Phase 3 for those fix increments only
7. After fixes, re-run Phase 4 (fresh Evaluator)

## Progressive Context

Each restart cycle provides:
- All prior failure records from strict-evaluations.jsonl
- .superteam/lessons-learned.md
- Prior decisions from events.jsonl
- Instruction: "Do not repeat previously identified issues"

## Iteration Cap

Maximum 3 FAIL records. After 3 failures, present all accumulated context to user for manual intervention.

## Transition (on PASS)

```bash
node .cursor/skills/superteam/scripts/state-manager.js set phase=deliver
node .cursor/skills/superteam/scripts/record-event.js --actor orchestrator --type decision --summary "Phase 4 PASS, final evaluation complete"
```
