import {
  DEFAULT_UI_LANGUAGE,
} from "../../i18n/ui-language.js";
import {
  SESSION_PROVIDER_DEEPSEEK,
} from "../../session-manager/codex-runtime-profiles.js";
import {
  buildLegacyContextSnapshot,
  normalizeContextSnapshot,
} from "../../session-manager/context-snapshot.js";
import {
  computeNonCachedInputOutputTokenTotal,
} from "../../codex-runtime/token-usage.js";
import {
  formatNumber,
  formatPercent,
  isEnglish,
} from "./formatting.js";

function formatDeepSeekCacheHitPercent(usage, language = DEFAULT_UI_LANGUAGE) {
  if (!Number.isInteger(usage?.input_tokens) || usage.input_tokens <= 0) {
    return isEnglish(language) ? "unknown" : "неизвестно";
  }
  if (!Number.isInteger(usage.cached_input_tokens)) {
    return isEnglish(language) ? "unknown" : "неизвестно";
  }

  return formatPercent((usage.cached_input_tokens / usage.input_tokens) * 100, language);
}

function buildUsageWarningLine(language = DEFAULT_UI_LANGUAGE) {
  return isEnglish(language)
    ? "usage warning: stored token usage looks cumulative/stale; ignored for context pressure"
    : "usage warning: сохранённый token usage похож на cumulative/stale; для context pressure игнорируется";
}

function buildUnknownAfterIgnoredUsageLine(language = DEFAULT_UI_LANGUAGE) {
  return isEnglish(language)
    ? "context usage: unknown after ignoring stale token usage"
    : "использование контекста: неизвестно после игнорирования stale token usage";
}

function looksLikeStaleCumulativeUsage(usage, contextWindow = null) {
  const totalTokens = usage?.total_tokens;
  if (!Number.isInteger(totalTokens)) {
    return false;
  }

  if (Number.isInteger(contextWindow) && contextWindow > 0) {
    return totalTokens > contextWindow * 2;
  }

  return totalTokens > 1_500_000;
}

export function mergeActiveRunContextSnapshot(
  snapshot,
  activeRun = null,
  {
    preferActiveUsage = true,
  } = {},
) {
  const activeSnapshot = normalizeContextSnapshot(
    activeRun?.state?.contextSnapshot,
  );
  const activeUsageSnapshot = preferActiveUsage
    ? normalizeContextSnapshot({
        last_token_usage: activeRun?.state?.lastTokenUsage,
      })
    : null;
  if (!activeSnapshot && !activeUsageSnapshot) {
    return snapshot;
  }

  return normalizeContextSnapshot({
    ...(snapshot ?? {}),
    ...(activeSnapshot ?? {}),
    last_token_usage:
      activeUsageSnapshot?.last_token_usage
      ?? activeSnapshot?.last_token_usage
      ?? snapshot?.last_token_usage
      ?? null,
  });
}

function computeDeepSeekFreshInputTokens(usage) {
  if (!Number.isInteger(usage?.input_tokens)) {
    return null;
  }
  if (!Number.isInteger(usage.cached_input_tokens)) {
    return usage.input_tokens;
  }

  return Math.max(usage.input_tokens - usage.cached_input_tokens, 0);
}

function buildDeepSeekUsageStatusLines({
  contextWindow,
  language = DEFAULT_UI_LANGUAGE,
  runIsActive = false,
  usage = null,
}) {
  const english = isEnglish(language);
  const unknown = english ? "unknown" : "неизвестно";
  const tokenLabel = runIsActive
    ? (english ? "last completed DeepSeek turn API tokens" : "последний завершённый DeepSeek turn API tokens")
    : (english ? "DeepSeek turn API tokens" : "DeepSeek turn API tokens");
  const lines = [
    english
      ? "usage source: DeepSeek runtime turn.usage (aggregate API-call usage, not context pressure)"
      : "источник usage: DeepSeek runtime turn.usage (суммарно по API-вызовам turn, не context pressure)",
    english
      ? "tool catalog: discovery-only, tool schemas load on demand"
      : "tool catalog: discovery-only, схемы tools подгружаются по запросу",
    ...(runIsActive
      ? [
        english
          ? "current DeepSeek turn usage: unknown until turn completes"
          : "текущий DeepSeek turn usage: неизвестно до завершения turn",
      ]
      : []),
    english
      ? "context pressure: unknown (runtime does not expose max tokens for the latest single request)"
      : "context pressure: неизвестно (runtime не отдаёт max tokens последнего отдельного запроса)",
  ];

  if (!usage) {
    lines.push(
      `${tokenLabel}: ${unknown}`,
      `${english ? "fresh uncached turn tokens" : "свежие uncached turn tokens"}: ${unknown}`,
      `${english ? "available context tokens" : "доступно context tokens"}: ${unknown}`,
    );
    return lines;
  }

  const freshInputTokens = computeDeepSeekFreshInputTokens(usage);
  const freshTurnTokens = computeNonCachedInputOutputTokenTotal(usage);
  const freshPercent =
    Number.isInteger(contextWindow) &&
    contextWindow > 0 &&
    Number.isInteger(freshTurnTokens)
      ? (freshTurnTokens / contextWindow) * 100
      : null;

  lines.push(
    `${tokenLabel}: ${formatNumber(usage.total_tokens, language)}`,
    `${english ? "fresh uncached turn tokens" : "свежие uncached turn tokens"}: ${formatNumber(freshTurnTokens, language)} / ${formatNumber(contextWindow, language)} (${formatPercent(freshPercent, language)})`,
    `${english ? "input/cache-hit/fresh/output" : "вход/кэш/fresh/выход"}: ${formatNumber(usage.input_tokens, language)} / ${formatNumber(usage.cached_input_tokens, language)} / ${formatNumber(freshInputTokens, language)} / ${formatNumber(usage.output_tokens, language)}`,
    `${english ? "cache hit" : "cache hit"}: ${formatDeepSeekCacheHitPercent(usage, language)}`,
    `${english ? "available context tokens" : "доступно context tokens"}: ${unknown}`,
  );

  if (Number.isInteger(usage.reasoning_tokens)) {
    lines.push(
      `${english ? "reasoning tokens" : "reasoning tokens"}: ${formatNumber(usage.reasoning_tokens, language)}`,
    );
  }

  return lines;
}

export function buildEffectiveContextSnapshot(
  state,
  session,
  activeRun,
  explicitSnapshot = null,
) {
  return (
    normalizeContextSnapshot(
      explicitSnapshot ??
        activeRun?.state?.contextSnapshot ??
        session.last_context_snapshot,
    ) ??
    buildLegacyContextSnapshot({
      usage: activeRun?.state?.lastTokenUsage ?? session.last_token_usage,
      contextWindow: state.codexContextWindow ?? null,
    })
  );
}

export function buildContextStatusLines(
  contextSnapshot,
  language = DEFAULT_UI_LANGUAGE,
  {
    configuredContextWindow = null,
    runtimeProvider = "codex",
    runStatus = "idle",
  } = {},
) {
  const usage = contextSnapshot?.last_token_usage ?? null;
  const postCompactUsage =
    contextSnapshot?.last_post_compact_token_usage ?? null;
  const contextWindow = contextSnapshot?.model_context_window ?? null;
  const english = isEnglish(language);
  const isDeepSeekRuntime = runtimeProvider === SESSION_PROVIDER_DEEPSEEK;
  const runIsActive = ["running", "starting", "interrupting"].includes(
    String(runStatus || "").trim().toLowerCase(),
  );
  const lines = [];
  const unknown = english ? "unknown" : "неизвестно";
  const postCompactTokens = postCompactUsage?.total_tokens ?? null;
  const postCompactLine =
    `${english ? "last post-compact tokens" : "токены после последнего compact"}: ${formatNumber(postCompactTokens, language)}`;
  if (isDeepSeekRuntime) {
    return [
      ...lines,
      ...buildDeepSeekUsageStatusLines({
        contextWindow,
        language,
        runIsActive,
        usage,
      }),
    ];
  }

  const usageSourceLine = english
    ? "usage source: native Codex token_count.last_token_usage"
    : "источник usage: native Codex token_count.last_token_usage";
  const activeTokensLabel = english ? "current native active tokens" : "текущие native active tokens";
  const noUsageText = english
    ? "context usage: no completed turn yet"
    : "использование контекста: ещё нет завершённого turn";

  if (
    Number.isInteger(configuredContextWindow) &&
    Number.isInteger(contextWindow) &&
    configuredContextWindow !== contextWindow
  ) {
    lines.push(
      `${english ? "effective context window" : "effective context window"}: ${formatNumber(contextWindow, language)}`,
    );
  }

  if (!usage) {
    return [
      ...lines,
      usageSourceLine,
      noUsageText,
      `${activeTokensLabel}: ${unknown} / ${formatNumber(contextWindow, language)}`,
      postCompactLine,
      `${english ? "available tokens" : "доступно токенов"}: ${unknown}`,
    ];
  }

  if (looksLikeStaleCumulativeUsage(usage, contextWindow)) {
    return [
      ...lines,
      usageSourceLine,
      buildUsageWarningLine(language),
      buildUnknownAfterIgnoredUsageLine(language),
      `${activeTokensLabel}: ${unknown} / ${formatNumber(contextWindow, language)}`,
      postCompactLine,
      `${english ? "available tokens" : "доступно токенов"}: ${unknown}`,
    ];
  }

  const totalTokens = usage.total_tokens;
  const availableTokens =
    contextWindow !== null && totalTokens !== null
      ? Math.max(contextWindow - totalTokens, 0)
      : null;
  const usagePercent =
    contextWindow !== null &&
    contextWindow > 0 &&
    totalTokens !== null
      ? (totalTokens / contextWindow) * 100
      : null;

  lines.push(
    usageSourceLine,
    `${english ? "context usage" : "использование контекста"}: ${formatPercent(usagePercent, language)}`,
    `${activeTokensLabel}: ${formatNumber(totalTokens, language)} / ${formatNumber(contextWindow, language)}`,
    postCompactLine,
    `${english ? "available tokens" : "доступно токенов"}: ${formatNumber(availableTokens, language)}`,
    `${english ? "input/cached/output" : "вход/кэш/выход"}: ${formatNumber(usage.input_tokens, language)} / ${formatNumber(usage.cached_input_tokens, language)} / ${formatNumber(usage.output_tokens, language)}`,
  );

  if (Number.isInteger(usage.reasoning_tokens)) {
    lines.push(
      `${english ? "reasoning tokens" : "reasoning tokens"}: ${formatNumber(usage.reasoning_tokens, language)}`,
    );
  }

  return lines;
}
