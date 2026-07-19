# UI Component Library

## Why this exists

`@forgekit/ui` gives ForgeKit applications a small, consistent component layer without making each app recreate accessible interaction behavior or semantic theme tokens. The components wrap Radix primitives where interaction behavior matters and use Tailwind v4 semantic utilities so application code speaks in terms of intent rather than hard-coded colors.

## Public surface

The public surface is organized by family: the `cn` helper; `Button` and `buttonVariants`; the `Card` family; `Input` and `Label`; the `Tabs` family; the `Dialog` family; the `DropdownMenu` family; and the `Avatar` family. `packages/ui/src/index.ts` is the authoritative list of exported names.

`ButtonProps` and `ButtonVariantProps` are exported for typed wrappers. `UI_VERSION` remains a compatibility export used by the web app's package dependency edge.

`cn(...classes)` combines conditional class inputs with `clsx`, then resolves conflicting Tailwind utilities with `tailwind-merge`. It is the standard way to append a consumer class to a component's default classes.

## Entry points and theme generation

Import components from `@forgekit/ui`. Import the Tailwind v4 theme separately from `@forgekit/ui/theme.css`; it is intentionally not imported by the JavaScript barrel.

An app stylesheet must import Tailwind before the ForgeKit theme and source the compiled UI package, so Tailwind generates utilities referenced inside the components:

```css
@import "tailwindcss";
@import "@forgekit/ui/theme.css";

@source "../../../packages/ui/dist";
```

The `@source` path is application-stylesheet-relative. The example fits a stylesheet under `apps/web/src`; use the equivalent path to the compiled `@forgekit/ui/dist` in another app. This wiring belongs to the later app integration chunk.

`src/theme.css` is the source of truth for semantic tokens and radii. It defines light values on `:root` and dark values under `.dark`. A `.dark` ancestor flips the tokens for all descendants. The later `ThemeProvider` applies or removes that class on `<html>`.

## Component contracts

Components accept refs as ordinary React 19 props and pass them through their primitive or native element. They do not use `forwardRef`.

`Button` supports `asChild`, which uses Radix `Slot` to place button behavior and classes on its only child. That child must be one focusable element that spreads received props and accepts a ref.

Every component root includes a `data-slot` attribute. Applications can use these stable hooks for targeted styling and tests without depending on the component's generated class ordering.

## Testing boundary

This package unit-tests DOM behavior with jsdom, including Radix keyboard and portal interactions. Compiled CSS output and visual verification happen when an application imports the theme and sources the compiled package.

## Adding a component

- Add the component module under `packages/ui/src/components` with semantic static Tailwind classes and `data-slot` hooks.
- Add a neighboring DOM behavior test under `packages/ui/src/components/__tests__`.
- Add explicit value and type exports to `packages/ui/src/index.ts`.
- A new dependency is a deliberate decision; it is not a side effect of adding a component.

## References

- [Radix Primitives](https://www.radix-ui.com/primitives) - accessible low-level React primitives.
- [Tailwind CSS v4](https://tailwindcss.com/docs) - utility generation and theme configuration.
- [shadcn/ui](https://ui.shadcn.com/) - component composition conventions.
- [class-variance-authority](https://cva.style/docs) - typed variant recipes.
- [tailwind-merge](https://github.com/dcastil/tailwind-merge) - Tailwind conflict resolution.
