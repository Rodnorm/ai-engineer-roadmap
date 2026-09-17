# AI System Card: 03 Prompt Forge

## 1. System Overview
- **Application:** Prompt Forge (Systematic Prompt Engineering & Regression Workbench)
- **Primary Model Deployment:** Azure OpenAI `gpt-4o-mini`
- **Purpose:** Enables developers to author, iterate, test, and benchmark system prompts against golden test suites with automated diffs.

## 2. Model & Provider Details
- **Provider:** Azure OpenAI Service
- **Deployment Name:** Configured via `AZURE_OPENAI_DEPLOYMENT`
- **Token Limits:** Max 4,000 prompt tokens; max 1,000 completion tokens per candidate run.

## 3. Data Governance & Retention
- **Prompt Templates & Test Runs:** Persisted in local SQLite database (`forge.sqlite3`).
- **Isolation:** Test runs are partitioned per project; no cross-project leakage.
- **Provider Keys:** Inherited from server environment variables; clients never receive or supply raw provider secrets.

## 4. Safety Controls & Circuit Breakers
- **Generation Kill-Switch:** `GENERATION_ENABLED=false` disables external model calls immediately while allowing UI template authoring.
- **Budget Caps:** Hard ceiling on daily generation tokens to prevent run-away experimentation costs.

## 5. Performance & Economics
- **Batch Evaluation:** Sequential execution with rate limiting to respect Azure TPM quotas.
- **Cost Profile:** ~$0.0008 per comparative run pair.
