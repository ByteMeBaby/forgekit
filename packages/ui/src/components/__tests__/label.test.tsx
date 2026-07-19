// Verifies Label associates its text with a native form control.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "../input.js";
import { Label } from "../label.js";

describe("Label", () => {
  it("labels and focuses the input identified by htmlFor", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input id="workspace-name" />
      </div>
    );

    const input = screen.getByRole("textbox", { name: "Workspace name" });
    await user.click(screen.getByText("Workspace name"));

    expect(input).toHaveFocus();
  });
});
