import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardFunnelChart } from "./dashboard-funnel-chart";
import { DashboardKpiInsightDrawer } from "./dashboard-kpi-insight-drawer";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { catalogParameters, type DashboardCatalogContract } from "./story-docs";

const measuredPeriod = "June 14 to July 14, 2026";

const weeklyTraffic = [
  { week: "Jun 14", signIn: 18 },
  { week: "Jun 21", signIn: 12 },
  { week: "Jun 28", signIn: 9 },
  { week: "Jul 5", signIn: 8 },
  { week: "Jul 12", signIn: 6 },
] as const;

const activationFunnel = [
  { step: "Register", eventType: "page", visitors: 34 },
  { step: "Sign In", eventType: "page", visitors: 28 },
  { step: "Install Setup", eventType: "track event", visitors: 18 },
  { step: "Overview", eventType: "page", visitors: 12 },
] as const;

const ratingDistribution = [
  { rating: "0", responses: 9 },
  { rating: "1", responses: 4 },
  { rating: "2", responses: 1 },
  { rating: "3", responses: 0 },
  { rating: "4", responses: 2 },
  { rating: "5", responses: 3 },
] as const;

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
] as const;

const chartConfig = {
  signIn: { label: "Visitors", color: "var(--chart-1)" },
  responses: { label: "Responses", color: "var(--chart-1)" },
} satisfies ChartConfig;

const onAction = fn();

function yMeasureLabel(value: string) {
  return {
    value,
    angle: -90,
    position: "insideLeft",
    offset: 4,
    style: { textAnchor: "middle", fill: "#737373", fontSize: 12 },
  } as const;
}

function SignInChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart data={weeklyTraffic} margin={{ left: 12, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          label={yMeasureLabel("Visitors")}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="linear"
          dataKey="signIn"
          stroke="var(--color-signIn)"
          strokeWidth={2}
          fill="var(--color-signIn)"
          fillOpacity={0.12}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function ActivationChart() {
  return <DashboardFunnelChart data={activationFunnel} />;
}

function FeedbackChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart
        data={ratingDistribution}
        margin={{ left: 16, right: 8, top: 8 }}
        maxBarSize={128}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="rating" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          label={yMeasureLabel("Responses")}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="responses" radius={[4, 4, 0, 0]}>
          {ratingDistribution.map((entry, index) => (
            <Cell
              key={entry.rating}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

const catalogContract = {
  id: "dashboard.kpi-insight-drawer",
  availability: "renderer-owned",
  summary:
    "The inline analysis revealed beneath a selected key metric before the user opens its complete data set.",
  useWhen: ["A user selects one of the three key metrics."],
  doNotUseWhen: [
    "A user selects a general usage metric or chart mark; use the half-width drill instead.",
    "The agent is selecting a standalone dashboard block.",
  ],
  requiredInputs: [
    "The selected metric title and shared dashboard period.",
    "One supporting chart compatible with the metric’s data shape.",
    "An action label and handler that open the complete data set full-screen.",
  ],
  rules: [
    "Render inline beneath the selected key metric composition.",
    "Show one supporting chart and one full-data action.",
    "Do not add a separate narrative summary to the drawer.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Components/KPI insight drawer",
  component: DashboardKpiInsightDrawer,
  args: {
    ariaLabel: "Sign-in visitors insights",
    title: "Weekly sign-in visitors",
    timeframe: measuredPeriod,
    actionLabel: "View all visitors",
    onAction,
    children: <SignInChart />,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[746px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    ...catalogParameters(catalogContract),
    layout: "padded",
  },
} satisfies Meta<typeof DashboardKpiInsightDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithAreaChart: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    onAction.mockClear();
    await expect(
      canvas.getByRole("region", { name: "Sign-in visitors insights" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "View all visitors" }),
    );
    await expect(onAction).toHaveBeenCalledOnce();
  },
};

export const WithFunnelChart: Story = {
  args: {
    ariaLabel: "Overview activation rate insights",
    title: "Activation funnel",
    actionLabel: "View full breakdown",
    children: <ActivationChart />,
  },
};

export const WithBarChart: Story = {
  args: {
    ariaLabel: "In-app feedback score insights",
    title: "Rating distribution",
    actionLabel: "View all responses",
    children: <FeedbackChart />,
  },
};
