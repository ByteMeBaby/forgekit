import { describe, expect, it } from "vitest";

import { CORE_VERSION } from "../index.js";

describe("CORE_VERSION", () => {
  it("threads the db package version", () => {
    expect(CORE_VERSION).toBe("core:db:0.0.0");
  });
});
