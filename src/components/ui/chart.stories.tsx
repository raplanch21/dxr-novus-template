import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardBarChart } from "@/components/dashboard-reference/dashboard-bar-chart";
import { DashboardLineChart } from "@/components/dashboard-reference/dashboard-line-chart";
import { DashboardRankedBarChart } from "@/components/dashboard-reference/dashboard-ranked-bar-chart";
import {
  ChartActiveDot,
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  catalogParameters,
  catalogStoryParameters,
  type DashboardCatalogContract,
} from "../dashboard-reference/story-docs";

const trendData = [
  { period: "May 4", activated: 1840, retained: 1290 },
  { period: "May 11", activated: 2010, retained: 1410 },
  { period: "May 18", activated: 1970, retained: 1460 },
  { period: "May 25", activated: 2280, retained: 1680 },
  { period: "Jun 1", activated: 2410, retained: 1810 },
] as const;

const categoryData = [
  { label: "Overview", value: 2840 },
  { label: "Product knowledge", value: 2190 },
  { label: "Session replay", value: 1370 },
  { label: "Integration settings", value: 0 },
] as const;

const actionTrendData = [
  {
    period: "Jul 12",
    viewNps: 54,
    askAgent: 52,
    viewAdoption: 36,
    viewDetails: 18,
  },
  {
    period: "Jul 19",
    viewNps: 57,
    askAgent: 48,
    viewAdoption: 47,
    viewDetails: 12,
  },
  {
    period: "Jul 26",
    viewNps: 58,
    askAgent: 50,
    viewAdoption: 21,
    viewDetails: 19,
  },
  {
    period: "Aug 2",
    viewNps: 72,
    askAgent: 59,
    viewAdoption: 34,
    viewDetails: 16,
  },
] as const;

const rankedActionData = [
  { label: "View NPS report", value: 241 },
  { label: "Ask Agent Mode", value: 198 },
  {
    label: "View visitor adoption report",
    value: 143,
  },
  { label: "View details", value: 96 },
] as const;

const trendConfig = {
  activated: {
    label: "Activated visitors",
    color: "var(--chart-1)",
  },
  retained: {
    label: "Retained visitors",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const actionTrendConfig = {
  viewNps: {
    label: "View NPS report",
    color: "var(--chart-1)",
  },
  askAgent: {
    label: "Ask Agent Mode",
    color: "var(--chart-2)",
  },
  viewAdoption: {
    label: "View visitor adoption report",
    color: "var(--chart-3)",
  },
  viewDetails: {
    label: "View details",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const chartPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
] as const;

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

function StoryFrame({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid w-full max-w-4xl gap-4">
      <header className="grid gap-1">
        <h2 className="text-[18px] leading-6 font-semibold text-[#0A0A0A]">
          {title}
        </h2>
        <p className="max-w-2xl text-[14.22px] leading-[1.5] text-[#2A2C35]">
          {summary}
        </p>
      </header>
      {children}
    </section>
  );
}

function Palette() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {chartPalette.map((color, index) => (
        <div
          key={color}
          className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] px-3 py-2"
        >
          <span
            aria-hidden
            className="size-3 shrink-0 rounded-[2px]"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-[12px] leading-[18px] text-[#737373]">
            Chart {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

function TrendLineChart() {
  return (
    <div className="h-72 w-full">
      <DashboardLineChart
        ariaLabel="Activated and retained visitor trends"
        data={trendData}
        series={[
          {
            key: "activated",
            label: "Activated visitors",
            color: "var(--chart-1)",
          },
          {
            key: "retained",
            label: "Retained visitors",
            color: "var(--chart-2)",
          },
        ]}
        measureLabel="Visitors"
      />
    </div>
  );
}

const chartFoundationContract = {
  id: "dashboard.chart-foundation",
  availability: "renderer-owned",
  summary:
    "Shared chart primitives used by the renderer to implement approved analytical chart types.",
  useWhen: [
    "The renderer builds a chart selected through an approved chart-type contract.",
  ],
  doNotUseWhen: [
    "The agent is selecting a dashboard block or assembling chart primitives directly.",
  ],
  requiredInputs: ["A validated approved chart specification."],
  rules: [
    "The renderer owns axes, gridlines, tooltips, legends, responsive sizing, and active states.",
    "Keep series colors stable across one dashboard.",
  ],
} satisfies DashboardCatalogContract;

const lineChartContract = {
  id: "dashboard.chart.line",
  availability: "selectable",
  summary:
    "Compares one or more numeric trends across the same measured time periods.",
  useWhen: [
    "The data is a time series with at least two measured periods.",
    "Continuity and change over time are the primary analytical question.",
  ],
  doNotUseWhen: [
    "The x-axis contains unordered categories.",
    "The data contains more than nine series.",
  ],
  requiredInputs: [
    "Ordered time values and one to nine numeric series.",
    "Stable identifiers and labels for every series.",
  ],
  rules: [
    "Use straight 2 px lines.",
    "Keep each series color stable across the dashboard.",
    "Open a half-width drill only for points that map to underlying records.",
  ],
} satisfies DashboardCatalogContract;

const areaChartContract = {
  id: "dashboard.chart.area",
  availability: "selectable",
  summary:
    "Shows one time-series trend when its zero-based magnitude matters as much as its direction.",
  useWhen: [
    "The data is one time series with at least two measured periods.",
    "The filled area helps communicate magnitude from a meaningful zero baseline.",
  ],
  doNotUseWhen: [
    "The chart would compare multiple series.",
    "A zero baseline would misrepresent the measure.",
  ],
  requiredInputs: ["Ordered time values and one numeric series."],
  rules: [
    "Render exactly one area series.",
    "Use a zero baseline and the series’ stable dashboard color.",
    "Open a half-width drill only for points that map to underlying records.",
  ],
} satisfies DashboardCatalogContract;

const barChartContract = {
  id: "dashboard.chart.bar",
  availability: "selectable",
  summary:
    "Compares one numeric measure across a small set of discrete categories.",
  useWhen: [
    "The data contains one measure across no more than six discrete categories.",
  ],
  doNotUseWhen: [
    "The data is a continuous time series.",
    "The comparison contains more than six categories; use the ranked horizontal chart or narrow the data.",
  ],
  requiredInputs: [
    "One to six category labels and one numeric value per category.",
  ],
  rules: [
    "Keep category labels horizontal and truncate only when necessary.",
    "Open a half-width drill only for bars that map to underlying records or one tracked item.",
  ],
} satisfies DashboardCatalogContract;

const groupedBarChartContract = {
  id: "dashboard.chart.grouped-bar",
  availability: "selectable",
  summary:
    "Compares multiple stable numeric series across the same discrete category groups.",
  useWhen: [
    "The analysis compares multiple series across no more than six category groups.",
  ],
  doNotUseWhen: [
    "The data contains more than six groups.",
    "The data contains more than nine series; reject grouped bars instead of repeating colors.",
  ],
  requiredInputs: [
    "One to six category groups and no more than nine comparable numeric series.",
    "Stable identifiers and labels for every series.",
  ],
  rules: [
    "Keep each series color stable across the dashboard.",
    "Use a visible legend for every series.",
    "Open a half-width drill only for bars that map to underlying records.",
  ],
} satisfies DashboardCatalogContract;

const rankedBarChartContract = {
  id: "dashboard.chart.ranked-bar",
  availability: "selectable",
  summary:
    "Ranks discrete categories by one numeric measure using horizontal bars and direct labels.",
  useWhen: [
    "The analysis needs an ordered ranking of no more than 10 categories.",
    "Category labels need more horizontal space than a vertical bar chart provides.",
  ],
  doNotUseWhen: [
    "The category order is not analytically meaningful.",
    "The data contains more than 10 categories.",
  ],
  requiredInputs: [
    "One to 10 category labels and one numeric value per category.",
  ],
  rules: [
    "Sort categories by the ranked measure.",
    "Keep series colors stable across the dashboard.",
    "Open a half-width drill only for bars that map to underlying records or one tracked item.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "UI/Chart",
  parameters: {
    ...catalogParameters(chartFoundationContract),
    layout: "padded",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <StoryFrame
      title="Chart styles and palette"
      summary="Shows the categorical palette, axes, gridlines, legend, and shared tooltip treatment used across Novus charts."
    >
      <Palette />
      <TrendLineChart />
    </StoryFrame>
  ),
};

export const LineChartReference: Story = {
  parameters: catalogStoryParameters(lineChartContract),
  render: () => (
    <StoryFrame
      title="Multi-series line chart"
      summary="Use straight 2 px lines to compare multiple trends across the same periods. The legend identifies each series."
    >
      <TrendLineChart />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const curves = Array.from(
      canvasElement.querySelectorAll<SVGPathElement>(".recharts-line-curve"),
    );

    await expect(curves).toHaveLength(2);
    curves.forEach((curve) => {
      expect(curve.getAttribute("d") ?? "").toContain("L");
      expect(curve.getAttribute("d") ?? "").not.toContain("C");
    });
  },
};

export const AreaChartWithVisibleTooltip: Story = {
  parameters: catalogStoryParameters(areaChartContract),
  render: () => (
    <StoryFrame
      title="Single-series area chart"
      summary="Use a light area fill to emphasize one trend. The visible tooltip and selected-period dot document the active state."
    >
      <ChartContainer config={trendConfig} className="h-72 w-full">
        <AreaChart
          data={trendData}
          margin={{ top: 8, right: 24, bottom: 0, left: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            label={yMeasureLabel("Visitors")}
          />
          <ChartTooltip
            active
            defaultIndex={4}
            content={<ChartTooltipContent />}
          />
          <Area
            type="linear"
            dataKey="activated"
            stroke="var(--color-activated)"
            strokeWidth={2}
            fill="var(--color-activated)"
            fillOpacity={0.12}
            activeDot={<ChartActiveDot color="var(--color-activated)" />}
          />
        </AreaChart>
      </ChartContainer>
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const areaCurve = canvasElement.querySelector<SVGPathElement>(
      ".recharts-area-curve",
    );
    const surface =
      canvasElement.querySelector<SVGSVGElement>(".recharts-surface");
    const finalTick = Array.from(
      canvasElement.querySelectorAll<SVGTextElement>(
        ".recharts-cartesian-axis-tick-value",
      ),
    ).find((label) => label.textContent === "Jun 1");

    await expect(areaCurve).not.toBeNull();
    await expect(areaCurve?.getAttribute("d") ?? "").toContain("L");
    await expect(areaCurve?.getAttribute("d") ?? "").not.toContain("C");
    await expect(areaCurve?.getAttribute("stroke-width")).toBe("2");
    await expect(finalTick).not.toBeUndefined();
    await expect(surface).not.toBeNull();
    await expect(
      canvasElement.querySelector('[data-slot="chart-active-dot"]'),
    ).not.toBeNull();
    await expect(
      canvasElement.querySelector('[data-slot="chart-active-dot"]'),
    ).toHaveAttribute("r", "5");
    await expect(
      canvasElement.querySelector('[data-slot="chart-active-dot"]'),
    ).toHaveAttribute("stroke", "#ffffff");

    if (finalTick && surface) {
      expect(finalTick.getBoundingClientRect().right).toBeLessThanOrEqual(
        surface.getBoundingClientRect().right,
      );
    }
  },
};

export const BarChartReference: Story = {
  parameters: catalogStoryParameters(barChartContract),
  render: () => (
    <StoryFrame
      title="Categorical bar chart"
      summary="Use vertical bars to compare categories. Long axis labels stay horizontal and truncate with an ellipsis."
    >
      <div className="h-72 w-full">
        <DashboardBarChart
          ariaLabel="Unique visitors by product area"
          data={categoryData}
          measureLabel="Visitors"
        />
      </div>
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const tickLabels = Array.from(
      canvasElement.querySelectorAll<SVGTextElement>(
        ".recharts-cartesian-axis-tick-value",
      ),
    );
    const labels = tickLabels.map((label) => label.textContent);
    const chartHost = canvasElement.querySelector<HTMLElement>(
      '[data-testid="dashboard-bar-chart"]',
    );
    const chartContainer = chartHost?.querySelector<HTMLElement>(
      '[data-slot="chart"]',
    );
    const responsiveContainer = chartHost?.querySelector<HTMLElement>(
      ".recharts-responsive-container",
    );
    const surface =
      chartHost?.querySelector<SVGSVGElement>(".recharts-surface");
    const grid = chartHost?.querySelector<SVGGElement>(
      ".recharts-cartesian-grid",
    );

    await expect(labels).toContain("Product knowled…");
    await expect(labels).toContain("Integration set…");
    tickLabels.forEach((label) => {
      expect(label.getAttribute("transform") ?? "").not.toContain("rotate");
    });
    await expect(chartHost).not.toBeNull();
    await expect(chartContainer).not.toBeNull();
    await expect(responsiveContainer).not.toBeNull();
    await expect(surface).not.toBeNull();
    await expect(grid).not.toBeNull();
    if (chartHost && chartContainer && responsiveContainer && surface && grid) {
      expect(getComputedStyle(chartContainer).aspectRatio).toBe("auto");
      expect(chartContainer.getBoundingClientRect().height).toBeCloseTo(
        chartHost.getBoundingClientRect().height,
        0,
      );
      expect(responsiveContainer.getBoundingClientRect().height).toBeCloseTo(
        chartHost.getBoundingClientRect().height,
        0,
      );
      expect(surface.getBoundingClientRect().height).toBeCloseTo(
        chartHost.getBoundingClientRect().height,
        0,
      );
      expect(
        surface.getBoundingClientRect().bottom -
          grid.getBoundingClientRect().bottom,
      ).toBeCloseTo(32, 0);
    }
  },
};

export const GroupedBarChartReference: Story = {
  parameters: catalogStoryParameters(groupedBarChartContract),
  render: () => (
    <StoryFrame
      title="Grouped multi-series bar chart"
      summary="Compares stable action series across the same weekly periods."
    >
      <ChartContainer config={actionTrendConfig} className="h-80 w-full">
        <BarChart
          data={actionTrendData}
          margin={{ top: 8, right: 12, bottom: 24, left: 12 }}
          barGap={2}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            label={yMeasureLabel("Events")}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="viewNps"
            fill="var(--color-viewNps)"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="askAgent"
            fill="var(--color-askAgent)"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="viewAdoption"
            fill="var(--color-viewAdoption)"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="viewDetails"
            fill="var(--color-viewDetails)"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const bars = Array.from(
      canvasElement.querySelectorAll<SVGPathElement>(
        ".recharts-bar-rectangle path",
      ),
    );
    const fills = new Set(bars.map((bar) => bar.getAttribute("fill")));

    await expect(fills).toEqual(
      new Set([
        "var(--color-viewNps)",
        "var(--color-askAgent)",
        "var(--color-viewAdoption)",
        "var(--color-viewDetails)",
      ]),
    );
    await expect(canvasElement).toHaveTextContent("View NPS report");
    await expect(canvasElement).toHaveTextContent("Ask Agent Mode");
    await expect(canvasElement).toHaveTextContent(
      "View visitor adoption report",
    );
    await expect(canvasElement).toHaveTextContent("View details");
  },
};

export const HorizontalRankedBarChart: Story = {
  parameters: catalogStoryParameters(rankedBarChartContract),
  render: () => (
    <StoryFrame
      title="Horizontal ranked action chart"
      summary="Ranks actions by event count with stable categorical colors and direct labels."
    >
      <div className="h-80 w-full">
        <DashboardRankedBarChart
          ariaLabel="Actions ranked by event count"
          data={rankedActionData}
          measureLabel="Events"
        />
      </div>
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const labels = Array.from(
      canvasElement.querySelectorAll<SVGTextElement>(
        ".recharts-cartesian-axis-tick-value",
      ),
    )
      .map((label) => label.textContent ?? "")
      .filter((label) => Number.isNaN(Number(label)));
    const bars = Array.from(
      canvasElement.querySelectorAll<SVGPathElement>(
        ".recharts-bar-rectangle path",
      ),
    );

    await expect(labels).toEqual([
      "View NPS report",
      "Ask Agent Mode",
      "View visitor adoption report",
      "View details",
    ]);
    await expect(
      bars.every(
        (bar) =>
          Number(bar.getAttribute("width")) >
          Number(bar.getAttribute("height")),
      ),
    ).toBe(true);
    await expect(
      new Set(bars.map((bar) => bar.getAttribute("fill"))).size,
    ).toBe(1);
  },
};

export const HalfWidth: Story = {
  render: () => (
    <div className="w-full max-w-[522px]">
      <StoryFrame
        title="Half-width line chart"
        summary="Shows how the chart fills the dashboard's 522 px half-width column without clipping its final period."
      >
        <TrendLineChart />
      </StoryFrame>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The heading and explanation document this Storybook example; only the chart inside them represents the chart component.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("h2")).not.toBeNull();
    const surface =
      canvasElement.querySelector<SVGSVGElement>(".recharts-surface");
    const finalTick = Array.from(
      canvasElement.querySelectorAll<SVGTextElement>(
        ".recharts-cartesian-axis-tick-value",
      ),
    ).find((label) => label.textContent === "Jun 1");

    await expect(surface).not.toBeNull();
    await expect(finalTick).not.toBeUndefined();
    if (surface && finalTick) {
      expect(finalTick.getBoundingClientRect().right).toBeLessThanOrEqual(
        surface.getBoundingClientRect().right,
      );
    }
  },
};
