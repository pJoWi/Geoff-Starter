// Async video generation example: submit -> poll -> report. Run with `npm run video`
import { generateVideo, waitForVideo } from "../lib/client.js";
import { config } from "../lib/config.js";

const job = await generateVideo(
  "A serene sunset over a calm ocean, cinematic quality",
  { duration: 5, resolution: "1080p" },
);
console.log("Submitted:", JSON.stringify(job, null, 2));

const taskId = job?.data?.task_id ?? job?.task_id;
if (!taskId) throw new Error("No task_id in response — inspect the payload above.");

console.log("Polling until the video is ready (this can take a while)...");
const status = await waitForVideo(taskId);
console.log("Done:", JSON.stringify(status, null, 2));
console.log(`Download: ${config.baseUrl}/v1/video/download/${taskId}`);
