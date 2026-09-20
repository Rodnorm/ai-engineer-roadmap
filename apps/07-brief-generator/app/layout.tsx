import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "App 07 — Multi-Agent Brief Generator | AI Engineer Roadmap",
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
      <body className="antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
