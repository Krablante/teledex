import test from "node:test";
import assert from "node:assert/strict";

import {
  CREATURE_PROFILES,
  TEMPERAMENT_PROFILES,
  TEMPERAMENT_PROFILE_BY_ID,
  ZOO_CREATURE_KINDS,
  ZOO_TEMPERAMENT_IDS,
} from "../src/zoo/creature-catalog.js";

const SUPPORTED_LANGUAGES = ["eng", "rus"];

test("Project Catalog creature catalog has complete profiles for every public kind", () => {
  assert.ok(ZOO_CREATURE_KINDS.length > 0);

  for (const kind of ZOO_CREATURE_KINDS) {
    const profile = CREATURE_PROFILES[kind];
    assert.ok(profile, `missing profile for ${kind}`);

    for (const language of SUPPORTED_LANGUAGES) {
      assert.equal(typeof profile.labels?.[language], "string", `${kind} label ${language}`);
      assert.ok(profile.labels[language].trim(), `${kind} label ${language}`);
      assert.equal(typeof profile.persona?.[language], "string", `${kind} persona ${language}`);
      assert.ok(profile.persona[language].trim(), `${kind} persona ${language}`);
      assert.ok(
        Array.isArray(profile.refreshStatus?.[language])
          && profile.refreshStatus[language].every((value) => String(value).trim()),
        `${kind} refresh status ${language}`,
      );
    }

    assert.ok(
      Array.isArray(profile.idlePoses)
        && profile.idlePoses.every((pose) =>
          Array.isArray(pose) && pose.every((line) => typeof line === "string")),
      `${kind} idle poses`,
    );
    assert.ok(
      Array.isArray(profile.refreshPoses)
        && profile.refreshPoses.every((pose) =>
          Array.isArray(pose) && pose.every((line) => typeof line === "string")),
      `${kind} refresh poses`,
    );
  }
});

test("Project Catalog temperament catalog exports consistent ids and localized prompts", () => {
  assert.ok(TEMPERAMENT_PROFILES.length > 0);
  assert.deepEqual(
    ZOO_TEMPERAMENT_IDS,
    TEMPERAMENT_PROFILES.map((profile) => profile.id),
  );
  assert.equal(new Set(ZOO_TEMPERAMENT_IDS).size, ZOO_TEMPERAMENT_IDS.length);

  for (const profile of TEMPERAMENT_PROFILES) {
    assert.equal(TEMPERAMENT_PROFILE_BY_ID.get(profile.id), profile);
    for (const language of SUPPORTED_LANGUAGES) {
      assert.equal(typeof profile.labels?.[language], "string", `${profile.id} label ${language}`);
      assert.ok(profile.labels[language].trim(), `${profile.id} label ${language}`);
      assert.equal(typeof profile.prompt?.[language], "string", `${profile.id} prompt ${language}`);
      assert.ok(profile.prompt[language].trim(), `${profile.id} prompt ${language}`);
      assert.ok(
        Array.isArray(profile.refreshLead?.[language])
          && profile.refreshLead[language].every((value) => String(value).trim()),
        `${profile.id} refresh lead ${language}`,
      );
    }
  }
});
