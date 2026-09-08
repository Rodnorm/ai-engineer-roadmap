# Automated Testing Standard

Every application in `ai-engineer-roadmap` must provide automated tests verifying core functionality and security boundaries.

---

## 1. Backend Testing

Backends are tested using Python's standard `unittest` framework or `pytest`.

### Required Test Coverage

- **Empty / Invalid Inputs:** Empty payloads, malformed JSON, invalid image signatures.
- **Oversized Payloads:** Inputs exceeding maximum character or byte limits.
- **Rate Limit Enforcement:** Verifying rejection after exceeding quota bounds.
- **Kill Switch Behavior:** Confirming HTTP 503 response when `GENERATION_ENABLED=false`.
- **Health Endpoint Exposure:** Verifying `/health` exposes zero credentials or sensitive deployment details.

### Running Backend Tests

```bash
python -m unittest discover -s apps/<app-name>/backend -p "test_*.py"
```

---

## 2. Frontend Testing & Validation

Frontends must compile and pass static analysis without errors:

```bash
cd apps/<app-name>/frontend
npm run lint
npm run build
```
