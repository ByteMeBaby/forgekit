# Database and the three-role pool

## Why this exists

A ForgeKit app is multi-tenant: many organizations share the same tables, and every row carries an `org_id`. The hard rule is that one organization must never see another's rows.

You could try to enforce that in application code, by adding `WHERE org_id = :currentOrg` to every query. The trouble is that a single forgotten `WHERE` leaks another tenant's data. ForgeKit instead pushes the guarantee down into Postgres, so the database refuses to hand back the wrong rows even when the application code has a bug.

The mechanism is three separate Postgres logins, called roles, each with a different level of power.

## The three roles

Think of them by who connects as each one and what it is allowed to see.

**`forgekit_app` — normal user traffic.**
When a signed-in user loads their dashboard, the request connects to Postgres as `forgekit_app`. This role is deliberately weak: it is not a superuser and does not have [`BYPASSRLS`](https://www.postgresql.org/docs/current/sql-createrole.html), so [Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) (RLS) policies apply to it. Those policies scope every query to the current organization automatically. Once they are in place, a handler that forgets its `WHERE org_id = ...` still gets back only the current org's rows, because Postgres itself filters them. This is the role that turns tenant isolation from a coding convention into a database guarantee.

**`forgekit_operator` — admin and background jobs.**
Some work legitimately spans every tenant: an admin console that lists all organizations, or a nightly job that cleans up expired sessions across the whole system. That work connects as `forgekit_operator`, which has `BYPASSRLS`, so the per-org policies do not apply and it can read across tenants on purpose. It is used only for these cross-tenant surfaces, never for ordinary user requests.

**`forgekit_owner` — schema changes.**
This role owns the tables and runs migrations (creating tables, adding columns). The migration tooling uses it; it is not used while serving traffic.

## Connection URLs

Each role logs into Postgres with its own username, carried in a connection URL:

```
postgres://forgekit_app:secret@localhost:5432/forgekit
          └──────────┘ the username is the role
```

In development you set a single `DATABASE_URL` (as the owner), and the code works out the app and operator logins by swapping the username. That is what "resolving" the URLs means:

```ts
resolveDatabaseUrls({
  DATABASE_URL: "postgres://forgekit_owner:secret@localhost:5432/forgekit",
});
// {
//   app:      "postgres://forgekit_app:secret@localhost:5432/forgekit",
//   operator: "postgres://forgekit_operator:secret@localhost:5432/forgekit",
// }
```

`deriveRoleUrl` is the single-swap building block behind that:

```ts
deriveRoleUrl("postgres://forgekit_owner:secret@localhost:5432/forgekit", "forgekit_app");
// "postgres://forgekit_app:secret@localhost:5432/forgekit"
```

In production you do not rely on the swap: you set `APP_DATABASE_URL` and `OPERATOR_DATABASE_URL` explicitly, each with its own password, and those always win over derivation. If no `DATABASE_URL` is set at all, both resolve to `null`, so a fresh clone boots with no database on in-memory fallbacks.

## Client handle

`createDb(url)` returns three things: the Drizzle query interface (`db`), the underlying `pg` connection pool (a set of reusable connections to Postgres), and a `close` function that drains the pool.

```ts
const { db, close } = createDb(appUrl);
// ... run queries through db ...
await close();
```

Building the handle does not connect to Postgres. The pool opens a real connection only when the first query runs, not when the handle is created (this is what "lazily" means). That is why constructing it is safe even with no database running, and why application code should build a handle only once a real database URL has been resolved.

## IDs

`uuidv7()` generates the text primary key for every row:

```ts
uuidv7(); // e.g. "018f9a4c-7b2e-7c3d-8e4f-1a2b3c4d5e6f"
```

A [UUIDv7](https://www.rfc-editor.org/rfc/rfc9562.html#section-5.7) puts a timestamp at the front of the id, so newly created ids sort by creation time and land near the end of a B-tree index instead of scattering across it. That keeps index inserts fast while still giving globally unique ids the application can generate on its own, with no database round trip.

Table definitions and the migrations that create them live with the features that own them.

## Local database and migrations

Start the development database with [Docker Compose](https://docs.docker.com/compose/):

```sh
docker compose up -d db
```

The local service listens on host port `5433` because port `5432` may already be used by another Postgres. It uses trust auth so the derived per-role development logins can connect without passwords. This is for development only and must never be used in production.

Use this URL for the Compose database:

```sh
DATABASE_URL=postgres://postgres@localhost:5433/forgekit
```

The `@forgekit/db` package owns the migration lifecycle scripts:

```sh
pnpm --filter @forgekit/db run db:generate
pnpm --filter @forgekit/db run db:migrate
pnpm --filter @forgekit/db run db:reset
pnpm --filter @forgekit/db run db:test-reset
```

`db:generate` asks drizzle-kit to create migration files from schema changes. `db:migrate` applies pending migrations using `DATABASE_URL`. `db:reset` reads `DATABASE_URL`, connects to the `postgres` maintenance database, drops and recreates the target database, then runs migrations and the seed step. `db:test-reset` uses the same reset script for whichever test database is named by `DATABASE_URL`.

The first migration creates `forgekit_owner`, `forgekit_app`, and `forgekit_operator` with [`CREATE ROLE`](https://www.postgresql.org/docs/current/sql-createrole.html). It is idempotent because Postgres roles are cluster-global and survive a database drop.

The role integration tests are gated. They are skipped unless `DATABASE_URL` is set, so a fresh clone can run `pnpm test` without a local database.

## References

- [Postgres: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) - how RLS filters rows per policy.
- [Postgres: CREATE ROLE](https://www.postgresql.org/docs/current/sql-createrole.html) - the role attributes, including `BYPASSRLS` and `SUPERUSER`.
- [Docker Compose](https://docs.docker.com/compose/) - running the local development database service.
- [RFC 9562, Section 5.7: UUID Version 7](https://www.rfc-editor.org/rfc/rfc9562.html#section-5.7) - the UUIDv7 spec.
- [Drizzle ORM](https://orm.drizzle.team/docs/overview) - the query builder `createDb` returns.
- [node-postgres: Pooling](https://node-postgres.com/features/pooling) - the `pg` connection pool.
