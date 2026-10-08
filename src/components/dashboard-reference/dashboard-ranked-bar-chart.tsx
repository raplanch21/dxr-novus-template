"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type DashboardRankedBarChartDatum = {
  label: string;
  value: number;
};

export type DashboardRankedBarChartProps = {
  ariaLabel: string;
  data: readonly DashboardRankedBarChartDatum[];
  measureLabel: string;
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

/**
 * Renders the approved Storybook horizontal ranking treatment.
 */
export function DashboardRankedBarChart({
  ariaLabel,
  data,
  measureLabel,
}: DashboardRankedBarChartProps) {
  if (data.length > 10) {
    throw new Error(
      "DashboardRankedBarChart supports no more than ten categories.",
    );
  }

  const rankedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div role="group" aria-label={ariaLabel} className="h-full w-full">
      <ChartContainer
        config={chartConfig}
        className="h-full w-full"
        initialDimension={{ width: 640, height: 320 }}
      >
        <BarChart
          data={rankedData}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 24, left: 12 }}
          maxBarSize={32}
        >
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            label={{
              value: measureLabel,
              position: "insideBottom",
              offset: -12,
              style: axisLabelStyle,
            }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={160}
            interval={0}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="value"
            name={measureLabel}
            fill="var(--color-value)"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
