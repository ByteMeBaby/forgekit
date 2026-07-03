// Runtime presence checks and mock warnings for the server environment.
// These are separate from the schema in env.ts: the schema validates the SHAPE of values,
// while these assert the PRESENCE of required variables and surface accidental mock fallbacks.

/** Whether a missing variable is fatal in every environment, or only in production. */
type RequiredWhen = "production" | "always";

interface AssertRequiredEnvOptions {
  /** Names of the environment variables that must be set. */
  vars: string[];
  /** `"always"` makes a missing variable fatal in every environment; `"production"` only in production, where dev and test warn and continue. */
  when: RequiredWhen;
  /** Overridable for tests; defaults to `process.env`. */
  source?: Record<string, string | undefined>;
}

const isUnset = (value: string | undefined): boolean => value === undefined || value === "";

/**
 * Asserts that named variables are set. Missing variables are fatal in production (or always,
 * when `when` is `"always"`) and otherwise only warn, so a fresh clone boots on in-memory
 * fallbacks in dev and test. An empty string counts as unset.
 */
export function assertRequiredEnv(options: AssertRequiredEnvOptions): void {
  const source = options.source ?? process.env;
  const missing = options.vars.filter((name) => isUnset(source[name]));
  if (missing.length === 0) {
    return;
  }

  const label = missing.length === 1 ? "variable" : "variables";
  const message = `Missing required environment ${label}: ${missing.join(", ")}`;
  const isProduction = source.NODE_ENV === "production";
  if (options.when === "always" || isProduction) {
    throw new Error(message);
  }

  console.warn(`[config] ${message}. Continuing on in-memory fallbacks (development and test only).`);
}

/**
 * Warns in production when a provider key is absent and the app fell back to an in-memory mock,
 * so an operator can see that real traffic is hitting a fake backend. No-op outside production.
 */
export function warnUsingMocks(names: string[], source: Record<string, string | undefined> = process.env): void {
  if (names.length === 0 || source.NODE_ENV !== "production") {
    return;
  }

  console.warn(
    `[config] Using in-memory mock(s) in production because these are unset: ${names.join(", ")}. Real traffic is hitting a fake backend.`,
  );
}
