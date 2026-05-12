import { estimateTokens } from './scorer.js';

const LABELS = {
  architecture: 'Architecture & Design',
  decision:     'Decisions',
  error:        'Errors & Solutions',
  finding:      'Findings',
  file_change:  'File Changes',
  note:         'Notes',
};

export function restoreContext(memories, maxTokens = 800) {
  if (!memories?.length) return { text: '', ids: [] };

  const sorted = [...memories].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const selected = [];
  let total = 0;

  for (const m of sorted) {
    const tokens = estimateTokens(`- ${m.content}`);
    if (total + tokens > maxTokens) break;
    selected.push(m);
    total += tokens;
  }

  if (!selected.length) return { text: '', ids: [] };

  const byCat = {};
  for (const m of selected) {
    (byCat[m.category] ??= []).push(m);
  }

  const lines = ['## Prior Context (restored from archive)'];
  for (const [cat, items] of Object.entries(byCat)) {
    lines.push(`\n### ${LABELS[cat] ?? cat}`);
    for (const m of items) lines.push(`- ${m.content}`);
  }

  return { text: lines.join('\n'), ids: selected.map(m => m.id) };
}

export function recallForPrompt(memories) {
  if (!memories?.length) return { text: '', ids: [] };
  const lines = ['## Relevant prior context'];
  for (const m of memories) lines.push(`- [${m.category}] ${m.content}`);
  return { text: lines.join('\n'), ids: memories.map(m => m.id) };
}
