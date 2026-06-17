---
name: superteam
description: "Multi-agent orchestration system for complex tasks. Use when a task requires coordination across multiple specialists, spans 3+ files, or can be decomposed into independent subtasks."
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.py"
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
node .cursor/scripts/state-manager.js init

# Get state
node .cursor/scripts/state-manager.js get .phase

# Update state
node .cursor/scripts/state-manager.js set phase=architect

# Run gates
node .cursor/scripts/gate-runner.js run 1

# Log events
node .cursor/scripts/record-event.js --actor agent --type decision --summary "..."
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

## Hooks

This skill uses hooks for long-running agent loops:

```json
{
  "version": 1,
  "hooks": {
    "stop": [{ "command": "bun run .cursor/hooks/superteam-loop.ts" }]
  }
}
```

The hook checks if the pipeline is complete and continues if not.

## Constraints

- NEVER skip phases
- NEVER declare "done" without user approval
- ALWAYS run gate scripts before claiming completion
- ALWAYS log decisions to events.jsonl
