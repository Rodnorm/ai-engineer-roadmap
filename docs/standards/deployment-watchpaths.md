# Coolify Deployment and Watch Paths Standard

This standard specifies the independent deployment and watch path configurations in Coolify to prevent unnecessary rebuilds across monorepo applications.

---

## 1. Coolify Watch Paths Configuration

In Coolify, configure each application service under **Settings > Build & Deployment > Watch Paths** with its dedicated directory filter. When a push occurs to `main`, Coolify triggers automated webhooks only if files under the matching watch paths were modified.

| Application Resource | Coolify Type | Compose File / Context | Recommended Watch Paths |
| --- | --- | --- | --- |
| **00-portfolio** | Docker Compose | `apps/00-portfolio/compose.coolify.yml` | `apps/00-portfolio/**`<br>`catalog/**` |
| **01-smart-inspector** | Docker Compose | `apps/01-smart-inspector/compose.coolify.yml` | `apps/01-smart-inspector/**` |
| **02-support-bot** | Docker Compose | `apps/02-support-bot/compose.coolify.yml` | `apps/02-support-bot/**` |
| **03-prompt-forge** | Docker Compose | `apps/03-prompt-forge/compose.coolify.yml` | `apps/03-prompt-forge/**` |
| **04-pocket-rag** | Docker Compose | `apps/04-pocket-rag/compose.coolify.yml` | `apps/04-pocket-rag/**` |
| **05-agentic-workflow** | Docker Compose | `apps/05-agentic-workflow/compose.coolify.yml` | `apps/05-agentic-workflow/**` |
| **06-agent-workspace** | Docker Compose | `apps/06-agent-workspace/docker-compose.yml` | `apps/06-agent-workspace/**` |

---

## 2. GitHub Actions CI Alignment

In `.github/workflows/ci.yml`, the `Detect Changed Paths` job uses `dorny/paths-filter` to enforce the identical separation:
1. **Pull Requests**: Validates and runs tests only for modified applications.
2. **Main Branch Pushes**: Runs tests and validates images only for affected applications. Modifying App 01 will NOT run test jobs for Apps 02 through 06.
3. **Daily Scheduled Runs (`0 3 * * *`)**: A daily cron job at 03:00 UTC executes full test suites across all 7 applications to detect cross-project drift.
4. **Manual Trigger (`workflow_dispatch`)**: Offers `run_all: true` to test the full monorepo on demand.

---

## 3. Independent Resource Decoupling Verification

To verify isolation:
1. A commit modifying only `apps/01-smart-inspector/` produces git path changes exclusively under that prefix.
2. The GitHub Actions CI `changes` filter outputs `app01: true` and `app02..06: false`.
3. Coolify webhook evaluation evaluates the commit diff and skips deployments for `00-portfolio`, `02-support-bot`, `03-prompt-forge`, `04-pocket-rag`, `05-agentic-workflow`, and `06-agent-workspace`.
