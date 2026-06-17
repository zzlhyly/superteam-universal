#!/usr/bin/env node
/**
 * Gate Script: File Exists
 * 
 * Verifies that a specific file exists.
 * Usage: node gate-01-file-exists.js <filepath>
 * Exit 0 = pass, Exit 1 = fail
 */

const fs = require('fs');
const path = require('path');

function test() {
  const filepath = process.argv[2];
  
  if (!filepath) {
    console.error('Usage: node gate-01-file-exists.js <filepath>');
    process.exit(2);
  }
  
  const fullPath = path.resolve(filepath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`PASS: File exists: ${filepath}`);
    process.exit(0);
  } else {
    console.error(`FAIL: File not found: ${filepath}`);
    process.exit(1);
  }
}

test();
