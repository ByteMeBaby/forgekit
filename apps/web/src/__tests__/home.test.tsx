// Verifies the web home placeholder renders in a DOM test environment.

import { UI_VERSION } from "@forgekit/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePage } from "../components/home-page";

describe("HomePage", () => {
  it("renders the placeholder, UI action, and package version", () => {
    render(<HomePage />);

    expect(screen.getByText("ForgeKit web is running.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
    expect(screen.getByText(`UI package version: ${UI_VERSION}`)).toBeInTheDocument();
  });
});
