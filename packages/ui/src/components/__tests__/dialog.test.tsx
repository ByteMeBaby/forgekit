// Verifies Dialog opens through its trigger and closes through its portal content.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../dialog.js";

describe("Dialog", () => {
  it("opens a named dialog in a portal and closes through its close control", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Dialog>
        <DialogTrigger>Open profile</DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update the public profile details.</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: "Open profile" }));

    const dialog = await screen.findByRole("dialog", { name: "Edit profile" });
    expect(dialog).toBeInTheDocument();
    expect(container).not.toContainElement(dialog);

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog", { name: "Edit profile" })).not.toBeInTheDocument();
  });

  it("closes an open dialog when Escape is pressed", async () => {
    const user = userEvent.setup();

    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update the public profile details.</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await screen.findByRole("dialog", { name: "Edit profile" });
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Edit profile" })).not.toBeInTheDocument();
  });
});
