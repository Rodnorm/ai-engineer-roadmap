"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "./getDictionary";
import { LOCALE_COOKIE, type Locale } from "./locales";

type I18nContextValue = {
	locale: Locale;
	dict: Dictionary;
	setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
	initialLocale: Locale;
	dictionaries: Record<Locale, Dictionary>;
	children: React.ReactNode;
};

/**
 * Client-side i18n provider.
 *
 * The server renders the page using the locale from the cookie so the first
 * HTML already matches the active language. When the user picks a new locale
 * from the switcher we update the cookie, persist the choice to
 * localStorage (so it survives refreshes even before the cookie is set on
 * subsequent navigations), and call `router.refresh()` to re-render the
 * server tree with the new locale.
 */
export function I18nProvider({
	initialLocale,
	dictionaries,
	children,
}: I18nProviderProps) {
	const [locale, setLocaleState] = useState<Locale>(initialLocale);
	const router = useRouter();

	const setLocale = useCallback(
		(next: Locale) => {
			if (next === locale) return;

			setLocaleState(next);

			if (typeof document !== "undefined") {
				const oneYear = 60 * 60 * 24 * 365;
				document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${oneYear}; SameSite=Lax`;
				try {
					window.localStorage.setItem(LOCALE_COOKIE, next);
				} catch {
					/* storage may be unavailable — fall back to cookie only */
				}
			}

			router.refresh();
		},
		[locale, router],
	);

	const value = useMemo<I18nContextValue>(
		() => ({ locale, dict: dictionaries[locale], setLocale }),
		[locale, dictionaries, setLocale],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
	const ctx = useContext(I18nContext);
	if (!ctx) {
		throw new Error("useI18n must be used inside an <I18nProvider>");
	}
	return ctx;
}

/**
 * `useT` returns a translation function scoped to a namespace, plus the
 * active locale. It supports `{placeholder}` substitution, e.g.
 * `t("faq.summary", { count: 10 })`.
 */
export function useT<K extends keyof Dictionary>(namespace: K) {
	const { dict } = useI18n();
	return useCallback(
		<Key extends keyof Dictionary[K]>(
			key: Key,
			values?: Record<string, string | number>,
		): string => {
			const raw = (dict[namespace] as Record<string, string>)[key as string];
			if (typeof raw !== "string") return String(key);
			if (!values) return raw;
			return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
				values[name] !== undefined ? String(values[name]) : `{${name}}`,
			);
		},
		[dict, namespace],
	);
}
