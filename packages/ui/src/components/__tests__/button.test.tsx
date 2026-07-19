// Verifies Button semantics, composition, and variant class output.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../button.js";

describe("Button", () => {
  it("renders a native button and prevents interaction when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    );

    const button = screen.getByRole("button", { name: "Save" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a slotted anchor when asChild is enabled", () => {
    render(
      <Button asChild>
        <a href="/settings">Settings</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Settings" });

    expect(link).toHaveAttribute("href", "/settings");
    expect(link).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("merges a custom class and applies the selected variant and size", () => {
    render(
      <Button className="tracking-wide" size="lg" variant="destructive">
        Delete
      </Button>
    );

    const button = screen.getByRole("button", { name: "Delete" });

    expect(button).toHaveClass("tracking-wide", "bg-destructive", "text-white", "h-10", "px-6");
  });

  it("passes a ref prop to its native button", () => {
    let receivedElement: HTMLButtonElement | null = null;
    const ref = (element: HTMLButtonElement | null): void => {
      receivedElement = element;
    };

    render(<Button ref={ref}>Ref target</Button>);

    expect(receivedElement).toBe(screen.getByRole("button", { name: "Ref target" }));
  });
});
