"""
Smart Inspector — backend (Azure OpenAI, /openai/v1, AAD).

Exposes:
    POST /analyze   multipart/form-data, field "image"  -> { caption, tags, objects, ocr, averagePrice, lowestPriceLink }
    GET  /health

Env vars (see .env.example):
    AZURE_OPENAI_ENDPOINT   e.g. https://<resource>.services.ai.azure.com/openai/v1
    AZURE_OPENAI_DEPLOYMENT e.g. gpt-4.1-mini
    PORT                    optional, default: 8000

Auth: DefaultAzureCredential. Run `az login` locally, or set
AZURE_CLIENT_ID / AZURE_TENANT_ID / AZURE_CLIENT_SECRET for a service principal.
"""

from __future__ import annotations

import base64
import json
import logging
import os
from typing import List

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

load_dotenv()

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("smart-inspector")

ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
PORT = int(os.getenv("PORT", "8000"))


def _build_client() -> OpenAI | None:
    if not ENDPOINT or not DEPLOYMENT:
        return None
    token_provider = get_bearer_token_provider(
        DefaultAzureCredential(), "https://ai.azure.com/.default"
    )
    return OpenAI(base_url=ENDPOINT, api_key=token_provider)


client: OpenAI | None = _build_client()
if client is None:
    log.warning(
        "Azure OpenAI not configured (ENDPOINT=%r, DEPLOYMENT=%r). "
        "/analyze will return 503 until env vars are set.",
        ENDPOINT,
        DEPLOYMENT,
    )
else:
    log.info("Azure OpenAI client ready (endpoint=%s, deployment=%s).", ENDPOINT, DEPLOYMENT)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AnalysisResult(BaseModel):
    caption: str = Field("", description="One-line description of the image.")
    tags: List[str] = Field(default_factory=list, description="Short keyword tags.")
    objects: List[str] = Field(default_factory=list, description="Detected objects in the image.")
    ocr: str = Field("", description="All visible text in the image.")
    averagePrice: str = Field("", description="The average price of the item in the image.")
    lowestPriceLink: str = Field("", description="The link to the lowest price of the item in the image to be bought online, if applicable.")

SYSTEM_PROMPT = (
    "You are a vision inspector. "
    "Always respond with a single valid JSON object that matches the requested schema. "
    "Do not include any prose, markdown, or code fences."
)

# Map of locale codes the frontend may send → human-readable language name
# to inject into the prompt. Unknown codes fall back to English.
LANGUAGE_NAMES: dict[str, str] = {
    "pt-br": "Brazilian Portuguese",
    "en": "English",
    "de": "German",
}
DEFAULT_LANGUAGE_CODE = "de"


def _build_user_prompt(language: str) -> str:
    """Build the user prompt with an explicit language directive for the
    caption/tags/objects fields. The `ocr` field is intentionally exempt —
    it must mirror whatever is actually printed in the image."""
    return f"""Analyze the attached image and respond with a JSON object using this exact schema:

{{
  "caption": string,   // a single concise line (max ~20 words) describing what is in the image
  "tags": string[],    // 3-8 short, lowercase keyword tags (e.g. "indoor", "document", "blurry")
  "objects": string[], // list of distinct objects you can identify (nouns, lowercase)
  "ocr": string        // every piece of visible text in the image, with line breaks preserved;
                       // use an empty string if no text is visible
  "averagePrice": string // the average price of the item in the image either in Reais, Dollars or Euros depending on the language used, if applicable. You can only add a price if you also sent a link with the lowest price of the item in the image to be bought online. If not applicable, use an empty string.
  "lowestPriceLink": string // the link to the lowest price of the item in the image to be bought online, if applicable
}}

Rules:
- Output ONLY the JSON object. No explanations, no markdown.
- If a field has no content, use an empty array or empty string.
- Keep tags and objects lowercase and free of duplicates.
- Write the `caption` and every value in `tags` and `objects` in {LANGUAGE_NAMES.get(language.lower(), LANGUAGE_NAMES[DEFAULT_LANGUAGE_CODE])}.
- The `ocr` field must be a verbatim transcription of the text visible in the image, in its original language.
- the `averagePrice` field must be a string with the average price of the item in the image either in Reais, Dollars or Euros depending on the language used, if applicable, example: "R$ 199,90". Search also with the help of the OCR text. This info is important, so try to find an average price, look on the amazon website using the OCR text and the name of the item. If not applicable, use an empty string.
- the `lowestPriceLink` field must be a string with the link to the lowest price of the item in the image to be bought online, if applicable. DO not get creative here, if you do not find any link do not make one up. In that case, send an empty string.
"""


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Smart Inspector", version="1.0.0")

# CORS — the Next.js dev server runs on :3000. We allow any localhost/127.0.0.1
# origin on any port to avoid Origin mismatches when the browser normalizes
# `localhost` <-> `127.0.0.1`.
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
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "azure_openai_configured": client is not None,
        "endpoint": ENDPOINT or None,
        "deployment": DEPLOYMENT or None,
    }


def _clean_str_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for v in value:
        if isinstance(v, str):
            s = v.strip()
            if s:
                out.append(s)
    seen: set[str] = set()
    deduped: list[str] = []
    for s in out:
        key = s.lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(s)
    return deduped


@app.post("/analyze", response_model=AnalysisResult)
async def analyze(
    image: UploadFile = File(...),
    language: str = Form(DEFAULT_LANGUAGE_CODE),
) -> AnalysisResult:
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT and "
                   "AZURE_OPENAI_DEPLOYMENT in backend/.env, and authenticate with `az login`.",
        )

    raw = await image.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file.")

    mime = (image.content_type or "").lower()
    if not mime.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content-type '{image.content_type}'. Expected an image/* mime.",
        )

    b64 = base64.b64encode(raw).decode("ascii")
    data_url = f"data:{mime};base64,{b64}"

    # Validate the requested language. Unknown codes fall back to the default
    # rather than failing the request — the prompt will still instruct the
    # model, just in English.
    requested_language = (language or DEFAULT_LANGUAGE_CODE).strip() or DEFAULT_LANGUAGE_CODE
    language_name = LANGUAGE_NAMES.get(requested_language.lower())
    if language_name is None:
        log.warning(
            "Unknown language code %r from client, falling back to %s.",
            language,
            DEFAULT_LANGUAGE_CODE,
        )
        requested_language = DEFAULT_LANGUAGE_CODE

    log.info(
        "Analyzing image: name=%s size=%d mime=%s language=%s",
        image.filename,
        len(raw),
        mime,
        requested_language,
    )

    user_prompt = _build_user_prompt(requested_language)

    # Build multimodal input for the Responses API.
    # Note: `responses.create` takes a flat `input` list for image+text content.
    input_payload = [
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": user_prompt},
                {"type": "input_image", "image_url": data_url},
            ],
        }
    ]

    try:
        response = client.responses.create(
            model=DEPLOYMENT,
            instructions=SYSTEM_PROMPT,
            input=input_payload,
            max_output_tokens=800,
        )
    except Exception as exc:  # noqa: BLE001
        log.exception("Azure OpenAI call failed.")
        raise HTTPException(status_code=502, detail=f"Azure OpenAI error: {exc}") from exc

    # Pull the assistant text out of the Responses output.
    raw_content = ""
    for item in getattr(response, "output", []) or []:
        # output_text items have a .text attribute
        if getattr(item, "type", None) == "output_text":
            raw_content += getattr(item, "text", "") or ""
        # some SDK versions use a 'content' list
        elif getattr(item, "content", None):
            for part in item.content:
                if getattr(part, "type", None) in ("output_text", "text"):
                    raw_content += getattr(part, "text", "") or ""

    raw_content = raw_content.strip() or "{}"

    # Defensive parse: tolerate markdown fences and missing fields.
    text = raw_content.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        log.error("Model returned non-JSON content: %r", raw_content[:500])
        raise HTTPException(
            status_code=502,
            detail=f"Model returned non-JSON content: {exc}",
        ) from exc

    if not isinstance(parsed, dict):
        raise HTTPException(
            status_code=502,
            detail="Model returned JSON of unexpected shape (expected object).",
        )

    caption = parsed.get("caption") if isinstance(parsed.get("caption"), str) else ""
    ocr = parsed.get("ocr") if isinstance(parsed.get("ocr"), str) else ""
    tags = _clean_str_list(parsed.get("tags"))
    objects = _clean_str_list(parsed.get("objects"))
    averagePrice = parsed.get("averagePrice") if isinstance(parsed.get("averagePrice"), str) else ""
    lowestPriceLink = parsed.get("lowestPriceLink") if isinstance(parsed.get("lowestPriceLink"), str) else ""

    result = AnalysisResult(caption=caption.strip(), tags=tags, objects=objects, ocr=ocr, averagePrice=averagePrice, lowestPriceLink=lowestPriceLink)
    log.info(
        "Result: caption=%r tags=%d objects=%d ocr_len=%d averagePrice_len=%d lowestPriceLink_len=%d",
        result.caption[:80],
        len(result.tags),
        len(result.objects),
        len(result.ocr),
        len(result.averagePrice),
        len(result.lowestPriceLink)
    )
    return result


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "smart-inspector:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
    )