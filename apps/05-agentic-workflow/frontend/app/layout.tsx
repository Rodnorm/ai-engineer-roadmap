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
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
