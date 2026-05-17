# Configuration

Copy `examples/teledex.env.example` to `teledex.env` and fill only your own
values.

Required settings:

- `TELEDEX_BACKEND=app-server-v2`
- `TELEDEX_ENABLE_APP_SERVER_V2=1`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ALLOWED_USER_IDS`
- `TELEGRAM_FORUM_CHAT_ID`
- `CODEX_BIN_PATH`
- `CODEZ_APP_SERVER_URL`
- `TELEDEX_WORKSPACE_ROOT`
- `TELEDEX_STATE_ROOT`

Use a dedicated workspace and a private state directory. Do not commit real
`.env` files, bot tokens, sessions, or local state.
