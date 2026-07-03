import { describe, expect, it } from "vitest";

import { parseEnv } from "../index.js";

describe("parseEnv", () => {
  it("rejects malformed known boolean flags", () => {
    expect(() => parseEnv({ AUTH_REQUIRE_EMAIL_VERIFICATION: "ture" })).toThrow(
      /AUTH_REQUIRE_EMAIL_VERIFICATION/,
    );
  });

  it("returns typed values with coercions applied for a fully valid env", () => {
    expect(
      parseEnv({
        NODE_ENV: "test",
        APP_SHAPE: "org",
        AUTH_SECRET: "a".repeat(32),
        AUTH_REQUIRE_EMAIL_VERIFICATION: "true",
      }),
    ).toMatchObject({
      NODE_ENV: "test",
      APP_SHAPE: "org",
      AUTH_SECRET: "a".repeat(32),
      AUTH_REQUIRE_EMAIL_VERIFICATION: true,
    });
  });

  it("rejects short AUTH_SECRET values", () => {
    expect(() => parseEnv({ AUTH_SECRET: "short" })).toThrow(/AUTH_SECRET/);
  });

  it("applies NODE_ENV and APP_SHAPE defaults when unset", () => {
    const env = parseEnv({});

    expect(env.NODE_ENV).toBe("development");
    expect(env.APP_SHAPE).toBe("personal_and_org");
    expect(env.EMAIL_BOUNCE_SUPPRESSION_THRESHOLD).toBe(5);
    expect(env.STORAGE_PROVIDER).toBe("local");
    expect(env.AUDIT_ARCHIVE_STORE).toBe("filesystem");
    expect(env.STEP_UP_ENFORCEMENT).toBe("enforce");
    expect(env.ADMIN_BASE_PATH).toBe("/admin");
    expect(env.AUTH_SECRET).toBeUndefined();
    expect(env.AUTH_REQUIRE_EMAIL_VERIFICATION).toBeUndefined();
  });

  it("coerces integer strings to numbers", () => {
    const port = parseEnv({ PORT: "3000" }).PORT;

    expect(typeof port).toBe("number");
    expect(port).toBe(3000);
  });

  it("names invalid integer fields", () => {
    expect(() => parseEnv({ PORT: "3o00" })).toThrow(/PORT/);
  });

  it("coerces provided email bounce suppression threshold values", () => {
    expect(parseEnv({ EMAIL_BOUNCE_SUPPRESSION_THRESHOLD: "9" }).EMAIL_BOUNCE_SUPPRESSION_THRESHOLD).toBe(
      9,
    );
  });

  it("coerces AUTH_HIBP_ENABLED boolean flags", () => {
    expect(parseEnv({ AUTH_HIBP_ENABLED: "false" }).AUTH_HIBP_ENABLED).toBe(false);
    expect(parseEnv({ AUTH_HIBP_ENABLED: "true" }).AUTH_HIBP_ENABLED).toBe(true);
  });

  it("validates AUTH_URL as a URL", () => {
    expect(() => parseEnv({ AUTH_URL: "not a url" })).toThrow(/AUTH_URL/);
    expect(parseEnv({ AUTH_URL: "https://example.com" }).AUTH_URL).toBe("https://example.com");
  });

  it("rejects invalid enum values", () => {
    expect(() => parseEnv({ STORAGE_PROVIDER: "gcs" })).toThrow(/STORAGE_PROVIDER/);
  });

  it("strips unknown variables", () => {
    expect(parseEnv({ TOTALLY_UNKNOWN: "x" })).not.toHaveProperty("TOTALLY_UNKNOWN");
  });

  it("rejects invalid APP_SHAPE values", () => {
    expect(() => parseEnv({ APP_SHAPE: "nope" })).toThrow(/APP_SHAPE/);
  });

  it("names every invalid field in one error", () => {
    let message = "";

    try {
      parseEnv({ AUTH_SECRET: "short", APP_SHAPE: "nope" });
    } catch (error) {
      if (error instanceof Error) {
        message = error.message;
      }
    }

    expect(message).toMatch(/AUTH_SECRET/);
    expect(message).toMatch(/APP_SHAPE/);
  });
});
