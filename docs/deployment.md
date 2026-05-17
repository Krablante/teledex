# Deployment

The public deployment model is a local Node.js service running next to a Codez
App Server v2-capable `codex` command.

Recommended flow:

1. Create a dedicated checkout and workspace.
2. Copy `examples/teledex.env.example` to a private env file.
3. Fill Telegram and Codez settings.
4. Run `npm run doctor`.
5. Start Teledex with `npm start -- --env-file teledex.env`.

Use your own process manager if you want Teledex to stay running after logout.
Keep env files and runtime state out of git.
