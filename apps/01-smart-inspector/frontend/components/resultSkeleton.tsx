export default function ResultSkeleton() {
	return (
		<div className="relative flex flex-col gap-4 overflow-hidden border border-border bg-surface/30 p-4">
			{/* Radar Scanline Animation Bar */}
			<div className="animate-scanline pointer-events-none" />

			{/* Scanning Header Telemetry */}
			<div className="flex items-center justify-between border-b border-border/60 pb-2 font-mono text-[10px] text-accent">
				<span className="flex items-center gap-1.5">
					<span className="size-1.5 bg-accent animate-ping rounded-full" />
					<span>OPTICAL_SCANNER // ACTIVE_PROBE</span>
				</span>
				<span className="text-muted">ACQUIRING_TELEMETRY...</span>
			</div>

			{/* Caption Layer Skeleton */}
			<div className="border border-border/80 bg-panel/60 p-3">
				<div className="mb-2 h-2.5 w-32 border border-border/60 bg-border/40" />
				<div className="h-3 w-4/5 bg-border/50" />
			</div>

			{/* Tags Layer Skeleton */}
			<div className="border border-border/80 bg-panel/60 p-3">
				<div className="mb-2 h-2.5 w-24 border border-border/60 bg-border/40" />
				<div className="flex gap-2">
					<div className="h-5 w-20 border border-border/60 bg-border/30" />
					<div className="h-5 w-24 border border-border/60 bg-border/30" />
					<div className="h-5 w-16 border border-border/60 bg-border/30" />
				</div>
			</div>

			{/* Objects Layer Skeleton */}
			<div className="border border-border/80 bg-panel/60 p-3">
				<div className="mb-2 h-2.5 w-28 border border-border/60 bg-border/40" />
				<div className="grid grid-cols-2 gap-2">
					<div className="h-6 border border-border/50 bg-border/20" />
					<div className="h-6 border border-border/50 bg-border/20" />
				</div>
			</div>

			{/* OCR Layer Skeleton */}
			<div className="border border-border/80 bg-panel/60 p-3">
				<div className="mb-2 h-2.5 w-20 border border-border/60 bg-border/40" />
				<div className="h-20 w-full border border-border/60 bg-panel/80 p-2">
					<div className="h-2.5 w-full bg-border/40 mb-1.5" />
					<div className="h-2.5 w-3/4 bg-border/40 mb-1.5" />
					<div className="h-2.5 w-2/3 bg-border/40" />
				</div>
			</div>

			{/* Valuation Skeleton */}
			<div className="grid grid-cols-2 gap-2">
				<div className="border border-border/80 bg-panel/60 p-3">
					<div className="mb-2 h-2 w-20 bg-border/40" />
					<div className="h-4 w-16 bg-border/60" />
				</div>
				<div className="border border-border/80 bg-panel/60 p-3">
					<div className="mb-2 h-2 w-24 bg-border/40" />
					<div className="h-4 w-20 bg-border/60" />
				</div>
			</div>
		</div>
	);
}
