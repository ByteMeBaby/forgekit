import { DB_VERSION } from "@forgekit/db";

/**
 * Imported from the package one step down to thread a real compiled import along this edge,
 * making turbo dependsOn ordering and dist-consumption real rather than assumed.
 */
export const CORE_VERSION = `core:${DB_VERSION}`;
