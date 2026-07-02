import { CORE_VERSION } from "@forgekit/core";

/**
 * Imported from the package one step down to thread a real compiled import along this edge,
 * making turbo dependsOn ordering and dist-consumption real rather than assumed.
 */
export const API_VERSION = `api:${CORE_VERSION}`;

/**
 * Returns the API app version marker for callers that need a function-shaped app health signal.
 */
export function getApiVersion(): string {
  return API_VERSION;
}
