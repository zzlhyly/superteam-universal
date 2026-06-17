#!/usr/bin/env node
/**
 * Superteam Loop Hook
 * 
 * This hook is called when the agent stops. It checks if the Superteam
 * pipeline is complete and provides a follow-up message if not.
 * 
 * Used by Cursor's hook system for long-running agent loops.
 */

const fs = require('fs');
const path = require('path');

const SUPERTEAM_DIR = '.superteam';
const STATE_FILE = path.join(SUPERTEAM_DIR, 'state.json');
const MAX_ITERATIONS = 20;

async function main() {
  // Read input from stdin (Cursor passes StopHookInput as JSON)
  let input = '';
  try {
    input = fs.readFileSync('/dev/stdin', 'utf8');
  } catch (e) {
    // Windows doesn't have /dev/stdin, try reading from environment
    input = process.env.STOP_HOOK_INPUT || '{}';
  }

  let hookInput;
  try {
    hookInput = JSON.parse(input);
  } catch (e) {
    hookInput = {};
  }

  const { status, loop_count = 0 } = hookInput;

  // If agent completed or max iterations reached, stop
  if (status === 'completed' || status === 'aborted' || status === 'error') {
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  if (loop_count >= MAX_ITERATIONS) {
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  // Check if Superteam state file exists
  if (!fs.existsSync(STATE_FILE)) {
    // No Superteam session active, stop
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  // Read current state
  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  // Check if pipeline is complete
  if (state.phase === 'complete') {
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  // Pipeline not complete, provide follow-up message
  const phase = state.phase || 'unknown';
  const phaseStep = state.phase_step || 'unknown';
  const currentIncrement = state.loop?.current_increment || 0;
  const totalIncrements = state.loop?.total_increments || 0;

  const followupMessage = [
    `[Iteration ${loop_count + 1}/${MAX_ITERATIONS}] Superteam pipeline not complete.`,
    `Current phase: ${phase}`,
    `Current step: ${phaseStep}`,
    `Progress: ${currentIncrement}/${totalIncrements} increments`,
    '',
    'Continue the pipeline from where it left off.',
    'Read .superteam/state.json for current state.',
    'Follow the workflow defined in .cursor/skills/superteam/SKILL.md.'
  ].join('\n');

  console.log(JSON.stringify({
    followup_message: followupMessage
  }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({}));
  process.exit(0);
});
