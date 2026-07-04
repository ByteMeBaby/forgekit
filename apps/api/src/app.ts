import { Hono } from "hono";

import { API_VERSION } from "./version.js";
import { AppError, toErrorBody } from "./errors.js";
import { cacheControlMiddleware } from "./middleware/cache-control.js";
import { csrfOriginMiddleware } from "./middleware/csrf-origin.js";
import { loggerMiddleware } from "./middleware/logger.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { securityHeadersMiddleware } from "./middleware/security-headers.js";

import type { ContentfulStatusCode } from "hono/utils/http-status";

type ApiEnv = {
  Variables: {
    requestId: string;
  };
};

export type CreateAppOptions = {
  allowedOrigins?: string[];
  nodeEnv?: string;
};

function responseStatus(status: number): ContentfulStatusCode {
  return status as ContentfulStatusCode;
}

/**
 * Creates the configured Hono API app.
 */
export function createApp(options: CreateAppOptions = {}): Hono<ApiEnv> {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const allowedOrigins = options.allowedOrigins ?? ["http://localhost:3000"];
  const app = new Hono<ApiEnv>();

  app.use("*", requestIdMiddleware);
  app.use("*", loggerMiddleware(nodeEnv));
  app.use("*", securityHeadersMiddleware(nodeEnv));
  app.use("*", cacheControlMiddleware);
  app.use("*", csrfOriginMiddleware(allowedOrigins));

  app.get("/", (context) =>
    context.json({
      name: "forgekit-api",
      version: API_VERSION
    })
  );

  app.get("/health", (context) =>
    context.json({
      status: "ok",
      timestamp: new Date().toISOString()
    })
  );

  app.notFound((context) =>
    context.json(
      toErrorBody({
        code: "NOT_FOUND",
        message: "Resource not found."
      }),
      404
    )
  );

  app.onError((error, context) => {
    if (error instanceof AppError) {
      return context.json(toErrorBody(error), responseStatus(error.status));
    }

    return context.json(
      toErrorBody({
        code: "INTERNAL",
        message: "Internal server error."
      }),
      500
    );
  });

  return app;
}
