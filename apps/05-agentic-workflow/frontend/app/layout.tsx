import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agentic Workflow | Autonomous Tool Calling & HITL',
  description: 'Autonomous AI agent execution loop with multi-tool calling and Human-in-the-Loop authorization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col antialiased selection:bg-sky-500 selection:text-white">
        {children}
      <footer className="mt-auto border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
          <a className="transition-colors hover:text-sky-500" href="https://normando.dev/datenschutz">Datenschutz</a>
          <span className="px-2" aria-hidden="true">·</span>
          <a className="transition-colors hover:text-sky-500" href="https://normando.dev/impressum">Impressum</a>
        </footer>
        </body>
    </html>
  );
}
