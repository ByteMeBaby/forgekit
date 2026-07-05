import { describe, expect, it } from "vitest";

import { toErrorBody } from "../errors.js";

describe("toErrorBody", () => {
  it("omits details when absent", () => {
    expect(
      toErrorBody({
        code: "NOT_FOUND",
        message: "Resource not found."
      })
    ).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found."
      }
    });
  });

  it("includes details when present", () => {
    expect(
      toErrorBody({
        code: "INVALID_INPUT",
        message: "Invalid input.",
        details: {
          field: "name"
        }
      })
    ).toEqual({
      error: {
        code: "INVALID_INPUT",
        message: "Invalid input.",
        details: {
          field: "name"
        }
      }
    });
  });
});
