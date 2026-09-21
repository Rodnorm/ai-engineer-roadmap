# Production retention checklist

This checklist applies to the Coolify deployment on the Hetzner VPS. Repository defaults and application code minimise stored data, but proxy and container retention must also be configured on the host.

## Required environment variables

Set a different random value for each backend in Apps 01, 02, 03, and 05:

```dotenv
APP_ENV=production
RATE_LIMIT_HASH_KEY=<at-least-32-random-characters>
```

Generate a value on the server with:

```bash
openssl rand -hex 32
```

Do not reuse API keys or database passwords. The backend refuses to start in production when this value is missing or shorter than 32 characters.

Keep these existing limits explicit in Coolify:

```dotenv
# App 04
UPLOAD_RETENTION_MINUTES=30

# App 05
SESSION_TTL_SECONDS=1800
```

## Coolify, Traefik, and container logs

1. Keep application log level at `INFO` or higher in production. Do not enable request-body debugging.
2. Disable Traefik access logs when they are not needed. If they are required for incident response, configure IP redaction and a maximum retention of seven days.
3. Configure Docker's `json-file` log driver with rotation (for example, `max-size=10m` and `max-file=3`) or use an equivalent bounded logging driver.
4. Recreate affected containers after changing Docker daemon logging defaults; existing containers do not automatically inherit new defaults.
5. Do not ship logs to a third-party log platform unless that processor is added to the Datenschutzerklärung and covered by the appropriate agreement.

## Application retention

| Data | Limit | Enforcement |
| --- | --- | --- |
| Apps 01/02/03/05 rate-limit events | 24 hours | SQLite cleanup during quota checks |
| App 04 uploaded original, extracted chunks, embeddings | 30 minutes | Periodic cleanup plus explicit delete |
| App 05 session prompts and workflow state | 30 minutes of inactivity | Bounded in-memory session store |
| App 06 owner cookie | 30 days | Cookie expiry |
| App 06 conversations/workspace | Until user deletion | Delete endpoint/UI; disclosed on the privacy page |

App 06 automatic expiry is intentionally not introduced in this change. Adding it would change durable-workspace behaviour and requires a separately tested Cosmos DB TTL migration.

## Verification after deployment

- Start each changed backend with `APP_ENV=production` and no `RATE_LIMIT_HASH_KEY`; startup must fail.
- Add a valid key and confirm startup succeeds.
- Make a request, inspect the rate-limit SQLite database, and confirm the stored `client_key` is a 64-character hexadecimal HMAC rather than an IP address.
- Upload a Pocket RAG document and confirm it disappears after the configured retention window.
- Leave an Agentic Workflow session idle and confirm it is unavailable after the TTL.
- Review recent application and proxy logs and confirm that prompts, messages, filenames, document text, and images are absent.
- Replace every legal-page placeholder before merge or deployment.
