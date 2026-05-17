# Troubleshooting

Common checks:

- `npm ci` completed successfully.
- `CODEX_BIN_PATH` points to a Codez command with App Server v2 support.
- `TELEDEX_BACKEND=app-server-v2` and `TELEDEX_ENABLE_APP_SERVER_V2=1` are set.
- `TELEGRAM_BOT_TOKEN` is from your own BotFather bot.
- `TELEGRAM_ALLOWED_USER_IDS` includes your own numeric Telegram user id.
- `TELEDEX_WORKSPACE_ROOT` exists and is safe for the allowed users.

Run:

```sh
npm run doctor -- --env-file teledex.env
```

Use `npm run smoke -- --env-file teledex.env` only after configuring a local
runtime environment with Codez App Server v2 available.
