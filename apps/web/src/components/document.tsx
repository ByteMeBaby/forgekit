// Defines the HTML document shell for the web app.

import { HeadContent, Scripts } from "@tanstack/react-router";

import type React from "react";
import type { ReactNode } from "react";

type DocumentProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Renders the HTML document shell that wraps every route: the head content and the
 * hydration scripts. Later chunks add the theme provider, fonts, and analytics here.
 */
export function Document({ children }: DocumentProps): React.JSX.Element {
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
