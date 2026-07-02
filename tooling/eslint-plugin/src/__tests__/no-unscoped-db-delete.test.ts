import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";

import { noUnscopedDbDeleteRule } from "../rules/no-unscoped-db-delete.js";

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

ruleTester.run("no-unscoped-db-delete", noUnscopedDbDeleteRule, {
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
      name: "app file db delete is outside the rule surface",
      filename: "/repo/apps/web/src/idb.ts",
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
          messageId: "unscopedDelete"
        }
      ]
    },
    {
      name: "awaited db delete is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "await db.delete(users)",
      errors: [
        {
          messageId: "unscopedDelete"
        }
      ]
    },
    {
      name: "returning without where is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.delete(users).returning()",
      errors: [
        {
          messageId: "unscopedDelete"
        }
      ]
    },
    {
      name: "execute without where is reported",
      filename: "/repo/packages/db/src/repo.ts",
      code: "db.delete(users).execute()",
      errors: [
        {
          messageId: "unscopedDelete"
        }
      ]
    },
    {
      name: "tx delete is reported",
      filename: "/repo/packages/core/src/service.ts",
      code: "tx.delete(users)",
      errors: [
        {
          messageId: "unscopedDelete"
        }
      ]
    },
    {
      name: "Db-suffixed receiver delete is reported",
      filename: "/repo/packages/core/src/service.ts",
      code: "appDb.delete(users)",
      errors: [
        {
          messageId: "unscopedDelete"
        }
      ]
    },
    {
      name: "this db delete is reported",
      filename: "/repo/packages/core/src/service.ts",
      code: "this.db.delete(users)",
      errors: [
        {
          messageId: "unscopedDelete"
        }
      ]
    }
  ]
});
