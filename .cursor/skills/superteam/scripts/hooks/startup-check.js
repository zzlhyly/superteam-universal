#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SUPERTEAM_DIR = '.superteam';
const STATE_FILE = path.join(SUPERTEAM_DIR, 'state.json');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  if (!fs.existsSync(STATE_FILE)) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    process.stderr.write('WARNING: .superteam/state.json exists but is malformed.');
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  if (state.phase && state.phase !== 'complete') {
    const msg = [
      'Superteam session detected:',
      `  Phase: ${state.phase}`,
      `  Step: ${state.phase_step || 'unknown'}`,
      `  Increments: ${(state.loop && state.loop.completed_increments) || 0}/${(state.loop && state.loop.total_increments) || 0}`,
      'Use /superteam to resume or read .superteam/state.json for details.'
    ].join('\n');
    process.stderr.write(msg);
  }

  process.stdout.write(JSON.stringify({}));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}));
  process.exit(0);
});
