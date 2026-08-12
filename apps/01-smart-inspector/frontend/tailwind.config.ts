import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d10",
        surface: "#14181d",
        border: "#242a31",
        muted: "#8a95a3",
        text: "#e6ebf2",
        accent: "#6366f1",
      },
    },
  },
  plugins: [],
};

export default config;
