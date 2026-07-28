# Geoff Starter

A minimal TypeScript starter for building with the [Geoff API](https://docs.geoff.ai/) — one gateway for text, image, video, music, speech, and file APIs. Built on the [Stacknet SDK](https://docs.geoff.ai/api-reference/text/ai-sdk) (`@stacknet/sdk`), the Geoff docs' recommended integration.

**New to Geoff? Start with [docs/GEOFF-GUIDE.md](docs/GEOFF-GUIDE.md)** — a step-by-step guide with the must-read pages highlighted. Then [docs/GEOFF-CODE-GUIDE.md](docs/GEOFF-CODE-GUIDE.md) for the Geoff Code terminal agent, and [docs/PROMPTING.md](docs/PROMPTING.md) for prompting techniques.

## Project structure

```
geoff-starter/
├── AGENTS.md               # Project summary Geoff Code reads at session start
├── .mcp.json               # Project-shared MCP servers for Geoff Code (example, disabled)
├── .geoff/
│   └── skills/
│       └── geoff-api/      # Project skill: this repo's API conventions (auto-activates)
├── docs/
│   ├── GEOFF-GUIDE.md      # Step-by-step guide to the Geoff API (start here)
│   ├── GEOFF-CODE-GUIDE.md # Step-by-step guide to Geoff Code (terminal agent)
│   ├── API-REFERENCE.md    # Complete endpoint map + Token Plan pricing/rate limits
│   └── PROMPTING.md        # Prompting techniques per modality + Geoff Code
├── prompts/                # Prompt templates ({{param}} placeholders), kept out of code
│   ├── system.md
│   └── templates.md
├── src/
│   ├── lib/
│   │   ├── config.ts       # Env loading + validation
│   │   ├── geoff.ts        # Stacknet SDK provider (text, stream, structured, image, ...)
│   │   ├── client.ts       # Raw-fetch client ONLY for endpoints the SDK lacks (video, music)
│   │   └── prompts.ts      # Prompt template loader
│   └── examples/           # Runnable examples, one per capability
│       ├── chat.ts         # Multi-turn chat (SDK generateText)
│       ├── stream.ts       # Streaming (SDK streamText)
│       ├── structured.ts   # Type-safe JSON via Zod (SDK generateObject)
│       ├── image.ts        # Text-to-image (SDK generateImage)
│       ├── video.ts        # Async video (raw API: submit → poll → download)
│       └── music.ts        # Music with structured lyrics (raw API)
├── .env.example            # Copy to .env, add your key
└── package.json
```

## Setup

1. **Get an API key**: Geoff dashboard → Settings → API Keys → Create API Key. It's shown **only once** — save it immediately.
2. **Configure**:

   ```bash
   cp .env.example .env
   # edit .env and paste your key
   ```

3. **Install & run**:

   ```bash
   npm install
   npm run chat        # first request (Stacknet SDK)
   npm run stream      # streaming (SDK)
   npm run structured  # type-safe JSON output with Zod (SDK)
   npm run image       # text-to-image (SDK)
   npm run video       # async video generation (raw API)
   npm run music       # music with lyrics (raw API)
   ```

## Using Geoff Code with this repo

This repo is pre-configured for [Geoff Code](https://docs.geoff.ai/geoff-code/getting-started), Geoff's terminal coding agent:

```bash
npm install -g @geoff/code
geoff login
cd geoff-starter
geoff
```

Geoff Code will pick up [AGENTS.md](AGENTS.md) (project context) and the `geoff-api` skill in `.geoff/skills/` (repo conventions) automatically. See [docs/GEOFF-CODE-GUIDE.md](docs/GEOFF-CODE-GUIDE.md) for permission modes, sessions, hooks, MCP, and the command cheatsheet.

## Models

| ID | Best for |
| --- | --- |
| `preview` | Fast, cheap text + vision tasks |
| `duce` | Music, TTS, multimodal creation |
| `magma` | 1M context, video, agentic workflows |

Set the default in `.env` (`GEOFF_DEFAULT_MODEL`) or per call.

## Prefer the OpenAI or Anthropic SDK instead?

Geoff is drop-in compatible — just change the base URL:

- **OpenAI SDK**: `base_url = "https://geoff.ai/api/v1"`
- **Anthropic SDK**: `base_url = "https://geoff.ai/api"`

See [docs/GEOFF-GUIDE.md §4](docs/GEOFF-GUIDE.md) for examples.

## Security

- `.env` is git-ignored — never commit keys.
- Use separate keys for dev and production; rotate regularly; revoke unused keys.
