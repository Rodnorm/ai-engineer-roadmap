export const LOCALES = ["en", "pt", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "app07_locale";
export const LOCALE_STORAGE_KEY = "app07_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  de: "Deutsch",
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
  de: "DE",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  pt: "pt-BR",
  de: "de",
};

export function isValidLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value as Locale);
}

/**
 * Detects the most appropriate locale based on:
 * 1. Stored user preference in localStorage (if any)
 * 2. Browser preferences (navigator.languages / navigator.language)
 * 3. Default fallback (English)
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  // 1. Check saved user preference
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isValidLocale(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }

  // 2. Inspect browser languages
  const browserLanguages: readonly string[] =
    window.navigator.languages && window.navigator.languages.length > 0
      ? window.navigator.languages
      : [window.navigator.language || ""];

  for (const rawLang of browserLanguages) {
    if (!rawLang) continue;
    const lower = rawLang.toLowerCase();

    if (lower.startsWith("pt")) {
      return "pt";
    }
    if (lower.startsWith("de")) {
      return "de";
    }
    if (lower.startsWith("en")) {
      return "en";
    }
  }

  return DEFAULT_LOCALE;
}

const DE_ACTIONS: Record<string, string> = {
  "Initialize Heterogeneous Multi-Agent Pipeline": "Heterogene Multi-Agenten-Pipeline Initialisieren",
  "Plan Strategic Research Inquiry": "Strategische Rechercheuntersuchung Planen",
  "Finalize Research Dossier": "Recherche-Dossier Abschließen",
  "Execute Handoff Protocol (Researcher -> Writer)": "Handoff-Protokoll Ausführen (Researcher -> Writer)",
  "Ingest Research Dossier & Formulate Structure": "Recherche-Dossier Einlesen & Struktur Festlegen",
  "Synthesize Executive Document & Structure Callouts": "Executive-Dokument Synthetisieren & Handlungsempfehlungen",
  "Finalize Pipeline & Compile Telemetry": "Pipeline Abschließen & Telemetrie Erfassen",
  "Azure OpenAI Executive Drafting": "Management-Redaktion via Azure OpenAI",
  "Azure OpenAI Research Query & Synthesis": "Rechercheabfrage & Synthese via Azure OpenAI",
};

const PT_ACTIONS: Record<string, string> = {
  "Initialize Heterogeneous Multi-Agent Pipeline": "Inicializar Pipeline Multi-Agente Heterogêneo",
  "Plan Strategic Research Inquiry": "Planejar Investigação de Pesquisa Estratégica",
  "Finalize Research Dossier": "Finalizar Dossiê de Pesquisa",
  "Execute Handoff Protocol (Researcher -> Writer)": "Executar Protocolo de Handoff (Researcher -> Writer)",
  "Ingest Research Dossier & Formulate Structure": "Ingerir Dossiê de Pesquisa e Estruturar Briefing",
  "Synthesize Executive Document & Structure Callouts": "Sintetizar Documento Executivo e Recomendações",
  "Finalize Pipeline & Compile Telemetry": "Finalizar Pipeline e Compilar Telemetria",
  "Azure OpenAI Executive Drafting": "Redação Executiva via Azure OpenAI",
  "Azure OpenAI Research Query & Synthesis": "Pesquisa e Síntese via Azure OpenAI",
};

/**
 * Localizes trace step action strings to Portuguese or German.
 */
export function localizeStepAction(action: string, locale: Locale): string {
  if (locale === "de") {
    if (DE_ACTIONS[action]) return DE_ACTIONS[action];
    if (action.startsWith("Tool Call: ")) {
      return action.replace("Tool Call: ", "Werkzeugaufruf: ");
    }
  }

  if (locale === "pt") {
    if (PT_ACTIONS[action]) return PT_ACTIONS[action];
    if (action.startsWith("Tool Call: ")) {
      return action.replace("Tool Call: ", "Chamada de Ferramenta: ");
    }
  }

  return action;
}
