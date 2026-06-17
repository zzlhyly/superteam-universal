import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';

const SUPERTEAM_DIR = '.superteam';
const VALIDATION_COMMANDS_FILE = `${SUPERTEAM_DIR}/validation-commands.txt`;
const STATE_FILE = join(SUPERTEAM_DIR, 'state.json');
const GATE_RESULTS_DIR = join(SUPERTEAM_DIR, 'gate-results');
const VERDICTS_DIR = join(SUPERTEAM_DIR, 'verdicts');
const CONTRACTS_DIR = join(SUPERTEAM_DIR, 'contracts');

function getCommand(input) {
  return input?.input?.command || input?.command || '';
}

function getFilePath(input) {
  return input?.input?.path || input?.input?.file_path || input?.path || '';
}

function checkInvariantBeforeCommit(input) {
  if (input.tool !== 'bash') return;

  const command = getCommand(input);
  if (!command.includes('git commit')) return;

  if (!existsSync(VALIDATION_COMMANDS_FILE)) return;

  const validationCommands = readFileSync(VALIDATION_COMMANDS_FILE, 'utf8').trim();
  if (!validationCommands) return;

  const commands = validationCommands.split(',').map((c) => c.trim()).filter(Boolean);
  const failures = [];

  for (const cmd of commands) {
    try {
      execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000 });
    } catch (e) {
      failures.push({
        command: cmd,
        exitCode: e.status || 1,
        output: (e.stdout || e.stderr || e.message || '').substring(0, 500),
      });
    }
  }

  if (failures.length > 0) {
    const msg = [
      '',
      '==============================',
      `COMMIT BLOCKED: ${failures.length} invariant(s) failed`,
      '==============================',
      '',
      ...failures.map(
        (f) => `FAILED: ${f.command} (exit code ${f.exitCode})\n${f.output}`
      ),
      '',
      'Fix the failures above and try committing again.',
      'If you believe an invariant check is incorrect, report a GATE-CHALLENGE.',
    ].join('\n');
    throw new Error(msg);
  }
}

function resolveGateResultsFile(filePath) {
  const filename = basename(filePath);

  if (filename.startsWith('plan-evaluation') || filename.startsWith('draft-')) {
    return null;
  }

  const incrementMatch = filename.match(/^increment-(\d+)\.md$/);
  if (incrementMatch) {
    return {
      gateFile: join(GATE_RESULTS_DIR, `increment-${incrementMatch[1]}.json`),
      displayId: `increment ${incrementMatch[1]}`,
    };
  }

  if (filename.includes('strict-evaluation')) {
    return {
      gateFile: join(GATE_RESULTS_DIR, 'final-integration.json'),
      displayId: 'strict evaluation',
    };
  }

  return null;
}

function checkVerdictGateBeforeWrite(input) {
  const writeTools = ['write', 'edit', 'apply_patch'];
  if (!writeTools.includes(input.tool)) return;

  const filePath = getFilePath(input);
  if (!filePath) return;

  const isVerdictPath =
    filePath.includes(`${VERDICTS_DIR}/`) ||
    filePath.includes(`${VERDICTS_DIR}\\`) ||
    filePath.includes('verdicts/increment-') ||
    filePath.includes('verdicts\\increment-') ||
    filePath.includes('verdicts/strict-evaluation') ||
    filePath.includes('verdicts\\strict-evaluation');

  if (!isVerdictPath) return;

  const resolved = resolveGateResultsFile(filePath);
  if (!resolved) return;

  const { gateFile, displayId } = resolved;

  if (!existsSync(gateFile)) {
    throw new Error(
      [
        '',
        '==============================',
        `VERDICT BLOCKED: Gate results file missing for ${displayId}.`,
        'You must run: node .opencode/skills/superteam/scripts/gate-runner.js run <increment>',
        'DO NOT write verdicts based on LLM reasoning alone.',
        '==============================',
      ].join('\n')
    );
  }

  let gateResults;
  try {
    gateResults = JSON.parse(readFileSync(gateFile, 'utf8'));
  } catch {
    throw new Error(
      `VERDICT BLOCKED: Gate results file is malformed for ${displayId}.`
    );
  }

  if (gateResults.all_passed === undefined) {
    throw new Error(
      `VERDICT BLOCKED: Gate results missing "all_passed" field for ${displayId}.`
    );
  }
}

function findIncrementsWithoutVerdicts() {
  if (!existsSync(CONTRACTS_DIR)) return [];

  const contractFiles = readdirSync(CONTRACTS_DIR).filter((f) =>
    /^increment-\d+\.md$/.test(f)
  );

  return contractFiles
    .map((f) => {
      const match = f.match(/^increment-(\d+)\.md$/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .filter((n) => !existsSync(join(VERDICTS_DIR, `increment-${n}.md`)));
}

function completionNudgeOnIdle() {
  if (!existsSync(STATE_FILE)) return;

  let state;
  try {
    state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    console.warn('WARNING: .superteam/state.json exists but is malformed.');
    return;
  }

  if (!state.phase || state.phase === 'complete') return;

  const missingVerdicts = findIncrementsWithoutVerdicts();
  if (missingVerdicts.length === 0) return;

  const messages = [
    'SUPERTEAM COMPLETION NUDGE',
    `Active session detected (phase: ${state.phase}, step: ${state.phase_step || 'unknown'}).`,
    `Increments without verdicts: ${missingVerdicts.join(', ')}`,
    'Complete evaluation for all increments before finishing the session.',
    `Progress: ${(state.loop && state.loop.completed_increments) || 0}/${(state.loop && state.loop.total_increments) || '?'} increments`,
  ];

  console.warn(messages.join('\n'));
}

function startupCheckOnSessionCreated() {
  if (!existsSync(STATE_FILE)) return;

  let state;
  try {
    state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    console.warn('WARNING: .superteam/state.json exists but is malformed.');
    return;
  }

  if (state.phase && state.phase !== 'complete') {
    const msg = [
      'Superteam session detected:',
      `  Phase: ${state.phase}`,
      `  Step: ${state.phase_step || 'unknown'}`,
      `  Increments: ${(state.loop && state.loop.completed_increments) || 0}/${(state.loop && state.loop.total_increments) || 0}`,
      'Use the superteam skill to resume or read .superteam/state.json for details.',
    ].join('\n');
    console.warn(msg);
  }
}

export const SuperteamHooks = async () => {
  return {
    'tool.execute.before': async (input) => {
      checkInvariantBeforeCommit(input);
      checkVerdictGateBeforeWrite(input);
    },

    'session.idle': async () => {
      completionNudgeOnIdle();
    },

    'session.created': async () => {
      startupCheckOnSessionCreated();
    },
  };
};
