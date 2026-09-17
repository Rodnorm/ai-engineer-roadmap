# AI System Card: 01 Smart Inspector

## 1. System Overview
- **Application:** Smart Inspector (Multimodal Defect & Object Analysis)
- **Primary Model Deployment:** Azure OpenAI `gpt-4o-mini` (Vision capable)
- **API Surface:** Azure OpenAI Responses API (Structured Outputs)
- **Runtime Environment:** FastAPI (Backend) + Next.js App Router (Frontend)

## 2. Model & Provider Details
- **Provider:** Azure OpenAI Service
- **Deployment Name:** Configured via `AZURE_OPENAI_DEPLOYMENT`
- **Context Limit:** 128k input tokens; capped at `AZURE_MAX_OUTPUT_TOKENS=800`
- **Output Schema:** Pydantic-enforced `AnalysisResult` (`title`, `tags`, `objects` with bounding dimensions and confidence scores)

## 3. Data Governance & Retention
- **Image Input Handling:** In-memory stream processing with EXIF metadata stripping and image re-compression (`Pillow`).
- **Persistence:** **Zero disk storage.** Uploaded images are discarded immediately after analysis.
- **Trace Logging:** W3C `traceparent` and `X-Request-ID` logged. Prompt text and base64 image data are **strictly excluded** from telemetry and logs.

## 4. Safety & Guardrail Controls
- **Magic Byte Verification:** File payloads are verified via Pillow format validation (`JPEG`, `PNG`, `GIF`, `WEBP`) with max pixel caps (24M pixels) to block decompression bombs.
- **Structured Output Guarantees:** Model output is parsed directly into strict schema; malformed generations are caught and returned as HTTP 502 with zero partial leakage.
- **Prompt Injection Defense:** User-supplied instructions cannot override system inspection criteria; image text is classified as visual content rather than executable directives.

## 5. Limitations & Gaps
- Low-light or extreme occlusion degrades detection accuracy.
- OCR text within images is descriptive only and not guaranteed for legal or financial accuracy.

## 6. Performance & Economics
- **Latency (p50):** ~1,200ms
- **Cost Profile:** ~$0.0015 per inspection (image tokens + completion)
- **Concurrency & Rate Limits:** Concurrency semaphore limits simultaneous inference requests to 2; persistent token bucket limits per-IP usage.
