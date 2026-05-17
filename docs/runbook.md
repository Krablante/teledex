# Runbook

Start:

```sh
npm start -- --env-file teledex.env
```

Validate:

```sh
npm run doctor -- --env-file teledex.env
```

`npm run smoke -- --env-file teledex.env` is useful after the local runtime
environment is configured; it is not required for ordinary source verification.

Stop the process with your process manager or terminal interrupt. Runtime state
lives under `TELEDEX_STATE_ROOT`.
