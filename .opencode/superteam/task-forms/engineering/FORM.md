---
name: "engineering"
description: "Linear increment execution with Generator/Evaluator pairs for code-centric tasks"
phases: [pm, architect, execute, integrate, deliver]
max_parallel_pairs: 2
termination: "all increments complete + final acceptance gates pass"
---

## Roles

| Role Name | Agent Definition | Lifecycle | Description |
|---------- |---------------- |---------- |------------|
| Generator | `generator.md` | Fresh per increment | Contract-driven implementation |
| Evaluator | `evaluator.md` | Fresh per increment | Independent 4-tier verification |

## PM Guidance

When the user's request includes testing on infrastructure:

- **Execution FRs must use explicit execution language** ("must be EXECUTED and PASS")
- **Hard gates must verify execution evidence files**, not grep test source code
- **Must explicitly state**: "gates must verify EXECUTION EVIDENCE, not source code patterns"

## Architect Guidance

**Decomposition strategy**: Feature-slice increments. Each increment delivers one coherent capability that can be independently verified.

**Contracts**: Each increment gets a frozen contract at `contracts/increment-N.md` using the standard 4-tier verification structure:

- **Preconditions**: Scripts that must pass before Generator starts
- **Hard Gates**: Deterministic scripts with binary pass/fail (0 LLM tokens)
- **Soft Gates**: Evidence-backed criteria requiring Evaluator judgment
- **Invariants**: Universal quality bar (tests pass, lint clean, types check)

**Execution testing increments**: When testing requires infrastructure, the increment type must be 'execution-testing'. Contracts must:
- Require Generator to EXECUTE tests/workflows and write evidence to `.superteam/execution-evidence/`
- Hard gates check evidence files, NOT grep test source code

## Manager Guidance

**State machine**: Linear increment execution with optional parallelism (up to `max_parallel_pairs` concurrent pairs).

**Execution loop**:
1. Detect increment completion (Evaluator writes APPROVED verdict)
2. Request next increment's Generator spawn
3. If parallel increments available and slot free, request additional spawns

**Health heuristics**: Use the standard 5-strike escalation ladder. Monitor:
- Consecutive failures on same increment
- Iteration count trends
- Time-per-increment trends
- Generator/Evaluator communication health

**Anomaly detection**: If increment exceeds 5 revision cycles without progress, escalate to Architect for contract review.

## Spawn Sequence

### Step 1: Spawn Generator

Manager (or Architect after GATE-CHALLENGE) spawns Generator:

```typescript
task(
  category="unspecified-high",
  load_skills=[],
  run_in_background=false,
  description=`Generator - Increment ${N}`,
  prompt=`You are the Generator for increment ${N}.

Read these files:
- contracts/increment-${N}.md (your contract)
- attempts/increment-${N}.md (prior attempts, if retry)
- lessons-learned.md (accumulated knowledge)

Your task:
1. Read and understand the contract
2. Implement the increment
3. Run pre-validation (gate scripts)
4. Fix any failures
5. Commit changes
6. Request evaluation

Use gate-runner.js to validate:
node scripts/gate-runner.js run ${N}
`
)
```

### Step 2: Generator implements

Generator reads contract, implements increment, runs pre-validation (`node scripts/gate-runner.js run N`), fixes failures, commits changes.

### Step 3: Spawn Evaluator

Generator or Manager spawns Evaluator:

```typescript
task(
  category="unspecified-high",
  load_skills=[],
  run_in_background=false,
  description=`Evaluator - Increment ${N}`,
  prompt=`You are the Evaluator for increment ${N}.

Read these files:
- contracts/increment-${N}.md (the contract)
- The implementation files (what Generator created)

Your task:
1. Run hard gates: node scripts/gate-runner.js run ${N}
2. Verify soft gates with evidence
3. Check invariants
4. Issue verdict: APPROVED, REVISE, or GATE-CHALLENGE

Write verdict to verdicts/increment-${N}.md
`
)
```

### Step 4: Evaluator verifies

Evaluator runs 4-tier verification against the frozen contract:
1. Preconditions (scripts)
2. Hard gates (deterministic scripts via `gate-runner.js`)
3. Soft gates (evidence-backed LLM review)
4. Invariants (hook-enforced)

Issues verdict: **APPROVED**, **REVISE**, or **GATE-CHALLENGE**

### Step 5: On APPROVED

1. Evaluator writes verdict to `verdicts/increment-N.md`
2. Generator writes lessons to `lessons-learned.md`
3. Manager detects completion, requests next increment's Generator

### Step 6: On REVISE

1. Evaluator writes verdict and feedback to `attempts/increment-N.md`
2. Generator reads feedback, fixes issues
3. Generator re-validates and requests re-evaluation

### Step 7: On GATE-CHALLENGE

1. Evaluator writes verdict identifying challenged script
2. Orchestrator forwards to Architect for script review
3. Architect reviews and fixes (or confirms) the script
4. Re-evaluation from Step 4

## Verification Pattern

**Inner loop (per increment)**: 4-tier contract verification as described in Spawn Sequence.

**Outer loop (project-level)**: Final acceptance gates from `spec.md` run in Phase 4 (Integration).

## State Files

Uses standard `.superteam/` files:
- `state.json` - Pipeline state
- `metrics.md` - Phase timing, per-increment metrics
- `events.jsonl` - Append-only event stream
- `contracts/` - Frozen contracts
- `attempts/` - Implementation attempts
- `verdicts/` - Evaluation verdicts
- `gate-results/` - Gate execution results
