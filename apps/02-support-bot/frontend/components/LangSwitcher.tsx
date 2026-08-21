"use client";

import { ChevronDown, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locales";

/**
 * Fixed-position language dropdown rendered in the root layout so it is
 * available on every page. The component is client-only; it reads its
 * initial selection from the provider (which the server pre-populated from
 * the cookie) to keep the first paint consistent.
 */
export default function LangSwitcher() {
	const { locale, setLocale } = useI18n();
	const t = useI18n().dict.language;

	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleClick = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	const handleSelect = (next: Locale) => {
		setLocale(next);
		setOpen(false);
	};

	return (
		<div
			ref={containerRef}
			className="fixed top-3 right-20 sm:top-4 sm:right-24 z-50"
		>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={t.switchAria}
				className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white/80 backdrop-blur border border-slate-200 hover:border-sky-300 hover:text-sky-600 px-2.5 py-1.5 rounded-md shadow-sm hover:bg-sky-50/60 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-sky-600 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
			>
				<Languages className="w-3.5 h-3.5" aria-hidden="true" />
				<span>{LOCALE_LABELS[locale]}</span>
				<ChevronDown
					className={`w-3.5 h-3.5 transition-transform duration-200 ${
						open ? "rotate-180" : ""
					}`}
					aria-hidden="true"
				/>
			</button>

			{open && (
				<ul
					role="listbox"
					aria-label={t.label}
					className="absolute right-0 mt-1.5 min-w-[8rem] rounded-md border border-slate-200 bg-white shadow-lg py-1 overflow-hidden dark:border-slate-700 dark:bg-slate-900"
				>
					{LOCALES.map((option) => {
						const isActive = option === locale;
						return (
							<li key={option} role="presentation">
								<button
									type="button"
									role="option"
									aria-selected={isActive}
									onClick={() => handleSelect(option)}
									className={`w-full text-left text-sm px-3 py-1.5 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:bg-sky-50 ${
										isActive
											? "bg-sky-50 text-sky-700 font-medium dark:bg-sky-950 dark:text-sky-300"
											: "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
									}`}
								>
									{LOCALE_LABELS[option]}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
