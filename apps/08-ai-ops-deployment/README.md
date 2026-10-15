# App 08 — AI Deployment & Operations Studio

A Next.js 15 / React 19 learning lab for AI inference routing and resilience.
It implements canary/blue-green policies, metrics, circuit-breaker state, rollback
rules and chaos scenarios within the application. It does not provision model
deployments, update a load balancer, or manage external production traffic.

## Implemented behavior

- Canary selection uses a request-ID hash and configured weights; blue-green selects
  one model target. Promote/revert actions update an in-memory owner policy.
- Shadow mode invokes the candidate after awaiting the primary result and includes
  its summary in the response. It is sequential, awaited comparison, not asynchronous
  background mirroring.
- `/api/simulate` processes batches of 1–10 requests and returns JSON after the batch.
  Online Azure calls stream internally to measure first-chunk timing, but the route
  does not stream tokens to the browser.
- Metrics include latency percentiles, token/cost estimates and an error-budget view.
  Rollback evaluates candidate latency/error rates (minimum three candidate samples)
  or an open circuit breaker. The breaker is shared by both targets within an owner
  session, not one breaker per model.
- Chaos scenarios modify latency, error status or schema validity. Prompt-injection
  handling uses local pattern matching; it is not comprehensive OWASP protection.
- EN/PT/DE UI, quick scenarios, session telemetry and incident history are included.

See [router](lib/router/traffic-router.ts), [simulation route](app/api/simulate/route.ts),
[inference client](lib/models/inference-client.ts) and
[rollback rules](lib/resilience/rollback-trigger.ts).

## Modes and known boundaries

`APP_MODE=offline` is the default. Responses and usage are simulated; latency uses
random jitter, so the entire simulation is not deterministic. Mock claims about
security or performance are not measurements of a real deployment.

`APP_MODE=online` with valid Azure configuration calls the selected baseline or
candidate deployment. Missing/unusable client configuration falls back to offline
execution. Provider call failures are recorded as failed telemetry. Cost values
use hard-coded pricing assumptions, not billing data; token counts can fall back
to estimates. Structured-output checking only attempts `JSON.parse`, not full
schema validation.

Manual target overrides are evaluated before rollback policy. The policy's
`maintenance` mode currently routes to Blue; use `DEPLOY_ENABLED=false` to block
simulation calls. The runtime kill-switch action in `/api/deploy` is process-wide
and can be changed by any browser session; there is no administrator role check.
These are material limits for using this demo as a production control plane.

## Local setup

Run inside `apps/08-ai-ops-deployment`:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3008. Replace `SESSION_SECRET` with a private random secret.
For online calls, set `APP_MODE=online`, Azure credentials and both deployment
names from `.env.example`. From the root, `npm run dev:08` forces offline mode
and `DEPLOY_ENABLED=true`; use the app-local command for other configurations.

## API and retention

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Service information |
| `GET /api/session` | Owner policy, recent telemetry, incidents and metrics |
| `DELETE /api/session` | Reset that owner's telemetry, incidents, breaker and policy |
| `POST /api/deploy` | Change policy, promote/revert target or toggle runtime kill switch |
| `POST /api/simulate` | Run an inference batch with optional chaos |

Signed cookies identify anonymous owners. Policies, incidents and telemetry remain
in process memory and disappear on restart. Normal telemetry insertion retains
50 records and 20 incidents per owner; the open-circuit branch currently bypasses
the telemetry cap. Records include prompt and response content. There is no TTL,
durable history, cross-replica coordination or account-based isolation.

Simulation rate limiting and concurrency are process-local. The code defaults to
30 requests/minute and two concurrent batches; `.env.example` sets 10 requests/minute.
In online mode, prompts are sent to Azure, including a second call in shadow mode.

## Validation and deployment

Run from this app directory:

```bash
npm run typecheck
npm test
npm run build
```

`npm run lint` is an alias for TypeScript checking. Tests cover routing, resilience,
inference-client configuration and i18n. The app is not yet included in the root
CI app matrix. See [COOLIFY.md](COOLIFY.md) for the single-service Docker setup and
[ai-system-card.md](ai-system-card.md) for the existing system card; the limitations
above describe the current implementation rather than deployment guarantees.
