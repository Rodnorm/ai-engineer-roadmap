"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

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

const PERSONAS: Array<{ id: PersonaId; icon: string; accentColor: string; tag: string }> = [
  { id: "friendly", icon: "✦", accentColor: "#38bdf8", tag: "B2B_GROWTH" },
  { id: "technical", icon: "</>", accentColor: "#10b981", tag: "ENG_DEEPDIVE" },
  { id: "cfo", icon: "%", accentColor: "#f59e0b", tag: "ROI_SCRUTINY" },
];

type GenerateResponse = {
  data: { variations: Array<Omit<Variation, "tokens" | "cost">> };
  meta: { tokens: { total: number }; cost: number };
};

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

function createLocalRequestId(): string {
  return typeof window.crypto?.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `request-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatRequestTime(): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

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
  const localizedSuggestions = promptSuggestions.map((suggestion) => ({
    id: suggestion.id,
    ...suggestion.translations[locale],
  }));

  const handleDeleteRequest = (id: string) => {
    setRequests((current) => current.filter((item) => item.id !== id));
  };

  const handleClearRequests = () => {
    setRequests([]);
  };

  useEffect(() => () => {
    abortRef.current?.abort();
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
        headers: {
          "Content-Type": "application/json",
        },
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
      setRequests((current) => [
        {
          id: createLocalRequestId(),
          brief: trimmedBrief,
          persona,
          tokens: payload.meta.tokens.total,
          cost: payload.meta.cost,
          status: "complete" as const,
          createdAt: formatRequestTime(),
        },
        ...current,
      ].slice(0, 20));
    } catch (requestError) {
      if (!(requestError instanceof DOMException && requestError.name === "AbortError")) {
        setError("api");
        setRequests((current) => [
          {
            id: createLocalRequestId(),
            brief: trimmedBrief,
            persona,
            tokens: 0,
            cost: 0,
            status: "error" as const,
            createdAt: formatRequestTime(),
          },
          ...current,
        ].slice(0, 20));
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
        id: createLocalRequestId(),
        brief: brief.trim(),
        persona,
        tokens,
        cost,
        status: "cancelled",
        createdAt: formatRequestTime(),
      },
      ...current,
    ]);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="sticky top-0 z-40 border-b border-border bg-panel/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#main-content" className="group flex items-center gap-2.5 rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-accent">
            <span className="flex size-7 items-center justify-center rounded-xs border border-accent bg-accent/15 font-mono text-xs font-bold text-accent">
              PF
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
              PROMPT_FORGE <span className="text-muted text-[0.65rem]">{"// STUDIO v3.0"}</span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-xs border border-border bg-surface px-2.5 py-1 font-mono text-[0.65rem] text-muted md:inline-flex">
              <span className="size-1 rounded-full bg-accent" aria-hidden="true" />
              {t("previewBadge")}
            </span>
            <AppInfo />
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <section className="max-w-3xl">
              <p className="label">{t("eyebrow")}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
                {t("title")}{" "}
                <span className="text-accent underline decoration-accent/40 decoration-2 underline-offset-8">
                  {t("titleAccent")}
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted">{t("intro")}</p>
            </section>

            <form onSubmit={submit} className="studio-card mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <label htmlFor="brief" className="field-label">{t("briefLabel")}</label>
                  <p className="mt-0.5 text-xs text-muted">{t("briefHint")}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 font-mono text-[0.65rem] font-medium ${
                  error === "safety"
                    ? "border-error bg-error/10 text-error"
                    : "border-border bg-surface text-muted"
                }`}>
                  <ShieldIcon />
                  <span className="truncate">{error === "safety" ? t("safetyBlocked") : "[CONTENT_SAFETY: ACTIVE]"}</span>
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
                rows={5}
                aria-invalid={error !== null}
                aria-describedby={error || hasSafetyAnalysis ? "brief-error" : undefined}
                placeholder={t("briefPlaceholder")}
                className="field-control mt-4 min-h-32 resize-y font-mono text-xs leading-relaxed"
              />

              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">{t("suggestionsLabel")}</p>
                  <button
                    type="button"
                    aria-expanded={showAllSuggestions}
                    onClick={() => setShowAllSuggestions((current) => !current)}
                    className="font-mono text-[0.65rem] uppercase text-accent transition hover:text-accent-strong focus-visible:outline-none"
                  >
                    [ {showAllSuggestions ? t("fewerExamples") : t("moreExamples")} ]
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(showAllSuggestions ? localizedSuggestions : localizedSuggestions.slice(0, INITIAL_SUGGESTION_COUNT)).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => {
                        setBrief(suggestion.prompt);
                        setSafetyCategories({});
                        if (error) setError(null);
                      }}
                      className="rounded-xs border border-border bg-surface px-2.5 py-1 font-mono text-[0.7rem] text-muted transition hover:border-accent hover:text-text focus-visible:outline-none"
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
                  className={`mt-4 rounded-xs border p-3 font-mono text-xs ${
                    error === "safety"
                      ? "border-error bg-error/10 text-error"
                      : hasDetectedContent
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                      : "border-success/50 bg-success/10 text-success"
                  }`}
                >
                  <p className="flex items-center gap-2 font-semibold">
                    <ShieldIcon />
                    {error === "safety" ? t("safetyBlocked") : hasDetectedContent ? t("safetyAnalysis") : t("safetyPassed")}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-muted">{error === "safety" ? t("safetyBlockedDescription") : hasDetectedContent ? t("safetyDetectedDescription") : t("safetyPassedDescription")}</p>
                  {hasDetectedContent && (
                    <div className="mt-3 space-y-1.5">
                      {detectedSafetyCategories.map(([category, severity]) => (
                        <div key={category} className="flex flex-wrap items-center justify-between gap-2 border border-current/20 p-2 text-[0.7rem]">
                          <span className="font-medium">{safetyCategoryName(category)}</span>
                          <span className="bg-current/10 px-1.5 py-0.5">{t("safetySeverity", { value: severity })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : error ? (
                <p id="brief-error" role="alert" className="mt-2 font-mono text-xs text-error">{error === "api" ? t("apiError") : t("briefError")}</p>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="audience" className="field-label">{t("audienceLabel")}</label>
                  <input
                    id="audience"
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    placeholder={t("audiencePlaceholder")}
                    className="field-control mt-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="format" className="field-label">{t("formatLabel")}</label>
                  <select
                    id="format"
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                    className="field-control mt-1.5 cursor-pointer font-mono text-xs"
                  >
                    <option value="linkedin">{t("formatLinkedIn")}</option>
                    <option value="email">{t("formatEmail")}</option>
                    <option value="landing">{t("formatLanding")}</option>
                  </select>
                </div>
              </div>

              <fieldset className="mt-6">
                <legend className="field-label">{t("personaLabel")}</legend>
                <p className="mt-0.5 text-xs text-muted">{t("personaHint")}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label={t("personaLabel")}>
                  {PERSONAS.map((item) => {
                    const selected = persona === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setPersona(item.id)}
                        className={`persona-card ${selected ? "persona-card-selected" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="flex size-7 items-center justify-center rounded-xs font-mono text-xs font-bold"
                            style={{ backgroundColor: `${item.accentColor}18`, color: item.accentColor }}
                          >
                            {item.icon}
                          </span>
                          <span
                            className="rounded-xs border px-1.5 py-0.5 font-mono text-[0.6rem]"
                            style={{ borderColor: `${item.accentColor}40`, color: item.accentColor }}
                          >
                            [{item.tag}]
                          </span>
                        </div>
                        <span className="mt-2.5 block text-xs font-semibold text-text">{personaName(item.id)}</span>
                        <span className="mt-1 block text-[0.7rem] leading-relaxed text-muted">{personaDescription(item.id)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <details className="mt-5 rounded-xs border border-border bg-surface/50 p-3.5">
                <summary className="cursor-pointer list-none font-mono text-xs font-medium uppercase tracking-wider text-text marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    <span>{t("advanced")}</span>
                    <SettingsIcon />
                  </span>
                </summary>
                <div className="mt-4 grid gap-5 border-t border-border pt-4 md:grid-cols-3">
                  <RangeControl id="temperature" label={t("temperature")} hint={t("temperatureHint")} value={temperature} min={0} max={1.5} step={0.1} onChange={setTemperature} />
                  <RangeControl id="top-p" label={t("topP")} hint={t("topPHint")} value={topP} min={0.1} max={1} step={0.1} onChange={setTopP} />
                  <RangeControl id="max-tokens" label={t("maxTokens")} hint={t("maxTokensHint")} value={maxTokens} min={200} max={1600} step={100} onChange={setMaxTokens} />
                </div>
              </details>

              <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
                <p className="font-mono text-[0.65rem] text-muted">{t("sampleNotice")}</p>
                {isGenerating ? (
                  <button type="button" onClick={stopGeneration} className="btn-secondary gap-2">
                    <StopIcon /> [ ■ {t("stop")} ]
                  </button>
                ) : (
                  <button type="submit" className="btn-primary gap-2">
                    <SparklesIcon /> [ {t("generate")} ↵ ]
                  </button>
                )}
              </div>

              {isGenerating && (
                <div className="mt-4 border-t border-border pt-3" role="status" aria-live="polite">
                  <div className="flex items-center justify-between font-mono text-[0.65rem] text-muted">
                    <span>{t("generating", { current: Math.min(progress + 1, 3) })}</span>
                    <span>{Math.round((progress / 3) * 100)}%</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-none border border-border bg-surface">
                    <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(progress / 3) * 100}%` }} />
                  </div>
                </div>
              )}
            </form>

            <GenerationResults results={results} isGenerating={isGenerating} personaName={personaName(persona)} />
          </div>
        </div>

        <RequestLog
          requests={requests}
          onClear={handleClearRequests}
          onDelete={handleDeleteRequest}
          personaName={personaName}
        />
      </main>
    </div>
  );
}

function RangeControl({ id, label, hint, value, min, max, step, onChange }: { id: string; label: string; hint: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="font-mono text-[0.7rem] uppercase tracking-wider text-text">{label}</label>
        <output htmlFor={id} className="rounded-xs border border-border bg-panel px-1.5 py-0.5 font-mono text-[0.65rem] text-accent">
          {value.toFixed(1)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-accent cursor-pointer"
      />
      <p className="mt-1 font-mono text-[0.65rem] leading-relaxed text-muted">{hint}</p>
    </div>
  );
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 shrink-0" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

function SettingsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5 text-muted" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>;
}

function SparklesIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true"><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3ZM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 14l-.8 2.2L16 17l2.2.8L19 20l.8-2.2L22 17l-2.2-.8L19 14Z" /></svg>;
}

function StopIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="size-3" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>;
}
