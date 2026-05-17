<h1 align="center">Teledex</h1>

<p align="center">
  <strong>Telegram gateway for Codez App Server v2, durable topic sessions, and Codez-first agent workflows.</strong>
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/Codez-App%20Server%20v2-111111?style=for-the-badge" alt="Codez App Server v2">
  <img src="https://img.shields.io/badge/Telegram-gateway-229ED9?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram gateway">
</p>

<p align="center">
  <a href="./docs/install-with-codez.md">Install</a>
  ·
  <a href="./docs/config.md">Config</a>
  ·
  <a href="./docs/architecture.md">Architecture</a>
  ·
  <a href="./docs/stack.md">Stack</a>
  ·
  <a href="./docs/security.md">Security</a>
  ·
  <a href="./docs/troubleshooting.md">Troubleshooting</a>
</p>

Teledex connects Telegram chats and forum topics to local Codez sessions. It is
the Telegram gateway layer for the [Codez](https://github.com/Krablante/codez)
stack: Telegram handles the operator surface, Teledex owns routing/session
state, and Codez App Server v2 owns the agent runtime.

This repository is the full public source projection. It includes the real CLI,
Telegram gateway, Codez App Server v2 integration, session/state modules,
tests, scripts, docs, config examples, and publication audit tooling.

## Runtime Shape

```text
Telegram chat/topic -> Teledex -> Codez App Server v2
```

Codez App Server v2 is required for the public runtime. Upstream
`codex exec --json` compatibility code remains in the source tree for legacy
tests and migration context, but it is not the supported public backend.

## Quick Start

```sh
git clone https://github.com/Krablante/teledex.git
cd teledex
npm ci
cp examples/teledex.env.example teledex.env
$EDITOR teledex.env
npm run doctor -- --env-file teledex.env
npm start -- --env-file teledex.env
```

Minimal config:

```env
TELEDEX_BACKEND=app-server-v2
TELEDEX_ENABLE_APP_SERVER_V2=1
TELEGRAM_BOT_TOKEN=replace-me
TELEGRAM_ALLOWED_USER_IDS=replace-me
TELEGRAM_FORUM_CHAT_ID=replace-me
CODEX_BIN_PATH=codex
CODEZ_APP_SERVER_URL=stdio://
TELEDEX_WORKSPACE_ROOT=../teledex-workspace
TELEDEX_STATE_ROOT=../teledex-state
```

## Verify

`npm run audit:public` is a clean-tree publication audit. Run it before
`npm ci`, or after removing local install artifacts such as `node_modules`.

```sh
npm run audit:public
npm ci
npm run check:syntax
npm test
npm run smoke:config
```

`npm run smoke -- --env-file teledex.env` is an optional local runtime smoke for
a configured Linux user-service style environment. Live Telegram use still
requires your own bot token and allowlisted Telegram user id.

## Stack

| Layer | Public surface | Responsibility |
| --- | --- | --- |
| [Codez](https://github.com/Krablante/codez) | Codex-compatible runtime | App Server v2, goal RPC, long-session hardening, prompt pruning |
| [RTK Codex Plugin](https://github.com/Krablante/rtk-codex-plugin) | Optional Codex plugin | Shell/token safety and bounded output guarding |
| [Pitlane Codex Plugin](https://github.com/Krablante/pitlane-codex-plugin) | Optional Codex plugin | Token-efficient code navigation rewrites |
| Teledex | Telegram gateway/session layer | Topics, queues, goal UX, and Telegram delivery around durable Codez sessions |

## Security Boundary

Allowed Telegram users can operate Codez inside `TELEDEX_WORKSPACE_ROOT`.
Use a dedicated workspace and only allow users you trust. The public repo does
not ship private runtime state, tokens, personal routing data, local host
inventory, logs, sessions, or deployment files.

## License

MIT. Teledex is an independent Telegram gateway for the Codez stack and is not
an official Telegram, OpenAI, or Codex release.
