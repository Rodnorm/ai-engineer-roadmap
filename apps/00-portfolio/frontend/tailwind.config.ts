import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        "surface-card": "var(--surface-card)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        accent: "var(--accent)",
        "text-muted": "var(--text-muted)",
        "text-secondary": "var(--text-secondary)",
      },
    },
  },
  plugins: [],
};

export default config;
