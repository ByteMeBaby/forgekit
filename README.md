# ForgeKit

ForgeKit is a starter kit for SaaS web applications. Even though this is an experiment I am doing with AI, I am planning to make it as useful as possible.

The goal is to cover the parts every SaaS needs but nobody enjoys rebuilding: sign-in, organizations and teams, billing, and an audit trail. You clone it, set a few env values, and start on your actual product instead of a blank folder.

It is early and I am building it one feature at a time, so treat it as a work in progress rather than something to ship today. I am trying to keep it honest about what is actually enforced versus what is just a convenience.

## Layout

- `apps/web`: web app (TanStack Start)
- `apps/api`: API app (Hono)
- `packages/ui`: shared UI package
- `packages/core`: core domain package
- `packages/db`: database package
- `packages/config`: shared config package
- `tooling/typescript-config`: strict TypeScript base config
- `tooling/eslint-config`: shared flat ESLint config
- `tooling/eslint-plugin`: custom ESLint rules (dependency-flow, no-unscoped-db-mutation)
- `tooling/vitest-config`: shared Vitest config

## Docs

Feature and mechanism documentation lives in [`docs/`](docs/README.md).

## Dependency Flow

The internal dependency flow is enforced by a custom ESLint rule that fails the build on forbidden cross-package imports. A forbidden import is any runtime package reaching past its allowed direct internal dependency, such as `@forgekit/api` importing `@forgekit/db` directly.

See [docs/eslint-rules/dependency-flow.md](docs/eslint-rules/dependency-flow.md) for the full rationale and implementation details.

- `apps/web` imports `@forgekit/ui`
- `apps/api` imports `@forgekit/core`
- `packages/core` imports `@forgekit/db`
- `packages/db` imports `@forgekit/config`
- `packages/ui` has no internal dependencies

The internal packages (`ui`, `core`, `db`, `config`) build to `dist` and publish `dist/index.js` and `dist/index.d.ts` through `main`, `types`, and `exports`. `apps/api` builds the same way. `apps/web` is a TanStack Start app built with Vite to `dist/client` and `dist/server`.

## Gates

Run these from the repo root:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

The workspace uses strict TypeScript with `noUncheckedIndexedAccess`. ESLint rejects explicit `any`.

## Development notes

A pre-push git hook runs the four gates (`build`, `lint`, `typecheck`, `test`) and blocks a push that fails any of them. It is installed on `pnpm install` by a `prepare` script that points git at the committed `.githooks` directory. Bypass it in a genuine emergency with `git push --no-verify`.

Two Turborepo behaviors to know:

- Turbo caches `build`, `test`, and `lint` results by input hash, so a green run may have been served from cache rather than actually run. Force a real run with `TURBO_FORCE=true pnpm test`.
- Internal packages are consumed as their built `dist/`, not their source. Running the gates through Turbo rebuilds dependencies in order, but a direct per-package command such as `pnpm --filter @forgekit/api test` can read a stale `dist/`. Rebuild first, or run through Turbo.

A collaboration between a human and an AI 👨 ❤️ 🤖
