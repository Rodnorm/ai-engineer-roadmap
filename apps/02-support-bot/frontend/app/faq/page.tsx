import kbEn from "@/data/healthcare-billing-kb.json";
import kbDe from "@/data/healthcare-billing-kb.de.json";
import kbPtBr from "@/data/healthcare-billing-kb.pt-BR.json";

import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary, resolveLocale } from "@/lib/i18n/getDictionary";
import { ArrowLeft, BookOpen, ChevronDown } from "lucide-react";

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
		title: `${dict.faq.title} :: Enterprise Knowledge Base`,
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
		<div className="w-full max-w-full min-w-0 min-h-dvh bg-bg text-text">
			<header className="w-full max-w-3xl mx-auto px-4 pt-14 sm:pt-8 pb-5 border-b border-border/80">
				<div className="flex items-center justify-between gap-3">
					<div>
						<div className="flex items-center gap-1.5 font-mono text-[10px] text-accent uppercase tracking-wider mb-1">
							<BookOpen className="size-3" />
							<span>KNOWLEDGE_BASE // AUDITED_GROUNDING_DOCS</span>
						</div>
						<h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-text">
							{dict.faq.pageTitle}
						</h1>
					</div>

					<Link
						href="/"
						className="inline-flex h-8 items-center gap-1.5 border border-border bg-surface px-2.5 font-mono text-xs font-medium text-text transition hover:border-border-active hover:bg-surface-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
					>
						<ArrowLeft className="size-3 text-accent" />
						<span>{dict.faq.backToChat}</span>
					</Link>
				</div>

				<p className="font-mono text-xs text-muted leading-relaxed mt-2.5 max-w-xl">
					{dict.faq.summary}
				</p>
			</header>

			<main className="w-full max-w-3xl mx-auto px-4 py-6 space-y-2.5 font-mono">
				{entries.map((entry) => (
					<details
						key={entry.id}
						className="group border border-border bg-panel transition hover:border-border-active open:border-accent/50"
					>
						<summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-3.5 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-accent">
							<div className="flex items-start gap-2.5 min-w-0">
								<span className="shrink-0 text-accent text-[11px] font-semibold">
									[FAQ_{String(entry.id).padStart(3, "0")}]
								</span>
								<span className="font-sans text-xs sm:text-sm font-medium text-text leading-snug">
									{entry.question}
								</span>
							</div>

							<ChevronDown
								className="size-4 shrink-0 text-muted group-open:text-accent transition-transform duration-200 group-open:rotate-180"
								aria-hidden="true"
							/>
						</summary>

						<div className="border-t border-border/60 bg-surface/40 px-4 py-3 font-sans text-xs leading-relaxed text-muted">
							{entry.answer}
						</div>
					</details>
				))}
			</main>
		</div>
	);
}
