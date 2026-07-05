/**
 * Canonical error response sent over the API wire.
 */
export type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Application error with an API-safe code, HTTP status, message, and optional details.
 */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, status: number, message: string, details?: unknown) {
    super(message);

    this.name = "AppError";
    this.code = code;
    this.status = status;

    if (details !== undefined) {
      this.details = details;
    }
  }
}

/**
 * Converts an application error object into the canonical API error body.
 */
export function toErrorBody(error: AppError | { code: string; message: string; details?: unknown }): ErrorBody {
  const body: ErrorBody = {
    error: {
      code: error.code,
      message: error.message
    }
  };

  if (error.details !== undefined) {
    body.error.details = error.details;
  }

  return body;
}
