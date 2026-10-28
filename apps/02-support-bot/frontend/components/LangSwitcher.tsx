"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locales";

/**
 * Fixed-position language dropdown rendered in the root layout so it is
 * available on every page.
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
			className="fixed top-3 right-13 sm:top-4 sm:right-24 z-50 font-mono"
		>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={t.switchAria}
				className="inline-flex h-8 items-center gap-1.5 border border-border bg-surface px-2 sm:px-2.5 font-mono text-xs font-medium text-text transition hover:border-border-active hover:bg-surface-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
			>
				<Globe className="size-3 text-accent shrink-0" aria-hidden="true" />
				<span className="hidden sm:inline uppercase">{LOCALE_LABELS[locale]}</span>
				<span className="sm:hidden uppercase">{locale === "pt-BR" ? "PT" : locale.toUpperCase()}</span>
				<ChevronDown
					className={`size-3 text-muted transition-transform duration-200 ${
						open ? "rotate-180" : ""
					}`}
					aria-hidden="true"
				/>
			</button>

			{open && (
				<ul
					role="listbox"
					aria-label={t.label}
					className="absolute right-0 mt-1 min-w-[8rem] border border-border bg-panel shadow-2xl py-0.5 overflow-hidden font-mono text-xs"
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
									className={`w-full text-left text-xs px-3 py-1.5 transition-colors duration-150 cursor-pointer focus:outline-none ${
										isActive
											? "bg-accent/15 text-accent font-semibold"
											: "text-text hover:bg-surface"
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
