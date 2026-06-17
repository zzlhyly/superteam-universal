---
name: superteam
description: "Multi-agent orchestration system for complex tasks. Use when a task requires coordination across multiple specialists, spans 3+ files, or can be decomposed into independent subtasks with contract-gated verification."
license: MIT
compatibility: opencode
metadata:
  version: "2.0"
  author: "superteam-universal"
  category: "orchestration"
---

# Superteam Multi-Agent Orchestration for OpenCode

You are the **Team Lead (TL)**. Initialize the session, spawn agents via `task()`, own the user approval gate, and handle final delivery.

## When to Use

- Feature spans 3+ files
- Requires multiple expertise areas (architecture, implementation, testing)
- Task can be decomposed into independent subtasks
- User explicitly requests multi-agent orchestration

## Quick Start

1. **Initialize**: `node .opencode/skills/superteam/scripts/init-session.js`
2. **Spawn Orchestrator**: Use `task()` to spawn the orchestrator agent
3. **Monitor**: The orchestrator drives the pipeline through 5 phases
4. **Approve**: Review spec and gates when prompted
5. **Receive**: Get results when pipeline completes

```typescript
task(
  description="Orchestrator - Pipeline Driver",
  prompt="You are the Orchestrator. Read .opencode/agents/orchestrator.md for your role. Initialize state and drive the pipeline."
)
```

## Key Files

| File | Purpose |
|------|---------|
| `.opencode/agents/orchestrator.md` | Pipeline driver |
| `.opencode/agents/pm.md` | Requirements gathering |
| `.opencode/agents/explorer.md` | Codebase research |
| `.opencode/agents/architect.md` | Planning and contracts |
| `.opencode/agents/generator.md` | Increment implementation |
| `.opencode/agents/evaluator.md` | Contract verification |
| `.opencode/agents/plan-evaluator.md` | Independent plan verification |
| `.opencode/agents/manager.md` | Execution monitoring |
| `.opencode/agents/curator.md` | Knowledge extraction |
| `.opencode/skills/superteam/task-forms/engineering/FORM.md` | Workflow definition |
| `.opencode/skills/superteam/global-guide.md` | Shared rules and conventions |
| `.opencode/skills/superteam/scripts/state-manager.js` | State management |
| `.opencode/skills/superteam/scripts/gate-runner.js` | Gate execution |
| `.opencode/skills/superteam/scripts/record-event.js` | Event logging |
| `.opencode/skills/superteam/scripts/init-session.js` | Session initialization |
| `.opencode/skills/superteam/WORKFLOW_STATE.md` | Multi-agent handoff state |
| `.opencode/plugins/superteam-hooks.js` | Safety plugin hooks |

## Workflow Phases

1. **PM Phase** - Requirements gathering with user (interactive)
2. **Architect Phase** - Planning and contract creation (automated)
3. **Execute Phase** - Implementation with Generator/Evaluator pairs (automated)
4. **Evaluation Phase** - Strict verification against contracts (mandatory)
5. **Delivery Phase** - Knowledge extraction and results (terminal)

## State Management

```bash
# Initialize
node .opencode/skills/superteam/scripts/init-session.js

# Get state
node .opencode/skills/superteam/scripts/state-manager.js get .phase

# Update state
node .opencode/skills/superteam/scripts/state-manager.js set phase=architect

# Run gates
node .opencode/skills/superteam/scripts/gate-runner.js run 1
node .opencode/skills/superteam/scripts/gate-runner.js final

# Log events
node .opencode/skills/superteam/scripts/record-event.js --actor agent --type decision --summary "..."
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

Detailed guidance for each phase lives in `.opencode/skills/superteam/phases/`:

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
| `orchestrator` | Pipeline coordination, phase transitions | read/write |
| `pm` | Requirements gathering, spec creation | read/write |
| `explorer` | Codebase research, knowledge accumulation | readonly |
| `architect` | Plan decomposition, contract creation | read/write |
| `generator` | Increment implementation | read/write |
| `evaluator` | Contract verification, gate execution | read/write |
| `plan-evaluator` | Independent plan verification | readonly |
| `manager` | Execution monitoring, anomaly detection | read/write |
| `curator` | Knowledge extraction to global wiki | read/write |

## Hooks

The `.opencode/plugins/superteam-hooks.js` plugin enforces safety and session awareness:

- **tool.execute.before (bash)**: Invariant check - blocks `git commit` if `.superteam/validation-commands.txt` commands fail
- **tool.execute.before (write/edit/apply_patch)**: Verdict gate - blocks verdict writes without valid `gate-results/*.json` with `all_passed`
- **session.idle**: Completion nudge - warns when active session has increments without verdicts
- **session.created**: Startup check - reports active session phase/step/increment status

## Constraints

- NEVER skip phases
- NEVER declare "done" without user approval
- NEVER modify spec.md after approval
- ALWAYS run gate scripts before claiming completion
- ALWAYS log decisions to events.jsonl
- ALWAYS update WORKFLOW_STATE.md when handing off to next agent
