#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { Store } from './db/store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');
const HOOKS_DIR = join(__dirname, 'hooks');

const HOOK_DEFS = [
  { event: 'PreCompact',        file: 'pre-compact.js',        matcher: 'auto|manual', timeout: 30 },
  { event: 'SessionStart',      file: 'session-start.js',                              timeout: 10 },
  { event: 'UserPromptSubmit',  file: 'user-prompt-submit.js',                         timeout: 5  },
  { event: 'Stop',              file: 'session-end.js',                                timeout: 15 },
  { event: 'SubagentStart',     file: 'subagent-start.js',                             timeout: 5  },
  { event: 'SubagentStop',      file: 'subagent-stop.js',                              timeout: 15 },
];

function loadSettings() {
  try { return existsSync(SETTINGS_PATH) ? JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8')) : {}; }
  catch { return {}; }
}

function saveSettings(s) {
  writeFileSync(SETTINGS_PATH, JSON.stringify(s, null, 4), 'utf-8');
}

function install() {
  const settings = loadSettings();
  if (!settings.hooks) settings.hooks = {};

  let added = 0;
  for (const h of HOOK_DEFS) {
    const cmd = `node ${join(HOOKS_DIR, h.file)}`;
    const entry = { hooks: [{ type: 'command', command: cmd, timeout: h.timeout }] };
    if (h.matcher) entry.matcher = h.matcher;

    if (!settings.hooks[h.event]) settings.hooks[h.event] = [];
    const exists = settings.hooks[h.event].some(e => e.hooks?.some(hk => hk.command === cmd));
    if (!exists) { settings.hooks[h.event].push(entry); added++; }
  }

  saveSettings(settings);
  console.log(`Secure Infinite Context installed.`);
  console.log(`  Hooks added : ${added}`);
  console.log(`  Settings    : ${SETTINGS_PATH}`);
  console.log(`  Data dir    : ${join(homedir(), '.claude', 'secure-infinite-context')}`);
  console.log(`\nRestart Claude Code for hooks to take effect.`);
}

function uninstall() {
  const settings = loadSettings();
  if (!settings.hooks) { console.log('No hooks found.'); return; }

  let removed = 0;
  for (const h of HOOK_DEFS) {
    const cmd = `node ${join(HOOKS_DIR, h.file)}`;
    if (!settings.hooks[h.event]) continue;
    const before = settings.hooks[h.event].length;
    settings.hooks[h.event] = settings.hooks[h.event].filter(
      e => !e.hooks?.some(hk => hk.command === cmd)
    );
    if (!settings.hooks[h.event].length) delete settings.hooks[h.event];
    removed += before - (settings.hooks[h.event]?.length ?? 0);
  }

  if (!Object.keys(settings.hooks).length) delete settings.hooks;
  saveSettings(settings);
  console.log(`Secure Infinite Context uninstalled.`);
  console.log(`  Hook entries removed : ${removed}`);
  console.log(`  Data preserved at    : ${join(homedir(), '.claude', 'secure-infinite-context')}`);
  console.log(`\nRestart Claude Code for changes to take effect.`);
}

function list(args) {
  const pi = args.indexOf('--project');
  const project = pi >= 0 ? resolve(args[pi + 1] ?? '.') : process.cwd();
  const li = args.indexOf('--limit');
  const limit = li >= 0 ? (parseInt(args[li + 1]) || 50) : 50;

  const db = new Store().open();
  try {
    const rows = db.listMemories(project, limit);
    if (!rows.length) { console.log(`No memories for: ${project}`); return; }
    console.log(`\nMemories for: ${project} (${rows.length})\n`);
    for (const m of rows) {
      console.log(`[${m.id}] [${m.category.padEnd(12)}] [score:${(m.score ?? 0).toFixed(2)}] ${m.content}`);
    }
  } finally { db.close(); }
}

function search(args) {
  const pi = args.indexOf('--project');
  const project = pi >= 0 ? resolve(args[pi + 1] ?? '.') : process.cwd();
  const query = args.filter(a => !a.startsWith('--') && a !== args[pi + 1]).join(' ');
  if (!query) { console.log('Usage: ic search <query> [--project path]'); return; }

  const db = new Store().open();
  try {
    const results = db.search(query, project, 20);
    if (!results.length) { console.log('No results found.'); return; }
    console.log(`\nResults for "${query}":\n`);
    for (const m of results) console.log(`[${m.id}] [${m.category}] ${m.content}`);
  } finally { db.close(); }
}

function stats() {
  const db = new Store().open();
  try {
    const rows = db.stats();
    if (!rows.length) { console.log('No memories stored yet.'); return; }
    console.log('\nMemory statistics:\n');
    for (const r of rows) {
      console.log(`  ${r.project}`);
      console.log(`    count: ${r.count}  avg score: ${(r.avg_score ?? 0).toFixed(3)}`);
    }
  } finally { db.close(); }
}

function prune(args) {
  const pi = args.indexOf('--project');
  const project = pi >= 0 ? resolve(args[pi + 1] ?? '.') : process.cwd();
  const ti = args.indexOf('--threshold');
  const threshold = ti >= 0 ? (parseFloat(args[ti + 1]) || 0.05) : 0.05;

  const db = new Store().open();
  try {
    const pruned = db.decayAndPrune(project, 1.0, threshold);
    console.log(`Pruned ${pruned} memories (score < ${threshold}) from ${project}`);
  } finally { db.close(); }
}

function del(args) {
  const id = parseInt(args[0]);
  if (!id) { console.log('Usage: ic delete <id>'); return; }
  const db = new Store().open();
  try {
    const ok = db.deleteMemory(id);
    console.log(ok ? `Deleted memory ${id}.` : `Memory ${id} not found.`);
  } finally { db.close(); }
}

function help() {
  console.log(`
Secure Infinite Context — CLI

  ic install                                   Install hooks into Claude Code
  ic uninstall                                 Remove hooks from Claude Code
  ic list [--project <path>] [--limit <n>]     List stored memories
  ic search <query> [--project <path>]         Search memories by keyword
  ic stats                                     Memory statistics by project
  ic prune [--project <path>] [--threshold n]  Remove low-score memories
  ic delete <id>                               Delete a specific memory
  ic help                                      Show this help

Data stored at: ${join(homedir(), '.claude', 'secure-infinite-context', 'memory.db')}
No web server. No external API calls. Local only.
`);
}

const [,, cmd, ...args] = process.argv;
switch (cmd) {
  case 'install':   install();    break;
  case 'uninstall': uninstall();  break;
  case 'list':      list(args);   break;
  case 'search':    search(args); break;
  case 'stats':     stats();      break;
  case 'prune':     prune(args);  break;
  case 'delete':    del(args);    break;
  default:          help();
}
