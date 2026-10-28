'use client';

import React, { useId, useRef } from 'react';
import { Info, X, Cpu, Wrench, ShieldCheck, Layers, CheckCircle2, Ban } from 'lucide-react';
import { useT } from '@/lib/i18n/I18nProvider';

export function AppInfo() {
  const controlsT = useT('controls');
  const infoT = useT('info');
  const appT = useT('app');
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
        aria-label={controlsT('about')}
        title={controlsT('about')}
        className="control-button size-8 p-0 cursor-pointer"
      >
        <Info className="size-3.5 text-muted hover:text-text transition-colors" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-md overflow-hidden bg-transparent p-0 backdrop:bg-black/75"
      >
        <div className="flex h-full flex-col overflow-y-auto border-l border-border bg-panel p-6 text-text shadow-2xl sm:p-8 font-sans">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-accent">{"//"} SYSTEM_SPEC</span>
              <h2 id={titleId} className="mt-1 text-xl font-bold tracking-tight text-text">
                {appT('title')}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={controlsT('close')}
              className="icon-button size-8 cursor-pointer rounded-xs border border-border text-muted hover:text-text"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <p id={descriptionId} className="mt-4 text-xs leading-relaxed text-muted">
            {infoT('description')}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-2">
            <InfoItem label={infoT('categoryLabel')} value={infoT('category')} icon={<Cpu className="size-3 text-accent" />} />
            <InfoItem label={infoT('statusLabel')} value={infoT('status')} icon={<ShieldCheck className="size-3 text-emerald-400" />} />
          </dl>

          <InfoSection
            title={infoT('whatItDoes')}
            icon={<Wrench className="size-3.5 text-accent" />}
            items={[infoT('what1'), infoT('what2'), infoT('what3')]}
          />

          <InfoSection
            title={infoT('howToUse')}
            icon={<Layers className="size-3.5 text-amber-500" />}
            items={[infoT('step1'), infoT('step2'), infoT('step3')]}
            ordered
          />

          {/* Capabilities & Boundaries */}
          <section className="mt-5 border-t border-border pt-4 space-y-2.5">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-accent" />
              {infoT('capabilitiesTitle')}
            </h3>

            {/* What it CAN do */}
            <div className="rounded-xs border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1.5">
              <h4 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-3 shrink-0" />
                {infoT('canDoTitle')}
              </h4>
              <ul className="space-y-1 pl-4 list-disc text-xs text-muted leading-relaxed">
                <li>{infoT('canDo1')}</li>
                <li>{infoT('canDo2')}</li>
                <li>{infoT('canDo3')}</li>
              </ul>
            </div>

            {/* What it CANNOT do */}
            <div className="rounded-xs border border-rose-500/30 bg-rose-500/5 p-3 space-y-1.5">
              <h4 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Ban className="size-3 shrink-0" />
                {infoT('cannotDoTitle')}
              </h4>
              <ul className="space-y-1 pl-4 list-disc text-xs text-muted leading-relaxed">
                <li>{infoT('cannotDo1')}</li>
                <li>{infoT('cannotDo2')}</li>
                <li>{infoT('cannotDo3')}</li>
                <li>{infoT('cannotDo4')}</li>
              </ul>
            </div>
          </section>

          <section className="mt-5 border-t border-border pt-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-2.5">
              {infoT('technologies')}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {[
                'Next.js 15',
                'React 19',
                'FastAPI',
                'Python 3.12',
                'ReAct Loop',
                'Human-in-the-Loop',
                'Tailwind CSS 4',
                'Pydantic 2',
              ].map((tech) => (
                <li
                  key={tech}
                  className="rounded-xs border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </dialog>
    </>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xs border border-border bg-surface p-2.5">
      <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-muted flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 break-words font-mono text-xs font-semibold text-text">{value}</dd>
    </div>
  );
}

function InfoSection({
  title,
  icon,
  items,
  ordered = false,
}: {
  title: string;
  icon?: React.ReactNode;
  items: string[];
  ordered?: boolean;
}) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <section className="mt-5 border-t border-border pt-4">
      <h3 className="font-mono text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      <List className={`mt-2 space-y-1.5 pl-4 text-xs leading-relaxed text-muted ${ordered ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item, idx) => (
          <li key={idx} className="pl-0.5">
            {item}
          </li>
        ))}
      </List>
    </section>
  );
}
