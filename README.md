# Superteam for OpenCode & Cursor

<div align="center">

### Multi-Agent Orchestration for AI-Powered Development

*Adapted from the original [Superteam](https://github.com/Crysple/superteam) for Claude Code*

[![Original Superteam](https://img.shields.io/badge/Original-Superteam-blue?style=flat-square)](https://github.com/Crysple/superteam)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Built for OpenCode](https://img.shields.io/badge/OpenCode-Supported-green?style=flat-square)](.opencode/)
[![Built for Cursor](https://img.shields.io/badge/Cursor-Supported-purple?style=flat-square)](.cursor/)

**Language / 语言:** [English](README.md) · [中文](README.zh.md)

</div>

---

This is a **multi-platform adaptation** of the [Superteam](https://github.com/Crysple/superteam) multi-agent orchestration system, originally designed for Claude Code's team mode. The core concepts (contract-gated verification, adversarial feedback loops, 5-phase pipeline) are preserved while adapting to both OpenCode and Cursor.

## Supported Platforms

| Platform | Directory | Entry Point | Status |
|----------|-----------|-------------|--------|
| **OpenCode** | `.opencode/superteam/` | `SKILL.md` | ✅ Full support |
| **Cursor** | `.cursor/superteam/` | `SKILL.md` | ✅ Full support |

## Overview

Superteam spawns a team of specialized agents to handle complex tasks:

- **PM** - Requirements gathering with user
- **Architect** - Planning and contract creation
- **Manager** - Execution monitoring and anomaly detection
- **Generator** - Implementation per contract
- **Evaluator** - Verification with 4-tier gates
- **Explorer** - Codebase research
- **Curator** - Knowledge extraction

## Quick Start

### For OpenCode

1. Copy `.opencode/superteam/` to your OpenCode skills directory:
   ```bash
   # Windows
   xcopy /E /I .opencode\superteam %USERPROFILE%\.opencode\skills\superteam
   
   # Linux/macOS
   cp -r .opencode/superteam ~/.opencode/skills/
   ```

2. Invoke the skill:
   ```
   /superteam Build a rate-limited job queue with Redis and dead-letter support
   ```

### For Cursor

1. Copy `.cursor/` to your project root:
   ```bash
   # Windows
   xcopy /E /I .cursor %USERPROFILE%\your-project\.cursor
   
   # Linux/macOS
   cp -r .cursor /path/to/your/project/
   ```

2. To start a Superteam session, tell the AI:
   ```
   Read .cursor/superteam/SKILL.md and start a Superteam session for: [your task]
   ```

## Architecture

```
User Request
    ↓
SKILL.md (Entry Point)
    ↓
Orchestrator (Main Agent)
    ↓
┌───────┬───────┬───────┬───────┐
│  PM   │ Arch  │ Mgr   │ Exp   │
└───┬───┘└───┬───┘└───┬───┘└───────┘
    │        │        │
    ↓        ↓        ↓
         Generator ←→ Evaluator
         (per increment)
```

## Key Differences from Original

| Aspect | Original (Claude Code) | OpenCode Adaptation | Cursor Adaptation |
|--------|------------------------|---------------------|-------------------|
| Agent Isolation | tmux panes | task() calls | Single Agent context |
| Communication | SendMessage | File-based messages | File-based messages |
| State Management | flock + CAS | File operations | File operations |
| Lifecycle | Persistent agents | Stateless tasks | Stateless tasks |
| Hooks | PreToolUse/Stop | Skill workflow | SKILL.md reference |
| Entry Point | Plugin system | SKILL.md | SKILL.md |

## Directory Structure

```
superteam/
├── .opencode/                    # OpenCode version
│   └── superteam/
│       ├── SKILL.md              # Entry point
│       ├── global-guide.md       # Shared rules
│       ├── agents/               # Agent definitions
│       ├── task-forms/           # Task form definitions
│       ├── scripts/              # Utility scripts
│       └── docs/                 # Documentation
│
├── .cursor/                      # Cursor version
│   └── superteam/
│       ├── SKILL.md              # Entry point
│       ├── global-guide.md       # Shared rules
│       ├── agents/               # Agent definitions
│       ├── task-forms/           # Task form definitions
│       ├── scripts/              # Utility scripts
│       └── docs/                 # Documentation
│
├── README.md                     # This file
├── README.zh.md                  # Chinese documentation
├── LICENSE                       # MIT License
└── .gitignore                    # Git ignore rules
```

## Usage Examples

### Basic Usage

```
/superteam Build a REST API for user management with authentication
```

### With Specific Requirements

```
/superteam Create a rate-limited job queue:
- Redis backend
- Dead letter queue
- Retry logic with exponential backoff
- Monitoring dashboard
- Target: 1000 jobs/second
```

### Enterprise Scenario

```
/superteam Add a daily PySpark job:
- Join /data/prod/events with feature_flags table
- Land partitioned output to /out/daily/features/
- Schedule in Airflow with retries
- Alert #data-oncall on SLA breach
```

## How It Works

### Phase 1: PM

- PM explores your codebase
- Asks clarifying questions
- Generates spec.md with acceptance gates
- You approve before anything is built

### Phase 2: Architect

- Reads approved spec
- Decomposes into increments
- Creates contracts with gate scripts
- Generates plan.md

### Phase 3: Execute

For each increment:
1. Generator implements per contract
2. Evaluator verifies with gates
3. If issues: revise and re-evaluate
4. If approved: proceed to next

### Phase 4: Strict Evaluation

- Fresh evaluator runs ALL final gates
- Binary PASS or FAIL
- If FAIL: return to Phase 3 for fixes

### Phase 5: Delivery

- Curator extracts knowledge to wiki
- Results presented to user
- Knowledge available for future sessions

## Tools

### State Manager

```bash
# Initialize
node .opencode/superteam/scripts/state-manager.js init  # OpenCode
node .cursor/superteam/scripts/state-manager.js init     # Cursor

# Get value
node .opencode/superteam/scripts/state-manager.js get .phase  # OpenCode
node .cursor/superteam/scripts/state-manager.js get .phase     # Cursor

# Set value
node .opencode/superteam/scripts/state-manager.js set phase=architect  # OpenCode
node .cursor/superteam/scripts/state-manager.js set phase=architect     # Cursor

# Show status
node .opencode/superteam/scripts/state-manager.js status  # OpenCode
node .cursor/superteam/scripts/state-manager.js status     # Cursor
```

### Message Bus

```bash
# Send message
node .opencode/superteam/scripts/message-bus.js send pm orchestrator phase_complete "Spec approved"

# Receive messages
node .opencode/superteam/scripts/message-bus.js receive orchestrator

# List pending
node .opencode/superteam/scripts/message-bus.js list
```

### Gate Runner

```bash
# Run gates for increment 1
node .opencode/superteam/scripts/gate-runner.js run 1

# Run final gates
node .opencode/superteam/scripts/gate-runner.js final

# List available gates
node .opencode/superteam/scripts/gate-runner.js list 1
```

### Event Recorder

```bash
# Record decision
node .opencode/superteam/scripts/record-event.js \
  --actor orchestrator \
  --type decision \
  --summary "Phase transition" \
  --rationale "All increments complete"

# Query events
node .opencode/superteam/scripts/record-event.js query --type decision
```

## Customization

### Adding New Task Forms

Create `task-forms/my-form/FORM.md`:

```yaml
---
name: "my-form"
description: "Custom workflow"
phases: [pm, architect, execute, deliver]
termination: "all tasks complete"
---
```

### Custom Gate Scripts

Create gate scripts in `.superteam/scripts/increment-N/`:

```javascript
// gate-01-custom.js
const assert = require('assert');

async function test() {
  // Your verification logic
  const result = await checkSomething();
  assert(result.success, 'Check should pass');
}

test().then(() => {
  console.log('PASS');
  process.exit(0);
}).catch(err => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
```

## Limitations

1. **No Persistent Agents** - Each task is stateless
2. **No Direct Communication** - All routing through orchestrator
3. **No tmux Isolation** - Tasks share file system
4. **Platform Dependent** - Some scripts may need adaptation

## Troubleshooting

### No progress

Check state:
```bash
# OpenCode
node .opencode/superteam/scripts/state-manager.js status

# Cursor
node .cursor/superteam/scripts/state-manager.js status
```

### Stuck agent

Check events:
```bash
# OpenCode
node .opencode/superteam/scripts/record-event.js query --limit 10

# Cursor
node .cursor/superteam/scripts/record-event.js query --limit 10
```

### Gate failures

Check results:
```bash
cat .superteam/gate-results/increment-1.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file

## Credits & Attribution

This project is an adaptation of [Superteam](https://github.com/Crysple/superteam) by [Crysple](https://github.com/Crysple), licensed under the [MIT License](https://github.com/Crysple/superteam/blob/main/LICENSE).

### Original Project

- **Repository**: [github.com/Crysple/superteam](https://github.com/Crysple/superteam)
- **Author**: Crysple
- **License**: MIT
- **Blog**: [English](https://crysple.github.io/superteam/index.html) | [中文](https://crysple.github.io/superteam/index.zh.html)

### What's Preserved

The core design principles from the original Superteam:

1. **Separate generation from evaluation** - self-evaluation is inherently lenient
2. **Contract-gated verification** - executable acceptance criteria, not subjective judgment
3. **Adversarial feedback loops** - Generator/Evaluator pairs with blind evaluation
4. **Progressive context** - lessons learned accumulate across attempts
5. **Knowledge extraction** - Curator promotes findings to global wiki

### What's Changed

Adapted for both OpenCode and Cursor:

| Aspect | Original (Claude Code) | OpenCode Adaptation | Cursor Adaptation |
|--------|------------------------|---------------------|-------------------|
| Agent Isolation | tmux panes | `task()` calls | Single Agent context |
| Communication | `SendMessage` | File-based messages | File-based messages |
| State Management | `flock` + CAS | File operations | File operations |
| Lifecycle | Persistent agents | Stateless tasks | Stateless tasks |
| Hooks | PreToolUse/Stop | Skill workflow | SKILL.md reference |
| Platform | Linux/macOS only | Cross-platform | Cross-platform |

### Acknowledgments

Special thanks to:
- [Crysple](https://github.com/Crysple) for creating the original Superteam
- [Anthropic](https://www.anthropic.com/) for Claude Code's team mode architecture
- [Andrej Karpathy](https://github.com/karpathy) for the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) inspiration
