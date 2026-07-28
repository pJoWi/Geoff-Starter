---
name: geoff-api
description: How this repo calls the Geoff API — client wrapper usage, error handling, env config, model selection, and the async video pattern. Use when adding or modifying any Geoff API call.
---

# Geoff API conventions for this repo

## SDK first, raw client second

This repo uses the **Stacknet SDK** (`@stacknet/sdk`) — the Geoff docs' recommended
integration. The provider lives in `src/lib/geoff.ts`:

- Text: `generateText({ model: geoff("preview"), ... })`
- Streaming: `streamText(...)` and iterate `result.textStream`
- Structured output: `generateObject({ schema: z.object({...}), ... })` — always Zod, never parse free text
- Images: `generateImage({ model: geoff.imageModel("magma"), ... })`
- Also available: `tool()` for tool calling, `embed`/`embedMany`, `generateSpeech`, `transcribe`

`src/lib/client.ts` is the raw-fetch fallback ONLY for endpoints the SDK doesn't
cover (video generate/poll/download, music generation). Never call `fetch()` against
`geoff.ai` directly from examples or app code.

To add a new capability:

1. Prefer an SDK function with the `geoff` provider. If the SDK has no support,
   add a typed function in `src/lib/client.ts` using the shared `request()` helper
   (it handles the base URL, Bearer auth, and throws `GeoffError` on non-2xx).
2. Add a runnable example in `src/examples/<name>.ts`.
3. Add an npm script `"<name>": "tsx src/examples/<name>.ts"` in `package.json`.

## Error handling

`request()` throws `GeoffError { status, body }`. Catch it at the example/app level;
`429` should be retried with exponential backoff, everything else surfaced.

## Model selection

- `preview` — default for cheap/fast text and vision tasks
- `duce` — anything audio/music related
- `magma` — long context (1M), video, agentic work

Default model comes from `GEOFF_DEFAULT_MODEL` in `.env`; pass `{ model }` per call to override.

## Async endpoints

Video generation is asynchronous: `generateVideo()` returns a `task_id`;
poll with `waitForVideo(taskId)`; download from `/v1/video/download/{task_id}`.
Apply the same submit → poll → download pattern to any future async endpoint.

## Prompts

Prompt text lives in `prompts/*.md` with `{{param}}` placeholders, loaded via
`loadPrompt(name, params)` from `src/lib/prompts.ts`. Do not inline prompt strings.
