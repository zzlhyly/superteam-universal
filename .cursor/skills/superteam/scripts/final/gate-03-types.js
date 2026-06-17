#!/usr/bin/env node
/**
 * Example Gate Script: Types Check
 * 
 * Verifies that TypeScript type checking passes.
 * Exit 0 = pass, Exit 1 = fail
 */

const { execSync } = require('child_process');

function test() {
  try {
    console.log('Running type check...');
    execSync('npm run typecheck', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('PASS: Types check passed');
    process.exit(0);
  } catch (error) {
    console.error('FAIL: Type check failed');
    console.error(error.stdout || error.stderr);
    process.exit(1);
  }
}

test();
