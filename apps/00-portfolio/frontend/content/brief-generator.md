# App 07 Case Study — Multi-Agent Brief Generator

## Problem

A single prompt can produce a polished executive brief without showing where its claims came from or how they were selected. This app makes the handoff between research and writing visible, and keeps the result in a structured format that can be inspected.

## Solution

The application runs two specialized stages. A Researcher builds and validates a structured dossier with facts, friction points, metrics, and a summary. A Writer receives that dossier and produces an executive brief without using research tools. The browser displays the handoff trace and the dossier alongside the finished brief.

The same workflow can run in a deterministic offline mode for development and demonstrations, or in an online mode using Azure OpenAI. Offline facts and metrics are fixtures for testing and should not be treated as independently verified evidence. Online research is model generated; the app does not independently fetch or authenticate sources.

## Architecture decisions

- **Typed handoff:** Zod validates the dossier before it reaches the Writer.
- **Separate agent roles:** The Writer consumes the Researcher output, with no tool access of its own.
- **Visible execution:** Server-Sent Events deliver progress steps and the completed result to the browser.
- **Bounded research:** `MAX_RESEARCH_ROUNDS` limits the Researcher configuration, and the offline engine honors it when selecting tool calls.
- **Local session history:** Signed browser cookies isolate in-memory briefs per visitor. History is lost when the server restarts and is not shared between replicas.
- **One deployable service:** Next.js serves both the interface and its API routes in Coolify.

## Security and cost controls

- Server-side length limits on the topic and scope before model calls.
- Per-IP request limiting, a concurrency semaphore, and a `GENERATION_ENABLED` kill switch.
- Server-only Azure credentials and an offline mode with no model charges.
- The public demo should be operated with a budget appropriate for model usage; the in-memory limiter is per server instance.

## Validation

The test suite covers deterministic pipeline generation, dossier validation, session token tampering, session isolation, request limiting, the kill switch, and the research-round limit. CI runs the app's lint, type-check, tests, and build when its directory changes.

## What this project demonstrates

The project shows a sequential multi-agent handoff with schema validation, observable execution, cost controls, and a local fallback. Its trace documents what the application executed; it is not proof that an online model's citations are correct.
