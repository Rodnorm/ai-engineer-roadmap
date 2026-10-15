import type { Metadata } from "next";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { StructuredData } from "@/components/StructuredData";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { playfair, inter } from "@/lib/fonts";
import { SITE_URL, getRouteAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Rodrigo Normando — Senior Software Engineer | Frontend & Applied AI",
  description:
    "Professional experience, accessible frontend engineering and applied AI systems by Rodrigo Normando in Essen, Germany.",
  alternates: {
    canonical: SITE_URL,
    languages: getRouteAlternates("/", "en").languages,
  },
  openGraph: {
    title: "Rodrigo Normando — Senior Software Engineer | Frontend & Applied AI",
    description:
      "Professional experience, accessible frontend engineering and applied AI systems by Rodrigo Normando in Essen, Germany.",
    url: SITE_URL,
    siteName: "Rodrigo Normando",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/editorial/og-card.png",
        width: 1200,
        height: 630,
        alt: "Rodrigo Normando — Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rodrigo Normando — Senior Software Engineer | Frontend & Applied AI",
    description:
      "Professional experience, accessible frontend engineering and applied AI systems by Rodrigo Normando in Essen, Germany.",
    images: ["/images/editorial/og-card.png"],
  },
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

export default function RootEnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFoucScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <HtmlLangSync />
          <StructuredData />
          <Header />
          <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
