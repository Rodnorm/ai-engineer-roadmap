# Case Study: App 01 — Smart Inspector

## 1. Overview
Smart Inspector is a multi-modal vision inspection application. It allows users to upload images and automatically extracts structured captions, keyword tags, detected physical objects, and verbatim OCR text transcriptions.

## 2. Learning & Technical Goals
- Integrate Azure OpenAI Responses API for multi-modal image analysis.
- Enforce strict server-side image validation (magic bytes, dimensions, EXIF stripping).
- Build a dual-layer cost protection model (rate limiting, concurrency caps, kill switch).

## 3. Architecture & Tech Stack
- **Frontend:** Next.js 16, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Pillow, Azure OpenAI SDK.

## 4. Key Security & Cost Control Decisions
- **Image Validation:** Uploads are checked via Pillow (`Image.open`, `verify`). Dimension bounds are enforced (max 8000x8000 px / 24M pixels).
- **EXIF Stripping:** EXIF and camera metadata are stripped in memory prior to forwarding base64 payloads to Azure.
- **Rate Limiting:** `InMemoryRateLimiter` enforces 3 req/min per IP and 100 global daily requests.
- **Concurrency Control:** `asyncio.Semaphore` caps concurrent active analysis operations at 2.

## 5. Outcome
Smart Inspector is fully hardened, responsive, internationalized in 3 languages (`pt-BR`, `en`, `de`), and safe for public demo deployment.
