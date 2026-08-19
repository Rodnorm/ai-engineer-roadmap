import { ArrowRightIcon } from "lucide-react";

export default function Cards() {
	const cards = [
		"Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
		"Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
		"Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
		"Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
	];

	return (
		<div className="flex w-full mb-6 gap-3 text-sm text-neutral-800">
			{cards.map((card, index) => (
				<div
					key={index}
					className="hover:border-sky-500 group relative grow border border-ccc shadow-sm hover:shadow-md hover:-translate-y-[1px] hover:bg-neutral-100/30 rounded-xl p-4 transition-all duration-300"
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
