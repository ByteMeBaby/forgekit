// Defines the placeholder home page component.

import { Button, UI_VERSION } from "@forgekit/ui";

import type React from "react";

/**
 * Renders the initial ForgeKit web placeholder.
 */
export function HomePage(): React.JSX.Element {
  return (
    <section className="text-foreground">
      <p>ForgeKit web is running.</p>
      <Button type="button">Get started</Button>
      <p>UI package version: {UI_VERSION}</p>
    </section>
  );
}
