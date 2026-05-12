import { Store } from '../db/store.js';

export function readStdin(timeoutMs = 500) {
  return new Promise(resolve => {
    if (process.stdin.isTTY) { resolve(null); return; }
    let data = '', done = false;
    const finish = v => { if (!done) { done = true; resolve(v); } };
    const timer = setTimeout(() => {
      process.stdin.removeAllListeners();
      try { finish(data ? JSON.parse(data) : null); } catch { finish(null); }
    }, timeoutMs);
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', c => { data += c; });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      try { finish(data ? JSON.parse(data) : null); } catch { finish(null); }
    });
    process.stdin.on('error', () => { clearTimeout(timer); finish(null); });
    process.stdin.resume();
  });
}

export function openDb() {
  try { return new Store().open(); } catch (e) { log(`DB open failed: ${e.message}`); return null; }
}

export function writeHookOutput(eventName, additionalContext) {
  if (!additionalContext) return;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: eventName, additionalContext },
  }));
}

export function log(msg) {
  process.stderr.write(`[secure-ic] ${msg}\n`);
}

export async function runHook(name, fn) {
  try { await fn(); } catch (e) { log(`${name} error: ${e.message}`); }
  process.exitCode = 0;
  if (process.stdout.writableLength > 0) {
    process.stdout.once('drain', () => process.exit(0));
    setTimeout(() => process.exit(0), 200);
  }
}
