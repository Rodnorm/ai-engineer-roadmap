# App 03 — promptForge

A Next.js content studio for marketers to turn a brief into three structured content variations using distinct personas.

The frontend is complete and runs with local preview data. Azure OpenAI generation, Vercel AI SDK streaming, Content Safety, and persistent request logging are intentionally left for the API integration step.

## Frontend features

- Marketing brief, target audience, and content format inputs
- Friendly SaaS Marketer, Technical Blogger, and Skeptical CFO personas
- Temperature, Top P, and max-token controls
- Progressive preview of three generated variations
- Structured `title`, `body`, and `seoKeywords` output
- Preview and JSON views, copy action, and JSON export
- Local Content Safety blocked-state preview
- Per-request token and estimated-cost log
- Responsive light and dark themes
- English, Portuguese, and German translations

## Structure

```text
03-prompt-forge/
├── backend/      # API scaffold; integration pending
├── frontend/     # Complete interactive frontend preview
├── README.md
└── vercel.json
```

## Frontend setup

From `apps/03-prompt-forge/frontend`:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Pending API integrations

- Azure OpenAI structured generation
- Vercel AI SDK streaming
- Azure AI Content Safety
- Persistent cost and token logging

The current frontend makes no API requests. Its local generation flow exists to demonstrate and validate the final user experience before those integrations are added.
