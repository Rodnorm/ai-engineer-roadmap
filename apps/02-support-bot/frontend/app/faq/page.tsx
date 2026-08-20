import kbEn from "@/data/healthcare-billing-kb.json";
import kbDe from "@/data/healthcare-billing-kb.de.json";
import kbPtBr from "@/data/healthcare-billing-kb.pt-BR.json";

import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary, resolveLocale } from "@/lib/i18n/getDictionary";

type KbEntry = {
	id: number;
	question: string;
	answer: string;
};

const knowledgeBases = {
	en: kbEn,
	de: kbDe,
	"pt-BR": kbPtBr,
};

export async function generateMetadata() {
	const store = await cookies();
	const locale = resolveLocale(store.get("locale")?.value);
	const dict = getDictionary(locale);

	return {
		title: dict.faq.title,
		description: dict.faq.description,
	};
}

export default async function FaqPage() {
	const store = await cookies();
	const locale = resolveLocale(store.get("locale")?.value);
	const dict = getDictionary(locale);

	const kb = knowledgeBases[locale];

	const entries = (kb.entries as KbEntry[])
		.slice()
		.sort((a, b) => a.id - b.id);

	return (
		<div className="w-full max-w-full min-w-0 min-h-dvh bg-white">
			<header className="w-full max-w-2xl mx-auto px-4 pt-6 sm:pt-8 pb-4">
				<div className="flex items-center justify-between gap-3">
					<h1 className="text-slate-900 font-semibold text-3xl sm:text-4xl leading-tight tracking-tight">
						{dict.faq.pageTitle}
					</h1>

					<Link
						href="/"
						className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 px-3 py-1.5 rounded-md hover:bg-sky-50/60 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
					>
						{dict.faq.backToChat}
					</Link>
				</div>

				<p className="text-slate-500 leading-relaxed tracking-tight mt-2 text-sm sm:text-base">
					{dict.faq.summary}
				</p>
			</header>

			<main className="w-full max-w-2xl mx-auto px-4 pb-8 space-y-2">
				{entries.map((entry) => (
					<details
						key={entry.id}
						className="group border border-slate-200 bg-white shadow-sm rounded-xl open:shadow-md transition-shadow duration-200"
					>
						<summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 rounded-xl">
							<span className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
								{entry.question}
							</span>

							<svg
								className="w-4 h-4 shrink-0 text-slate-400 group-open:text-sky-500 transition-transform duration-200 group-open:rotate-180"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</summary>

						<div className="px-4 pb-4 -mt-1 text-sm text-slate-600 leading-relaxed">
							{entry.answer}
						</div>
					</details>
				))}
			</main>
		</div>
	);
}