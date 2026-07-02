// Publishes the shared Vitest config factory consumed by each workspace test config.

import { defineConfig } from "vitest/config";

/**
 * Creates the standard ForgeKit Vitest config so all workspaces use the same test discovery and runtime defaults.
 */
export function createForgekitVitestConfig() {
  // A factory avoids sharing mutable config objects and lets each workspace resolve tests from its own package root.
  return defineConfig({
    test: {
      environment: "node",
      include: ["src/**/__tests__/**/*.test.ts"],
      passWithNoTests: true
    }
  });
}
