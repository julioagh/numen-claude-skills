import { createHash } from 'crypto';
import { extractKeywords, computeScore } from './scorer.js';

// Redact sensitive data before storing anything
const SENSITIVE_PATTERNS = [
  /(?:api[_-]?key|apikey|access[_-]?key)\s*[=:'"]{1,2}\s*[A-Za-z0-9\-_+/]{10,}/gi,
  /(?:password|passwd|pwd|secret|credentials?)\s*[=:'"]{1,2}\s*\S{4,}/gi,
  /(?:token|bearer)\s*[=:'"]{1,2}\s*[A-Za-z0-9\-_.+/]{10,}/gi,
  /sk-(?:ant-api\d+-)?[A-Za-z0-9\-_]{20,}/g,
  /(?:AKIA|ASIA)[A-Z0-9]{16}/g,
  /ghp_[A-Za-z0-9]{36}/g,
  /xox[baprs]-[A-Za-z0-9\-]{10,}/g,
];

const WRITE_TOOLS   = new Set(['Write', 'Edit', 'MultiEdit']);
const CMD_PATTERN   = /\b(npm|pip|yarn|pnpm|git|docker|kubectl|terraform|brew|apt|cargo)\b/;
const DECISION_RE   = /\b(i'll|i will|let's|let me|the approach|we'll|decided|choosing|going with|using)\b/i;
const ARCH_RE       = /\b(architecture|design|pattern|refactor|interface|abstract|schema|database|api|endpoint|service|module|component|layer|cache|queue|event)\b/i;

function sanitize(text) {
  let out = text;
  for (const p of SENSITIVE_PATTERNS) out = out.replace(p, '[REDACTED]');
  return out.slice(0, 500);
}

function hash(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function make(project, sessionId, category, raw) {
  const content = sanitize(raw);
  if (!content || content.length < 10) return null;
  return {
    project,
    sessionId,
    category,
    content,
    keywords: extractKeywords(content),
    score: computeScore(category),
    sourceHash: hash(content),
  };
}

export function extractMemories(turns, project, sessionId) {
  const memories = [];
  const seen = new Set();

  function add(category, content) {
    const m = make(project, sessionId, category, content);
    if (!m || seen.has(m.sourceHash)) return;
    seen.add(m.sourceHash);
    memories.push(m);
  }

  for (const turn of turns) {
    // File changes from write/edit tool calls
    for (const tc of turn.allToolCalls || []) {
      if (WRITE_TOOLS.has(tc.name)) {
        const path = tc.input?.path || tc.input?.file_path || '';
        if (path) add('file_change', `${tc.name}: ${path}`);
      }
    }

    // Errors from tool results
    for (const tr of turn.allToolResults || []) {
      if (tr.isError && tr.content) add('error', tr.content.slice(0, 300));
    }

    // Decisions and architecture from assistant messages
    for (const msg of turn.assistantMessages || []) {
      if (msg.text) {
        let count = 0;
        for (const line of msg.text.split('\n')) {
          if (count >= 3) break;
          const t = line.trim();
          if (t.length < 20 || t.length > 300) continue;
          if (DECISION_RE.test(t)) { add('decision', t); count++; }
        }
      }
      if (msg.thinking) {
        for (const line of msg.thinking.split('\n')) {
          const t = line.trim();
          if (t.length >= 20 && t.length <= 400 && ARCH_RE.test(t)) {
            add('architecture', t);
            break;
          }
        }
      }
    }

    // Notable shell commands
    for (const tc of turn.allToolCalls || []) {
      if (tc.name === 'Bash') {
        const cmd = String(tc.input?.command || '').trim().slice(0, 200);
        if (cmd.length > 5 && CMD_PATTERN.test(cmd)) add('note', `Ran: ${cmd}`);
      }
    }

    // Meaningful user requests
    if (turn.userMessage?.text) {
      const t = turn.userMessage.text.trim();
      if (t.length >= 20 && t.length <= 500 && !/^<[a-z]/i.test(t) && !/^\{/.test(t)) {
        add('note', t.slice(0, 300));
      }
    }
  }

  return memories.slice(0, 30);
}
