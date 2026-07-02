import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";

import { dependencyFlowRule } from "../rules/dependency-flow.js";

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

ruleTester.run("dependency-flow", dependencyFlowRule, {
  valid: [
    {
      name: "db may import config",
      filename: "/repo/packages/db/src/index.ts",
      code: 'import { FORGEKIT_VERSION } from "@forgekit/config";'
    },
    {
      name: "core may import db",
      filename: "/repo/packages/core/src/index.ts",
      code: 'import { DB_VERSION } from "@forgekit/db";'
    },
    {
      name: "api may import core",
      filename: "/repo/apps/api/src/index.ts",
      code: 'import { CORE_VERSION } from "@forgekit/core";'
    },
    {
      name: "web may import ui",
      filename: "/repo/apps/web/src/index.ts",
      code: 'import { UI_VERSION } from "@forgekit/ui";'
    },
    {
      name: "tooling config packages are allowed everywhere",
      filename: "/repo/packages/ui/vitest.config.ts",
      code: 'import { createForgekitVitestConfig } from "@forgekit/vitest-config";'
    },
    {
      name: "plain external imports are ignored",
      filename: "/repo/packages/config/src/index.ts",
      code: 'import { defineConfig } from "vitest/config";'
    }
  ],
  invalid: [
    {
      name: "ui may not import db",
      filename: "/repo/packages/ui/src/index.ts",
      code: 'import { DB_VERSION } from "@forgekit/db";',
      errors: [
        {
          message: "@forgekit/ui may not import @forgekit/db. Allowed internal dependencies: none."
        }
      ]
    },
    {
      name: "api may not import db",
      filename: "/repo/apps/api/src/index.ts",
      code: 'import { DB_VERSION } from "@forgekit/db";',
      errors: [
        {
          message: "@forgekit/api may not import @forgekit/db. Allowed internal dependencies: @forgekit/core."
        }
      ]
    },
    {
      name: "web may not import core",
      filename: "/repo/apps/web/src/index.ts",
      code: 'import { CORE_VERSION } from "@forgekit/core";',
      errors: [
        {
          message: "@forgekit/web may not import @forgekit/core. Allowed internal dependencies: @forgekit/ui."
        }
      ]
    },
    {
      name: "core may not import config",
      filename: "/repo/packages/core/src/index.ts",
      code: 'import { FORGEKIT_VERSION } from "@forgekit/config";',
      errors: [
        {
          message: "@forgekit/core may not import @forgekit/config. Allowed internal dependencies: @forgekit/db."
        }
      ]
    },
    {
      name: "config may not import db",
      filename: "/repo/packages/config/src/index.ts",
      code: 'import { DB_VERSION } from "@forgekit/db";',
      errors: [
        {
          message: "@forgekit/config may not import @forgekit/db. Allowed internal dependencies: none."
        }
      ]
    }
  ]
});
