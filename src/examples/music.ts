// Music generation example: run with `npm run music`
// Style prompt formula (from the Geoff cookbook): genre + emotional tone + qualities.
// Lyrics use [verse]/[chorus] section markers.
import { generateMusic } from "../lib/client.js";

const lyrics = `[verse]
Lines of code in the morning light
One API to make it right
[chorus]
Geoff, oh Geoff, you route it all
Text and music, standing tall`;

const result = await generateMusic("Indie folk, melancholic, introspective, longing", { lyrics });

// The API returns hex-encoded audio plus metadata (duration, sample rate, bitrate...).
const { data } = result;
console.log("Metadata:", JSON.stringify({ ...data, audio: data?.audio ? "<hex omitted>" : undefined }, null, 2));
