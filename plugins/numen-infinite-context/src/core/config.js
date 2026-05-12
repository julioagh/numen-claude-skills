import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const DATA_DIR = join(homedir(), '.claude', 'secure-infinite-context');
const CONFIG_PATH = join(DATA_DIR, 'config.json');

export const DEFAULTS = {
  dataDir: DATA_DIR,
  dbPath: join(DATA_DIR, 'memory.db'),
  maxMemoriesPerProject: 500,
  maxTokensOnRestore: 800,
  maxPromptRecallResults: 3,
  pruneThreshold: 0.05,
  decayFactor: 0.95,
};

export function loadConfig() {
  try {
    if (existsSync(CONFIG_PATH)) {
      const user = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
      return { ...DEFAULTS, ...user };
    }
  } catch {}
  return { ...DEFAULTS };
}

export function saveConfig(partial) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const current = loadConfig();
  const next = { ...current, ...partial };
  writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2), 'utf-8');
  return next;
}
