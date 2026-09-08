import fs from "fs";
import path from "path";
import { Locale, getDictionary } from "./i18n";

export interface AppSecurityMeta {
  publicDemo: boolean;
  rateLimited: boolean;
  storesUserContent: boolean;
}

export interface AppItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  status: "live" | "development" | "planned" | "building" | "testing" | "paused" | "archived";
  technologies: string[];
  liveUrl: string;
  repositoryPath: string;
  caseStudyPath: string;
  security: AppSecurityMeta;
}

export function resolveAppUrl(id: string, defaultUrl: string): string {
  const envKey = `NEXT_PUBLIC_APP_${id}_URL`;
  const envUrl = process.env[envKey];
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim();
  }
  return defaultUrl;
}

export function getAppCatalog(locale?: Locale): AppItem[] {
  const dict = getDictionary(locale);
  let baseApps: AppItem[] = [];

  try {
    const catalogPath = path.join(process.cwd(), "../../../catalog/apps.json");
    if (fs.existsSync(catalogPath)) {
      const content = fs.readFileSync(catalogPath, "utf-8");
      const parsed = jsonParse(content);
      baseApps = parsed.apps || [];
    }
  } catch {
    // Fallback if running standalone
  }

  if (baseApps.length === 0) {
    baseApps = [
      {
        id: "01",
        slug: "smart-inspector",
        title: "Smart Inspector",
        summary: "Multi-modal vision analysis, image tags, captioning, object detection, and OCR transcription via Azure OpenAI.",
        description: "Inspects uploaded images using Azure OpenAI Responses API.",
        category: "Vision & Multi-modal",
        status: "live",
        technologies: ["Next.js 14", "FastAPI", "Azure OpenAI", "Pillow"],
        liveUrl: "https://ai-engineer-roadmap-lyart.vercel.app",
        repositoryPath: "apps/01-smart-inspector",
        caseStudyPath: "smart-inspector.md",
        security: { publicDemo: true, rateLimited: true, storesUserContent: false },
      },
      {
        id: "02",
        slug: "support-bot",
        title: "Support Bot",
        summary: "Healthcare billing support assistant with Azure AI Language NLP analysis, PII masking, and FAQ grounding.",
        description: "Grounding healthcare billing FAQ with Azure AI Language & Agents.",
        category: "Conversational AI & RAG",
        status: "live",
        technologies: ["Next.js 16", "FastAPI", "Azure AI Language", "Azure AI Agents"],
        liveUrl: "https://suport-bot-hazel.vercel.app/",
        repositoryPath: "apps/02-support-bot",
        caseStudyPath: "support-bot.md",
        security: { publicDemo: true, rateLimited: true, storesUserContent: false },
      },
      {
        id: "03",
        slug: "prompt-forge",
        title: "Prompt Forge",
        summary: "Structured content generation workbench with Content Safety filtering, multi-persona prompt tuning, and real-time streaming.",
        description: "Generates structured marketing variations using personas and Azure Content Safety.",
        category: "Prompt Engineering & Content Gen",
        status: "live",
        technologies: ["Next.js 16", "FastAPI", "Azure OpenAI", "Azure Content Safety"],
        liveUrl: "https://prompt-forge-seven-tau.vercel.app/",
        repositoryPath: "apps/03-prompt-forge",
        caseStudyPath: "prompt-forge.md",
        security: { publicDemo: true, rateLimited: true, storesUserContent: false },
      },
      {
        id: "04",
        slug: "pocket-rag",
        title: "pocketRag",
        summary: "Local-first personal RAG knowledge base with persistent documents, multilingual retrieval, and inspectable citations.",
        description: "Indexes PDF, Markdown, TXT, and DOCX files locally and optionally generates grounded Azure OpenAI answers.",
        category: "Knowledge Base & RAG",
        status: "development",
        technologies: ["Next.js 15", "FastAPI", "ChromaDB", "Azure OpenAI"],
        liveUrl: "",
        repositoryPath: "apps/04-pocket-rag",
        caseStudyPath: "pocket-rag.md",
        security: { publicDemo: false, rateLimited: true, storesUserContent: true },
      },
    ];
  }

  // If locale dictionary has localized texts for apps, apply them
  return baseApps.map((app) => {
    const localizedData = dict.appsData?.[app.slug as keyof typeof dict.appsData];
    const liveUrl = resolveAppUrl(app.id, app.liveUrl);

    if (localizedData) {
      return {
        ...app,
        liveUrl,
        summary: localizedData.summary || app.summary,
        description: localizedData.description || app.description,
        category: localizedData.category || app.category,
      };
    }
    return {
      ...app,
      liveUrl,
    };
  });
}

function jsonParse(content: string) {
  return JSON.parse(content);
}

export function getAppBySlug(slug: string, locale?: Locale): AppItem | undefined {
  return getAppCatalog(locale).find((app) => app.slug === slug);
}

/**
 * Returns case study content. Checks for localized file (e.g. `smart-inspector.pt.md`),
 * and falls back explicitly to the default English markdown (`smart-inspector.md`).
 */
export function getCaseStudyContent(caseStudyPath: string, locale?: Locale): { content: string; isFallback: boolean } {
  try {
    const baseDir = path.join(process.cwd(), "../content");

    // Check localized file if locale is not default English
    if (locale && locale !== "en") {
      const ext = path.extname(caseStudyPath);
      const name = path.basename(caseStudyPath, ext);
      const localizedFileName = `${name}.${locale}${ext}`;
      const localizedPath = path.join(baseDir, localizedFileName);

      if (fs.existsSync(localizedPath)) {
        return {
          content: fs.readFileSync(localizedPath, "utf-8"),
          isFallback: false,
        };
      }
    }

    // Default English file
    const defaultPath = path.join(baseDir, caseStudyPath);
    if (fs.existsSync(defaultPath)) {
      return {
        content: fs.readFileSync(defaultPath, "utf-8"),
        isFallback: Boolean(locale && locale !== "en"),
      };
    }
  } catch {
    // Return fallback summary if file missing
  }

  return {
    content: `# Case Study\n\nContent currently being updated. Check back soon!`,
    isFallback: false,
  };
}
