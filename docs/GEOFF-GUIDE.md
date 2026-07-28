# Geoff — Step-by-Step Guide

> Based on an analysis of [docs.geoff.ai](https://docs.geoff.ai/) (July 2026).
> ⭐ = **must read** page in the official docs.

---

## 1. What is Geoff?

Geoff is a **unified AI API platform** — one gateway, one API key, one consistent interface for many AI capabilities. Instead of integrating separately with different AI providers, you call a single API at:

```
https://geoff.ai/api
```

It acts as a **full proxy** in front of multiple underlying model providers, and offers six capability areas:

| Capability | What it does |
|---|---|
| **Text**   | Chat completions — with **Anthropic-compatible** and **OpenAI-compatible** endpoints |
| **Speech** | Text-to-audio, streaming, voice cloning |
| **Video**  | Generate video from text, images, or frame sequences |
| **Image**  | Create and transform images from prompts |
| **Music**  | Compose original music from prompts and lyrics |
| **File**   | Upload and manage files used across features |

On top of the API, Geoff ships platform tools: **Studio Mode** (creative workspace), **Agent Mode / "Claw"** (autonomous coding agent), **HQ** (multi-agent operations center), and an **MCP server** so tools like Claude Desktop, Cursor, and VS Code can use Geoff directly.

---

## 2. The models — ⭐ must read: `/introduction/models`

Geoff exposes three model tiers. **You select them by short ID** (`preview`, `duce`, `magma`) in the `model` field of every request.

| Model | ID | Context | Strengths | Use it for |
|---|---|---|---|---|
| **Preview** | `preview` | 128K+ | Fast, lightweight; text + vision in, text out | Quick completions, image analysis, structured data extraction |
| **Duce** | `duce` | 128K+ | SOTA **music** generation, TTS, multimodal in/out, Mixture of Models | Music, multimodal content creation, complex reasoning |
| **Magma** | `magma` | **1M** | SOTA **video** generation, Mixture of Models | Long-context work, video, complex agentic workflows |

All three support **function calling, reasoning, and structured output**. Duce and Magma use **Mixture of Models (MoM)** — Geoff routes your request across specialized models automatically.

> 💡 **Rule of thumb:** start with `preview` for cheap/fast text tasks, use `magma` when you need long context, video, or agentic work, and `duce` when audio/music matters.

---

## 3. Step-by-step: your first request

### Step 1 — Get an API key ⭐ must read: `/introduction/authentication`

1. Log into your Geoff account.
2. Go to **Settings → API Keys**.
3. Click **Create API Key**.

> ⚠️ **Important:** the key is shown **only once**. Store it immediately (password manager or `.env` file).

### Step 2 — Store the key as an environment variable

```bash
# macOS / Linux
export GEOFF_API_KEY="your-api-key-here"
```

```powershell
# Windows PowerShell
$env:GEOFF_API_KEY = "your-api-key-here"
```

In projects, put it in a `.env` file that is **git-ignored** (see the starter project in this repo).

### Step 3 — Send your first chat request ⭐ must read: `/introduction/quickstart`

Every request uses a **Bearer token** header:

```bash
curl --request POST \
  --url https://geoff.ai/api/v1/text/chat \
  --header "Authorization: Bearer $GEOFF_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "magma",
    "messages": [{"role": "user", "content": "What is Geoff?"}]
  }'
```

Python:

```python
import os, requests

response = requests.post(
    "https://geoff.ai/api/v1/text/chat",
    headers={
        "Authorization": f"Bearer {os.environ['GEOFF_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "model": "magma",
        "messages": [{"role": "user", "content": "What is Geoff?"}],
    },
)
print(response.json())
```

### Step 4 — Understand the response format

All endpoints return JSON with a standardized envelope:

```json
{ "data": { ... }, "trace_id": "...", "extra_info": { ... } }
```

Errors use standard HTTP status codes (`400`, `401`, `403`, `404`, `429`, `500`) with a JSON body containing `code` and `message`. **Handle `429` (rate limit) with backoff** — limits depend on your subscription plan and are visible in the Geoff Dashboard.

---

## 4. Use your existing SDKs (the easiest path) ⭐ must read

Geoff is **drop-in compatible** with the OpenAI and Anthropic SDKs — you only change the base URL and key. This is the fastest way to build, because all your existing knowledge and libraries keep working.

### OpenAI-compatible (`/api-reference/text/openai-api`)

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-geoff-api-key",
    base_url="https://geoff.ai/api/v1",
)
resp = client.chat.completions.create(
    model="magma",
    messages=[{"role": "user", "content": "Hello!"}],
)
```

Supports: streaming, function calling/tools, system messages, multi-turn.

### Anthropic-compatible (`/api-reference/text/anthropic-api`)

```python
import anthropic

client = anthropic.Anthropic(
    api_key="your-geoff-api-key",
    base_url="https://geoff.ai/api",
)
msg = client.messages.create(
    model="magma",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
```

TypeScript: `new Anthropic({ apiKey: "...", baseURL: "https://geoff.ai/api" })`.
Supports: SSE streaming, image input, function calling, system prompts, multi-turn.

---

## 5. Streaming — for responsive UIs

Add `"stream": true` to any text/chat request and consume the response as **Server-Sent Events** line by line, instead of waiting for the full answer:

```json
{ "model": "magma", "messages": [...], "stream": true }
```

- Python: iterate `response.iter_lines()` with `stream=True`
- TypeScript: `response.body.getReader()` + `TextDecoder` until `done`

See `src/examples/stream.ts` in the starter project.

---

## 6. Multimodal endpoints (image, video, music)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/image/generate` | POST | Text → image (`prompt`, `width`, `height`) |
| `/api/v1/image/transform` | POST | Image → image (`image` base64, `prompt`, `strength`) |
| `/api/v1/video/generate` | POST | Text → video (`prompt`, `duration`, `resolution`) — **async**: poll `/api/v1/video/status/{task_id}`, then download via `/api/v1/video/download/{task_id}` |
| `/api/v1/music_generation` | POST | Prompt + optional `lyrics` → music (returns hex-encoded audio + metadata) |
| `/lyrics_generation` | POST | Generate structured lyrics first, then feed them to music generation |

> 💡 **Video is asynchronous** — submit, poll status, download. Don't block a request waiting for it. The starter project's `src/examples/video.ts` shows the polling pattern.

Other API families exist too: **Speech** (TTS, transcription, voice cloning), **Code** (execute code, create sandboxes, code-agent streaming at `POST /api/v1/code/...`), **Training** (LoRA and voice training with a status endpoint), and **File management**.

---

## 7. Platform features (beyond the raw API)

- **Studio Mode** — the "lab" for generating/iterating on media (images, video, music, characters, voice, 3D). Has a Builder canvas for agent workflows, a Skills marketplace, and a Templates gallery. You can deep-link into chat with `?tool=`, `?type=`, `?prompt=` query params to pre-seed a workflow.
- **Agent Mode ("Claw")** — a browser-based autonomous coding agent with a tool-use loop, a WebAssembly Alpine Linux VM sandbox, and 12 built-in tools (bash, file ops, fetch, diff apply, memory, JS execution…). Two files define its behavior — very similar to how Claude Code works:
  - `SOUL.md` — the agent's personality and custom instructions (appended to every system prompt)
  - `MEMORY.md` — persistent topic-based memory that survives sessions
  - **Skills** — reusable markdown files with YAML frontmatter, invoked via slash commands like `/review src/index.ts`, with `{{param}}` template substitution
- **HQ** — multi-agent operations dashboard: create *issues* (work units), build *agents*, group them into *squads*, and configure *autopilots* (trigger-based automation).
- **MCP Server (`@geoffai/mcp`)** — exposes 66+ Geoff tools to any MCP client (Claude Desktop, Cursor, VS Code). Setup is documented under the docs' *MCP Server* section (claimed "3-minute" setup with per-client config examples).

---

## 8. Security & billing — ⭐ must read: `/docs/security`

**API key hygiene (from the official docs):**
- Rotate keys regularly
- Use environment variables, never hardcode
- Separate keys for development and production
- Revoke unused keys from the Settings page
- Never commit keys to git or ship them in client-side code

**Rate limits:** vary by plan; check the Geoff Dashboard. Three protective layers exist for agent operations (burst limits, per-agent daily caps, doc-wide caps) — rejected requests cost zero tokens.

**Billing (Token Plan, ⭐ `/token-plan/overview`):** one unified token balance covers all capabilities. Plans: Basic $19/150M tokens, Pro $199/2B, Max $499/7B, Turbo $999/20B per month — with per-key rate limits rising per tier (Basic: 60 req/min). Full table in [API-REFERENCE.md](API-REFERENCE.md). Agent edits on docs are billed at raw LLM token counts with no markup.

**Encrypted docs (Geoff Docs):** two modes — *Shared* (server-managed key, agents can edit) and *Private/E2E* (per-member X25519-wrapped keys, server cannot decrypt, agents disabled). Note that titles and commit messages stay unencrypted in both modes.

---

## 9. Must-read pages, in reading order

1. ⭐ `/introduction/overview` — what Geoff is
2. ⭐ `/introduction/quickstart` — first request in 5 minutes
3. ⭐ `/introduction/authentication` — keys and security
4. ⭐ `/introduction/models` — choosing `preview` / `duce` / `magma`
5. ⭐ `/api-reference/overview` — all endpoints + error handling
6. `/api-reference/text/openai-api` or `/text/anthropic-api` — SDK drop-in
7. `/cookbook/text-chat` and `/cookbook/text-streaming` — working recipes
8. `/docs/security` and `/docs/billing` — before going to production
9. `/features/*` — Studio, Agent Mode, HQ, Tool Catalog (when you outgrow the raw API)

---

## 10. Common pitfalls

| Pitfall | Fix |
|---|---|
| Lost API key | It's shown **once** — store it immediately; create a new one if lost |
| Key committed to git | Revoke it in Settings, rotate, add `.env` to `.gitignore` |
| Blocking on video generation | It's async — use the submit → poll → download pattern |
| Using `magma` for everything | `preview` is faster/cheaper for simple text tasks |
| Ignoring `429` errors | Implement exponential backoff; check plan limits in the Dashboard |
| Forgetting conversation history | Multi-turn = append each assistant reply to `messages` before the next request |
