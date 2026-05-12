import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { createRequire } from 'module';
import { loadConfig } from '../core/config.js';

const require = createRequire(import.meta.url);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS memories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  project     TEXT    NOT NULL,
  session_id  TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  content     TEXT    NOT NULL,
  keywords    TEXT    NOT NULL,
  score       REAL    NOT NULL DEFAULT 0.5,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  last_accessed TEXT  NOT NULL DEFAULT (datetime('now')),
  access_count INTEGER NOT NULL DEFAULT 0,
  source_hash TEXT    UNIQUE
);

CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
  content, keywords,
  content='memories', content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
  INSERT INTO memories_fts(rowid, content, keywords)
  VALUES (new.id, new.content, new.keywords);
END;

CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
  INSERT INTO memories_fts(memories_fts, rowid, content, keywords)
  VALUES ('delete', old.id, old.content, old.keywords);
END;

CREATE TABLE IF NOT EXISTS sessions (
  session_id       TEXT PRIMARY KEY,
  project          TEXT NOT NULL,
  started_at       TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at         TEXT,
  memories_created INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS checkpoints (
  session_id      TEXT NOT NULL,
  transcript_path TEXT NOT NULL,
  last_line       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (session_id, transcript_path)
);

CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project);
CREATE INDEX IF NOT EXISTS idx_memories_score   ON memories(project, score DESC);
`;

export class Store {
  constructor(dbPath) {
    this.dbPath = dbPath || loadConfig().dbPath;
    this.db = null;
  }

  open() {
    if (this.db) return this;
    const dir = dirname(this.dbPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const Database = require('better-sqlite3');
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA);
    this._prep();
    return this;
  }

  close() { this.db?.close(); this.db = null; }

  _prep() {
    const d = this.db;
    this._insert = d.prepare(`
      INSERT OR IGNORE INTO memories
        (project, session_id, category, content, keywords, score, source_hash)
      VALUES
        (@project, @sessionId, @category, @content, @keywords, @score, @sourceHash)
    `);
    this._top = d.prepare(
      `SELECT id, category, content, score FROM memories
       WHERE project = ? ORDER BY score DESC LIMIT ?`
    );
    this._search = d.prepare(`
      SELECT m.id, m.category, m.content, m.score
      FROM memories_fts f JOIN memories m ON m.id = f.rowid
      WHERE memories_fts MATCH ? AND m.project = ?
      ORDER BY m.score DESC LIMIT ?
    `);
    this._touch = d.prepare(
      `UPDATE memories SET last_accessed = datetime('now'),
       access_count = access_count + 1 WHERE id = ?`
    );
    this._decay = d.prepare(`UPDATE memories SET score = score * ? WHERE project = ?`);
    this._prune = d.prepare(`DELETE FROM memories WHERE score < ? AND project = ?`);
    this._count = d.prepare(`SELECT COUNT(*) as n FROM memories WHERE project = ?`);
    this._upsertSession = d.prepare(
      `INSERT INTO sessions (session_id, project) VALUES (?, ?)
       ON CONFLICT(session_id) DO NOTHING`
    );
    this._endSession = d.prepare(
      `UPDATE sessions SET ended_at = datetime('now'),
       memories_created = memories_created + ? WHERE session_id = ?`
    );
    this._getCheckpoint = d.prepare(
      `SELECT last_line FROM checkpoints WHERE session_id = ? AND transcript_path = ?`
    );
    this._setCheckpoint = d.prepare(
      `INSERT OR REPLACE INTO checkpoints (session_id, transcript_path, last_line)
       VALUES (?, ?, ?)`
    );
    this._list = d.prepare(
      `SELECT id, project, session_id, category, content, score, created_at, access_count
       FROM memories WHERE project = ? ORDER BY score DESC LIMIT ?`
    );
    this._delete = d.prepare(`DELETE FROM memories WHERE id = ?`);
    this._stats = d.prepare(
      `SELECT project, COUNT(*) as count, AVG(score) as avg_score
       FROM memories GROUP BY project ORDER BY count DESC`
    );
  }

  insertMany(memories) {
    let count = 0;
    const tx = this.db.transaction(mems => {
      for (const m of mems) if (this._insert.run(m).changes > 0) count++;
    });
    tx(memories);
    return count;
  }

  search(query, project, limit = 3) {
    const safe = query
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .join(' OR ');
    if (!safe) return [];
    try { return this._search.all(safe, project, limit); } catch { return []; }
  }

  topForProject(project, limit = 15) { return this._top.all(project, limit); }

  touchMemories(ids) {
    const tx = this.db.transaction(ids => { for (const id of ids) this._touch.run(id); });
    tx(ids);
  }

  decayAndPrune(project, decayFactor = 0.95, pruneThreshold = 0.05) {
    this._decay.run(decayFactor, project);
    return this._prune.run(pruneThreshold, project).changes;
  }

  upsertSession(sessionId, project) { this._upsertSession.run(sessionId, project); }
  endSession(sessionId, count)       { this._endSession.run(count, sessionId); }

  getCheckpoint(sessionId, path)         { return this._getCheckpoint.get(sessionId, path)?.last_line ?? 0; }
  setCheckpoint(sessionId, path, line)   { this._setCheckpoint.run(sessionId, path, line); }

  listMemories(project, limit = 50) { return this._list.all(project, limit); }
  deleteMemory(id)                   { return this._delete.run(id).changes; }
  countForProject(project)           { return this._count.get(project)?.n ?? 0; }
  stats()                            { return this._stats.all(); }
}
