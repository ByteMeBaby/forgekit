import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";

import { noUnscopedDbMutationRule } from "../rules/no-unscoped-db-mutation.js";

type RuleTesterWithVitestHooks = typeof RuleTester & {
  afterAll?: typeof afterAll;
};

const vitestRuleTester = RuleTester as RuleTesterWithVitestHooks;

vitestRuleTester.describe = describe;
vitestRuleTester.it = it;
vitestRuleTester.itOnly = it.only;
vitestRuleTester.afterAll = afterAll;

afterAll((): void => {
  vitestRuleTester.describe = null;
  vitestRuleTester.it = null;
  vitestRuleTester.itOnly = null;
  vitestRuleTester.afterAll = undefined;
});

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  }
});

ruleTester.run("no-unscoped-db-mutation", noUnscopedDbMutationRule, {
  valid: [
    {
      name: "scoped db delete is allowed",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.delete(users).where(eq(users.orgId, orgId))"
    },
    {
      name: "awaited scoped db delete is allowed",
      filename: "/repo/packages/db/src/repo.ts",
      code: "await db.delete(users).where(eq(users.orgId, orgId))"
    },
    {
      name: "chained returning after where is allowed",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.delete(users).where(eq(users.orgId, orgId)).returning()"
    },
    {
      name: "optional scoped db delete is allowed",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db?.delete(users).where(eq(users.orgId, orgId))"
    },
    {
      name: "scoped db update is allowed",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.update(users).set({ active: false }).where(eq(users.orgId, orgId))"
    },
    {
      name: "awaited scoped db update is allowed",
      filename: "/repo/packages/db/src/repo.ts",
      code: "await db.update(users).set({ active: false }).where(eq(users.orgId, orgId))"
    },
    {
      name: "chained returning after update where is allowed",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.update(users).set({ active: false }).where(eq(users.orgId, orgId)).returning()"
    },
    {
      name: "optional scoped db update is allowed",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db?.update(users).set({ active: false }).where(eq(users.orgId, orgId))"
    },
    {
      name: "map delete is ignored",
      filename: "/repo/packages/core/src/service.ts",
      code: "someMap.delete(key)"
    },
    {
      name: "cache delete is ignored",
      filename: "/repo/packages/core/src/service.ts",
      code: "cache.delete(k)"
    },
    {
      name: "two-argument key-value delete is ignored",
      filename: "/repo/packages/db/src/repo.ts",
      code: 'db.delete("store", key)'
    },
    {
      name: "string key-value delete is ignored",
      filename: "/repo/packages/db/src/repo.ts",
      code: 'db.delete("keyval")'
    },
    {
      name: "always-true filter is not caught (known gap)",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.delete(users).where(sql`1=1`)"
    },
    {
      name: "always-true update filter is not caught (known gap)",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.update(users).set({ active: false }).where(sql`1=1`)"
    },
    {
      name: "aliased handle is not caught (known gap)",
      filename: "/repo/packages/db/src/repo.ts",
      code: "const d = db; d.delete(users);"
    },
    {
      name: "aliased update handle is not caught (known gap)",
      filename: "/repo/packages/db/src/repo.ts",
      code: "const d = db; d.update(users).set({ active: false });"
    },
    {
      name: "apps/web db delete is outside the rule surface",
      filename: "/repo/apps/web/src/idb.ts",
      code: "db.delete(users)"
    },
    {
      name: "test file db delete is outside the rule surface",
      filename: "/repo/packages/db/src/__tests__/repo.test.ts",
      code: "db.delete(users)"
    }
  ],
  invalid: [
    {
      name: "plain db delete is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.delete(users)",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "awaited db delete is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "await db.delete(users)",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "returning without where is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.delete(users).returning()",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "execute without where is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.delete(users).execute()",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "tx delete is reported",
      filename: "/repo/packages/core/src/service.ts",
      code: "tx.delete(users)",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "Db-suffixed receiver delete is reported",
      filename: "/repo/packages/core/src/service.ts",
      code: "appDb.delete(users)",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "this db delete is reported",
      filename: "/repo/packages/core/src/service.ts",
      code: "this.db.delete(users)",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "unscoped delete in apps/api is caught",
      filename: "/repo/apps/api/src/x.ts",
      code: "db.delete(users)",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "plain db update is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.update(users).set({ active: false })",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "awaited db update is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "await db.update(users).set({ active: false })",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "update returning without where is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.update(users).set({ active: false }).returning()",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "tx update is reported",
      filename: "/repo/packages/core/src/service.ts",
      code: "tx.update(users).set({ active: false })",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    },
    {
      name: "unscoped update in apps/api is caught",
      filename: "/repo/apps/api/src/x.ts",
      code: "db.update(users).set({ active: false })",
      errors: [
        {
          messageId: "unscopedMutation"
        }
      ]
    }
  ]
});
