# Superteam Project

This project uses the **Superteam** multi-agent orchestration system for complex tasks.

## Quick Start

### Using the Command
```
/superteam Build a rate-limited job queue with Redis
```

### Using Subagents
```
@orchestrator coordinate the implementation
@pm gather requirements for this feature
@architect create an implementation plan
@generator implement increment 1
@evaluator verify increment 1
@manager monitor execution progress
```

## Architecture

This project follows the Superteam 5-phase pipeline:

1. **PM Phase** - Requirements gathering with user
2. **Architect Phase** - Planning and contract creation
3. **Execute Phase** - Implementation with Generator/Evaluator pairs
4. **Evaluation Phase** - Strict verification against contracts
5. **Delivery Phase** - Knowledge extraction and results

## Key Files

- `.cursor/rules/*.mdc` - Project rules (auto-loaded)
- `.cursor/agents/*.md` - Specialist subagents
- `.cursor/skills/superteam/SKILL.md` - Workflow skill
- `.cursor/commands/superteam.md` - Command definition
- `.cursor/hooks.json` - Hook configuration
- `.cursor/scripts/` - Utility scripts

## State Management

All state lives in `.superteam/` directory:

```bash
# Initialize state
node .cursor/scripts/state-manager.js init

# Get current phase
node .cursor/scripts/state-manager.js get .phase

# Update phase
node .cursor/scripts/state-manager.js set phase=architect

# Run gates
node .cursor/scripts/gate-runner.js run 1

# Log events
node .cursor/scripts/record-event.js --actor agent --type decision --summary "..."
```

## Workflow

1. Start with `/superteam` command
2. PM gathers requirements and creates spec
3. You approve the spec and acceptance gates
4. Team implements and verifies automatically
5. Results delivered with knowledge extracted

## Code Style

- Use TypeScript for all new files
- Prefer functional components in React
- Follow existing patterns in the codebase
- Write tests for new functionality

## Testing

```bash
npm test              # Run all tests
npm run lint          # Check lint
npm run typecheck     # Check types
```
