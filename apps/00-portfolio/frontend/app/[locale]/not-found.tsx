import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="space-y-2 font-mono">
        <p className="text-xs uppercase tracking-widest text-text-muted">Error 404 // NOT_FOUND</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-foreground">
          Page not found
        </h1>
        <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto font-sans">
          The requested page could not be found or has moved to another address.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xs bg-foreground px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>[ Back to homepage ]</span>
      </Link>
    </main>
  );
}
