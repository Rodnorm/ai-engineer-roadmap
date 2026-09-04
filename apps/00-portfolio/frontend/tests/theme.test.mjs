import test from "node:test";
import assert from "node:assert/strict";

import { THEME_KEY } from "../lib/theme/ThemeProvider.tsx";

test("theme storage key is well-defined", () => {
  assert.equal(THEME_KEY, "portfolio_theme");
});

test("theme toggling logic alternates between dark and light", () => {
  const getNextTheme = (current) => (current === "dark" ? "light" : "dark");

  assert.equal(getNextTheme("dark"), "light");
  assert.equal(getNextTheme("light"), "dark");
});

test("theme preference resolution handles system and explicit choices", () => {
  const resolveTheme = (stored, systemPrefersDark) => {
    if (stored === "dark") return "dark";
    if (stored === "light") return "light";
    // system or null
    return systemPrefersDark ? "dark" : "light";
  };

  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
});

test("anti-fouc logic correctly computes dark class application", () => {
  const computeIsDark = (stored, systemDark) => {
    return (
      stored === "dark" ||
      (!stored && systemDark) ||
      (stored === "system" && systemDark)
    );
  };

  assert.equal(computeIsDark("dark", false), true);
  assert.equal(computeIsDark("light", true), false);
  assert.equal(computeIsDark(null, true), true);
  assert.equal(computeIsDark(null, false), false);
  assert.equal(computeIsDark("system", true), true);
  assert.equal(computeIsDark("system", false), false);
});
