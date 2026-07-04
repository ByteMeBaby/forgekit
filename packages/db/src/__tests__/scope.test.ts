import { describe, expect, it } from "vitest";

import { getScopedDb, type ScopedDb, withScopedDb } from "../index.js";

describe("scoped database handle", () => {
  it("returns the fallback outside a scope", () => {
    const fallback = {} as ScopedDb;

    expect(getScopedDb(fallback)).toBe(fallback);
  });

  it("returns the bound handle inside a scope", () => {
    const fallback = {} as ScopedDb;
    const store = { scoped: true } as unknown as ScopedDb;

    const scoped = withScopedDb(store, () => getScopedDb(fallback));

    expect(scoped).toBe(store);
  });
});
