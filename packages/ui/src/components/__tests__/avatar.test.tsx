// Verifies Avatar renders its fallback when jsdom cannot load an image source.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar.js";

describe("Avatar", () => {
  it("renders fallback text when the image source cannot load", () => {
    render(
      <Avatar>
        <AvatarImage alt="Taylor" src="" />
        <AvatarFallback>TK</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText("TK")).toBeInTheDocument();
  });
});
