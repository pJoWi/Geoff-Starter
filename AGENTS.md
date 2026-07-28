# geoff-starter

Starter project for building with the Geoff API (geoff.ai), pre-configured for Geoff Code.
(This file is what `geoff` reads at session start — regenerate with `/init` after big changes, then curate by hand.)

## What this project is

A minimal TypeScript (ESM, Node 18+) starter built on the **Stacknet SDK** (`@stacknet/sdk`),
the Geoff docs' recommended integration. A small raw-fetch client remains only for endpoints
the SDK does not cover.

## Layout

- `src/lib/geoff.ts` — the Stacknet SDK provider (`createStackNetProvider`). **Text, streaming, structured output, images, speech, embeddings go through the SDK** (`generateText`, `streamText`, `generateObject`, `generateImage`, ... imported from `@stacknet/sdk`).
- `src/lib/client.ts` — raw-fetch client ONLY for endpoints the SDK doesn't cover (video generate/poll, music).
- `src/lib/config.ts` — env loading (`GEOFF_API_KEY`, `GEOFF_BASE_URL`, `GEOFF_DEFAULT_MODEL`); throws if the key is missing.
- `src/lib/prompts.ts` — loads `prompts/*.md` templates with `{{param}}` substitution.
- `src/examples/*.ts` — one runnable example per capability; each maps to an npm script.
- `prompts/` — prompt templates live here, never inline in code.
- `docs/` — GEOFF-GUIDE.md (API), GEOFF-CODE-GUIDE.md (this CLI), PROMPTING.md (techniques).

## Conventions

- Prompts belong in `prompts/*.md`, loaded via `loadPrompt()` — do not hardcode prompt strings in TypeScript.
- New capabilities: prefer the Stacknet SDK via the `geoff` provider from `src/lib/geoff.ts`. Only add to `src/lib/client.ts` (shared `request()` helper) when the SDK has no support for the endpoint. Either way, add a matching example in `src/examples/` and an npm script.
- Structured output uses `generateObject` + Zod schemas — never parse free-form JSON from text.
- Model IDs are `preview` (fast/cheap), `duce` (music/audio), `magma` (1M ctx, video, agents). Default comes from `GEOFF_DEFAULT_MODEL`.
- Video generation is async: submit → poll `waitForVideo()` → download. Never block a request on it.
- Secrets only via `.env` (git-ignored). Never commit keys; `.env.example` documents required vars.

## Commands

- `npm run typecheck` — must pass before considering any change done
- `npm run chat|stream|structured|image|video|music` — run examples (require a real `GEOFF_API_KEY`)
