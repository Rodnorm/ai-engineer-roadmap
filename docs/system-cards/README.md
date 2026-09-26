# AI System Cards & Bill of Materials (AIBOM)

This directory provides standardized, auditable AI System Cards for every application in the monorepo. Each card documents deployment topologies, model boundaries, data retention, safety controls, human approval gates, and known operational limitations.

---

## Catalog of System Cards

| Application | Primary Deployment | Purpose | HITL Required? | System Card |
| :--- | :--- | :--- | :--- | :--- |
| **01 Smart Inspector** | Azure OpenAI `gpt-4o-mini` | Multimodal visual inspection & defect analysis | No (Read-only) | [System Card](./01-smart-inspector.md) |
| **02 Support Bot** | Azure OpenAI `gpt-4o-mini` | Grounded multi-turn customer support | No (Assistive) | [System Card](./02-support-bot.md) |
| **03 Prompt Forge** | Azure OpenAI `gpt-4o-mini` | Systematic prompt engineering & regression test | No (Development) | [System Card](./03-prompt-forge.md) |
| **04 Pocket RAG** | Azure OpenAI `text-embedding-3-small` / `gpt-4o-mini` | Local-first retrieval-augmented generation | No (Information) | [System Card](./04-pocket-rag.md) |
| **05 Agentic Workflow** | Azure OpenAI `gpt-4o-mini` | Stateful multi-step human-in-the-loop workflow | **Yes (Mandatory)** | [System Card](./05-agentic-workflow.md) |
| **06 Production Agent** | Azure OpenAI `gpt-4o-mini` + MCP Servers | Autonomous tool calling with sandboxed boundaries | **Yes (Destructive tools)** | [System Card](./06-production-agent.md) |
| **07 Brief Generator** | Azure OpenAI `gpt-4o` / `gpt-4o-mini` | Heterogeneous multi-agent research and executive brief synthesis | No (Audit Trail) | [System Card](./07-brief-generator.md) |

---

## System Card Structure
Every card adheres to the following specification:
1. **Model Architecture & Providers:** Model families, context windows, token limits.
2. **Data Governance & Retention:** In-memory handling, database persistence, and TTLs.
3. **Safety & Guardrails:** Prompt injection resistance, PII filtering, and output sanitization.
4. **Human Approval Boundaries:** Explicit confirmation gates for destructive operations.
5. **Cost & Latency Profile:** Estimated token costs and baseline latency targets.
6. **Empirical Evaluation Evidence:** Traceable links to versioned evaluation datasets in `evals/datasets/`.
