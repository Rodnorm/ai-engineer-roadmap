# Contributing Guidelines

Thank you for contributing to `ai-engineer-roadmap`! This repository is built incrementally as part of an AI engineering portfolio and learning path.

---

## 1. General Principles

- **Small, Atomic Changes:** Prefer the smallest diff that solves the target problem.
- **Scope Isolation:** Changes for a specific application should remain inside `apps/<id>-<name>/`.
- **Preserve Existing Architecture:** Inspect similar components before creating new abstractions.
- **Security First:** Never commit `.env` files, API keys, credentials, or private keys.

---

## 2. Git & Branching Workflow

1. Always start from the latest `main`:
   ```bash
   git checkout main
   git pull
   ```
2. Create a descriptive feature branch:
   ```bash
   git checkout -b <prefix>/<short-description>
   ```
   **Allowed Branch Prefixes:**
   - `feat/` — New functionality
   - `fix/` — Bug fix
   - `security/` — Security hardening or vulnerability fix
   - `ci/` — CI/CD automation and GitHub Actions
   - `docs/` — Documentation updates
   - `chore/` — Maintenance or config tasks
   - `test/` — Tests only
   - `refactor/` — Code restructuring without behavior changes

3. Never commit directly to `main`.
4. Submit a Pull Request against `main`.

---

## 3. Commit Discipline & Conventional Commits

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(01): add image dimension guard
fix(02): sanitize pii in error responses
security(03): disable openapi docs in production
docs: update readme with backend setup steps
ci: pin github actions to full shas
```

Rules:
- One logical change per commit.
- Do not mix visual refactoring with security or infrastructure changes.
- Do not reformat unrelated code.

---

## 4. Local Testing & Validation

Before submitting a Pull Request, run local validation:

### Frontend
```bash
cd apps/<app-dir>/frontend
npm ci
npm run lint
npm run build
```

### Backend
```bash
cd apps/<app-dir>/backend
python -m pip check
python -m compileall -q .
python -m unittest discover -s . -p "test_*.py"
```

---

## 5. Security & Secrets

- Check `git status` and `git diff` before committing.
- Ensure all sensitive variables are documented in `.env.example` using placeholder values (e.g. `<azure-openai-api-key>`).
