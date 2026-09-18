"use client";

import React, { useId, useRef } from "react";
import { Info, X, Cpu, Wrench, ShieldCheck, Layers, CheckCircle2, Ban, Terminal } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

export function AppInfo() {
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
      <button
        ref={triggerRef}
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={controlsT("about")}
        title={controlsT("about")}
        className="control-button size-9 p-0 cursor-pointer"
      >
        <Info className="size-4 text-muted hover:text-text transition-colors" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="drawer-dialog"
      >
        <div className="drawer-panel">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="eyebrow">{appT("eyebrow")}</p>
              <h2 id={titleId} className="text-xl font-bold tracking-tight text-text mt-1">
                {appT("title")}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={controlsT("close")}
              className="icon-button size-8 rounded-lg"
            >
              <X className="size-4" />
            </button>
          </div>

          <p id={descriptionId} className="mt-4 text-xs leading-relaxed text-muted">
            {infoT("description")}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-2.5">
            <InfoItem label={infoT("categoryLabel")} value={infoT("category")} icon={<Cpu className="size-3 text-sky-400" />} />
            <InfoItem label={infoT("statusLabel")} value={infoT("status")} icon={<ShieldCheck className="size-3 text-emerald-400" />} />
          </dl>

          <InfoSection
            title={infoT("whatItDoes")}
            icon={<Wrench className="size-4 text-indigo-400" />}
            items={[infoT("what1"), infoT("what2"), infoT("what3")]}
          />

          <InfoSection
            title={infoT("howToUse")}
            icon={<Layers className="size-4 text-amber-400" />}
            items={[infoT("step1"), infoT("step2"), infoT("step3")]}
            ordered
          />

          {/* Capabilities & Boundaries */}
          <section className="mt-5 border-t border-border pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-sky-400" />
              {infoT("capabilitiesTitle")}
            </h3>

            {/* What it CAN do */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 shrink-0" />
                {infoT("canDoTitle")}
              </h4>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted leading-relaxed">
                <li>{infoT("canDo1")}</li>
                <li>{infoT("canDo2")}</li>
                <li>{infoT("canDo3")}</li>
                <li>{infoT("canDo4")}</li>
              </ul>
            </div>

            {/* What it CANNOT do */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Ban className="size-3.5 shrink-0" />
                {infoT("cannotDoTitle")}
              </h4>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted leading-relaxed">
                <li>{infoT("cannotDo1")}</li>
                <li>{infoT("cannotDo2")}</li>
                <li>{infoT("cannotDo3")}</li>
                <li>{infoT("cannotDo4")}</li>
              </ul>
            </div>
          </section>

          {/* MCP Tools Section */}
          <section className="mt-5 border-t border-border pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Terminal className="size-4 text-teal" />
              {infoT("mcpToolsTitle")}
            </h3>
            <div className="space-y-2">
              <ToolCard name={infoT("tool1Name")} desc={infoT("tool1Desc")} />
              <ToolCard name={infoT("tool2Name")} desc={infoT("tool2Desc")} />
              <ToolCard name={infoT("tool3Name")} desc={infoT("tool3Desc")} requiresApproval />
            </div>
          </section>

          <section className="mt-6 border-t border-border pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              {infoT("technologies")}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {[
                "Next.js 15",
                "React 19",
                "Microsoft Foundry",
                "Azure AI Projects",
                "Model Context Protocol",
                "Node.js MCP Server",
                "Human-in-the-Loop",
                "TypeScript",
                "Tailwind CSS 4",
                "Cosmos DB (Optional)",
              ].map((tech) => (
                <li
                  key={tech}
                  className="rounded-lg border border-border bg-panel-strong px-2.5 py-1 text-[11px] font-mono text-muted"
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
    <div className="min-w-0 rounded-xl border border-border bg-panel-strong p-3">
      <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-muted flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 break-words text-xs font-semibold text-text">{value}</dd>
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
  const List = ordered ? "ol" : "ul";
  return (
    <section className="mt-5 border-t border-border pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      <List className={`mt-2.5 space-y-2 pl-4 text-xs leading-relaxed text-muted ${ordered ? "list-decimal" : "list-disc"}`}>
        {items.map((item, idx) => (
          <li key={idx} className="pl-0.5">
            {item}
          </li>
        ))}
      </List>
    </section>
  );
}

function ToolCard({ name, desc, requiresApproval }: { name: string; desc: string; requiresApproval?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-panel-strong p-3">
      <div className="flex items-center justify-between gap-2">
        <code className="text-xs font-bold text-accent-bright font-mono">{name}</code>
        {requiresApproval && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-amber-500/30 text-amber-500 bg-amber-500/10">
            Approval required
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted leading-relaxed">{desc}</p>
    </div>
  );
}
