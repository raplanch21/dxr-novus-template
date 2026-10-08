import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardStatusList } from "./dashboard-status-list";
import { dashboardStatusItems } from "./fixtures";
import {
  catalogParameters,
  type DashboardCatalogContract,
  storyDescription,
} from "./story-docs";

const statusListCatalogContract = {
  id: "dashboard.status-list",
  availability: "selectable",
  summary:
    "A narrative dashboard list for compact health assessments with explicit semantic status labels.",
  useWhen: [
    "Each row describes the health or readiness of a named area.",
    "A short explanation is more important than direct numeric comparison.",
  ],
  doNotUseWhen: [
    "Rows are ordered by a comparable value; use DashboardTable ranked.",
    "Rows pair identifiers, timestamps, or metadata; use DashboardTable records.",
  ],
  requiredInputs: [
    "Stable row IDs.",
    "A concise row title and one-sentence description.",
    "One status: healthy, watch, or attention.",
  ],
  optionalInputs: ["A specific empty-state message."],
  rules: [
    "Status meaning must remain visible in text and never depend on color alone.",
    "Use healthy for expected operation, watch for review, and attention for required intervention.",
    "Keep loading and transport errors at the parent level.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Components/Status list",
  component: DashboardStatusList,
  args: {
    items: dashboardStatusItems,
  },
  parameters: catalogParameters(statusListCatalogContract),
} satisfies Meta<typeof DashboardStatusList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllStatuses: Story = {
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Reference matrix for healthy, watch, and attention rows in one narrative list.",
        ),
      },
    },
  },
};

export const LongCopy: Story = {
  args: {
    items: [
      {
        id: "long-copy",
        title: "A product area with a deliberately long but specific title",
        description:
          "This status explanation wraps naturally at compact widths so the badge remains readable and the row does not force the dashboard wider than its host.",
        status: "watch",
      },
    ],
  },
  render: (args) => (
    <div className="w-[288px] max-w-full">
      <DashboardStatusList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Compact-width stress case for narrative titles and descriptions.",
        ),
      },
    },
  },
};

export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: "No status assessments are available.",
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Explicit no-data state; loading and transport errors remain parent-owned.",
        ),
      },
    },
  },
};
