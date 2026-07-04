import { FORGEKIT_VERSION } from "@forgekit/config";

/**
 * Imported from the package one step down to thread a real compiled import along this edge,
 * making turbo dependsOn ordering and dist-consumption real rather than assumed.
 */
export const DB_VERSION = `db:${FORGEKIT_VERSION}`;

export { createDb, type DbHandle } from "./client.js";
export { uuidv7 } from "./ids.js";
export { runMigrations } from "./migrate.js";
export { APP_ROLE, OPERATOR_ROLE, OWNER_ROLE, deriveRoleUrl, resolveDatabaseUrls } from "./roles.js";
export { seed } from "./seed.js";
export { getScopedDb, withOrgScope, withScopedDb, type ScopedDb } from "./scope.js";
