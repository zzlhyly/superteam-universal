#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SUPERTEAM_DIR = '.superteam';
const GATE_RESULTS_DIR = path.join(SUPERTEAM_DIR, 'gate-results');
const VERDICTS_DIR = path.join(SUPERTEAM_DIR, 'verdicts');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let hookInput = {};
  try { hookInput = JSON.parse(input); } catch (e) { /* empty */ }

  const toolInput = hookInput.input || {};
  const filePath = toolInput.path || toolInput.file_path || '';

  if (!filePath || !filePath.includes(VERDICTS_DIR + '/') && !filePath.includes(VERDICTS_DIR + '\\')) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  const filename = path.basename(filePath);
  let gateFile = '';
  let displayId = '';

  if (filename.startsWith('plan-evaluation') || filename.startsWith('draft-')) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  const incrementMatch = filename.match(/^increment-(\d+)\.md$/);
  const versionMatch = filename.match(/^version-(\d+)\.md$/);

  if (incrementMatch) {
    const n = incrementMatch[1];
    gateFile = path.join(GATE_RESULTS_DIR, `increment-${n}.json`);
    displayId = `increment ${n}`;
  } else if (versionMatch) {
    const n = versionMatch[1];
    gateFile = path.join(GATE_RESULTS_DIR, `version-${n}.json`);
    displayId = `version ${n}`;
  } else if (filename.includes('final-integration') || filename.includes('integration') || filename.includes('strict-evaluation')) {
    gateFile = path.join(GATE_RESULTS_DIR, 'final-integration.json');
    displayId = 'final integration';
  } else {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  function blockVerdict(reason) {
    const msg = [
      '',
      '==============================',
      `VERDICT BLOCKED: ${reason} for ${displayId}.`,
      `You must run: node .cursor/skills/superteam/scripts/gate-runner.js run <increment>`,
      'DO NOT write verdicts based on LLM reasoning alone.',
      '=============================='
    ].join('\n');
    process.stderr.write(msg);
    process.stdout.write(JSON.stringify({ decision: "block", reason: msg }));
    process.exit(2);
  }

  if (!fs.existsSync(gateFile)) {
    blockVerdict('Gate results file missing');
  }

  const stat = fs.statSync(gateFile);
  if (stat.size === 0) {
    blockVerdict('Gate results file is empty');
  }

  const content = fs.readFileSync(gateFile, 'utf8');
  if (!content.includes('"gates"')) {
    blockVerdict('Gate results file is malformed (missing "gates" key)');
  }

  process.stdout.write(JSON.stringify({}));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}));
  process.exit(0);
});
