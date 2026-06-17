#!/usr/bin/env node
/**
 * Gate Script: API Endpoint Works
 * 
 * Verifies that an API endpoint responds correctly.
 * Usage: node gate-02-api-endpoint.js <url> <expected-status>
 * Exit 0 = pass, Exit 1 = fail
 */

const http = require('http');
const https = require('https');

function test() {
  const url = process.argv[2];
  const expectedStatus = parseInt(process.argv[3] || '200');
  
  if (!url) {
    console.error('Usage: node gate-02-api-endpoint.js <url> <expected-status>');
    process.exit(2);
  }
  
  console.log(`Testing endpoint: ${url}`);
  console.log(`Expected status: ${expectedStatus}`);
  
  const client = url.startsWith('https') ? https : http;
  
  client.get(url, (res) => {
    if (res.statusCode === expectedStatus) {
      console.log(`PASS: Endpoint returned ${res.statusCode}`);
      process.exit(0);
    } else {
      console.error(`FAIL: Expected ${expectedStatus}, got ${res.statusCode}`);
      process.exit(1);
    }
  }).on('error', (err) => {
    console.error(`FAIL: Request failed: ${err.message}`);
    process.exit(1);
  });
}

test();
