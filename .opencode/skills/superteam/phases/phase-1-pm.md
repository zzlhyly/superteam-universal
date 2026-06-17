# Phase 1: PM Phase (INTERACTIVE)

The only interactive phase. The orchestrator coordinates Explorer and PM subagents with user approval.

## Prerequisites

- Session initialized via `node .opencode/skills/superteam/scripts/init-session.js`
- State: `phase=pm`, `phase_step=init`
- Read `.opencode/skills/superteam/phases/phase-1-pm.md` before starting

## Step 1: Dispatch Explorer

Spawn the Explorer subagent (readonly) to survey the codebase:

```typescript
task(
  description="Explorer - Codebase Survey",
  prompt="Survey the codebase. Write findings to .superteam/knowledge/ including codebase-overview.md, conventions.md, dependencies.md. Update knowledge/index.md. Check ~/.superteam/ for cached global knowledge (warm-start)."
)
```

The Explorer runs concurrently while PM brainstorms with the user.

## Step 2: Dispatch PM

Spawn the PM subagent to gather requirements:

```typescript
task(
  description="PM - Requirements Gathering",
  prompt="Read the user request. Read .superteam/knowledge/ for codebase context. Brainstorm with user, ask clarifying questions (max 5 at a time). Write .superteam/spec.md with acceptance gates. Return when spec is ready for approval."
)
```

PM writes `spec.md` as a draft first, then finalizes after user feedback.

## Step 3: Create Gate Scripts

Spawn a Generator subagent to write executable acceptance gate scripts:

```typescript
task(
  description="Generator - Final Gate Scripts",
  prompt="Read .superteam/spec.md. Write executable gate scripts to .superteam/scripts/final/. Each script exits 0 on pass, non-zero on fail. Return list of created scripts."
)
```

## Step 4: User Approval Gate

Present `spec.md` and gate scripts to the user for approval.

- **On approval**: Update `spec.md` frontmatter (`status: approved`, `approved_by: user`)
- **On rejection**: Relay feedback, iterate on spec

## Step 5: Transition

```bash
node .opencode/skills/superteam/scripts/state-manager.js set phase=architect
node .opencode/skills/superteam/scripts/state-manager.js set phase_step=init
node .opencode/skills/superteam/scripts/record-event.js --actor orchestrator --type decision --summary "Phase 1 complete, spec approved"
```

## Key Files

| File | Purpose |
|------|---------|
| `.superteam/spec.md` | Requirements and acceptance gates |
| `.superteam/knowledge/` | Explorer findings |
| `.superteam/scripts/final/` | Final acceptance gate scripts |
| `.opencode/skills/superteam/WORKFLOW_STATE.md` | Handoff state |

## Notes

- PM phase is the only phase requiring direct user interaction
- Explorer findings reduce redundant codebase searches in later phases
- Gate scripts must be executable with binary pass/fail (exit 0 / non-zero)
