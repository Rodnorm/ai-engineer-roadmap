# Quality Gates and Static Analysis Standards

This standard defines the automated quality gates, linting, type-checking, and coverage requirements across all applications.

---

## 1. Python Quality Gates

### 1.1 Linting and Formatting (Ruff)
- **Tool**: [Ruff](https://astral.sh/ruff)
- **Configuration**: `ruff.toml`
- **Enforced Rules**:
  - `E`, `W`: Pycodestyle errors and warnings.
  - `F`: Pyflakes (undefined variables, unused imports, logic errors).
- **Commands**:
  ```bash
  ruff check .
  ruff format --check .
  ```
- **Threshold**: Zero linting errors allowed on CI.

### 1.2 Type Checking (Mypy)
- **Tool**: [mypy](https://mypy-lang.org/)
- **Configuration**: `mypy.ini`
- **Target**: Python 3.12+
- **Enforcement**: Incremental strictness. All critical security helpers (`client_ip.py`, `rate_limit.py`, `auth.py`) must pass `check_untyped_defs = True` without type errors.

### 1.3 Backend Test Coverage
- **Tool**: `coverage` / `pytest-cov`
- **Target Thresholds**:
  - Global baseline: ≥ 70% line coverage for critical business logic and security modules.
  - Rate limiting and client IP resolution: ≥ 90% coverage.
  - Health and status endpoints: 100% coverage.

---

## 2. Frontend Quality Gates

### 2.1 TypeScript & Linting
- **Type Checking**: `tsc --noEmit` on every pull request.
- **Linting**: ESLint with `next/core-web-vitals` rules.

### 2.2 Component & Integration Tests
- **Runner**: Node.js native test runner (`node --test tests/*.test.mjs`).
- **Focus**: Complex user interactions, state transitions, session tokens, and approval workflows.

---

## 3. End-to-End & Accessibility (E2E)

### 3.1 Playwright Smoke Tests
The current `tests/e2e/smoke.spec.ts` suite is a scaffold, not a CI gate:
it renders inline fixture HTML, and its API probes allow connection failures.
Run it manually with `npm run test:e2e` for scaffold development only.
Before restoring an automatic gate, start the actual apps, exercise their real
components/routes, mock only external providers, and fail on unavailable servers.
Backend unit tests and frontend tests/builds remain automatic.

### 3.2 Accessibility (a11y)
- **Engine**: `axe-core`
- **Standard**: Zero critical or serious accessibility violations on main landing views.

## 4. CI scope and free-account operation

- PRs and pushes to `main` validate changed apps (00–08), catalog and Compose,
  Python quality, and OpenAPI contracts. Full app validation runs weekly or via
  `workflow_dispatch` with `run_all`.
- Python lock validation resolves against committed pins and compares package
  versions/markers, not generated comments or the changing set of PyPI hashes.
  Installation uses `--require-hashes` and `pip check`.
- OpenAPI export uses `requirements.lock`, matching deployed dependency versions.
- Gitleaks, pip-audit, Bandit and CodeQL remain security checks. Trivy performs
  the broader repository scan weekly or manually, avoiding overlapping PR scans.
- Dependency review was removed: Dependency Graph is disabled in this repository,
  and resolved dependencies are already audited. Conventional title checking was
  removed because it does not validate application behavior.
- Use standard `ubuntu-latest` runners only. Runtime is free for this public
  repository ([GitHub billing documentation](https://docs.github.com/en/actions/concepts/billing-and-usage)).
  No paid API credentials are needed by the validation suite. Keep paid runner
  types and paid cache overage disabled in account settings.
- Security reports are uploaded only on failure and retained for one day;
  Gitleaks artifact uploads are disabled. Artifacts/storage have separate limits.
