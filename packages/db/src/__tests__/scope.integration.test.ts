import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDb, getScopedDb, runMigrations, withOrgScope } from "../index.js";

interface CurrentOrgRow {
  currentOrgId: string | null;
}

const databaseUrl = process.env.DATABASE_URL ?? "";

describe.skipIf(!databaseUrl)("database scope context", () => {
  it("binds the current organization inside a scoped transaction without leaking it", async () => {
    await runMigrations(databaseUrl);

    const handle = createDb(databaseUrl);

    try {
      await withOrgScope(handle.db, "org_scope_test", async () => {
        const scopedDb = getScopedDb(handle.db);
        expect(scopedDb).toBeDefined();

        const result = await scopedDb.execute(
          sql<CurrentOrgRow>`SELECT current_setting('app.current_org_id', true) AS "currentOrgId"`,
        );

        expect(result.rows[0]?.currentOrgId).toBe("org_scope_test");
      });

      const outside = await handle.pool.query<CurrentOrgRow>(
        `SELECT current_setting('app.current_org_id', true) AS "currentOrgId"`,
      );
      const outsideValue = outside.rows[0]?.currentOrgId;

      expect(outsideValue === null || outsideValue === "").toBe(true);
    } finally {
      await handle.close();
    }
  });
});
