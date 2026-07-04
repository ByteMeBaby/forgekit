import type { MiddlewareHandler } from "hono";

const STRICT_CONTENT_SECURITY_POLICY = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
const STRICT_TRANSPORT_SECURITY = "max-age=63072000; includeSubDomains; preload";

/**
 * Sets baseline browser security headers for every API response.
 */
export function securityHeadersMiddleware(nodeEnv: string): MiddlewareHandler {
  return async (context, next) => {
    context.header("X-Content-Type-Options", "nosniff");
    context.header("X-Frame-Options", "DENY");
    context.header("Referrer-Policy", "no-referrer");

    if (nodeEnv !== "development") {
      context.header("Strict-Transport-Security", STRICT_TRANSPORT_SECURITY);
      context.header("Content-Security-Policy", STRICT_CONTENT_SECURITY_POLICY);
    }

    await next();
  };
}
