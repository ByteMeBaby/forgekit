/**
 * Syntax-level nudge against accidental missing `.where(...)` filters on
 * recognized Drizzle `delete(table)` and `update(table).set(...)` calls in
 * packages/db, packages/core, and apps/api. Browser, tooling, and test files
 * are outside this rule surface.
 *
 * Row-level security is the real cross-org guard. This rule only checks syntax:
 * an always-true filter, aliased handle, split builder, and raw SQL are known
 * bypasses documented in the rule guide.
 */
import type { Rule } from "eslint";
import type {
  Expression,
  Identifier,
  MemberExpression,
  PrivateIdentifier,
  SimpleCallExpression,
  SpreadElement,
  Super
} from "estree";

type ParentReference = {
  parent: Rule.Node;
};

type ParentedSimpleCallExpression = SimpleCallExpression & ParentReference;
type MutationMethod = "delete" | "update";
type MutationMemberExpression = MemberExpression & { property: Identifier & { name: MutationMethod } };

const drizzleSurfaceFilePattern = /(?:^|\/)(?:packages\/(?:db|core)|apps\/api)\//u;
const dbHandleNamePattern = /Db$|DB$/u;

function normalizeFilename(filename: string): string {
  return filename.replaceAll("\\", "/");
}

function isTestFile(filename: string): boolean {
  return (
    filename.includes("/__tests__/") || filename.endsWith(".test.ts") || filename.endsWith(".spec.ts")
  );
}

/**
 * Returns true for server files where a conventional Drizzle handle may appear.
 *
 * This package gate is a false-positive-avoidance choice, not a guarantee that
 * every unscoped delete is caught. dependency-flow stops other runtime packages
 * from importing @forgekit/db directly, so a `db`-named handle in browser or
 * tooling code is usually unrelated. packages/core can still re-export the
 * handle into apps/api, and aliases are invisible to this syntax rule.
 */
function isDrizzleSurfaceFile(filename: string): boolean {
  const normalizedFilename = normalizeFilename(filename);

  return drizzleSurfaceFilePattern.test(normalizedFilename) && !isTestFile(normalizedFilename);
}

/**
 * Narrows a node to an identifier so member properties can be matched without
 * accepting computed access or private fields.
 */
function isIdentifier(node: Expression | PrivateIdentifier | Super): node is Identifier {
  return node.type === "Identifier";
}

/**
 * Determines whether a call callee is the direct mutation member being audited.
 */
function isMutationMemberCallee(callee: Expression | Super): callee is MutationMemberExpression {
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    isIdentifier(callee.property) &&
    isMutationMethod(callee.property.name)
  );
}

function isMutationMethod(name: string): name is MutationMethod {
  return name === "delete" || name === "update";
}

/**
 * Extracts the conventional db handle name from `db.delete(...)`, `this.db.delete(...)`,
 * `ctx.db.update(...)`, and similar calls while ignoring more complex receiver expressions.
 */
function getReceiverName(member: MemberExpression): string | null {
  if (member.object.type === "Identifier") {
    return member.object.name;
  }

  // The receiver-name gate limits this syntax rule to the local Drizzle handle
  // convention and avoids treating every `.delete(...)` method as a table delete.
  if (
    member.object.type === "MemberExpression" &&
    !member.object.computed &&
    isIdentifier(member.object.property)
  ) {
    return member.object.property.name;
  }

  return null;
}

/**
 * Checks ForgeKit's hardcoded Drizzle handle naming convention.
 */
function isDbHandleName(name: string): boolean {
  // This mirrors eslint-plugin-drizzle's name-based matching style. ForgeKit
  // keeps the convention explicit in code instead of adding a rule option,
  // matching dependency-flow's explicit-code-over-config house style.
  return name === "db" || name === "tx" || dbHandleNamePattern.test(name);
}

/**
 * Returns true when the call shape looks like Drizzle's `delete(table)` or
 * `update(table)`.
 */
function hasSingleTableArgument(node: SimpleCallExpression): boolean {
  // Drizzle table deletes and updates take one table argument. Requiring that
  // shape avoids false positives from key-value clients such as `db.delete("store", key)`.
  if (node.arguments.length !== 1) {
    return false;
  }

  const argument = node.arguments[0];

  if (argument === undefined) {
    return false;
  }

  return !isLiteralKeyMutationArgument(argument);
}

/**
 * Recognizes literal key-value arguments that are not Drizzle table objects.
 */
function isLiteralKeyMutationArgument(argument: Expression | SpreadElement): boolean {
  return (
    (argument.type === "Literal" &&
      (typeof argument.value === "string" || typeof argument.value === "number")) ||
    argument.type === "TemplateLiteral"
  );
}

/**
 * Returns true when the mutation call's fluent chain includes an invoked
 * `.where(...)` member call.
 */
function isScopedByWhereInChain(node: ParentedSimpleCallExpression): boolean {
  let current: Rule.Node = node;

  // Updates put `.set(...)` between `update(table)` and `.where(...)`, so the
  // scope check must walk invoked fluent calls instead of checking one parent.
  while (true) {
    const member = getParentNode(current);

    if (
      member === null ||
      member.type !== "MemberExpression" ||
      member.computed ||
      member.object !== current ||
      !isIdentifier(member.property)
    ) {
      return false;
    }

    const call = getParentNode(member);

    if (call === null || call.type !== "CallExpression" || call.callee !== member) {
      return false;
    }

    if (member.property.name === "where") {
      return true;
    }

    current = call;
  }
}

function getParentNode(node: Rule.Node): Rule.Node | null {
  const parentedNode = node as Rule.Node & Partial<ParentReference>;

  return parentedNode.parent ?? null;
}

/**
 * Flags Drizzle `db.delete(table)` and `db.update(table).set(...)` calls that
 * are missing a `.where(...)` scope.
 */
export const noUnscopedDbMutationRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow unscoped db.delete(...) and db.update(...) mutations with no .where() clause",
      url: "https://github.com/ByteMeBaby/forgekit/blob/main/docs/eslint-rules/no-unscoped-db-mutation.md"
    },
    schema: [],
    messages: {
      unscopedMutation:
        "`{{name}}.{{method}}(...)` has no `.where(...)` filter, so it affects every row. Scope it to the caller's rows, for example `.where(eq(table.orgId, orgId))`. This is a syntax-level nudge, not a guarantee (an always-true filter or an aliased handle still slips through), and row-level security is the real cross-org guard. If an unfiltered {{method}} is intended, allow it with `// eslint-disable-next-line @forgekit/no-unscoped-db-mutation -- <reason>`."
    }
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    // Scope the rule to server surfaces where a conventional Drizzle handle may
    // appear while avoiding browser, tooling, and test false positives.
    if (!isDrizzleSurfaceFile(context.filename)) {
      return {};
    }

    return {
      CallExpression(node: ParentedSimpleCallExpression): void {
        if (!isMutationMemberCallee(node.callee)) {
          return;
        }

        const name = getReceiverName(node.callee);
        const method = node.callee.property.name;

        if (name === null || !isDbHandleName(name) || !hasSingleTableArgument(node)) {
          return;
        }

        if (isScopedByWhereInChain(node)) {
          return;
        }

        context.report({
          node,
          messageId: "unscopedMutation",
          data: {
            name,
            method
          }
        });
      }
    };
  }
};
