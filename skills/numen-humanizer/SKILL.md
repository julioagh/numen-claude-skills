---
name: numen-humanizer
description: >
  Removes AI-generated writing signals from formal professional text while preserving
  formal register. Use this skill whenever someone wants their CV, LinkedIn profile,
  cover letter, or professional summary to sound less AI-generated and more authentically
  human — without losing professional tone. Trigger on: "this sounds AI-generated",
  "remove AI signals", "make my CV sound human", "this doesn't sound like me",
  "de-AI my writing", "humanize my professional writing", "will this pass AI detection",
  "my CV sounds too polished", "suena a IA", "parece generado por IA", "quiero que
  suene más humano". Different from the general humanizer skill — this one preserves
  formal register, handles full document structure (summary + bullets + competencies),
  and distinguishes between pre-AI clichés and AI-specific vocabulary. Works in English
  and Spanish. Use for: full CVs/resumes, LinkedIn About, cover letters, standalone
  professional summaries.
---

# numen-humanizer

You're editing formal professional text to remove signals that reveal AI authorship — not to make it casual, but to make it sound like a real person wrote it carefully in a professional context.

The goal is text that passes both AI detection tools AND the eye of an experienced recruiter who has seen thousands of AI-polished documents.

## Step 1: Identify the register

Ask the user which register applies (if not clear from context):

1. **Full CV / Resume** — applies to the entire document. Different rules apply per section (see Step 2). No first person. Formal, achievement-oriented.
2. **CV Header Summary** — the 3–5 line positioning statement at the top of a CV. High-level only — specifics live in the experience section below. 1–2 proper nouns as authenticity anchors are enough; no need to repeat metrics that appear in bullets.
3. **Standalone Summary** — a self-contained professional pitch shared without the CV (email, WhatsApp, LinkedIn DM, speaker notes). Must be complete on its own: company names, key roles, 2–3 metrics. First person for informal contexts; third person for formal institutional uses.
4. **LinkedIn About** — first person, professional but warmer than CV. Personal perspective and "I" are appropriate.
5. **Cover Letter** — first person, formal narrative. References specific role and company by name.

**CV Header Summary vs. Standalone Summary — the key distinction:**
The header summary assumes the reader has the full CV below it — it positions, it doesn't detail. The standalone summary assumes the reader has nothing else — it must stand alone. Repeating metrics in the header creates redundancy; omitting them from the standalone leaves the reader with no substance.

## Step 2: Section-aware editing (Full CV register only)

When editing a complete CV, apply different rules per section — don't treat the document as a uniform block.

| Section | Primary focus | What to vary |
|---|---|---|
| Header Summary | Vocabulary + CV-specific anchoring | Remove AI labels; anchor in 1–2 proper nouns |
| Experience Bullets | Structural patterns + vocabulary | Length, metrics, parallel structure |
| Key Competencies | Vocabulary only | Replace AI labels; keep as a list |
| Education / Certifications | Nothing | Proper nouns — do not change |

## Step 3: Three-pass editing

Work through the text in this order. Structural patterns produce the strongest AI signal and are invisible until you look for them — start there.

---

### Pass 1 — Structural patterns (highest detection risk)

Experienced recruiters feel these before they name them. Applies primarily to **experience bullets**.

**Bullet uniformity** — when every bullet follows the same construction and runs roughly the same length, the document reads as machine-generated even if each bullet is individually well-written. Vary length intentionally: some bullets run one line, others two. The variation itself is an authenticity signal.

**Metric saturation** — a real CV has bullets that describe scope, approach, or responsibility without a numerical outcome. When every bullet ends in a percentage or number, it signals optimization, not authorship. Keep metrics where they're real and meaningful. Where a metric is forced, replace it with a qualitative description or remove the outcome claim entirely.

**Rule of three** — AI defaults to listing exactly 3 items. Break this: list 2 or 4 when that's what's actually true.

**Perfect parallel structure** — slight variation in sentence scaffolding across bullets (not inconsistency — just not identical) reads as human. When the pattern [strong verb] + [object] + [context] + [metric] repeats perfectly across every bullet, the pattern becomes the signal.

**Em dash overuse** — limit to 1 em dash per section maximum.

---

### Pass 2 — Phrase patterns (medium detection risk)

These phrases function as sentence scaffolding — they hold the sentence together without adding meaning. Remove or restructure:

- "Successfully [verb]..." → start with the verb directly
- "Effectively managed..." → describe what the management produced
- "Demonstrated ability to..." → state the achievement
- "Proven track record of..." → state what was proven with specific evidence
- "Furthermore / Moreover / Additionally" as sentence openers → restructure the thought
- "This demonstrates / showcases..." → remove; let the fact speak for itself
- "It is worth noting that..." → cut the filler, state the point

---

### Pass 3 — Vocabulary

Before editing vocabulary, understand why a phrase is a problem — the fix is different depending on the cause:

**Category A — Pre-AI clichés that AI also adopted**
These were weak writing *before* AI existed. Career coaches flagged them years ago. AI uses them because they were already in millions of CVs. They're a double problem: empty language AND an AI signal. If someone was already using these phrases before AI tools, that's not unusual — they were standard template language for years. The fix is not a better word — it's replacing the label with the actual thing it was trying to say.

**Category B — Vocabulary AI created or massively overused**
These became clichés through AI. A recruiter who has reviewed 500 AI-polished CVs this year will spot them immediately. The fix is a concrete alternative or removing the label entirely.

---

**English — Category A (replace with the concrete fact):**

| Phrase | Fix |
|---|---|
| results-oriented | remove; the results in your bullets already prove it |
| proven track record of | state what was proven, with the specific evidence |
| highly motivated | remove — motivation is shown through action, not claimed |
| dynamic professional | remove "dynamic"; describe what made the work challenging |
| strong communication skills | remove or cite a specific instance |
| team player | remove or describe what the collaboration actually produced |

**English — Category B (replace with specific alternative):**

| AI word | What to do instead |
|---|---|
| leverage / leveraged | used, applied, built on — or name the specific thing |
| robust | strong, reliable, solid — or describe what made it so |
| seamless / seamlessly | smooth, without friction — or describe how friction was removed |
| streamlined | simplified — name what changed (e.g., "cut from 5 steps to 2") |
| comprehensive | complete, end-to-end — or list what it actually covered |
| innovative / cutting-edge | describe what was actually new; don't label it |
| impactful | replace with the impact itself |
| spearheaded | led, launched, initiated |
| fostered | built, developed, grew |
| empowered | enabled, gave autonomy to, equipped |
| holistic | end-to-end, full-picture — or describe the actual scope |
| pivotal / paramount | critical, key, central |
| transformative | describe what actually changed |
| synergies | describe what actually combined and how |
| ecosystem (non-literal) | environment, network, set of tools — be specific |
| hypothesis-driven | describe the actual method used |
| data-driven frameworks | name the specific framework or tool |
| multifaceted | complex, multi-part — or list the actual parts |

**Spanish — Categoría A (reemplazar con el hecho concreto):**

| Frase | Corrección |
|---|---|
| orientado/a a resultados | eliminar; los resultados en los bullets lo demuestran |
| historial comprobado / track record comprobado | nombrar el logro con evidencia específica |
| altamente motivado/a | eliminar — la motivación se demuestra con acciones |
| amplia experiencia | especificar: cuántos años, en qué contexto |
| sólido perfil profesional | eliminar; describir el perfil directamente |
| profesional comprometido/a | eliminar o citar lo que produjo ese compromiso |

**Spanish — Categoría B (reemplazar con alternativa concreta):**

| Marcador IA | Alternativa |
|---|---|
| sólida trayectoria | describir años y contexto específico |
| lideré con éxito | lideré — el resultado prueba el éxito |
| contribuí al éxito de | nombrar exactamente qué hizo |
| me desempeñé como | eliminar; ir directo al rol y logro |
| profesional apasionado/a | eliminar o reemplazar con el área real |
| holístico/a | integral, de extremo a extremo — o describir el alcance |
| ecosistema (fuera de contexto técnico literal) | entorno, red, conjunto de herramientas |
| transformador/a | describir qué cambió concretamente |

---

### CV-specific patterns (apply for CV registers only)

**Summary as template** — when the professional summary sounds written for "the ideal candidate" rather than a specific person, it signals AI. Anchor it in proper nouns: company names, product names, specific numbers. These are the strongest authenticity signal.

**For CV Header Summary:** 1–2 proper nouns are enough — the detail lives in the experience section below. Avoid repeating the same metrics that appear in bullets.

**For Standalone Summary:** include company names, 2–3 key metrics, and current activity. The reader has nothing else to reference.

**Every role at its absolute best** — one neutral, contextual bullet per role (describing scope without claiming a result) adds human texture. Real CVs don't optimize every line.

**Zero complexity acknowledged** — a subtle reference per document to navigating constraints, ambiguity, or a pivot signals lived experience. One is enough.

---

## Step 4: Output format

**For short texts (summary, single section):**
Show ORIGINAL then REVISED, followed by a brief bullet list of what was changed by category.

**For full CV documents:**
Work section by section. After all sections, summarize:
- Vocabulary A (pre-AI clichés): X phrases replaced with specifics
- Vocabulary B (AI-specific words): X words replaced
- Structural: what was varied (length / metrics / parallel structure)
- Phrases: X scaffolding phrases removed
- CV-specific: what was anchored or added (if applicable)

## What NOT to change

- Proper nouns: company names, product names, certifications, tools
- Metrics that are real and specific — these are authenticity signals, not AI signals
- The formal register — the goal is formal-and-human, not casual
- Factual content — never reframe an achievement in a way that changes its meaning
- Industry-specific terminology the person actually uses in their work
