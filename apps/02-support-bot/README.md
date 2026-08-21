# Support Bot

A multilingual knowledge-base support assistant built with Next.js, FastAPI, Azure AI Foundry, and Azure AI Language.

The application combines retrieval-based question answering with natural-language analysis. A user sends a question through the chat interface, the backend analyzes the message, and an Azure AI Foundry agent answers using a deployed knowledge base.

## Features

- Knowledge-base question answering with an Azure AI Foundry agent
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
   │  POST /api/backend/query
   ▼
FastAPI backend
   ├── Azure AI Language
   │   ├── language detection
   │   ├── sentiment analysis
   │   ├── key phrases
   │   ├── entities
   │   └── PII detection
   │
   └── Azure AI Foundry agent
       └── deployed knowledge base
```

The NLP analysis provides additional context to the agent, including the detected language, sentiment, and key phrases. The agent is instructed to answer in the user's language and to respond empathetically when negative sentiment is detected.

## Project structure

```text
02-support-bot/
├── backend/
│   ├── data/                   # Knowledge-base source files
│   ├── .env.example
│   ├── main.py                 # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Chat and NLP UI components
│   ├── data/                   # Localized FAQ data
│   ├── lib/                    # API client and i18n utilities
│   └── package.json
├── vercel.json                 # Frontend/backend services and rewrites
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
- Vercel

## Prerequisites

- Node.js 20 or newer
- Python 3.10 or newer
- An Azure AI Foundry project
- A deployed agent with an attached knowledge base
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
```

Do not commit the completed `.env` file.

The identity must have permission to invoke the Azure AI Foundry agent and analyze text with the Azure AI Language resource.

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

### 2. Start the frontend

From `apps/02-support-bot/frontend`:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

During local development, Next.js rewrites requests from `/api/backend/*` to the FastAPI service running at `http://localhost:8000`.

## API

### Health check

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "endpoint": true,
  "agent_name": true,
  "azure_openai_configured": true
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

## Knowledge base and FAQ data

The backend's `data` directory contains source material used to build the healthcare billing knowledge base.

The frontend contains localized FAQ datasets for:

- German
- English
- Brazilian Portuguese

The deployed Azure AI Foundry knowledge base is the source used by the agent at runtime. Updating a local file does not automatically update the deployed knowledge base.

## Deployment

The included `vercel.json` defines two services:

- `frontend`: the Next.js application
- `backend`: the FastAPI application using `main:app`

Requests under `/api/backend/*` are routed to the backend, while all other requests are handled by the frontend.

Configure all required environment variables in the deployment platform. Never store Azure credentials in source control.

## Security and privacy

The application analyzes messages for personally identifiable information. Before using it with real healthcare or customer data:

- Redact or exclude PII before sending content to the agent
- Avoid returning detected PII to the browser unless it is required
- Do not log complete user messages
- Add authentication and authorization
- Add rate limiting and request-size limits
- Define data-retention and deletion policies
- Use least-privilege Azure roles
- Prefer managed identities in production
- Validate organizational and regulatory requirements

This project is currently a learning application and should not be treated as a production healthcare system without these controls.

## Known limitations

- Automated tests and CI workflows have not been added yet
- Azure SDK calls require improved timeout and error handling
- Authentication configuration should be standardized across Azure clients
- Backend dependencies should be pinned for reproducible builds
- PII should be redacted before the original message is forwarded to the agent
- The API needs production rate limiting and observability

## Possible next steps

- Add unit and integration tests
- Add Playwright end-to-end tests
- Add CI for linting, type checking, tests, and builds
- Introduce structured response models for the full API response
- Add telemetry, correlation IDs, and latency metrics
- Add conversation persistence with an explicit retention policy
- Add human handoff for unresolved or sensitive requests
