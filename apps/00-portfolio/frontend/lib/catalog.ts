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
        summary: "Image caption, tags, objects and OCR in structured JSON.",
        description: "Azure OpenAI image analysis with Pillow validation and metadata stripping. Product price/link fields are model-generated, not live shopping results.",
        category: "Vision & Multi-modal",
        status: "live",
        technologies: ["Next.js 16", "FastAPI", "Azure OpenAI", "Pillow"],
        liveUrl: "",
        repositoryPath: "apps/01-smart-inspector",
        caseStudyPath: "smart-inspector.md",
        security: { publicDemo: true, rateLimited: true, storesUserContent: false },
      },
      {
        id: "02",
        slug: "support-bot",
        title: "Support Bot",
        summary: "FAQ assistant with keyword retrieval and Azure language analysis.",
        description: "Foundry agent answers grounded in a bundled FAQ. Returned PII entities are masked; the original question still goes to Azure. No vector search or persistent conversation service.",
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
        summary: "Structured marketing variations with personas, SSE and safety checks.",
        description: "Azure OpenAI generation with Content Safety required in production and a limited development heuristic. Request history is held in browser state.",
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
        summary: "Document retrieval and cited answers with local storage and cloud embeddings.",
        description: "PDF, Markdown, TXT and DOCX ingestion; SQLite/NumPy retrieval and Azure embeddings/generation. Owner-scoped uploads expire after 30 minutes by default.",
        category: "Knowledge Base & RAG",
        status: "development",
        technologies: ["Next.js 15", "FastAPI", "SQLite / NumPy", "Azure OpenAI"],
        liveUrl: "",
        repositoryPath: "apps/04-pocket-rag",
        caseStudyPath: "pocket-rag.md",
        security: { publicDemo: false, rateLimited: true, storesUserContent: true },
      },
      {
        id: "05",
        slug: "agentic-workflow",
        title: "Agentic Workflow",
        summary: "Bounded agent loop with local tools and human approval.",
        description: "Offline planner or Azure model with calculator, bundled knowledge lookup and approval-gated simulated alerts. Token-protected sessions remain in memory.",
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
        summary: "Streaming chat with four MCP tools and human-approved writes.",
        description: "Offline or Foundry adapter. Conversations are owner-scoped in memory or optional Cosmos DB; MCP tasks and notes share a workspace store.",
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
        summary: "Researcher-to-writer handoff with a structured dossier and SSE trace.",
        description: "Offline fixtures or Azure generation. No web research or independent fact verification; source labels and metrics are fixtures or model output. Brief history is process-local.",
        category: "Multi-Agent Systems & Orchestration",
        status: "live",
        technologies: ["Next.js 15", "Azure OpenAI", "Multi-Agent Handoff", "SSE Streaming"],
        liveUrl: "",
        repositoryPath: "apps/07-brief-generator",
        caseStudyPath: "brief-generator.md",
        security: { publicDemo: true, rateLimited: true, storesUserContent: false },
      },
      {
        id: "08",
        slug: "ai-ops-deployment",
        title: "AI Ops & Deployment Studio",
        summary: "Inference routing and resilience experiments with canary and rollback rules.",
        description: "In-process lab with offline simulation or Azure calls, chaos scenarios and session metrics. Does not deploy infrastructure or control external production traffic.",
        category: "AI Deployment, Observability & AIOps",
        status: "live",
        technologies: ["Next.js 15", "Azure OpenAI", "Canary Routing", "AIOps Observability"],
        liveUrl: "",
        repositoryPath: "apps/08-ai-ops-deployment",
        caseStudyPath: "ai-ops-deployment.md",
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

