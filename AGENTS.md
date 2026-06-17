# Superteam Universal

Multi-agent orchestration system adapted for multiple AI coding assistants.

## Available Versions

| Platform | Directory | Status |
|----------|-----------|--------|
| **Claude Code** (original) | `.claude/superteam/` | Reference implementation |
| **Cursor** | `.cursor/` | Adapted for Task tool + subagents |
| **OpenCode** | `.opencode/` | Adapted for task() + subagents |

## Usage

Copy the relevant directory into your project and follow the platform-specific instructions within.

## Architecture

All versions follow the same 5-phase pipeline:

1. **PM Phase** - Requirements gathering with user
2. **Architect Phase** - Planning and contract creation
3. **Execute Phase** - Implementation with Generator/Evaluator pairs
4. **Evaluation Phase** - Strict verification against contracts
5. **Delivery Phase** - Knowledge extraction and results

## State Management

All versions use `.superteam/` for runtime state (created during execution, not shipped with the project).
