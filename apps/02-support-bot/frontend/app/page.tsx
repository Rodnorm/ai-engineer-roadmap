"use client";

import Cards from "@/components/Cards";
import AppInfo from "@/components/AppInfo";
import ChatArea, { ChatAreaHandle } from "@/components/ChatArea";
import { BookOpen, ChevronDown, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getAppInfo } from "@/lib/app-info";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
	const t = useT("home");
	const { locale } = useI18n();

	const chatRef = useRef<ChatAreaHandle>(null);
	const [showCards, setShowCards] = useState(true);

	const handleCardSelect = (question: string) => {
		chatRef.current?.submit(question);
		setShowCards(false);
	};

	useEffect(() => {
		const onResize = () => {
			if (window.innerWidth >= 640) setShowCards(true);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	return (
		<div className="w-full max-w-full min-w-0 h-dvh bg-bg text-text flex flex-col overflow-hidden">
			<header className="shrink-0 w-full max-w-3xl mx-auto px-4 pt-14 sm:pt-8">
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/80 pb-3">
					<div className="min-w-0">
						<div className="flex items-center gap-2 font-mono text-[10px] text-accent uppercase tracking-wider mb-1">
							<Terminal className="size-3" />
							<span>[+] ENTERPRISE_SUPPORT_DESK :: AZURE_FOUNDRY_NLP v2.4</span>
						</div>
						<h1 className="font-mono text-xl sm:text-2xl font-bold tracking-tight uppercase text-text">
							{t("greeting")}{" "}
							<span className="text-accent">{t("question")}</span>
						</h1>
					</div>

					<div className="flex items-center gap-1.5 shrink-0">
						<AppInfo config={getAppInfo(locale)} />
						<Link
							href="/faq"
							className="inline-flex h-8 items-center gap-1.5 border border-border bg-surface px-2.5 font-mono text-xs font-medium text-text transition hover:border-border-active hover:bg-surface-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
						>
							<BookOpen className="size-3 text-accent" />
							<span>{t("faqLink")}</span>
						</Link>

						<button
							type="button"
							onClick={() => setShowCards((prev) => !prev)}
							aria-expanded={showCards}
							aria-controls="suggestion-cards"
							aria-label={t("suggestionsToggle")}
							className="sm:hidden inline-flex h-8 items-center gap-1 border border-border bg-surface px-2 font-mono text-xs font-medium text-text transition hover:border-border-active hover:bg-surface-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
						>
							<span>{t("suggestionsToggle")}</span>
							<ChevronDown
								className={`size-3 transition-transform duration-200 ${
									showCards ? "rotate-180" : ""
								}`}
								aria-hidden="true"
							/>
						</button>
					</div>
				</div>

				<p className="hidden sm:block text-muted font-mono text-xs leading-relaxed mt-2.5 max-w-xl">
					{t("intro")}
				</p>

				<div
					id="suggestion-cards"
					className={`mt-2 mb-2 ${
						showCards ? "block" : "hidden sm:block"
					}`}
				>
					<Cards onSelect={handleCardSelect} />
				</div>
			</header>

			<div className="flex-1 min-h-0 w-full max-w-3xl mx-auto px-4 pb-3 sm:pb-4 flex flex-col">
				<ChatArea ref={chatRef} />
			</div>
		</div>
	);
}
