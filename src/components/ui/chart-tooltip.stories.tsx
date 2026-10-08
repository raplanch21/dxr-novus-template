import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartTooltipPanel,
} from "@/components/ui/chart";

const tooltipConfig = {
  activated: {
    label: "Activated visitors",
    color: "var(--chart-1)",
  },
  retained: {
    label: "Retained visitors",
    color: "var(--chart-2)",
  },
  viewNps: {
    label: "View NPS report",
    color: "var(--chart-1)",
  },
  askAgent: {
    label: "Ask Agent Mode",
    color: "var(--chart-2)",
  },
  adoptionReport: {
    label: "View visitor adoption report",
    color: "var(--chart-3)",
  },
  viewDetails: {
    label: "View details",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const trendRows = [
  { period: "May 11", activated: 1840, retained: 1290 },
  { period: "May 18", activated: 1970, retained: 1460 },
] as const;

function TooltipPreview(props: ComponentProps<typeof ChartTooltipContent>) {
  return (
    <ChartContainer
      config={tooltipConfig}
      initialDimension={{ width: 360, height: 180 }}
      className="h-[180px] w-[360px] items-start justify-start"
    >
      <ChartTooltipContent active {...props} />
    </ChartContainer>
  );
}

const meta = {
  title: "UI/Chart tooltip",
  component: ChartTooltipContent,
  args: {
    active: true,
    label: "May 18",
    payload: [
      {
        graphicalItemId: "activated",
        dataKey: "activated",
        name: "activated",
        value: 1970,
        payload: { period: "May 18", activated: 1970 },
      },
    ],
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Shared chart tooltip for compact values and richer period comparisons.",
      },
    },
  },
} satisfies Meta<typeof ChartTooltipContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <TooltipPreview {...args} />,
};

export const AlignedMultiSeries: Story = {
  render: () => (
    <TooltipPreview
      label="Jul 19"
      payload={[
        {
          graphicalItemId: "viewNps",
          dataKey: "viewNps",
          name: "viewNps",
          value: 57,
          color: "var(--chart-1)",
          payload: {},
        },
        {
          graphicalItemId: "askAgent",
          dataKey: "askAgent",
          name: "askAgent",
          value: 48,
          color: "var(--chart-2)",
          payload: {},
        },
        {
          graphicalItemId: "adoptionReport",
          dataKey: "adoptionReport",
          name: "adoptionReport",
          value: 47,
          color: "var(--chart-3)",
          payload: {},
        },
        {
          graphicalItemId: "viewDetails",
          dataKey: "viewDetails",
          name: "viewDetails",
          value: 12,
          color: "var(--chart-4)",
          payload: {},
        },
      ]}
    />
  ),
};

export const TimeComparison: Story = {
  render: () => (
    <TooltipPreview
      variant="comparison"
      label="May 18"
      measure="unique visitors"
      comparison={{
        rows: trendRows,
        labelKey: "period",
        periodNoun: "week",
      }}
      payload={[
        {
          graphicalItemId: "activated",
          dataKey: "activated",
          name: "activated",
          value: 1970,
          color: "var(--chart-1)",
          payload: { period: "May 18", activated: 1970, retained: 1460 },
        },
      ]}
    />
  ),
};

export const CategoricalComparison: Story = {
  render: () => (
    <TooltipPreview
      variant="comparison"
      label="Product Knowledge"
      measure="unique visitors"
      comparison={{ prevKey: "prevVisitors", periodNoun: "period" }}
      payload={[
        {
          graphicalItemId: "activated",
          dataKey: "activated",
          name: "activated",
          value: 34,
          color: "var(--chart-1)",
          payload: {
            area: "Product Knowledge",
            activated: 34,
            prevVisitors: 27,
          },
        },
      ]}
    />
  ),
};

export const MultiSeries: Story = {
  render: () => (
    <TooltipPreview
      variant="comparison"
      label="May 18"
      measure="visitors"
      comparison={{
        rows: trendRows,
        labelKey: "period",
        periodNoun: "week",
      }}
      payload={[
        {
          graphicalItemId: "activated",
          dataKey: "activated",
          name: "activated",
          value: 1970,
          color: "var(--chart-1)",
          payload: { period: "May 18", activated: 1970, retained: 1460 },
        },
        {
          graphicalItemId: "retained",
          dataKey: "retained",
          name: "retained",
          value: 1460,
          color: "var(--chart-2)",
          payload: { period: "May 18", activated: 1970, retained: 1460 },
        },
      ]}
    />
  ),
};

export const NoBaseline: Story = {
  render: () => (
    <TooltipPreview
      variant="comparison"
      label="May 11"
      measure="visitors"
      comparison={{
        rows: trendRows,
        labelKey: "period",
        periodNoun: "week",
      }}
      payload={[
        {
          graphicalItemId: "activated",
          dataKey: "activated",
          name: "activated",
          value: 1840,
          color: "var(--chart-1)",
          payload: { period: "May 11", activated: 1840, retained: 1290 },
        },
      ]}
    />
  ),
};

export const FunnelBreakdown: Story = {
  render: () => (
    <ChartTooltipPanel
      title="Sign In"
      rows={[
        {
          label: "Continued",
          value: "28 (82%)",
          color: "var(--chart-1)",
        },
        {
          label: "Dropped off",
          value: "6 (18%)",
          color: "#DCDCE1",
        },
      ]}
    />
  ),
};
