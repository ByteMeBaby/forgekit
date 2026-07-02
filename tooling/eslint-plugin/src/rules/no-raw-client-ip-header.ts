/**
 * Security rule: guards ForgeKit from raw client-IP header reads.
 *
 * Client-IP headers are set by the client and are forgeable, so only a helper
 * that counts trusted proxy hops with TRUSTED_PROXY_DEPTH may parse them. The
 * rule flags the header name wherever it appears as a string, which means it
 * does not need to enumerate every framework's header-access API.
 *
 * This applies repo-wide to serving code under packages and apps, but not to
 * tooling or tests. That differs from the package-local rules because the
 * subject here is a location-independent string, not a package-local symbol.
 */
import type { Rule } from "eslint";
import type { Literal, TemplateLiteral } from "estree";

type ParentReference = {
  parent?: Rule.Node;
};

type ParentedLiteral = Literal & ParentReference;
type ParentedTemplateLiteral = TemplateLiteral & ParentReference;

// All listed headers are client-set and forgeable. The bare RFC 7239
// `forwarded` header is deliberately excluded because it is a common English
// word that would cause false positives, and parsing it is the helper's job.
const blockedClientIpHeaders = new Set<string>([
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "true-client-ip",
  "x-client-ip"
]);

const servingCodeFilePattern = /(?:^|\/)(?:packages|apps)\//u;

function isBlockedHeaderName(value: string): boolean {
  return blockedClientIpHeaders.has(value.toLowerCase());
}

function normalizeFilename(filename: string): string {
  return filename.replaceAll("\\", "/");
}

function isServingCodeFile(filename: string): boolean {
  return servingCodeFilePattern.test(filename);
}

function isTestFile(filename: string): boolean {
  return (
    filename.includes("/__tests__/") || filename.endsWith(".test.ts") || filename.endsWith(".spec.ts")
  );
}

/**
 * Flags raw references to forgeable client-IP header names.
 */
export const noRawClientIpHeaderRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow raw reads of forgeable client-IP headers; use the canonical client-IP helper",
      url: "https://github.com/ByteMeBaby/forgekit/blob/main/docs/eslint-rules/no-raw-client-ip-header.md"
    },
    schema: [],
    messages: {
      rawClientIpHeader:
        "Reading `{{header}}` directly trusts a client-forgeable value as the IP. Resolve the client IP through the canonical client-IP helper (see docs/eslint-rules/no-raw-client-ip-header.md), which counts TRUSTED_PROXY_DEPTH trusted hops. If a raw use is deliberate (the helper itself, or setting, stripping, or redacting the header), allow it with `// eslint-disable-next-line @forgekit/no-raw-client-ip-header -- <reason>`."
    }
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    const filename = normalizeFilename(context.filename);

    if (!isServingCodeFile(filename)) {
      return {};
    }

    // Tests build request fixtures and never serve attacker traffic. A naive
    // parser that later moves into serving code is flagged at its new location.
    if (isTestFile(filename)) {
      return {};
    }

    return {
      Literal(node: ParentedLiteral): void {
        const parentType: string | undefined = node.parent?.type;

        // Type-level literals are declarations about shapes, not runtime header
        // reads. The parent type is stored in a string-typed local so TypeScript
        // does not narrow it into a no-overlap comparison.
        if (parentType === "TSLiteralType") {
          return;
        }

        if (typeof node.value !== "string" || !isBlockedHeaderName(node.value)) {
          return;
        }

        context.report({
          node,
          messageId: "rawClientIpHeader",
          data: {
            header: node.value
          }
        });
      },
      TemplateLiteral(node: ParentedTemplateLiteral): void {
        if (node.expressions.length !== 0 || node.quasis.length !== 1) {
          return;
        }

        const cooked = node.quasis[0]?.value.cooked;

        if (typeof cooked !== "string" || !isBlockedHeaderName(cooked)) {
          return;
        }

        context.report({
          node,
          messageId: "rawClientIpHeader",
          data: {
            header: cooked
          }
        });
      }
    };
  }
};
