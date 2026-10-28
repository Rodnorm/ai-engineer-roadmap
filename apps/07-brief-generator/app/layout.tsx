import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { I18nProvider } from "@/lib/i18n/context";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("app07-theme");var d=t==="dark"||(!t);document.documentElement.classList.toggle("dark",d);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>
          <I18nProvider>
            {children}
            <footer className="mt-auto border-t border-[var(--border-subtle)] px-4 py-3 text-center font-mono text-[0.7rem] text-[var(--text-muted)]">
              <a
                className="transition-colors hover:text-[var(--dossier-accent)]"
                href="https://normando.dev/datenschutz"
              >
                Datenschutz
              </a>
              <span className="px-2" aria-hidden="true">
                ·
              </span>
              <a
                className="transition-colors hover:text-[var(--dossier-accent)]"
                href="https://normando.dev/impressum"
              >
                Impressum
              </a>
            </footer>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
