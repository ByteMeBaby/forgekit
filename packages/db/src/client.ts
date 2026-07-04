import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/** A live database handle: the Drizzle query interface, its underlying pool, and a close function. */
export interface DbHandle {
  db: NodePgDatabase;
  pool: Pool;
  close: () => Promise<void>;
}

/**
 * Creates a database handle for a single connection URL. The pool connects lazily on first query,
 * so constructing a handle never requires a reachable database. `close` drains the pool.
 */
export function createDb(url: string): DbHandle {
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);
  return { db, pool, close: () => pool.end() };
}
