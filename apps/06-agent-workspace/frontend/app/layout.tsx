import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App 06: Agent Workspace",
  description: "Streaming Microsoft Foundry agent with MCP tools and durable conversations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
