const STOPWORDS = new Set([
  'the','a','an','is','it','to','in','of','and','or','for','with',
  'this','that','we','i','you','he','she','they','was','are','be',
  'been','have','has','had','do','did','will','would','could','should',
  'may','might','must','can','at','by','from','as','on','up','if','no',
  'so','but','not','all','there','what','when','where','how','which',
  'who','my','our','your','its','use','using','used','let','get','got',
  'set','run','go','just','now','also','then','than','need','make','into',
]);

export function extractKeywords(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 20)
    .join(' ');
}

export function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

export function computeScore(category) {
  const base = {
    architecture: 0.9,
    decision: 0.8,
    error: 0.75,
    finding: 0.7,
    file_change: 0.6,
    note: 0.5,
  };
  return base[category] ?? 0.5;
}
