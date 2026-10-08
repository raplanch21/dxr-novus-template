"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type DashboardBarChartDatum = {
  label: string;
  value: number;
};

export type DashboardBarChartProps = {
  ariaLabel: string;
  data: readonly DashboardBarChartDatum[];
  measureLabel: string;
  valueSuffix?: string;
};

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const axisLabelStyle = {
  textAnchor: "middle",
  fill: "#737373",
  fontSize: 12,
} as const;

function truncateAxisLabel(value: string, maxLength = 16) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1).trimEnd()}…`
    : value;
}

/**
 * Renders the approved Storybook single-series vertical-bar treatment.
 */
export function DashboardBarChart({
  ariaLabel,
  data,
  measureLabel,
  valueSuffix = "",
}: DashboardBarChartProps) {
  if (data.length > 6) {
    throw new Error("DashboardBarChart supports no more than six categories.");
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-testid="dashboard-bar-chart"
      className="h-full w-full"
    >
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-full w-full"
        initialDimension={{ width: 640, height: 320 }}
      >
        <BarChart
          data={[...data]}
          margin={{ top: 8, right: 12, bottom: 0, left: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            height={32}
            tickFormatter={(value) => truncateAxisLabel(String(value))}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            label={{
              value: measureLabel,
              angle: -90,
              position: "insideLeft",
              offset: 4,
              style: axisLabelStyle,
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) =>
                  `${Number(value).toLocaleString()}${valueSuffix}`
                }
              />
            }
          />
          <Bar
            dataKey="value"
            name={measureLabel}
            fill="var(--color-value)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
