import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import LangSwitcher from "@/components/LangSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getDictionary, resolveLocale } from "@/lib/i18n/getDictionary";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

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
	const locale = resolveLocale(store.get("locale")?.value);
	const dict = dictionaries[locale];
	return {
		title: `${dict.app.title} :: Enterprise NLP Desk`,
		description: dict.app.description,
	};
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
	const store = await cookies();
	const locale = resolveLocale(store.get("locale")?.value);

	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem("support-bot-theme");var d=t?t==="dark":true;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
					}}
				/>
			</head>
			<body className="flex min-h-full flex-col bg-bg text-text font-sans antialiased selection:bg-cyan-500/25 selection:text-cyan-300">
				<I18nProvider initialLocale={locale} dictionaries={dictionaries}>
					<LangSwitcher />
					<ThemeToggle />
					{children}
				</I18nProvider>
				<footer className="mt-auto border-t border-border px-4 py-3 text-center font-mono text-[11px] text-muted">
					<a className="transition-colors hover:text-accent" href="https://normando.dev/datenschutz">Datenschutz</a>
					<span className="px-2 text-border-active" aria-hidden="true">/</span>
					<a className="transition-colors hover:text-accent" href="https://normando.dev/impressum">Impressum</a>
				</footer>
			</body>
		</html>
	);
}
