# Frontend Architecture & Security Standard

This document defines the mandatory frontend standard for all Next.js applications in `ai-engineer-roadmap`.

---

## 1. Security Headers & Configuration

Every Next.js application MUST configure defensive security headers in `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  reactStrictMode: true,
};

export default nextConfig;
```

---

## 2. API Proxying & Secrets Isolation

- Frontend components MUST communication with the backend exclusively via server-side rewrites (`/api/backend/:path*`).
- **NEVER** expose backend API keys or cloud credentials using `NEXT_PUBLIC_` environment variables.

---

## 3. Privacy & Disclaimers

- Every AI input interface MUST display an explicit privacy notice.
- Disclaimers must advise users against submitting sensitive PII, medical records, or financial information.
- All user-facing text strings MUST be internationalized across supported locales (`pt-BR`, `en`, `de`).

---

## 4. Resiliency & Request Cancellation

- Long-running API or streaming requests MUST support request cancellation via `AbortController`.
- Frontends MUST handle standard HTTP error status codes gracefully (`413` Payload Too Large, `429` Rate Limit, `502` Upstream Error, `503` Service Unavailable).
