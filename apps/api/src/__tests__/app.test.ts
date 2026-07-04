import { describe, expect, it } from "vitest";

import { createApp } from "../app.js";
import { AppError } from "../errors.js";
import { API_VERSION } from "../version.js";

describe("createApp", () => {
  it("returns health status with a timestamp", async () => {
    const app = createApp({ nodeEnv: "test" });
    const response = await app.request("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      timestamp: expect.any(String)
    });
  });

  it("returns the API identity payload", async () => {
    const app = createApp({ nodeEnv: "test" });
    const response = await app.request("/");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      name: "forgekit-api",
      version: API_VERSION
    });
  });

  it("returns a structured 404 for unknown paths", async () => {
    const app = createApp({ nodeEnv: "test" });
    const response = await app.request("/missing");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found."
      }
    });
  });

  it("maps AppError to its status and structured body", async () => {
    const app = createApp({ nodeEnv: "test" });

    app.get("/__throw", (): never => {
      throw new AppError("TEAPOT", 418, "Short and stout.");
    });

    const response = await app.request("/__throw");

    expect(response.status).toBe(418);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "TEAPOT",
        message: "Short and stout."
      }
    });
  });

  it("maps non-AppError failures to internal errors without leaking the raw message", async () => {
    const app = createApp({ nodeEnv: "test" });

    app.get("/__throw", (): never => {
      throw new Error("sensitive original failure");
    });

    const response = await app.request("/__throw");
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: {
        code: "INTERNAL",
        message: "Internal server error."
      }
    });
    expect(JSON.stringify(body)).not.toContain("sensitive original failure");
  });

  it("blocks state-changing requests without an origin", async () => {
    const app = createApp({ nodeEnv: "test", allowedOrigins: ["https://app.example.test"] });
    const response = await app.request("/", {
      method: "POST"
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "CSRF_ORIGIN_MISMATCH"
      }
    });
  });

  it("blocks state-changing requests from disallowed origins", async () => {
    const app = createApp({ nodeEnv: "test", allowedOrigins: ["https://app.example.test"] });
    const response = await app.request("/", {
      method: "POST",
      headers: {
        Origin: "https://bad.example.test"
      }
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "CSRF_ORIGIN_MISMATCH"
      }
    });
  });

  it("allows state-changing requests from allowed origins through the CSRF check", async () => {
    const app = createApp({ nodeEnv: "test", allowedOrigins: ["https://app.example.test"] });
    const response = await app.request("/", {
      method: "POST",
      headers: {
        Origin: "https://app.example.test"
      }
    });

    expect(response.status).not.toBe(403);
    expect(response.status).toBe(404);
  });

  it("sets default security headers", async () => {
    const app = createApp({ nodeEnv: "test" });
    const response = await app.request("/health");

    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets production security headers", async () => {
    const app = createApp({ nodeEnv: "production" });
    const response = await app.request("/health");

    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Strict-Transport-Security")).not.toBeNull();
  });
});
