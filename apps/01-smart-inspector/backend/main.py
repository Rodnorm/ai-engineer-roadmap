"""Smart Inspector backend using Azure OpenAI's Responses API.

Exposes:
    POST /analyze  multipart/form-data, fields "image" and "language"
    GET  /health

Authentication uses AZURE_OPENAI_API_KEY. See .env.example for configuration.
"""

from __future__ import annotations

import base64
import logging
import os
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

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
log = logging.getLogger("smart-inspector")

ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
PORT = _env_int("PORT", 8000)

MAX_IMAGE_BYTES = _env_int("MAX_IMAGE_BYTES", 5 * 1024 * 1024, 1024)
AZURE_MAX_OUTPUT_TOKENS = _env_int("AZURE_MAX_OUTPUT_TOKENS", 800)
AZURE_REQUEST_TIMEOUT_SECONDS = _env_float(
    "AZURE_REQUEST_TIMEOUT_SECONDS", 30.0
)
RATE_LIMIT_ENABLED = _env_bool("RATE_LIMIT_ENABLED", True)
TRUST_PROXY_HEADERS = _env_bool("TRUST_PROXY_HEADERS", True)

ALLOWED_IMAGE_TYPES = {
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
}
UPLOAD_CHUNK_BYTES = 1024 * 1024

rate_limiter = InMemoryRateLimiter(
    requests_per_minute=_env_int("RATE_LIMIT_REQUESTS_PER_MINUTE", 5),
    requests_per_day_per_ip=_env_int(
        "RATE_LIMIT_REQUESTS_PER_DAY_PER_IP", 30
    ),
    global_requests_per_day=_env_int(
        "RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY", 300
    ),
)


def _build_client() -> OpenAI | None:
    if not ENDPOINT or not DEPLOYMENT or not API_KEY:
        return None

    return OpenAI(base_url=ENDPOINT, api_key=API_KEY)


client: OpenAI | None = _build_client()
if client is None:
    log.warning(
        "Azure OpenAI is not fully configured. /analyze will return 503 "
        "until endpoint, deployment, and API key are set."
    )
else:
    log.info(
        "Azure OpenAI client ready (endpoint=%s, deployment=%s).",
        ENDPOINT,
        DEPLOYMENT,
    )


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AnalysisResult(BaseModel):
    caption: str = Field(
        "",
        description="One-line description of the image.",
    )
    tags: List[str] = Field(
        default_factory=list,
        description="Short keyword tags.",
    )
    objects: List[str] = Field(
        default_factory=list,
        description="Detected objects in the image.",
    )
    ocr: str = Field(
        "",
        description="All visible text in the image.",
    )
    averagePrice: str = Field(
        "",
        description="The average price of the item in the image.",
    )
    lowestPriceLink: str = Field(
        "",
        description=(
            "The link to the lowest price of the item online, if applicable."
        ),
    )


SYSTEM_PROMPT = (
    "You are a vision inspector. "
    "Analyze the provided image according to the user's instructions. "
    "Return the requested information using the provided response schema."
)

LANGUAGE_NAMES: dict[str, str] = {
    "pt-br": "Brazilian Portuguese",
    "en": "English",
    "de": "German",
}
DEFAULT_LANGUAGE_CODE = "de"


def _build_user_prompt(language: str) -> str:
    language_name = LANGUAGE_NAMES.get(
        language.lower(),
        LANGUAGE_NAMES[DEFAULT_LANGUAGE_CODE],
    )

    return f"""
Analyze the attached image.

Extract:
- A concise caption with a maximum of 20 words.
- 3-8 short, lowercase tags.
- Distinct objects visible in the image.
- All visible text, preserving line breaks.
- The average price of the identified item, if applicable.
- A link to the lowest price found online, if applicable.

Rules:
- Write the caption, tags and objects in {language_name}.
- The OCR must preserve the original language and wording visible in the image.
- If no text is visible, return an empty OCR string.
- If a price cannot be reliably identified, return an empty string.
- Do not invent prices or links.
- Only provide a price when a corresponding valid product can be identified.
"""


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Smart Inspector",
    version="1.1.0",
    root_path="/api/backend",
)

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


@app.middleware("http")
async def remove_backend_prefix(request: Request, call_next):
    prefix = "/api/backend"

    if request.scope["path"].startswith(prefix):
        request.scope["path"] = request.scope["path"][len(prefix):]

    return await call_next(request)


def _client_ip(request: Request) -> str:
    if TRUST_PROXY_HEADERS:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",", maxsplit=1)[0].strip()

    return request.client.host if request.client else "unknown"


async def _read_upload_with_limit(image: UploadFile) -> bytes:
    chunks: list[bytes] = []
    total_bytes = 0

    try:
        while chunk := await image.read(UPLOAD_CHUNK_BYTES):
            total_bytes += len(chunk)
            if total_bytes > MAX_IMAGE_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=(
                        "Image is too large. Maximum allowed size is "
                        f"{MAX_IMAGE_BYTES} bytes."
                    ),
                )
            chunks.append(chunk)
    finally:
        await image.close()

    return b"".join(chunks)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "endpoint": bool(ENDPOINT),
        "deployment": bool(DEPLOYMENT),
        "azure_openai_configured": client is not None,
        "rate_limit_enabled": RATE_LIMIT_ENABLED,
        "max_image_bytes": MAX_IMAGE_BYTES,
    }


@app.post("/analyze", response_model=AnalysisResult)
async def analyze(
    request: Request,
    image: UploadFile = File(...),
    language: str = Form(DEFAULT_LANGUAGE_CODE),
) -> AnalysisResult:
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI is not configured.",
        )

    mime = (image.content_type or "").lower()
    if mime not in ALLOWED_IMAGE_TYPES:
        await image.close()
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported image type. Allowed types are GIF, JPEG, PNG, "
                "and WebP."
            ),
        )

    if RATE_LIMIT_ENABLED:
        decision = rate_limiter.check_and_record(_client_ip(request))
        if not decision.allowed:
            await image.close()
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

    raw = await _read_upload_with_limit(image)
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file.")

    b64 = base64.b64encode(raw).decode("ascii")
    data_url = f"data:{mime};base64,{b64}"

    requested_language = (
        (language or DEFAULT_LANGUAGE_CODE).strip()
        or DEFAULT_LANGUAGE_CODE
    )
    if requested_language.lower() not in LANGUAGE_NAMES:
        log.warning(
            "Unknown language code %r, falling back to %s.",
            language,
            DEFAULT_LANGUAGE_CODE,
        )
        requested_language = DEFAULT_LANGUAGE_CODE

    log.info(
        "Analyzing image: size=%d mime=%s language=%s",
        len(raw),
        mime,
        requested_language,
    )

    input_payload = [
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": _build_user_prompt(requested_language),
                },
                {"type": "input_image", "image_url": data_url},
            ],
        }
    ]

    try:
        response = client.with_options(
            timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
            max_retries=0,
        ).responses.parse(
            model=DEPLOYMENT,
            instructions=SYSTEM_PROMPT,
            input=input_payload,
            text_format=AnalysisResult,
            max_output_tokens=AZURE_MAX_OUTPUT_TOKENS,
        )
    except Exception:
        log.exception("Azure OpenAI call failed.")
        raise HTTPException(
            status_code=502,
            detail="Azure OpenAI request failed.",
        ) from None

    result = response.output_parsed
    if result is None:
        raise HTTPException(
            status_code=502,
            detail="Model did not return a structured response.",
        )

    log.info(
        "Analysis completed: tags=%d objects=%d ocr_len=%d.",
        len(result.tags),
        len(result.objects),
        len(result.ocr),
    )
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
    )
