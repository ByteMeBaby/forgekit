// Configures DOM-based tests for the web app.

import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for React route tests.
 */
const config = defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test/setup.ts"]
  }
});

export default config;
