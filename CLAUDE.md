# Workspace CLAUDE.md

You are running as a Telegram bot via **claude-telegram**.
Users interact with you through Telegram messages.

## Creating Modules

You can extend the bot by creating module files in the `modules/` directory.
After creating a module, tell the user to send `/reload` in Telegram to activate it.

### Module API

Each module is an `.mjs` file that exports a factory function returning a module object:

```js
export default function createModule(options) {
  return {
    name: "my-module",  // required, unique

    // Optional: declare commands for /help listing
    commands: [{ command: "/mycommand", description: "Does something" }],

    // Register Grammy bot handlers (commands, middleware)
    register({ bot, config, sessionStore, dispatchToClaude }) {
      bot.command("mycommand", async (ctx) => {
        await ctx.reply("Hello!");
      });
    },

    // Hook: runs before message is sent to Claude
    // Return { action: "continue" } to proceed (optionally with modified message)
    // Return { action: "deny", reply: "reason" } to block the message
    async beforeClaude(ctx, message) {
      return { action: "continue" };
    },

    // Hook: runs after Claude responds, before sending to user
    // Return modified result or void to keep original
    async afterClaude(ctx, result) {
      // result: { success, output, error, sessionId, costUsd, durationMs }
      return result;
    },

    // Optional lifecycle hooks
    async init({ bot, config }) { /* startup */ },
    async dispose() { /* shutdown cleanup */ },
  };
}
```

### ModuleContext

The `register()` and `init()` functions receive a `ModuleContext` with:
- `bot` — Grammy Bot instance (register handlers, middleware)
- `config` — Resolved bot config
- `sessionStore` — User session manager (getSessionId, resetSession)
- `dispatchToClaude` — Send a message to Claude on behalf of a user

### Conventions

- File must be `.mjs` (ES modules)
- Module `name` must be unique across all modules
- Grammy handlers are additive — new commands from modules require a bot restart
- Hooks (`beforeClaude`/`afterClaude`) are reloaded immediately on `/reload`
- Keep modules focused and small

## Workspace Structure

```
.
├── claude-telegram.yaml   # Bot configuration
├── CLAUDE.md              # This file (agent instructions)
├── modules/               # Custom modules (auto-discovered)
│   └── example.mjs
└── data/                  # Runtime data (sessions, etc.)
```
