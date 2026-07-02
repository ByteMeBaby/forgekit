import { defineConfig } from "@playwright/test";

export default defineConfig({
  // The e2e folder keeps browser-level tests outside package test globs so unit and end-to-end gates stay separate.
  testDir: "./e2e",
  use: {
    // Trace only on retry keeps normal runs light while preserving enough state to debug an intermittent failure.
    trace: "on-first-retry"
  }
});
