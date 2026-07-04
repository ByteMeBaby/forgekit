import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { DbHandle } from "../index.js";
import {
  createDb,
  getScopedDb,
  resolveDatabaseUrls,
  runMigrations,
  uuidv7,
  withOrgScope,
} from "../index.js";

interface ExampleRecordRow {
  id: string;
  orgId: string;
  body: string;
}

interface OrgIdRow {
  org_id: string;
}

interface CountRow {
  count: string;
}

const base = process.env.DATABASE_URL;

function requireUrl(url: string | null, name: string): string {
  if (!url) {
    throw new Error(`${name} database URL was not resolved.`);
  }

  return url;
}

function requireHandle(handle: DbHandle | null, name: string): DbHandle {
  if (!handle) {
    throw new Error(`${name} database handle was not initialized.`);
  }

  return handle;
}

describe.skipIf(!base)("tenant isolation", () => {
  let appDb: DbHandle | null = null;
  let operatorDb: DbHandle | null = null;

  beforeAll(async () => {
    if (!base) {
      return;
    }

    await runMigrations(base);

    const urls = resolveDatabaseUrls({ DATABASE_URL: base });
    appDb = createDb(requireUrl(urls.app, "app"));
    operatorDb = createDb(requireUrl(urls.operator, "operator"));

    await operatorDb.db.execute(sql`DELETE FROM example_records`);
    await operatorDb.db.execute(sql`
      INSERT INTO example_records (id, org_id, body)
      VALUES
        (${uuidv7()}, 'org_a', 'org a seed'),
        (${uuidv7()}, 'org_b', 'org b seed')
    `);
  });

  afterAll(async () => {
    await Promise.all([appDb?.close(), operatorDb?.close()]);
  });

  it("app scoped to org_a reads only org_a rows", async () => {
    const handle = requireHandle(appDb, "app");

    await withOrgScope(handle.db, "org_a", async () => {
      const scopedDb = getScopedDb(handle.db);
      const result = await scopedDb.execute(sql<ExampleRecordRow>`
        SELECT id, org_id AS "orgId", body
        FROM example_records
        ORDER BY body
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows.every((row) => row.orgId === "org_a")).toBe(true);
    });
  });

  it("app scoped to org_a is refused an insert targeting org_b", async () => {
    const handle = requireHandle(appDb, "app");

    await expect(
      withOrgScope(handle.db, "org_a", async () =>
        getScopedDb(handle.db).execute(sql`
          INSERT INTO example_records (id, org_id, body)
          VALUES (${uuidv7()}, 'org_b', 'blocked org b insert')
        `),
      ),
    ).rejects.toThrow();
  });

  it("app scoped to org_a may insert an org_a row", async () => {
    const handle = requireHandle(appDb, "app");
    const id = uuidv7();

    await expect(
      withOrgScope(handle.db, "org_a", async () =>
        getScopedDb(handle.db).execute(sql`
          INSERT INTO example_records (id, org_id, body)
          VALUES (${id}, 'org_a', 'allowed org a insert')
        `),
      ),
    ).resolves.toBeDefined();

    await withOrgScope(handle.db, "org_a", async () => {
      const result = await getScopedDb(handle.db).execute(sql<ExampleRecordRow>`
        SELECT id, org_id AS "orgId", body
        FROM example_records
        WHERE id = ${id}
      `);

      expect(result.rows).toContainEqual({
        id,
        orgId: "org_a",
        body: "allowed org a insert",
      });
    });
  });

  it("operator sees every org", async () => {
    const handle = requireHandle(operatorDb, "operator");
    const result = await handle.pool.query<OrgIdRow>(
      "SELECT DISTINCT org_id FROM example_records ORDER BY org_id",
    );
    const orgIds = new Set(result.rows.map((row) => row.org_id));

    expect(orgIds.has("org_a")).toBe(true);
    expect(orgIds.has("org_b")).toBe(true);
  });

  it("unscoped app fails closed", async () => {
    const handle = requireHandle(appDb, "app");
    const result = await handle.pool.query<CountRow>("SELECT count(*) FROM example_records");
    const count = Number(result.rows[0]?.count ?? "-1");

    expect(count).toBe(0);
  });
});
