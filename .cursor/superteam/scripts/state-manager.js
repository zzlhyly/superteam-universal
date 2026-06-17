#!/usr/bin/env node
/**
 * State Manager for Superteam OpenCode
 * 
 * Manages .superteam/state.json with atomic read/write operations.
 * Cross-platform implementation replacing state-mutate.sh.
 * 
 * Usage:
 *   node state-manager.js init
 *   node state-manager.js get <path>
 *   node state-manager.js set <field>=<value>
 *   node state-manager.js status
 */

const fs = require('fs');
const path = require('path');

const SUPERTEAM_DIR = process.env.SUPERTEAM_DIR || '.superteam';
const STATE_FILE = path.join(SUPERTEAM_DIR, 'state.json');
const STATE_LOCK = path.join(SUPERTEAM_DIR, 'state.json.lock');

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read state file
function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    throw new Error(`State file not found: ${STATE_FILE}`);
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

// Write state file atomically
function writeState(state) {
  const tmpFile = `${STATE_FILE}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2));
  fs.renameSync(tmpFile, STATE_FILE);
}

// Initialize state
function initState() {
  ensureDir(SUPERTEAM_DIR);
  
  if (fs.existsSync(STATE_FILE)) {
    const state = readState();
    if (state.revision !== undefined) {
      console.log('State file already exists, skipping init');
      return;
    }
  }

  const timestamp = new Date().toISOString();
  const state = {
    revision: 0,
    schema_version: 1,
    phase: 'pm',
    phase_step: 'init',
    session: {
      started: timestamp,
      last_checkpoint: timestamp,
      task_form: process.env.SUPERTEAM_TASK_FORM || 'engineering',
      form_dir: process.env.SUPERTEAM_FORM_DIR || null
    },
    loop: {
      current_increment: 0,
      total_increments: 0,
      completed_increments: 0,
      active_pairs: 0,
      max_parallel_pairs: parseInt(process.env.SUPERTEAM_MAX_PARALLEL || '2'),
      global_iteration_count: 0,
      max_iterations: 100,
      manager_cycle_count: 0
    },
    agents: {
      active_agents: [],
      spawn_history: [],
      architect_status: 'not_spawned',
      architect_restarts: 0,
      explorer_status: 'not_spawned'
    },
    watchdog_stall_count: 0
  };

  writeState(state);
  console.log('State initialized successfully');
}

// Get value by path
function getValue(jqPath) {
  const state = readState();
  const parts = jqPath.split('.').filter(p => p);
  
  let value = state;
  for (const part of parts) {
    if (value === undefined || value === null) {
      console.log('null');
      return;
    }
    value = value[part];
  }
  
  console.log(JSON.stringify(value, null, 2));
}

// Set value by field=value
function setValue(fieldValue) {
  const eqIndex = fieldValue.indexOf('=');
  if (eqIndex === -1) {
    throw new Error('Invalid format. Use: field=value');
  }
  
  const field = fieldValue.substring(0, eqIndex);
  let value = fieldValue.substring(eqIndex + 1);
  
  // Try to parse as JSON
  try {
    value = JSON.parse(value);
  } catch (e) {
    // Keep as string
  }
  
  const state = readState();
  
  // Support nested fields with dot notation
  const parts = field.split('.');
  let obj = state;
  for (let i = 0; i < parts.length - 1; i++) {
    if (obj[parts[i]] === undefined) {
      obj[parts[i]] = {};
    }
    obj = obj[parts[i]];
  }
  
  obj[parts[parts.length - 1]] = value;
  state.revision = (state.revision || 0) + 1;
  
  writeState(state);
  console.log(`Set ${field} = ${JSON.stringify(value)}`);
}

// Show status
function showStatus() {
  try {
    const state = readState();
    console.log('=== Superteam Status ===');
    console.log(`Phase: ${state.phase}`);
    console.log(`Step: ${state.phase_step}`);
    console.log(`Revision: ${state.revision}`);
    console.log(`Active Agents: ${state.agents.active_agents.join(', ') || 'none'}`);
    console.log(`Increments: ${state.loop.completed_increments}/${state.loop.total_increments}`);
    console.log(`Manager Cycles: ${state.loop.manager_cycle_count}`);
    console.log(`Watchdog Stalls: ${state.watchdog_stall_count}`);
  } catch (e) {
    console.log('No active session');
  }
}

// Main
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
    initState();
    break;
  case 'get':
    if (!args[1]) {
      console.error('Usage: state-manager.js get <path>');
      process.exit(1);
    }
    getValue(args[1]);
    break;
  case 'set':
    if (!args[1]) {
      console.error('Usage: state-manager.js set <field>=<value>');
      process.exit(1);
    }
    setValue(args[1]);
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('Usage: node state-manager.js <command>');
    console.log('Commands:');
    console.log('  init              Initialize state file');
    console.log('  get <path>        Get value by path (e.g., .phase)');
    console.log('  set <field>=<val> Set field value');
    console.log('  status            Show current status');
    process.exit(1);
}
