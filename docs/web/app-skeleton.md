# Web App Skeleton

`apps/web` is a TanStack Start React app. It server-renders the placeholder home page and hydrates the same route tree on the client.

This is the booting frontend shell. Later feature chunks attach a typed API client, a `ThemeProvider`, and auth to the same app boundary.

## Routing and the document shell

File-based route files live in `apps/web/src/routes`. The route tree is generated from those files and consumed by `apps/web/src/router.tsx`, which imports `routeTree` from `./routeTree.gen` and passes it to `createRouter`.

`apps/web/src/routes/__root.tsx` is the root route. It exports `Route = createRootRoute(...)`, renders the document shell with `<html>`, `<head>`, and `<body>`, and places `HeadContent` in the head and `Scripts` after the rendered route body. The same root route sets the top-level `errorComponent` and `notFoundComponent`.

`apps/web/src/routes/index.tsx` is the `/` route. It exports only `Route` and registers `HomePage` with `createFileRoute("/")`. The page component lives in `apps/web/src/components/home-page.tsx` and is imported into the route file. TanStack Router warns that non-`Route` exports from route files opt those routes out of automatic code splitting, so page components stay outside route files.

## Generated route tree

`apps/web/src/routeTree.gen.ts` is generated and ignored by `.gitignore`, so it is never committed. The generated file imports the route modules and exports `routeTree`.

`apps/web/vite.config.ts` installs the TanStack Start Vite plugin with `tanstackStart()`. `vite build` regenerates the route tree through that plugin before it builds the app. The `typecheck` script runs the CLI generator first:

```sh
tsr generate && tsc -p tsconfig.typecheck.json --noEmit
```

A clean checkout rebuilds the generated route tree during build or before type checking. No separate manual step is needed for those gates.

## Styling

`apps/web/vite.config.ts` compiles Tailwind v4 through the first-party `@tailwindcss/vite` plugin. `apps/web/src/styles.css` imports `tailwindcss` first, then `@forgekit/ui/theme.css`, so the application receives Tailwind utilities and the ForgeKit semantic theme in one global stylesheet. The stylesheet enters the app through a side-effect import in `apps/web/src/routes/__root.tsx`; TanStack Start injects it during server rendering and hydration, so every route receives it.

The stylesheet includes `@source "../node_modules/@forgekit/ui/dist"`. Tailwind does not scan `node_modules` by default, so this points at pnpm's symlinked compiled UI package and generates the utility classes used inside UI components.

The `.dark` class flips the semantic theme tokens for its descendants. A later chunk adds the `ThemeProvider` that toggles that class on the document root.

The UI package must be built before the app can import it and before `@source` can scan its component output, so every task that consumes UI depends on Turborepo's `^build`, including `dev`. `turbo dev` therefore builds UI once before starting the watchers, then runs the UI package's `tsc -p tsconfig.json --watch --preserveWatchOutput` script so its `dist` stays current while the web development server runs.

## Gates for a Vite app

`apps/web/package.json` defines the web workspace gates:

```json
{
  "build": "vite build",
  "typecheck": "tsr generate && tsc -p tsconfig.typecheck.json --noEmit",
  "test": "vitest run",
  "lint": "eslint . --max-warnings 0"
}
```

`vite build` produces a browser bundle in `apps/web/dist/client` and an SSR bundle in `apps/web/dist/server`.

`apps/web/vitest.config.ts` uses `environment: "jsdom"`, includes `src/**/__tests__/**/*.test.{ts,tsx}`, and loads `src/test/setup.ts`. The setup file imports `@testing-library/jest-dom/vitest`, which registers Testing Library DOM matchers. Web tests need a DOM, so the app uses its own Vitest config instead of the shared `@forgekit/vitest-config` factory, whose default environment is `node`.

`eslint . --max-warnings 0` runs the shared flat config. That config matches `**/*.ts` and `**/*.tsx`, so `@typescript-eslint/no-explicit-any` and `@forgekit/dependency-flow` apply to React files.

`apps/web/tsconfig.json` extends `@forgekit/typescript-config/base.json` and then uses bundler-oriented compiler options: `jsx: "react-jsx"`, `lib: ["ES2022", "DOM", "DOM.Iterable"]`, `moduleResolution: "Bundler"`, and `module: "ESNext"`. `apps/web/tsconfig.typecheck.json` extends that config, sets `noEmit: true`, and includes `src/routeTree.gen.ts` so generated route types are checked.

## Dependency edge

`apps/web/src/components/home-page.tsx` imports `Button` and `UI_VERSION` from `@forgekit/ui` and renders them in the placeholder. The `@forgekit/web` package declares `@forgekit/ui` as a workspace dependency, and `@forgekit/dependency-flow` allows that as the only internal runtime edge from web. Because the import is compiled into the app, Turborepo's `^build` dependency ordering has a real package edge to follow.

## Running it

Start the SSR development server with HMR from the web workspace:

```sh
pnpm --filter @forgekit/web dev
```

That command runs `vite dev`.

## References

- [TanStack Start](https://tanstack.com/start/latest) - the React framework that provides SSR, hydration, and Vite integration.
- [TanStack Router: File-Based Routing](https://tanstack.com/router/latest/docs/routing/file-based-routing) - filesystem routes and generated route trees.
- [TanStack Router: Router CLI](https://tanstack.com/router/latest/docs/installation/with-router-cli) - `tsr generate` route tree generation.
- [TanStack Router: Automatic Code Splitting](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting) - route-file export behavior for code splitting.
- [Vite](https://vite.dev/guide/) - the dev server and build tool used by the web app.
- [Vitest: environment](https://vitest.dev/config/#environment) - configuring the `jsdom` test environment.
- [Testing Library: React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - DOM-focused React test utilities.
