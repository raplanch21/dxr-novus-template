import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardMetricCard } from "./dashboard-metric-card";
import { generalMetrics, headlineMetrics, neutralKeyMetric } from "./fixtures";
import {
  catalogParameters,
  COMPONENT_DOCS_DESCRIPTION,
  type DashboardCatalogContract,
  storyDescription,
} from "./story-docs";

const catalogContract = {
  id: "dashboard.metric-card",
  availability: "renderer-owned",
  summary:
    "The shared metric cell rendered inside the three-card key metric composition or the general usage grid.",
  useWhen: [
    "The renderer is composing an approved KPI headline or general usage grid.",
  ],
  doNotUseWhen: [
    "The agent is selecting a standalone dashboard block.",
    "The metric has not produced a validated value.",
  ],
  requiredInputs: [
    "A label and validated value.",
    "For key metrics, a one-sentence explanation and the shared dashboard period.",
  ],
  optionalInputs: [
    "A numeric signed percent delta when the metric supports comparison.",
    "For key metrics, a raw count when it clarifies the primary value.",
  ],
  rules: [
    "Never render this component outside an approved metric grid.",
    "Use metric directionality to map delta sign to semantic valence.",
    "General cards never render explanatory copy or their own period.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Components/Metric card",
  component: DashboardMetricCard,
  args: {
    showBaseline: true,
  },
  argTypes: {
    type: { control: "radio", options: ["key", "general"] },
    showBaseline: {
      control: "boolean",
      description: "Shows or hides the supporting baseline value.",
    },
  },
  parameters: catalogParameters(catalogContract, {
    sourceDescription: COMPONENT_DOCS_DESCRIPTION,
  }),
} satisfies Meta<typeof DashboardMetricCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: headlineMetrics[0],
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Use controls to compare the Key and General variants with representative metric content.",
        ),
      },
    },
  },
};

export const Variants: Story = {
  args: { ...headlineMetrics[1], showBaseline: true },
  render: ({ showBaseline }) => {
    const variants = [
      { name: "Key · positive", metric: headlineMetrics[0] },
      { name: "Key · negative", metric: headlineMetrics[1] },
      { name: "Key · neutral", metric: neutralKeyMetric },
      { name: "Key · no baseline", metric: headlineMetrics[2] },
      { name: "General", metric: generalMetrics[0] },
    ];

    return (
      <div className="grid gap-8">
        {variants.map(({ name, metric }) => (
          <div key={name} className="grid gap-3">
            <p className="font-mono text-[12px] leading-[18px] tracking-[0.3px] text-[#737373] uppercase">
              {name}
            </p>
            <DashboardMetricCard {...metric} showBaseline={showBaseline} />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Compares every metric-card variant in one place: favorable, unfavorable, neutral, missing-baseline, and compact General.",
        ),
      },
    },
  },
};

export const KeyPositive: Story = {
  args: { ...headlineMetrics[0], showBaseline: true },
  tags: ["!autodocs"],
};

export const KeyNegative: Story = {
  args: { ...headlineMetrics[1], showBaseline: true },
  tags: ["!autodocs"],
};

export const KeyWithoutBaseline: Story = {
  args: { ...headlineMetrics[2], showBaseline: false },
  tags: ["!autodocs"],
};

export const General: Story = {
  args: { ...generalMetrics[0], showBaseline: true },
  tags: ["!autodocs"],
};
