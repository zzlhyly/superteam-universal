# Phase 2: Architect Phase (AUTOMATED)

Decompose approved spec into increments with frozen contracts and gate scripts.

## Prerequisites
- State: phase=architect
- .superteam/spec.md exists with status=approved

## Step 1: Dispatch Architect

Dispatch the Architect subagent:
- Task: "Read .superteam/spec.md (approved). Read .superteam/knowledge/ for codebase context. Decompose into increments. Write .superteam/plan.md with dependency graph. Create .superteam/contracts/increment-N.md for each increment. Create gate scripts in .superteam/scripts/increment-N/. Return when plan is ready and contracts are frozen."

## Step 2: Create Gate Scripts

If the Architect needs help creating gate scripts, dispatch a Generator subagent:
- Task: "Read .superteam/plan.md and contracts. Write verification scripts for all increments in .superteam/scripts/increment-N/ directories. Each script exits 0 on pass. Return list of created scripts."

## Step 3: Plan Verification

Dispatch the Plan Evaluator subagent (readonly):
- Task: "Independently verify that plan.md, contracts, and gate scripts fully cover spec.md. Check: all contracts exist and are frozen, all script dirs have gate files, every spec requirement is covered. Write verdict to .superteam/verdicts/plan-evaluation.md. Return APPROVED or REVISE with details."

On REVISE: Relay feedback to Architect, iterate. Max 3 REVISE cycles before escalating to user.

## Step 4: Transition

```bash
node .cursor/skills/superteam/scripts/state-manager.js set phase=execute
node .cursor/skills/superteam/scripts/state-manager.js set phase_step=init
node .cursor/skills/superteam/scripts/record-event.js --actor orchestrator --type decision --summary "Phase 2 complete, contracts frozen"
```
