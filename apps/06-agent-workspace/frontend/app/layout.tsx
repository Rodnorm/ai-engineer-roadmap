import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "Agent Workspace",
  description: "Streaming Microsoft Foundry agent with MCP tools and durable conversations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("agent-workspace-theme");var d=t==="dark"||(!t);document.documentElement.classList.toggle("dark",d);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <I18nProvider>{children}</I18nProvider>
        <footer className="mt-auto border-t border-border px-4 py-3 text-center font-mono text-[0.7rem] text-muted">
          <a className="transition-colors hover:text-accent" href="https://normando.dev/datenschutz">Datenschutz</a>
          <span className="px-2" aria-hidden="true">·</span>
          <a className="transition-colors hover:text-accent" href="https://normando.dev/impressum">Impressum</a>
        </footer>
      </body>
    </html>
  );
}
