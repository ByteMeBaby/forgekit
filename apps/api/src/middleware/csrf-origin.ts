import type { MiddlewareHandler } from "hono";

import { toErrorBody } from "../errors.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Requires trusted origins for state-changing browser requests.
 */
export function csrfOriginMiddleware(allowedOrigins: readonly string[]): MiddlewareHandler {
  const allowedOriginSet = new Set(allowedOrigins);

  return async (context, next) => {
    if (SAFE_METHODS.has(context.req.method.toUpperCase())) {
      await next();
      return;
    }

    const origin = context.req.header("Origin");

    if (origin === undefined || !allowedOriginSet.has(origin)) {
      return context.json(
        toErrorBody({
          code: "CSRF_ORIGIN_MISMATCH",
          message: "Origin is not allowed for this request."
        }),
        403
      );
    }

    await next();
  };
}
