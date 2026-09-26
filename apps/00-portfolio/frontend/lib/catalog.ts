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
    const catalogPath = path.join(process.cwd(), "catalog/apps.json");
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
        liveUrl: "",
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
        liveUrl: "",
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
        liveUrl: "",
        repositoryPath: "apps/03-prompt-forge",
        caseStudyPath: "prompt-forge.md",
        security: { publicDemo: true, rateLimited: true, storesUserContent: false },
      },
      {
        id: "04",
        slug: "pocket-rag",
        title: "pocketRag",
        summary: "Private multilingual RAG knowledge base with SQLite vector storage, bundled example documents, and inspectable citations.",
        description: "Indexes PDF, Markdown, TXT, and DOCX files with Azure OpenAI embeddings and SQLite/NumPy cosine retrieval, then generates grounded answers with private access and cost controls.",
        category: "Knowledge Base & RAG",
        status: "development",
        technologies: ["Next.js 15", "FastAPI", "SQLite Vector", "Azure OpenAI"],
        liveUrl: "",
        repositoryPath: "apps/04-pocket-rag",
        caseStudyPath: "pocket-rag.md",
        security: { publicDemo: false, rateLimited: true, storesUserContent: true },
      },
      {
        id: "05",
        slug: "agentic-workflow",
        title: "Agentic Workflow",
        summary: "Autonomous agent execution loop with multi-tool calling, state machine persistence, and Human-in-the-Loop authorization.",
        description: "Agentic Workflow implements a ReAct loop with deterministic tool calling (calculator, knowledge search, and sensitive alerts) and mandatory Human-in-the-Loop authorization.",
        category: "Autonomous Agents & Tool Calling",
        status: "live",
        technologies: ["Next.js 15", "FastAPI", "Azure OpenAI", "ReAct Loop"],
        liveUrl: "",
        repositoryPath: "apps/05-agentic-workflow",
        caseStudyPath: "agentic-workflow.md",
        security: { publicDemo: false, rateLimited: true, storesUserContent: false },
      },
      {
        id: "06",
        slug: "agent-workspace",
        title: "Agent Workspace",
        summary: "Streaming AI agent workspace with Foundry Agent Service, typed MCP tools, approval gates, and durable conversations.",
        description: "Agent Workspace connects a Next.js streaming chat to Azure AI Foundry Agent Service and a Node.js MCP server.",
        category: "AI Agents & MCP",
        status: "live",
        technologies: ["Next.js 15", "Azure AI Foundry", "MCP", "Cosmos DB"],
        liveUrl: "",
        repositoryPath: "apps/06-agent-workspace",
        caseStudyPath: "agent-workspace.md",
        security: { publicDemo: false, rateLimited: true, storesUserContent: true },
      },
      {
        id: "07",
        slug: "brief-generator",
        title: "Brief Generator",
        summary: "Heterogeneous multi-agent research and synthesis engine producing structured executive briefings with audit trails.",
        description: "Multi-Agent Brief Generator decouples information discovery and executive synthesis into two specialized agents: a tool-using Researcher and a zero-tool Writer. Includes real-time SSE handoff tracing, deterministic offline engine, and signed session isolation.",
        category: "Multi-Agent Systems & Orchestration",
        status: "live",
        technologies: ["Next.js 15", "Azure OpenAI", "Multi-Agent Handoff", "SSE Streaming"],
        liveUrl: "",
        repositoryPath: "apps/07-brief-generator",
        caseStudyPath: "brief-generator.md",
        security: { publicDemo: true, rateLimited: true, storesUserContent: false },
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
    const baseDir = path.join(process.cwd(), "content");

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
