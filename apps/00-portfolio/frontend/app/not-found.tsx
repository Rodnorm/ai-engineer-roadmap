import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "./globals.css";
import { playfair, inter } from "@/lib/fonts";

export default function NotFound() {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col justify-center items-center px-4">
        <main className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Error 404</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-foreground">
              Page not found
            </h1>
            <p className="text-text-muted text-sm sm:text-base max-w-md mx-auto">
              The requested page could not be found or has moved to another address.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white dark:text-background hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to homepage</span>
          </Link>
        </main>
      </body>
    </html>
  );
}
