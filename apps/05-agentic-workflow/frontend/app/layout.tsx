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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("agentic-workflow-theme");var d=t==="dark"||(!t);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased selection:bg-orange-500 selection:text-white">
        {children}
        <footer className="mt-auto border-t border-border px-4 py-4 text-center font-mono text-[0.7rem] text-muted">
          <a className="transition-colors hover:text-accent" href="https://normando.dev/datenschutz">Datenschutz</a>
          <span className="px-2" aria-hidden="true">·</span>
          <a className="transition-colors hover:text-accent" href="https://normando.dev/impressum">Impressum</a>
        </footer>
      </body>
    </html>
  );
}
