import { Pool } from "pg";

import { runMigrations } from "../migrate.js";
import { seed } from "../seed.js";

function getRequiredDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database reset.");
  }

  return databaseUrl;
}

function getDatabaseName(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//u, ""));

  if (!databaseName) {
    throw new Error("DATABASE_URL must include a database name.");
  }

  if (databaseName === "postgres") {
    throw new Error("Refusing to reset the postgres maintenance database.");
  }

  return databaseName;
}

function getMaintenanceUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  url.pathname = "/postgres";
  return url.toString();
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function resetDatabase(databaseUrl: string): Promise<void> {
  const databaseName = getDatabaseName(databaseUrl);
  const maintenanceUrl = getMaintenanceUrl(databaseUrl);
  const pool = new Pool({ connectionString: maintenanceUrl });
  const quotedDatabaseName = quoteIdentifier(databaseName);

  try {
    await pool.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
      [databaseName],
    );
    await pool.query(`DROP DATABASE IF EXISTS ${quotedDatabaseName} WITH (FORCE)`);
    await pool.query(`CREATE DATABASE ${quotedDatabaseName}`);
  } finally {
    await pool.end();
  }
}

async function main(): Promise<void> {
  const databaseUrl = getRequiredDatabaseUrl();

  await resetDatabase(databaseUrl);
  await runMigrations(databaseUrl);
  await seed(databaseUrl);
}

await main();
