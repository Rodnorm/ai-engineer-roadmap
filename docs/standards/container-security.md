# Container security standards

All containerized applications in this monorepo must follow these security and hardening requirements.

## 1. Immutable base image digests

Base images in Dockerfiles must be pinned to explicit immutable digests (`@sha256:...`) rather than mutable tags. This ensures reproducible builds and prevents upstream supply-chain tampering:

* **Python backends:** `python:3.12-slim@sha256:78387bc3881b8273120a12ebe6c1ab22b018ccc2c9adf565ae1ac9b536e184ea`
* **Node.js frontends & MCP:** `node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`

### Base image update process

1. Periodically check official Docker Hub repositories for updated security patches:
   ```bash
   curl -s "https://hub.docker.com/v2/repositories/library/python/tags/3.12-slim"
   curl -s "https://hub.docker.com/v2/repositories/library/node/tags/20-alpine"
   ```
2. Inspect the latest multi-arch digest.
3. Update the digest across the corresponding Dockerfiles.
4. Run CI security scans and unit tests to verify compatibility before merging.

## 2. Principle of least privilege

* **Non-root execution:** Containers must never execute as `root`.
  * Python containers create and switch to user `app` (or `user`).
  * Node.js / Alpine containers create and switch to user `nextjs` or `mcp`.
* **Disable privilege escalation:** Set `no-new-privileges:true` in all Compose service definitions.
* **Drop all Linux capabilities:** Use `cap_drop: [ALL]` to restrict access to kernel capabilities.

## 3. Healthchecks

Every container must define a `HEALTHCHECK` instruction and pass it before dependents start:

* **Python/FastAPI:**
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
      CMD python -c "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.getenv('PORT', '8000') + '/health', timeout=3)"
  ```
* **Node.js / Next.js / MCP:**
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
      CMD wget -q --spider "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1
  ```

## 4. Storage and state isolation

* Containers should avoid writing to their root filesystem where possible.
* Mutable application state (rate limit databases, SQLite files, uploaded documents) must use explicit named volumes mounted at `/data` or `/app/data`.

## 5. Software Bill of Materials (SBOM)

To inspect or generate an SBOM for any deployed image in CycloneDX or SPDX format:

```bash
# Using Trivy
trivy image --format cyclonedx --output image-sbom.json <image-tag>

# Using Syft
syft <image-tag> -o cyclonedx-json=image-sbom.json
```
