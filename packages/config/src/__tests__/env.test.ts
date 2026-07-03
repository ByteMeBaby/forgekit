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
    ).toEqual({
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
    expect(env.AUTH_SECRET).toBeUndefined();
    expect(env.AUTH_REQUIRE_EMAIL_VERIFICATION).toBeUndefined();
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
