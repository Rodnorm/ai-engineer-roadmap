"use client";

import { Moon } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "smart-inspector-theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem(THEME_KEY, nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={toggleTheme}
      className="fixed bottom-3 right-3 z-50 inline-flex h-8 w-14 items-center rounded-full border border-border bg-surface/90 p-1 shadow-sm backdrop-blur transition-colors duration-200 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:bottom-4 sm:right-4"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
          isDark
            ? "translate-x-6 bg-accent text-white"
            : "translate-x-0 bg-slate-100 text-slate-600"
        }`}
      >
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </button>
  );
}
