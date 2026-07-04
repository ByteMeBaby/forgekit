# Dependency Flow ESLint Rule

`dependency-flow` is a custom ESLint rule in `@forgekit/eslint-plugin` that fails the build on a forbidden cross-package import.

## Why

ForgeKit uses a layered monorepo architecture where each package may depend only on the next layer down: `web` on `ui`, and `api` on `core` on `db` on `config`.

This keeps the dependency graph acyclic (no import cycles), concerns separated, and packages independently reasonable and extractable. Without enforcement, it is easy to accidentally add a forbidden edge, such as an app reaching past its layer or `ui` reaching into `db`. Those edges create hidden coupling and erode the architecture.

Enforcing the boundary as a build-failing lint rule makes it a hard constraint caught in the pull request, not a convention people forget.

## The allowed dependency graph

```mermaid
flowchart TD
  web --> ui
  api --> core
  core --> db
  db --> config
  api -. forbidden .-> db
  web -. forbidden .-> core
  linkStyle 4 stroke:red,stroke-width:2px,color:red;
  linkStyle 5 stroke:red,stroke-width:2px,color:red;
```

The package graph uses strict single-hop adjacency:

- `web` -> `ui`
- `ui` -> `(none)`
- `api` -> `core`
- `core` -> `db`
- `db` -> `config`
- `config` -> `(none)`

Reaching past the next layer is forbidden. The shared tooling config packages, `eslint-config`, `typescript-config`, `vitest-config`, and `eslint-plugin`, are exempt because they are dev infrastructure, not part of the governed package graph.

## How it works

The rule is published from `@forgekit/eslint-plugin` under the rule name `dependency-flow`.

For each linted file, it determines the owning package from the file's `packages/<name>` or `apps/<name>` path. For every `@forgekit` static import, re-export, or dynamic `import()` with a string-literal specifier, it extracts the target package and checks it against the owning package's allowed set. A dynamic import whose specifier is not a string literal cannot be resolved statically and is not checked.

Tooling packages and imports outside the `@forgekit` scope are ignored. A forbidden governed import is reported.

## Type-only imports are governed too

`import type { X } from "@forgekit/db"` is erased at build time, so it adds no runtime edge. The rule still reports it when it crosses a forbidden boundary, and that is deliberate: a type-only import still couples the two packages to each other's shapes, which is the coupling this boundary exists to prevent. If a package needs a type from a non-adjacent layer, re-export that type through the allowed layer, for example expose it from `core` and import it from `@forgekit/core`.

## When it fires

For example, this import from `apps/api` is forbidden:

```ts
import { createConnection } from "@forgekit/db";
```

The rule reports:

```text
@forgekit/api may not import @forgekit/db. Allowed internal dependencies: @forgekit/core.
```

## Fixing a violation

Route the dependency through the allowed layer. For example, if `api` needs behavior backed by `db`, expose that behavior from `core` and import it from `@forgekit/core`.

If the architecture genuinely needs to change, change the adjacency map deliberately and keep the docs aligned with that decision.

## How it is wired

The rule is enabled as an error in the shared flat ESLint config, so `pnpm lint` enforces it across every package and app.

## Adding more rules

The plugin is structured to hold more rules. Add a rule under the plugin's rules map and document it in `docs/eslint-rules/`.

## References

- [ESLint: Custom Rules](https://eslint.org/docs/latest/extend/custom-rules) - how a rule like this is written.
- [ESLint: Configuration Files](https://eslint.org/docs/latest/use/configure/configuration-files) - the flat config the rule is wired into.
