# AI System Card: 02 Support Bot

## 1. System Overview
- **Application:** Support Bot (Multi-turn Grounded Customer Support)
- **Primary Model Deployment:** Azure OpenAI `gpt-4o-mini`
- **Architecture:** Guardrailed conversational agent with streaming responses and ground-truth policy citations.

## 2. Model & Provider Details
- **Provider:** Azure OpenAI Service
- **Deployment Name:** Configured via `AZURE_OPENAI_DEPLOYMENT`
- **Output Mode:** Server-Sent Events (SSE) streaming with structured citation events.
- **Context Management:** Rolling window of the last 6 conversation turns; total context bounded to 8,000 tokens.

## 3. Data Governance & Retention
- **Conversational History:** Stored in client session memory; backend operates statelessly per turn.
- **PII Handling:** Ingress messages pass through regex sanitizers for credit cards, tax IDs, and email addresses.
- **Log Policy:** Request metrics and latencies are recorded; query strings and message texts are omitted from production logs.

## 4. Safety & Guardrail Controls
- **Hallucination Prevention:** Assistant system prompt enforces explicit refusal when questions fall outside the documented product support domain.
- **Prompt Injection Defense:** Untrusted user input is enclosed within isolation blocks to prevent instruction hijacking or persona overrides.
- **Client Cancellation:** Streaming connections monitor client disconnects via cancellation tokens, terminating upstream model generation instantly to save quota.

## 5. Limitations
- Does not have direct write access to external customer billing databases; requests requiring account modification are directed to human support agents.

## 6. Performance & Economics
- **Latency to First Token (TTFT):** ~320ms
- **Cost Profile:** ~$0.0004 per conversation turn
