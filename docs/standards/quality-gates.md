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
- Runs deterministic, offline-mocked critical journeys for each app.
- Tests resilience against 400, 413, 429, and 503 error codes.
- Tests stream aborts and request cancellation.
- Failure-only artifact retention (screenshots, traces, videos).

### 3.2 Accessibility (a11y)
- **Engine**: `axe-core`
- **Standard**: Zero critical or serious accessibility violations on main landing views.
