import { FORGEKIT_VERSION } from "@forgekit/config";

/**
 * Imported from the package one step down to thread a real compiled import along this edge,
 * making turbo dependsOn ordering and dist-consumption real rather than assumed.
 */
export const DB_VERSION = `db:${FORGEKIT_VERSION}`;
