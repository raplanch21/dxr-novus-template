import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardKpiHeadline } from "./dashboard-kpi-headline";
import { headlineMetrics } from "./fixtures";
import {
  catalogParameters,
  COMPONENT_DOCS_DESCRIPTION,
  type DashboardCatalogContract,
  storyDescription,
} from "./story-docs";

const catalogContract = {
  id: "dashboard.kpi-headline",
  availability: "selectable",
  summary:
    "The required opening composition for the three metrics most relevant to the dashboard’s requested scope and decision.",
  useWhen: [
    "Exactly three decision-relevant metrics have validated values.",
    "The dashboard needs a fast top-level health orientation before deeper analysis.",
  ],
  doNotUseWhen: [
    "Fewer than three valid key metrics are available; stop dashboard generation instead.",
    "A metric belongs only in the supporting general usage section.",
  ],
  requiredInputs: [
    "Exactly three metrics.",
    "A label, value, one-sentence explanation, and shared dashboard period for every metric.",
    "Metric directionality that declares whether higher or lower values are favorable.",
  ],
  optionalInputs: [
    "A signed percent delta when the metric supports comparison.",
    "A raw count when the agent determines that it clarifies the primary value.",
  ],
  rules: [
    "Keep all three cards equal width in one wide-screen row.",
    "Stack the cards in their original order at compact and medium MCP widths.",
    "Use the renderer’s metric directionality to map delta sign to favorable, unfavorable, or neutral styling.",
    "Never place a key metric card outside this three-card composition.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Compositions/KPI headline",
  component: DashboardKpiHeadline,
  args: {
    metrics: headlineMetrics,
  },
  argTypes: {
    metrics: { control: false },
  },
  parameters: catalogParameters(catalogContract, {
    sourceDescription: COMPONENT_DOCS_DESCRIPTION,
  }),
} satisfies Meta<typeof DashboardKpiHeadline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MCPCompact: Story = {
  globals: {
    viewport: { value: "mcpCompact", isRotated: false },
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Compact-width headline layout where KPI cards stack into one column.",
        ),
      },
    },
  },
};

export const MCPMedium: Story = {
  globals: {
    viewport: { value: "mcpMedium", isRotated: false },
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Medium-width headline layout to verify stable spacing before the 3-column breakpoint.",
        ),
      },
    },
  },
};

export const MCPWide: Story = {
  globals: {
    viewport: { value: "mcpWide", isRotated: false },
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Target MCP width where headline cards align in three columns with separators.",
        ),
      },
    },
  },
};

export const NativeWide: Story = {
  globals: {
    viewport: { value: "nativeWide", isRotated: false },
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Native dashboard reference width for side-by-side comparison with Nova layouts.",
        ),
      },
    },
  },
};
