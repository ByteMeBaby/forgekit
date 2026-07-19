// Verifies Card layout primitives render their children and stable slot hook.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card.js";

describe("Card", () => {
  it("renders composed content and exposes the card data slot", () => {
    render(
      <Card data-testid="account-card">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent>Profile fields</CardContent>
        <CardFooter>Save changes</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("account-card")).toHaveAttribute("data-slot", "card");
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Profile fields")).toBeInTheDocument();
    expect(screen.getByText("Save changes")).toBeInTheDocument();
  });
});
