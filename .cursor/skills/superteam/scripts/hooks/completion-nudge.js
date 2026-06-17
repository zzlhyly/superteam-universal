#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SUPERTEAM_DIR = '.superteam';
const STATE_FILE = path.join(SUPERTEAM_DIR, 'state.json');
const CONTRACTS_DIR = path.join(SUPERTEAM_DIR, 'contracts');

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
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  const currentIncrement = state.loop && state.loop.current_increment;
  if (!currentIncrement) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  const contractFile = path.join(CONTRACTS_DIR, `increment-${currentIncrement}.md`);
  if (!fs.existsSync(contractFile)) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  const verdictFile = path.join(SUPERTEAM_DIR, 'verdicts', `increment-${currentIncrement}.md`);
  const verdictExists = fs.existsSync(verdictFile);
  const contractContent = fs.readFileSync(contractFile, 'utf8');

  const messages = [];
  if (!verdictExists) {
    messages.push(`WARNING: No evaluation verdict found for increment ${currentIncrement}.`);
    messages.push('You must complete evaluation before finishing.');
  }

  messages.push(`COMPLETION NUDGE - Increment ${currentIncrement}`);
  messages.push('Before finishing, verify you have fully addressed the contract.');
  messages.push('Have ALL hard gates been run and passed?');

  process.stderr.write(messages.join('\n'));
  process.stdout.write(JSON.stringify({}));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}));
  process.exit(0);
});
