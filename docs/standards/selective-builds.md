# Path-Aware Selective Build Strategy

This document describes the monorepo CI path-aware selective execution strategy.

---

## 🎯 Objective

To keep CI feedback fast and avoid unnecessary cloud compute, Pull Request builds execute test and lint matrix jobs ONLY for the apps or shared components modified in that pull request.

---

## 🔀 Path Detection Mapping

| Change Path | Affected Jobs |
| --- | --- |
| `apps/00-portfolio/**`, `catalog/**` | App 00 Portfolio & Catalog Validation |
| `apps/01-smart-inspector/**` | App 01 Smart Inspector |
| `apps/02-support-bot/**` | App 02 Support Bot |
| `apps/03-prompt-forge/**` | App 03 Prompt Forge |
| `templates/**`, `docs/standards/**` | Reusable Template Validation & Global Checks |
| `.github/workflows/**`, Root Configs | All Applications & Global Suite |

---

## ⚙️ Manual Overrides

Developers can trigger a full monorepo build manually via GitHub Actions UI:

1. Navigate to **Actions** -> **CI**.
2. Click **Run workflow**.
3. Check the **Force run all jobs regardless of changed paths** checkbox.
