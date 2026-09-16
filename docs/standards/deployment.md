# Deployment & CI Standard

This document details the deployment policy and GitHub Actions CI standards for `ai-engineer-roadmap`.

---

## 1. Coolify Deployment Isolation

To ensure stability, resource isolation, and cost control:

- Production deployments are **restricted exclusively to the `main` branch** on Coolify + Hetzner.
- Every application root defines a Git-based Docker Compose resource (`compose.coolify.yml`) with app-level Watch Paths (e.g. `apps/NN-*/**`) so changes only trigger builds for the affected application.
- Applications consuming shared resources (e.g. `catalog/**` in `apps/00-portfolio`) include those paths in their Watch Paths.
- Secrets and cloud credentials must never be committed to Git; they are configured exclusively as environment variables within the Coolify resource.

---

## 2. CI Pipeline Standard

All Pull Requests to `main` must pass the monorepo CI pipeline:

1. **Frontend Job:** `npm ci`, `npm run lint`, `npm run build`.
2. **Backend Job:** `pip install -r requirements.txt`, `pip check`, `compileall`, `unittest discover`.
3. **Security Automation:**
   - **Gitleaks:** Secret scanning across PR commits.
   - **Dependency Review:** License and vulnerability checks on package updates.
   - **CodeQL Analysis:** Static security analysis for Python and JS/TS.
