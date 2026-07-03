# Config Env Validation

## Why

ForgeKit validates recognized server environment variables at boot so invalid configuration fails before the application starts serving traffic. This keeps missing, misspelled, or malformed values from drifting into runtime paths where the failure is harder to connect to configuration.

The validation checks the shape of known inputs, applies documented defaults, and returns a typed object for application code to consume.

## `parseEnv`

`parseEnv` is exported from `@forgekit/config`. It accepts a source object shaped like `Record<string, string | undefined>`, defaults to `process.env`, and returns the parsed `Env` object.

When validation fails, `parseEnv` throws one aggregated error. The message names every invalid recognized field, so a single boot failure can show all configuration issues that need to be fixed.

## Boolean Flags

Boolean environment flags must use the literal string union `"true" | "false"`. The parser converts those strings to real booleans after validation.

This rule rejects typos such as `ture` instead of silently treating them as off. Silent coercion is dangerous for feature gates and security-sensitive settings because a malformed value can look like an intentional false value.

## Defaults

`NODE_ENV` defaults to `"development"` when unset.

`APP_SHAPE` defaults to `"personal_and_org"` when unset.

## Presence checks

Presence checks are separate from shape validation on purpose. The schema, through `parseEnv`, validates the SHAPE of recognized values. `assertRequiredEnv` validates the PRESENCE of the handful of variables that are truly required at runtime. They fail for different reasons and stay separate so callers can decide which variables must exist for a given environment.

`assertRequiredEnv({ vars, when })` checks that each named variable is set. With `when: "production"`, missing variables throw in production and only warn in dev and test so a fresh clone boots on in-memory fallbacks. With `when: "always"`, missing variables are fatal in every environment. An empty string counts as unset.

`warnUsingMocks(names)` warns in production when a provider key is absent and the app fell back to an in-memory mock, so an operator sees that real traffic is hitting a fake backend. It is a no-op outside production.

## Scope

This slice covers a representative subset of environment variables:

- `NODE_ENV`
- `APP_SHAPE`
- `AUTH_SECRET`
- `AUTH_REQUIRE_EMAIL_VERIFICATION`

The full variable catalog is added in the next slice.
