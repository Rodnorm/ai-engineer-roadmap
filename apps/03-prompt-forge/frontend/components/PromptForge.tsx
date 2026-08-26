"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import AppInfo from "@/components/AppInfo";
import GenerationResults from "@/components/GenerationResults";
import LangSwitcher from "@/components/LangSwitcher";
import RequestLog from "@/components/RequestLog";
import ThemeToggle from "@/components/ThemeToggle";
import promptSuggestions from "@/data/prompt-suggestions.json";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

export type PersonaId = "friendly" | "technical" | "cfo";
export type RequestStatus = "complete" | "cancelled" | "error";

export type Variation = {
  id: number;
  title: string;
  body: string;
  seoKeywords: string[];
  tokens: number;
  cost: number;
};

export type RequestEntry = {
  id: string;
  brief: string;
  persona: PersonaId;
  tokens: number;
  cost: number;
  status: RequestStatus;
  createdAt: string;
};

const PERSONAS: Array<{ id: PersonaId; icon: string }> = [
  { id: "friendly", icon: "✦" },
  { id: "technical", icon: "</>" },
  { id: "cfo", icon: "%" },
];

type GenerateResponse = {
  data: { variations: Array<Omit<Variation, "tokens" | "cost">> };
  meta: { tokens: { total: number }; cost: number };
};

type LogResponse = { data: RequestEntry[] };

const TYPEWRITER_INTERVAL_MS = 12;
const TYPEWRITER_CHARACTERS_PER_TICK = 1;
const INITIAL_SUGGESTION_COUNT = 4;

async function readGenerationStream(
  response: Response,
  onDelta: (receivedCharacters: number) => void,
  onVariation: (variation: Omit<Variation, "tokens" | "cost">) => void,
  onSafety: (categories: Record<string, number>) => void,
): Promise<GenerateResponse> {
  if (!response.body) throw new Error("Streaming is not supported by this response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedCharacters = 0;
  let result: GenerateResponse | null = null;

  const processFrame = (frame: string) => {
    const event = frame.split("\n").find((line) => line.startsWith("event: "))?.slice(7);
    const data = frame.split("\n").filter((line) => line.startsWith("data: ")).map((line) => line.slice(6)).join("\n");
    if (!event || !data) return;

    const payload = JSON.parse(data) as GenerateResponse | {
      text?: string;
      message?: string;
      variation?: Omit<Variation, "tokens" | "cost">;
      categories?: Record<string, number>;
    };
    if (event === "safety" && "categories" in payload) {
      onSafety(payload.categories ?? {});
    } else if (event === "delta") {
      receivedCharacters += "text" in payload ? payload.text?.length ?? 0 : 0;
      onDelta(receivedCharacters);
    } else if (event === "variation" && "variation" in payload && payload.variation) {
      onVariation(payload.variation);
    } else if (event === "result") {
      result = payload as GenerateResponse;
    } else if (event === "error") {
      throw new Error("message" in payload ? payload.message : "Generation stream failed.");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    frames.forEach(processFrame);
    if (done) break;
  }
  if (buffer.trim()) processFrame(buffer);
  if (!result) throw new Error("Generation stream ended without a result.");
  return result;
}

const formatLogEntries = (entries: RequestEntry[]) => entries.map((entry) => ({
  ...entry,
  createdAt: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(entry.createdAt)),
}));

export default function PromptForge() {
  const { locale } = useI18n();
  const t = useT("studio");
  const personasT = useT("personas");

  const [brief, setBrief] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("linkedin");
  const [persona, setPersona] = useState<PersonaId>("friendly");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(700);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [results, setResults] = useState<Variation[]>([]);
  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<"brief" | "safety" | "api" | null>(null);
  const [safetyCategories, setSafetyCategories] = useState<Record<string, number>>({});
  const abortRef = useRef<AbortController | null>(null);
  const detectedSafetyCategories = Object.entries(safetyCategories).filter(([, severity]) => severity > 0);
  const hasSafetyAnalysis = Object.keys(safetyCategories).length > 0;
  const hasDetectedContent = detectedSafetyCategories.length > 0;

  const loadRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/backend/log?limit=20");
      if (!response.ok) return;
      const payload = (await response.json()) as LogResponse;
      setRequests(formatLogEntries(payload.data));
    } catch {
      // The studio remains usable when the process-local log is unavailable.
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/backend/log?limit=20")
      .then((response) => response.ok ? response.json() as Promise<LogResponse> : null)
      .then((payload) => {
        if (active && payload) setRequests(formatLogEntries(payload.data));
      })
      .catch(() => undefined);

    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, []);

  const personaName = (id: PersonaId) => {
    if (id === "friendly") return personasT("friendlyName");
    if (id === "technical") return personasT("technicalName");
    return personasT("cfoName");
  };

  const personaDescription = (id: PersonaId) => {
    if (id === "friendly") return personasT("friendlyDescription");
    if (id === "technical") return personasT("technicalDescription");
    return personasT("cfoDescription");
  };

  const safetyCategoryName = (category: string) => {
    if (category === "hate") return t("safetyCategoryHate");
    if (category === "self_harm") return t("safetyCategorySelfHarm");
    if (category === "sexual") return t("safetyCategorySexual");
    if (category === "violence") return t("safetyCategoryViolence");
    return category.replaceAll("_", " ");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedBrief = brief.trim();

    if (trimmedBrief.length < 20) {
      setError("brief");
      return;
    }

    setError(null);
    setSafetyCategories({});
    setResults([]);
    setProgress(0);
    setIsGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const typingTasks: Promise<void>[] = [];

    const typeVariation = (variation: Omit<Variation, "tokens" | "cost">) => {
      const completeText = `${variation.title}\n${variation.body}`;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setResults((current) => [
          ...current.filter((item) => item.id !== variation.id),
          { ...variation, tokens: 0, cost: 0 },
        ].sort((left, right) => left.id - right.id));
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        let visibleCharacters = 0;
        const finish = () => {
          window.clearInterval(timer);
          controller.signal.removeEventListener("abort", cancel);
          resolve();
        };
        const cancel = () => finish();
        const timer = window.setInterval(() => {
          visibleCharacters = Math.min(
            visibleCharacters + TYPEWRITER_CHARACTERS_PER_TICK,
            completeText.length,
          );
          const visibleText = completeText.slice(0, visibleCharacters);
          const titleComplete = visibleCharacters > variation.title.length;
          const partialVariation: Variation = {
            ...variation,
            title: visibleText.slice(0, Math.min(visibleCharacters, variation.title.length)),
            body: titleComplete ? visibleText.slice(variation.title.length + 1) : "",
            seoKeywords: visibleCharacters === completeText.length ? variation.seoKeywords : [],
            tokens: 0,
            cost: 0,
          };
          setResults((current) => [
            ...current.filter((item) => item.id !== variation.id),
            partialVariation,
          ].sort((left, right) => left.id - right.id));
          if (visibleCharacters === completeText.length) finish();
        }, TYPEWRITER_INTERVAL_MS);
        controller.signal.addEventListener("abort", cancel, { once: true });
      });
    };

    try {
      const response = await fetch("/api/backend/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmedBrief, audience: audience.trim() || null, format, persona, language: locale, temperature, topP, maxTokens }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null) as {
          detail?: { code?: string; categories?: Record<string, number> };
        } | null;
        if (response.status === 400 && errorPayload?.detail?.code === "unsafe_content") {
          setSafetyCategories(errorPayload.detail.categories ?? {});
          setError("safety");
          return;
        }
        throw new Error("Generation failed");
      }

      const payload = await readGenerationStream(
        response,
        () => setProgress((current) => Math.max(current, 1)),
        (variation) => {
          typingTasks.push(typeVariation(variation));
          setProgress(variation.id);
        },
        setSafetyCategories,
      );
      await Promise.all(typingTasks);
      if (controller.signal.aborted) return;
      const variationCount = payload.data.variations.length || 1;
      setResults(payload.data.variations.map((variation) => ({
        ...variation,
        tokens: Math.round(payload.meta.tokens.total / variationCount),
        cost: payload.meta.cost / variationCount,
      })));
      setProgress(3);
      await loadRequests();
    } catch (requestError) {
      if (!(requestError instanceof DOMException && requestError.name === "AbortError")) {
        setError("api");
        await loadRequests();
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsGenerating(false);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    const tokens = results.reduce((total, item) => total + item.tokens, 0);
    const cost = results.reduce((total, item) => total + item.cost, 0);

    setRequests((current) => [
      {
        id: crypto.randomUUID(),
        brief: brief.trim(),
        persona,
        tokens,
        cost,
        status: "cancelled",
        createdAt: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      },
      ...current,
    ]);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="sticky top-0 z-40 border-b border-border bg-panel/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#main-content" className="group flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-pink-500 text-sm font-bold text-white shadow-sm">AI</span>
            <span>
              <span className="block text-sm font-semibold tracking-tight">{t("eyebrow")}</span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted md:inline-flex">
              <span className="size-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              {t("previewBadge")}
            </span>
            <AppInfo />
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <section className="max-w-3xl">
              <p className="label">{t("eyebrow")}</p>
              <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                {t("title")} <span className="gradient-text">{t("titleAccent")}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{t("intro")}</p>
            </section>

            <form onSubmit={submit} className="studio-card mt-10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <label htmlFor="brief" className="field-label">{t("briefLabel")}</label>
                  <p className="mt-1 text-xs text-muted">{t("briefHint")}</p>
                </div>
                <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${error === "safety" ? "bg-red-50 text-error dark:bg-red-950/40" : "bg-emerald-50 text-success dark:bg-emerald-950/40"}`}>
                  <ShieldIcon />
                  <span className="truncate">{error === "safety" ? t("safetyBlocked") : t("safetyReady")}</span>
                </span>
              </div>

              <textarea
                id="brief"
                value={brief}
                onChange={(event) => {
                  setBrief(event.target.value);
                  setSafetyCategories({});
                  if (error) setError(null);
                }}
                rows={6}
                aria-invalid={error !== null}
                aria-describedby={error || hasSafetyAnalysis ? "brief-error" : undefined}
                placeholder={t("briefPlaceholder")}
                className="field-control mt-4 min-h-36 resize-y"
              />
              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-muted">{t("suggestionsLabel")}</p>
                  <button
                    type="button"
                    aria-expanded={showAllSuggestions}
                    onClick={() => setShowAllSuggestions((current) => !current)}
                    className="text-xs font-medium text-sky-500 transition hover:text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
                  >
                    {showAllSuggestions ? t("fewerExamples") : t("moreExamples")}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(showAllSuggestions ? promptSuggestions : promptSuggestions.slice(0, INITIAL_SUGGESTION_COUNT)).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => {
                        setBrief(suggestion.prompt);
                        setSafetyCategories({});
                        if (error) setError(null);
                      }}
                      className="rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-muted transition hover:border-sky-500/60 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
              {error === "safety" || hasSafetyAnalysis ? (
                <div
                  id="brief-error"
                  role={error === "safety" ? "alert" : "status"}
                  className={`mt-3 rounded-xl border p-4 text-sm ${error === "safety" ? "border-red-300 bg-red-50 text-error dark:border-red-900 dark:bg-red-950/40" : hasDetectedContent ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300" : "border-emerald-300 bg-emerald-50 text-success dark:border-emerald-900 dark:bg-emerald-950/40"}`}
                >
                  <p className="flex items-center gap-2 font-semibold"><ShieldIcon />{error === "safety" ? t("safetyBlocked") : hasDetectedContent ? t("safetyAnalysis") : t("safetyPassed")}</p>
                  <p className="mt-1 text-xs">{error === "safety" ? t("safetyBlockedDescription") : hasDetectedContent ? t("safetyDetectedDescription") : t("safetyPassedDescription")}</p>
                  {hasDetectedContent && (
                    <div className="mt-3 space-y-2">
                      {detectedSafetyCategories.map(([category, severity]) => (
                        <div key={category} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-current/20 px-3 py-2 text-xs">
                          <span className="font-medium">{safetyCategoryName(category)}</span>
                          <span className="rounded-full bg-current/10 px-2 py-1 font-medium">{t("safetySeverity", { value: severity })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : error ? (
                <p id="brief-error" role="alert" className="mt-2 text-sm text-error">{error === "api" ? t("apiError") : t("briefError")}</p>
              ) : null}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="audience" className="field-label">{t("audienceLabel")}</label>
                  <input id="audience" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder={t("audiencePlaceholder")} className="field-control mt-2" />
                </div>
                <div>
                  <label htmlFor="format" className="field-label">{t("formatLabel")}</label>
                  <select id="format" value={format} onChange={(event) => setFormat(event.target.value)} className="field-control mt-2 cursor-pointer">
                    <option value="linkedin">{t("formatLinkedIn")}</option>
                    <option value="email">{t("formatEmail")}</option>
                    <option value="landing">{t("formatLanding")}</option>
                  </select>
                </div>
              </div>

              <fieldset className="mt-7">
                <legend className="field-label">{t("personaLabel")}</legend>
                <p className="mt-1 text-xs text-muted">{t("personaHint")}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label={t("personaLabel")}>
                  {PERSONAS.map((item) => {
                    const selected = persona === item.id;
                    return (
                      <button key={item.id} type="button" role="radio" aria-checked={selected} onClick={() => setPersona(item.id)} className={`persona-card ${selected ? "persona-card-selected" : ""}`}>
                        <span className="flex size-8 items-center justify-center rounded-lg bg-surface font-mono text-xs font-semibold text-accent-strong">{item.icon}</span>
                        <span className="mt-3 block text-sm font-semibold text-text">{personaName(item.id)}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted">{personaDescription(item.id)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <details className="mt-6 rounded-xl border border-border bg-surface/70 p-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-text marker:hidden">
                  <span className="flex items-center justify-between gap-4">{t("advanced")}<SettingsIcon /></span>
                </summary>
                <div className="mt-5 grid gap-6 border-t border-border pt-5 md:grid-cols-3">
                  <RangeControl id="temperature" label={t("temperature")} hint={t("temperatureHint")} value={temperature} min={0} max={1.5} step={0.1} onChange={setTemperature} />
                  <RangeControl id="top-p" label={t("topP")} hint={t("topPHint")} value={topP} min={0.1} max={1} step={0.1} onChange={setTopP} />
                  <RangeControl id="max-tokens" label={t("maxTokens")} hint={t("maxTokensHint")} value={maxTokens} min={200} max={1600} step={100} onChange={setMaxTokens} />
                </div>
              </details>

              <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-xs text-muted">{t("sampleNotice")}</p>
                {isGenerating ? (
                  <button type="button" onClick={stopGeneration} className="btn-secondary gap-2"><StopIcon /> {t("stop")}</button>
                ) : (
                  <button type="submit" className="btn-primary gap-2"><SparklesIcon /> {t("generate")}</button>
                )}
              </div>

              {isGenerating && (
                <div className="mt-4" role="status" aria-live="polite">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{t("generating", { current: Math.min(progress + 1, 3) })}</span>
                    <span>{Math.round((progress / 3) * 100)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-pink-500 transition-all duration-500" style={{ width: `${(progress / 3) * 100}%` }} />
                  </div>
                </div>
              )}
            </form>

            <GenerationResults results={results} isGenerating={isGenerating} personaName={personaName(persona)} />
          </div>
        </div>

        <RequestLog requests={requests} onClear={() => setRequests([])} personaName={personaName} />
      </main>
    </div>
  );
}

function RangeControl({ id, label, hint, value, min, max, step, onChange }: { id: string; label: string; hint: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-text">{label}</label>
        <output htmlFor={id} className="rounded-md border border-border bg-panel px-2 py-1 font-mono text-[0.65rem] text-muted">{value}</output>
      </div>
      <input id={id} type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-sky-500" />
      <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">{hint}</p>
    </div>
  );
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 shrink-0" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

function SettingsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4 text-muted" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>;
}

function SparklesIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true"><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3ZM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 14l-.8 2.2L16 17l2.2.8L19 20l.8-2.2L22 17l-2.2-.8L19 14Z" /></svg>;
}

function StopIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
}
