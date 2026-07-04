// Role names and connection-URL derivation for the three-role Postgres model.

/** Owns the schema and runs migrations and DDL. */
export const OWNER_ROLE = "forgekit_owner";
/** The per-request application role. Not superuser, not BYPASSRLS, so RLS policies apply to it. */
export const APP_ROLE = "forgekit_app";
/** The cross-tenant role for admin surfaces and scheduled jobs. BYPASSRLS, so policies do not apply. */
export const OPERATOR_ROLE = "forgekit_operator";

interface DatabaseUrlEnv {
  DATABASE_URL?: string;
  APP_DATABASE_URL?: string;
  OPERATOR_DATABASE_URL?: string;
}

interface ResolvedDatabaseUrls {
  app: string | null;
  operator: string | null;
}

/**
 * Returns `databaseUrl` with its username replaced by `role`, keeping host, port, database, and
 * password. Used to derive the app and operator connection URLs from a single base URL in
 * development; production sets the per-role URLs explicitly with their own credentials.
 */
export function deriveRoleUrl(databaseUrl: string, role: string): string {
  const url = new URL(databaseUrl);
  url.username = role;
  return url.toString();
}

/**
 * Resolves the effective app and operator connection URLs. An explicit APP_DATABASE_URL or
 * OPERATOR_DATABASE_URL wins; otherwise each derives from DATABASE_URL by role swap. Both are
 * null when no database is configured, so the app can boot inert on in-memory fallbacks.
 */
export function resolveDatabaseUrls(env: DatabaseUrlEnv): ResolvedDatabaseUrls {
  const base = env.DATABASE_URL;
  return {
    app: env.APP_DATABASE_URL ?? (base ? deriveRoleUrl(base, APP_ROLE) : null),
    operator: env.OPERATOR_DATABASE_URL ?? (base ? deriveRoleUrl(base, OPERATOR_ROLE) : null),
  };
}
