import Link from "next/link";
import { Sparkles, Code2, Map } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/80 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:text-primary transition-colors">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>AI Engineer Roadmap</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/apps" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Code2 className="w-4 h-4" />
            <span>Catalog</span>
          </Link>
          <Link href="/roadmap" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Map className="w-4 h-4" />
            <span>Roadmap</span>
          </Link>
          <a
            href="https://github.com/Rodnorm/ai-engineer-roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-surface border border-border hover:border-primary text-white transition-all text-xs font-semibold"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
