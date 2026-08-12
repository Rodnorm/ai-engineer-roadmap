export default function ResultSkeleton() {
	return (
		<div className="flex flex-col gap-5 animate-pulse">
			{/* Caption */}
			<div>
				<div className="mb-2 h-3 w-20 rounded bg-gray-300/60" />
				<div className="h-4 w-3/4 rounded bg-gray-300/60" />
			</div>

			{/* Tags */}
			<div>
				<div className="mb-2 h-3 w-12 rounded bg-gray-300/60" />

				<div className="flex gap-2">
					<div className="h-6 w-16 rounded-full bg-gray-300/60" />
					<div className="h-6 w-20 rounded-full bg-gray-300/60" />
					<div className="h-6 w-14 rounded-full bg-gray-300/60" />
				</div>
			</div>

			{/* Objects */}
			<div>
				<div className="mb-2 h-3 w-20 rounded bg-gray-300/60" />
				<div className="h-4 w-1/2 rounded bg-gray-300/60" />
				<div className="mt-2 h-4 w-2/3 rounded bg-gray-300/60" />
				<div className="mt-2 h-4 w-1/3 rounded bg-gray-300/60" />
			</div>

			{/* OCR */}
			<div>
				<div className="mb-2 h-3 w-10 rounded bg-gray-300/60" />
				<div className="h-24 w-full rounded-md bg-gray-300/60" />
			</div>

			{/* Average price */}
			<div>
				<div className="mb-2 h-3 w-28 rounded bg-gray-300/60" />
				<div className="h-4 w-1/3 rounded bg-gray-300/60" />
			</div>

			{/* Lowest price */}
			<div>
				<div className="mb-2 h-3 w-32 rounded bg-gray-300/60" />
				<div className="h-4 w-3/4 rounded bg-gray-300/60" />
			</div>
		</div>
	);
}
