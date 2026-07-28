// Streaming via the Stacknet SDK: run with `npm run stream`
import { streamText } from "@stacknet/sdk";
import { geoff } from "../lib/geoff.js";

const result = streamText({
  model: geoff("magma"),
  prompt: "Write a short story about a friendly API gateway.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
process.stdout.write("\n");
