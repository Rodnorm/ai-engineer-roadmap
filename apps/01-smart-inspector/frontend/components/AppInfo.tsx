"use client";

import { Info, Terminal, X } from "lucide-react";
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
        className="inline-flex h-8 items-center justify-center gap-1.5 border border-border bg-surface px-2.5 font-mono text-xs font-medium text-text transition hover:border-border-active hover:bg-surface-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <Info className="size-3.5 text-accent" aria-hidden="true" />
        <span className="hidden uppercase sm:inline">{config.labels.about}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-md overflow-hidden bg-transparent p-0 backdrop:bg-black/80"
      >
        <div className="flex h-full flex-col overflow-y-auto border-l border-border bg-panel p-6 text-text shadow-2xl font-mono sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2 text-accent text-[10px] uppercase tracking-wider font-semibold">
                <Terminal className="size-3" />
                <span>SYSTEM_TELEMETRY // INFO</span>
              </div>
              <h2 id={titleId} className="mt-1 text-lg font-bold tracking-tight uppercase text-text">
                {config.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={config.labels.close}
              className="inline-flex size-8 shrink-0 items-center justify-center border border-border text-muted transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <p id={descriptionId} className="mt-4 font-sans text-xs leading-relaxed text-muted">
            {config.description}
          </p>

          <dl className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <InfoItem label={config.labels.category} value={config.category} />
            <InfoItem label={config.labels.status} value={config.status} />
          </dl>

          <InfoSection title={config.labels.whatItDoes} items={config.whatItDoes} />
          <InfoSection title={config.labels.howToUse} items={config.howToUse} ordered />

          <section className="mt-6 border-t border-border/60 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
              {"// "} {config.labels.technologies}
            </h3>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {config.technologies.map((technology) => (
                <li key={technology} className="chip">
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
    <div className="min-w-0 border border-border bg-surface/40 p-2.5 font-mono">
      <dt className="text-[9px] uppercase tracking-wider text-accent">{label}</dt>
      <dd className="mt-0.5 break-words text-xs font-medium text-text">{value}</dd>
    </div>
  );
}

function InfoSection({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: readonly string[];
  ordered?: boolean;
}) {
  const List = ordered ? "ol" : "ul";

  return (
    <section className="mt-5 border-t border-border/60 pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
        {"// "} {title}
      </h3>
      <List className={`mt-2 space-y-1.5 pl-4 font-sans text-xs leading-relaxed text-muted ${ordered ? "list-decimal" : "list-disc"}`}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </section>
  );
}
