# Testing

Local verification:

`npm run audit:public` is a clean-tree publication audit. Run it before
`npm ci`, or after removing local install artifacts such as `node_modules`.

```sh
npm run audit:public
npm ci
npm run check:syntax
npm test
npm run smoke:config
```

Live validation requires your own Telegram bot, allowlisted user id, and Codez
App Server v2 setup:

```sh
npm run test:live:app-server-v2 -- --env-file teledex.env
```

Legacy `exec-json` tests remain in the source tree as compatibility coverage.
They are not the public runtime path.
