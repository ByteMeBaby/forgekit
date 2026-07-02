/**
 * Enforces ForgeKit's internal package dependency flow: the allowed import graph
 * among the runtime packages @forgekit/web, @forgekit/ui, @forgekit/api,
 * @forgekit/core, @forgekit/db, and @forgekit/config. Each package may import
 * only its single allowed next hop down the chain; reaching past a layer is
 * forbidden. "Runtime packages" here means these shipped app and library
 * packages, as opposed to the shared tooling config packages, which are exempt
 * because they are development infrastructure.
 *
 * The rule governs every import between these packages, value and type-only
 * alike. An `import type { X } from "@forgekit/db"` is erased at build time and
 * carries no runtime edge, but it still couples the two packages, so it must
 * follow the same graph; route the type through the allowed layer instead. The
 * rule checks static imports, re-exports, and dynamic `import("...")` with a
 * string-literal specifier. A dynamic import whose specifier is not a string
 * literal cannot be resolved statically and is left unchecked.
 */
import type { Rule } from "eslint";
import type {
  ExportAllDeclaration,
  ExportNamedDeclaration,
  ImportExpression,
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

// Shared tooling lives under the same scope but is development
// infrastructure, not part of the governed graph.
const toolingPackages = new Set<string>([
  "@forgekit/eslint-config",
  "@forgekit/typescript-config",
  "@forgekit/vitest-config",
  "@forgekit/eslint-plugin"
]);

/**
 * Strict single-hop package adjacency list: each governed package lists only the
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
 * Reports packages with no allowed dependency as "none" so the lint
 * message names the empty allowed set instead of printing a blank value.
 */
function formatAllowedDependencies(allowedDependencies: readonly GovernedPackage[]): string {
  return allowedDependencies.length === 0 ? "none" : allowedDependencies.join(", ");
}

/**
 * Flags invalid @forgekit imports in governed packages.
 *
 * For a file inside a governed package, the rule allows only that package's
 * configured allowed dependency and shared tooling packages. Any other governed
 * package import is reported with the package that may not import the
 * target package and the allowed set for that package.
 */
export const dependencyFlowRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "enforce the ForgeKit package dependency flow across value, type, and dynamic imports",
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

    // Files outside governed packages are out of scope for this rule.
    if (currentPackage === null || !isGovernedPackage(currentPackage)) {
      return {};
    }

    const allowedDependencies = allowedRuntimeDependencies[currentPackage];
    const allowedDependencySet = new Set<string>(allowedDependencies);

    function checkSource(
      source: Literal | null | undefined,
      node: ImportDeclaration | ExportAllDeclaration | ExportNamedDeclaration | ImportExpression
    ): void {
      const sourceValue = getSourceValue(source);

      // Ignore non-string sources and imports outside the ForgeKit scope first.
      if (sourceValue === null || !sourceValue.startsWith("@forgekit/")) {
        return;
      }

      const targetPackage = getTargetPackage(sourceValue);

      // Tooling packages are cleared before the package graph check because
      // they share the @forgekit scope but are development infrastructure.
      if (targetPackage === null || toolingPackages.has(targetPackage)) {
        return;
      }

      // Unknown @forgekit targets pass because the rule governs only the known
      // package graph; known targets pass only when they are the allowed next hop.
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
        // Type-only imports are governed on purpose: the rule keys off the
        // source and deliberately ignores importKind because type shapes still
        // couple packages across the boundary.
        checkSource(node.source, node);
      },
      ExportAllDeclaration(node: ExportAllDeclaration): void {
        checkSource(node.source, node);
      },
      ExportNamedDeclaration(node: ExportNamedDeclaration): void {
        checkSource(node.source, node);
      },
      ImportExpression(node: ImportExpression): void {
        // Dynamic import() is the usual way to dodge a static cycle, so it is
        // checked too. Only a string-literal specifier can be resolved
        // statically; a computed specifier such as import(pkg) is left alone.
        if (node.source.type === "Literal") {
          checkSource(node.source, node);
        }
      }
    };
  }
};
