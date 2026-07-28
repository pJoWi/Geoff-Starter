# Geoff API — Complete Endpoint Reference

> Compiled from [docs.geoff.ai/api-reference/overview](https://docs.geoff.ai/api-reference/overview) by walking the full sidebar (July 2026).
> Doc links below are relative to `https://docs.geoff.ai`.

## Basics

- **Base URL:** `https://geoff.ai/api` (most endpoints live under `/v1/...`)
- **Auth:** `Authorization: Bearer <API_KEY>` on every request (key from dashboard → Settings → API Keys)
- **Response envelope:** `{ "data": ..., "trace_id": ..., "extra_info": ... }`
- **Errors:** standard HTTP codes (`400`, `401`, `403`, `404`, `429`, `500`) with `code` + `message` JSON — retry `429` with backoff

## Text

| Endpoint | Docs page | Notes |
|---|---|---|
| POST `/v1/text/chat` | `/api-reference/text/chat` | Native chat endpoint (used by this starter's client) |
| Anthropic-compatible `/v1/messages` | `/api-reference/text/anthropic-api` | Anthropic SDK with `base_url = "https://geoff.ai/api"` |
| OpenAI-compatible `/v1/chat/completions` | `/api-reference/text/openai-api` | OpenAI SDK with `base_url = "https://geoff.ai/api/v1"` |
| **Stacknet SDK** (recommended) | `/api-reference/text/ai-sdk` | `npm install @stacknet/sdk` — see below |

### Stacknet SDK (the docs' recommended integration)

```js
import { createStackNetProvider } from "@stacknet/sdk";

const geoff = createStackNetProvider({
  baseURL: "https://geoff.ai/api/v1",
  name: "geoff",
  apiKey: process.env.GEOFF_API_KEY,
});

const model = geoff("magma");            // also: geoff.chatModel(), geoff.embeddingModel()
```

Features: `generateText()` / `streamText()`, `generateObject()` / `streamObject()` with **Zod schemas** for type-safe structured output, tool calling with approval workflows, a React `useChat` hook, plus embeddings, image, speech, and transcription — one SDK for everything.

## Speech (17 endpoints)

| Group | Docs pages (`/api-reference/speech/...`) |
|---|---|
| Text-to-audio | `t2a-http`, `t2a-websocket` |
| Async T2A | `t2a-async-create`, `t2a-async-query` |
| Speech-to-text | `transcribe` |
| Voice cloning | `voice-upload-audio`, `voice-upload-prompt`, `voice-clone`, `one-shot-voice` |
| Voice design | `voice-design`, `voice-list` |
| Voice tools | `voice-convert`, `voice-dub`, `voice-extend`, `voice-emotion`, `voice-isolate`, `voice-denoise` |

## Video (async: submit → poll → download)

| Docs page (`/api-reference/video/...`) | Purpose |
|---|---|
| `text-to-video` | Generate from a text prompt |
| `image-to-video` | Animate an image |
| `start-end-to-video` | Interpolate between start/end frames |
| `subject-reference` | Keep a consistent subject across generations |
| `query-status` | Poll `task_id` until done |
| `download` | Fetch the finished video |

## Image

| Docs page (`/api-reference/image/...`) | Purpose |
|---|---|
| `text-to-image` | Generate (`prompt`, `width`, `height`) |
| `image-to-image` | Transform (`image` base64, `prompt`, `strength`) |
| `upscale` | Increase resolution |
| `photoshoot` | Product/person photoshoots |
| `face-generation` | Generate faces |
| `head-swap` | Swap heads between images |
| `tryon` | Virtual clothing try-on |
| `image-to-3d` | Generate 3D assets from an image |

## Music

| Docs page (`/api-reference/music/...`) | Purpose |
|---|---|
| `generate` | Text → music (`prompt`, `lyrics` with `[verse]`/`[chorus]`, `audio_setting`) |
| `lyrics` | Generate structured lyrics first (two-step workflow) |
| `cover` | Music → music covers |
| `edit` | Edit existing music |
| `stems` | Extract stems (vocals, drums, ...) |

## Code

| Endpoint | Docs page | Notes |
|---|---|---|
| POST `/v1/code/execute` | `/api-reference/code/execute` | Run a snippet: `python`, `javascript`, `typescript`, `rust`, `go`, `shell`; `timeout` ≤ 300s; returns `stdout`, `stderr`, `exit_code`, generated `files` |
| POST sandbox create | `/api-reference/code/sandbox-create` | Persistent sandbox |
| POST sandbox exec | `/api-reference/code/sandbox-exec` | Run inside a sandbox |
| POST agent stream | `/api-reference/code/stream` | Streaming code agent |

## Training (LoRA & voice)

| Docs page (`/api-reference/training/...`) | Purpose |
|---|---|
| `image-lora` / `video-lora` / `music-lora` | Train custom LoRAs |
| `voice-model` | Train a custom voice |
| `status` (GET) | Poll training jobs |

## File

| Endpoint | Docs page |
|---|---|
| POST `/v1/files/upload` (multipart; `purpose`: `image-input` \| `video-input` \| `audio-input` \| `general`) | `/api-reference/file/upload` |
| GET `/v1/files/list` | `/api-reference/file/list` |
| GET `/v1/files/retrieve` | `/api-reference/file/retrieve` |
| GET `/v1/files/retrieve-content` | `/api-reference/file/retrieve-content` |
| POST `/v1/files/delete` | `/api-reference/file/delete` |

## Token Plan (pricing & rate limits) — `/token-plan/overview`

One token balance covers **all** capabilities (text, speech, video, image, music, code, files). Consumption varies with resolution, duration, and complexity.

| Plan | $/month | Tokens/month | Req/min | Input tok/min | Output tok/min |
|---|---|---|---|---|---|
| Basic | $19 | 150M | 60 | 100K | 50K |
| Pro | $199 | 2B | 125 | 500K | 200K |
| Max | $499 | 7B | 200 | 2M | 800K |
| Turbo | $999 | 20B | 450 | 5M | 2M |

- Exceeding rate limits → `429 Too Many Requests` (limits are **per API key**)
- Premium tiers unlock cross-conversation memory, model training, multi-agent mode
- ⚠️ Unfiltered/NSFW requests cost **10× tokens**
