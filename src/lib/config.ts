import "dotenv/config";

export const config = {
  apiKey: process.env.GEOFF_API_KEY ?? "",
  baseUrl: process.env.GEOFF_BASE_URL ?? "https://geoff.ai/api",
  defaultModel: process.env.GEOFF_DEFAULT_MODEL ?? "preview",
};

if (!config.apiKey) {
  throw new Error(
    "GEOFF_API_KEY is not set. Copy .env.example to .env and add your key (dashboard > Settings > API Keys).",
  );
}
