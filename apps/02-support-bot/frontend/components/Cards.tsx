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
		<div className="chat-scroll flex flex-wrap content-start w-full mb-6 gap-3 h-64 overflow-y-auto text-sm text-neutral-800">
			{randomCards.map((card, index) => (
				<div
					key={index}
					onClick={() => onSelect?.(card)}
					className="basis-full sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(25%-0.75rem)] hover:border-sky-500 group relative grow border border-ccc shadow-sm hover:shadow-md hover:-translate-y-[1px] hover:bg-neutral-100/30 rounded-xl p-4 transition-all duration-300 cursor-pointer"
				>
					<p>{card}</p>
					<div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<ArrowRightIcon className="w-4 h-4 text-neutral-500" />
					</div>
				</div>
			))}
		</div>
	);
}
