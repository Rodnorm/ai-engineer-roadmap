# New App Pre-Flight Security Checklist

Before marking any new application as `live` in `catalog/apps.json`, complete the following pre-flight checklist:

- [ ] **No Secrets in Code:** Verify `.env` files are ignored and `.env.example` contains placeholders.
- [ ] **Input Bounds:** Enforce Pydantic byte size, string length, or image dimension validation.
- [ ] **Rate Limiting:** Enable per-minute, per-client IP, and global daily rate limits.
- [ ] **Concurrency Limit:** Set `MAX_CONCURRENT_REQUESTS` semaphore guard.
- [ ] **Kill Switch:** Support `GENERATION_ENABLED=false` master flag.
- [ ] **Privacy Notice:** Display a clear user privacy disclaimer on the frontend interface.
- [ ] **Logs Sanitization:** Ensure operational JSON logs record zero raw user prompts, base64 strings, or unmasked PII.
- [ ] **Production Docs:** Verify OpenAPI/Swagger/ReDoc docs are hidden when `APP_ENV=production`.
- [ ] **Security Headers:** Confirm `next.config.mjs` sets security headers and `poweredByHeader: false`.
- [ ] **Vercel Isolation:** Confirm `vercel.json` restricts deployment strictly to the `main` branch.
- [ ] **Automated Tests:** Add backend unit tests for input validation, rate limits, and health endpoint exposure.
