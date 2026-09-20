import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "Agent Workspace",
  description: "Streaming Microsoft Foundry agent with MCP tools and durable conversations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="dark">
      <body className="flex min-h-screen flex-col">
        <I18nProvider>{children}</I18nProvider>
      <footer className="mt-auto border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
          <a className="transition-colors hover:text-sky-500" href="https://normando.dev/datenschutz">Datenschutz</a>
          <span className="px-2" aria-hidden="true">·</span>
          <a className="transition-colors hover:text-sky-500" href="https://normando.dev/impressum">Impressum</a>
        </footer>
        </body>
    </html>
  );
}
