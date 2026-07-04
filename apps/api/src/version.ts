import { CORE_VERSION } from "@forgekit/core";

/**
 * Version marker that keeps the runtime dependency edge from core into api visible to the compiler.
 */
export const API_VERSION = `api:${CORE_VERSION}`;

/**
 * Returns the API app version marker for callers that need a function-shaped app health signal.
 */
export function getApiVersion(): string {
  return API_VERSION;
}
