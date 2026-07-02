/**
 * Guards the dependency-flow rule's assumption that every workspace package's
 * identity is its directory name (`@forgekit/<dirname>`). A directory renamed
 * out of sync with its package.json name would silently drop that file from
 * governance, the worst failure mode for an enforcement rule.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const workspaceGroups = ["packages", "apps", "tooling"] as const;

function findRepoRoot(): string {
  let currentDirectory = dirname(fileURLToPath(import.meta.url));

  while (true) {
    if (existsSync(join(currentDirectory, "pnpm-workspace.yaml"))) {
      return currentDirectory;
    }

    const parentDirectory = dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      throw new Error("Could not find repo root because pnpm-workspace.yaml was not found.");
    }

    currentDirectory = parentDirectory;
  }
}

function readPackageManifest(packageJsonPath: string): { name?: string } {
  const packageManifest = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { name?: string };

  return packageManifest;
}

describe("workspace package names", (): void => {
  const repoRoot = findRepoRoot();

  for (const workspaceGroup of workspaceGroups) {
    it(`${workspaceGroup} package names match directory names`, (): void => {
      const workspaceGroupPath = join(repoRoot, workspaceGroup);

      for (const entry of readdirSync(workspaceGroupPath, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          continue;
        }

        const packageJsonPath = join(workspaceGroupPath, entry.name, "package.json");

        if (!existsSync(packageJsonPath)) {
          continue;
        }

        const packageManifest = readPackageManifest(packageJsonPath);

        expect(packageManifest.name).toBe(`@forgekit/${entry.name}`);
      }
    });
  }
});
