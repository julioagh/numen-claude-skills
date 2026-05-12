#!/usr/bin/env node
import { readStdin, openDb, writeHookOutput, log, runHook } from './common.js';
import { restoreContext } from '../core/restorer.js';
import { loadConfig } from '../core/config.js';

runHook('subagent-start', async () => {
  const input = await readStdin();
  if (!input) return;
  const { cwd, session_id: sessionId } = input;
  if (!cwd || !sessionId) return;

  const db = openDb();
  if (!db) return;
  try {
    db.upsertSession(sessionId, cwd);
    const cfg = loadConfig();
    const memories = db.topForProject(cwd, 10);
    if (!memories.length) return;

    const { text, ids } = restoreContext(memories, Math.floor(cfg.maxTokensOnRestore / 2));
    if (!text) return;

    db.touchMemories(ids);
    log(`subagent-start: shared ${ids.length} memories`);
    writeHookOutput('SubagentStart', text);
  } finally {
    db.close();
  }
});
