#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  let envFile = "examples/teledex.env.example";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--env-file") {
      envFile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--env-file=")) {
      envFile = arg.slice("--env-file=".length);
    }
  }
  return { envFile };
}

function parseEnv(text) {
  const values = {};
  for (const rawLine of text.replace(/^\uFEFF/u, "").split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const normalized = line.startsWith("export ") ? line.slice("export ".length) : line;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = normalized.slice(0, separatorIndex).trim();
    const value = normalized.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    values[key] = value;
  }
  return values;
}

function fail(message, details = []) {
  console.error("smoke:config failed: " + message);
  for (const detail of details) {
    console.error("- " + detail);
  }
  process.exit(1);
}

const { envFile } = parseArgs(process.argv.slice(2));
const envPath = path.resolve(envFile);
const env = parseEnv(await fs.readFile(envPath, "utf8"));
const required = [
  "TELEDEX_BACKEND",
  "TELEDEX_ENABLE_APP_SERVER_V2",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_ALLOWED_USER_IDS",
  "TELEGRAM_FORUM_CHAT_ID",
  "CODEX_BIN_PATH",
  "CODEZ_APP_SERVER_URL",
  "TELEDEX_WORKSPACE_ROOT",
  "TELEDEX_STATE_ROOT",
];
const missing = required.filter((key) => !env[key]);
if (missing.length > 0) {
  fail("missing required keys", missing);
}
const errors = [];
if (env.TELEDEX_BACKEND !== "app-server-v2") {
  errors.push("TELEDEX_BACKEND must be app-server-v2");
}
if (!["1", "true", "yes", "on"].includes(env.TELEDEX_ENABLE_APP_SERVER_V2.toLowerCase())) {
  errors.push("TELEDEX_ENABLE_APP_SERVER_V2 must be enabled");
}
if (env.TELEDEX_WORKSPACE_ROOT === "." || env.TELEDEX_WORKSPACE_ROOT === "./") {
  errors.push("TELEDEX_WORKSPACE_ROOT should be a dedicated workspace, not the source root");
}
if (env.TELEDEX_STATE_ROOT === "." || env.TELEDEX_STATE_ROOT === "./") {
  errors.push("TELEDEX_STATE_ROOT must not be the source root");
}
if (env.TELEDEX_STATE_ROOT === env.TELEDEX_WORKSPACE_ROOT) {
  errors.push("TELEDEX_STATE_ROOT and TELEDEX_WORKSPACE_ROOT must be separate paths");
}
if (!/^stdio:\/\/|^https?:\/\//u.test(env.CODEZ_APP_SERVER_URL)) {
  errors.push("CODEZ_APP_SERVER_URL must be stdio:// or an http(s) URL");
}
if (errors.length > 0) {
  fail("invalid public config contract", errors);
}
console.log("smoke:config OK");
console.log("env_file: " + envPath);
console.log("backend: " + env.TELEDEX_BACKEND);
console.log("workspace_root: " + env.TELEDEX_WORKSPACE_ROOT);
console.log("state_root: " + env.TELEDEX_STATE_ROOT);
