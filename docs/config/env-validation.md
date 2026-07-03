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

## Integer Flags

Numeric environment variables are validated as strict digit strings and then coerced to numbers. This keeps a typo such as `1o` from coercing to `NaN`.

## URL Fields

`AUTH_URL` and `AUTH_API_URL` are validated as URLs.

## Defaults

`NODE_ENV` defaults to `"development"` when unset.

`APP_SHAPE` defaults to `"personal_and_org"` when unset.

`EMAIL_BOUNCE_SUPPRESSION_THRESHOLD` defaults to `5` when unset.

`STORAGE_PROVIDER` defaults to `"local"` when unset.

`AUDIT_ARCHIVE_STORE` defaults to `"filesystem"` when unset.

`STEP_UP_ENFORCEMENT` defaults to `"enforce"` when unset.

`ADMIN_BASE_PATH` defaults to `"/admin"` when unset.

## Variables

All variables not marked with a default are optional.

### Runtime

- `NODE_ENV`: default `"development"`
- `PORT`

### Tenancy

- `APP_SHAPE`: default `"personal_and_org"`

### Database

- `DATABASE_URL`
- `APP_DATABASE_URL`
- `OPERATOR_DATABASE_URL`

### Auth

- `AUTH_SECRET`
- `AUTH_URL`
- `AUTH_API_URL`
- `AUTH_REQUIRE_EMAIL_VERIFICATION`
- `AUTH_HIBP_ENABLED`
- `AUTH_IP_MAX_FAILED_ATTEMPTS`
- `AUTH_IP_LOCKOUT_DURATION_SECONDS`
- `TRUSTED_PROXY_DEPTH`

### OAuth

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Email

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `RESEND_WEBHOOK_SECRET`
- `EMAIL_BOUNCE_SUPPRESSION_THRESHOLD`: default `5`

### Storage

- `STORAGE_PROVIDER`: default `"local"`
- `LOCAL_STORAGE_DIR`
- `LOCAL_STORAGE_PUBLIC_URL_PREFIX`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_FORCE_PATH_STYLE`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_PUBLIC_BASE_URL`

### Billing

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_FREE_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_ENTERPRISE_PRICE_ID`

### Audit

- `AUDIT_LOG_RETENTION_DAYS`
- `AUDIT_ARCHIVE_STORE`: default `"filesystem"`
- `AUDIT_ARCHIVE_DIR`

### Security

- `STEP_UP_ENFORCEMENT`: default `"enforce"`
- `TURNSTILE_SECRET_KEY`

### Observability

- `SENTRY_DSN`

### Admin

- `ADMIN_EMAILS`
- `ADMIN_BASE_PATH`: default `"/admin"`
