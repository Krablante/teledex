# Install With Codez

Teledex requires Codez App Server v2. Install Codez first, make sure the
`codex` command is available, then configure Teledex to launch Codez through
the app-server-v2 backend.

```sh
git clone https://github.com/Krablante/teledex.git
cd teledex
npm ci
cp examples/teledex.env.example teledex.env
$EDITOR teledex.env
npm run doctor -- --env-file teledex.env
npm start -- --env-file teledex.env
```

The public backend is:

```env
TELEDEX_BACKEND=app-server-v2
TELEDEX_ENABLE_APP_SERVER_V2=1
TELEGRAM_FORUM_CHAT_ID=replace-me
CODEX_BIN_PATH=codex
CODEZ_APP_SERVER_URL=stdio://
```
