#!/usr/bin/env node
/**
 * Example Gate Script: Tests Passing
 * 
 * Verifies that all tests pass.
 * Exit 0 = pass, Exit 1 = fail
 */

const { execSync } = require('child_process');

function test() {
  try {
    console.log('Running tests...');
    execSync('npm test', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('PASS: All tests passing');
    process.exit(0);
  } catch (error) {
    console.error('FAIL: Tests failed');
    console.error(error.stdout || error.stderr);
    process.exit(1);
  }
}

test();
