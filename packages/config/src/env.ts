// This module is the single source of truth for validating the server environment at boot.
import { z } from "zod";

// WHY: Literal flags close the silent-coercion failure mode, so a typo like `ture` throws instead of reading as off.
const booleanFlag = z.enum(["true", "false"]).transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_SHAPE: z.enum(["personal", "personal_and_org", "org"]).default("personal_and_org"),
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_REQUIRE_EMAIL_VERIFICATION: booleanFlag.optional(),
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
