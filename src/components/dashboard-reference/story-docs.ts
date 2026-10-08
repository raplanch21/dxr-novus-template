export const FIGMA_NODE_URL =
  "https://www.figma.com/design/CIVBfzmaaeLz1GrmoKg5ss/%E2%9A%A1%EF%B8%8F-Novus?node-id=1963-1947";

export const MCP_CONTRACT_WARNING =
  "Visual reference from Figma node 1963:1947. Adapt this behavior to Nova's production MCP contracts; do not copy prototype implementation directly.";

export const FIGMA_DOCS_LINK = `Source Figma node: [1963:1947](${FIGMA_NODE_URL})`;

export const COMPONENT_DOCS_DESCRIPTION = `${MCP_CONTRACT_WARNING}\n\n${FIGMA_DOCS_LINK}`;

export type DashboardCatalogAvailability =
  "selectable" | "renderer-owned" | "excluded";

export interface DashboardCatalogContract {
  id: string;
  availability: DashboardCatalogAvailability;
  summary: string;
  useWhen: readonly string[];
  doNotUseWhen: readonly string[];
  requiredInputs: readonly string[];
  optionalInputs?: readonly string[];
  rules: readonly string[];
  notes?: readonly string[];
}

interface CatalogParametersOptions {
  sourceDescription?: string;
}

const availabilityLabels: Record<DashboardCatalogAvailability, string> = {
  selectable: "Selectable",
  "renderer-owned": "Renderer-owned",
  excluded: "Excluded",
};

function markdownList(items: readonly string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function optionalSection(
  heading: string,
  items: readonly string[] | undefined,
) {
  return items?.length ? `\n\n### ${heading}\n${markdownList(items)}` : "";
}

function catalogDescription(
  contract: DashboardCatalogContract,
  options: CatalogParametersOptions = {},
) {
  return [
    contract.summary,
    `**Catalog availability:** ${availabilityLabels[contract.availability]}`,
    `### Use when\n${markdownList(contract.useWhen)}`,
    `### Don’t use when\n${markdownList(contract.doNotUseWhen)}`,
    `### Required inputs\n${markdownList(contract.requiredInputs)}`,
    optionalSection("Optional inputs", contract.optionalInputs),
    `### Rules\n${markdownList(contract.rules)}`,
    optionalSection("Notes", contract.notes),
    options.sourceDescription,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Keeps machine-readable catalog metadata and its Autodocs description in sync.
 */
export function catalogParameters(
  contract: DashboardCatalogContract,
  options: CatalogParametersOptions = {},
) {
  return {
    catalog: contract,
    docs: {
      description: {
        component: catalogDescription(contract, options),
      },
    },
  };
}

/** Keeps a selectable chart story's metadata and story description in sync. */
export function catalogStoryParameters(
  contract: DashboardCatalogContract,
  options: CatalogParametersOptions = {},
) {
  return {
    catalog: contract,
    docs: {
      description: {
        story: catalogDescription(contract, options),
      },
    },
  };
}

export function storyDescription(description: string) {
  return description;
}
