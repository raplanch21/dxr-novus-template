import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardMetricsGrid } from "./dashboard-metrics-grid";
import { generalMetrics } from "./fixtures";
import {
  catalogParameters,
  COMPONENT_DOCS_DESCRIPTION,
  type DashboardCatalogContract,
  storyDescription,
} from "./story-docs";

const catalogContract = {
  id: "dashboard.general-metrics",
  availability: "selectable",
  summary:
    "The optional closing composition for valid supporting metrics that broaden the dashboard without repeating key metrics.",
  useWhen: [
    "One to six valid supporting metrics add useful context beyond the three key metrics.",
    "The dashboard has completed its analytical chart sections.",
  ],
  doNotUseWhen: [
    "No additional valid metric is available; omit the general usage section.",
    "A candidate metric duplicates one of the three key metrics.",
  ],
  requiredInputs: [
    "One to six metrics with a label and value.",
    "One audience or segment label for the complete grid.",
    "The shared dashboard measured period.",
  ],
  optionalInputs: [
    "A numeric signed percent delta, such as +12.5%, when the metric supports comparison.",
  ],
  rules: [
    "Place general usage after all analytical chart sections.",
    "Keep every row equal width: one full-width card, two halves, three thirds, four as 2 × 2, five as 3 + 2, and six as 3 × 2.",
    "Stack cards in their original order at compact MCP widths.",
    "Never include prose in a trend delta.",
    "Use metric directionality, not numeric sign alone, to determine semantic styling.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Compositions/Metrics grid",
  component: DashboardMetricsGrid,
  args: {
    metrics: generalMetrics,
    segment: "Enterprise segment",
    period: "June 14 to July 14, 2026",
  },
  argTypes: {
    metrics: { control: false },
  },
  parameters: catalogParameters(catalogContract, {
    sourceDescription: COMPONENT_DOCS_DESCRIPTION,
  }),
} satisfies Meta<typeof DashboardMetricsGrid>;

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
          "Compact width where segment metrics collapse to a single column for readability.",
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
          "Medium width where the grid expands to two columns with continuous divider hairlines.",
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
          "Increase does not always mean favorable: 'Activation drop-offs' shows +16.7% with negative valence. 'Session replays viewed' omits delta when baseline is missing.",
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
          "Native dashboard width reference with the full 3-column metrics composition.",
        ),
      },
    },
  },
};

export const PartialRow: Story = {
  args: {
    metrics: generalMetrics.slice(0, 5),
    segment: "Enterprise segment",
    period: "June 14 to July 14, 2026",
  },
  globals: {
    viewport: { value: "mcpWide", isRotated: false },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Five-metric balanced-row reference with three equal cards above two equal-width cards and no placeholders.",
      },
    },
  },
};
