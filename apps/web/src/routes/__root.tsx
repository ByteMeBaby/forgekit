// Defines the TanStack Start root route and document shell.

import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import type React from "react";
import type { ReactNode } from "react";

type RootDocumentProps = Readonly<{
  children: ReactNode;
}>;

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
    <RootDocument>
      <main>
        <h1>ForgeKit</h1>
        <Outlet />
      </main>
    </RootDocument>
  );
}

function RootErrorComponent(): React.JSX.Element {
  return (
    <RootDocument>
      <main>
        <h1>ForgeKit</h1>
        <p>Something went wrong.</p>
      </main>
    </RootDocument>
  );
}

function RootNotFoundComponent(): React.JSX.Element {
  return (
    <RootDocument>
      <main>
        <h1>ForgeKit</h1>
        <p>Page not found.</p>
      </main>
    </RootDocument>
  );
}

function RootDocument({ children }: RootDocumentProps): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
