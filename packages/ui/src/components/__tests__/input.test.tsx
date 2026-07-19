// Verifies Input preserves native textbox behavior and attributes.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "../input.js";

describe("Input", () => {
  it("renders a disabled textbox and forwards its type", () => {
    render(<Input aria-label="Work email" disabled type="email" />);

    const input = screen.getByRole("textbox", { name: "Work email" });

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("type", "email");
  });
});
