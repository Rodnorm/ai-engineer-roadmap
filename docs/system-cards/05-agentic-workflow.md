# AI System Card: 05 Agentic Workflow

## 1. System Overview
- **Application:** Agentic Workflow (Multi-Step Stateful Automation with Human-in-the-Loop)
- **Primary Model Deployment:** Azure OpenAI `gpt-4o-mini`
- **Architecture:** Directed workflow execution with mandatory human approval gates for critical actions.

## 2. Model & Provider Details
- **Provider:** Azure OpenAI Service
- **Deployment Name:** Configured via `AZURE_OPENAI_DEPLOYMENT`
- **Output Schema:** Structured step transitions and action parameter proposals.

## 3. Human-in-the-Loop (HITL) Governance
- **Mandatory Approval Gates:** Destructive or state-modifying actions (e.g. database updates, financial transactions, external communications) are flagged as `requires_confirmation: true`.
- **Cryptographic Token Verification:** Execution requires a valid session token issued during the human review step. Spoofed, expired, or missing tokens are rejected with HTTP 403.
- **Audit Logging:** Every approval, rejection, and modification decision is recorded with timestamp and operator metadata.

## 4. Data Governance & Session Lifecycle
- **Session Memory:** Active sessions reside in-memory with strict idle TTL (15 minutes).
- **Session Eviction:** Stale or abandoned sessions are evicted automatically to prevent resource starvation.

## 5. Performance & Economics
- **Step Latency:** ~850ms per reasoning step
- **Cost Profile:** ~$0.0012 per complete 3-step workflow
