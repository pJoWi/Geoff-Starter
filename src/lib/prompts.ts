import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const promptsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "prompts");

/**
 * Load a prompt template from prompts/<name>.md and substitute {{param}} placeholders —
 * the same template syntax Geoff skills use.
 */
export function loadPrompt(name: string, params: Record<string, string> = {}): string {
  let text = readFileSync(join(promptsDir, `${name}.md`), "utf-8");
  for (const [key, value] of Object.entries(params)) {
    text = text.replaceAll(`{{${key}}}`, value);
  }
  return text;
}
