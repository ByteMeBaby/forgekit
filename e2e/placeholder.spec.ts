// Provides a minimal Playwright suite so the end-to-end gate is wired before real browser flows exist.

import { expect, test } from "@playwright/test";

// This placeholder asserts runner wiring rather than product behavior, keeping the e2e gate real.
test("placeholder", async ({ page }) => {
  await page.setContent("<main>ForgeKit</main>");
  await expect(page.getByText("ForgeKit")).toBeVisible();
});
