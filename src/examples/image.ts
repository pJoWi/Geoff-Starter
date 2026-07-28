// Text-to-image via the Stacknet SDK: run with `npm run image`
// Prompt formula (from the Geoff cookbook): subject + context/time + style
import { mkdirSync, writeFileSync } from "node:fs";
import { generateImage } from "@stacknet/sdk";
import { geoff } from "../lib/geoff.js";

const { image } = await generateImage({
  model: geoff.imageModel("magma"),
  prompt: "A futuristic city skyline at dusk, cyberpunk style",
  size: "1024x1024",
});

mkdirSync("output", { recursive: true });
writeFileSync("output/image.png", image.uint8Array);
console.log("Saved output/image.png");
