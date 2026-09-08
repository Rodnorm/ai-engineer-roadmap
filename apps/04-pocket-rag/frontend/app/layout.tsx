import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import './globals.css';

import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getDictionary, resolveLocale } from '@/lib/i18n/getDictionary';
import { LOCALES, type Locale } from '@/lib/i18n/locales';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dictionaries = Object.fromEntries(
  LOCALES.map((locale) => [locale, getDictionary(locale)]),
) as Record<Locale, ReturnType<typeof getDictionary>>;

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies();
  const locale = resolveLocale(store.get('pocket-rag-locale')?.value);
  return {
    title: dictionaries[locale].app.title,
    description: 'Cost-optimized Local RAG with ChromaDB vector store and OpenAI LLM',
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const locale = resolveLocale(store.get('pocket-rag-locale')?.value);

  return (
    <html lang={locale} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pocket-rag-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <I18nProvider initialLocale={locale} dictionaries={dictionaries}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
