# Case Study: App 05 — Agentic Workflow

## Overview

Agentic Workflow implements an autonomous execution loop leveraging the ReAct (Thought -> Action -> Observation -> Final Answer) paradigm with deterministic tool calling and mandatory Human-in-the-Loop authorization.

## Architecture

FastAPI orchestrates an iterative reasoning loop where an LLM (or deterministic offline planner) inspects tasks, selects tools from a registered schema, and evaluates outputs. Sensitive actions pause the session state machine until an operator reviews the proposed action in Next.js and explicitly approves or cancels it.

## Reliability, safety, and security controls

- Iteration limits (maximum 4 steps) prevent reasoning loops and runaway cloud token consumption.
- Tool arguments are validated before execution; mathematical expressions are evaluated safely via AST without dynamic code execution.
- Sensitive tools (`send_alert`) pause in a persistent `waiting_approval` state, ensuring no high-impact side effect occurs without explicit human consent.
- Triple-bucket in-memory rate limiting and concurrency semaphores protect backend resources.
- Fully runnable and testable offline with zero external API dependencies.

## Status

The implementation is complete with full frontend internationalization, accessible state cards, and offline unit test coverage.
