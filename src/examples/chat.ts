// Multi-turn chat via the Stacknet SDK: run with `npm run chat`
import { generateText } from "@stacknet/sdk";
import { geoff } from "../lib/geoff.js";
import { loadPrompt } from "../lib/prompts.js";

const system = loadPrompt("system", { tone: "concise and friendly" });

const first = await generateText({
  model: geoff("preview"),
  system,
  prompt: "What is Geoff, in one paragraph?",
  maxOutputTokens: 1024,
});
console.log("Assistant:", first.text);
console.log("Usage:", first.usage);

// Multi-turn: pass the full message history, including the previous assistant reply.
const second = await generateText({
  model: geoff("preview"),
  system,
  messages: [
    { role: "user", content: "What is Geoff, in one paragraph?" },
    { role: "assistant", content: first.text },
    { role: "user", content: "And which of its models has the largest context window?" },
  ],
});
console.log("Follow-up:", second.text);
