# Prompting Techniques for Geoff

Techniques pulled from the Geoff cookbook (docs.geoff.ai/cookbook/*), plus general prompting best practices that apply to all Geoff models. Items marked **(Geoff docs)** come straight from the official documentation; the rest are proven general techniques.

---

## 1. Text / chat prompting

### Use the three roles deliberately **(Geoff docs)**
- `system` — sets behavior and context. Put persona, rules, output format here.
- `user` — the actual request.
- `assistant` — prior model replies; required for multi-turn memory.

```json
{
  "model": "preview",
  "messages": [
    { "role": "system", "content": "You are a concise assistant. Answer in max 3 sentences." },
    { "role": "user", "content": "Explain what an API gateway is." }
  ]
}
```

### Maintain history for multi-turn **(Geoff docs)**
Append every assistant response to `messages` before the next request. The API is stateless — if you don't send history, the model has no memory of the conversation.

### General techniques that work on all tiers
- **Be specific about the output**: format ("respond as a JSON array"), length, audience, language.
- **Give examples (few-shot)**: 1–3 input→output examples beat long descriptions of what you want.
- **Structured output**: all three Geoff models support structured output and function calling — use them instead of parsing free text.
- **Let it reason**: for complex tasks, ask the model to work step by step before giving the final answer (all Geoff models list "Reasoning" as a capability).
- **Right model for the job**: don't prompt-engineer around a weak fit — `preview` for extraction/simple Q&A, `magma` for long documents and agentic chains, `duce` for anything audio-adjacent.

---

## 2. Image prompting **(Geoff docs)**

The docs' example prompt shows the pattern:

> "A futuristic city skyline at dusk, cyberpunk style"

Formula: **subject + context/time + style**.

- **Subject**: what's in the image ("a futuristic city skyline")
- **Context**: lighting, time, setting ("at dusk")
- **Style**: artistic direction ("cyberpunk style", "watercolor", "photorealistic")

For image-to-image (`/image/transform`), phrase the prompt as a **transformation instruction** ("Convert to watercolor painting style") and tune `strength` to control how much of the original survives.

---

## 3. Video prompting **(Geoff docs)**

Example from the docs:

> "A serene sunset over a calm ocean, cinematic quality"

- Use **descriptive scene language** plus **quality modifiers** ("cinematic quality", "1080p" via the `resolution` param).
- Keep `duration` short while iterating — generation is async and long videos take longer to poll.
- Choose `magma` for highest quality, `duce` for faster multimodal generation.

---

## 4. Music prompting **(Geoff docs)**

- **Style prompt formula**: genre + emotional tone + descriptive qualities.
  Example from the docs: `"Indie folk, melancholic, introspective, longing"`
- **Structure lyrics with section markers**: `[verse]`, `[chorus]`, etc. — the model uses them to shape the composition.
- **Two-step workflow**: generate lyrics first via `/lyrics_generation`, then pass them to `/music_generation` for a cohesive song. Don't try to do both in one prompt.

---

## 5. Prompting Geoff Code (the terminal coding agent) **(Geoff docs)**

From [docs.geoff.ai/geoff-code/use-cases](https://docs.geoff.ai/geoff-code/use-cases) — see `docs/GEOFF-CODE-GUIDE.md` for the full guide:

- **Be specific**: file paths, exact error messages, reproduction commands.
  ❌ "the API is broken" → ✅ "Fix the 500 on POST /orders. Repro: `npm test -- orders`"
- **Reference existing patterns**: "Match the error-handling style in `src/api/orders.ts`."
- **Ask for verification in the same prompt**: "Add a /health endpoint **and a test for it**" — Geoff Code's core loop is Read → Edit → Verify; give it the Verify step.
- **Iterate**: start broad, refine based on output. Use `/fork` to branch a session before a risky direction.
- **Front-load project knowledge**: run `/init` once so `AGENTS.md` exists; encode conventions as skills in `.geoff/skills/` so they auto-activate — that's prompting that persists across sessions.
- **Match mode to intent**: `--plan` for read-only exploration, `manual` approvals for normal work, `-y` only in sandboxes/CI.

---

## 6. Agent prompting (Claw / HQ) **(Geoff docs)**

Geoff's agents are configured with markdown files — write them like prompts:

- **`SOUL.md`** — the agent's persona and standing instructions, appended to every system prompt. Keep it short and behavioral: who the agent is, what it must always/never do.
- **`MEMORY.md`** — persistent facts. Write one topic per section so `memory_search` finds things.
- **Skills** — reusable markdown files with YAML frontmatter, invoked as slash commands (`/review src/index.ts`) with `{{param}}` placeholders. Turn any prompt you use twice into a skill.

This mirrors the pattern used by Claude Code (CLAUDE.md + skills), so the same discipline applies: instructions in the persona file should be **few, firm, and testable**.

---

## 7. Reusable prompt templates in this starter

Keep prompts **out of your code** and in the `prompts/` folder as markdown files, loaded at runtime. Benefits:

- Version-controlled prompt history (see what changed when quality shifted)
- Non-developers can edit prompts
- Same template reused across chat, streaming, and agent contexts

See `prompts/system.md` and `prompts/templates.md` for starting points, and `src/lib/prompts.ts` for the tiny loader with `{{param}}` substitution (same syntax Geoff skills use).
