# ForgeKit

ForgeKit is a pnpm and Turborepo workspace.

## Layout

- `apps/web`: web app package
- `apps/api`: API app package
- `packages/ui`: shared UI package
- `packages/core`: core domain package
- `packages/db`: database package
- `packages/config`: shared config package
- `tooling/typescript-config`: strict TypeScript base config
- `tooling/eslint-config`: shared flat ESLint config
- `tooling/vitest-config`: shared Vitest config

## Dependency Flow

The internal dependency flow is enforced by a custom ESLint rule that fails the build on forbidden cross-package imports. A forbidden import is any runtime package reaching past its allowed direct internal dependency, such as `@forgekit/api` importing `@forgekit/db` directly.

See [docs/eslint-rules/dependency-flow.md](docs/eslint-rules/dependency-flow.md) for the full rationale and implementation details.

- `apps/web` imports `@forgekit/ui`
- `apps/api` imports `@forgekit/core`
- `packages/core` imports `@forgekit/db`
- `packages/db` imports `@forgekit/config`
- `packages/ui` has no internal dependencies

Packages build to `dist` and publish `dist/index.js` and `dist/index.d.ts` through `main`, `types`, and `exports`.

## Gates

Run these from the repo root:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

The workspace uses strict TypeScript with `noUncheckedIndexedAccess`. ESLint rejects explicit `any`.

A collaboration between a human and an AI 👨 ❤️ 🤖
