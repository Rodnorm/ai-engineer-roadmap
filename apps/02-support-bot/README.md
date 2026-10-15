# Support Bot

A multilingual FAQ support assistant built with Next.js, FastAPI, Azure AI Foundry, and Azure AI Language.

The application combines local FAQ retrieval with natural-language analysis. A user sends a question through the chat interface, the backend analyzes the message, selects up to three relevant FAQ entries, and sends them to an Azure AI Foundry agent as grounding context.

## Features

- Locally grounded FAQ answers with an Azure AI Foundry agent
- Language detection
- Sentiment analysis with confidence scores
- Key-phrase extraction
- Named-entity recognition
- PII detection
- NLP details associated with individual user messages
- German, English, and Brazilian Portuguese interface
- Responsive chat interface
- Request cancellation
- FAQ page generated from localized knowledge-base data

## Architecture

```text
Browser
   │
   ▼
Next.js frontend
   │  POST /api
   ▼
FastAPI backend
   ├── Azure AI Language
   │   ├── language detection
   │   ├── sentiment analysis
   │   ├── key phrases
   │   ├── entities
   │   └── PII detection
   │
   ├── Local FAQ keyword retrieval
   └── Azure AI Foundry agent (no attached knowledge base required)
```

The NLP analysis provides additional context to the agent, including the detected language, sentiment, and key phrases. The agent is instructed to answer in the user's language and to respond empathetically when negative sentiment is detected.

## Project structure

```text
02-support-bot/
├── backend/
│   ├── data/                   # Local FAQ source files
│   ├── .env.example
│   ├── main.py                 # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Chat and NLP UI components
│   ├── data/                   # Localized FAQ data
│   ├── lib/                    # API client and i18n utilities
│   └── package.json
├── compose.coolify.yml         # Coolify Docker Compose deployment definition
└── README.md
```

## Technology stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React
- App Router
- Cookie-based locale selection

### Backend

- Python
- FastAPI
- Pydantic
- Azure AI Projects
- Azure OpenAI client
- Azure AI Text Analytics
- Azure Identity

### Infrastructure

- Azure AI Foundry
- Azure AI Language
- Microsoft Entra ID
- Coolify + Hetzner

## Prerequisites

- Node.js 20.9 or newer
- Python 3.10 or newer
- An Azure AI Foundry project
- A deployed Azure AI Foundry agent without an attached knowledge base
- An Azure AI Language resource
- A Microsoft Entra ID application or another supported Azure credential
- The required Azure role assignments for both services

## Environment configuration

Copy the backend environment example:

```bash
cd apps/02-support-bot/backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the following variables:

```env
PORT=8000

AZURE_AGENT_NAME=<agent-name>
AZURE_AGENT_VERSION=<agent-version>
AZURE_AGENT_ENDPOINT=<agent-endpoint>

AZURE_TENANT_ID=<tenant-id>
AZURE_CLIENT_ID=<client-id>
AZURE_CLIENT_SECRET=<client-secret>

AZURE_LANGUAGE_ENDPOINT=<language-service-endpoint>

# Cost and abuse guards
MAX_QUERY_LENGTH=2000
AZURE_MAX_OUTPUT_TOKENS=800
AZURE_REQUEST_TIMEOUT_SECONDS=30
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=5
RATE_LIMIT_REQUESTS_PER_DAY_PER_IP=30
RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY=300
TRUST_PROXY_HEADERS=false
```

Do not commit the completed `.env` file.

The identity must have permission to invoke the Azure AI Foundry agent and analyze text with the Azure AI Language resource.

### Cost and abuse guards

The backend enables conservative limits by default:

- 2,000 characters per query
- 800 maximum output tokens
- 30-second Azure OpenAI timeout
- No automatic OpenAI request retries
- 5 requests per minute per IP
- 30 requests per day per IP
- 300 requests per day across processes sharing the SQLite counter database

A rejected request returns HTTP `429` with a `Retry-After` header. Invalid or oversized input is rejected with HTTP `422` before any Azure service is called.

The limiter persists counters in SQLite (`RATE_LIMIT_DB_PATH`). Processes sharing
the same file share quotas; separate hosts/volumes do not. Production requires
`RATE_LIMIT_HASH_KEY` of at least 32 characters. Persist the counter volume across
restarts; these request limits are not a hard cloud-spending cap.

Forwarded client IPs are accepted only when `TRUST_PROXY_HEADERS=true` and the
connecting peer belongs to `TRUSTED_PROXY_CIDRS`. Leave proxy trust disabled for
direct, untrusted connections.

## Running locally

### 1. Start the backend

From `apps/02-support-bot/backend`:

```bash
python -m venv .venv
```

Activate the environment:

```bash
# Windows
.venv\Scripts\activate

# macOS or Linux
source .venv/bin/activate
```

Install dependencies and start FastAPI:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Check the service:

```bash
curl http://localhost:8000/health
```

Run the dependency-free backend tests:

```bash
python -m unittest test_rate_limit.py test_local_retrieval.py
```

To verify HTTP rate limiting locally without consuming many Azure calls, temporarily set `RATE_LIMIT_REQUESTS_PER_MINUTE=1`, restart the backend, and send two valid requests. The second request should return HTTP `429`.

### 2. Start the frontend

From `apps/02-support-bot/frontend`:

```bash
cp .env.example .env.local
# Set BACKEND_URL=http://localhost:8000 in .env.local
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

The Next.js `POST /api` route forwards to `BACKEND_URL` plus `/query`, or to
`MESSAGE_SERVICE_URL` as a fallback. For root `npm run dev:02`, set
`BACKEND_URL=http://localhost:8002`; the orchestrator currently sets the unused
`BACKEND_INTERNAL_URL` variable.

## API

### Health check

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "generation_enabled": true,
  "azure_openai_configured": true,
  "azure_language_configured": true,
  "rate_limit_enabled": true
}
```

### Query the assistant

```http
POST /query
Content-Type: application/json
```

Request:

```json
{
  "query": "Why was my insurance claim rejected?"
}
```

Response shape:

```json
{
  "response": {
    "queryResponse": "The assistant response",
    "nlpAnalysis": {
      "language": {
        "name": "English",
        "isoCode": "en",
        "confidence": 0.99
      },
      "sentiment": {
        "value": "negative",
        "positive": 0.01,
        "neutral": 0.09,
        "negative": 0.90
      },
      "keyPhrases": [],
      "pii": [],
      "entities": []
    }
  }
}
```

## Local FAQ retrieval

The demo loads `backend/data/healthcare-billing-kb.json` when the backend starts. For each request, a dependency-free keyword search scores FAQ questions and answers, selects up to three related entries, and sends only those entries to the Foundry agent. The prompt tells the agent to answer exclusively from that context and to state when the FAQ does not contain the requested information.

Local retrieval is a deliberate fit for this demo because the FAQ is small and static. It keeps the implementation easy to inspect and avoids the fixed running cost of a dedicated Azure AI Search service. The Foundry agent used by the demo therefore does not need an attached knowledge base.

The frontend contains localized FAQ datasets for:

- German
- English
- Brazilian Portuguese

Azure AI Search becomes appropriate when the corpus grows, includes varied document formats, or needs vector search, semantic search, managed indexing, or more advanced ranking.

### Optional alternative: hosted retrieval with Azure AI Search

This integration is an alternative only and is **not used by the current demo**. A short migration path is:

1. In the Azure portal, create an Azure AI Search service in a supported region. Choose the pricing model and tier for the expected storage, query volume, scaling, and required features; review the current tier documentation before provisioning because the choice affects cost and capacity.
2. Create a searchable index with retrievable question and answer fields, then import the FAQ documents through the portal's import-data flow or another supported indexer. Configure semantic or vector fields only if the intended search mode requires them.
3. In Microsoft Foundry, add the Search service as a project connection. Add the existing index as an Azure AI Search tool or knowledge source, then connect it to the agent or a Foundry IQ knowledge base and grant the required managed-identity data access.
4. Replace the call to `faq_retriever.search(...)` in `backend/main.py` with retrieval from the hosted index or knowledge base, pass those results as grounding context, and add the corresponding Azure Search client configuration and dependency.

For current setup details, see Microsoft's documentation for [choosing an Azure AI Search tier](https://learn.microsoft.com/azure/search/search-sku-tier), [creating a search index knowledge source](https://learn.microsoft.com/azure/search/agentic-knowledge-source-how-to-search-index), and [connecting an Azure AI Search index to Foundry agents](https://learn.microsoft.com/azure/ai-foundry/agents/how-to/tools/ai-search).

## Deployment

The app includes a Docker Compose configuration for Coolify (`compose.coolify.yml`):

- `web`: the Next.js frontend
- `backend`: the FastAPI application

The frontend `POST /api` route proxies to the internal backend service.

Configure all required environment variables in the Coolify resource. Never store Azure credentials in source control.

## Security and privacy

The application analyzes messages for personally identifiable information. Before using it with real healthcare or customer data:

- Redact or exclude PII before sending content to the agent
- Avoid returning detected PII to the browser unless it is required
- Do not log complete user messages
- Add authentication and authorization
- Keep rate limits and request-size limits enabled
- Define data-retention and deletion policies
- Use least-privilege Azure roles
- Prefer managed identities in production
- Validate organizational and regulatory requirements

This project is currently a learning application and should not be treated as a production healthcare system without these controls.

## Implemented checks and known limitations

Backend tests cover local retrieval, rate limiting and proxy-IP handling; the repository
also contains frontend/E2E tests and CI workflows. Backend dependency locks exist.
The Azure OpenAI client has explicit timeout/output-token bounds and disables retries;
these controls should not be interpreted as a single deadline across every NLP call.

PII entries returned in `nlpAnalysis.pii` contain `maskedText`, category and confidence.
This does not redact the original question: it is sent to Azure Language and the
Foundry agent. Named entities/key phrases may also contain sensitive content.

FAQ retrieval is a small static keyword search. There is no user account system,
conversation database, vector search, or human-handoff integration. Each `/query`
request supplies one question; browser chat history is not a persistent multi-turn
agent conversation. Azure Search remains an optional future integration.
