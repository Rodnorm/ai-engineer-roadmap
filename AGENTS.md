# AGENTS.md

This repository is developed incrementally as part of an AI engineering learning project.

When modifying this repository, prioritize small, reviewable, and safe changes.

## General principles

- Prefer the smallest change that solves the requested problem.
- Do not refactor unrelated code.
- Do not rename files, folders, variables, or components unless necessary.
- Do not introduce new dependencies unless they are clearly required.
- Reuse existing patterns before creating new abstractions.
- Keep implementations simple and easy to understand.
- Preserve existing behavior unless the task explicitly requires changing it.
- Do not implement additional features that were not requested.

## Git workflow

For every new task that requires code changes:

1. Start from the latest `main`.
2. Create a new branch from `main`.
3. Make the requested changes only on that branch.
4. Never commit directly to `main`.
5. Never force-push `main`.
6. Never rewrite shared Git history unless explicitly requested.

Before creating the branch:

```bash
git checkout main
git pull
```

Then create a descriptive branch.

Examples:

```text
fix/02-mobile-header-overlap
feat/03-agent-boilerplate
chore/add-app-favicons
docs/update-readme
```

Use the most appropriate prefix:

- `feat/` — new functionality
- `fix/` — bug fix
- `chore/` — maintenance/configuration
- `docs/` — documentation
- `refactor/` — code restructuring without behavior changes
- `test/` — tests only

## Commit discipline

Keep commits small and focused.

Each commit should represent one logical change.

Avoid commits containing:

- unrelated formatting changes
- unrelated refactors
- generated files that are not needed
- debugging code
- temporary files
- `.env` files
- secrets
- build output
- cache files

Prefer multiple focused commits over one large commit when the task naturally contains separate changes.

However, do not artificially split very small changes into many commits.

## Commit messages

Use Conventional Commits.

Examples:

```text
fix: prevent mobile header controls from overlapping
feat: add app 03 boilerplate
chore: add favicons for apps 01 and 02
docs: document local backend setup
refactor: simplify API client configuration
test: add health endpoint tests
```

Keep commit messages concise and describe the actual change.

## Scope control

Before editing code, inspect the files related to the requested task.

Do not modify files outside the relevant app or feature unless necessary.

For example:

- App 01 changes should normally stay inside `apps/01-*`
- App 02 changes should normally stay inside `apps/02-*`
- App 03 changes should normally stay inside `apps/03-*`

Shared/root configuration should only be changed when the requested task genuinely requires it.

If a task can be solved by changing one or two files, do not change ten.

## Existing architecture

Before introducing a new pattern:

1. inspect similar code in the repository;
2. identify how Apps 01 and 02 already solve comparable problems;
3. follow the existing convention where reasonable.

Consistency with the repository is preferred over introducing a theoretically better architecture.

Do not overengineer learning-project code.

## Frontend

When modifying frontend code:

- preserve the existing visual language;
- maintain responsive behavior;
- do not break mobile layouts while fixing desktop layouts or vice versa;
- preserve accessibility;
- keep buttons and interactive controls keyboard accessible;
- avoid unnecessary client components;
- avoid unnecessary state and effects;
- reuse existing Tailwind/CSS patterns.

For Next.js projects:

- follow the existing App Router structure;
- preserve server/client component boundaries;
- avoid hydration problems;
- do not add `"use client"` unless needed.

## Backend

When modifying Python/FastAPI code:

- preserve the existing API response structure unless explicitly changing it;
- keep endpoints small;
- place business logic in existing service/helper layers when appropriate;
- avoid unnecessary framework abstractions;
- reuse existing logging and environment-variable patterns.

Do not silently change authentication mechanisms or Azure configuration.

## AI integrations

AI-related features should be implemented explicitly and incrementally.

Do not automatically add:

- agents
- RAG
- vector databases
- MCP
- tool calling
- new Azure resources
- new OpenAI clients
- new model deployments

unless the task specifically asks for them.

Do not replace an existing AI SDK or integration simply because another one is newer.

## Environment variables and secrets

Never commit secrets.

Do not commit:

```text
.env
.env.local
.env.production
credentials files
API keys
client secrets
access tokens
```

Use `.env.example` for documenting required variables.

Placeholder values must clearly be placeholders.

Before committing, inspect the diff for accidentally exposed credentials.

## Dependencies

Do not add or upgrade dependencies without a clear reason.

Before adding a dependency, check whether the task can be solved using:

- the standard library;
- existing project dependencies;
- existing utilities in the repository.

Do not perform broad package upgrades as part of unrelated work.

## Formatting

Do not reformat entire files unless necessary.

Preserve the surrounding code style.

Avoid commits where the actual functional change is hidden among hundreds of formatting changes.

## Generated and ignored files

Do not commit generated/cache files such as:

```text
.next/
node_modules/
__pycache__/
*.pyc
.venv/
dist/
build/
coverage/
```

Respect the repository `.gitignore`.

## Validation

After making changes, run the smallest relevant validation.

Examples:

Frontend:

```bash
npm run lint
npm run build
```

Backend:

```bash
python -m pytest
```

or start the FastAPI application when tests are not available.

Do not fix unrelated pre-existing lint or build errors unless they prevent validation of the requested change.

If a validation command fails because of an existing unrelated issue, report it clearly.

## Before committing

Always inspect:

```bash
git status
git diff
```

Check that:

- only expected files changed;
- no secrets were added;
- no generated files were added;
- no unrelated changes are included.

## Pull requests

When asked to create a pull request:

- push the feature branch;
- create the PR against `main`;
- use a clear title;
- keep the description concise;
- explain what changed;
- mention how it was tested.

Suggested PR structure:

```text
## What changed

- ...

## Why

- ...

## Validation

- ...
```

Do not merge the pull request unless explicitly requested.

## Existing local changes

If the working tree already contains changes made by the user:

- do not discard them;
- do not overwrite them;
- do not include them in your commit unless they are part of the requested task.

If necessary, work around them while keeping your own changes isolated.

## Destructive operations

Do not run destructive commands unless explicitly requested.

Avoid commands such as:

```bash
git reset --hard
git clean -fd
git push --force
```

Never delete user work just to make the repository clean.

## Final response

After completing a coding task, report:

- branch name;
- files changed;
- short summary of the implementation;
- validation performed;
- commit hash/message if a commit was created;
- PR link if a PR was created.

Keep the summary concise.

## Core rule

When uncertain, prefer:

**small change, small diff, easy review.**