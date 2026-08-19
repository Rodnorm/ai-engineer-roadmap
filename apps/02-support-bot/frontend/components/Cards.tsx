import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";

type CardsProps = {
	onSelect?: (question: string) => void;
};

const cards = [
	"How can I update my billing address?",
	"I accidentally paid twice for the same appointment. What should I do?",
	"Where can I download an invoice from last month?",
	"My refund has not arrived yet. How long should I wait?",
	"My insurance refused to cover my appointment. What can I do?",
	"I paid my bill, but my account still shows it as unpaid.",
	"Can I change the date of my appointment?",
	"I don't recognize a charge on my account. Can you help?",
	"I need to talk to a real person about my billing problem.",
	"Can you help me book a flight?",
];

function getRandomCards() {
	return [...cards]
		.sort(() => Math.random() - 0.5)
		.slice(0, 4);
}

export default function Cards({ onSelect }: CardsProps) {
		const [randomCards] = useState(getRandomCards);
	return (
		<div className="flex flex-wrap content-start w-full mb-6 gap-3 text-sm text-slate-700">
			{randomCards.map((card, index) => (
				<button
					key={index}
					type="button"
					aria-label={`Ask: ${card}`}
					onClick={() => onSelect?.(card)}
					className="group relative grow basis-full sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(25%-0.75rem)] text-left border border-slate-200 bg-white shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 hover:bg-sky-50/40 rounded-xl p-4 pr-9 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
				>
					<p className="leading-relaxed">{card}</p>
					<div className="absolute top-3 right-3 text-slate-300 group-hover:text-sky-500 transition-colors duration-200">
						<ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
					</div>
				</button>
			))}
		</div>
	);
}
