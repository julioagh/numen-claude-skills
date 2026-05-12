#!/usr/bin/env node
import { readStdin, openDb, log, runHook } from './common.js';
import { parseTranscript } from '../core/transcript-parser.js';
import { extractMemories } from '../core/archiver.js';

runHook('session-end', async () => {
  const input = await readStdin();
  if (!input) return;
  const { cwd, session_id: sessionId, transcript_path: transcriptPath } = input;
  if (!cwd || !sessionId || !transcriptPath) return;

  const db = openDb();
  if (!db) return;
  try {
    const startLine = db.getCheckpoint(sessionId, transcriptPath);
    const { turns, lastLine } = parseTranscript(transcriptPath, startLine);

    let saved = 0;
    if (turns.length) {
      const memories = extractMemories(turns, cwd, sessionId);
      saved = db.insertMany(memories);
      db.setCheckpoint(sessionId, transcriptPath, lastLine);
    }

    db.endSession(sessionId, saved);
    log(`session-end: archived ${saved} final memories`);
  } finally {
    db.close();
  }
});
