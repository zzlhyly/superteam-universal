#!/usr/bin/env node
/**
 * Message Bus for Superteam OpenCode
 * 
 * File-based message queue for inter-agent communication.
 * Replaces SendMessage with file-based routing.
 * 
 * Usage:
 *   node message-bus.js send <from> <to> <type> <message>
 *   node message-bus.js receive <agent> [--peek]
 *   node message-bus.js ack <agent> <message-id>
 *   node message-bus.js list [--all]
 *   node message-bus.js route <message-file>
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPERTEAM_DIR = process.env.SUPERTEAM_DIR || '.superteam';
const MESSAGES_DIR = path.join(SUPERTEAM_DIR, 'messages');
const EVENTS_FILE = path.join(SUPERTEAM_DIR, 'events.jsonl');

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate unique message ID
function generateId() {
  return `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// Append to events log
function appendEvent(event) {
  ensureDir(SUPERTEAM_DIR);
  const line = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString()
  }) + '\n';
  fs.appendFileSync(EVENTS_FILE, line);
}

// Send message
function send(from, to, type, message) {
  ensureDir(MESSAGES_DIR);
  
  const id = generateId();
  const msg = {
    id,
    from,
    to,
    type,
    message,
    timestamp: new Date().toISOString(),
    acknowledged: false
  };
  
  // Write to recipient's queue
  const recipientDir = path.join(MESSAGES_DIR, to);
  ensureDir(recipientDir);
  
  const msgFile = path.join(recipientDir, `${id}.json`);
  fs.writeFileSync(msgFile, JSON.stringify(msg, null, 2));
  
  // Also write to sender's outbox
  const senderDir = path.join(MESSAGES_DIR, `${from}_outbox`);
  ensureDir(senderDir);
  fs.writeFileSync(path.join(senderDir, `${id}.json`), JSON.stringify(msg, null, 2));
  
  // Log to events
  appendEvent({
    type: 'message_sent',
    id,
    from,
    to,
    message_type: type,
    summary: message.substring(0, 100)
  });
  
  console.log(`Message sent: ${id}`);
  console.log(`From: ${from}`);
  console.log(`To: ${to}`);
  console.log(`Type: ${type}`);
  return id;
}

// Receive messages for an agent
function receive(agent, peek = false) {
  const recipientDir = path.join(MESSAGES_DIR, agent);
  
  if (!fs.existsSync(recipientDir)) {
    console.log('No messages');
    return [];
  }
  
  const files = fs.readdirSync(recipientDir)
    .filter(f => f.endsWith('.json'))
    .sort();
  
  if (files.length === 0) {
    console.log('No messages');
    return [];
  }
  
  const messages = [];
  for (const file of files) {
    const msgPath = path.join(recipientDir, file);
    const msg = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
    
    if (!msg.acknowledged) {
      messages.push(msg);
      console.log(`[${msg.id}] From: ${msg.from}, Type: ${msg.type}`);
      console.log(`  ${msg.message.substring(0, 200)}`);
      console.log('');
      
      if (!peek) {
        // Mark as read
        msg.read = true;
        fs.writeFileSync(msgPath, JSON.stringify(msg, null, 2));
      }
    }
  }
  
  if (messages.length === 0) {
    console.log('No unread messages');
  }
  
  return messages;
}

// Acknowledge message
function ack(agent, messageId) {
  const msgPath = path.join(MESSAGES_DIR, agent, `${messageId}.json`);
  
  if (!fs.existsSync(msgPath)) {
    console.error(`Message not found: ${messageId}`);
    return false;
  }
  
  const msg = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
  msg.acknowledged = true;
  msg.ack_timestamp = new Date().toISOString();
  fs.writeFileSync(msgPath, JSON.stringify(msg, null, 2));
  
  appendEvent({
    type: 'message_acknowledged',
    id: messageId,
    agent
  });
  
  console.log(`Acknowledged: ${messageId}`);
  return true;
}

// List all messages
function listAll() {
  ensureDir(MESSAGES_DIR);
  
  const agents = fs.readdirSync(MESSAGES_DIR);
  let total = 0;
  
  for (const agent of agents) {
    const agentDir = path.join(MESSAGES_DIR, agent);
    if (!fs.statSync(agentDir).isDirectory()) continue;
    
    const files = fs.readdirSync(agentDir).filter(f => f.endsWith('.json'));
    const unread = files.filter(f => {
      const msg = JSON.parse(fs.readFileSync(path.join(agentDir, f), 'utf8'));
      return !msg.acknowledged;
    });
    
    if (unread.length > 0) {
      console.log(`${agent}: ${unread.length} unread / ${files.length} total`);
      total += unread.length;
    }
  }
  
  if (total === 0) {
    console.log('No pending messages');
  }
}

// Route message from file
function route(messageFile) {
  if (!fs.existsSync(messageFile)) {
    console.error(`File not found: ${messageFile}`);
    return;
  }
  
  const msg = JSON.parse(fs.readFileSync(messageFile, 'utf8'));
  send(msg.from, msg.to, msg.type, msg.message);
}

// Main
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'send':
    if (args.length < 5) {
      console.error('Usage: message-bus.js send <from> <to> <type> <message>');
      process.exit(1);
    }
    send(args[1], args[2], args[3], args.slice(4).join(' '));
    break;
    
  case 'receive':
    if (!args[1]) {
      console.error('Usage: message-bus.js receive <agent> [--peek]');
      process.exit(1);
    }
    receive(args[1], args[2] === '--peek');
    break;
    
  case 'ack':
    if (!args[2]) {
      console.error('Usage: message-bus.js ack <agent> <message-id>');
      process.exit(1);
    }
    ack(args[1], args[2]);
    break;
    
  case 'list':
    listAll();
    break;
    
  case 'route':
    if (!args[1]) {
      console.error('Usage: message-bus.js route <message-file>');
      process.exit(1);
    }
    route(args[1]);
    break;
    
  default:
    console.log('Usage: node message-bus.js <command>');
    console.log('Commands:');
    console.log('  send <from> <to> <type> <msg>  Send message');
    console.log('  receive <agent> [--peek]        Receive messages');
    console.log('  ack <agent> <id>                Acknowledge message');
    console.log('  list [--all]                    List pending messages');
    console.log('  route <file>                    Route message from file');
    process.exit(1);
}
