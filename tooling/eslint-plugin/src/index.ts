// ESLint plugin entry for ForgeKit's custom rules: collects the rules and exposes them as a flat-config plugin object.

import type { Rule } from "eslint";

import { dependencyFlowRule } from "./rules/dependency-flow.js";

/** Rule-name to implementation map. The key is the name used in ESLint config as `<namespace>/dependency-flow`. */
export const rules = {
  "dependency-flow": dependencyFlowRule
} satisfies Record<string, Rule.RuleModule>;

/** Flat-config plugin object. Register it under a namespace, then enable a rule by `<namespace>/dependency-flow`. */
export const forgekitEslintPlugin = {
  rules
};

// Default export mirrors the named export so a flat config can import the plugin either way.
export default forgekitEslintPlugin;
