// ESLint plugin entry for ForgeKit's custom rules: collects the rules and exposes them as a flat-config plugin object.

import type { Rule } from "eslint";

import { dependencyFlowRule } from "./rules/dependency-flow.js";
import { noUnscopedDbDeleteRule } from "./rules/no-unscoped-db-delete.js";

/** Rule-name to implementation map. Each key is used in ESLint config as `<namespace>/<rule-name>`. */
export const rules = {
  "dependency-flow": dependencyFlowRule,
  "no-unscoped-db-delete": noUnscopedDbDeleteRule
} satisfies Record<string, Rule.RuleModule>;

/** Flat-config plugin object. Register it under a namespace, then enable rules by `<namespace>/<rule-name>`. */
export const forgekitEslintPlugin = {
  rules
};

// Default export mirrors the named export so a flat config can import the plugin either way.
export default forgekitEslintPlugin;
