import {
  DEFAULT_DEEPSEEK_MODEL,
  DEFAULT_DEEPSEEK_REASONING_EFFORT,
  DEEPSEEK_REASONING_EFFORTS,
  DEEPSEEK_MODELS,
  formatDeepSeekReasoningEffort,
  normalizeDeepSeekReasoningEffort,
  normalizeDeepSeekModel,
} from "../../../session-manager/codex-runtime-profiles.js";
import { isEnglish } from "./common.js";
import {
  buildCodexSettingListMessage,
  buildCodexSettingStateMessage,
  buildCodexSettingUsageMessage,
  buildInvalidCodexSettingMessage,
  formatCodexModelListEntry,
} from "./formatters.js";

function buildDeepSeekReasoningUsageMessage() {
  return [
    "Usage: /reasoning",
    "/reasoning list",
    "/reasoning high",
    "/reasoning xhigh",
    "/reasoning clear",
  ].join("\n");
}

function buildDeepSeekReasoningStateMessage({
  title,
  language,
  topicValue = null,
  effectiveValue = null,
  updated = false,
}) {
  return isEnglish(language)
    ? [
        updated ? `${title} updated.` : title,
        "",
        `topic override: ${formatDeepSeekReasoningEffort(topicValue) || "default"}`,
        `effective: ${
          formatDeepSeekReasoningEffort(effectiveValue || DEFAULT_DEEPSEEK_REASONING_EFFORT)
        }`,
        "",
        buildDeepSeekReasoningUsageMessage(),
      ].join("\n")
    : [
        updated ? `${title} обновлён.` : title,
        "",
        `topic override: ${formatDeepSeekReasoningEffort(topicValue) || "по умолчанию"}`,
        `effective: ${
          formatDeepSeekReasoningEffort(effectiveValue || DEFAULT_DEEPSEEK_REASONING_EFFORT)
        }`,
        "",
        buildDeepSeekReasoningUsageMessage(),
      ].join("\n");
}

function buildDeepSeekReasoningListMessage({ title }) {
  return [
    title,
    "",
    ...DEEPSEEK_REASONING_EFFORTS.map((entry) => `${entry.label} (${entry.value})`),
    "",
    buildDeepSeekReasoningUsageMessage(),
  ].join("\n");
}

function buildInvalidDeepSeekReasoningMessage({
  title,
  invalidValue,
  language,
}) {
  return [
    isEnglish(language)
      ? `${title}: unknown reasoning "${invalidValue}".`
      : `${title}: неизвестное значение "${invalidValue}".`,
    "",
    ...DEEPSEEK_REASONING_EFFORTS.map((entry) => `${entry.label} (${entry.value})`),
    "",
    buildDeepSeekReasoningUsageMessage(),
  ].join("\n");
}

async function handleDeepSeekModelCommand({
  parsedCommand,
  session,
  sessionService,
  language,
}) {
  const title = "DeepSeek model";
  const entries = DEEPSEEK_MODELS.map(formatCodexModelListEntry);
  const currentModel = normalizeDeepSeekModel(session?.session_runtime_model)
    || DEFAULT_DEEPSEEK_MODEL;

  if (parsedCommand.scope === "global") {
    return {
      handledSession: session,
      responseText: isEnglish(language)
        ? "DeepSeek model is topic-local. Use /model list or /model flash|pro inside a DeepSeek topic."
        : "DeepSeek model задаётся на уровне topic. Используй /model list или /model flash|pro внутри DeepSeek topic.",
    };
  }

  if (parsedCommand.action === "list") {
    return {
      handledSession: session,
      responseText: buildCodexSettingListMessage({
        title,
        commandName: "model",
        entries,
        language,
      }),
    };
  }

  if (parsedCommand.action === "show") {
    return {
      handledSession: session,
      responseText: buildCodexSettingStateMessage({
        title,
        commandName: "model",
        kind: "model",
        language,
        topicValue: session?.session_runtime_model ?? null,
        globalValue: null,
        effectiveValue: currentModel,
        effectiveSource: session?.session_runtime_model ? "topic" : "default",
        showTopicValue: true,
      }),
    };
  }

  if (parsedCommand.action === "clear") {
    const handledSession = await sessionService.clearSessionDeepSeekModel(session);
    return {
      handledSession,
      responseText: buildCodexSettingStateMessage({
        title: isEnglish(language)
          ? `${title} cleared.`
          : `${title} очищен.`,
        commandName: "model",
        kind: "model",
        language,
        topicValue: null,
        globalValue: null,
        effectiveValue: DEFAULT_DEEPSEEK_MODEL,
        effectiveSource: "default",
        showTopicValue: true,
      }),
    };
  }

  if (parsedCommand.action === "set") {
    const normalizedValue = normalizeDeepSeekModel(parsedCommand.value);
    if (!normalizedValue) {
      return {
        handledSession: session,
        responseText: buildInvalidCodexSettingMessage({
          title,
          commandName: "model",
          kind: "model",
          invalidValue: parsedCommand.value,
          entries,
          language,
        }),
      };
    }

    const handledSession =
      await sessionService.updateSessionDeepSeekModel(session, normalizedValue);
    return {
      handledSession,
      responseText: buildCodexSettingStateMessage({
        title: isEnglish(language)
          ? `${title} updated.`
          : `${title} обновлён.`,
        commandName: "model",
        kind: "model",
        language,
        topicValue: handledSession.session_runtime_model ?? null,
        globalValue: null,
        effectiveValue: normalizedValue,
        effectiveSource: "topic",
        showTopicValue: true,
      }),
    };
  }

  return {
    handledSession: session,
    responseText: buildCodexSettingUsageMessage("model", language),
  };
}

async function handleDeepSeekReasoningCommand({
  parsedCommand,
  session,
  sessionService,
  language,
}) {
  const title = "DeepSeek reasoning";
  const currentTopicValue = normalizeDeepSeekReasoningEffort(
    session?.agent_reasoning_effort_override,
  );
  const currentEffectiveValue = currentTopicValue || DEFAULT_DEEPSEEK_REASONING_EFFORT;

  if (parsedCommand.scope === "global") {
    return {
      handledSession: session,
      responseText: isEnglish(language)
        ? "DeepSeek reasoning is topic-local. Use /reasoning list or /reasoning high|xhigh inside a DeepSeek topic."
        : "DeepSeek reasoning задаётся на уровне topic. Используй /reasoning list или /reasoning high|xhigh внутри DeepSeek topic.",
    };
  }

  if (parsedCommand.action === "list") {
    return {
      handledSession: session,
      responseText: buildDeepSeekReasoningListMessage({ title }),
    };
  }

  if (parsedCommand.action === "show") {
    return {
      handledSession: session,
      responseText: buildDeepSeekReasoningStateMessage({
        title,
        language,
        topicValue: currentTopicValue,
        effectiveValue: currentEffectiveValue,
      }),
    };
  }

  if (parsedCommand.action === "clear") {
    const handledSession = await sessionService.clearSessionCodexSetting(
      session,
      "agent",
      "reasoning",
    );
    return {
      handledSession,
      responseText: buildDeepSeekReasoningStateMessage({
        title: isEnglish(language)
          ? `${title} cleared.`
          : `${title} очищен.`,
        language,
        topicValue: null,
        effectiveValue: DEFAULT_DEEPSEEK_REASONING_EFFORT,
      }),
    };
  }

  if (parsedCommand.action === "set") {
    const normalizedValue = normalizeDeepSeekReasoningEffort(parsedCommand.value);
    if (!normalizedValue) {
      return {
        handledSession: session,
        responseText: buildInvalidDeepSeekReasoningMessage({
          title,
          invalidValue: parsedCommand.value,
          language,
        }),
      };
    }

    const handledSession = await sessionService.updateSessionCodexSetting(
      session,
      "agent",
      "reasoning",
      normalizedValue,
    );
    return {
      handledSession,
      responseText: buildDeepSeekReasoningStateMessage({
        title,
        language,
        topicValue: normalizedValue,
        effectiveValue: normalizedValue,
        updated: true,
      }),
    };
  }

  return {
    handledSession: session,
    responseText: buildDeepSeekReasoningUsageMessage(),
  };
}

export async function handleDeepSeekRuntimeSettingCommand(args) {
  return args.spec.kind === "reasoning"
    ? handleDeepSeekReasoningCommand(args)
    : handleDeepSeekModelCommand(args);
}
