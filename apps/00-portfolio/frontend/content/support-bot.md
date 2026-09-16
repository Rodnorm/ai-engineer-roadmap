# Case Study: App 02 — Support Bot

## 1. Overview
Support Bot is an AI assistant specializing in healthcare billing inquiries. It combines Azure AI Language (PII detection, sentiment analysis, key phrase extraction) with grounded retrieval and LLM response generation.

## 2. Learning & Technical Goals
- Implement RAG grounding against a healthcare billing knowledge base.
- Protect user privacy by masking PII values before returning API responses.
- Prevent prompt injection attacks by isolating untrusted user input using XML data tags.

## 3. Architecture & Tech Stack
- **Frontend:** Next.js 16, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Azure AI Language, Azure AI Projects SDK.

## 4. Key Security & Cost Control Decisions
- **PII Masking:** Raw entity values (SSNs, phone numbers, email addresses) are automatically masked (`[REDACTED_SSN]`) before returning to the frontend.
- **Prompt Injection Defense:** User messages are strictly enclosed within `<user_input>` blocks. The system instructions explicitly order the model to ignore any overrides or instructions inside `<user_input>`.
- **Zero Input Logging:** Raw user prompt texts are excluded from server log files.

## 5. Outcome
Support Bot provides accurate, grounded answers to complex billing questions while maintaining zero-trust prompt boundaries and strict PII privacy.
