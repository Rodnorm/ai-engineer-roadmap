import test from "node:test";
import assert from "node:assert/strict";

// Import modules
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  LOCALE_HTML_LANG,
  isValidLocale,
  getLocalizedPath,
} from "../lib/i18n/locales.ts";

import { getDictionary } from "../lib/i18n/index.ts";
import { getAppCatalog, getCaseStudyContent, resolveAppUrl } from "../lib/catalog.ts";

test("supported locales definition", () => {
  assert.deepEqual([...LOCALES], ["en", "pt", "de"]);
  assert.equal(DEFAULT_LOCALE, "en");
  assert.equal(LOCALE_HTML_LANG.en, "en");
  assert.equal(LOCALE_HTML_LANG.pt, "pt-BR");
  assert.equal(LOCALE_HTML_LANG.de, "de");
});

test("isValidLocale validates supported locales and rejects invalid ones", () => {
  assert.equal(isValidLocale("en"), true);
  assert.equal(isValidLocale("pt"), true);
  assert.equal(isValidLocale("de"), true);
  assert.equal(isValidLocale("fr"), false);
  assert.equal(isValidLocale(""), false);
  assert.equal(isValidLocale(null), false);
  assert.equal(isValidLocale(undefined), false);
});

test("getLocalizedPath resolves correct paths across all locales", () => {
  // English (default root)
  assert.equal(getLocalizedPath("/", "en"), "/");
  assert.equal(getLocalizedPath("/apps", "en"), "/apps");
  assert.equal(getLocalizedPath("/pt/apps", "en"), "/apps");
  assert.equal(getLocalizedPath("/de/roadmap", "en"), "/roadmap");

  // Portuguese
  assert.equal(getLocalizedPath("/", "pt"), "/pt");
  assert.equal(getLocalizedPath("/apps", "pt"), "/pt/apps");
  assert.equal(getLocalizedPath("/de/apps", "pt"), "/pt/apps");
  assert.equal(getLocalizedPath("/about", "pt"), "/pt/about");

  // German
  assert.equal(getLocalizedPath("/", "de"), "/de");
  assert.equal(getLocalizedPath("/apps", "de"), "/de/apps");
  assert.equal(getLocalizedPath("/pt/apps", "de"), "/de/apps");
  assert.equal(getLocalizedPath("/roadmap", "de"), "/de/roadmap");
});

test("getDictionary returns correct translations and falls back to default English", () => {
  const enDict = getDictionary("en");
  const ptDict = getDictionary("pt");
  const deDict = getDictionary("de");
  const fallbackDict = getDictionary("invalid-locale");

  assert.equal(enDict.nav.catalog, "Catalog");
  assert.equal(ptDict.nav.catalog, "Catálogo");
  assert.equal(deDict.nav.catalog, "Katalog");

  // Fallback to English
  assert.equal(fallbackDict.nav.catalog, "Catalog");
  assert.equal(fallbackDict.home.heroTitleHighlight, "AI Engineer");
});

test("catalog localization applies localized descriptions per locale", () => {
  const enApps = getAppCatalog("en");
  const ptApps = getAppCatalog("pt");
  const deApps = getAppCatalog("de");

  assert.equal(enApps.length, 6);
  assert.equal(ptApps.length, 6);
  assert.equal(deApps.length, 6);

  // Check category and summary localization
  const enApp1 = enApps.find((a) => a.id === "01");
  const ptApp1 = ptApps.find((a) => a.id === "01");
  const deApp1 = deApps.find((a) => a.id === "01");

  assert.equal(enApp1?.category, "Vision & Multi-modal");
  assert.equal(ptApp1?.category, "Visão Computacional & Multimodal");
  assert.equal(deApp1?.category, "Computer Vision & Multimodal");
});

test("getCaseStudyContent returns localized markdown and handles fallback", () => {
  const ptResult = getCaseStudyContent("smart-inspector.md", "pt");
  assert.equal(ptResult.isFallback, false);
  assert.match(ptResult.content, /Estudo de Caso/);

  const deResult = getCaseStudyContent("smart-inspector.md", "de");
  assert.equal(deResult.isFallback, false);
  assert.match(deResult.content, /Fallstudie/);

  // Test fallback if a localized file does not exist
  const missingLocaleResult = getCaseStudyContent("smart-inspector.md", "nonexistent-locale");
  assert.match(missingLocaleResult.content, /Case Study/);
});

test("resolveAppUrl resolves from environment variable with fallback to production URL", () => {
  const defaultUrl = "https://example.com/app01";

  delete process.env.NEXT_PUBLIC_APP_01_URL;
  assert.equal(resolveAppUrl("01", defaultUrl), defaultUrl);

  process.env.NEXT_PUBLIC_APP_01_URL = "http://localhost:3001";
  assert.equal(resolveAppUrl("01", defaultUrl), "http://localhost:3001");

  delete process.env.NEXT_PUBLIC_APP_01_URL;
});

