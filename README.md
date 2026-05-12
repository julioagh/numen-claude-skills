# numen-claude-skills

Claude skills by [Numen Coaching & Consulting](https://github.com/julioagh). Compatible with Claude.ai and Claude Code.

Skills designed for professionals who want to produce and evaluate high-quality written content with AI assistance.

---

## Available Skills

### numen-humanizer

Removes AI-generated writing signals from formal professional text (CVs, LinkedIn profiles, cover letters, standalone summaries) while preserving formal register.

**Different from the built-in `humanizer` skill:** that skill targets conversational/natural writing. This one targets formal written English and Spanish that must pass both AI detection tools AND the eye of an experienced recruiter.

**Supports 5 registers:**
- Full CV / Resume (section-aware: summary, bullets, competencies)
- CV Header Summary
- Standalone Summary (email, WhatsApp, speaker bio)
- LinkedIn About
- Cover Letter

**Languages:** English and Spanish (with Spanish-specific AI vocabulary markers)

**Key features:**
- Distinguishes pre-AI clichés (Category A) from AI-created vocabulary (Category B) — different fix for each
- Structural pattern detection: bullet uniformity, metric saturation, rule of three, perfect parallel structure
- Does NOT make text casual — formal register is preserved throughout

#### Install

Download [`numen-humanizer.skill`](./releases/numen-humanizer.skill) and install via Claude Code Settings > Skills, or drag and drop into the Claude desktop app.

#### Source

The skill source is in [`skills/numen-humanizer/SKILL.md`](./skills/numen-humanizer/SKILL.md).

---

### numen-audit

Audits any AI response (Claude, ChatGPT, or any LLM) for 4 failure modes, scoring each 1–5 with quoted evidence from the response itself.

**The 4 dimensions:**
- **Sycophancy** — unwarranted praise, validating bad ideas, reversing position under pressure
- **Verbosity** — filler phrases, restating the question, padding that buries the actual answer
- **Overcaution** — performative disclaimers, watered-down advice, unnecessary "consult a professional"
- **Confidence calibration** — overclaiming uncertain things as facts, or over-hedging established ones

**Output:** a scorecard table + Trust Score (1–5) + one top recommendation per response.

**Works on short responses** — even a single paragraph is enough to audit.

#### Install

Download [`numen-audit.skill`](./releases/numen-audit.skill) and install via Claude Code Settings > Skills, or drag and drop into the Claude desktop app.

#### Source

The skill source is in [`skills/numen-audit/SKILL.md`](./skills/numen-audit/SKILL.md).

---

## Plugins

### numen-infinite-context

Hook-based plugin that preserves conversation context across long sessions using local SQLite storage. No external API calls.

**Source:** [`plugins/numen-infinite-context/`](./plugins/numen-infinite-context/)

---

## License

MIT — free to use, adapt, and redistribute.
