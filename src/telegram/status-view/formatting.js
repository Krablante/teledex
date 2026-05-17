import {
  DEFAULT_UI_LANGUAGE,
  formatUiLanguageLabel,
  normalizeUiLanguage,
} from "../../i18n/ui-language.js";
import {
  formatReasoningEffort,
} from "../../session-manager/codex-runtime-settings.js";

export function isEnglish(language = DEFAULT_UI_LANGUAGE) {
  return normalizeUiLanguage(language) === "eng";
}

export function getLanguageLabel(language = DEFAULT_UI_LANGUAGE) {
  return formatUiLanguageLabel(language);
}

export function formatNumber(value, language = DEFAULT_UI_LANGUAGE) {
  return Number.isInteger(value)
    ? String(value)
    : (isEnglish(language) ? "unknown" : "неизвестно");
}

export function formatPercent(value, language = DEFAULT_UI_LANGUAGE) {
  return Number.isFinite(value)
    ? `${value.toFixed(1)}%`
    : (isEnglish(language) ? "unknown" : "неизвестно");
}

export function formatCodexSettingValue(
  kind,
  value,
  language = DEFAULT_UI_LANGUAGE,
) {
  if (!value) {
    return isEnglish(language) ? "default" : "по умолчанию";
  }

  if (kind === "reasoning") {
    return formatReasoningEffort(value) ?? value;
  }

  return value;
}
