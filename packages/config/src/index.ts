/**
 * Imported by @forgekit/db to thread a real compiled import along the first dependency edge,
 * making turbo dependsOn ordering and dist-consumption real rather than assumed.
 */
export const FORGEKIT_VERSION = "0.0.0";

export { parseEnv } from "./env.js";
export { assertRequiredEnv, warnUsingMocks } from "./presence.js";
export type { Env } from "./env.js";
