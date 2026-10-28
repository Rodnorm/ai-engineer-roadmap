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
				className="py-2 px-1 flex flex-nowrap gap-2.5 w-full overflow-x-scroll overflow-y-hidden scroll-smooth"
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
						className="group relative shrink-0 snap-start w-64 text-left border border-border bg-panel p-2.5 pr-7 transition hover:border-accent hover:bg-surface cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-none"
					>
						<div className="flex items-center gap-1.5 font-mono text-[10px] text-accent/80 mb-1">
							<span>[PROMPT_{String((index % 10) + 1).padStart(2, "0")}]</span>
						</div>
						<p className="font-sans text-xs leading-snug text-text line-clamp-2">{card}</p>
						<div className="absolute top-2.5 right-2 text-muted group-hover:text-accent transition-colors">
							<ArrowRightIcon className="size-3.5" aria-hidden="true" />
						</div>
					</button>
				))}
			</div>

			<div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-bg to-transparent" />
			<div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg to-transparent" />
		</div>
	);
}
