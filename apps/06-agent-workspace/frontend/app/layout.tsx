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
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
