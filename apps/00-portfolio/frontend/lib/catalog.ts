import fs from "fs";
import path from "path";

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

export function getAppCatalog(): AppItem[] {
  try {
    const catalogPath = path.join(process.cwd(), "../../catalog/apps.json");
    if (fs.existsSync(catalogPath)) {
      const content = fs.readFileSync(catalogPath, "utf-8");
      const parsed = jsonParse(content);
      return parsed.apps || [];
    }
  } catch {
    // Fallback if running standalone
  }
  return [
    {
      id: "01",
      slug: "smart-inspector",
      title: "Smart Inspector",
      summary: "Multi-modal vision analysis, image tags, captioning, object detection, and OCR transcription via Azure OpenAI.",
      description: "Inspects uploaded images using Azure OpenAI Responses API.",
      category: "Vision & Multi-modal",
      status: "live",
      technologies: ["Next.js 14", "FastAPI", "Azure OpenAI", "Pillow"],
      liveUrl: "https://ai-roadmap-01-smart-inspector.vercel.app",
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
      liveUrl: "https://ai-roadmap-02-support-bot.vercel.app",
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
      liveUrl: "https://ai-roadmap-03-prompt-forge.vercel.app",
      repositoryPath: "apps/03-prompt-forge",
      caseStudyPath: "prompt-forge.md",
      security: { publicDemo: true, rateLimited: true, storesUserContent: false },
    },
  ];
}

function jsonParse(content: string) {
  return JSON.parse(content);
}

export function getAppBySlug(slug: string): AppItem | undefined {
  return getAppCatalog().find((app) => app.slug === slug);
}

export function getCaseStudyContent(caseStudyPath: string): string {
  try {
    const filePath = path.join(process.cwd(), "../content", caseStudyPath);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch {
    // Return fallback summary if file missing
  }
  return `# Case Study\n\nContent currently being updated. Check back soon!`;
}
