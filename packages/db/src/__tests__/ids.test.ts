import { describe, expect, it } from "vitest";

import { uuidv7 } from "../index.js";

describe("uuidv7", () => {
  it("generates UUIDv7 values", () => {
    expect(uuidv7()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("generates monotonic unique values", () => {
    const ids = Array.from({ length: 1_000 }, () => uuidv7());
    const sorted = [...ids].sort();

    expect(ids).toEqual(sorted);
    expect(new Set(ids).size).toBe(1_000);
  });
});
