// Defines the placeholder home page component.

import { UI_VERSION } from "@forgekit/ui";

import type React from "react";

/**
 * Renders the initial ForgeKit web placeholder.
 */
export function HomePage(): React.JSX.Element {
  return (
    <section>
      <p>ForgeKit web is running.</p>
      <p>UI package version: {UI_VERSION}</p>
    </section>
  );
}
