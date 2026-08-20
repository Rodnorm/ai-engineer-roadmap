import { ArrowRightIcon } from "lucide-react";
import { useRef, useState } from "react";

type CardsProps = {
	onSelect?: (question: string) => void;
};

const cards = [
	"Everything went well with my payment. Where can I download the receipt?",
	"My refund arrived successfully. Where can I see its details?",
	"My insurance covered the appointment. Can I get a copy of the invoice?",
	"I was charged twice and I want my money back. What should I do?",
	"My refund was approved but I still haven't received the money.",
	"I'm frustrated because my payment keeps failing. How can I fix it?",
	"Where can I find my latest invoice?",
	"How can I update my billing address?",
	"What payment methods are available?",
	"How can I check the status of a payment?",
];

function getRandomCards() {
	return [...cards]
		.sort(() => Math.random() - 0.5)
		.slice(0, 4);
}

export default function Cards({ onSelect }: CardsProps) {
	const [randomCards] = useState(getRandomCards);
	const scrollRef = useRef<HTMLDivElement>(null);

	const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		const el = scrollRef.current;
		if (!el) return;
		// Translate vertical wheel delta into horizontal scroll,
		// but only when there's actual horizontal overflow to consume.
		if (el.scrollWidth <= el.clientWidth) return;
		if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
		el.scrollLeft += e.deltaY;
		e.preventDefault();
	};

	return (
		<div className="relative w-full overflow-hidden">
			<div
				ref={scrollRef}
				onWheel={handleWheel}
				className="flex gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
				style={{
					WebkitOverflowScrolling: "touch",
					scrollbarWidth: "none",
				}}
			>
				{randomCards.map((card, index) => (
					<button
						key={index}
						type="button"
						aria-label={`Ask: ${card}`}
						onClick={() => onSelect?.(card)}
						className="group relative shrink-0 snap-start w-64 text-left border border-slate-200 bg-white shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 hover:bg-sky-50/40 rounded-xl p-3 pr-8 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
					>
						<p className="text-sm leading-snug">{card}</p>
						<div className="absolute top-2.5 right-2.5 text-slate-300 group-hover:text-sky-500 transition-colors duration-200">
							<ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
						</div>
					</button>
				))}
			</div>

			<div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
			<div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
		</div>
	);
}
