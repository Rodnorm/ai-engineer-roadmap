"use client";

import { useId, useRef } from "react";

import { useT } from "@/lib/i18n/I18nProvider";

export default function AppInfo() {
  const controlsT = useT("controls");
  const infoT = useT("info");
  const appT = useT("app");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => dialogRef.current?.showModal()} aria-label={controlsT("about")} title={controlsT("about")} className="control-button size-9">
        <InfoIcon />
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
        <div className="flex h-full flex-col overflow-y-auto border-l border-border bg-panel p-6 text-text shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="mt-2 text-2xl font-semibold tracking-tight">{appT("title")}</h2>
            </div>
            <button type="button" onClick={close} aria-label={controlsT("close")} className="icon-button size-9"><CloseIcon /></button>
          </div>

          <p id={descriptionId} className="mt-4 text-sm leading-6 text-muted">{infoT("description")}</p>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            <InfoItem label={infoT("categoryLabel")} value={infoT("category")} />
            <InfoItem label={infoT("statusLabel")} value={infoT("status")} />
          </dl>

          <InfoSection title={infoT("whatItDoes")} items={[infoT("what1"), infoT("what2"), infoT("what3")]} />
          <InfoSection title={infoT("howToUse")} items={[infoT("step1"), infoT("step2"), infoT("step3")]} ordered />

          <section className="mt-7">
            <h3 className="text-sm font-semibold">{infoT("technologies")}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS 4", "FastAPI", "SQLite Vector", "Azure OpenAI"].map((technology) => (
                <li key={technology} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">{technology}</li>
              ))}
            </ul>
          </section>
        </div>
      </dialog>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl border border-border bg-surface p-3"><dt className="text-[0.65rem] uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words text-xs font-medium">{value}</dd></div>;
}

function InfoSection({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return <section className="mt-7"><h3 className="text-sm font-semibold">{title}</h3><List className={`mt-3 space-y-2 pl-5 text-sm leading-6 text-muted ${ordered ? "list-decimal" : "list-disc"}`}>{items.map((item) => <li key={item}>{item}</li>)}</List></section>;
}

function InfoIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12" /></svg>;
}
