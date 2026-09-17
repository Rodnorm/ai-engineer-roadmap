# Edge and Browser Security Headers Standard

This document details the security header policy enforced across all Next.js applications in the monorepo.

---

## 1. Responsibilities: Traefik vs Next.js

- **TLS Termination & Edge Routing**: Owned by Coolify / Traefik. Traefik terminates HTTPS certificates via Let's Encrypt.
- **HSTS Enforcement**: Defined in Next.js `next.config.mjs` (`max-age=63072000; includeSubDomains; preload`) to guarantee that all direct and proxied browser requests enforce strict HTTPS.
- **Content Security Policy & Framing**: Enforced directly in Next.js `next.config.mjs` to keep CSP co-located with frontend asset dependencies and build outputs.

---

## 2. Standard Headers Matrix

Every frontend application defines the following response headers on all routes (`/:path*`):

| Header | Configured Value | Purpose |
| --- | --- | --- |
| **X-Content-Type-Options** | `nosniff` | Blocks MIME-type sniffing. |
| **X-Frame-Options** | `DENY` | Prevents clickjacking in legacy user agents. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Protects path and query parameters on cross-origin requests. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` | Disables sensitive browser hardware APIs. |
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | Enforces 2-year HTTPS with preload. |
| **Content-Security-Policy** | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';` | Enforces resource loading boundaries and blocks untrusted script injection. |

---

## 3. Automated Validation

Automated verification is performed via `tests/test_security_headers.py`:
```bash
python -m unittest tests/test_security_headers.py
```
This test runs in CI on every pull request to guarantee no application removes security headers or downgrades CSP to `Report-Only`.
