// Verifies Tabs roles and pointer and keyboard activation behavior.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs.js";

describe("Tabs", () => {
  it("exposes tab roles and switches panels with clicks and ArrowRight", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="account">
        <TabsList aria-label="Account settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account panel</TabsContent>
        <TabsContent value="security">Security panel</TabsContent>
      </Tabs>
    );

    const accountTab = screen.getByRole("tab", { name: "Account" });
    const securityTab = screen.getByRole("tab", { name: "Security" });

    expect(screen.getByRole("tablist", { name: "Account settings" })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account panel");

    await user.click(securityTab);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security panel");

    await user.click(accountTab);
    await user.keyboard("{ArrowRight}");

    expect(securityTab).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security panel");
  });
});
