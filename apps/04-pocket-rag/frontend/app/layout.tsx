import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'pocketRag — Personal AI Knowledge Base',
  description: 'Cost-optimized Local RAG with ChromaDB vector store and OpenAI LLM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
