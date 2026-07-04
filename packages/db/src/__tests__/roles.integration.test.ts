import { describe, expect, it } from "vitest";

import { APP_ROLE, createDb, OPERATOR_ROLE, OWNER_ROLE, runMigrations } from "../index.js";

interface RoleRow {
  rolname: string;
  rolcanlogin: boolean;
  rolbypassrls: boolean;
}

const databaseUrl = process.env.DATABASE_URL ?? "";

describe.skipIf(!databaseUrl)("database role migration", () => {
  it("creates the ForgeKit database roles with the expected attributes", async () => {
    await runMigrations(databaseUrl);

    const handle = createDb(databaseUrl);

    try {
      const result = await handle.pool.query<RoleRow>(
        "SELECT rolname, rolcanlogin, rolbypassrls FROM pg_roles WHERE rolname = ANY($1::name[])",
        [[OWNER_ROLE, APP_ROLE, OPERATOR_ROLE]],
      );
      const roles = new Map(result.rows.map((role) => [role.rolname, role]));

      expect(roles.has(OWNER_ROLE)).toBe(true);
      expect(roles.get(APP_ROLE)).toMatchObject({
        rolcanlogin: true,
        rolbypassrls: false,
      });
      expect(roles.get(OPERATOR_ROLE)).toMatchObject({
        rolbypassrls: true,
      });
    } finally {
      await handle.close();
    }
  });
});
