#!/usr/bin/env node
/**
 * Session Initializer for Superteam OpenCode
 * 
 * Initializes a new Superteam session with all required directories and files.
 * Usage: node init-session.js [form-name]
 */

const fs = require('fs');
const path = require('path');

const SUPERTEAM_DIR = '.superteam';
const FORM_NAME = process.argv[2] || 'engineering';

// Directory structure
const DIRECTORIES = [
  SUPERTEAM_DIR,
  `${SUPERTEAM_DIR}/contracts`,
  `${SUPERTEAM_DIR}/scripts/final`,
  `${SUPERTEAM_DIR}/attempts`,
  `${SUPERTEAM_DIR}/verdicts`,
  `${SUPERTEAM_DIR}/gate-results`,
  `${SUPERTEAM_DIR}/knowledge/findings`,
  `${SUPERTEAM_DIR}/messages`
];

// Template files
const TEMPLATES = {
  [`${SUPERTEAM_DIR}/metrics.md`]: `---
started: "${new Date().toISOString()}"
completed: null
---

## Phase Timing
| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|

## Per-Increment Metrics
| # | Name | Type | Attempts | Iterations | Duration | Status |
|---|------|------|----------|------------|----------|--------|

## Manager Heuristics (Current)
- Avg iterations per increment: 0
- Avg time per increment: 0
- Exploration increments inserted: 0
- Architect restarts: 0

## Summary
- Total iterations: 0
- Context resets: 0
- Plan mutations: 0
- Exploration increments: 0
- Explorer queries: 0
- Architect checkpoints: 0
`,
  [`${SUPERTEAM_DIR}/lessons-learned.md`]: `---
last_updated: "${new Date().toISOString()}"
---

(No lessons yet - Generator and Evaluator will append discoveries after each increment.)
`,
  [`${SUPERTEAM_DIR}/knowledge/index.md`]: `---
last_updated: "${new Date().toISOString()}"
total_findings: 0
---

## Topics Explored

| # | Topic | File | Requested By | Depth |
|---|-------|------|--------------|-------|
`
};

function initialize() {
  console.log('Initializing Superteam session...');
  console.log(`Form: ${FORM_NAME}`);
  console.log('');
  
  // Create directories
  console.log('Creating directories...');
  for (const dir of DIRECTORIES) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  Created: ${dir}`);
    } else {
      console.log(`  Exists: ${dir}`);
    }
  }
  
  // Create template files
  console.log('\nCreating template files...');
  for (const [filepath, content] of Object.entries(TEMPLATES)) {
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, content);
      console.log(`  Created: ${filepath}`);
    } else {
      console.log(`  Exists: ${filepath}`);
    }
  }
  
  // Initialize state
  console.log('\nInitializing state...');
  try {
    const { execSync } = require('child_process');
    execSync('node .cursor/skills/superteam/scripts/state-manager.js init', { encoding: 'utf8' });
    console.log('  State initialized');
  } catch (error) {
    console.error('  Warning: Could not initialize state via state-manager.js');
    console.error('  Run manually: node .cursor/skills/superteam/scripts/state-manager.js init');
  }
  
  // Create empty events file
  const eventsFile = `${SUPERTEAM_DIR}/events.jsonl`;
  if (!fs.existsSync(eventsFile)) {
    fs.writeFileSync(eventsFile, '');
    console.log(`  Created: ${eventsFile}`);
  }
  
  // Create empty strict evaluations file
  const strictFile = `${SUPERTEAM_DIR}/strict-evaluations.jsonl`;
  if (!fs.existsSync(strictFile)) {
    fs.writeFileSync(strictFile, '');
    console.log(`  Created: ${strictFile}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Superteam session initialized successfully!');
  console.log('='.repeat(50));
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: node .cursor/skills/superteam/scripts/state-manager.js status');
  console.log('2. Start the pipeline with /superteam command');
  console.log('');
  console.log('Directory structure:');
  console.log(`  ${SUPERTEAM_DIR}/`);
  console.log('  ├── contracts/');
  console.log('  ├── scripts/');
  console.log('  │   └── final/');
  console.log('  ├── attempts/');
  console.log('  ├── verdicts/');
  console.log('  ├── gate-results/');
  console.log('  ├── knowledge/');
  console.log('  │   └── findings/');
  console.log('  ├── messages/');
  console.log('  ├── state.json');
  console.log('  ├── events.jsonl');
  console.log('  ├── metrics.md');
  console.log('  └── lessons-learned.md');
}

initialize();
