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
        className="inline-flex size-9 items-center justify-center gap-2 rounded-lg border border-border bg-surface text-sm font-medium text-text transition hover:bg-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto sm:px-3"
      >
        <Info className="size-4" aria-hidden="true" />
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
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-md overflow-hidden bg-transparent p-0 backdrop:bg-slate-950/50"
      >
        <div className="flex h-full flex-col overflow-y-auto border-l border-border bg-surface p-6 text-text shadow-2xl sm:p-8">
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
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <p id={descriptionId} className="mt-4 text-sm leading-6 text-muted">
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
    <div className="min-w-0 rounded-xl border border-border bg-bg p-3">
      <dt className="text-[0.65rem] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 break-words text-xs font-medium text-text">{value}</dd>
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
    <section className="mt-7">
      <h3 className="text-sm font-semibold">{title}</h3>
      <List className={`mt-3 space-y-2 pl-5 text-sm leading-6 text-muted ${ordered ? "list-decimal" : "list-disc"}`}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </section>
  );
}
