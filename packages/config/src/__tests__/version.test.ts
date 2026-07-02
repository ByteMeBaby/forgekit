import { describe, expect, it } from "vitest";

import { FORGEKIT_VERSION } from "../index.js";

describe("FORGEKIT_VERSION", () => {
  it("exposes the package version", () => {
    expect(FORGEKIT_VERSION).toBe("0.0.0");
  });
});
