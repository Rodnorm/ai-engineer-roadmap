# Dependency updates

Dependabot checks deployed application manifests every Monday at 06:00
`Europe/Berlin`. Minor and patch updates are grouped within each package
directory. Major updates remain manual because they require an explicit
migration review.

## Coverage

The following deployed manifests are monitored:

- Apps 00–05 frontend packages;
- Apps 01–05 backend Python requirements;
- App 06 frontend and MCP server packages;
- GitHub Actions used by the repository.

The root `package.json` is excluded because it only exposes repository
orchestration scripts and has no runtime dependencies. Manifests under
`templates/ai-app` are also excluded: they are examples rather than deployed
artifacts. Update both exclusions manually whenever their dependencies change.

## Merge validation

Before merging a dependency pull request:

1. confirm the update is scoped to a single package directory or the
   GitHub Actions group;
2. inspect release notes and advisories for behavior or security changes;
3. require the selective CI jobs for the changed app to pass;
4. require its lint, typecheck, tests, and production build when available;
5. rebuild the affected container when its runtime dependency tree changes;
6. keep major updates in a dedicated, manually reviewed pull request.

Dependabot changes are path-scoped, so the repository change detector should
select only the relevant application jobs.

## Python lockfiles (`requirements.lock`)

Python backend dependencies for Apps 01–05 are locked using `uv` with reproducible SHA-256 hashes targeting Python 3.12:

```bash
uv pip compile requirements.txt -o requirements.lock --generate-hashes --python-version 3.12 --universal
```

For App 04 test dependencies:
```bash
uv pip compile requirements-test.txt -o requirements-test.lock --generate-hashes --python-version 3.12 --universal
```

When Dependabot or a developer modifies `requirements.txt`:
1. Re-compile the corresponding `requirements.lock` using the command above.
2. Commit both `requirements.txt` and `requirements.lock`.
3. CI automatically validates that `requirements.lock` matches `requirements.txt`.
