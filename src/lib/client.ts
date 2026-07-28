// Raw HTTP client for Geoff endpoints NOT covered by the Stacknet SDK (video, music).
// For text, streaming, structured output, images, speech, and embeddings use the SDK
// via src/lib/geoff.ts instead.
import { config } from "./config.js";

export class GeoffError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Geoff API error ${status}: ${JSON.stringify(body)}`);
  }
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new GeoffError(res.status, await res.json().catch(() => res.statusText));
  }
  return (await res.json()) as T;
}

/** Submit an async video generation job (POST /v1/video/generate). */
export function generateVideo(prompt: string, opts: { duration?: number; resolution?: string } = {}) {
  return request<any>("/v1/video/generate", {
    prompt,
    duration: opts.duration ?? 5,
    resolution: opts.resolution ?? "1080p",
  });
}

/** Poll a video job until it completes, then return the status payload. */
export async function waitForVideo(taskId: string, intervalMs = 5000, timeoutMs = 10 * 60 * 1000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const res = await fetch(`${config.baseUrl}/v1/video/status/${taskId}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    const status = await res.json();
    const state = status?.data?.status ?? status?.status;
    if (state === "completed" || state === "succeeded") return status;
    if (state === "failed") throw new Error(`Video generation failed: ${JSON.stringify(status)}`);
    if (Date.now() > deadline) throw new Error("Timed out waiting for video generation");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/** Music generation (POST /v1/music_generation). Lyrics support [verse]/[chorus] markers. */
export function generateMusic(prompt: string, opts: { lyrics?: string; model?: string } = {}) {
  return request<any>("/v1/music_generation", {
    model: opts.model ?? "magma",
    prompt,
    lyrics: opts.lyrics,
    audio_setting: { sample_rate: 44100, bitrate: 256000, format: "mp3" },
  });
}
