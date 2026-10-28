"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
      className="inline-flex items-center justify-center size-8 rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--dossier-accent)] transition-colors focus:outline-none cursor-pointer"
    >
      {theme === "dark" ? (
        <Sun className="size-3.5 text-amber-400" />
      ) : (
        <Moon className="size-3.5 text-indigo-500" />
      )}
    </button>
  );
}
