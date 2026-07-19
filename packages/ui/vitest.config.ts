// Configures DOM-based tests for the UI component package.

import { createForgekitVitestConfig } from "@forgekit/vitest-config";
import { defineConfig, mergeConfig } from "vitest/config";

/**
 * Vitest config for UI component tests: the shared factory plus a jsdom
 * environment and the jest-dom setup, so React components render in tests.
 */
const config = mergeConfig(
  createForgekitVitestConfig(),
  defineConfig({
    test: {
      environment: "jsdom",
      include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
      setupFiles: ["vitest.setup.ts"]
    }
  })
);

export default config;
