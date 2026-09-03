# Deployment & CI Standard

This document details the deployment policy and GitHub Actions CI standards for `ai-engineer-roadmap`.

---

## 1. Vercel Deployment Isolation

To ensure stability and cost control:

- Production deployments are **restricted exclusively to the `main` branch**.
- Every application root MUST include a `vercel.json` file specifying:
  ```json
  {
    "git": {
      "deploymentEnabled": {
        "main": true,
        "*": false
      }
    }
  }
  ```
- Preview branches must NOT receive production Azure credentials.

---

## 2. CI Pipeline Standard

All Pull Requests to `main` must pass the monorepo CI pipeline:

1. **Frontend Job:** `npm ci`, `npm run lint`, `npm run build`.
2. **Backend Job:** `pip install -r requirements.txt`, `pip check`, `compileall`, `unittest discover`.
3. **Security Automation:**
   - **Gitleaks:** Secret scanning across PR commits.
   - **Dependency Review:** License and vulnerability checks on package updates.
   - **CodeQL Analysis:** Static security analysis for Python and JS/TS.
