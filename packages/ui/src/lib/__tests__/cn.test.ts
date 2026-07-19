// Verifies class-name composition and Tailwind conflict resolution.

import { describe, expect, it } from "vitest";

import { cn } from "../cn.js";

describe("cn", () => {
  it("drops falsy values and joins truthy class names", () => {
    expect(cn("flex", false, null, undefined, 0, "items-center")).toBe("flex items-center");
  });

  it("keeps the later conflicting Tailwind utility", () => {
    const useLargeText = true;

    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", useLargeText && "text-lg")).toBe("text-lg");
  });

  it("accepts clsx array and object forms", () => {
    expect(cn(["flex", ["items-center"]], { "justify-between": true, hidden: false })).toBe(
      "flex items-center justify-between"
    );
  });
});
