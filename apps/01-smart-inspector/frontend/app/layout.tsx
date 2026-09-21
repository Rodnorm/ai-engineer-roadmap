import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Smart Inspector",
  description: "Upload an image and inspect tags, caption, detected objects, and OCR text.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("smart-inspector-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-text antialiased">
        <LanguageProvider>
          <ThemeToggle />
          {children}
        </LanguageProvider>
      <footer className="mt-auto border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
          <a className="transition-colors hover:text-sky-500" href="https://normando.dev/datenschutz">Datenschutz</a>
          <span className="px-2" aria-hidden="true">·</span>
          <a className="transition-colors hover:text-sky-500" href="https://normando.dev/impressum">Impressum</a>
        </footer>
        </body>
    </html>
  );
}
