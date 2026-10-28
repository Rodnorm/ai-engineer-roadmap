"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "support-bot-theme";

export default function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setIsDark(document.documentElement.classList.contains("dark"));
		});

		return () => cancelAnimationFrame(frame);
	}, []);

	const toggleTheme = () => {
		const currentlyDark = document.documentElement.classList.contains("dark");
		const nextIsDark = !currentlyDark;
		document.documentElement.classList.toggle("dark", nextIsDark);
		localStorage.setItem(THEME_KEY, nextIsDark ? "dark" : "light");
		setIsDark(nextIsDark);
	};

	return (
		<button
			type="button"
			role="switch"
			aria-checked={isDark}
			aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
			onClick={toggleTheme}
			className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 inline-flex h-8 w-8 sm:w-auto items-center justify-center gap-1.5 border border-border bg-panel/90 px-0 sm:px-2.5 font-mono text-[10px] uppercase text-muted shadow-lg backdrop-blur transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
		>
			{isDark ? (
				<>
					<Moon className="size-3 text-accent shrink-0" aria-hidden="true" />
					<span className="hidden sm:inline">[ DARK ]</span>
				</>
			) : (
				<>
					<Sun className="size-3 text-amber-500 shrink-0" aria-hidden="true" />
					<span className="hidden sm:inline">[ LIGHT ]</span>
				</>
			)}
		</button>
	);
}
