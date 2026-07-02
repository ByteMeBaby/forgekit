# No Unscoped DB Delete ESLint Rule

`no-unscoped-db-delete` is a custom ESLint rule in `@forgekit/eslint-plugin` that fails the build on an unscoped Drizzle delete.

## Why

In Drizzle, `db.delete(table)` deletes every row in the table unless the delete builder is narrowed with `.where(...)`.

That is dangerous in production code and in tests. A missed scope can remove another organization's rows, erase shared test state, or make test isolation depend on execution order. The rule makes scoped deletes a build-enforced habit instead of a convention.

## How it works

The rule is published from `@forgekit/eslint-plugin` under the rule name `no-unscoped-db-delete`.

For each linted file in the Drizzle surface, it looks for a non-computed `.delete(...)` call where the receiver is named `db`, named `tx`, or ends with `Db` or `DB`. It then requires exactly one argument, and ignores string, number, and template literal arguments so key-value clients such as `db.delete("store", key)` do not get reported.

A delete is treated as scoped only when the `delete(table)` call is immediately followed by an invoked `.where(...)`:

```ts
db.delete(users).where(eq(users.orgId, orgId));
```

Further chaining after the `where(...)` call is allowed:

```ts
await db.delete(users).where(eq(users.orgId, orgId)).returning();
```

## Where it applies

The rule runs only inside `packages/db` and `packages/core`.

That scope is intentional. The `dependency-flow` rule guarantees that no other runtime package imports the Drizzle handle from `@forgekit/db`, so app and browser code can safely use names like `db` for IndexedDB, caches, or other clients without this rule guessing wrong.

## When it fires

This delete from `packages/db` or `packages/core` is forbidden:

```ts
await db.delete(users);
```

The rule reports that the delete has no `.where(...)` scope and should be narrowed to the caller's rows.

## Fixing a violation

Scope the delete to the caller or tenant boundary:

```ts
await db.delete(users).where(eq(users.orgId, orgId));
```

If deleting every row is truly intended, put that operation behind an explicit lint disable with a reason:

```ts
// eslint-disable-next-line @forgekit/no-unscoped-db-delete -- required test cleanup for a disposable database
await db.delete(users);
```

A legitimate delete-all belongs behind that explicit comment so reviewers can see the intent at the call site.

## Known gaps

- A split or `$dynamic()` builder where `.where(...)` is applied on a later statement is reported. Use the inline disable with a reason for that deliberate shape.
- Computed access such as `db["delete"](users)` is ignored.
- Raw SQL deletes such as ``db.execute(sql`DELETE FROM users`)`` are ignored.
- `.where(undefined)` is treated as scoped because this rule checks syntax, not runtime values.

A future stronger version could be type-aware by checking whether the receiver's type resolves to `drizzle-orm` if a real miss ever appears.
