import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Inspector :: Multimodal Optics HUD",
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
            __html: `(function(){try{var t=localStorage.getItem("smart-inspector-theme");var d=t?t==="dark":true;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col bg-bg text-text antialiased font-sans selection:bg-amber-500/25 selection:text-amber-300`}>
        <LanguageProvider>
          <ThemeToggle />
          {children}
        </LanguageProvider>
        <footer className="mt-auto border-t border-border px-4 py-3 text-center font-mono text-[11px] text-muted">
          <a className="transition-colors hover:text-accent" href="https://normando.dev/datenschutz">Datenschutz</a>
          <span className="px-2 text-border-active" aria-hidden="true">/</span>
          <a className="transition-colors hover:text-accent" href="https://normando.dev/impressum">Impressum</a>
        </footer>
      </body>
    </html>
  );
}
