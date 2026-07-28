# Prompt templates

Copy these into new files in this folder (one template per file) and load them with
`loadPrompt("<filename-without-.md>", { param: "value" })`.

## Summarizer

> Summarize the following text in {{sentences}} sentences for a {{audience}} audience.
> Keep all numbers and names exact.
>
> Text:
> {{text}}

## Extractor (structured output)

> Extract every {{entity}} from the text below.
> Respond with ONLY a JSON array of objects: [{ "name": string, "context": string }].
> No prose, no markdown fences.
>
> Text:
> {{text}}

## Image prompt (subject + context + style)

> {{subject}}, {{context}}, {{style}}

Example: "A futuristic city skyline" + "at dusk" + "cyberpunk style"

## Music style prompt (genre + tone + qualities)

> {{genre}}, {{mood1}}, {{mood2}}, {{mood3}}

Example: "Indie folk, melancholic, introspective, longing"
