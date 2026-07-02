// Declares the shared Vitest config factory for TypeScript consumers of the tooling package.

import type { UserConfigExport } from "vitest/config";

/**
 * Creates the standard ForgeKit Vitest config for workspace test configs that import the tooling package.
 */
export declare function createForgekitVitestConfig(): UserConfigExport;
