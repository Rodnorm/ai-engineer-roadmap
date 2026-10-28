"use client";

import type { PersonaId, RequestEntry } from "@/components/PromptForge";
import { useT } from "@/lib/i18n/I18nProvider";

export default function RequestLog({
  requests,
  onClear,
  onDelete,
  personaName,
}: {
  requests: RequestEntry[];
  onClear: () => void;
  onDelete?: (id: string) => void;
  personaName: (persona: PersonaId) => string;
}) {
  const t = useT("activity");
  const totalTokens = requests.reduce((total, request) => total + request.tokens, 0);
  const totalCost = requests.reduce((total, request) => total + request.cost, 0);

  return (
    <aside className="border-t border-border bg-sidebar px-4 py-8 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:border-l lg:border-t-0 lg:px-5" aria-labelledby="request-log-title">
      <div className="lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            <h2 id="request-log-title" className="font-mono text-xs font-semibold uppercase tracking-wider text-text">{t("title")}</h2>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={requests.length === 0}
            className="font-mono text-[0.65rem] uppercase text-muted transition hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
          >
            [ {t("clear")} ]
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-1 xl:grid-cols-3">
          <Metric label={t("requests")} value={String(requests.length)} />
          <Metric label={t("tokens")} value={totalTokens.toLocaleString()} />
          <Metric label={t("cost")} value={`$${totalCost.toFixed(4)}`} />
        </dl>

        {requests.length === 0 ? (
          <div className="mt-5 rounded-sm border border-dashed border-border p-4 text-center">
            <p className="font-mono text-xs text-muted">{t("empty")}</p>
          </div>
        ) : (
          <ol className="mt-5 space-y-2.5">
            {requests.map((request, index) => (
              <li key={request.id} className="group rounded-sm border border-border bg-panel p-3 transition hover:border-accent/40">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide ${request.status === "complete" ? "text-success" : request.status === "error" ? "text-error" : "text-amber-500"}`}>
                    <span className="size-1 rounded-full bg-current" aria-hidden="true" />
                    {t(request.status)}
                  </span>
                  <div className="flex items-center gap-2">
                    <time className="font-mono text-[0.65rem] text-muted">{request.createdAt}</time>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(request.id)}
                        className="rounded-xs p-1 text-muted transition hover:bg-surface hover:text-error focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                        title={t("delete")}
                        aria-label={`${t("delete")} - ${request.brief}`}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 truncate font-mono text-xs text-text" title={request.brief}>
                  <span className="text-muted">#{requests.length - index}:</span> {request.brief}
                </p>
                <div className="mt-1">
                  <span className="inline-block rounded-xs border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.6rem] text-muted">
                    {personaName(request.persona)}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 font-mono text-[0.65rem] text-muted">
                  <span>{request.tokens.toLocaleString()} tok</span>
                  <span>${request.cost.toFixed(4)}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-panel p-2.5">
      <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-xs font-semibold text-text">{value}</dd>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3" aria-hidden="true">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
    </svg>
  );
}
