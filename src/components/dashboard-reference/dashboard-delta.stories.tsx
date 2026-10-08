import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardDelta } from "./dashboard-delta";
import {
  catalogParameters,
  COMPONENT_DOCS_DESCRIPTION,
  type DashboardCatalogContract,
  storyDescription,
} from "./story-docs";

const catalogContract = {
  id: "dashboard.delta",
  availability: "renderer-owned",
  summary:
    "The renderer-owned semantic treatment for an optional numeric metric trend.",
  useWhen: [
    "A validated key or general metric supports comparison with the previous period.",
  ],
  doNotUseWhen: [
    "The metric has no valid comparison period.",
    "The delta would contain explanatory text.",
  ],
  requiredInputs: [
    "A numeric signed percent delta.",
    "Metric directionality declaring whether higher or lower is favorable.",
  ],
  rules: [
    "Map the signed value to favorable, unfavorable, or neutral through metric directionality.",
    "Never assume a positive number is favorable.",
    "Keep the numeric sign visible and provide a non-color semantic cue.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Foundations/Delta",
  component: DashboardDelta,
  args: {
    children: "+4.8%",
    valence: "positive",
  },
  argTypes: {
    children: { control: "text" },
    valence: {
      control: "radio",
      options: ["positive", "negative", "null"],
    },
  },
  parameters: catalogParameters(catalogContract, {
    sourceDescription: COMPONENT_DOCS_DESCRIPTION,
  }),
} satisfies Meta<typeof DashboardDelta>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "+4.8%",
    valence: "positive",
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Use controls to compare semantic valence independently from the numeric sign.",
        ),
      },
    },
  },
};

export const Variants: Story = {
  args: {
    children: "0.0%",
    valence: "null",
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <DashboardDelta valence="positive">+4.8%</DashboardDelta>
      <DashboardDelta valence="negative">-37.0%</DashboardDelta>
      <DashboardDelta valence="null">0.0%</DashboardDelta>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Compares favorable, unfavorable, and neutral delta variants without treating color as the only semantic cue.",
        ),
      },
    },
  },
};
