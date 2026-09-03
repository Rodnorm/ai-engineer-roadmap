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
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-foreground hover:border-primary hover:text-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-200" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200" aria-hidden="true" />
      )}
    </button>
  );
}
