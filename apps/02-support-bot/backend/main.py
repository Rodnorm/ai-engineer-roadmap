"""
Support Bot — backend (Azure OpenAI, /openai/v1, AAD).

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

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from openai import OpenAI
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
    
load_dotenv()

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("support-bot")

ENDPOINT = os.getenv("AZURE_AGENT_ENDPOINT", "").rstrip("/")
PORT = int(os.getenv("PORT", "8000"))
AGENT_NAME = os.getenv("AZURE_AGENT_NAME", "")
AGENT_VERSION = os.getenv("AZURE_AGENT_VERSION", "")



def _build_client():
    if not ENDPOINT or not AGENT_NAME or not AGENT_VERSION:
        return None

    project_client = AIProjectClient(
        endpoint=ENDPOINT,
        credential=DefaultAzureCredential(),
    )

    return project_client.get_openai_client()

client: OpenAI | None = _build_client()
if client is None:
    log.warning(
        "Azure Agent not configured (ENDPOINT=%r, AGENT_NAME=%r; AGENT_VERSION=%r). "
        "/query will return 503 until env vars are set.",
        ENDPOINT,
        AGENT_NAME,
        AGENT_VERSION
    )
else:
    log.info("Azure Agent client ready (ENDPOINT=%r, AGENT_NAME=%r; AGENT_VERSION=%r).",
            ENDPOINT,
            AGENT_NAME,
            AGENT_VERSION
    )


class QueryRequest(BaseModel):
    query: str

    

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Support Bot", version="1.0.0", root_path="/api/backend")

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
        "endpoint": ENDPOINT is not None,
        "agent_name": AGENT_NAME is not None,
        "azure_openai_configured": client is not None,
    }


@app.post("/query")
async def query(request: QueryRequest):
    print("teste")
    print(query)
    if client is None:
        raise HTTPException(status_code=503, detail="Azure OpenAI not configured")

    try:
        response = client.responses.create(
        input=[{"role": "user", "content": request.query}],
        extra_body={"agent_reference": {"name": AGENT_NAME, "version": AGENT_VERSION, "type": "agent_reference"}},
)
        return {"response": response.output_text}
    except Exception as e:
        log.error("Error querying Azure OpenAI: %s", e)
        raise HTTPException(status_code=500, detail="Error querying Azure OpenAI")


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