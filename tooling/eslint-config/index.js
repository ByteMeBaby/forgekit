// Publishes the shared flat ESLint config used by every workspace package and app.

import js from "@eslint/js";
import forgekitPlugin from "@forgekit/eslint-plugin";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * Shared ForgeKit ESLint flat config that keeps lint rules identical across apps, packages, and tooling.
 */
export const forgekitEslintConfig = defineConfig(
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      "@forgekit": forgekitPlugin
    },
    rules: {
      // no-explicit-any is an error because the skeleton should fail fast when a public or internal type loses shape.
      "@typescript-eslint/no-explicit-any": "error",
      // Cross-package runtime imports must follow the declared single-hop graph.
      "@forgekit/dependency-flow": "error"
    }
  }
);
