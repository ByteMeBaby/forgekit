import { randomUUID } from "node:crypto";

import type { MiddlewareHandler } from "hono";

declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
  }
}

/**
 * Adds a stable request id to context and mirrors it on the response.
 */
export const requestIdMiddleware: MiddlewareHandler = async (context, next) => {
  const requestId = context.req.header("x-request-id") ?? randomUUID();

  context.set("requestId", requestId);
  context.header("x-request-id", requestId);

  await next();

  context.header("x-request-id", requestId);
};
