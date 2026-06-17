#!/usr/bin/env node
/**
 * Event Recorder for Superteam OpenCode
 * 
 * Appends events to the append-only event stream.
 * Cross-platform implementation replacing record-event.sh.
 * 
 * Usage:
 *   node record-event.js --actor <actor> --type <type> --payload <json>
 *   node record-event.js --actor <actor> --type <type> --summary <text>
 */

const fs = require('fs');
const path = require('path');

const SUPERTEAM_DIR = process.env.SUPERTEAM_DIR || '.superteam';
const EVENTS_FILE = path.join(SUPERTEAM_DIR, 'events.jsonl');

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Parse arguments
function parseArgs(args) {
  const result = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--actor' && args[i + 1]) {
      result.actor = args[++i];
    } else if (args[i] === '--type' && args[i + 1]) {
      result.type = args[++i];
    } else if (args[i] === '--payload' && args[i + 1]) {
      try {
        result.payload = JSON.parse(args[++i]);
      } catch (e) {
        console.error('Invalid JSON payload:', args[i]);
        process.exit(1);
      }
    } else if (args[i] === '--summary' && args[i + 1]) {
      result.summary = args[++i];
    } else if (args[i] === '--rationale' && args[i + 1]) {
      result.rationale = args[++i];
    } else if (args[i] === '--action' && args[i + 1]) {
      result.action = args[++i];
    }
  }
  
  return result;
}

// Record event
function recordEvent(options) {
  ensureDir(SUPERTEAM_DIR);
  
  const { actor, type, payload, summary, rationale, action } = options;
  
  if (!actor || !type) {
    console.error('Error: --actor and --type are required');
    process.exit(1);
  }
  
  // Build event
  const event = {
    timestamp: new Date().toISOString(),
    actor,
    type,
    payload: payload || {}
  };
  
  // Add summary if provided
  if (summary) {
    event.payload.summary = summary;
  }
  if (rationale) {
    event.payload.rationale = rationale;
  }
  if (action) {
    event.payload.action = action;
  }
  
  // Append to events file
  const line = JSON.stringify(event) + '\n';
  fs.appendFileSync(EVENTS_FILE, line);
  
  console.log(`Event recorded: ${type} by ${actor}`);
  if (summary) {
    console.log(`Summary: ${summary}`);
  }
  
  return event;
}

// Query events
function queryEvents(options) {
  if (!fs.existsSync(EVENTS_FILE)) {
    console.log('No events recorded');
    return [];
  }
  
  const content = fs.readFileSync(EVENTS_FILE, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  
  let events = lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      return null;
    }
  }).filter(e => e !== null);
  
  // Apply filters
  if (options.type) {
    events = events.filter(e => e.type === options.type);
  }
  if (options.actor) {
    events = events.filter(e => e.actor === options.actor);
  }
  if (options.since) {
    const since = new Date(options.since);
    events = events.filter(e => new Date(e.timestamp) >= since);
  }
  if (options.limit) {
    events = events.slice(-options.limit);
  }
  
  // Output
  for (const event of events) {
    console.log(`[${event.timestamp}] ${event.actor} - ${event.type}`);
    if (event.payload.summary) {
      console.log(`  Summary: ${event.payload.summary}`);
    }
    if (event.payload.action) {
      console.log(`  Action: ${event.payload.action}`);
    }
    console.log('');
  }
  
  return events;
}

// Get decision history for anomaly prevention
function getDecisions(anomalyId) {
  if (!fs.existsSync(EVENTS_FILE)) {
    return [];
  }
  
  const content = fs.readFileSync(EVENTS_FILE, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  
  const decisions = lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      return null;
    }
  }).filter(e => e !== null && e.type === 'decision');
  
  if (anomalyId) {
    return decisions.filter(d => d.payload && d.payload.anomaly_id === anomalyId);
  }
  
  return decisions;
}

// Main
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--actor':
    // Direct invocation with flags
    const options = parseArgs(args);
    recordEvent(options);
    break;
    
  case 'query':
    // Query events
    const queryArgs = args.slice(1);
    const queryOptions = {};
    for (let i = 0; i < queryArgs.length; i++) {
      if (queryArgs[i] === '--type' && queryArgs[i + 1]) {
        queryOptions.type = queryArgs[++i];
      } else if (queryArgs[i] === '--actor' && queryArgs[i + 1]) {
        queryOptions.actor = queryArgs[++i];
      } else if (queryArgs[i] === '--since' && queryArgs[i + 1]) {
        queryOptions.since = queryArgs[++i];
      } else if (queryArgs[i] === '--limit' && queryArgs[i + 1]) {
        queryOptions.limit = parseInt(queryArgs[++i]);
      }
    }
    queryEvents(queryOptions);
    break;
    
  case 'decisions':
    // Get decision history
    const anomalyId = args[1] || null;
    const decisions = getDecisions(anomalyId);
    console.log(JSON.stringify(decisions, null, 2));
    break;
    
  default:
    console.log('Usage: node record-event.js <command>');
    console.log('Commands:');
    console.log('  --actor <name> --type <type> --payload <json>  Record event');
    console.log('  --actor <name> --type <type> --summary <text>  Record with summary');
    console.log('  query [--type <type>] [--actor <actor>]        Query events');
    console.log('  decisions [anomaly-id]                         Get decision history');
    process.exit(1);
}
