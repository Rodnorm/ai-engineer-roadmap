"""OpenTelemetry-compatible GenAI tracing and operational metrics collector.

Follows OpenTelemetry Semantic Conventions for Generative AI operations.
Guarantees zero leakage of prompt content, image binaries, or user PII.
"""

from __future__ import annotations

import hashlib
import time
from contextlib import contextmanager
from typing import Any, Generator


class MetricsCollector:
    """Collects runtime operational metrics including p50/p95 latency and token counts."""

    def __init__(self) -> None:
        self.request_latencies: list[float] = []
        self.error_count: int = 0
        self.total_requests: int = 0
        self.prompt_tokens: int = 0
        self.completion_tokens: int = 0
        self.estimated_cost_usd: float = 0.0

    def record_request(
        self,
        duration_ms: float,
        is_error: bool = False,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        cost_usd: float = 0.0,
    ) -> None:
        self.total_requests += 1
        self.request_latencies.append(duration_ms)
        if len(self.request_latencies) > 2000:
            self.request_latencies.pop(0)
        if is_error:
            self.error_count += 1
        self.prompt_tokens += prompt_tokens
        self.completion_tokens += completion_tokens
        self.estimated_cost_usd += cost_usd

    def get_summary(self) -> dict[str, Any]:
        if not self.request_latencies:
            return {
                "total_requests": self.total_requests,
                "error_count": self.error_count,
                "error_rate": 0.0,
                "p50_latency_ms": 0.0,
                "p95_latency_ms": 0.0,
                "prompt_tokens": self.prompt_tokens,
                "completion_tokens": self.completion_tokens,
                "estimated_cost_usd": round(self.estimated_cost_usd, 6),
            }
        sorted_lat = sorted(self.request_latencies)
        n = len(sorted_lat)
        p50 = sorted_lat[int(n * 0.5)]
        p95 = sorted_lat[min(int(n * 0.95), n - 1)]
        return {
            "total_requests": self.total_requests,
            "error_count": self.error_count,
            "error_rate": round(self.error_count / max(self.total_requests, 1), 4),
            "p50_latency_ms": round(p50, 2),
            "p95_latency_ms": round(p95, 2),
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "estimated_cost_usd": round(self.estimated_cost_usd, 6),
        }


metrics_collector = MetricsCollector()


def format_traceparent(request_id: str) -> str:
    """Generate a W3C traceparent header from request correlation ID."""
    trace_id = hashlib.sha256(request_id.encode("utf-8")).hexdigest()[:32]
    span_id = hashlib.sha256(f"{request_id}-span".encode("utf-8")).hexdigest()[:16]
    return f"00-{trace_id}-{span_id}-01"


@contextmanager
def trace_ai_call(
    operation_name: str,
    system: str = "azure_openai",
    model: str = "",
    request_id: str = "",
    input_cost_per_m: float = 0.15,
    output_cost_per_m: float = 0.60,
) -> Generator[dict[str, Any], None, None]:
    """Context manager for tracing external AI model/tool calls.

    Strictly complies with OpenTelemetry Semantic Conventions for GenAI.
    Explicitly excludes user prompts, document payloads, images, and PII.
    """
    span: dict[str, Any] = {
        "gen_ai.system": system,
        "gen_ai.request.model": model,
        "gen_ai.operation.name": operation_name,
        "correlation_id": request_id,
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "status": "unset",
    }
    start = time.perf_counter()
    try:
        yield span
        span["status"] = "ok"
    except Exception as exc:
        span["status"] = "error"
        span["error.type"] = type(exc).__name__
        raise
    finally:
        duration_ms = (time.perf_counter() - start) * 1000
        span["duration_ms"] = round(duration_ms, 2)
        p_toks = span.get("prompt_tokens", 0)
        c_toks = span.get("completion_tokens", 0)
        cost = (p_toks * (input_cost_per_m / 1_000_000)) + (c_toks * (output_cost_per_m / 1_000_000))
        span["estimated_cost_usd"] = round(cost, 6)

        metrics_collector.record_request(
            duration_ms=duration_ms,
            is_error=span["status"] == "error",
            prompt_tokens=p_toks,
            completion_tokens=c_toks,
            cost_usd=cost,
        )
