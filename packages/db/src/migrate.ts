import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

export async function runMigrations(url: string): Promise<void> {
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }
}
