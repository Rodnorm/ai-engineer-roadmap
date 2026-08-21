import { ArrowRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

type CardsProps = {
	onSelect?: (question: string) => void;
};

export default function Cards({ onSelect }: CardsProps) {
	const t = useT("cards");
	const items = useI18n().dict.cards.items;

	const scrollRef = useRef<HTMLDivElement>(null);

	const [randomCards, setRandomCards] = useState<string[]>([]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setRandomCards(
				[...items]
					.sort(() => Math.random() - 0.5)
					.slice(0, 10),
			);
		}, 0);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items.join("|")]);

	useEffect(() => {
		const element = scrollRef.current;

		if (!element || randomCards.length === 0) return;

		const sectionWidth = element.scrollWidth / 3;

		element.scrollLeft = sectionWidth;

		const handleWheel = (event: WheelEvent) => {
			if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
				event.preventDefault();

				element.scrollLeft += event.deltaY * 0.6;
			}
		};

		const handleScroll = () => {
			const sectionWidth = element.scrollWidth / 3;

			if (element.scrollLeft >= sectionWidth * 2) {
				element.scrollLeft -= sectionWidth;
			}

			if (element.scrollLeft <= 0) {
				element.scrollLeft += sectionWidth;
			}
		};

		element.addEventListener("wheel", handleWheel, {
			passive: false,
		});

		element.addEventListener("scroll", handleScroll);

		return () => {
			element.removeEventListener("wheel", handleWheel);
			element.removeEventListener("scroll", handleScroll);
		};
	}, [randomCards]);

	const infiniteCards = [...randomCards, ...randomCards, ...randomCards];

	return (
		<div className="relative w-full overflow-hidden">
			<div
				ref={scrollRef}
				className="p-4 flex flex-nowrap gap-3 w-full overflow-x-scroll overflow-y-hidden pb-2 scroll-smooth"
				style={{
					WebkitOverflowScrolling: "touch",
					scrollbarWidth: "none",
				}}
			>
				{infiniteCards.map((card, index) => (
					<button
						key={`${card}-${index}`}
						type="button"
						aria-label={t("askAria", { question: card })}
						onClick={() => onSelect?.(card)}
						className="group relative shrink-0 snap-start w-64 text-left border border-slate-200 bg-white shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 hover:bg-sky-50/40 rounded-xl p-3 pr-8 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
					>
						<p className="text-sm leading-snug">{card}</p>
						<div className="absolute top-2.5 right-2.5 text-slate-300 group-hover:text-sky-500 transition-colors duration-200">
							<ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
						</div>
					</button>
				))}
			</div>

			<div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-slate-950" />
			<div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-slate-950" />
		</div>
	);
}
