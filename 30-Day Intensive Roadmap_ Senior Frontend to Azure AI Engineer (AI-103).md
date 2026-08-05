# 30-Day Intensive Roadmap: Senior Frontend → Azure AI Engineer (AI-103)

> **Important change from the original plan:** The original roadmap targeted **AI-102**, which Microsoft **retired on 12/23/2025**. The current Microsoft Azure AI certification is now **AI-103: Microsoft Certified: Azure AI Apps and Agents Developer Associate**, built on the new **Microsoft Foundry** platform with a heavy focus on **AI agents and the Agent Framework** (MCP, multi-agent orchestration). This plan targets AI-103 and prioritizes actual engineering depth over exam-cramming.
>
> **Why this plan can move faster than the original (30 days, 8 h/day, ~240 h total):** You are a **senior frontend engineer**. We assume you already know JS/TS, async/await, REST, Git, package management, Docker basics, and how to ship production code. Every day skips the things a senior dev can absorb by analogy and spends the time on what is genuinely new: Azure service topology, the Foundry SDK, the Microsoft Agent Framework, RAG patterns, and the production realities of AI features (cost, latency, evals, safety, observability).

---

## Preparation Checklist (Day 0 — do all of this on Day 0, before Day 1)

*   **Azure Account:** [Free Azure account](https://azure.microsoft.com/free/) — $200 credit for 30 days, 12 months of free services.
*   **Azure subscription permissions:** Confirm you have **Owner** or **Contributor** on the subscription. You will create ~6 services and several Foundry resources.
*   **Azure OpenAI / Foundry access:** Request access at the [Azure AI Foundry portal](https://ai.azure.com/). Approval is usually minutes for a brand-new tenant.
*   **GitHub Copilot or Cursor** (optional, recommended): you are a senior dev — use AI coding assistants to move faster, not to skip learning.
*   **Install:** VS Code, the **Azure AI Foundry** VS Code extension, **Python 3.11+** and `uv` (fastest Python package manager), Node.js 20+ for the TypeScript side.
*   **Bookmarks (free resources used throughout this plan):**
    *   Microsoft's official **AI Engineer Career Path** (the plan you shared): https://learn.microsoft.com/en-us/plans/odgoumq07e4x83
    *   **AI-103 exam page:** https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/
    *   **Microsoft Foundry docs:** https://learn.microsoft.com/en-us/azure/ai-foundry/
    *   **Generative AI for Beginners (21 lessons, free):** https://github.com/microsoft/generative-ai-for-beginners
    *   **AI Agents for Beginners (12 lessons, free):** https://github.com/microsoft/ai-agents-for-beginners
    *   **MCP for Beginners:** https://github.com/microsoft/mcp-for-beginners
    *   **Microsoft Foundry Samples (Python):** https://github.com/Azure-Samples/get-started-ai-agents
    *   **TypeScript AI repo (LangChain.js, Vercel AI SDK, etc.):** https://github.com/topics/llm
    *   **AI-103 study guide (skills measured):** https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-103/
    *   **Azure free services list:** https://azure.microsoft.com/en-us/free/

---

## Weekly Structure (apply every day)

| Block | Time | Purpose |
|---|---|---|
| **Read & watch** | 2 h | Microsoft Learn modules + the linked video. Senior speed: skim what you know, drill what is new. |
| **Build** | 5 h | Hands-on with the actual Azure service, the SDK, or the framework. Commit to a repo daily. |
| **Review & write** | 1 h | Short written note (1 page) on what surprised you. This becomes your own study guide. |
| **Total** | **8 h** | Hard cap. Stop. Rest is part of learning. |

**Two tracking rules:**
1. **One weekly practical objective** (listed under each week). It is shippable to GitHub, demonstrable to a hiring manager, and exercises the week's skills.
2. **Save the daily artifact.** Every day's `Build` block produces a small commit. The weekly objective rolls those commits into a single demo.

---

## Week 1 — Azure, Foundry Foundations & Generative AI

**Weekly practical objective (shippable):** A TypeScript CLI / Next.js app that calls a **deployed Foundry chat model** with a versioned system prompt and **tracks token usage + cost per request** in a local SQLite table. Demonstrates: Azure setup, Foundry deployment, prompt engineering basics, basic observability.

| Day | Topic | Microsoft Learn / Docs | Other Free Resources | Daily Check |
|:---|:---|:---|:---|:---|
| **1** | Azure mental model & Foundry portal | [Get started with Azure AI Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/quickstarts/get-started-code) | [Foundry vs Azure OpenAI: what changed in 2025](https://learn.microsoft.com/en-us/azure/ai-foundry/) | Create a resource group, a Foundry project, deploy `gpt-4o-mini` (cheap, fast). Send a `Hello world` from the Playground. |
| **2** | First Foundry call (Python + TS) | [Get started with chat completions](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/get-started) | [TypeScript SDK: `@azure/ai-projects`](https://www.npmjs.com/package/@azure/ai-projects) | Call the deployed model from **both Python and TypeScript** on the same prompt. Compare token counts. |
| **3** | Prompt engineering fundamentals | [Prompt engineering techniques](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/prompt-engineering) + [Learn module: Apply prompt engineering](https://learn.microsoft.com/training/modules/apply-prompt-engineering-azure-openai/) | [DeepLearning.AI — ChatGPT Prompt Engineering for Developers (free)](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) | Build a 10-prompt test harness. Try zero-shot, few-shot, chain-of-thought, and structured output (JSON mode) on the same classification task. |
| **4** | Streaming, parameters, structured outputs | [Responses API & streaming](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses) | [Vercel AI SDK: streaming UI in React/Next.js](https://sdk.vercel.ai/docs) | Add streaming to a Next.js chat UI. Add `temperature`, `top_p`, `max_tokens`, `response_format: { type: "json_object" }`. Build a streaming JSON-extraction tool. |
| **5** | Responsible AI & content safety | [Plan a responsible AI solution](https://learn.microsoft.com/training/modules/responsible-ai-for-azure-ai-foundry/) | [Azure AI Content Safety docs](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/) | Wrap every prompt in a content-safety check. Add a "blocked" UI state. Document a refusal policy in your repo's README. |
| **6** | Tokens, cost, latency — production reality | [Manage cost & quota](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/cost-management) | [How to estimate LLM cost (OpenAI pricing page)](https://openai.com/api/pricing/) | Implement per-request **cost + latency logging** (just local SQLite, like the weekly objective). Generate a simple cost report for 100 demo requests. |
| **7** | Review + weekly demo ship | The AI Engineer Career Path → **Milestone 1** review | [AI Agents for Beginners — Lesson 1: Intro to agents](https://github.com/microsoft/ai-agents-for-beginners) | Push Week 1 repo. Add a 3-min Loom/screen recording of the demo. Add a written postmortem: "3 things I would do differently." |

---

## Week 2 — Language, Vision, Document Intelligence, Search

**Weekly practical objective (shippable):** A small **"document intelligence" microservice** in Python (FastAPI) + a **Next.js upload UI** that ingests PDFs/images, runs OCR + entity extraction + sentiment + embedding, and exposes a `/search?q=` endpoint that returns the most relevant chunks. Demonstrates: Vision, Document Intelligence, Language, **Azure AI Search with vector + semantic**, plus a frontend-friendly API surface.

| Day | Topic | Microsoft Learn / Docs | Other Free Resources | Daily Check |
|:---|:---|:---|:---|:---|
| **8** | Azure AI Language: sentiment, key phrases, language detection | [Analyze text](https://learn.microsoft.com/training/modules/analyze-text-azure-ai-language/) | [Text Analytics SDK quickstart](https://learn.microsoft.com/en-us/azure/ai-services/language-service/) | Build the FastAPI skeleton. Add a `/analyze` endpoint. Test on 10 sample customer reviews. |
| **9** | NER, PII, redaction | [Extract entities & PII](https://learn.microsoft.com/training/modules/extract-entities-from-text/) | [Presidio (open-source PII detection) — useful comparison](https://microsoft.github.io/presidio/) | Add a `/redact` endpoint. Given a doc, return a redacted version + a PII report (what was found, where, confidence). |
| **10** | Azure AI Vision: tagging, OCR, custom vision | [Analyze images & OCR](https://learn.microsoft.com/training/modules/analyze-images-computer-vision/) | [Custom Vision portal](https://www.customvision.ai/) | Add an `/analyze-image` endpoint. For fun, train a small Custom Vision classifier to distinguish "diagram" vs "photo" vs "screenshot". |
| **11** | Document Intelligence (formerly Form Recognizer) | [Extract from documents](https://learn.microsoft.com/training/modules/analyze-receipts-form-recognizer/) | [Prebuilt models list (invoices, receipts, contracts, IDs)](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/) | Add a `/parse-document` endpoint. Process a real invoice PDF and emit structured JSON. Compare custom extraction with prebuilt. |
| **12** | Azure AI Search — index + basic keyword | [Create an Azure AI Search index](https://learn.microsoft.com/training/modules/create-azure-ai-search-solution/) | [Azure-Samples / search-website](https://github.com/Azure-Samples/azure-search-openai-demo) | Index the documents you parsed yesterday. Build a search UI in Next.js. Verify keyword search works. |
| **13** | Vector search + embeddings + RAG | [Implement vector search](https://learn.microsoft.com/training/modules/implement-vector-search-azure-ai-search/) + [Vectorize text](https://learn.microsoft.com/training/modules/generate-embeddings-azure-openai/) | [MTEB benchmark — which embedding model is best](https://huggingface.co/spaces/mteb/leaderboard) | Add vector search. Wire a Foundry chat model to the index. Build a **chat-with-your-docs** endpoint using the **Responses API `file_search` tool** (Foundry's first-class RAG). |
| **14** | Review + weekly demo ship | Re-do the [Generative AI for Beginners → Lesson 15: RAG](https://github.com/microsoft/generative-ai-for-beginners) | [RAGAS — evaluate your RAG quality (open source)](https://docs.ragas.io/) | Ship Week 2. Add 5 sample documents to the repo. Record a 5-min demo: upload → ask question → see grounded answer with citations. Add a tiny RAGAS eval set (5 questions, expected answers). |

---

## Week 3 — Agents, Tool Use, MCP, Microsoft Agent Framework

**Weekly practical objective (shippable):** An **end-to-end AI agent** (Foundry Agent Service) that (a) answers questions using a **local MCP server** you wrote (3 tools), (b) **persists threads** in a Cosmos DB-backed store, and (c) is exposed through a minimal **Next.js chat UI** that streams responses and shows tool calls in real time. Demonstrates: Foundry Agent Service, MCP, multi-agent orchestration, durable state, agent observability — the new core of AI-103.

| Day | Topic | Microsoft Learn / Docs | Other Free Resources | Daily Check |
|:---|:---|:---|:---|:---|
| **15** | Agents: mental model & Microsoft Foundry Agent Service | [Develop AI agents on Azure (Learning Path, 9h 52m)](https://learn.microsoft.com/en-us/training/paths/develop-ai-agents-azure/) | [AI Agents for Beginners — Lessons 2–4](https://github.com/microsoft/ai-agents-for-beginners) | Read all 3 lessons. Skim the learning path intro. Build a one-tool agent in the portal: "what's the weather" using a fake function. |
| **16** | Your first custom agent with the SDK | [Foundry Agent Service quickstart (Python)](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/quickstart) | [`@azure/ai-projects` Agent samples](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/ai) | Build an agent in **TypeScript** with a single custom tool (e.g., a function that returns a TODO list from a local JSON). Call it from a CLI. |
| **17** | MCP — Model Context Protocol from scratch | [MCP for Beginners (5-lesson free course)](https://github.com/microsoft/mcp-for-beginners) | [MCP spec (free)](https://modelcontextprotocol.io/) | Build a **local MCP server in Node** with 3 tools (e.g., `add_task`, `list_tasks`, `complete_task`). Test it with the MCP Inspector. |
| **18** | Connect your MCP server to a Foundry agent | [Integrate MCP tools with Azure AI Agents](https://learn.microsoft.com/en-us/training/modules/integrate-mcp-tools-azure-ai-agents/) | [Microsoft Foundry SDK reference](https://learn.microsoft.com/en-us/python/api/azure-ai-agents/) | Replace the local custom tool from Day 16 with a **remote MCP server** you run locally. Confirm the agent invokes it on real requests. |
| **19** | Microsoft Agent Framework + multi-agent | [Develop an AI agent with Microsoft Agent Framework](https://learn.microsoft.com/en-us/training/modules/develop-ai-agents-azure/) | [AutoGen vs Agent Framework — when to use which](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/concepts/agent-framework) | Build a **2-agent workflow**: a "researcher" agent (has search + MCP tools) feeds a "writer" agent (no tools, just LLM) that produces a polished answer. |
| **20** | Durable threads & state | [Thread management docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/concepts/threads) | [Cosmos DB free tier](https://learn.microsoft.com/en-us/azure/cosmos-db/) | Persist all agent threads to **Cosmos DB** (free tier). Rebuild a conversation by loading its thread. Verify a "memory across days" demo works. |
| **21** | Review + weekly demo ship | [AI Agents for Beginners — Lessons 5–8](https://github.com/microsoft/ai-agents-for-beginners) | [Cursor + Azure: write a streaming chat UI in 30 min](https://cursor.com/) | Ship Week 3. Add the MCP server, the multi-agent flow, the Cosmos persistence, and the Next.js UI to a single monorepo. Record a 5-min demo. |

---

## Week 4 — Production, Observability, Security, Exam Prep & Capstone

**Weekly practical objective (shippable, career-grade):** **Capstone project — a deployable, observable, secure AI feature for a real use case** of your choice. Deploy to Azure Container Apps (or App Service). Wire **Application Insights** for traces + token telemetry. Run a **Red Team / safety evaluation** with the AI Foundry Safety Eval suite. Write a **1-page architecture document** + a **README that a hiring manager will read first**. This is the artifact you put on LinkedIn and in job applications.

| Day | Topic | Microsoft Learn / Docs | Other Free Resources | Daily Check |
|:---|:---|:---|:---|:---|
| **22** | Observability: traces, token telemetry, evals | [Monitor Foundry apps](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/observability) + [Foundry tracing](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/tracing) | [OpenTelemetry for LLM apps (free OSS)](https://opentelemetry.io/) | Add **Application Insights** to your Week 3 agent. Confirm each tool call and LLM span shows up in a trace. Build a Grafana-style dashboard JSON you can ship. |
| **23** | Security: prompt injection, key safety, network isolation | [Security baseline for AI services](https://learn.microsoft.com/en-us/azure/ai-services/security-features) + [Prompt shields](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/prompt-shield) | [OWASP Top 10 for LLM Applications (free)](https://owasp.org/www-project-top-10-for-large-language-model-applications/) | Run a red-team prompt set against your agent (5 known injection techniques). Add Prompt Shield or a guardrail layer. Move all secrets into **Key Vault**, not `.env`. |
| **24** | Evaluations: quality, safety, custom | [Run AI evaluations in Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/evaluation) | [Promptfoo (open source LLM eval framework)](https://promptfoo.dev/) | Build a 20-question **golden eval set** for your agent. Run Foundry's built-in evaluators (groundedness, relevance, safety). Track results in a CSV. |
| **25** | Deploy to Azure Container Apps + CI/CD | [Deploy a Foundry chat app](https://learn.microsoft.com/en-us/azure/ai-foundry/quickstarts/deploy-chat-app) + [Azure Container Apps quickstart](https://learn.microsoft.com/en-us/azure/container-apps/) | [GitHub Actions: deploy to Azure (free)](https://learn.microsoft.com/en-us/azure/developer/github/deploy-to-azure) | Containerize the Next.js + FastAPI app. Push to **ACR**, deploy to **Container Apps**. Add a GitHub Actions workflow that runs lint/test/deploy on `main`. |
| **26** | AI-103 practice exam + gap analysis | [AI-103 exam sandbox (free)](https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-103/) + [Exam AI-103 study guide](https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-103/study-guide) | [Microsoft Learn practice assessment](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/practice-assessment/) | Take the free official practice assessment. List your **3 weakest measured skills**. Read the official doc page for each. |
| **27** | Capstone architecture doc + README | [Azure Architecture Center: AI](https://learn.microsoft.com/en-us/azure/architecture/browse/?terms=AI) | [Microsoft Architecture diagrams guidance](https://learn.microsoft.com/en-us/azure/architecture/) | Write a 1-page architecture doc (sequence diagram in Mermaid, data flow, security, cost estimate). Update the README to be a hiring-manager-friendly portfolio entry. |
| **28** | Capstone hardening + video demo | The [AI Engineer Career Path](https://learn.microsoft.com/en-us/plans/odgoumq07e4x83) final review | [freeCodeCamp — Intro to AI Engineering (free)](https://www.freecodecamp.org/) for a sanity check on what is current | Run a 5-minute screen recording: live URL → ask a question → see tool calls → see eval scores → show the trace. Add the video link to the README. |
| **29** | Spaced review of weak areas | Re-read docs for the 3 weakest areas from Day 26 | [RAG techniques (free e-book, Pinecone)](https://www.pinecone.io/learn/) — for the RAG domain if it's weak | One last pass through the AI-103 skills measured. Confirm you could answer 2 sample questions per skill. |
| **30** | **AI-103 exam day** | [Schedule exam AI-103 (Pearson Vue)](https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-103/) | — | **Pass.** Update LinkedIn, CV, and the roadmap's outcome section with what surprised you. |

---

## Free Resource Library (curated, no paywalls)

**Microsoft first-party (always start here):**
*   [AI Engineer Career Path (your linked plan)](https://learn.microsoft.com/en-us/plans/odgoumq07e4x83) — 2 milestones, full coverage.
*   [Develop AI agents on Azure](https://learn.microsoft.com/en-us/training/paths/develop-ai-agents-azure/) — 9h 52m, 9 modules. The heart of AI-103.
*   [Microsoft Foundry documentation](https://learn.microsoft.com/en-us/azure/ai-foundry/)
*   [AI-103 skills measured (study guide)](https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-103/)
*   [Microsoft Learning GitHub — labs](https://github.com/MicrosoftLearning) (the AI-103 labs ship under `AI-103-AIEngineer`).
*   [Azure-Samples / azure-search-openai-demo](https://github.com/Azure-Samples/azure-search-openai-demo) — the canonical RAG reference architecture.

**Microsoft's open-source GitHub curricula (excellent, free):**
*   [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners) — 21 lessons.
*   [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners) — 12 lessons.
*   [MCP for Beginners](https://github.com/microsoft/mcp-for-beginners) — 5 lessons.
*   [Cosmic TS for Beginners](https://github.com/microsoft/typescript-for-beginners) — useful TypeScript refresher if needed.

**Other high-quality free resources:**
*   [DeepLearning.AI short courses (free, by Andrew Ng's team)](https://www.deeplearning.ai/short-courses/) — prompt engineering, function calling, RAG, agents. Each is 1–2 hours.
*   [freeCodeCamp — Machine Learning with Python](https://www.freecodecamp.org/learn/machine-learning-with-python/) (for the conceptual side, optional).
*   [LangChain Academy (free)](https://academy.langchain.com/) — 100-level intro. Good for cross-checking Foundry concepts.
*   [Promptfoo docs (free OSS)](https://promptfoo.dev/) — practical LLM evaluation, the only one you need.
*   [OWASP Top 10 for LLM Applications (free)](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — required reading for the security portion of AI-103.
*   [Azure Architecture Center: AI](https://learn.microsoft.com/en-us/azure/architecture/browse/?terms=AI) — architecture patterns.

**TypeScript / frontend-leaning (your leverage as a senior FE dev):**
*   [Vercel AI SDK docs](https://sdk.vercel.ai/docs) — the cleanest way to do streaming UIs.
*   [LangChain.js](https://js.langchain.com/) — when you need a heavy agent framework on the TS side.
*   [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

---

## Why the 4 weekly objectives, in order, map onto AI-103's 5 measured skills

| AI-103 skill measured | Covered in |
|---|---|
| Plan and manage an Azure AI solution | Week 1 (Day 1, 6) + Week 4 (Day 25, 27) |
| Implement generative AI and agentic solutions | Week 1 (Days 2–5) + Week 3 (all) + Week 4 (Day 22) |
| Implement computer vision solutions | Week 2 (Days 10) |
| Implement text analysis solutions | Week 2 (Days 8, 9) |
| Implement information extraction solutions | Week 2 (Days 11, 12) + Week 3 (Day 19) |

The "one concrete objective per week" structure is intentional: every Friday artifact is a **deployable demo**, not a tutorial clone. By Day 30 you have 4 portfolio-grade projects + a passed exam.

---

## Daily Routine Cheat Sheet (print this)

```
08:00  Read & watch  — Microsoft Learn module + 1 video
10:00  Build         — commit a working piece
12:00  Lunch (off)
13:00  Build         — second commit
15:30  Build         — wire it to next week's prep
16:30  Review & write — 1 page of "what surprised me"
17:30  Stop. No more than 8h.
```

---

## Tips for Success as a Senior Frontend Dev

1.  **Skip the math.** AI-103 is implementation. No tensor arithmetic. Focus on: API shapes, SDK parameter names, agent loop mechanics, evaluation metrics, security boundaries, cost.
2.  **TypeScript is your weapon.** Microsoft's official labs lean Python. Translate at least one Python lab per week to TypeScript using `@azure/ai-projects`, `@azure/ai-inference`, or the **Microsoft Agent Framework for TS**. This is a market differentiator — most "AI engineers" coming from .NET/Python cannot ship the front half of the product.
3.  **Build the UI for every backend.** Senior FE dev strength: never deliver a CLI. Every week's practical objective includes a small Next.js UI. The full-stack artifact is what gets you hired.
4.  **Agents > chatbots.** Always ask: "What tool could this LLM call? What state does it need? Who owns the next step?" Treat the LLM as a *function* your orchestrator dispatches, not as a chat partner.
5.  **Eval from Day 1.** Even 5 hand-written "golden" Q&A pairs is a real eval. Promptfoo + Foundry evaluators is the modern equivalent of unit tests. Build the habit; it compounds.
6.  **Use AI to move faster, not to skip learning.** The point of this plan is to *understand* the systems. A senior dev who lets Cursor write everything will not pass AI-103. Read first, type second, AI-assist third.
7.  **Don't skip the cloud-account plumbing.** Day 0 setup is unglamorous but blocks Day 1 if it's wrong. The 30-day cost is ~$5–$15 if you tear down resources on day 30.
8.  **Cert is the floor, not the ceiling.** The 4 weekly artifacts are the real prize. The badge gets the interview; the artifacts get the offer.
