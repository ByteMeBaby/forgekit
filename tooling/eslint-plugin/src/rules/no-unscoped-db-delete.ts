/**
 * Guards ForgeKit's Drizzle delete calls from deleting whole tables by requiring
 * an immediately invoked `.where(...)` scope on every recognized `db.delete(table)`.
 *
 * The rule is intentionally syntax-based and package-scoped. That keeps it fast
 * and avoids flagging unrelated browser storage or cache handles named `db` in
 * packages that cannot import the Drizzle handle.
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

const drizzleSurfaceFilePattern = /(?:^|\/)packages\/(?:db|core)\//u;
const dbHandleNamePattern = /Db$|DB$/u;

/**
 * Returns true for files in packages that may legitimately hold a Drizzle db handle.
 *
 * The package gate relies on the dependency-flow rule's runtime graph guarantee:
 * only packages/db and packages/core may import @forgekit/db, so other app and
 * package code can safely use names like `db` for unrelated clients.
 */
function isDrizzleSurfaceFile(filename: string): boolean {
  const normalizedFilename = filename.replaceAll("\\", "/");

  return drizzleSurfaceFilePattern.test(normalizedFilename);
}

/**
 * Narrows a node to an identifier so member properties can be matched without
 * accepting computed access or private fields.
 */
function isIdentifier(node: Expression | PrivateIdentifier | Super): node is Identifier {
  return node.type === "Identifier";
}

/**
 * Determines whether a call callee is the direct `.delete` member being audited.
 */
function isDeleteMemberCallee(
  callee: Expression | Super
): callee is MemberExpression & { property: Identifier } {
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    isIdentifier(callee.property) &&
    callee.property.name === "delete"
  );
}

/**
 * Extracts the conventional db handle name from `db.delete(...)`, `this.db.delete(...)`,
 * and `ctx.db.delete(...)` while ignoring more complex receiver expressions.
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
 * Returns true when the delete call shape looks like Drizzle's `delete(table)`.
 */
function hasSingleTableArgument(node: SimpleCallExpression): boolean {
  // Drizzle table deletes take one table argument. Requiring that shape avoids
  // false positives from key-value clients such as `db.delete("store", key)`.
  if (node.arguments.length !== 1) {
    return false;
  }

  const argument = node.arguments[0];

  if (argument === undefined) {
    return false;
  }

  return !isLiteralKeyDeleteArgument(argument);
}

/**
 * Recognizes literal key-value delete arguments that are not Drizzle table objects.
 */
function isLiteralKeyDeleteArgument(argument: Expression | SpreadElement): boolean {
  return (
    (argument.type === "Literal" &&
      (typeof argument.value === "string" || typeof argument.value === "number")) ||
    argument.type === "TemplateLiteral"
  );
}

/**
 * Returns true only when the delete call is immediately followed by an invoked
 * `.where(...)` member call.
 */
function isImmediatelyScopedByWhere(node: ParentedSimpleCallExpression): boolean {
  const whereMember = node.parent;

  // A delete is scoped only by an invoked `.where(...)` directly on the builder.
  // Later chained calls after `.where(...)` stay valid because this checks the
  // delete call's immediate parent, not the end of the whole chain.
  if (
    whereMember.type !== "MemberExpression" ||
    whereMember.computed ||
    whereMember.object !== node ||
    !isIdentifier(whereMember.property) ||
    whereMember.property.name !== "where"
  ) {
    return false;
  }

  const whereCall = whereMember.parent;

  // A bare `.where` property access is not a query scope. Requiring the member
  // to be the callee of a call expression proves Drizzle receives the condition.
  return whereCall.type === "CallExpression" && whereCall.callee === whereMember;
}

/**
 * Flags Drizzle `db.delete(table)` calls that are missing an immediate `.where(...)`.
 */
export const noUnscopedDbDeleteRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow an unscoped db.delete(...) with no .where() clause",
      url: "https://github.com/ByteMeBaby/forgekit/blob/main/docs/eslint-rules/no-unscoped-db-delete.md"
    },
    schema: [],
    messages: {
      unscopedDelete:
        "`{{name}}.delete(...)` has no `.where(...)` scope, so it deletes every row in the table. Narrow it to the caller's rows, for example `.where(eq(table.orgId, orgId))`. If deleting all rows is truly intended, allow it explicitly with `// eslint-disable-next-line @forgekit/no-unscoped-db-delete -- <reason>`."
    }
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    // Package scoping removes the false-positive class from browser and app code.
    // dependency-flow guarantees only db and core can reach the Drizzle surface.
    if (!isDrizzleSurfaceFile(context.filename)) {
      return {};
    }

    return {
      CallExpression(node: ParentedSimpleCallExpression): void {
        if (!isDeleteMemberCallee(node.callee)) {
          return;
        }

        const name = getReceiverName(node.callee);

        if (name === null || !isDbHandleName(name) || !hasSingleTableArgument(node)) {
          return;
        }

        if (isImmediatelyScopedByWhere(node)) {
          return;
        }

        context.report({
          node,
          messageId: "unscopedDelete",
          data: {
            name
          }
        });
      }
    };
  }
};
