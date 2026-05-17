import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildStatusMessage, resolveStatusView } from "../src/telegram/status-view.js";

function buildWindowedLimitsSummary(overrides = {}) {
  return {
    available: true,
    capturedAt: "2026-04-04T13:10:00.000Z",
    source: "windows_worker",
    planType: null,
    limitName: "codex",
    unlimited: false,
    windows: [
      {
        label: "5h",
        usedPercent: 11,
        remainingPercent: 89,
        windowMinutes: 300,
        resetsAt: 1775277000,
        resetsAtIso: "2026-04-03T03:10:00.000Z",
      },
      {
        label: "7d",
        usedPercent: 33,
        remainingPercent: 67,
        windowMinutes: 10080,
        resetsAt: 1775881800,
        resetsAtIso: "2026-04-10T03:10:00.000Z",
      },
    ],
    primary: {
      label: "5h",
      usedPercent: 11,
      remainingPercent: 89,
      windowMinutes: 300,
      resetsAt: 1775277000,
      resetsAtIso: "2026-04-03T03:10:00.000Z",
    },
    secondary: {
      label: "7d",
      usedPercent: 33,
      remainingPercent: 67,
      windowMinutes: 10080,
      resetsAt: 1775881800,
      resetsAtIso: "2026-04-10T03:10:00.000Z",
    },
    ...overrides,
  };
}

test("buildStatusMessage reports session state, binding, and run state", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 300000,
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "Test topic 1",
      lifecycle_state: "active",
      execution_host_id: "workera",
      execution_host_label: "workera",
      execution_host_bound_at: "2026-04-21T19:05:00.000Z",
      execution_host_last_ready_at: "2026-04-21T19:01:00.000Z",
      execution_host_last_failure: null,
      codex_thread_id: "thread-1",
      last_run_status: "running",
      last_run_started_at: "2026-03-22T12:01:00.000Z",
      last_run_finished_at: null,
      last_token_usage: {
        input_tokens: 227200,
        cached_input_tokens: 180000,
        output_tokens: 1200,
        reasoning_tokens: 800,
        total_tokens: 228400,
      },
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    {
      state: {
        status: "running",
        threadId: "thread-1",
      },
    },
    null,
    null,
    "rus",
    buildWindowedLimitsSummary(),
  );

  assert.match(text, /тема: Test topic 1/u);
  assert.match(text, /run: running/u);
  assert.match(text, /папка: \/path\/to\/workspace/u);
  assert.match(text, /host: workera/u);
  assert.match(text, /status: ready/u);
  assert.match(text, /binding_immutable: yes/u);
  assert.match(text, /модель: gpt-5\.4/u);
  assert.match(text, /reasoning: Extra High \(xhigh\)/u);
  assert.match(text, /context window: 320000/u);
  assert.match(text, /язык: RUS/u);
  assert.match(
    text,
    /источник usage: native Codex token_count\.last_token_usage/u,
  );
  assert.match(text, /использование контекста: 71\.4%/u);
  assert.match(text, /текущие native active tokens: 228400 \/ 320000/u);
  assert.match(text, /токены после последнего compact: неизвестно/u);
  assert.match(text, /доступно токенов: 91600/u);
  assert.match(text, /вход\/кэш\/выход: 227200 \/ 180000 \/ 1200/u);
  assert.match(text, /reasoning tokens: 800/u);
  assert.match(text, /лимиты 5h: 89% осталось/u);
});

test("buildStatusMessage reports DeepSeek status with DeepSeek usage semantics", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 248400,
      codexBackend: "exec-json",
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "DeepSeek status",
      lifecycle_state: "active",
      session_runtime_provider: "deepseek",
      session_runtime_model: "deepseek-v4-pro",
      codex_backend: "deepseek-http",
      codex_thread_id: "thr_ds",
      last_run_status: "completed",
      last_run_backend: "deepseek-http",
      last_token_usage: {
        input_tokens: 50942,
        prompt_cache_hit_tokens: 36480,
        output_tokens: 1394,
        reasoning_tokens: 158,
      },
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    null,
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
  );

  assert.match(text, /backend: deepseek-http/u);
  assert.match(text, /runtime: deepseek/u);
  assert.match(text, /модель: deepseek-v4-pro/u);
  assert.match(text, /context window: 1000000/u);
  assert.match(text, /auto-compact: не применяется/u);
  assert.match(text, /лимиты: DeepSeek API \(gateway не отслеживает\)/u);
  assert.match(
    text,
    /источник usage: DeepSeek runtime turn\.usage \(суммарно по API-вызовам turn, не context pressure\)/u,
  );
  assert.match(
    text,
    /tool catalog: discovery-only, схемы tools подгружаются по запросу/u,
  );
  assert.match(text, /context pressure: неизвестно/u);
  assert.match(text, /DeepSeek turn API tokens: 52336/u);
  assert.match(text, /свежие uncached turn tokens: 15856 \/ 1000000 \(1\.6%\)/u);
  assert.match(text, /вход\/кэш\/fresh\/выход: 50942 \/ 36480 \/ 14462 \/ 1394/u);
  assert.match(text, /cache hit: 71\.6%/u);
  assert.match(text, /доступно context tokens: неизвестно/u);
  assert.match(text, /reasoning tokens: 158/u);
  assert.doesNotMatch(text, /использование контекста: 5\.2%/u);
  assert.doesNotMatch(text, /native Codex token_count/u);
  assert.doesNotMatch(text, /текущие native active tokens/u);
  assert.doesNotMatch(text, /токены после последнего compact/u);
  assert.doesNotMatch(text, /лимиты: безлимит/u);
});

test("buildStatusMessage reports DeepSeek Codex-provider status with native token semantics", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 248400,
      codexBackend: "exec-json",
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "DeepSeek running status",
      lifecycle_state: "active",
      session_runtime_provider: "deepseek",
      session_runtime_model: "deepseek-v4-pro",
      codex_thread_id: "thr_running",
      deepseek_active_turn_id: "turn_running",
      codex_backend: "exec-json",
      last_run_status: "running",
      last_run_backend: "exec-json",
      last_token_usage: {
        input_tokens: 300338,
        cached_input_tokens: 284032,
        output_tokens: 3825,
        reasoning_tokens: 1386,
        total_tokens: 304163,
      },
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    null,
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
  );

  assert.match(text, /backend: exec-json/u);
  assert.match(text, /runtime: deepseek/u);
  assert.doesNotMatch(text, /thread: thr_running/u);
  assert.doesNotMatch(text, /turn: turn_running/u);
  assert.match(text, /reasoning: Max \(xhigh\)/u);
  assert.match(text, /context window: 1000000/u);
  assert.match(text, /auto-compact: не применяется/u);
  assert.match(text, /лимиты: безлимит/u);
  assert.match(text, /источник usage: native Codex token_count\.last_token_usage/u);
  assert.match(text, /использование контекста: 30\.4%/u);
  assert.match(text, /текущие native active tokens: 304163 \/ 1000000/u);
  assert.match(text, /доступно токенов: 695837/u);
  assert.match(text, /вход\/кэш\/выход: 300338 \/ 284032 \/ 3825/u);
  assert.match(text, /reasoning tokens: 1386/u);
  assert.doesNotMatch(text, /DeepSeek runtime turn\.usage/u);
  assert.doesNotMatch(text, /tool catalog: discovery-only/u);
});

test("buildStatusMessage reports OpenRouter Codex-provider status without OpenAI limits", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 248400,
      openRouterReasoningEffort: "high",
      codexBackend: "exec-json",
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "OpenRouter status",
      lifecycle_state: "active",
      session_runtime_provider: "openrouter",
      session_runtime_model: "moonshotai/kimi-k2.6",
      codex_thread_id: "thr_or",
      codex_backend: "exec-json",
      last_run_status: "completed",
      last_run_backend: "exec-json",
      last_token_usage: {
        input_tokens: 1000,
        cached_input_tokens: 400,
        output_tokens: 120,
        reasoning_tokens: 50,
        total_tokens: 1120,
      },
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    null,
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
  );

  assert.match(text, /backend: exec-json/u);
  assert.match(text, /runtime: openrouter/u);
  assert.match(text, /модель: moonshotai\/kimi-k2\.6/u);
  assert.match(text, /reasoning: Max \(high\)/u);
  assert.match(text, /context window: 262144/u);
  assert.match(text, /auto-compact: не применяется/u);
  assert.match(text, /лимиты: OpenRouter API \(gateway не отслеживает\)/u);
  assert.match(text, /источник usage: native Codex token_count\.last_token_usage/u);
  assert.match(text, /использование контекста: 0\.4%/u);
  assert.match(text, /текущие native active tokens: 1120 \/ 262144/u);
  assert.match(text, /вход\/кэш\/выход: 1000 \/ 400 \/ 120/u);
  assert.match(text, /reasoning tokens: 50/u);
  assert.doesNotMatch(text, /лимиты: безлимит/u);
});

test("buildStatusMessage renders Codex profile backend as the configured transport backend", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 248400,
      codexBackend: "exec-json",
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "DeepSeek active profile marker",
      lifecycle_state: "active",
      session_runtime_provider: "deepseek",
      session_runtime_model: "deepseek-v4-pro",
      codex_backend: "codex",
      last_run_status: "running",
      last_run_backend: "codex",
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    {
      state: {
        status: "running",
        backend: "codex",
      },
    },
    null,
    null,
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
  );

  assert.match(text, /backend: exec-json/u);
  assert.doesNotMatch(text, /backend: codex/u);
});

test("buildStatusMessage shows configured DeepSeek provider context without auto-compact", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 248400,
      deepSeekContextWindow: 1_000_000,
      deepSeekAutoCompactTokenLimit: 750_000,
      codexBackend: "exec-json",
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "DeepSeek configured pressure",
      lifecycle_state: "active",
      session_runtime_provider: "deepseek",
      session_runtime_model: "deepseek-v4-pro",
      codex_backend: "exec-json",
      last_run_status: "completed",
      last_run_backend: "exec-json",
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    null,
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
  );

  assert.match(text, /reasoning: Max \(xhigh\)/u);
  assert.match(text, /context window: 1000000/u);
  assert.match(text, /auto-compact: не применяется/u);
});

test("buildStatusMessage uses configured DeepSeek reasoning when topic has no override", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 248400,
      deepSeekReasoningEffort: "high",
      codexBackend: "exec-json",
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "DeepSeek reasoning config",
      lifecycle_state: "active",
      session_runtime_provider: "deepseek",
      session_runtime_model: "deepseek-v4-pro",
      codex_backend: "exec-json",
      last_run_status: "completed",
      last_run_backend: "exec-json",
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    null,
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
  );

  assert.match(text, /reasoning: High \(high\)/u);
});

test("buildStatusMessage shows live DeepSeek turn state when session metadata is stale", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 248400,
      codexBackend: "exec-json",
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "DeepSeek live status",
      lifecycle_state: "active",
      session_runtime_provider: "deepseek",
      session_runtime_model: "deepseek-v4-pro",
      codex_thread_id: "thr_live",
      codex_backend: "deepseek-http",
      last_run_status: "running",
      last_run_backend: "deepseek-http",
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    null,
    "rus",
    null,
    {
      deepSeekRuntimeThread: {
        latestTurnId: "turn_live",
        latestTurnStatus: "in_progress",
      },
    },
  );

  assert.match(text, /thread: thr_live/u);
  assert.match(text, /turn: turn_live \(in_progress, live\)/u);
});

test("buildStatusMessage stays Agent-only even if removed legacy runtime flags are present", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 300000,
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "Test topic 1",
      lifecycle_state: "active",
      last_run_status: "idle",
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
  );

  assert.match(
    text,
    /источник usage: native Codex token_count\.last_token_usage/u,
  );
  assert.match(text, /использование контекста: ещё нет завершённого turn/u);
});

test("buildStatusMessage prefers the configured backend over stale idle session backend", () => {
  const text = buildStatusMessage(
    {
      codexBackend: "exec-json",
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 300000,
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "Stale backend status",
      lifecycle_state: "active",
      last_run_status: "completed",
      last_run_backend: "app-server",
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    null,
    "eng",
  );

  assert.match(text, /backend: exec-json/u);
  assert.doesNotMatch(text, /backend: app-server/u);
});

test("buildStatusMessage shows configured context window while using rollout usage details", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 320000,
      codexAutoCompactTokenLimit: 300000,
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "Test topic 2",
      lifecycle_state: "active",
      codex_thread_id: "thread-2",
      last_run_status: "completed",
      last_token_usage: null,
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    {
      captured_at: "2026-03-23T23:14:19.000Z",
      model_context_window: 275500,
      last_token_usage: {
        input_tokens: 18220,
        cached_input_tokens: 5504,
        output_tokens: 42,
        reasoning_tokens: 30,
        total_tokens: 18262,
      },
      rollout_path:
        "/home/example/.codex/sessions/2026/03/23/rollout-2026-03-23T23-14-18-thread-2.jsonl",
    },
  );

  assert.match(text, /context window: 320000/u);
  assert.match(text, /effective context window: 275500/u);
  assert.match(text, /язык: RUS/u);
  assert.match(text, /модель: gpt-5\.4/u);
  assert.match(
    text,
    /источник usage: native Codex token_count\.last_token_usage/u,
  );
  assert.match(text, /использование контекста: 6\.6%/u);
  assert.match(text, /текущие native active tokens: 18262 \/ 275500/u);
  assert.match(text, /токены после последнего compact: неизвестно/u);
  assert.match(text, /доступно токенов: 257238/u);
  assert.match(text, /вход\/кэш\/выход: 18220 \/ 5504 \/ 42/u);
  assert.match(text, /reasoning tokens: 30/u);
});

test("buildStatusMessage can show configured limits separately from effective rollout window", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.4",
      codexReasoningEffort: "xhigh",
      codexContextWindow: 290000,
      codexAutoCompactTokenLimit: 270000,
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "Configured vs effective",
      lifecycle_state: "active",
      codex_thread_id: "thread-3",
      last_run_status: "running",
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    {
      captured_at: "2026-04-21T12:00:00.000Z",
      model_context_window: 302500,
      last_token_usage: {
        input_tokens: 154531,
        cached_input_tokens: 154240,
        output_tokens: 60,
        reasoning_tokens: 0,
        total_tokens: 154591,
      },
      last_post_compact_token_usage: {
        input_tokens: 22990,
        cached_input_tokens: 22000,
        output_tokens: 53,
        reasoning_tokens: 0,
        total_tokens: 23043,
      },
    },
    null,
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
    {
      contextWindow: 320000,
      autoCompactTokenLimit: 305000,
    },
  );

  assert.match(text, /context window: 320000/u);
  assert.match(text, /auto-compact: 305000/u);
  assert.match(text, /effective context window: 302500/u);
  assert.match(text, /текущие native active tokens: 154591 \/ 302500/u);
  assert.match(text, /токены после последнего compact: 23043/u);
});

test("buildStatusMessage uses model catalog context window when config omits it", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.5",
      codexReasoningEffort: "xhigh",
      codexContextWindow: null,
      codexAutoCompactTokenLimit: 248400,
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "Catalog context",
      lifecycle_state: "active",
      last_run_status: "completed",
      last_token_usage: {
        input_tokens: 100000,
        cached_input_tokens: 80000,
        output_tokens: 1200,
        reasoning_tokens: 50,
        total_tokens: 101200,
      },
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    {
      agent: {
        model: "gpt-5.5",
        reasoningEffort: "xhigh",
        modelContextWindow: 272000,
      },
    },
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
  );

  assert.match(text, /context window: 272000/u);
  assert.match(text, /использование контекста: 37\.2%/u);
  assert.match(text, /текущие native active tokens: 101200 \/ 272000/u);
});

test("buildStatusMessage ignores stale cumulative native usage in status pressure", () => {
  const text = buildStatusMessage(
    {
      codexModel: "gpt-5.5",
      codexReasoningEffort: "xhigh",
      codexContextWindow: null,
      codexAutoCompactTokenLimit: 248400,
    },
    {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    {
      session_key: "-1000000:7",
      topic_name: "Cumulative usage",
      lifecycle_state: "active",
      last_run_status: "completed",
      last_token_usage: {
        input_tokens: 198180294,
        cached_input_tokens: 193993984,
        output_tokens: 437715,
        reasoning_tokens: null,
        total_tokens: 198618009,
      },
      workspace_binding: {
        repo_root: "/path/to/workspace",
        cwd: "/path/to/workspace",
        branch: "main",
        worktree_path: "/path/to/workspace",
      },
    },
    null,
    null,
    {
      agent: {
        model: "gpt-5.5",
        reasoningEffort: "xhigh",
        modelContextWindow: 272000,
      },
    },
    "rus",
    buildWindowedLimitsSummary({ unlimited: true }),
  );

  assert.match(text, /context window: 272000/u);
  assert.match(
    text,
    /usage warning: сохранённый token usage похож на cumulative\/stale/u,
  );
  assert.match(
    text,
    /использование контекста: неизвестно после игнорирования stale token usage/u,
  );
  assert.match(text, /текущие native active tokens: неизвестно \/ 272000/u);
  assert.doesNotMatch(text, /198618009 \/ 272000/u);
});

test("resolveStatusView prefers live runtime overrides over the codex config file on disk", async () => {
  const configDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "teledex-status-view-"),
  );
  const configPath = path.join(configDir, "config.toml");
  await fs.writeFile(
    configPath,
    [
      'model = "gpt-5.4-mini"',
      "model_context_window = 111111",
      "model_auto_compact_token_limit = 101010",
      "",
    ].join("\n"),
    "utf8",
  );

  const state = {
    codexConfigPath: configPath,
    codexModel: "gpt-5.4",
    codexReasoningEffort: "xhigh",
    codexContextWindow: 320000,
    codexAutoCompactTokenLimit: 305000,
  };
  const session = {
    session_key: "-1000000:7",
    topic_name: "Runtime overrides win",
    lifecycle_state: "active",
    workspace_binding: {
      repo_root: "/path/to/workspace",
      cwd: "/path/to/workspace",
      branch: "main",
      worktree_path: "/path/to/workspace",
    },
  };
  const sessionService = {
    async resolveCodexRuntimeProfile() {
      return {
        model: "gpt-5.4",
        reasoningEffort: "xhigh",
      };
    },
    async resolveContextSnapshot(currentSession) {
      return {
        session: currentSession,
        snapshot: null,
      };
    },
    async getCodexLimitsSummary() {
      return null;
    },
    async resolveSessionExecution() {
      return null;
    },
  };

  const resolved = await resolveStatusView({
    state,
    message: {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    session,
    sessionService,
    language: "eng",
  });

  assert.match(resolved.text, /context window: 320000/u);
  assert.match(resolved.text, /auto-compact: 305000/u);
  assert.doesNotMatch(resolved.text, /111111/u);
  assert.doesNotMatch(resolved.text, /101010/u);
});

test("resolveStatusView prefers active run token usage over stored session snapshot", async () => {
  const state = {
    codexModel: "gpt-5.5",
    codexReasoningEffort: "xhigh",
    codexContextWindow: 272000,
    codexAutoCompactTokenLimit: 248400,
  };
  const session = {
    session_key: "-1000000:7",
    topic_name: "Active usage wins",
    lifecycle_state: "active",
    last_run_status: "running",
    last_token_usage: {
      input_tokens: 198180294,
      cached_input_tokens: 193993984,
      output_tokens: 437715,
      reasoning_tokens: null,
      total_tokens: 198618009,
    },
    workspace_binding: {
      repo_root: "/path/to/workspace",
      cwd: "/path/to/workspace",
      branch: "main",
      worktree_path: "/path/to/workspace",
    },
  };
  const activeRun = {
    state: {
      status: "running",
      lastTokenUsage: {
        input_tokens: 121000,
        cached_input_tokens: 110000,
        output_tokens: 500,
        reasoning_tokens: 20,
        total_tokens: 121500,
      },
    },
  };
  const sessionService = {
    async resolveCodexRuntimeProfile() {
      return {
        model: "gpt-5.5",
        reasoningEffort: "xhigh",
        modelContextWindow: 272000,
      };
    },
    async resolveContextSnapshot(currentSession) {
      return {
        session: currentSession,
        snapshot: {
          model_context_window: 272000,
          last_token_usage: currentSession.last_token_usage,
        },
      };
    },
    async getCodexLimitsSummary() {
      return buildWindowedLimitsSummary({ unlimited: true });
    },
    async resolveSessionExecution() {
      return null;
    },
  };
  const workerPool = {
    getActiveRun() {
      return activeRun;
    },
  };

  const resolved = await resolveStatusView({
    state,
    message: {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    session,
    sessionService,
    workerPool,
    language: "rus",
  });

  assert.match(textOf(resolved), /текущие native active tokens: 121500 \/ 272000/u);
  assert.doesNotMatch(textOf(resolved), /198618009/u);
});

test("resolveStatusView keeps live Codex session token counts over stale active run usage", async () => {
  const state = {
    codexModel: "gpt-5.5",
    codexReasoningEffort: "xhigh",
    codexContextWindow: 258400,
    codexAutoCompactTokenLimit: 248400,
  };
  const session = {
    session_key: "-1000000:7",
    topic_name: "Live status refresh",
    lifecycle_state: "active",
    last_run_status: "running",
    last_token_usage: {
      input_tokens: 183209,
      cached_input_tokens: 182656,
      output_tokens: 475,
      reasoning_tokens: 103,
      total_tokens: 183684,
    },
    workspace_binding: {
      repo_root: "/path/to/workspace",
      cwd: "/path/to/workspace",
      branch: "main",
      worktree_path: "/path/to/workspace",
    },
  };
  const activeRun = {
    state: {
      status: "running",
      threadId: "thread-live-refresh",
      lastTokenUsage: {
        input_tokens: 183209,
        cached_input_tokens: 182656,
        output_tokens: 475,
        reasoning_tokens: 103,
        total_tokens: 183684,
      },
    },
  };
  const liveSnapshot = {
    captured_at: "2026-05-11T16:21:40.112Z",
    thread_id: "thread-live-refresh",
    model_context_window: 258400,
    last_token_usage: {
      input_tokens: 119127,
      cached_input_tokens: 113536,
      output_tokens: 462,
      reasoning_tokens: 31,
      total_tokens: 119589,
    },
  };
  const sessionService = {
    async resolveCodexRuntimeProfile() {
      return {
        model: "gpt-5.5",
        reasoningEffort: "xhigh",
        modelContextWindow: 258400,
      };
    },
    async resolveContextSnapshot(currentSession) {
      return {
        session: currentSession,
        snapshot: liveSnapshot,
        source: "codex-sessions",
      };
    },
    async getCodexLimitsSummary() {
      return buildWindowedLimitsSummary({ unlimited: true });
    },
    async resolveSessionExecution() {
      return null;
    },
  };
  const workerPool = {
    getActiveRun() {
      return activeRun;
    },
  };

  const resolved = await resolveStatusView({
    state,
    message: {
      chat: { id: -1000000 },
      message_thread_id: 7,
    },
    session,
    sessionService,
    workerPool,
    language: "rus",
  });

  assert.match(textOf(resolved), /текущие native active tokens: 119589 \/ 258400/u);
  assert.match(textOf(resolved), /вход\/кэш\/выход: 119127 \/ 113536 \/ 462/u);
  assert.doesNotMatch(textOf(resolved), /183684/u);
  assert.deepEqual(activeRun.state.contextSnapshot.last_token_usage, liveSnapshot.last_token_usage);
});

test("resolveStatusView can refresh remote Codex token counts during an active run", async () => {
  const state = {
    codexModel: "gpt-5.5",
    codexReasoningEffort: "xhigh",
    codexContextWindow: 258400,
    codexAutoCompactTokenLimit: 248400,
    currentHostId: "local",
    hostSshConnectTimeoutSecs: 5,
  };
  const session = {
    session_key: "-1000000:8",
    topic_name: "Remote live status",
    lifecycle_state: "active",
    execution_host_id: "workera",
    last_run_status: "running",
    last_run_backend: "exec-json",
    codex_thread_id: "thread-remote-live",
    last_token_usage: {
      input_tokens: 183209,
      cached_input_tokens: 182656,
      output_tokens: 475,
      reasoning_tokens: 103,
      total_tokens: 183684,
    },
    workspace_binding: {
      repo_root: "/path/to/worker-workspace",
      cwd: "/path/to/worker-workspace",
      branch: "main",
      worktree_path: "/path/to/worker-workspace",
    },
  };
  const activeRun = {
    state: {
      status: "running",
      backend: "exec-json",
      threadId: "thread-remote-live",
      lastTokenUsage: session.last_token_usage,
    },
  };
  const remoteSnapshot = {
    captured_at: "2026-05-11T16:22:01.000Z",
    thread_id: "thread-remote-live",
    model_context_window: 258400,
    last_token_usage: {
      input_tokens: 129000,
      cached_input_tokens: 120000,
      output_tokens: 600,
      reasoning_tokens: 40,
      total_tokens: 129600,
    },
  };
  const sessionService = {
    async resolveCodexRuntimeProfile() {
      return {
        model: "gpt-5.5",
        reasoningEffort: "xhigh",
        modelContextWindow: 258400,
      };
    },
    async resolveContextSnapshot(currentSession) {
      return {
        session: currentSession,
        snapshot: {
          model_context_window: 258400,
          last_token_usage: currentSession.last_token_usage,
        },
        source: "session",
      };
    },
    async getCodexLimitsSummary() {
      return buildWindowedLimitsSummary({ unlimited: true });
    },
    async resolveSessionExecution() {
      return {
        ok: true,
        hostId: "workera",
        hostLabel: "workera",
        isLocal: false,
        host: {
          host_id: "workera",
          ssh_target: "workera",
        },
      };
    },
  };
  const workerPool = {
    getActiveRun() {
      return activeRun;
    },
  };
  const remoteCalls = [];

  const resolved = await resolveStatusView({
    fetchRemoteCodexContextSnapshotImpl: async (args) => {
      remoteCalls.push(args);
      return {
        snapshot: remoteSnapshot,
        source: "remote-codex-sessions",
      };
    },
    state,
    message: {
      chat: { id: -1000000 },
      message_thread_id: 8,
    },
    session,
    sessionService,
    workerPool,
    language: "rus",
  });

  assert.equal(remoteCalls.length, 1);
  assert.equal(remoteCalls[0].threadId, "thread-remote-live");
  assert.match(textOf(resolved), /host: workera/u);
  assert.match(textOf(resolved), /текущие native active tokens: 129600 \/ 258400/u);
  assert.doesNotMatch(textOf(resolved), /183684/u);
});

test("resolveStatusView shows a live refresh warning when remote token refresh fails", async () => {
  const state = {
    codexModel: "gpt-5.5",
    codexReasoningEffort: "xhigh",
    codexContextWindow: 258400,
    codexAutoCompactTokenLimit: 248400,
    currentHostId: "local",
    hostSshConnectTimeoutSecs: 5,
  };
  const session = {
    session_key: "-1000000:9",
    topic_name: "Remote refresh warning",
    lifecycle_state: "active",
    execution_host_id: "workera",
    last_run_status: "running",
    last_run_backend: "exec-json",
    codex_thread_id: "thread-remote-warning",
    last_token_usage: {
      input_tokens: 100,
      cached_input_tokens: 0,
      output_tokens: 10,
      reasoning_tokens: 0,
      total_tokens: 110,
    },
    workspace_binding: {
      repo_root: "/path/to/worker-workspace",
      cwd: "/path/to/worker-workspace",
      branch: "main",
      worktree_path: "/path/to/worker-workspace",
    },
  };
  const sessionService = {
    async resolveCodexRuntimeProfile() {
      return {
        model: "gpt-5.5",
        reasoningEffort: "xhigh",
        modelContextWindow: 258400,
      };
    },
    async resolveContextSnapshot(currentSession) {
      return {
        session: currentSession,
        snapshot: {
          model_context_window: 258400,
          last_token_usage: currentSession.last_token_usage,
        },
        source: "session",
      };
    },
    async getCodexLimitsSummary() {
      return buildWindowedLimitsSummary({ unlimited: true });
    },
    async resolveSessionExecution() {
      return {
        ok: true,
        hostId: "workera",
        hostLabel: "workera",
        isLocal: false,
        host: {
          host_id: "workera",
          ssh_target: "workera",
        },
      };
    },
  };
  const workerPool = {
    getActiveRun() {
      return {
        state: {
          status: "running",
          backend: "exec-json",
          threadId: "thread-remote-warning",
          lastTokenUsage: session.last_token_usage,
        },
      };
    },
  };

  const resolved = await resolveStatusView({
    fetchRemoteCodexContextSnapshotImpl: async () => {
      throw new Error("ssh timeout");
    },
    state,
    message: {
      chat: { id: -1000000 },
      message_thread_id: 9,
    },
    session,
    sessionService,
    workerPool,
    language: "rus",
  });

  assert.match(textOf(resolved), /live status refresh: remote token tail недоступен/u);
  assert.match(textOf(resolved), /текущие native active tokens: 110 \/ 258400/u);
});

function textOf(statusView) {
  return statusView.text;
}
