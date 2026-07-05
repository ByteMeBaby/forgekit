# API Skeleton and Error Shape

The API package exposes a small Hono app for Node. It gives the backend a stable request surface before feature routes are added:

```ts
import { createApp } from "../../apps/api/src/app.js";

const app = createApp({
  allowedOrigins: ["http://localhost:3000"],
  nodeEnv: "development"
});
```

Tests call `app.request(...)` directly, so route behavior does not require a live server.

## Errors

Every API error uses this JSON shape:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found."
  }
}
```

When a caller can use extra detail safely, the body can include `details`:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid input.",
    "details": {
      "field": "name"
    }
  }
}
```

`AppError` is the application-facing error type. Throw it when code already knows the public error code, HTTP status, message, and optional details:

```ts
throw new AppError("FORBIDDEN", 403, "You cannot access this resource.");
```

The global error handler maps `AppError` to its status and canonical body. Unknown errors return `500` with `INTERNAL` and never expose the thrown message.

## Routes

`GET /` identifies the service:

```json
{
  "name": "forgekit-api",
  "version": "api:core:db:0.0.0"
}
```

`GET /health` returns a lightweight liveness payload:

```json
{
  "status": "ok",
  "timestamp": "2026-07-04T12:00:00.000Z"
}
```

Unknown paths return `404` with `NOT_FOUND`.

## Middleware Stack

Middleware runs in this order:

1. Request id. Reads `x-request-id` or creates a new UUID, stores it on the Hono context, and returns it in the `x-request-id` response header.
2. Logger. Writes a JSON request line in production, a concise readable line in development, and stays silent in tests.
3. Security headers. Sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer` on every response. Outside development it also sets `Strict-Transport-Security` and a strict `Content-Security-Policy`.
4. Cache control. Sets `Cache-Control: no-store` because API responses should not be cached by default.
5. CSRF origin check. For `POST`, `PUT`, `PATCH`, and `DELETE`, the request must include an `Origin` header that matches the configured `allowedOrigins`. Missing or untrusted origins return `403` with `CSRF_ORIGIN_MISMATCH`. Safe methods pass through.

The Origin check is intentionally simple. It blocks browser state-changing requests that come from untrusted origins while still letting non-state-changing reads through.

## Server Entry

`apps/api/src/index.ts` starts the Node server with `@hono/node-server`. It reads:

- `PORT`, defaulting to `3001`
- `WEB_ORIGINS`, as a comma-separated list, defaulting to `http://localhost:3000`
- `NODE_ENV`, defaulting to `development`

Boot-time env validation is deferred until core re-exports the config schema and the API has real env to validate. For now the server entry reads `PORT` directly and keeps the defaults local to the API package.

## References

- [Hono documentation](https://hono.dev/docs/)
- [MDN: X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)
- [MDN: X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
- [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
- [MDN: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
