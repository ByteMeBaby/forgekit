import { Linter, RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, expect, it } from "vitest";

import { noRawClientIpHeaderRule } from "../rules/no-raw-client-ip-header.js";

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
    parser: tseslint.parser,
    ecmaVersion: "latest",
    sourceType: "module"
  }
});

ruleTester.run("no-raw-client-ip-header", noRawClientIpHeaderRule, {
  valid: [
    {
      name: "type position is skipped",
      filename: "/repo/apps/api/src/types.ts",
      code: 'type H = "x-forwarded-for";'
    },
    {
      name: "unrelated header is allowed",
      filename: "/repo/apps/api/src/mw.ts",
      code: 'const v = req.headers["content-type"];'
    },
    {
      name: "computed construction is accepted gap",
      filename: "/repo/apps/api/src/mw.ts",
      code: 'const h = "x-forwarded" + "-for";'
    },
    {
      name: "test file is exempt",
      filename: "/repo/apps/api/src/__tests__/mw.test.ts",
      code: 'const v = req.headers["x-forwarded-for"];'
    },
    {
      name: "spec file is exempt",
      filename: "/repo/apps/web/src/mw.spec.ts",
      code: 'const v = req.headers["x-forwarded-for"];'
    },
    {
      name: "tooling is exempt",
      filename: "/repo/tooling/eslint-plugin/src/rules/x.ts",
      code: 'const s = "x-forwarded-for";'
    }
  ],
  invalid: [
    {
      name: "raw x-forwarded-for read is reported",
      filename: "/repo/apps/api/src/mw.ts",
      code: 'const v = req.headers["x-forwarded-for"];',
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "case-insensitive header is reported",
      filename: "/repo/apps/api/src/mw.ts",
      code: 'const v = c.req.header("X-Forwarded-For");',
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "single quotes are reported",
      filename: "/repo/packages/core/src/ip.ts",
      code: "const v = headers.get('x-forwarded-for');",
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "template literal is reported",
      filename: "/repo/packages/core/src/ip.ts",
      code: "const v = headers.get(`x-forwarded-for`);",
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "object key position is reported on purpose",
      filename: "/repo/apps/api/src/log.ts",
      code: 'const redact = { "x-forwarded-for": true };',
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "web layer is in scope",
      filename: "/repo/apps/web/src/mw.ts",
      code: 'const v = req.headers["x-forwarded-for"];',
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "x-real-ip is reported",
      filename: "/repo/apps/api/src/mw.ts",
      code: 'req.headers["x-real-ip"]',
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "cf-connecting-ip is reported",
      filename: "/repo/apps/api/src/mw.ts",
      code: 'req.headers["cf-connecting-ip"]',
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "true-client-ip is reported",
      filename: "/repo/apps/api/src/mw.ts",
      code: 'req.headers["true-client-ip"]',
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    },
    {
      name: "x-client-ip is reported",
      filename: "/repo/apps/api/src/mw.ts",
      code: 'req.headers["x-client-ip"]',
      errors: [
        {
          messageId: "rawClientIpHeader"
        }
      ]
    }
  ]
});

describe("configured rule id", (): void => {
  it("respects the documented disable comment", (): void => {
    const linter = new Linter({
      cwd: "/repo",
      configType: "flat"
    });

    const messages = linter.verify(
      '// eslint-disable-next-line @forgekit/no-raw-client-ip-header -- canonical helper\nconst v = req.headers["x-forwarded-for"];',
      [
        {
          files: ["**/*.ts"],
          languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: "latest",
            sourceType: "module"
          },
          plugins: {
            "@forgekit": {
              rules: {
                "no-raw-client-ip-header": noRawClientIpHeaderRule
              }
            }
          },
          rules: {
            "@forgekit/no-raw-client-ip-header": "error"
          }
        }
      ],
      {
        filename: "/repo/apps/api/src/mw.ts"
      }
    );

    expect(messages).toEqual([]);
  });
});
