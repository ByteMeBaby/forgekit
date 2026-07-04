import { describe, expect, it } from "vitest";

import { APP_ROLE, deriveRoleUrl, resolveDatabaseUrls } from "../index.js";

describe("database role URLs", () => {
  it("swaps the username while keeping the rest of the URL", () => {
    expect(deriveRoleUrl("postgres://forgekit_owner:secret@localhost:5432/forgekit", APP_ROLE)).toBe(
      "postgres://forgekit_app:secret@localhost:5432/forgekit",
    );
  });

  it("derives app and operator URLs from DATABASE_URL", () => {
    expect(
      resolveDatabaseUrls({
        DATABASE_URL: "postgres://forgekit_owner:secret@localhost:5432/forgekit",
      }),
    ).toEqual({
      app: "postgres://forgekit_app:secret@localhost:5432/forgekit",
      operator: "postgres://forgekit_operator:secret@localhost:5432/forgekit",
    });
  });

  it("returns null URLs when no database is configured", () => {
    expect(resolveDatabaseUrls({})).toEqual({ app: null, operator: null });
  });

  it("prefers an explicit app URL while deriving the operator URL", () => {
    expect(
      resolveDatabaseUrls({
        DATABASE_URL: "postgres://forgekit_owner@localhost/forgekit",
        APP_DATABASE_URL: "postgres://custom_app@dbhost/forgekit",
      }),
    ).toEqual({
      app: "postgres://custom_app@dbhost/forgekit",
      operator: "postgres://forgekit_operator@localhost/forgekit",
    });
  });
});
