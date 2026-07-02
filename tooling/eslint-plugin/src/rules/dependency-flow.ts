/**
 * Enforces ForgeKit's internal runtime dependency flow.
 *
 * The governed runtime packages are @forgekit/web, @forgekit/ui, @forgekit/api,
 * @forgekit/core, @forgekit/db, and @forgekit/config. Each package may import
 * only its single allowed next hop down the chain; reaching past a layer is
 * forbidden. Shared tooling config packages are exempt because they are
 * development infrastructure, not runtime flow.
 */
import type { Rule } from "eslint";
import type {
  ExportAllDeclaration,
  ExportNamedDeclaration,
  ImportDeclaration,
  Literal
} from "estree";

const governedPackages = [
  "@forgekit/web",
  "@forgekit/ui",
  "@forgekit/api",
  "@forgekit/core",
  "@forgekit/db",
  "@forgekit/config"
] as const;

type GovernedPackage = (typeof governedPackages)[number];

const governedPackageSet = new Set<string>(governedPackages);

// Shared tooling lives under the same scope but is development infrastructure, not runtime flow.
const toolingPackages = new Set<string>([
  "@forgekit/eslint-config",
  "@forgekit/typescript-config",
  "@forgekit/vitest-config",
  "@forgekit/eslint-plugin"
]);

/**
 * Strict single-hop runtime adjacency list: each governed package lists only the
 * next package it may directly depend on. Imports that reach past that next
 * package are exactly what this rule forbids.
 */
const allowedRuntimeDependencies: Record<GovernedPackage, readonly GovernedPackage[]> = {
  "@forgekit/web": ["@forgekit/ui"],
  "@forgekit/ui": [],
  "@forgekit/api": ["@forgekit/core"],
  "@forgekit/core": ["@forgekit/db"],
  "@forgekit/db": ["@forgekit/config"],
  "@forgekit/config": []
};

const packagePathPattern = /(?:^|\/)(?:packages|apps)\/([^/]+)(?:\/|$)/u;
const forgekitPackagePattern = /^@forgekit\/[^/]+/u;

/**
 * Derives the package that owns a file from its packages/<name> or apps/<name>
 * path segment. Windows separators are normalized first so the same pattern
 * works across platforms; files outside those segments return null and are
 * ignored by the rule.
 */
function getOwningPackage(filename: string): string | null {
  const normalizedFilename = filename.replaceAll("\\", "/");
  const packageName = packagePathPattern.exec(normalizedFilename)?.[1];

  return packageName === undefined ? null : `@forgekit/${packageName}`;
}

/**
 * Extracts the package-level @forgekit/<pkg> target from an import source,
 * discarding any subpath so imports and deep imports are judged the same way.
 */
function getTargetPackage(source: string): string | null {
  return forgekitPackagePattern.exec(source)?.[0] ?? null;
}

function isGovernedPackage(packageName: string): packageName is GovernedPackage {
  return governedPackageSet.has(packageName);
}

function getSourceValue(source: Literal | null | undefined): string | null {
  if (source === null || source === undefined || typeof source.value !== "string") {
    return null;
  }

  return source.value;
}

/**
 * Reports packages with no allowed runtime dependency as "none" so the lint
 * message names the empty allowed set instead of printing a blank value.
 */
function formatAllowedDependencies(allowedDependencies: readonly GovernedPackage[]): string {
  return allowedDependencies.length === 0 ? "none" : allowedDependencies.join(", ");
}

/**
 * Flags invalid @forgekit imports in governed runtime packages.
 *
 * For a file inside a governed package, the rule allows only that package's
 * configured runtime dependency and shared tooling packages. Any other governed
 * runtime package import is reported with the package that may not import the
 * target package and the allowed set for that package.
 */
export const dependencyFlowRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "enforce the ForgeKit runtime package dependency flow",
      url: "https://github.com/ByteMeBaby/forgekit/blob/main/docs/eslint-rules/dependency-flow.md"
    },
    schema: [],
    messages: {
      forbiddenImport:
        "{{currentPackage}} may not import {{targetPackage}}. Allowed internal dependencies: {{allowedDependencies}}."
    }
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    const currentPackage = getOwningPackage(context.filename);

    // Files outside governed runtime packages are out of scope for this rule.
    if (currentPackage === null || !isGovernedPackage(currentPackage)) {
      return {};
    }

    const allowedDependencies = allowedRuntimeDependencies[currentPackage];
    const allowedDependencySet = new Set<string>(allowedDependencies);

    function checkSource(
      source: Literal | null | undefined,
      node: ImportDeclaration | ExportAllDeclaration | ExportNamedDeclaration
    ): void {
      const sourceValue = getSourceValue(source);

      // Ignore non-string sources and imports outside the ForgeKit scope first.
      if (sourceValue === null || !sourceValue.startsWith("@forgekit/")) {
        return;
      }

      const targetPackage = getTargetPackage(sourceValue);

      // Tooling packages are cleared before the runtime graph check because
      // they share the @forgekit scope but are development infrastructure.
      if (targetPackage === null || toolingPackages.has(targetPackage)) {
        return;
      }

      // Unknown @forgekit targets pass because the rule governs only the known
      // runtime graph; known targets pass only when they are the allowed next hop.
      if (!isGovernedPackage(targetPackage) || allowedDependencySet.has(targetPackage)) {
        return;
      }

      context.report({
        node,
        messageId: "forbiddenImport",
        data: {
          currentPackage,
          targetPackage,
          allowedDependencies: formatAllowedDependencies(allowedDependencies)
        }
      });
    }

    return {
      ImportDeclaration(node: ImportDeclaration): void {
        checkSource(node.source, node);
      },
      ExportAllDeclaration(node: ExportAllDeclaration): void {
        checkSource(node.source, node);
      },
      ExportNamedDeclaration(node: ExportNamedDeclaration): void {
        checkSource(node.source, node);
      }
    };
  }
};
