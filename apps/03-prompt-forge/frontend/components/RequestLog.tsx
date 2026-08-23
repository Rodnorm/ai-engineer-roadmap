"use client";

import type { PersonaId, RequestEntry } from "@/components/PromptForge";
import { useT } from "@/lib/i18n/I18nProvider";

export default function RequestLog({ requests, onClear, personaName }: { requests: RequestEntry[]; onClear: () => void; personaName: (persona: PersonaId) => string }) {
  const t = useT("activity");
  const totalTokens = requests.reduce((total, request) => total + request.tokens, 0);
  const totalCost = requests.reduce((total, request) => total + request.cost, 0);

  return (
    <aside className="border-t border-border bg-sidebar px-4 py-8 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:border-l lg:border-t-0 lg:px-5" aria-labelledby="request-log-title">
      <div className="lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-3">
          <h2 id="request-log-title" className="text-sm font-semibold">{t("title")}</h2>
          <button type="button" onClick={onClear} disabled={requests.length === 0} className="text-xs font-medium text-muted transition hover:text-error disabled:cursor-not-allowed disabled:opacity-40">{t("clear")}</button>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-1 xl:grid-cols-3">
          <Metric label={t("requests")} value={String(requests.length)} />
          <Metric label={t("tokens")} value={totalTokens.toLocaleString()} />
          <Metric label={t("cost")} value={`$${totalCost.toFixed(4)}`} />
        </dl>

        {requests.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-border p-4">
            <p className="text-xs leading-relaxed text-muted">{t("empty")}</p>
          </div>
        ) : (
          <ol className="mt-5 space-y-3">
            {requests.map((request, index) => (
              <li key={request.id} className="rounded-xl border border-border bg-panel p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wide ${request.status === "complete" ? "text-success" : "text-amber-600 dark:text-amber-400"}`}>
                    <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                    {t(request.status)}
                  </span>
                  <time className="text-[0.65rem] text-muted">{request.createdAt}</time>
                </div>
                <p className="mt-2 truncate text-xs font-medium" title={request.brief}>{t("request", { number: requests.length - index })}: {request.brief}</p>
                <p className="mt-1 truncate text-[0.65rem] text-muted">{personaName(request.persona)}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[0.65rem] text-muted">
                  <span>{request.tokens.toLocaleString()} tokens</span>
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
  return <div className="rounded-xl border border-border bg-panel p-3"><dt className="text-[0.6rem] uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 font-mono text-sm font-semibold text-text">{value}</dd></div>;
}
