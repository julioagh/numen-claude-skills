#!/usr/bin/env node
import { readStdin, openDb, writeHookOutput, log, runHook } from './common.js';
import { extractKeywords, estimateTokens } from '../core/scorer.js';
import { recallForPrompt } from '../core/restorer.js';
import { loadConfig } from '../core/config.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATE_FILE = join(homedir(), '.claude', 'secure-infinite-context', 'prompt-state.json');

function loadState() {
  try { return existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf-8')) : {}; }
  catch { return {}; }
}
function saveState(s) {
  try {
    const dir = join(homedir(), '.claude', 'secure-infinite-context');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(s), 'utf-8');
  } catch {}
}

runHook('user-prompt-submit', async () => {
  const input = await readStdin();
  if (!input) return;
  const { cwd, prompt, session_id: sessionId } = input;
  if (!cwd || !prompt || prompt.length < 15) return;
  if (/^<[a-z]/i.test(prompt.trim())) return;

  const keywords = extractKeywords(prompt);
  if (!keywords || keywords.split(' ').length < 2) return;

  const state = loadState();
  const key = sessionId || cwd;
  const now = Date.now();
  if (now - (state[key] ?? 0) < 60000) return;

  const db = openDb();
  if (!db) return;
  try {
    const cfg = loadConfig();
    const results = db.search(keywords, cwd, cfg.maxPromptRecallResults);
    if (!results.length) return;

    const { text, ids } = recallForPrompt(results);
    if (!text || estimateTokens(text) > 600) return;

    db.touchMemories(ids);
    state[key] = now;
    saveState(state);
    log(`user-prompt-submit: recalled ${ids.length} memories`);
    writeHookOutput('UserPromptSubmit', text);
  } finally {
    db.close();
  }
});
