import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "App 08 — Production AI Deployment & Operations Studio",
  description:
    "Enterprise AIOps platform with progressive canary rollout, zero-downtime blue/green routing, SLO circuit breaker, and automated rollback.",
  keywords: [
    "AIOps",
    "Canary Deployment",
    "Blue-Green Deployment",
    "Circuit Breaker",
    "Error Budget",
    "LLM Operations",
    "Azure OpenAI",
    "SRE",
  ],
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
            __html: `
              try {
                const savedTheme = localStorage.getItem('app08_theme');
                const theme = savedTheme || 'dark';
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col`}>
        <I18nProvider>{children}</I18nProvider>
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4 py-2 text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NOC_STATION_08 :: SRE_INFERENCE_RADAR</span>
          </div>
          <div className="flex items-center gap-4">
            <span>CIRCUIT_STATUS: NOMINAL</span>
            <span>SLO_TARGET: 99.0%</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
