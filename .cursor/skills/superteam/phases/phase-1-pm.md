# Phase 1: PM Phase (INTERACTIVE)

The only interactive phase. The main agent coordinates Explorer and PM subagents.

## Prerequisites
- Session initialized via `node .cursor/skills/superteam/scripts/init-session.js`
- State: phase=pm, phase_step=init

## Step 1: Dispatch Explorer

Dispatch the Explorer subagent (readonly) to survey the codebase:
- Task: "Survey the codebase. Write findings to .superteam/knowledge/ including codebase-overview.md, conventions.md, dependencies.md. Update knowledge/index.md. Check ~/.superteam/ for cached global knowledge (warm-start)."
- The Explorer runs concurrently while PM brainstorms with user.

## Step 2: Dispatch PM

Dispatch the PM subagent to gather requirements:
- Task: "Read the user request: '{request}'. Read .superteam/knowledge/ for codebase context. Brainstorm with user, ask clarifying questions (max 5 at a time). Write .superteam/spec.md with acceptance gates. Return when spec is ready for approval."
- PM writes spec.md as a draft first, then finalizes.

## Step 3: Create Gate Scripts

Dispatch a Generator subagent to write executable acceptance gate scripts:
- Task: "Read .superteam/spec.md. Write executable gate scripts to .superteam/scripts/final/. Each script exits 0 on pass, non-zero on fail. Return list of created scripts."

## Step 4: User Approval Gate

Present spec.md and gate scripts to the user for approval.
- On approval: Update spec.md frontmatter (status: approved, approved_by: user)
- On rejection: Relay feedback, iterate on spec

## Step 5: Transition

```bash
node .cursor/skills/superteam/scripts/state-manager.js set phase=architect
node .cursor/skills/superteam/scripts/state-manager.js set phase_step=init
node .cursor/skills/superteam/scripts/record-event.js --actor orchestrator --type decision --summary "Phase 1 complete, spec approved"
```
