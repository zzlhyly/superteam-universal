#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

const SUPERTEAM_DIR = '.superteam';
const VALIDATION_COMMANDS_FILE = `${SUPERTEAM_DIR}/validation-commands.txt`;

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let hookInput = {};
  try { hookInput = JSON.parse(input); } catch (e) { /* empty */ }

  const toolInput = hookInput.input || {};
  const command = toolInput.command || '';

  if (!command.includes('git commit')) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  if (!fs.existsSync(VALIDATION_COMMANDS_FILE)) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  const validationCommands = fs.readFileSync(VALIDATION_COMMANDS_FILE, 'utf8').trim();
  if (!validationCommands) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  const commands = validationCommands.split(',').map(c => c.trim()).filter(Boolean);
  const failures = [];

  for (const cmd of commands) {
    try {
      execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000 });
    } catch (e) {
      failures.push({ command: cmd, exitCode: e.status || 1, output: (e.stdout || e.stderr || e.message).substring(0, 500) });
    }
  }

  if (failures.length > 0) {
    const msg = [
      '',
      '==============================',
      `COMMIT BLOCKED: ${failures.length} invariant(s) failed`,
      '==============================',
      '',
      ...failures.map(f => `FAILED: ${f.command} (exit code ${f.exitCode})\n${f.output}`),
      '',
      'Fix the failures above and try committing again.',
      'If you believe an invariant check is incorrect, report a GATE-CHALLENGE.'
    ].join('\n');
    process.stderr.write(msg);
    process.stdout.write(JSON.stringify({ decision: "block", reason: msg }));
    process.exit(2);
  }

  process.stdout.write(JSON.stringify({}));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}));
  process.exit(0);
});
