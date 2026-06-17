---
name: superteam
description: "Multi-agent orchestration system for complex tasks. Use when a task requires coordination across multiple specialists, spans 3+ files, or can be decomposed into independent subtasks."
disable-model-invocation: false
---

# Superteam Multi-Agent Orchestration

## When to Use

- Feature spans 3+ files
- Requires multiple expertise areas (architecture, implementation, testing)
- Task can be decomposed into independent subtasks
- User explicitly requests multi-agent orchestration

## Quick Start

Invoke the workflow:
```
/superteam Build a rate-limited job queue with Redis
```

Or use specialist subagents:
```
@orchestrator coordinate the implementation
@pm gather requirements for this feature
@architect create an implementation plan
```

## Workflow Phases

### Phase 1: PM (Requirements)
1. Explore codebase to understand existing patterns
2. Ask clarifying questions (max 5 at a time)
3. Generate `.superteam/spec.md` with acceptance gates
4. Present to user for approval

### Phase 2: Architect (Planning)
1. Read approved spec
2. Decompose into independent increments
3. Create frozen contracts with gate scripts
4. Generate `.superteam/plan.md`

### Phase 3: Execute (Implementation)
For each increment:
1. Generator implements per contract
2. Evaluator verifies with gates
3. If issues: revise and re-evaluate
4. If approved: proceed to next

### Phase 4: Evaluation (Verification)
1. Run ALL final acceptance gates
2. Binary PASS or FAIL
3. If FAIL: return to Phase 3 for fixes

### Phase 5: Delivery (Results)
1. Extract knowledge to wiki
2. Present results to user

## State Management

```bash
# Initialize
node .cursor/skills/superteam/scripts/state-manager.js init

# Get state
node .cursor/skills/superteam/scripts/state-manager.js get .phase

# Update state
node .cursor/skills/superteam/scripts/state-manager.js set phase=architect

# Run gates
node .cursor/skills/superteam/scripts/gate-runner.js run 1

# Log events
node .cursor/skills/superteam/scripts/record-event.js --actor agent --type decision --summary "..."
```

## File Structure

```
.superteam/
├── state.json          # Pipeline state
├── events.jsonl        # Event log
├── spec.md             # Requirements
├── plan.md             # Architecture plan
├── contracts/          # Increment contracts
├── attempts/           # Implementation attempts
├── verdicts/           # Evaluation verdicts
├── gate-results/       # Gate execution results
└── knowledge/          # Accumulated knowledge
```

## Phase Documentation

Detailed guidance for each phase lives in `.cursor/skills/superteam/phases/`:

| File | Phase | Mode |
|------|-------|------|
| `phase-1-pm.md` | PM (Requirements) | Interactive - Explorer + PM subagents, user approval gate |
| `phase-2-architect.md` | Architect (Planning) | Automated - decompose spec into frozen contracts |
| `phase-3-execute.md` | Execute (Implementation) | Automated - Generator/Evaluator pairs per increment |
| `phase-4-evaluation.md` | Strict Evaluation | Mandatory - binary PASS/FAIL against spec |
| `phase-5-delivery.md` | Delivery (Results) | Terminal - Curator extracts knowledge, present results |

Read the relevant phase file before starting each phase for detailed step-by-step guidance.

## Available Subagents

| Agent | Role | Mode |
|-------|------|------|
| `@orchestrator` | Pipeline coordination, phase transitions | read/write |
| `@pm` | Requirements gathering, spec creation | read/write |
| `@explorer` | Codebase research, knowledge accumulation | readonly |
| `@architect` | Plan decomposition, contract creation | read/write |
| `@generator` | Increment implementation | read/write |
| `@evaluator` | Contract verification, gate execution | read/write |
| `@plan-evaluator` | Independent plan verification | readonly |
| `@manager` | Execution monitoring, anomaly detection | read/write |
| `@curator` | Knowledge extraction to global wiki | read/write |

## Hooks

This skill uses hooks for safety and long-running loops:

- **preToolUse (Shell)**: `invariant-check.js` - blocks git commit if validation fails
- **preToolUse (Write)**: `verdict-gate.js` - blocks verdict writes without gate results
- **stop**: `completion-nudge.js` - warns on incomplete contracts
- **stop**: `superteam-loop.js` - auto-continues pipeline (loop_limit: 25)
- **sessionStart**: `startup-check.js` - reports active session status

## Constraints

- NEVER skip phases
- NEVER declare "done" without user approval
- ALWAYS run gate scripts before claiming completion
- ALWAYS log decisions to events.jsonl
