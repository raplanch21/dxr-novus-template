import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { DashboardSectionDivider } from "./dashboard-section-divider";
import {
  catalogParameters,
  COMPONENT_DOCS_DESCRIPTION,
  type DashboardCatalogContract,
  storyDescription,
} from "./story-docs";

const catalogContract = {
  id: "dashboard.section-divider",
  availability: "renderer-owned",
  summary:
    "The renderer-owned heading that numbers and frames every analytical dashboard section.",
  useWhen: [
    "The renderer adds an analytical chart section between key metrics and general usage.",
  ],
  doNotUseWhen: [
    "The agent is selecting or numbering a section directly.",
    "The content belongs inside the key metric or general usage compositions.",
  ],
  requiredInputs: [
    "An agent-written concise sentence-case section title.",
    "Renderer-assigned sequential number, Ask action, and Edit action.",
  ],
  rules: [
    "The renderer owns placement and numbering.",
    "Generated dashboard sections always show both Ask Novus and Edit with Novus.",
    "Section order follows the agent’s narrative across no more than four analytical sections.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Components/Section divider",
  component: DashboardSectionDivider,
  argTypes: {
    onAsk: { control: false },
    onEdit: { control: false },
  },
  parameters: catalogParameters(catalogContract, {
    sourceDescription: COMPONENT_DOCS_DESCRIPTION,
  }),
} satisfies Meta<typeof DashboardSectionDivider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  args: {
    number: 1,
    title: "Instrumentation coverage",
    onAsk: fn(),
    onEdit: fn(),
  },
  render: (args) => <DashboardSectionDivider {...args} />,
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Generated section header with renderer-assigned numbering and the required Edit and Ask actions.",
        ),
      },
    },
  },
};
