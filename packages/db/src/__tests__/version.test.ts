import { describe, expect, it } from "vitest";

import { DB_VERSION } from "../index.js";

describe("DB_VERSION", () => {
  it("threads the config package version", () => {
    expect(DB_VERSION).toBe("db:0.0.0");
  });
});
