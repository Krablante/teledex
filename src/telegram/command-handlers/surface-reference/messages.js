import { DEFAULT_UI_LANGUAGE } from "../../../i18n/ui-language.js";
import { isEnglish } from "../surface-command-common.js";

export function buildHelpTextMessage(language = DEFAULT_UI_LANGUAGE) {
  if (isEnglish(language)) {
    return [
      "Teledex quick help",
      "",
      "/help - this cheat sheet",
      "/guide - beginner PDF guidebook from General",
      "/clear - clear General and keep only the active menu",
      "/new [host=...] [provider=...] [model=...] [profile=...] [cwd=...|path=...] [title] - create a new work topic",
      "/hosts - show available execution hosts",
      "/host [id] - show one execution host status",
      "/zoo - open the dedicated Project Catalog topic",
      "/status - session, model, and context status",
      "/limits - current Codex rate-limit windows",
      "/global - pin-friendly global settings menu in General",
      "/menu - pin-friendly local settings menu in this topic",
      "/language - show or change the UI language",
      "/q <text> | /кю <text> - add a prompt to the Agent queue",
      "/q status | /кю status | /q delete <n> | /кю delete <n> - inspect or remove queued prompts",
      "/wait 60 - local one-shot collection window",
      "/wait global 60 - persistent global collection window",
      "`All`, `Все`, or `Всё` - flush the collected prompt immediately",
      "/wait off - cancel the local one-shot window",
      "/wait global off - disable the global window",
      "/interrupt - stop the run",
      "/diff - diff for the current workspace",
      "/goal - show or change the app-server-v2 goal",
      "/compact - rebuild the brief from the exchange log",
      "/purge - clear local session state",
      "/suffix <text> - topic prompt suffix",
      "/suffix global <text> - global prompt suffix",
      "/suffix topic on|off - routing suffixes for this topic",
      "/suffix help - separate suffix cheat sheet",
      "/model [list|clear|<slug>] - Agent model for this topic",
      "/model global [list|clear|<slug>] - global Agent model default",
      "/reasoning [list|clear|<level>] - Agent reasoning for this topic",
      "/reasoning global [list|clear|<level>] - global Agent reasoning default",
    ].join("\n");
  }

  return [
    "Teledex quick help",
    "",
    "/help - эта шпаргалка",
    "/guide - PDF-гайдбук для новичка из General",
    "/clear - очистить General и оставить только active menu",
    "/new [host=...] [provider=...] [model=...] [profile=...] [cwd=...|path=...] [title] - новая рабочая тема",
    "/hosts - показать доступные execution hosts",
    "/host [id] - показать статус одного execution host",
    "/zoo - открыть отдельный Project Catalog topic",
    "/status - статус сессии, модели и контекста",
    "/limits - текущие окна лимитов Codex",
    "/global - pin-friendly Global settings menu в General",
    "/menu - pin-friendly menu локальных настроек в этом топике",
    "/language - показать или сменить язык интерфейса",
    "/q <текст> | /кю <текст> - поставить prompt в очередь Agent",
    "/q status | /кю status | /q delete <n> | /кю delete <n> - посмотреть или удалить queued prompts",
    "/wait 60 - local one-shot collection window",
    "/wait global 60 - persistent global collection window",
    "`Все`, `Всё` или `All` - сразу отправить накопленное",
    "/wait off - выключить local one-shot window",
    "/wait global off - выключить global collection window",
    "/interrupt - остановить active run",
    "/diff - diff текущего workspace",
    "/goal - показать или сменить app-server-v2 goal",
    "/compact - пересобрать brief из exchange log",
    "/purge - очистить local session state",
    "/suffix <text> - topic prompt suffix",
    "/suffix global <text> - global prompt suffix",
    "/suffix topic on|off - topic prompt suffix routing",
    "/suffix help - отдельная шпаргалка по prompt suffix",
    "/model [list|clear|<slug>] - Agent model для этого топика",
    "/model global [list|clear|<slug>] - global default для Agent model",
    "/reasoning [list|clear|<level>] - Agent reasoning для этого топика",
    "/reasoning global [list|clear|<level>] - global default для Agent reasoning",
  ].join("\n");
}

export function buildHelpCardPartialFailureMessage(language = DEFAULT_UI_LANGUAGE) {
  if (isEnglish(language)) {
    return [
      "I sent part of the help card, but a later page failed.",
      "",
      "Run /help again if you still need the missing page.",
    ].join("\n");
  }

  return [
    "Часть help-card отправил, но следующая страница не доехала.",
    "",
    "Если нужна недостающая часть, просто повтори /help.",
  ].join("\n");
}

export function buildGuideGeneralOnlyMessage(language = DEFAULT_UI_LANGUAGE) {
  if (isEnglish(language)) {
    return [
      "/guide works in General only.",
      "",
      "Run it there to receive the beginner PDF guidebook.",
    ].join("\n");
  }

  return [
    "/guide работает только в General.",
    "",
    "Запусти его там, чтобы получить PDF-гайдбук для новичка.",
  ].join("\n");
}

export function buildGuideGenerationFailureMessage(
  language = DEFAULT_UI_LANGUAGE,
  error = null,
) {
  const detail = error?.message
    ? `\n\n${isEnglish(language) ? "Error" : "Ошибка"}: ${error.message}`
    : "";
  return isEnglish(language)
    ? `Could not generate the guidebook right now.${detail}`
    : `Сейчас не смог собрать guidebook.${detail}`;
}

export function buildGuideDeliveryFailureMessage(
  language = DEFAULT_UI_LANGUAGE,
  delivery = null,
) {
  const reason = String(delivery?.reason || "").trim();
  const detail = reason
    ? `\n\n${isEnglish(language) ? "Reason" : "Причина"}: ${reason}`
    : "";
  return isEnglish(language)
    ? `Could not deliver the guidebook right now.${detail}`
    : `Сейчас не смог доставить guidebook.${detail}`;
}
