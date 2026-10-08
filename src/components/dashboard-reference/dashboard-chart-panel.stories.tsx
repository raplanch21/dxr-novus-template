import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChartBarBig, ChartColumnBig } from "lucide-react";
import { expect } from "storybook/test";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  DashboardChartPanel,
  type DashboardChartPanelOption,
} from "./dashboard-chart-panel";
import { DashboardBarChart } from "./dashboard-bar-chart";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { catalogParameters, type DashboardCatalogContract } from "./story-docs";

const FIGMA_NODE_URL =
  "https://www.figma.com/design/CIVBfzmaaeLz1GrmoKg5ss/%E2%9A%A1%EF%B8%8F-Novus?node-id=1963-1553";

const productAreaData = [
  { area: "AI Chat", visitors: 34 },
  { area: "MCP Setup", visitors: 29 },
  { area: "Product Knowledge", visitors: 18 },
  { area: "Session Replay", visitors: 12 },
  { area: "Guides", visitors: 8 },
  { area: "Launches", visitors: 6 },
] as const;

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const visualizationOptions = [
  { value: "bar", label: "Bar", icon: ChartColumnBig },
  { value: "ranking", label: "Ranking", icon: ChartBarBig },
] satisfies readonly DashboardChartPanelOption[];

const axisLabelStyle = {
  textAnchor: "middle",
  fill: "#737373",
  fontSize: 12,
} as const;

function yMeasureLabel(value: string) {
  return {
    value,
    angle: -90,
    position: "insideLeft",
    offset: 4,
    style: axisLabelStyle,
  } as const;
}

function ProductAreaChart({ type }: { type: string }) {
  if (type === "ranking") {
    return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          data={productAreaData}
          layout="vertical"
          margin={{ top: 8, right: 8, bottom: 16, left: 8 }}
          maxBarSize={32}
        >
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            label={{
              value: "Visitors",
              position: "insideBottom",
              offset: -8,
              style: axisLabelStyle,
            }}
          />
          <YAxis
            type="category"
            dataKey="area"
            tickLine={false}
            axisLine={false}
            width={120}
            interval={0}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="visitors"
            fill="var(--color-visitors)"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart
        data={productAreaData}
        margin={{ top: 8, right: 8, bottom: 16, left: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="area" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          label={yMeasureLabel("Visitors")}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="visitors"
          fill="var(--color-visitors)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

function InteractiveChartPanel() {
  const [type, setType] = useState("bar");

  return (
    <div className="w-full max-w-[522px]">
      <DashboardChartPanel
        title="Visitors by product area"
        period="June 14 to July 14, 2026"
        options={visualizationOptions}
        selectedValue={type}
        onValueChange={setType}
      >
        <ProductAreaChart type={type} />
      </DashboardChartPanel>
    </div>
  );
}

function RankingChartPanel() {
  return (
    <div className="w-full max-w-[522px]">
      <DashboardChartPanel
        title="Visitors by product area"
        period="June 14 to July 14, 2026"
        modeLabel="Ranking"
      >
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            data={productAreaData}
            layout="vertical"
            margin={{ top: 8, right: 8, bottom: 16, left: 8 }}
            maxBarSize={32}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              label={{
                value: "Visitors",
                position: "insideBottom",
                offset: -8,
                style: axisLabelStyle,
              }}
            />
            <YAxis
              type="category"
              dataKey="area"
              tickLine={false}
              axisLine={false}
              width={120}
              interval={0}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="visitors"
              fill="var(--color-visitors)"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </DashboardChartPanel>
    </div>
  );
}

function BottomAlignedContentPanel() {
  return (
    <div className="w-full max-w-[522px]">
      <DashboardChartPanel
        title="Bottom-aligned chart content"
        period="Current ordered funnel"
        modeLabel="Comparison"
        className="h-[320px]"
        contentClassName="px-4 pt-4 pb-0"
      >
        <DashboardBarChart
          ariaLabel="Bottom-aligned chart content"
          data={[
            { label: "Reached details", value: 32 },
            { label: "Did not reach details", value: 95 },
          ]}
          measureLabel="Visitors"
        />
      </DashboardChartPanel>
    </div>
  );
}

const catalogContract = {
  id: "dashboard.chart-panel",
  availability: "renderer-owned",
  summary:
    "The renderer-owned frame for approved analytical charts, including title, measured period, chart mode, responsive layout, states, and optional compatible switching.",
  useWhen: [
    "The agent selects an approved chart type for one of up to four analytical sections.",
  ],
  doNotUseWhen: [
    "The agent is assembling a chart from primitives.",
    "The data does not satisfy an approved chart contract.",
  ],
  requiredInputs: [
    "A concise chart title.",
    "The shared dashboard measured period.",
    "One approved chart: line, area, vertical bar, grouped bar, horizontal ranked bar, or funnel.",
    "One chart interpretation with an agent-written measurement heading and one or two blocks.",
  ],
  optionalInputs: [
    "A chart switcher containing only alternatives allowed by the data-shape compatibility matrix.",
  ],
  rules: [
    "Use line charts only for time series with at least two periods and no more than nine series.",
    "Use a single-series area chart when trend and zero-based magnitude over time both matter.",
    "Use vertical bars for one measure across no more than six discrete categories.",
    "Use grouped bars for no more than six category groups and nine series; reject the chart above nine series.",
    "Use horizontal ranked bars for no more than 10 ordered categories.",
    "Derive the visible mode label from the selected chart type.",
    "Use shared loading, empty, and error states across every chart.",
    "Keep a series color stable everywhere it appears in one dashboard.",
    "Use a standard split layout or a density-driven full-width chart with interpretation below; stack chart before interpretation at compact widths.",
  ],
  notes: [
    "The agent decides whether to expose compatible switching. Funnel charts never show a chart type switcher.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Components/Chart panel",
  component: DashboardChartPanel,
  args: {
    title: "Visitors by product area",
    period: "June 14 to July 14, 2026",
    modeLabel: "Bar",
    children: null,
  },
  parameters: catalogParameters(catalogContract, {
    sourceDescription: `Source Figma node: [1963:1553](${FIGMA_NODE_URL}).`,
  }),
} satisfies Meta<typeof DashboardChartPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

async function expectSingleSeriesColor(canvasElement: HTMLElement) {
  const bars = Array.from(
    canvasElement.querySelectorAll<SVGPathElement>(
      ".recharts-bar-rectangle path",
    ),
  );

  await expect(new Set(bars.map((bar) => bar.getAttribute("fill")))).toEqual(
    new Set(["var(--color-visitors)"]),
  );
}

export const Interactive: Story = {
  render: () => <InteractiveChartPanel />,
  play: async ({ canvasElement }) => {
    await expectSingleSeriesColor(canvasElement);
  },
};

export const Ranking: Story = {
  render: () => <RankingChartPanel />,
  play: async ({ canvasElement }) => {
    await expectSingleSeriesColor(canvasElement);
  },
};

export const BottomAlignedContent: Story = {
  render: () => <BottomAlignedContentPanel />,
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>(
      'section[role="group"]',
    );
    const content = panel?.querySelector<HTMLElement>(
      '[data-slot="chart-panel-content"]',
    );
    const host = panel?.querySelector<HTMLElement>(
      '[data-testid="dashboard-bar-chart"]',
    );
    const surface = panel?.querySelector<SVGSVGElement>(".recharts-surface");

    await expect(content).not.toBeNull();
    await expect(host).not.toBeNull();
    await expect(surface).not.toBeNull();
    if (content && host && surface) {
      expect(host.getBoundingClientRect().height).toBeCloseTo(229, 0);
      expect(surface.getBoundingClientRect().height).toBeCloseTo(229, 0);
      expect(
        content.getBoundingClientRect().bottom -
          host.getBoundingClientRect().bottom,
      ).toBeCloseTo(0, 0);
      expect(
        content.getBoundingClientRect().bottom -
          surface.getBoundingClientRect().bottom,
      ).toBeCloseTo(0, 0);
    }
  },
};
