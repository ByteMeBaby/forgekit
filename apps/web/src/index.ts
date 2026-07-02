import { UI_VERSION } from "@forgekit/ui";

/**
 * Imported from the package one step down to thread a real compiled import along this edge,
 * making turbo dependsOn ordering and dist-consumption real rather than assumed.
 */
export const WEB_VERSION = `web:${UI_VERSION}`;

/**
 * Returns the web app version marker for callers that need a function-shaped app health signal.
 */
export function getWebVersion(): string {
  return WEB_VERSION;
}
