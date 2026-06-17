# Superteam Multi-Agent Workflow

Execute the Superteam multi-agent workflow for: $ARGUMENTS

## Steps

1. **Initialize** the session:
   ```bash
   node .cursor/skills/superteam/scripts/state-manager.js init
   mkdir -p .superteam/contracts .superteam/attempts .superteam/verdicts
   ```

2. **PM Phase** - Gather requirements:
   - Explore codebase to understand existing patterns
   - Ask clarifying questions (max 5 at a time)
   - Generate `.superteam/spec.md` with acceptance gates
   - Present to user for approval

3. **Architect Phase** - Create plan:
   - Read approved spec
   - Decompose into independent increments
   - Create frozen contracts with gate scripts
   - Generate `.superteam/plan.md`

4. **Execute Phase** - Implement increments:
   - For each increment:
     - Generator implements per contract
     - Evaluator verifies with gates
     - If issues: revise and re-evaluate
     - If approved: proceed to next

5. **Evaluation Phase** - Final verification:
   - Run ALL final acceptance gates
   - Binary PASS or FAIL
   - If FAIL: return to Execute Phase for fixes

6. **Delivery Phase** - Present results:
   - Extract knowledge to wiki
   - Present results to user

## Rules

- Never modify the same file in parallel
- Always run tests after implementation
- Create checkpoints before major changes
- Use worktrees for experimental changes

## State Files

- `.superteam/state.json` - Pipeline state
- `.superteam/events.jsonl` - Event log
- `.superteam/spec.md` - Requirements
- `.superteam/plan.md` - Architecture plan
- `.superteam/contracts/` - Increment contracts
- `.superteam/verdicts/` - Evaluation verdicts
