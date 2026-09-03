export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-surface/30 py-8 mt-20 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 AI Engineer Roadmap. Built with Next.js, FastAPI & Azure AI.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Rodnorm/ai-engineer-roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub Repository
          </a>
          <span>•</span>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
