"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xs border border-border bg-surface text-foreground hover:border-text-muted transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 transition-transform duration-200" aria-hidden="true" />
      ) : (
        <Moon className="h-3.5 w-3.5 transition-transform duration-200" aria-hidden="true" />
      )}
    </button>
  );
}
