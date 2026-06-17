# Superteam for OpenCode, Cursor & Claude Code

<div align="center">

### Multi-Agent Orchestration for AI-Powered Development

*Adapted from the original [Superteam](https://github.com/Crysple/superteam) for Claude Code*

[![Original Superteam](https://img.shields.io/badge/Original-Superteam-blue?style=flat-square)](https://github.com/Crysple/superteam)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Built for OpenCode](https://img.shields.io/badge/OpenCode-Supported-green?style=flat-square)](.opencode/)
[![Built for Cursor](https://img.shields.io/badge/Cursor-Supported-purple?style=flat-square)](.cursor/)
[![Built for Claude](https://img.shields.io/badge/Claude-Supported-orange?style=flat-square)](.claude/)

**Language / 语言:** [English](README.md) · [中文](README.zh.md)

</div>

---

This is a **multi-platform adaptation** of the [Superteam](https://github.com/Crysple/superteam) multi-agent orchestration system, originally designed for Claude Code's team mode. The core concepts (contract-gated verification, adversarial feedback loops, 5-phase pipeline) are preserved while adapting to OpenCode, Cursor, and Claude Code.

## Supported Platforms

| Platform | Directory | Status |
|----------|-----------|--------|
| **Cursor** | `.cursor/` | ✅ Full support |
| **OpenCode** | `.opencode/` | ✅ Full support |
| **Claude Code** | `.claude/superteam/` | ✅ Original |

## Overview

Superteam spawns a team of specialized agents to handle complex tasks:

- **PM** - Requirements gathering with user
- **Architect** - Planning and contract creation
- **Manager** - Execution monitoring and anomaly detection
- **Generator** - Implementation per contract
- **Evaluator** - Verification with 4-tier gates
- **Plan Evaluator** - Independent plan verification
- **Explorer** - Codebase research
- **Curator** - Knowledge extraction

## Quick Start

### For Cursor

Copy `.cursor/` to your project root:

```bash
# Windows
xcopy /E /I .cursor your-project\.cursor

# Linux/macOS
cp -r .cursor /path/to/your/project/
```

Then use the command or subagents:

```
/superteam Build a rate-limited job queue with Redis
@orchestrator coordinate the implementation
@pm gather requirements for this feature
```

### For OpenCode

Copy `.opencode/` to your project root:

```bash
# Windows
xcopy /E /I .opencode your-project\.opencode

# Linux/macOS
cp -r .opencode /path/to/your/project/
```

Then invoke the skill:

```
/superteam Build a rate-limited job queue with Redis and dead-letter support
```

### For Claude Code (Original)

Copy `.claude/superteam/` to your Claude Code plugins directory:

```bash
# Windows
xcopy /E /I .claude\superteam %USERPROFILE%\.claude\plugins\superteam

# Linux/macOS
cp -r .claude/superteam ~/.claude/plugins/
```

Or install via Claude Code plugin system:

```
/plugin marketplace add Crysple/superteam
/plugin install superteam@superteam
/reload-plugins
```

## Architecture

```
User Request
    ↓
SKILL.md / Command (Entry Point)
    ↓
Orchestrator (Main Agent)
    ↓
┌──────┬──────┬──────┬──────┬──────────────┐
│  PM  │ Arch │ Mgr  │ Exp  │ Plan-Eval    │
└──┬───┘└──┬──┘└──┬──┘└─────┘└──────────────┘
   │       │      │
   ↓       ↓      ↓
        Generator ←→ Evaluator
        (per increment)
              ↓
          Curator (Phase 5)
```

## Key Differences from Original

| Aspect | Original (Claude Code) | Cursor Adaptation | OpenCode Adaptation |
|--------|------------------------|-------------------|---------------------|
| Agent Isolation | tmux panes | `.cursor/agents/*.md` subagents | `.opencode/agents/*.md` subagents |
| Communication | SendMessage | File-based messages | File-based messages |
| State Management | flock + CAS | File operations | File operations |
| Lifecycle | Persistent agents | Stateless tasks + Hooks | Stateless tasks + Plugins |
| Hooks | PreToolUse/Stop | `.cursor/hooks.json` | `.opencode/plugins/*.js` |
| Rules | Plugin config | `.cursor/rules/*.mdc` | SKILL.md |
| Commands | Plugin commands | `.cursor/commands/*.md` | `/superteam` trigger |
| Platform | Linux/macOS only | Cross-platform | Cross-platform |

## Directory Structure

```
superteam-universal/
├── .cursor/                         # Cursor version
│   ├── rules/                       # Project rules (.mdc, always applied)
│   │   ├── 00-superteam-core.mdc
│   │   ├── 01-superteam-workflow.mdc
│   │   └── 02-superteam-global-guide.mdc
│   ├── agents/                      # Subagents (auto-discovered)
│   │   ├── orchestrator.md
│   │   ├── pm.md, architect.md, generator.md
│   │   ├── evaluator.md, manager.md
│   │   ├── explorer.md, plan-evaluator.md, curator.md
│   ├── skills/superteam/            # Skill entry + scripts
│   │   ├── SKILL.md
│   │   ├── scripts/                 # Utility scripts
│   │   └── phases/                  # Phase documentation
│   ├── commands/superteam.md        # /superteam command
│   └── hooks.json                   # Hook configuration
│
├── .opencode/                       # OpenCode version
│   ├── agents/                      # Subagents (auto-discovered)
│   │   ├── orchestrator.md
│   │   ├── pm.md, architect.md, generator.md
│   │   ├── evaluator.md, manager.md
│   │   ├── explorer.md, plan-evaluator.md, curator.md
│   ├── skills/superteam/            # Skill entry + scripts
│   │   ├── SKILL.md
│   │   ├── scripts/                 # Utility scripts
│   │   ├── phases/                  # Phase documentation
│   │   ├── global-guide.md
│   │   └── task-forms/engineering/FORM.md
│   ├── plugins/superteam-hooks.js   # Safety hooks plugin
│   └── opencode.json                # OpenCode config
│
├── .claude/superteam/               # Claude Code version (original)
│   ├── skills/superteam/SKILL.md
│   ├── agents/, hooks/, scripts/
│   └── .claude-plugin/
│
├── AGENTS.md                        # Project overview
├── README.md                        # English documentation
├── README.zh.md                     # Chinese documentation
└── LICENSE                          # MIT License
```

## How It Works

### Phase 1: PM (Interactive)

- Explorer surveys your codebase and builds knowledge base
- PM asks clarifying questions based on findings
- Generates `spec.md` with executable acceptance gates
- You approve before anything is built

### Phase 2: Architect (Automated)

- Reads approved spec
- Decomposes into increments with frozen contracts
- Creates gate scripts for each increment
- Plan Evaluator independently verifies plan coverage

### Phase 3: Execute (Manager-Driven)

For each increment:
1. Generator implements per contract
2. Evaluator runs 4-tier verification (preconditions → hard gates → soft gates → invariants)
3. If REVISE: fix and re-evaluate
4. If APPROVED: proceed to next increment

### Phase 4: Strict Evaluation (Mandatory)

- Fresh evaluator runs ALL final gates
- Binary PASS or FAIL
- If FAIL: return to Phase 3 with progressive context

### Phase 5: Delivery (Terminal)

- Curator extracts knowledge to global wiki (`~/.superteam/`)
- Results presented to user

## Tools

### State Manager

```bash
# Cursor
node .cursor/skills/superteam/scripts/state-manager.js init
node .cursor/skills/superteam/scripts/state-manager.js get .phase
node .cursor/skills/superteam/scripts/state-manager.js set phase=architect
node .cursor/skills/superteam/scripts/state-manager.js status

# OpenCode
node .opencode/skills/superteam/scripts/state-manager.js init
node .opencode/skills/superteam/scripts/state-manager.js get .phase
node .opencode/skills/superteam/scripts/state-manager.js set phase=architect
node .opencode/skills/superteam/scripts/state-manager.js status
```

### Gate Runner

```bash
# Cursor
node .cursor/skills/superteam/scripts/gate-runner.js run 1
node .cursor/skills/superteam/scripts/gate-runner.js final

# OpenCode
node .opencode/skills/superteam/scripts/gate-runner.js run 1
node .opencode/skills/superteam/scripts/gate-runner.js final
```

### Event Recorder

```bash
# Cursor
node .cursor/skills/superteam/scripts/record-event.js \
  --actor orchestrator --type decision --summary "Phase transition"

# OpenCode
node .opencode/skills/superteam/scripts/record-event.js \
  --actor orchestrator --type decision --summary "Phase transition"
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

Gate scripts are created during execution in `.superteam/scripts/increment-N/`:

```javascript
// gate-01-custom.js
const assert = require('assert');

async function test() {
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

## Troubleshooting

### No progress

```bash
# Check state
node .cursor/skills/superteam/scripts/state-manager.js status     # Cursor
node .opencode/skills/superteam/scripts/state-manager.js status    # OpenCode
```

### Stuck agent

```bash
# Check recent events
node .cursor/skills/superteam/scripts/record-event.js query --limit 10    # Cursor
node .opencode/skills/superteam/scripts/record-event.js query --limit 10  # OpenCode
```

### Gate failures

```bash
# Check gate results (platform-independent)
cat .superteam/gate-results/increment-1.json
```

### Cursor-specific

```bash
ls .cursor/agents/       # Check subagent files exist
ls .cursor/commands/      # Check command file exists
cat .cursor/hooks.json    # Check hook configuration
```

## Limitations

1. **No Persistent Agents** - Each task is stateless
2. **No Direct Communication** - All routing through orchestrator
3. **No tmux Isolation** - Tasks share file system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file

## Credits & Attribution

This project is an adaptation of [Superteam](https://github.com/Crysple/superteam) by [Crysple](https://github.com/Crysple), licensed under the [MIT License](https://github.com/Crysple/superteam/blob/main/LICENSE).

### Original Project

- **Repository**: [github.com/Crysple/superteam](https://github.com/Crysple/superteam)
- **Author**: Crysple
- **License**: MIT
- **Blog**: [English](https://crysple.github.io/superteam/index.html) | [中文](https://crysple.github.io/superteam/index.zh.html)

### Core Design Principles (Preserved)

1. **Separate generation from evaluation** - self-evaluation is inherently lenient
2. **Contract-gated verification** - executable acceptance criteria, not subjective judgment
3. **Adversarial feedback loops** - Generator/Evaluator pairs with blind evaluation
4. **Progressive context** - lessons learned accumulate across attempts
5. **Knowledge extraction** - Curator promotes findings to global wiki

### Acknowledgments

- [Crysple](https://github.com/Crysple) for creating the original Superteam
- [Anthropic](https://www.anthropic.com/) for Claude Code's team mode architecture
- [Andrej Karpathy](https://github.com/karpathy) for the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) inspiration
