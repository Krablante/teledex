# Runbook

Запуск:

```sh
npm start -- --env-file teledex.env
```

Проверка:

```sh
npm run doctor -- --env-file teledex.env
```

`npm run smoke -- --env-file teledex.env` запускай после настройки локального
runtime окружения; для обычной проверки исходников он не обязателен.

Runtime state хранится в `TELEDEX_STATE_ROOT`. Реальные env, tokens и sessions
не коммитятся.
