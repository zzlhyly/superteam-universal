#!/usr/bin/env node
/**
 * Preconditions Script
 * 
 * Verifies that all prerequisites are met before starting work.
 * Exit 0 = all preconditions met, Exit 1 = preconditions failed
 */

const { execSync } = require('child_process');
const fs = require('fs');

function checkPreconditions() {
  const failures = [];
  
  // Check Node.js version
  try {
    const nodeVersion = process.version;
    console.log(`Node.js version: ${nodeVersion}`);
    
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (major < 16) {
      failures.push(`Node.js >= 16 required, got ${nodeVersion}`);
    }
  } catch (error) {
    failures.push('Cannot determine Node.js version');
  }
  
  // Check npm available
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`npm version: ${npmVersion}`);
  } catch (error) {
    failures.push('npm not available');
  }
  
  // Check package.json exists
  if (!fs.existsSync('package.json')) {
    failures.push('package.json not found');
  } else {
    console.log('package.json found');
    
    // Check if dependencies installed
    if (!fs.existsSync('node_modules')) {
      console.log('node_modules not found, running npm install...');
      try {
        execSync('npm install', { encoding: 'utf8', stdio: 'pipe' });
        console.log('Dependencies installed');
      } catch (error) {
        failures.push('npm install failed');
      }
    } else {
      console.log('node_modules found');
    }
  }
  
  // Report results
  if (failures.length > 0) {
    console.error('\nPreconditions FAILED:');
    failures.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log('\nAll preconditions met');
    process.exit(0);
  }
}

checkPreconditions();
