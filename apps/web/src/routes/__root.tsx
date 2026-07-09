// Defines the TanStack Start root route and its view states.

import { Outlet, createRootRoute } from "@tanstack/react-router";

import type React from "react";

import { Document } from "../components/document";

/**
 * Root route registration for the ForgeKit web app.
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ForgeKit" }
    ]
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent
});

function RootComponent(): React.JSX.Element {
  return (
    <Document>
      <main>
        <h1>ForgeKit</h1>
        <Outlet />
      </main>
    </Document>
  );
}

function RootErrorComponent(): React.JSX.Element {
  return (
    <Document>
      <main>
        <h1>ForgeKit</h1>
        <p>Something went wrong.</p>
      </main>
    </Document>
  );
}

function RootNotFoundComponent(): React.JSX.Element {
  return (
    <Document>
      <main>
        <h1>ForgeKit</h1>
        <p>Page not found.</p>
      </main>
    </Document>
  );
}
