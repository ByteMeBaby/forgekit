# Working in this repository

Guidance for AI coding agents and new contributors. Read this before changing code. ForgeKit is a pnpm + turbo monorepo; this file covers conventions and boundaries and does not repeat the README.

## Read first

- **README.md** - the package layout, the enforced dependency-flow graph, the gates, and the two Turbo traps (result caching and dist-consumption).
- **docs/** (see [docs/README.md](docs/README.md)) - the per-feature source of truth for mechanism and behavior. When you change a feature, update its doc in the same change. Keep docs mechanism-focused: do not record progress or status in them (it goes stale and misleads), read the current state from the code and git history instead.
- **plan/** is a separate, private repository (git-ignored here). Do not read it, cite it, or copy anything from it into this repo's code, comments, commits, or docs. Everything you need is in the code and `docs/`.

## Conventions

Not all of these are lint-enforced, so follow them by hand.

- **Strict TypeScript.** Named exports only; explicit return types on exported functions and components. `any` is a lint error.
- **Module resolution is NodeNext.** Every relative import and re-export uses the eventual `.js` extension (`import { x } from "./x.js"`). Under `verbatimModuleSyntax`, use `import type` for types and derive third-party prop types rather than value-importing them. `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are on.
- **Comments earn their place.** A one-line header where a file's role is not obvious from its path; JSDoc on every exported symbol whose purpose is not obvious from its name; a WHY comment for non-obvious wiring. Never restate the code.
- **Tests** live in `__tests__` beside the source. Keep route and service files small, splitting by sub-feature well before they reach roughly 400 lines.
- **Custom lints** enforce the layering (`dependency-flow`) and safe database mutations (`no-unscoped-db-mutation`); see [docs/eslint-rules/](docs/eslint-rules/).

## Running the gates

Run `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` from the root (see README, "Gates"). Turbo caches results, so force a real run with `TURBO_FORCE=true`. A package is consumed as its built `dist/`, so rebuild it (or run through Turbo) before typechecking or testing a dependent directly.

## Anything you write (code, comments, docs, commits, PRs)

- **No em dashes** anywhere. Use commas, colons, parentheses, or a spaced hyphen ( - ).
- **No tool attribution.** No "Generated with ..." lines in PRs, no `Co-Authored-By` trailers for tools, and the commit author and contributor list is the maintainer only.
