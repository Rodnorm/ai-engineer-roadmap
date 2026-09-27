import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased selection:bg-blue-600/30`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
