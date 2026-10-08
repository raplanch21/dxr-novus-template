import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardContentContainer } from "./dashboard-content-container";
import { doubleNarrative, singleNarrative } from "./fixtures";
import {
  catalogParameters,
  COMPONENT_DOCS_DESCRIPTION,
  type DashboardCatalogContract,
  storyDescription,
} from "./story-docs";

const catalogContract = {
  id: "dashboard.chart-interpretation",
  availability: "renderer-owned",
  summary:
    "The narrative interpretation paired with every approved analytical chart.",
  useWhen: ["The renderer frames an approved chart section."],
  doNotUseWhen: [
    "Narrative content is not paired with a chart.",
    "The heading would assert a conclusion instead of describing what the chart measures.",
  ],
  requiredInputs: [
    "A concise agent-written heading that describes what the chart measures.",
    "One or two interpretation blocks with an agent-written heading and body.",
  ],
  rules: [
    "Limit each block to one or two concise sentences.",
    "Place the content beside a standard chart or below a density-driven full-width chart.",
    "At compact widths, place the chart first and the interpretation second.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Components/Content container",
  component: DashboardContentContainer,
  argTypes: {
    blocks: { control: false },
  },
  parameters: catalogParameters(catalogContract, {
    sourceDescription: COMPONENT_DOCS_DESCRIPTION,
  }),
} satisfies Meta<typeof DashboardContentContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  args: {
    heading: "Visitor traffic and comparison baseline",
    blocks: singleNarrative,
  },
  render: () => (
    <div className="@container grid gap-10 @[760px]:grid-cols-2">
      <div className="grid content-start gap-3">
        <p className="font-mono text-[12px] leading-[18px] tracking-[0.3px] text-[#737373] uppercase">
          One block
        </p>
        <DashboardContentContainer
          heading="Visitor traffic and comparison baseline"
          blocks={singleNarrative}
        />
      </div>
      <div className="grid content-start gap-3">
        <p className="font-mono text-[12px] leading-[18px] tracking-[0.3px] text-[#737373] uppercase">
          Two blocks
        </p>
        <DashboardContentContainer
          heading="Visitor traffic and comparison baseline"
          blocks={doubleNarrative}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Compares one- and two-block chart interpretations, with no more than two concise sentences per block.",
        ),
      },
    },
  },
};
