"""
Support Bot — backend (Azure OpenAI, /openai/v1, AAD).

Exposes:
    POST /query
    GET  /health
"""

import logging
import os

from azure.ai.projects import AIProjectClient
from azure.ai.textanalytics import TextAnalyticsClient
from azure.identity import ClientSecretCredential, DefaultAzureCredential
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field, field_validator

from local_retrieval import faq_retriever
from rate_limit import InMemoryRateLimiter

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

load_dotenv()


def _env_int(name: str, default: int, minimum: int = 1) -> int:
    raw_value = os.getenv(name, str(default))
    try:
        value = int(raw_value)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer") from exc

    if value < minimum:
        raise RuntimeError(f"{name} must be at least {minimum}")
    return value


def _env_float(name: str, default: float, minimum: float = 0.1) -> float:
    raw_value = os.getenv(name, str(default))
    try:
        value = float(raw_value)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be a number") from exc

    if value < minimum:
        raise RuntimeError(f"{name} must be at least {minimum}")
    return value


def _env_bool(name: str, default: bool) -> bool:
    raw_value = os.getenv(name, str(default)).strip().lower()
    if raw_value in {"1", "true", "yes", "on"}:
        return True
    if raw_value in {"0", "false", "no", "off"}:
        return False
    raise RuntimeError(f"{name} must be true or false")


LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("support-bot")

PORT = _env_int("PORT", 8000)
AGENT_NAME = os.getenv("AZURE_AGENT_NAME", "")
AGENT_VERSION = os.getenv("AZURE_AGENT_VERSION", "")
ENDPOINT = os.getenv("AZURE_AGENT_ENDPOINT", "").rstrip("/")
AZURE_LANGUAGE_ENDPOINT = os.getenv("AZURE_LANGUAGE_ENDPOINT", "")

MAX_QUERY_LENGTH = _env_int("MAX_QUERY_LENGTH", 2000)
AZURE_MAX_OUTPUT_TOKENS = _env_int("AZURE_MAX_OUTPUT_TOKENS", 800)
AZURE_REQUEST_TIMEOUT_SECONDS = _env_float(
    "AZURE_REQUEST_TIMEOUT_SECONDS", 30.0
)
RATE_LIMIT_ENABLED = _env_bool("RATE_LIMIT_ENABLED", True)
TRUST_PROXY_HEADERS = _env_bool("TRUST_PROXY_HEADERS", True)

rate_limiter = InMemoryRateLimiter(
    requests_per_minute=_env_int("RATE_LIMIT_REQUESTS_PER_MINUTE", 5),
    requests_per_day_per_ip=_env_int("RATE_LIMIT_REQUESTS_PER_DAY_PER_IP", 30),
    global_requests_per_day=_env_int(
        "RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY", 300
    ),
)

credential = ClientSecretCredential(
    tenant_id=os.environ["AZURE_TENANT_ID"],
    client_id=os.environ["AZURE_CLIENT_ID"],
    client_secret=os.environ["AZURE_CLIENT_SECRET"],
)


def _build_language_client():
    if not AZURE_LANGUAGE_ENDPOINT:
        return None

    return TextAnalyticsClient(
        endpoint=AZURE_LANGUAGE_ENDPOINT,
        credential=credential,
    )


def _build_client():
    if not ENDPOINT or not AGENT_NAME or not AGENT_VERSION:
        return None

    project_client = AIProjectClient(
        endpoint=ENDPOINT,
        credential=DefaultAzureCredential(),
    )

    return project_client.get_openai_client()


client: OpenAI | None = _build_client()
language_client: TextAnalyticsClient | None = _build_language_client()

if language_client is None:
    log.warning("Azure Language client not configured.")

if client is None:
    log.warning(
        "Azure Agent not configured. /query will return 503 until the "
        "required environment variables are set."
    )
else:
    log.info(
        "Azure Agent client ready (ENDPOINT=%r, AGENT_NAME=%r, "
        "AGENT_VERSION=%r).",
        ENDPOINT,
        AGENT_NAME,
        AGENT_VERSION,
    )


class QueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=MAX_QUERY_LENGTH)

    @field_validator("query")
    @classmethod
    def query_must_not_be_blank(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Query must not be blank")
        return normalized


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Support Bot", version="1.1.0", root_path="/api/backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def _client_ip(request: Request) -> str:
    if TRUST_PROXY_HEADERS:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",", maxsplit=1)[0].strip()

    return request.client.host if request.client else "unknown"


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "endpoint": bool(ENDPOINT),
        "agent_name": bool(AGENT_NAME),
        "azure_openai_configured": client is not None,
        "azure_language_configured": language_client is not None,
        "rate_limit_enabled": RATE_LIMIT_ENABLED,
    }


@app.post("/query")
async def query(request_body: QueryRequest, request: Request):
    if client is None or language_client is None:
        raise HTTPException(status_code=503, detail="Azure AI not configured")

    if RATE_LIMIT_ENABLED:
        decision = rate_limiter.check_and_record(_client_ip(request))
        if not decision.allowed:
            log.warning(
                "Rate limit rejected request (scope=%s, retry_after=%s).",
                decision.scope,
                decision.retry_after,
            )
            raise HTTPException(
                status_code=429,
                detail="Request limit reached. Please try again later.",
                headers={"Retry-After": str(decision.retry_after)},
            )

    query_text = request_body.query

    try:
        analysis = analyze_text(query_text)
        response = ask_llm(
            question=query_text,
            language=analysis["language"]["isoCode"],
            sentiment=analysis["sentiment"]["value"],
            key_phrases=analysis["keyPhrases"],
        )

        return {
            "response": {
                "queryResponse": response.strip(),
                "nlpAnalysis": analysis,
            }
        }
    except HTTPException:
        raise
    except Exception:
        log.exception("Error querying Azure AI")
        raise HTTPException(
            status_code=502, detail="Error querying Azure AI"
        ) from None


def ask_llm(
    question: str,
    language: str,
    sentiment: str,
    key_phrases: list[str],
) -> str:
    faq_entries = faq_retriever.search(question, key_phrases)
    faq_context = "\n\n".join(
        f"FAQ {index}\nQuestion: {entry['question']}\nAnswer: {entry['answer']}"
        for index, entry in enumerate(faq_entries, start=1)
    )
    if not faq_context:
        faq_context = "No relevant FAQ entries were found."

    analysis_context = f"""
Additional analysis about the user's message:

Language: {language}
Sentiment: {sentiment}
Key phrases: {", ".join(key_phrases)}

Instructions:
- Answer only with information explicitly present in the FAQ context below.
- If the context does not contain the answer, say that the information is not
  available in the FAQ. Do not use outside knowledge or make assumptions.
- Answer in the same language as the user.
- Use the key phrases to better understand the topic.
- If the user is frustrated or the sentiment is negative, respond
  empathetically but remain concise.
- Do not mention that sentiment analysis was performed.

FAQ context:
{faq_context}

User question:
{question}
"""

    response = client.with_options(
        timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
        max_retries=0,
    ).responses.create(
        input=analysis_context,
        max_output_tokens=AZURE_MAX_OUTPUT_TOKENS,
        extra_body={
            "agent_reference": {
                "name": AGENT_NAME,
                "version": AGENT_VERSION,
                "type": "agent_reference",
            }
        },
    )
    return response.output_text


def analyze_text(text: str) -> dict:
    documents = [text]
    language_result = language_client.detect_language(documents)[0]
    pii_result = language_client.recognize_pii_entities(documents)[0]
    entities_result = language_client.recognize_entities(documents)[0]
    key_phrase_result = language_client.extract_key_phrases(documents)[0]
    sentiment_result = language_client.analyze_sentiment(
        documents, show_opinion_mining=True
    )[0]

    return {
        "language": {
            "name": language_result.primary_language.name,
            "isoCode": language_result.primary_language.iso6391_name,
            "confidence": language_result.primary_language.confidence_score,
        },
        "sentiment": {
            "value": sentiment_result.sentiment,
            "positive": sentiment_result.confidence_scores.positive,
            "neutral": sentiment_result.confidence_scores.neutral,
            "negative": sentiment_result.confidence_scores.negative,
        },
        "keyPhrases": key_phrase_result.key_phrases,
        "pii": [
            {
                "text": entity.text,
                "category": entity.category,
                "confidence": entity.confidence_score,
            }
            for entity in pii_result.entities
        ],
        "entities": [
            {
                "text": entity.text,
                "category": entity.category,
                "subcategory": entity.subcategory,
                "confidence": entity.confidence_score,
            }
            for entity in entities_result.entities
        ],
    }


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
    )
