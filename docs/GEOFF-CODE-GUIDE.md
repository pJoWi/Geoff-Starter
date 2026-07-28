# Geoff Code — Step-by-Step Guide

> Based on [docs.geoff.ai/geoff-code](https://docs.geoff.ai/geoff-code/getting-started) (July 2026).
> ⭐ = must read. Geoff Code is Geoff's **terminal AI coding agent** — it reads code, makes edits, runs commands, and verifies its own work from a conversational interface (same concept as Claude Code).

---

## 1. Install ⭐

```bash
# macOS / Linux
curl -fsSL https://geoff.ai/code/install.sh | bash
```

```bash
# Any platform via npm
npm install -g @geoff/code
```

Verify:

```bash
geoff --version
```

Config lives in `~/.geoff` (override with the `GEOFF_CODE_HOME` env variable).

## 2. Authenticate ⭐

Preferred: device-code login.

```bash
geoff login
```

Alternatives (e.g. for CI):

- Flag: `geoff --api-key sk-geoff-...` (not persisted to config)
- Env: `export GEOFF_API_KEY="sk-geoff-..."`
- Config: a `[providers.*]` block in `~/.geoff/config.toml`

## 3. First run

`cd` into a project and run `geoff`. First run creates default config files. The default model is **`pyro`** (1M context) — switch with `-m <model>` or the `/model` picker.

Three usage modes:

| Mode | How | When |
| --- | --- | --- |
| **Interactive TUI** | `geoff` | Daily development (default) |
| **Non-interactive** | `geoff -p "prompt"` | Scripts, one-shot tasks |
| **IDE integration** | Agent Client Protocol | Editor plugins |

```bash
geoff -p "Summarize what changed in the last 5 commits."
geoff -p "List every TODO comment in src/" --output-format stream-json   # machine-readable
```

## 4. First thing in any repo: `/init` ⭐

Inside the TUI, run:

```
/init
```

This analyzes the project and writes an **`AGENTS.md`** summary — the agent reads it at session start, so later sessions understand your project instantly. Keep it updated (this starter ships one).

## 5. Permission modes — know before you run

| Mode | Behavior | Set via |
| --- | --- | --- |
| `manual` (default) | Pauses for approval on file edits and shell commands | — |
| `auto` | Auto-approves within limits | `--auto` or `/auto` |
| `yolo` | **Approves everything** | `-y` / `--yolo` or `/yolo` |
| plan mode | Read-only tools — explore/plan without changes | `--plan` or `/plan` |

> ⚠️ Only use `-y` in sandboxed/CI environments. For exploration of unfamiliar code, start in `--plan`.

## 6. Sessions

Sessions are recorded automatically in `~/.geoff`, organized per working directory. They persist conversation history, approvals, permission mode, plan state, and subagent contexts.

```bash
geoff -C              # continue the last session for this directory
geoff -S              # interactive session picker
geoff -S abc123       # resume a specific session
geoff export          # bundle transcripts + diagnostics into a ZIP
```

In the TUI: `/sessions` (switch), `/new` or `/clear` (fresh), `/fork` (branch a session), `/compact` (summarize to reclaim context), `/undo` (revert the agent's last change).

## 7. Project structure for a Geoff Code-ready repo ⭐

This is the layout this starter uses — copy it for future projects:

```
your-project/
├── AGENTS.md                  # Project summary the agent reads (generate with /init, then curate)
├── .mcp.json                  # Project-shared MCP servers (committed)
├── .geoff/
│   ├── skills/                # Project skills — conventions & workflows as markdown
│   │   └── my-skill/
│   │       └── SKILL.md       # YAML frontmatter (name, description) + markdown body
│   └── mcp.json               # Directory-local MCP overrides (optional)
└── src/ ...                   # your actual code
```

Plus user-level config (not in the repo):

```
~/.geoff/
├── config.toml                # Providers, models, permissions, hooks, loop control
├── tui.toml                   # Theme, editor, notifications, auto-update
├── mcp.json                   # User-global MCP servers
└── skills/                    # Personal skills, available in every project
```

Validate any config with `geoff doctor`.

## 8. Skills — teach the agent your conventions ⭐

A skill is a directory with a `SKILL.md`: YAML frontmatter + markdown. `name` is required (lowercase, 1–64 chars, hyphens); `description` (≤1,024 chars) is what the agent matches against for **automatic activation**. Explicit activation: `/skill:<name>`.

```markdown
---
name: api-conventions
description: How we call the Geoff API in this repo — client wrapper, error handling, env config.
---

Always use src/lib/client.ts for API calls. Never fetch() directly...
```

Discovery order (higher wins on name collisions):

1. Project: `.geoff/skills/` or `.agents/skills/`
2. User: `~/.geoff/skills/` or `~/.agents/skills/`
3. `extra_skill_dirs` config / `--skills-dir` flag
4. Built-ins

> 💡 Rule from the docs: "Skills are knowledge; plugins are packages and MCP servers are executable tools." Put *how we do things here* in skills — not runnable capabilities.

## 9. Subagents

The main agent can delegate big chunks of work to subagents with **isolated context** and **scoped permissions**. Built-in profiles:

| Profile | Access | Use for |
| --- | --- | --- |
| `coder` | Full read/write/execute + web + MCP | Implementation work |
| `explore` | Read-only search/files | Investigation |
| `plan` | Read + search only | Architecture planning |

Custom profiles are YAML, extending a built-in:

```yaml
name: reviewer
extends: agent
whenToUse: |
  Use for code review: read the diff, flag correctness and style issues...
systemPromptPath: ./reviewer-system.md
tools: [Read, Grep, Glob, Bash]
```

Notes: subagents can run in parallel, cannot spawn their own subagents, and have a fixed timeout. `/swarm` launches a coordinated swarm of agents. Delegation has handoff overhead — use it for substantial tasks only.

## 10. Hooks — deterministic automation

Shell commands triggered at lifecycle events, configured in `~/.geoff/config.toml`:

```toml
[[hooks]]
event = "PostToolUse"
matcher = "WriteFile|StrReplaceFile"
command = "jq -r '.tool_input.file_path' | xargs prettier --write"
timeout = 10
```

Events: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionResult`, `UserPromptSubmit`, `Stop`, `StopFailure`, `SessionStart`, `SessionEnd`, `SubagentStart`, `SubagentStop`, `PreCompact`, `PostCompact`, `Notification`.

Protocol: hook receives event JSON on stdin. Exit `0` = allow (stdout becomes context); exit `2` = **block** (stderr returned as correction); other = allow, stderr logged. Hooks fail open and run in parallel.

> 💡 Use hooks for things that must *always* happen (formatting, protecting files) — don't rely on the model remembering.

## 11. MCP servers — give the agent tools

Configured in `mcp.json` at three scopes (later overrides earlier): `~/.geoff/mcp.json` (user) → `<repo>/.mcp.json` (project, committed) → `<cwd>/.geoff/mcp.json` (local).

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"],
      "env": { "SOME_VAR": "value" }
    },
    "internal-api": {
      "url": "https://mcp.internal.example.com/mcp",
      "bearerTokenEnvVar": "INTERNAL_MCP_TOKEN"
    }
  }
}
```

- `/mcp-config` in the TUI for guided setup; `/mcp-config login <server>` for OAuth
- Optional fields: `enabled`, `toolTimeoutMs`, tool allow/blocklists
- MCP tools go through the same approval prompts as built-in tools
- **Config changes need a new session** (`/new`)

## 12. config.toml essentials

```toml
default_model = "pyro"
default_permission_mode = "manual"   # manual | auto | yolo
default_plan_mode = false

[providers.geoff]
type = "anthropic"
base_url = "https://geoff.ai/api"
api_key = "${GEOFF_API_KEY}"

[models.pyro]
provider = "geoff"
model = "pyro-1m"
max_context_size = 1000000
display_name = "Pyro"
capabilities = ["thinking", "image_in"]

[[permission.rules]]
decision = "allow"
scope = "user"
pattern = "Bash(git status)"

[loop_control]
max_steps_per_turn = 1000
compaction_trigger_ratio = 0.85
```

Provider types supported: `anthropic`, `openai`, `openai_responses`, `google-genai`, `vertexai`, `kimi` — so Geoff Code can also drive non-Geoff models.

## 13. Command cheatsheet

**CLI flags:** `-C` continue · `-S [id]` resume/picker · `-m <model>` · `-p "<prompt>"` one-shot · `--output-format stream-json` · `-y` yolo · `--auto` · `--plan` · `--skills-dir <dir>` · `-k <key>`

**Slash commands:** `/init` · `/help` · `/model` · `/plan` · `/auto` · `/yolo` · `/sessions` · `/new` · `/fork` · `/compact` · `/undo` · `/skill:<name>` · `/mcp-config` · `/plugins` · `/swarm` · `/status` · `/usage` · `/theme` · `/editor` · `/login` · `/logout` · `/exit`

## 14. Prompting Geoff Code effectively ⭐ (from `/geoff-code/use-cases`)

1. **Be specific** — include file paths, exact error messages, reproduction commands. "Fix the 500 on POST /orders, repro: `npm test -- orders`" beats "the API is broken".
2. **Reference existing patterns** — "Match the error-handling style in `src/api/orders.ts`."
3. **Iterate** — start broad, refine based on what the agent produces.
4. **Sandbox dangerous operations** — keep approval prompts on outside controlled environments; use `--plan` for read-only exploration first.
5. **Lean on the Read → Edit → Verify loop** — ask for changes *with* verification: "add a /health endpoint to the Express server **and a test for it**."
6. **Use `/init` + AGENTS.md** so you don't re-explain the project every session.
7. **CI usage**: `geoff -p "..." -y --output-format stream-json` in a sandboxed pipeline.

## 15. Sweet-spot use cases

- **Feature implementation** — the Read → Edit → Verify workflow
- **Bug fixing** — give the error + repro; it finds root cause, fixes, re-runs tests
- **Codebase exploration** — architectural questions in unfamiliar repos (plan mode)
- **Batch edits** — repetitive changes across many files
- **Shell automation** — log analysis, file conversion, research
- **CI/CD** — non-interactive mode in pipelines
