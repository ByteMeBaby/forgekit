// This module is the single source of truth for validating the server environment at boot.
import { z } from "zod";

// WHY: Literal flags close the silent-coercion failure mode, so a typo like `ture` throws instead of reading as off.
const booleanFlag = z.enum(["true", "false"]).transform((value) => value === "true");

// WHY: Numeric env values arrive as strings; a strict digit check keeps a typo like `1o` from coercing to NaN.
const integerString = z
  .string()
  .regex(/^\d+$/, "must be a whole number")
  .transform((value) => Number(value));

const envSchema = z.object({
  // Runtime
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: integerString.optional(),

  // Tenancy
  APP_SHAPE: z.enum(["personal", "personal_and_org", "org"]).default("personal_and_org"),

  // Database (the app and operator URLs derive from DATABASE_URL by role swap when unset)
  DATABASE_URL: z.string().optional(),
  APP_DATABASE_URL: z.string().optional(),
  OPERATOR_DATABASE_URL: z.string().optional(),

  // Auth
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_URL: z.url().optional(),
  AUTH_API_URL: z.url().optional(),
  AUTH_REQUIRE_EMAIL_VERIFICATION: booleanFlag.optional(),
  AUTH_HIBP_ENABLED: booleanFlag.optional(),
  AUTH_IP_MAX_FAILED_ATTEMPTS: integerString.optional(),
  AUTH_IP_LOCKOUT_DURATION_SECONDS: integerString.optional(),
  TRUSTED_PROXY_DEPTH: integerString.optional(),

  // OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_BOUNCE_SUPPRESSION_THRESHOLD: integerString.default(5),

  // Storage
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  LOCAL_STORAGE_DIR: z.string().optional(),
  LOCAL_STORAGE_PUBLIC_URL_PREFIX: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_FORCE_PATH_STYLE: booleanFlag.optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),

  // Billing
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_FREE_PRICE_ID: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().optional(),

  // Audit
  AUDIT_LOG_RETENTION_DAYS: integerString.optional(),
  AUDIT_ARCHIVE_STORE: z.enum(["filesystem", "null"]).default("filesystem"),
  AUDIT_ARCHIVE_DIR: z.string().optional(),

  // Security
  STEP_UP_ENFORCEMENT: z.enum(["enforce", "prefer"]).default("enforce"),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Observability
  SENTRY_DSN: z.string().optional(),

  // Admin
  ADMIN_EMAILS: z.string().optional(),
  ADMIN_BASE_PATH: z.string().default("/admin"),
});

/** Parsed server environment after defaults and strict coercions have been applied. */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates the shape of every recognized variable and throws a single error
 * listing every invalid field.
 */
export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return result.data;
}
