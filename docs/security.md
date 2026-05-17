# Security

Teledex lets allowlisted Telegram users operate Codez in
`TELEDEX_WORKSPACE_ROOT`. Treat that allowlist as trusted operator access.

Recommended defaults:

- Use a dedicated workspace.
- Keep `TELEGRAM_ALLOWED_USER_IDS` narrow.
- Store runtime state outside the source tree.
- Never commit real tokens, sessions, logs, or `.env` files.
- Run `npm run audit:public` before publishing changes.

The public repository intentionally excludes private runtime state, real env
values, Telegram sessions, host inventories, and deployment wiring.
