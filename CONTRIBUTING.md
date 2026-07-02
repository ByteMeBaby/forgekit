# Contributing to ForgeKit

## Quality gates

Run these from the repo root before pushing:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

A pre-push git hook runs the same four gates automatically and blocks a push that fails any of them. The hook is installed on `pnpm install` through the `prepare` script, which points git at the committed `.githooks` directory (`git config core.hooksPath .githooks`). In a genuine emergency you can bypass it with `git push --no-verify`, but the same gates must pass in review.

## Two Turborepo traps to know

### 1. A green run may be cached, not actually run

Turbo caches `build`, `test`, and `lint` results by input hash. If nothing an input touches has changed, Turbo serves the previous result instead of running the task again, so a green run may not have actually executed. When you need to prove a task really ran, force a real run:

```sh
TURBO_FORCE=true pnpm test
```

### 2. Packages are consumed as built `dist/`, not source

Every internal package is imported through its built `dist/` output, not its TypeScript source. After editing a package, rebuild it before running `tsc` or `vitest` directly inside a dependent, or you will test stale code. Running through Turbo orders the rebuild for you; per-package commands do not:

```sh
# Safe: Turbo rebuilds dependencies first
pnpm build

# Risky: a per-package command can read a stale dist/
pnpm --filter @forgekit/api test
```
