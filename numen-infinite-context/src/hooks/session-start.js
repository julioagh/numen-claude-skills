#!/usr/bin/env node
import { readStdin, openDb, writeHookOutput, log, runHook } from './common.js';
import { restoreContext } from '../core/restorer.js';
import { loadConfig } from '../core/config.js';

runHook('session-start', async () => {
  const input = await readStdin();
  if (!input) return;
  const { cwd, session_id: sessionId } = input;
  if (!cwd || !sessionId) return;

  const db = openDb();
  if (!db) return;
  try {
    db.upsertSession(sessionId, cwd);
    const cfg = loadConfig();
    db.decayAndPrune(cwd, cfg.decayFactor, cfg.pruneThreshold);

    const memories = db.topForProject(cwd, 15);
    if (!memories.length) return;

    const { text, ids } = restoreContext(memories, cfg.maxTokensOnRestore);
    if (!text) return;

    db.touchMemories(ids);
    log(`session-start: restored ${ids.length} memories`);
    writeHookOutput('SessionStart', text);
  } finally {
    db.close();
  }
});
