import { afterEach, describe, expect, it, vi } from "vitest";

import { assertRequiredEnv, warnUsingMocks } from "../index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("assertRequiredEnv", () => {
  it("throws in production when a required var is absent, and names it", () => {
    expect(() =>
      assertRequiredEnv({
        vars: ["DATABASE_URL"],
        when: "production",
        source: { NODE_ENV: "production" },
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it("only warns in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      assertRequiredEnv({
        vars: ["DATABASE_URL"],
        when: "production",
        source: { NODE_ENV: "development" },
      }),
    ).not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("only warns in test", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      assertRequiredEnv({
        vars: ["DATABASE_URL"],
        when: "production",
        source: { NODE_ENV: "test" },
      }),
    ).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it("does nothing when all vars are present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      assertRequiredEnv({
        vars: ["DATABASE_URL"],
        when: "production",
        source: { NODE_ENV: "production", DATABASE_URL: "postgres://x" },
      }),
    ).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
  });

  it("treats an empty string as unset", () => {
    expect(() =>
      assertRequiredEnv({
        vars: ["DATABASE_URL"],
        when: "production",
        source: { NODE_ENV: "production", DATABASE_URL: "" },
      }),
    ).toThrow();
  });

  it('makes when: "always" fatal even in development', () => {
    expect(() =>
      assertRequiredEnv({
        vars: ["AUTH_SECRET"],
        when: "always",
        source: { NODE_ENV: "development" },
      }),
    ).toThrow();
  });

  it("names every missing var", () => {
    let message = "";

    try {
      assertRequiredEnv({
        vars: ["A", "B"],
        when: "production",
        source: { NODE_ENV: "production" },
      });
    } catch (error) {
      if (error instanceof Error) {
        message = error.message;
      }
    }

    expect(message).toMatch(/A/);
    expect(message).toMatch(/B/);
  });
});

describe("warnUsingMocks", () => {
  it("warns in production", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnUsingMocks(["RESEND_API_KEY"], { NODE_ENV: "production" });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/RESEND_API_KEY/));
  });

  it("does not warn in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnUsingMocks(["RESEND_API_KEY"], { NODE_ENV: "development" });

    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn in test", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnUsingMocks(["RESEND_API_KEY"], { NODE_ENV: "test" });

    expect(warn).not.toHaveBeenCalled();
  });

  it("is a no-op for an empty list", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnUsingMocks([], { NODE_ENV: "production" });

    expect(warn).not.toHaveBeenCalled();
  });
});
