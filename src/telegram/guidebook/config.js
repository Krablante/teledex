import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeUiLanguage } from "../../i18n/ui-language.js";

const GUIDEBOOK_SOURCES = {
  rus: fileURLToPath(new URL("../../../docs/guidebook-rus.md", import.meta.url)),
  eng: fileURLToPath(new URL("../../../docs/guidebook-eng.md", import.meta.url)),
};

const RUNBOOK_SOURCES = {
  rus: fileURLToPath(new URL("../../../docs/runbook-rus.md", import.meta.url)),
  eng: fileURLToPath(new URL("../../../docs/runbook.md", import.meta.url)),
};

export const GUIDEBOOK_RASTERIZE_SCRIPT = fileURLToPath(
  new URL("../../../scripts/rasterize-pdf.py", import.meta.url),
);

const GUIDEBOOK_FILE_NAMES = {
  rus: "teledex-guidebook-rus.pdf",
  eng: "teledex-guidebook-eng.pdf",
};

const RUNBOOK_FILE_NAMES = {
  rus: "teledex-runbook-rus.pdf",
  eng: "teledex-runbook-eng.pdf",
};

export const PAGE = {
  size: "A4",
  margins: {
    top: 44,
    bottom: 48,
    left: 46,
    right: 46,
  },
};

export function getNormalizedLanguage(language) {
  return normalizeUiLanguage(language) === "eng" ? "eng" : "rus";
}

export function getGuidebookSourcePath(language) {
  return GUIDEBOOK_SOURCES[getNormalizedLanguage(language)] || GUIDEBOOK_SOURCES.rus;
}

export function getGuidebookFileName(language) {
  return GUIDEBOOK_FILE_NAMES[getNormalizedLanguage(language)] || GUIDEBOOK_FILE_NAMES.rus;
}

export function getRunbookSourcePath(language) {
  return RUNBOOK_SOURCES[getNormalizedLanguage(language)] || RUNBOOK_SOURCES.rus;
}

export function getRunbookFileName(language) {
  return RUNBOOK_FILE_NAMES[getNormalizedLanguage(language)] || RUNBOOK_FILE_NAMES.rus;
}

export function resolveGuidebookOutputPath(language, stateRoot = null) {
  const outputRoot = stateRoot
    ? path.join(stateRoot, "tmp", "guidebook")
    : path.join(os.tmpdir(), "teledex-guidebook");
  return path.join(outputRoot, getGuidebookFileName(language));
}

export function resolveRunbookOutputPath(language, stateRoot = null) {
  const outputRoot = stateRoot
    ? path.join(stateRoot, "tmp", "runbook")
    : path.join(os.tmpdir(), "teledex-runbook");
  return path.join(outputRoot, getRunbookFileName(language));
}
