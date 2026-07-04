import type { MiddlewareHandler } from "hono";

type LogRecord = {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  requestId: string | undefined;
};

function writeDevelopmentLog(record: LogRecord): void {
  const requestId = record.requestId === undefined ? "" : ` request_id=${record.requestId}`;

  console.info(`${record.method} ${record.path} ${record.status} ${record.durationMs}ms${requestId}`);
}

function writeProductionLog(record: LogRecord): void {
  console.info(
    JSON.stringify({
      level: "info",
      event: "http_request",
      method: record.method,
      path: record.path,
      status: record.status,
      durationMs: record.durationMs,
      requestId: record.requestId
    })
  );
}

/**
 * Logs one structured request line unless the test environment is active.
 */
export function loggerMiddleware(nodeEnv: string): MiddlewareHandler {
  return async (context, next) => {
    const startedAt = Date.now();

    try {
      await next();
    } finally {
      if (nodeEnv !== "test") {
        const record: LogRecord = {
          method: context.req.method,
          path: context.req.path,
          status: context.res.status,
          durationMs: Date.now() - startedAt,
          requestId: context.get("requestId")
        };

        if (nodeEnv === "production") {
          writeProductionLog(record);
        } else {
          writeDevelopmentLog(record);
        }
      }
    }
  };
}
