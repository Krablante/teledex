# Architecture

Teledex connects Telegram to Codez App Server v2.

```text
Telegram Bot API
  -> Teledex update router
  -> session and topic state
  -> Codez App Server v2
  -> Telegram progress and final replies
```

The public runtime path is Codez App Server v2. Legacy `exec-json` code remains
in the source tree for compatibility tests and migration context, but it is not
the public setup path.

Important modules:

- `src/telegram`: Bot API client, update routing, topic commands, UI panels.
- `src/session-manager`: topic/session metadata and runtime selection.
- `src/pty-worker`: durable run orchestration and delivery behavior.
- `src/app-server-v2`: Codez app-server-v2 JSONL/RPC integration.
- `src/config`: env parsing and runtime configuration.
- `src/hosts`: optional host metadata helpers for advanced deployments.
