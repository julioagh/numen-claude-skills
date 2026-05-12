import { existsSync, readFileSync } from 'fs';

export function parseTranscript(transcriptPath, startLine = 0) {
  if (!transcriptPath || !existsSync(transcriptPath)) return { turns: [], lastLine: 0 };

  const lines = readFileSync(transcriptPath, 'utf-8').split('\n');
  const messages = [];

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      messages.push({ ...JSON.parse(line), _line: i });
    } catch {}
  }

  return { turns: groupIntoTurns(messages), lastLine: lines.length };
}

function groupIntoTurns(messages) {
  const turns = [];
  let current = null;

  for (const msg of messages) {
    // Claude Code JSONL wraps the actual message under msg.message
    const inner = msg.message || msg;
    const role = inner.role || msg.type;
    if (role === 'system') continue;

    if (role === 'user') {
      if (current) turns.push(current);
      current = {
        userMessage: extractUserMessage(inner),
        assistantMessages: [],
        allToolCalls: [],
        allToolResults: [],
      };
    } else if (role === 'assistant' && current) {
      const { text, thinking, toolCalls } = extractAssistantMessage(inner);
      if (text || thinking) current.assistantMessages.push({ text, thinking });
      current.allToolCalls.push(...toolCalls);
    } else if ((role === 'tool' || role === 'tool_result') && current) {
      current.allToolResults.push(extractToolResult(inner));
    }
  }

  if (current) turns.push(current);
  return turns;
}

function extractUserMessage(msg) {
  if (typeof msg.content === 'string') return { text: msg.content };
  if (Array.isArray(msg.content)) {
    return { text: msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n') };
  }
  return { text: '' };
}

function extractAssistantMessage(msg) {
  let text = '', thinking = '';
  const toolCalls = [];

  if (typeof msg.content === 'string') {
    text = msg.content;
  } else if (Array.isArray(msg.content)) {
    for (const block of msg.content) {
      if (block.type === 'text') text += block.text;
      else if (block.type === 'thinking') thinking += block.thinking;
      else if (block.type === 'tool_use') {
        toolCalls.push({ name: block.name, id: block.id, input: block.input || {} });
      }
    }
  }

  return { text, thinking, toolCalls };
}

function extractToolResult(msg) {
  const content = Array.isArray(msg.content)
    ? msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
    : String(msg.content || '');
  return { toolUseId: msg.tool_use_id, content, isError: msg.is_error || false };
}
