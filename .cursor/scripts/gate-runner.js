#!/usr/bin/env node
/**
 * Gate Runner for Superteam OpenCode
 * 
 * Runs gate scripts and collects results.
 * Cross-platform implementation replacing run-gates.sh.
 * 
 * Usage:
 *   node gate-runner.js run <increment>
 *   node gate-runner.js final
 *   node gate-runner.js check <increment> <gate-name>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUPERTEAM_DIR = process.env.SUPERTEAM_DIR || '.superteam';
const RESULTS_DIR = path.join(SUPERTEAM_DIR, 'gate-results');

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Run a single gate script
function runGate(scriptPath, args = []) {
  const startTime = Date.now();
  let output = '';
  let exitCode = 0;
  
  try {
    // Determine script type and run accordingly
    const ext = path.extname(scriptPath).toLowerCase();
    let command;
    
    if (ext === '.js') {
      command = `node "${scriptPath}" ${args.join(' ')}`;
    } else if (ext === '.py') {
      command = `python "${scriptPath}" ${args.join(' ')}`;
    } else if (ext === '.sh') {
      // On Windows, try bash; on Unix, run directly
      if (process.platform === 'win32') {
        command = `bash "${scriptPath}" ${args.join(' ')}`;
      } else {
        command = `bash "${scriptPath}" ${args.join(' ')}`;
      }
    } else {
      command = `"${scriptPath}" ${args.join(' ')}`;
    }
    
    output = execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000 // 1 minute timeout
    });
  } catch (e) {
    exitCode = e.status || 1;
    output = e.stdout || e.stderr || e.message;
  }
  
  const duration = Date.now() - startTime;
  
  return {
    script: path.basename(scriptPath),
    status: exitCode === 0 ? 'pass' : 'fail',
    exit_code: exitCode,
    duration_ms: duration,
    output: output.substring(0, 1000) // Limit output
  };
}

// Run all gates for an increment
function runGates(increment) {
  ensureDir(RESULTS_DIR);
  
  // Determine scripts directory
  let scriptsDir;
  let resultsFile;
  
  if (increment === 'final') {
    scriptsDir = path.join(SUPERTEAM_DIR, 'scripts', 'final');
    resultsFile = path.join(RESULTS_DIR, 'final-integration.json');
  } else {
    scriptsDir = path.join(SUPERTEAM_DIR, 'scripts', `increment-${increment}`);
    resultsFile = path.join(RESULTS_DIR, `increment-${increment}.json`);
  }
  
  // Check if scripts directory exists
  if (!fs.existsSync(scriptsDir)) {
    console.error(`ERROR: No scripts directory at ${scriptsDir}`);
    console.error('The Architect must create gate scripts before execution.');
    return false;
  }
  
  // Find all gate scripts
  const gatePattern = /^gate-.*\.(js|py|sh)$/;
  const preconditionPattern = /^preconditions?\.(js|py|sh)$/;
  
  const scripts = fs.readdirSync(scriptsDir)
    .filter(f => gatePattern.test(f) || preconditionPattern.test(f))
    .sort();
  
  if (scripts.length === 0) {
    console.error(`ERROR: No gate scripts found in ${scriptsDir}`);
    return false;
  }
  
  console.log(`Running ${scripts.length} gates for increment ${increment}...`);
  console.log('='.repeat(50));
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const script of scripts) {
    const scriptPath = path.join(scriptsDir, script);
    console.log(`\n--- Running: ${script} ---`);
    
    const result = runGate(scriptPath);
    results.push(result);
    
    if (result.status === 'pass') {
      passed++;
      console.log(`  PASSED (${result.duration_ms}ms)`);
    } else {
      failed++;
      console.log(`  FAILED (exit ${result.exit_code}, ${result.duration_ms}ms)`);
      if (result.output) {
        console.log(`  Output: ${result.output.substring(0, 200)}`);
      }
    }
  }
  
  // Write results
  const resultsData = {
    increment: increment.toString(),
    timestamp: new Date().toISOString(),
    all_passed: failed === 0,
    total: scripts.length,
    passed,
    failed,
    gates: results
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify(resultsData, null, 2));
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (failed > 0) {
    console.log(`GATE RESULTS: ${failed}/${scripts.length} FAILED - all_passed: false`);
    console.log('EVALUATOR RULE: all_passed=false means your verdict is FAIL.');
  } else {
    console.log(`GATE RESULTS: ALL ${scripts.length} PASSED - all_passed: true`);
  }
  console.log('='.repeat(50));
  console.log(`Results written to: ${resultsFile}`);
  
  return failed === 0;
}

// Check a specific gate
function checkGate(increment, gateName) {
  let scriptsDir;
  
  if (increment === 'final') {
    scriptsDir = path.join(SUPERTEAM_DIR, 'scripts', 'final');
  } else {
    scriptsDir = path.join(SUPERTEAM_DIR, 'scripts', `increment-${increment}`);
  }
  
  // Find matching gate script
  const scripts = fs.readdirSync(scriptsDir)
    .filter(f => f.includes(gateName) && /\.(js|py|sh)$/.test(f));
  
  if (scripts.length === 0) {
    console.error(`Gate not found: ${gateName}`);
    return false;
  }
  
  const scriptPath = path.join(scriptsDir, scripts[0]);
  const result = runGate(scriptPath);
  
  console.log(`Gate: ${result.script}`);
  console.log(`Status: ${result.status}`);
  console.log(`Exit Code: ${result.exit_code}`);
  console.log(`Duration: ${result.duration_ms}ms`);
  if (result.output) {
    console.log(`Output:\n${result.output}`);
  }
  
  return result.status === 'pass';
}

// List available gates
function listGates(increment) {
  let scriptsDir;
  
  if (increment === 'final') {
    scriptsDir = path.join(SUPERTEAM_DIR, 'scripts', 'final');
  } else {
    scriptsDir = path.join(SUPERTEAM_DIR, 'scripts', `increment-${increment}`);
  }
  
  if (!fs.existsSync(scriptsDir)) {
    console.log(`No gates for increment ${increment}`);
    return;
  }
  
  const scripts = fs.readdirSync(scriptsDir)
    .filter(f => /\.(js|py|sh)$/.test(f))
    .sort();
  
  console.log(`Gates for increment ${increment}:`);
  for (const script of scripts) {
    console.log(`  - ${script}`);
  }
}

// Main
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'run':
    if (!args[1]) {
      console.error('Usage: gate-runner.js run <increment>');
      process.exit(1);
    }
    const success = runGates(args[1]);
    process.exit(success ? 0 : 1);
    break;
    
  case 'final':
    const finalSuccess = runGates('final');
    process.exit(finalSuccess ? 0 : 1);
    break;
    
  case 'check':
    if (!args[2]) {
      console.error('Usage: gate-runner.js check <increment> <gate-name>');
      process.exit(1);
    }
    const checkSuccess = checkGate(args[1], args[2]);
    process.exit(checkSuccess ? 0 : 1);
    break;
    
  case 'list':
    if (!args[1]) {
      console.error('Usage: gate-runner.js list <increment>');
      process.exit(1);
    }
    listGates(args[1]);
    break;
    
  default:
    console.log('Usage: node gate-runner.js <command>');
    console.log('Commands:');
    console.log('  run <increment>    Run all gates for increment');
    console.log('  final              Run final integration gates');
    console.log('  check <inc> <gate> Check specific gate');
    console.log('  list <increment>   List available gates');
    process.exit(1);
}
