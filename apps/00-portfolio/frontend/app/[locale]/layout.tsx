import type { Metadata } from "next";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { StructuredData } from "@/components/StructuredData";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { playfair, inter } from "@/lib/fonts";
import {
  SITE_URL,
  LOCALES,
  Locale,
  isValidLocale,
  getDictionary,
  getRouteAlternates,
} from "@/lib/i18n";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return LOCALES.filter((l) => l !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLoc: Locale = isValidLocale(locale) ? (locale as Locale) : "en";
  const dict = getDictionary(validLoc);
  const alternates = getRouteAlternates("/", validLoc);

  return {
    metadataBase: new URL(SITE_URL),
    title: dict.meta.siteTitle,
    description: dict.meta.siteDescription,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      url: alternates.canonical,
      siteName: "Rodrigo Normando",
      locale: validLoc === "pt" ? "pt_BR" : validLoc === "de" ? "de_DE" : "en_US",
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
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      images: ["/images/editorial/og-card.png"],
    },
  };
}

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

export default async function LocalizedRootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const validLoc: Locale = isValidLocale(locale) ? (locale as Locale) : "en";
  const langAttr = validLoc === "pt" ? "pt-BR" : validLoc === "de" ? "de" : "en";

  return (
    <html
      lang={langAttr}
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
