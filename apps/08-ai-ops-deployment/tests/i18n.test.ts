import test from "node:test";
import assert from "node:assert/strict";
import { LOCALES, isValidLocale } from "../lib/i18n/locales";
import { getDictionary } from "../lib/i18n/dictionaries";

test("Locales definition covers EN, PT, and DE", () => {
  assert.equal(LOCALES.length, 3);
  assert.ok(LOCALES.includes("en"));
  assert.ok(LOCALES.includes("pt"));
  assert.ok(LOCALES.includes("de"));

  assert.equal(isValidLocale("en"), true);
  assert.equal(isValidLocale("pt"), true);
  assert.equal(isValidLocale("de"), true);
  assert.equal(isValidLocale("fr"), false);
  assert.equal(isValidLocale(null), false);
});

test("Dictionaries contain complete 12 quick scenarios in all 3 languages", () => {
  const scenarioIds = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  for (const locale of LOCALES) {
    const dict = getDictionary(locale);
    assert.ok(dict, `Dictionary for locale ${locale} must exist`);
    assert.ok(dict.common.appTitle.length > 0);
    assert.ok(dict.dashboard.p95Latency.length > 0);

    for (const id of scenarioIds) {
      const scenario = dict.scenarios.items[id];
      assert.ok(scenario, `Scenario #${id} must exist in ${locale} dictionary`);
      assert.ok(scenario.title.length > 0, `Scenario #${id} title missing in ${locale}`);
      assert.ok(scenario.description.length > 0, `Scenario #${id} description missing in ${locale}`);
      assert.ok(scenario.focus.length > 0, `Scenario #${id} focus missing in ${locale}`);
    }
  }
});
