# AI Engineer Roadmap

A hands-on collection of AI applications built as part of a structured 40-day learning roadmap.

The goal of this repository is to document the transition from senior frontend development toward AI engineering through small, production-oriented projects. Each application focuses on a different AI capability while covering the complete delivery cycle: solution design, frontend development, backend APIs, Azure AI integration, deployment, and documentation.

## Projects

| App | Focus | Main technologies | Status |
| --- | --- | --- | --- |
| [01 — Smart Inspector](./apps/01-smart-inspector) | Multimodal image analysis, OCR, structured outputs, and product identification | Next.js, TypeScript, FastAPI, Azure OpenAI | Completed |
| [02 — Support Bot](./apps/02-support-bot) | Knowledge-base question answering, language detection, sentiment analysis, key phrases, and entities | Next.js, TypeScript, FastAPI, Azure AI Foundry, Azure AI Language | Completed |

More applications will be added as the roadmap progresses.

## Architecture

Each project is self-contained and follows the same general structure:

```text
apps/<project>/
├── frontend/       # Next.js user interface
├── backend/        # FastAPI service and Azure AI integration
├── vercel.json     # Deployment and routing configuration
└── README.md       # Project-specific setup and documentation
```

The browser communicates with the Next.js application, which routes backend requests to a FastAPI service. The Python service is responsible for authentication, input processing, Azure AI calls, and response normalization.

## Repository structure

```text
.
├── apps/
│   ├── 01-smart-inspector/
│   └── 02-support-bot/
├── .gitignore
└── README.md
```

## Technology stack

### Frontend

- Next.js with the App Router
- React and TypeScript
- Tailwind CSS
- Internationalization in German, English, and Brazilian Portuguese
- Responsive and accessible UI components

### Backend

- Python
- FastAPI
- Pydantic
- Azure Identity
- Azure OpenAI Responses API
- Azure AI Projects
- Azure AI Language / Text Analytics

### Infrastructure

- Azure AI Foundry and Azure AI services
- Microsoft Entra ID authentication
- Vercel deployment
- Environment-based configuration

## Applications

### 01 — Smart Inspector

Smart Inspector accepts an image and returns a structured analysis containing:

- A concise caption
- Descriptive tags
- Detected objects
- OCR text
- Product information when it can be determined reliably

The backend sends the image to an Azure OpenAI multimodal deployment and uses a Pydantic schema with Structured Outputs to keep the response predictable for the frontend.

See the [Smart Inspector documentation](./apps/01-smart-inspector/README.md) for setup instructions and its API contract.

### 02 — Support Bot

Support Bot answers questions using a knowledge base deployed through Azure AI Foundry. Before querying the agent, the backend uses Azure AI Language to extract additional context from the message:

- Detected language
- Sentiment and confidence scores
- Key phrases
- Named entities
- Personally identifiable information detected by the analysis service

The UI presents the answer as a chat and can display the NLP analysis associated with each user message. It supports German, English, and Brazilian Portuguese.

See the [Support Bot documentation](./apps/02-support-bot/README.md) for architecture, Azure configuration, local setup, API examples, deployment notes, and security considerations.

## Running a project locally

Each application has independent frontend and backend dependencies.

### Backend

From the selected project's backend directory:

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

Install the dependencies and start FastAPI:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Copy the project's `.env.example` to `.env` and provide the required Azure configuration before starting the service.

### Frontend

From the selected project's frontend directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Refer to the project-specific README and environment examples because the required Azure resources and variables differ between applications.

## Security

- Secrets and local `.env` files must never be committed.
- Production deployments should use managed identities or service principals with least-privilege access.
- AI-generated results should be validated before they are displayed or used by another system.
- Applications that process user content should apply file-size limits, rate limits, timeout handling, and appropriate privacy controls.

## Roadmap goals

The projects are designed to build practical experience with:

- Azure AI resource configuration
- Multimodal models and OCR
- Prompt engineering
- Structured Outputs and application contracts
- Retrieval-augmented generation and knowledge bases
- NLP enrichment
- Agent-based solutions
- Authentication and deployment
- Monitoring, testing, safety, and responsible AI

## Current improvement priorities

The next repository-wide improvements are:

- Add automated frontend and backend tests
- Add CI workflows for linting, type checking, tests, and builds
- Standardize Azure authentication across services
- Improve validation, error handling, and observability
- Add rate limiting and privacy controls
- Pin backend dependencies for reproducible installations

## License

No license has been added yet. Unless a license is provided, the source code remains under the repository owner's default copyright.
