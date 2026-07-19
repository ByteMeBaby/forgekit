// Verifies DropdownMenu exposes menu behavior from portalled content.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "../dropdown-menu.js";

describe("DropdownMenu", () => {
  it("opens a portalled menu and selects an item", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Edit project</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));

    const menu = await screen.findByRole("menu");
    const item = screen.getByRole("menuitem", { name: "Edit project" });

    expect(container).not.toContainElement(menu);
    await user.click(item);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("exposes checkbox state and renders the checked indicator", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Show sidebar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>Show keyboard shortcuts</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const checkedItem = screen.getByRole("menuitemcheckbox", { name: "Show sidebar" });
    const uncheckedItem = screen.getByRole("menuitemcheckbox", { name: "Show keyboard shortcuts" });

    expect(checkedItem).toHaveAttribute("aria-checked", "true");
    expect(checkedItem.querySelector("[data-slot='dropdown-menu-item-indicator'] svg")).toBeInTheDocument();
    expect(uncheckedItem).toHaveAttribute("aria-checked", "false");
  });

  it("exposes the selected value in a radio group", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="comfortable">
            <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const comfortable = screen.getByRole("menuitemradio", { name: "Comfortable" });
    const compact = screen.getByRole("menuitemradio", { name: "Compact" });

    expect(comfortable).toHaveAttribute("aria-checked", "true");
    expect(compact).toHaveAttribute("aria-checked", "false");
  });

  it("sets inset and variant attributes only when requested", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuItem inset variant="destructive">
            Indented destructive item
          </DropdownMenuItem>
          <DropdownMenuItem inset={false}>Non-indented default item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const insetItem = screen.getByRole("menuitem", { name: "Indented destructive item" });
    const nonInsetItem = screen.getByRole("menuitem", { name: "Non-indented default item" });

    expect(insetItem).toHaveAttribute("data-inset", "");
    expect(insetItem).toHaveAttribute("data-variant", "destructive");
    expect(nonInsetItem).not.toHaveAttribute("data-inset");
    expect(nonInsetItem).toHaveAttribute("data-variant", "default");
  });
});
