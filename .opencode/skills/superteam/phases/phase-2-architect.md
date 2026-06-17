# Phase 2: Architect Phase (AUTOMATED)

Decompose approved spec into increments with frozen contracts and gate scripts.

## Prerequisites

- State: `phase=architect`
- `.superteam/spec.md` exists with `status=approved`
- Read `.opencode/skills/superteam/phases/phase-2-architect.md` before starting

## Step 1: Dispatch Architect

Spawn the Architect subagent:

```typescript
task(
  description="Architect - Plan Decomposition",
  prompt="Read .superteam/spec.md (approved). Read .superteam/knowledge/ for codebase context. Decompose into increments. Write .superteam/plan.md with dependency graph. Create .superteam/contracts/increment-N.md for each increment. Create gate scripts in .superteam/scripts/increment-N/. Return when plan is ready and contracts are frozen."
)
```

Each contract uses the 4-tier verification structure: preconditions, hard gates, soft gates, invariants.

## Step 2: Create Gate Scripts

If the Architect needs help creating gate scripts, spawn a Generator subagent:

```typescript
task(
  description="Generator - Increment Gate Scripts",
  prompt="Read .superteam/plan.md and contracts. Write verification scripts for all increments in .superteam/scripts/increment-N/ directories. Each script exits 0 on pass. Return list of created scripts."
)
```

Example gate scripts live at `.opencode/skills/superteam/scripts/increment-1/` as templates.

## Step 3: Plan Verification

Spawn the Plan Evaluator subagent (readonly):

```typescript
task(
  description="Plan Evaluator - Independent Review",
  prompt="Independently verify that plan.md, contracts, and gate scripts fully cover spec.md. Check: all contracts exist and are frozen, all script dirs have gate files, every spec requirement is covered. Write verdict to .superteam/verdicts/plan-evaluation.md. Return APPROVED or REVISE with details."
)
```

On **REVISE**: Relay feedback to Architect, iterate. Max 3 REVISE cycles before escalating to user.

## Step 4: Mutation Protocol

If plan changes are needed after contracts are frozen:

1. Record mutation in `events.jsonl`
2. Increment plan version in `plan.md` frontmatter
3. Re-run Plan Evaluator verification
4. Never modify contracts without re-verification

## Step 5: Transition

```bash
node .opencode/skills/superteam/scripts/state-manager.js set phase=execute
node .opencode/skills/superteam/scripts/state-manager.js set phase_step=init
node .opencode/skills/superteam/scripts/record-event.js --actor orchestrator --type decision --summary "Phase 2 complete, contracts frozen"
```

## Key Files

| File | Purpose |
|------|---------|
| `.superteam/plan.md` | Architecture plan with dependency graph |
| `.superteam/contracts/increment-N.md` | Frozen increment contracts |
| `.superteam/scripts/increment-N/` | Per-increment gate scripts |
| `.superteam/verdicts/plan-evaluation.md` | Plan Evaluator verdict |

## Notes

- Contracts are frozen after Plan Evaluator APPROVED
- Gate scripts must be deterministic (0 LLM tokens for hard gates)
- See `.opencode/skills/superteam/task-forms/engineering/FORM.md` for decomposition guidance
