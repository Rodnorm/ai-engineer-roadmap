import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Rodrigo Normando — Frontend & Applied AI",
  description: "Professional experience, frontend engineering and applied AI projects by Rodrigo Normando.",
};

const antiFoucScript = `
(function() {
  try {
    var stored = localStorage.getItem("portfolio_theme");
    var isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches) || (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFoucScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased transition-colors duration-200">
        <ThemeProvider>
          <HtmlLangSync />
          <Header />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

