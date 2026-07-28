import { createStackNetProvider } from "@stacknet/sdk";
import { config } from "./config.js";

/**
 * Geoff provider for the Stacknet SDK — the docs' recommended integration.
 * Use geoff("<model-id>") for text, geoff.imageModel() / geoff.embeddingModel() for the rest.
 */
export const geoff = createStackNetProvider({
  baseURL: `${config.baseUrl}/v1`,
  name: "geoff",
  apiKey: config.apiKey,
});
