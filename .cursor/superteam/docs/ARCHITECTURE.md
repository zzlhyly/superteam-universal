# Superteam for OpenCode - Architecture

## Overview

This is an adaptation of the [Superteam](https://github.com/Crysple/superteam) multi-agent orchestration system for **OpenCode**. The original system is designed for Claude Code's team mode with tmux-based agent isolation. This adaptation reimagines the architecture for OpenCode's `task()` subagent system.

## Key Architectural Differences

### Original Superteam (Claude Code)

| Component | Implementation |
|-----------|----------------|
| Agent Isolation | Each agent in separate tmux pane |
| Communication | `SendMessage` between agents |
| State Management | `state.json` with CAS via `flock` |
| Lifecycle | Agents persist across phases |
| Hooks | PreToolUse, Stop, SessionStart |

### OpenCode Adaptation

| Component | Implementation |
|-----------|----------------|
| Agent Isolation | `task()` subagent calls with context passing |
| Communication | File-based message queue + orchestrator routing |
| State Management | JSON files with file-lock simulation |
| Lifecycle | Task-based (each task is stateless) |
| Hooks | Skill-based workflow enforcement |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              SKILL.md (Entry Point)                          │
│         /superteam command handler                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              Orchestrator (Main Agent)                        │
│    - Phase management                                        │
│    - Agent coordination                                      │
│    - State transitions                                       │
└──────┬──────────┬──────────┬──────────┬─────────────────────┘
       │          │          │          │
┌──────▼────┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
│    PM     │ │Architect│ │Manager │ │Explorer│
│  (Phase1) │ │(Phase2) │ │(Phase3)│ │(All)   │
└───────────┘ └─────────┘ └────────┘ └────────┘
                    │          │
              ┌─────┴─────┐   │
              │           │   │
         ┌────▼───┐  ┌────▼───▼──┐
         │Generator│  │Evaluator │
         │(per-inc)│  │(per-inc) │
         └─────────┘  └──────────┘
```

## Core Components

### 1. State Manager (`scripts/state-manager.js`)

Replaces `state-mutate.sh` with a cross-platform Node.js implementation.

```javascript
// Features:
// - Atomic read/write with file locking
// - CAS (Compare-And-Swap) protection
// - JSON path queries
// - Revision tracking
```

### 2. Message Bus (`scripts/message-bus.js`)

Replaces `SendMessage` with file-based message queue.

```javascript
// Features:
// - Per-agent message queues
// - Message routing
// - Acknowledgment tracking
// - Message history
```

### 3. Gate Runner (`scripts/gate-runner.js`)

Replaces `run-gates.sh` with cross-platform implementation.

```javascript
// Features:
// - Execute gate scripts
// - Collect results
// - Generate reports
// - Support for Node.js and Python gates
```

### 4. Orchestrator Agent

The main coordination agent that drives the pipeline.

**Responsibilities:**
- Phase transitions
- Agent spawning via `task()`
- State management
- Error recovery

**Key Difference from Original:**
- Instead of persistent agents, each phase spawns new tasks
- Context is passed via files, not conversation history
- No tmux dependency

## Workflow Adaptation

### Phase 1: PM Phase

```
1. User invokes /superteam
2. SKILL.md creates orchestrator task
3. Orchestrator spawns PM task with context:
   - User request
   - Project root
   - Task form
4. PM task:
   - Reads codebase (using explore tools)
   - Asks clarifying questions (via orchestrator)
   - Generates spec.md
   - Creates acceptance gates
5. PM returns result to orchestrator
6. Orchestrator presents to user for approval
```

### Phase 2: Architect Phase

```
1. Orchestrator spawns Architect task
2. Architect task:
   - Reads spec.md
   - Decomposes into increments
   - Creates contracts with gate scripts
   - Returns plan.md + contracts
3. Orchestrator validates plan
```

### Phase 3: Execute Phase

```
1. For each increment:
   a. Orchestrator spawns Generator task
      - Context: contract, prior attempts, lessons
      - Task: implement, validate, commit
   b. Generator returns result
   c. Orchestrator spawns Evaluator task
      - Context: contract, generator output
      - Task: run gates, issue verdict
   d. Evaluator returns verdict
   e. If REVISE: loop back to (a)
   f. If APPROVED: proceed to next increment
```

### Phase 4: Strict Evaluation

```
1. Orchestrator spawns Strict Evaluator task
2. Strict Evaluator runs ALL final gates
3. Returns PASS/FAIL verdict
4. If FAIL: return to Phase 3 for fixes
5. If PASS: proceed to Phase 5
```

### Phase 5: Delivery

```
1. Orchestrator spawns Curator task
2. Curator extracts knowledge to wiki
3. Orchestrator presents results to user
```

## Context Passing Strategy

Since OpenCode tasks are stateless, context must be explicitly passed:

### Via Files (Primary)
- `.superteam/state.json` - Pipeline state
- `.superteam/spec.md` - Requirements
- `.superteam/plan.md` - Architecture plan
- `.superteam/contracts/` - Increment contracts
- `.superteam/attempts/` - Implementation attempts
- `.superteam/verdicts/` - Evaluation results
- `.superteam/events.jsonl` - Event log

### Via Task Prompt (Secondary)
- Phase-specific instructions
- Relevant file paths
- Prior decisions summary
- Current state snapshot

## Error Recovery

### Stall Detection
Instead of a watchdog timer, the orchestrator checks for stalls:
- Read `state.json` timestamp
- If > 20 minutes since last update: stall detected
- Recovery: restart current phase with fresh context

### Escalation Ladder
1. **Strike 1**: Retry with feedback
2. **Strike 2**: Try different approach
3. **Strike 3**: Fresh context (new task)
4. **Strike 4**: Scope change (split increment)
5. **Strike 5**: User intervention

## Knowledge Management

### Local Wiki (`.superteam/knowledge/`)
- Project-specific findings
- Architecture decisions
- Code patterns
- Lessons learned

### Global Wiki (`~/.superteam/`)
- Cross-project knowledge
- Reusable patterns
- Tool configurations
- Team conventions

## Limitations

1. **No Persistent Agents**: Each task is stateless
2. **No Direct Communication**: All routing through orchestrator
3. **No tmux Isolation**: Tasks share file system
4. **Platform Dependent**: Some scripts may need adaptation

## Future Enhancements

1. **Parallel Increments**: Support for concurrent Generator/Evaluator pairs
2. **MCP Integration**: External knowledge sources
3. **Custom Task Forms**: Pluggable workflow definitions
4. **Web UI**: Progress visualization
5. **Slack/Teams Integration**: Notifications
