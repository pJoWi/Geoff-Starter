// Type-safe structured output with Zod via the Stacknet SDK: run with `npm run structured`
import { generateObject } from "@stacknet/sdk";
import { z } from "zod";
import { geoff } from "../lib/geoff.js";

const { object } = await generateObject({
  model: geoff("preview"),
  schema: z.object({
    name: z.string(),
    age: z.number(),
    interests: z.array(z.string()),
  }),
  prompt: "Generate a fictional character profile.",
});

// `object` is fully typed: { name: string; age: number; interests: string[] }
console.log(object);
