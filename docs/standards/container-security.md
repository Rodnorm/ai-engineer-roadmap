# Container security standards

All containerized applications in this monorepo must follow these security and hardening requirements.

## 1. Immutable base image digests

Base images in Dockerfiles must be pinned to explicit immutable digests (`@sha256:...`) rather than mutable tags. This ensures reproducible builds and prevents upstream supply-chain tampering:

* **Python backends:** `python:3.12-slim@sha256:78387bc3881b8273120a12ebe6c1ab22b018ccc2c9adf565ae1ac9b536e184ea`
* **Node.js frontends & MCP:** `node:24.22.1-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53`

### Base image update process

1. Periodically check official Docker Hub repositories for updated security patches:
   ```bash
   curl -s "https://hub.docker.com/v2/repositories/library/python/tags/3.12-slim"
   curl -s "https://hub.docker.com/v2/repositories/library/node/tags/24.22.1-alpine"
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

## 6. Brotli security rollout (CVE-2026-111497)

Node.js 24.22.1 contains the Brotli decoder security fix:
https://nodejs.org/en/blog/release/v24.22.1/

After merging, Coolify must rebuild and replace every deployed Node service
(Apps 00–08 and the App 06 MCP server). Dockerfile changes invalidate the base
image cache; restarting existing containers does not apply the fix. Confirm that
each resource's watched paths include its Dockerfile. Resources not automatically
triggered by the merge need an explicit redeploy.

Verify the runtime inside each replacement container:

```bash
docker exec <container> node -p 'JSON.stringify({node:process.version,brotli:process.versions.brotli})'
```

Expect Node.js 24.22.1 for this pinned image. Vendors can backport the Brotli fix
without changing the reported Brotli version, so use the Node security release
and image identity as the patch evidence, not only the Brotli version string.

### Python backends and Debian Brotli

CPython itself does not bundle the Brotli decoder. No `Brotli` or `brotlicffi`
package is present in the committed Python requirements locks. Native system
libraries are separate: curl can depend on Debian's `libbrotli1`.

All five backend Dockerfiles upgrade `libbrotli1` if installed and require at
least `1.1.0-2+deb13u1`, the Debian trixie backport for CVE-2026-111497:
https://lists.debian.org/debian-security-announce/2026/msg00498.html

The check runs after package installation and fails the build if the patched
Debian package is unavailable. It does not install Brotli in images without it.
Rebuild and replace the Python backend containers as well. Verify with:

```bash
docker exec <backend-container> dpkg-query -W libbrotli1
```

If absent, this system decoder is not installed. If present, compare the full
Debian package revision (including `+deb13u1`), not just upstream `1.1.0`.
