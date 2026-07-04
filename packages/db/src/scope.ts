import { AsyncLocalStorage } from "node:async_hooks";

import { sql } from "drizzle-orm";
import type { NodePgDatabase, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";

export type ScopedDb = PgDatabase<NodePgQueryResultHKT>;

const scopedDbStorage = new AsyncLocalStorage<ScopedDb>();

export function withScopedDb<T>(db: ScopedDb, fn: () => T): T {
  return scopedDbStorage.run(db, fn);
}

/**
 * The fallback must be the app-role pool so a query that runs with no scope active fails closed
 * because RLS still applies, rather than reading across tenants.
 */
export function getScopedDb(fallback: ScopedDb): ScopedDb {
  return scopedDbStorage.getStore() ?? fallback;
}

export async function withOrgScope<T>(
  rootDb: NodePgDatabase,
  orgId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return rootDb.transaction(async (tx) => {
    /*
     * set_config(..., is_local => true) is the transaction-scoped equivalent of SET LOCAL that
     * does accept a bind parameter, so the org id is passed as a parameter and never
     * string-concatenated into SQL. The org id is always server-derived, such as from a membership
     * row, API key, or signed webhook, never user input. Being transaction-local, Postgres reverts
     * it on commit or rollback, so no value leaks across pooled connections.
     */
    await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgId}, true)`);
    return withScopedDb(tx, fn);
  });
}
