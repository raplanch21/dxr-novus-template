import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Funnel } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { DashboardChartPanel } from "./dashboard-chart-panel";
import { DashboardFunnelChart } from "./dashboard-funnel-chart";
import { catalogParameters, type DashboardCatalogContract } from "./story-docs";

const FIGMA_NODE_URL =
  "https://www.figma.com/design/CIVBfzmaaeLz1GrmoKg5ss/%E2%9A%A1%EF%B8%8F-Novus?node-id=2166-781";

const activationFunnel = [
  { step: "Signals list", eventType: "page", visitors: 127 },
  { step: "Signal detail", eventType: "page", visitors: 32 },
  { step: "Investigation started", eventType: "track event", visitors: 11 },
  { step: "Plan approved", eventType: "feature", visitors: 2 },
  { step: "View pull request", eventType: "feature", visitors: 0 },
] as const;

const onSegmentSelect = fn();

const catalogContract = {
  id: "dashboard.chart.funnel",
  availability: "selectable",
  summary:
    "Shows progression through a real ordered funnel and separates visitors who continued from those who dropped before each step.",
  useWhen: [
    "The evidence defines a validated ordered funnel with at least two tracked steps.",
    "The analysis needs to compare continued and dropped cohorts at each step.",
  ],
  doNotUseWhen: [
    "The data is an unordered category comparison.",
    "The agent would need to invent, merge, or omit funnel steps to make the chart fit.",
  ],
  requiredInputs: [
    "The complete ordered set of funnel steps.",
    "A step label, tracked event type, and validated visitor count for every step.",
  ],
  optionalInputs: [
    "Underlying visitor records for selectable continued or dropped segments.",
  ],
  rules: [
    "Render every real funnel step without a synthetic maximum.",
    "Never show a chart type switcher.",
    "Use the renderer’s full-width analytical layout when the standard split cannot preserve legible steps.",
    "Allow horizontal scrolling when the complete full-width funnel still cannot fit.",
    "Open a half-width drill only when the selected segment maps to underlying records.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Charts/Funnel",
  component: DashboardFunnelChart,
  args: {
    data: activationFunnel,
    onSegmentSelect,
  },
  parameters: catalogParameters(catalogContract, {
    sourceDescription: `Source Figma node: [2166:781](${FIGMA_NODE_URL}).`,
  }),
} satisfies Meta<typeof DashboardFunnelChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => (
    <div className="w-full max-w-[695px]">
      <DashboardChartPanel
        title="Current ordered Signal funnel"
        period="Rolling 30 days ending August 12, 2026"
        modeLabel="Cumulative reach"
        modeIcon={Funnel}
        className="h-[390px]"
      >
        <DashboardFunnelChart {...args} />
      </DashboardChartPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("group", { name: "Current ordered Signal funnel" }),
    ).toBeVisible();
    await expect(
      canvas.getByText("Rolling 30 days ending August 12, 2026"),
    ).toBeVisible();
    await expect(canvas.getByText("Cumulative reach")).toBeVisible();
    const droppedSegment = canvas.getByRole("button", {
      name: "95 visitors dropped at Signal detail",
    });

    onSegmentSelect.mockClear();
    await userEvent.hover(droppedSegment);
    const label = canvas.getByText("Dropped off");
    const value = canvas.getByText("95 (75%)");
    await expect(label).toBeVisible();
    await expect(label).toHaveClass("text-muted-foreground");
    await expect(label).toHaveClass("whitespace-nowrap");
    await expect(canvas.queryByText("Dropped off:")).not.toBeInTheDocument();
    await expect(value).toBeVisible();
    await expect(value).toHaveClass("font-mono");
    await expect(value).toHaveClass("whitespace-nowrap");
    await expect(canvas.queryByText("Continued:")).not.toBeInTheDocument();
    await userEvent.click(droppedSegment);
    await expect(onSegmentSelect).toHaveBeenCalledWith(1, "dropped");
  },
};
