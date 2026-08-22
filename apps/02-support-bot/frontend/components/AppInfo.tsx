"use client";

import { Info, X } from "lucide-react";
import { useId, useRef } from "react";

import type { AppInfoConfig } from "@/lib/app-info";

export default function AppInfo({ config }: { config: AppInfoConfig }) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const titleId = useId();
	const descriptionId = useId();

	const close = () => dialogRef.current?.close();

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				onClick={() => dialogRef.current?.showModal()}
				aria-label={config.labels.about}
				className="shrink-0 inline-flex size-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-sky-50/60 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950 sm:w-auto"
			>
				<Info className="size-3.5" aria-hidden="true" />
				<span className="hidden sm:inline">{config.labels.about}</span>
			</button>

			<dialog
				ref={dialogRef}
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				onClose={() => triggerRef.current?.focus()}
				onClick={(event) => {
					if (event.target === event.currentTarget) close();
				}}
				className="m-0 ml-auto h-dvh max-h-none w-full max-w-md overflow-hidden bg-transparent p-0 backdrop:bg-slate-950/55"
			>
				<div className="flex h-full flex-col overflow-y-auto border-l border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:p-8">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h2 id={titleId} className="text-2xl font-semibold tracking-tight">
								{config.title}
							</h2>
						</div>
						<button
							type="button"
							onClick={close}
							aria-label={config.labels.close}
							className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
						>
							<X className="size-5" aria-hidden="true" />
						</button>
					</div>

					<p id={descriptionId} className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
						{config.description}
					</p>

					<dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
						<InfoItem label={config.labels.category} value={config.category} />
						<InfoItem label={config.labels.status} value={config.status} />
					</dl>

					<InfoSection title={config.labels.whatItDoes} items={config.whatItDoes} />
					<InfoSection title={config.labels.howToUse} items={config.howToUse} ordered />

					<section className="mt-7">
						<h3 className="text-sm font-semibold">{config.labels.technologies}</h3>
						<ul className="mt-3 flex flex-wrap gap-2">
							{config.technologies.map((technology) => (
								<li key={technology} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
									{technology}
								</li>
							))}
						</ul>
					</section>
				</div>
			</dialog>
		</>
	);
}

function InfoItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
			<dt className="text-[0.65rem] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
			<dd className="mt-1 break-words text-xs font-medium">{value}</dd>
		</div>
	);
}

function InfoSection({ title, items, ordered = false }: { title: string; items: readonly string[]; ordered?: boolean }) {
	const List = ordered ? "ol" : "ul";

	return (
		<section className="mt-7">
			<h3 className="text-sm font-semibold">{title}</h3>
			<List className={`mt-3 space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300 ${ordered ? "list-decimal" : "list-disc"}`}>
				{items.map((item) => <li key={item}>{item}</li>)}
			</List>
		</section>
	);
}
