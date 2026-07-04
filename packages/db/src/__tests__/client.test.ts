import { describe, expect, it } from "vitest";

import { createDb } from "../index.js";

describe("createDb", () => {
  it("creates a lazy database handle without connecting", async () => {
    const handle = createDb("postgres://forgekit_app:secret@localhost:5432/forgekit");

    expect(handle.db).toBeDefined();
    expect(handle.pool).toBeDefined();
    expect(handle.close).toEqual(expect.any(Function));

    await expect(handle.close()).resolves.toBeUndefined();
  });
});
