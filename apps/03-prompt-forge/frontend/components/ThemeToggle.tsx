"use client";

import { useEffect, useState } from "react";

import { useT } from "@/lib/i18n/I18nProvider";

const THEME_KEY = "prompt-forge-theme";

export default function ThemeToggle() {
  const t = useT("controls");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    const nextIsDark = !currentlyDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem(THEME_KEY, nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? t("lightTheme") : t("darkTheme")}
      title={isDark ? t("lightTheme") : t("darkTheme")}
      onClick={toggleTheme}
      className="control-button size-8 p-0"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5" aria-hidden="true">
      <path d="M21 12.8A8.4 8.4 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
