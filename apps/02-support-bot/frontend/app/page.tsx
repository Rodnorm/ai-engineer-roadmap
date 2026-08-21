"use client";

import Cards from "@/components/Cards";
import ChatArea, { ChatAreaHandle } from "@/components/ChatArea";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
	const t = useT("home");

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
		<div className="w-full max-w-full min-w-0 h-dvh bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
			<header className="shrink-0 w-full max-w-2xl mx-auto px-4 pt-4 sm:pt-8">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h1 className="text-slate-900 dark:text-slate-100 font-semibold text-2xl sm:text-5xl leading-tight tracking-tight">
							{t("greeting")}
						</h1>

						<h1 className="bg-gradient-to-r from-sky-500 to-pink-500 inline-block text-transparent bg-clip-text font-semibold text-2xl sm:text-5xl leading-tight tracking-tight">
							{t("question")}
						</h1>
					</div>

					<div className="flex items-center gap-1 mt-1">
						<Link
							href="/faq"
							className="shrink-0 inline-flex items-center text-xs font-medium text-slate-500 hover:text-sky-600 px-2.5 py-1.5 rounded-md hover:bg-sky-50/60 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
						>
							{t("faqLink")}
						</Link>

						<button
							type="button"
							onClick={() => setShowCards((prev) => !prev)}
							aria-expanded={showCards}
							aria-controls="suggestion-cards"
							aria-label={
								showCards
									? t("suggestionsToggle")
									: t("suggestionsToggle")
							}
							className="sm:hidden shrink-0 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-sky-600 px-2.5 py-1.5 rounded-md hover:bg-sky-50/60 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
						>
							<span>{t("suggestionsToggle")}</span>
							<ChevronDown
								className={`w-3.5 h-3.5 transition-transform duration-200 ${
									showCards ? "rotate-180" : ""
								}`}
								aria-hidden="true"
							/>
						</button>
					</div>
				</div>

			<p className="hidden sm:block text-slate-500 dark:text-slate-400 leading-relaxed tracking-tight mt-3 text-sm sm:text-base max-w-lg">
					{t("intro")}
				</p>

				<div
					id="suggestion-cards"
					className={`mt-3 sm:mt-6 mb-3 sm:mb-4 ${
						showCards ? "block" : "hidden sm:block"
					}`}
				>
					<Cards onSelect={handleCardSelect} />
				</div>
			</header>

			<div className="flex-1 min-h-0 w-full max-w-2xl mx-auto px-4 pb-3 sm:pb-4 flex flex-col">
				<ChatArea ref={chatRef} />
			</div>
		</div>
	);
}
