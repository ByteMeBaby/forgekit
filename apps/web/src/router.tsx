// Creates the TanStack Router instance consumed by TanStack Start.

import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

import type { Router } from "@tanstack/react-router";

/**
 * Creates a configured TanStack Router instance for the web app.
 */
export function getRouter(): Router<typeof routeTree> {
  return createRouter({
    routeTree,
    scrollRestoration: true
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
