#!/usr/bin/env node
/**
 * Example Gate Script: Lint Clean
 * 
 * Verifies that lint passes with no warnings.
 * Exit 0 = pass, Exit 1 = fail
 */

const { execSync } = require('child_process');

function test() {
  try {
    console.log('Running linter...');
    const output = execSync('npm run lint', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Check for warnings
    if (output.includes('warning') || output.includes('Warning')) {
      console.error('FAIL: Lint warnings found');
      console.error(output);
      process.exit(1);
    }
    
    console.log('PASS: Lint clean');
    process.exit(0);
  } catch (error) {
    console.error('FAIL: Lint failed');
    console.error(error.stdout || error.stderr);
    process.exit(1);
  }
}

test();
