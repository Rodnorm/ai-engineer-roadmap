"""Smart Inspector backend using Azure OpenAI's Responses API.

Exposes:
    POST /analyze  multipart/form-data, fields "image" and "language"
    GET  /health

Authentication uses AZURE_OPENAI_API_KEY. See .env.example for configuration.
"""

from __future__ import annotations

import asyncio
import base64
import io
import logging
import os
import time
import uuid
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from PIL import Image
from pydantic import BaseModel, Field

from client_ip import parse_trusted_proxy_cidrs, resolve_client_ip
from rate_limit import PersistentRateLimiter

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


APP_ENV = os.getenv("APP_ENV", "development").lower()
IS_PRODUCTION = APP_ENV == "production"

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

GENERATION_ENABLED = _env_bool("GENERATION_ENABLED", True)

MAX_IMAGE_BYTES = _env_int("MAX_IMAGE_BYTES", 5 * 1024 * 1024, 1024)
MAX_IMAGE_WIDTH = _env_int("MAX_IMAGE_WIDTH", 8000, 100)
MAX_IMAGE_HEIGHT = _env_int("MAX_IMAGE_HEIGHT", 8000, 100)
MAX_IMAGE_PIXELS = _env_int("MAX_IMAGE_PIXELS", 24_000_000, 10_000)

AZURE_MAX_OUTPUT_TOKENS = _env_int("AZURE_MAX_OUTPUT_TOKENS", 800)
AZURE_REQUEST_TIMEOUT_SECONDS = _env_float(
    "AZURE_REQUEST_TIMEOUT_SECONDS", 30.0
)

MAX_CONCURRENT_REQUESTS = _env_int("MAX_CONCURRENT_REQUESTS", 2, 1)
concurrency_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

RATE_LIMIT_ENABLED = _env_bool("RATE_LIMIT_ENABLED", True)
TRUST_PROXY_HEADERS = _env_bool("TRUST_PROXY_HEADERS", False)
TRUSTED_PROXY_CIDRS = parse_trusted_proxy_cidrs(os.getenv("TRUSTED_PROXY_CIDRS", ""))

ALLOWED_IMAGE_TYPES = {
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
}
UPLOAD_CHUNK_BYTES = 1024 * 1024

rate_limiter = PersistentRateLimiter(
    requests_per_minute=_env_int("RATE_LIMIT_REQUESTS_PER_MINUTE", 3),
    requests_per_day_per_ip=_env_int(
        "RATE_LIMIT_REQUESTS_PER_DAY_PER_IP", 20
    ),
    global_requests_per_day=_env_int(
        "RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY", 100
    ),    database_path=os.getenv(
        "RATE_LIMIT_DB_PATH",
        "/data/rate-limit.sqlite3" if IS_PRODUCTION else "./data/rate-limit.sqlite3",
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
        "Azure OpenAI client ready (endpoint configured, deployment=%s).",
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
# Helpers & Image Validation
# ---------------------------------------------------------------------------

def _client_ip(request: Request) -> str:
    return resolve_client_ip(
        request.client.host if request.client else None,
        request.headers.get("x-forwarded-for"),
        TRUST_PROXY_HEADERS,
        TRUSTED_PROXY_CIDRS,
    )


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


def _process_and_sanitize_image(raw_bytes: bytes) -> tuple[bytes, str]:
    """Validates real magic bytes, dimensions, integrity, and strips EXIF metadata."""
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        img = Image.open(io.BytesIO(raw_bytes))
        fmt = (img.format or "").upper()
        if fmt not in {"JPEG", "PNG", "GIF", "WEBP"}:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported image format '{fmt}'. Allowed formats are JPEG, PNG, GIF, and WebP.",
            )
        img.verify()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Corrupted or invalid image file.",
        ) from exc

    try:
        img = Image.open(io.BytesIO(raw_bytes))
        width, height = img.size
        pixels = width * height

        if width > MAX_IMAGE_WIDTH or height > MAX_IMAGE_HEIGHT or pixels > MAX_IMAGE_PIXELS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Image dimensions ({width}x{height}, {pixels} px) exceed "
                    f"maximum allowed limits ({MAX_IMAGE_WIDTH}x{MAX_IMAGE_HEIGHT}, {MAX_IMAGE_PIXELS} px)."
                ),
            )

        mime_map = {
            "JPEG": "image/jpeg",
            "PNG": "image/png",
            "GIF": "image/gif",
            "WEBP": "image/webp",
        }
        mime = mime_map[fmt]

        out_buf = io.BytesIO()
        if img.mode in ("RGBA", "P") and fmt == "JPEG":
            img = img.convert("RGB")

        img.save(out_buf, format=fmt)
        clean_bytes = out_buf.getvalue()
        return clean_bytes, mime
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Failed to process image.",
        ) from exc


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Smart Inspector",
    version="1.2.0",
    root_path="/api/backend",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
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
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def remove_backend_prefix(request: Request, call_next):
    prefix = "/api/backend"

    if request.scope["path"].startswith(prefix):
        request.scope["path"] = request.scope["path"][len(prefix):]

    return await call_next(request)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "generation_enabled": GENERATION_ENABLED,
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
    request_id = uuid.uuid4().hex[:12]
    start_time = time.monotonic()

    if not GENERATION_ENABLED:
        await image.close()
        log.warning("[%s] Rejected: Generation disabled via kill switch.", request_id)
        raise HTTPException(
            status_code=503,
            detail="Service is temporarily disabled for maintenance.",
        )

    if client is None:
        await image.close()
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI is not configured.",
        )

    if RATE_LIMIT_ENABLED:
        decision = rate_limiter.check_and_record(_client_ip(request))
        if not decision.allowed:
            await image.close()
            log.warning(
                "[%s] Rate limit rejected request (scope=%s, retry_after=%s).",
                request_id,
                decision.scope,
                decision.retry_after,
            )
            raise HTTPException(
                status_code=429,
                detail="Request limit reached. Please try again later.",
                headers={"Retry-After": str(decision.retry_after)},
            )

    # Concurrency Guard
    if concurrency_semaphore.locked():
        await image.close()
        log.warning("[%s] Concurrency limit reached.", request_id)
        raise HTTPException(
            status_code=429,
            detail="Server is currently busy processing requests. Please retry in a moment.",
        )

    raw = await _read_upload_with_limit(image)
    clean_bytes, mime = _process_and_sanitize_image(raw)

    b64 = base64.b64encode(clean_bytes).decode("ascii")
    data_url = f"data:{mime};base64,{b64}"

    requested_language = (
        (language or DEFAULT_LANGUAGE_CODE).strip()
        or DEFAULT_LANGUAGE_CODE
    )
    if requested_language.lower() not in LANGUAGE_NAMES:
        requested_language = DEFAULT_LANGUAGE_CODE

    log.info(
        "[%s] Processing image: size=%d bytes mime=%s language=%s",
        request_id,
        len(clean_bytes),
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

    async with concurrency_semaphore:
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
            log.exception("[%s] Azure OpenAI request failed.", request_id)
            raise HTTPException(
                status_code=502,
                detail=f"Azure OpenAI request failed. (Request ID: {request_id})",
            ) from None

    result = response.output_parsed
    if result is None:
        raise HTTPException(
            status_code=502,
            detail=f"Model did not return a structured response. (Request ID: {request_id})",
        )

    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    log.info(
        "[%s] Analysis completed successfully in %d ms (tags=%d, objects=%d).",
        request_id,
        elapsed_ms,
        len(result.tags),
        len(result.objects),
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
