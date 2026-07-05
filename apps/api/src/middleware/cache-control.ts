import type { MiddlewareHandler } from "hono";

/**
 * Prevents browser and intermediary caching for API responses by default.
 */
export const cacheControlMiddleware: MiddlewareHandler = async (context, next) => {
  context.header("Cache-Control", "no-store");

  await next();
};
