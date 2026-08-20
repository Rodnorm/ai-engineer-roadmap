"""
Support Bot — backend (Azure OpenAI, /openai/v1, AAD).

Exposes:
    POST /query  
    GET  /health

"""

import os
import logging

from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from azure.ai.projects import AIProjectClient
from fastapi.middleware.cors import CORSMiddleware
from azure.ai.textanalytics import TextAnalyticsClient
from azure.identity import DefaultAzureCredential, ClientSecretCredential

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

PORT = int(os.getenv("PORT", "8000"))
AGENT_NAME = os.getenv("AZURE_AGENT_NAME", "")
AGENT_VERSION = os.getenv("AZURE_AGENT_VERSION", "")
ENDPOINT = os.getenv("AZURE_AGENT_ENDPOINT", "").rstrip("/")
AZURE_LANGUAGE_ENDPOINT= os.getenv("AZURE_LANGUAGE_ENDPOINT", "")

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
        credential=credential
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
language_client: OpenAI | None = _build_language_client()

if language_client is None:
    log.warning(
        "Azure Language Client not configured (Language Client=%r).", language_client
    )
    
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
    if client is None:
        raise HTTPException(status_code=503, detail="Azure OpenAI not configured")

    if request.query is None:
        raise HTTPException(status_code=300, detail="Query must not be empty")

    query: str = request.query
    analysis = analyze_text(query)

    try:
        response = ask_llm(
            question=query,
            language=analysis["language"]["isoCode"],
            sentiment=analysis["sentiment"]["value"],
            key_phrases=analysis["keyPhrases"]
        )

        return {
            "response": {
                "queryResponse": response.strip(),
                "nlpAnalysis": analysis
            }
        }

    except Exception as e:
        log.error("Error querying Azure OpenAI: %s", e)
        raise HTTPException(status_code=500, detail="Error querying Azure OpenAI")

def ask_llm(
    question: str,
    language: str,
    sentiment: str,
    key_phrases: list[str]
):
     analysis_context = f"""
        Additional analysis about the user's message:

        Language: {language}
        Sentiment: {sentiment}
        Key phrases: {", ".join(key_phrases)}
        Instructions:
            - Answer in the same language as the user.
            - Use the key phrases to better understand the topic.
            - If the user is frustrated or the sentiment is negative,
            respond empathetically but remain concise.
            - Do not mention that sentiment analysis was performed.

        User question:
        {question}
        """
     response = client.responses.create(
            input=analysis_context,
            extra_body={
                "agent_reference": {
                    "name": AGENT_NAME,
                    "version": AGENT_VERSION,
                    "type": "agent_reference"
                }
            }
    )
     return response.output_text




def analyze_text(text: str):
    documents = [text]
    language_result = language_client.detect_language(documents)[0]
    pii_result = language_client.recognize_pii_entities(documents)[0]
    entities_result = language_client.recognize_entities(documents)[0]
    key_phrase_result = language_client.extract_key_phrases(documents)[0]
    sentiment_result = language_client.analyze_sentiment(documents, show_opinion_mining=True)[0]

    return {
        "language": {
            "name": language_result.primary_language.name,
            "isoCode": language_result.primary_language.iso6391_name,
            "confidence": language_result.primary_language.confidence_score
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
                "confidence": entity.confidence_score
            }
            for entity in pii_result.entities
        ],
        "entities": [
            {
                "text": entity.text,
                "category": entity.category,
                "subcategory": entity.subcategory,
                "confidence": entity.confidence_score
            }
            for entity in entities_result.entities
        ]
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