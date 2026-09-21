import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "Multi-Agent Brief Generator | AI Engineer Roadmap",
  description:
    "Heterogeneous multi-agent orchestration pipeline decoupling technical research tools from executive PR-FAQ briefing synthesis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>
          {children}
          <footer className="mt-auto border-t border-[var(--border-subtle)] px-4 py-4 text-center text-xs text-[var(--text-muted)]">
            <a
              className="transition-colors hover:text-sky-500"
              href="https://normando.dev/datenschutz"
            >
              Datenschutz
            </a>
            <span className="px-2" aria-hidden="true">
              ·
            </span>
            <a
              className="transition-colors hover:text-sky-500"
              href="https://normando.dev/impressum"
            >
              Impressum
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
