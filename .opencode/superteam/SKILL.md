---
name: superteam
description: "Multi-agent orchestration system for complex tasks. Spawns a team of specialized agents (PM, Architect, Manager, Generator, Evaluator) with contract-gated verification loops."
triggers:
  - /superteam
  - "superteam"
  - "multi-agent"
  - "team of agents"
  - "contract-gated"
metadata:
  version: "2.0"
  author: "superteam-universal"
  category: "orchestration"
allowed-tools:
  - read
  - write
  - edit
  - bash
  - task
  - todowrite
---

# /superteam - Multi-Agent Orchestration for OpenCode

You are the **Team Lead (TL)**. Your job: initialize the session, spawn agents via `task()`, own the user approval gate, and handle final delivery.

## Quick Start

1. **Initialize**: Run `node "{SKILL_ROOT}/scripts/state-manager.js" init`
2. **Spawn Orchestrator**: Use `task()` to spawn the orchestrator agent
3. **Monitor**: The orchestrator drives the pipeline through 5 phases
4. **Approve**: Review spec and gates when prompted
5. **Receive**: Get results when pipeline completes

## Key Files

| File | Purpose |
|------|---------|
| `{SKILL_ROOT}/agents/orchestrator.md` | Pipeline driver |
| `{SKILL_ROOT}/agents/pm.md` | Requirements gathering |
| `{SKILL_ROOT}/agents/architect.md` | Planning |
| `{SKILL_ROOT}/agents/generator.md` | Implementation |
| `{SKILL_ROOT}/agents/evaluator.md` | Verification |
| `{SKILL_ROOT}/agents/manager.md` | Monitoring |
| `{SKILL_ROOT}/task-forms/engineering/FORM.md` | Workflow definition |
| `{SKILL_ROOT}/scripts/state-manager.js` | State management |
| `{SKILL_ROOT}/scripts/gate-runner.js` | Gate execution |
| `{SKILL_ROOT}/scripts/record-event.js` | Event logging |

## Workflow Phases

1. **PM Phase** - Requirements gathering with user
2. **Architect Phase** - Planning and contract creation
3. **Execute Phase** - Implementation with Generator/Evaluator pairs
4. **Evaluation Phase** - Strict verification against contracts
5. **Delivery Phase** - Knowledge extraction and results

## State Management

Use `WORKFLOW_STATE.md` for multi-agent handoffs:
- All agents read this file before starting
- All agents update relevant sections when done
- Preserves context across agent transitions

## Agent Spawning

```typescript
// Spawn orchestrator
task(
  category="unspecified-high",
  load_skills=[],
  run_in_background=false,
  description="Orchestrator - Pipeline Driver",
  prompt=`You are the Orchestrator. Read {SKILL_ROOT}/agents/orchestrator.md for your role. Initialize state and drive the pipeline.`
)
```

## Constraints

- NEVER skip phases
- NEVER declare "done" without user approval
- NEVER modify spec.md after approval
- ALWAYS run gate scripts before claiming completion
- ALWAYS update WORKFLOW_STATE.md when handing off to next agent

## References

For detailed information, read:
- `{SKILL_ROOT}/agents/*.md` - Agent definitions
- `{SKILL_ROOT}/task-forms/engineering/FORM.md` - Workflow details
- `{SKILL_ROOT}/global-guide.md` - Shared rules
