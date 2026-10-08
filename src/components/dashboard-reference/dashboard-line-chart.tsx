"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartActiveDot,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type DashboardLineChartDatum = {
  period: string;
} & Record<string, string | number | null>;

export type DashboardLineChartSeries = {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
};

export type DashboardLineChartAnnotation = {
  period: string;
  label: string;
  color: string;
  dashed?: boolean;
  emphasizeOnHover?: boolean;
  waypoint?: boolean;
};

export type DashboardLineChartProps = {
  ariaLabel: string;
  data: readonly DashboardLineChartDatum[];
  series: readonly DashboardLineChartSeries[];
  measureLabel: string;
  annotations?: readonly DashboardLineChartAnnotation[];
  tooltipValueSuffix?: string;
  xAxisTicks?: readonly string[];
  yDomain?: readonly [number, number];
};

const axisLabelStyle = {
  textAnchor: "middle",
  fill: "#737373",
  fontSize: 12,
} as const;

/**
 * Returns the marker width for an annotation at the active chart period.
 */
export function getDashboardAnnotationStrokeWidth(
  annotation: Pick<DashboardLineChartAnnotation, "period" | "emphasizeOnHover">,
  activePeriod: string | null,
) {
  return annotation.emphasizeOnHover && annotation.period === activePeriod
    ? 2
    : 1;
}

/**
 * Renders the approved Storybook line-chart treatment for measured time series.
 */
export function DashboardLineChart({
  ariaLabel,
  data,
  series,
  measureLabel,
  annotations = [],
  tooltipValueSuffix,
  xAxisTicks,
  yDomain,
}: DashboardLineChartProps) {
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const config = Object.fromEntries(
    series.map((item) => [item.key, { label: item.label, color: item.color }]),
  ) satisfies ChartConfig;
  const annotationOnlyPeriods = new Set(
    data
      .filter((datum) => series.every((item) => datum[item.key] == null))
      .map((datum) => datum.period),
  );
  const hasHoverEmphasis = annotations.some(
    (annotation) => annotation.emphasizeOnHover,
  );

  return (
    <div role="group" aria-label={ariaLabel} className="h-full w-full">
      <ChartContainer
        config={config}
        className="h-full w-full"
        initialDimension={{ width: 640, height: 320 }}
      >
        <LineChart
          data={[...data]}
          margin={{ top: 20, right: 24, bottom: 0, left: 12 }}
          onMouseMove={(state) => {
            setActivePeriod(
              state?.activeLabel == null ? null : String(state.activeLabel),
            );
          }}
          onMouseLeave={() => setActivePeriod(null)}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            ticks={xAxisTicks ? [...xAxisTicks] : undefined}
            tickFormatter={(value) =>
              annotationOnlyPeriods.has(String(value)) ? "" : String(value)
            }
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            domain={yDomain ? [...yDomain] : undefined}
            label={{
              value: measureLabel,
              angle: -90,
              position: "insideLeft",
              offset: 4,
              style: axisLabelStyle,
            }}
          />
          <ChartTooltip
            cursor={hasHoverEmphasis ? false : undefined}
            content={
              <ChartTooltipContent
                formatter={
                  tooltipValueSuffix
                    ? (value) => `${value}${tooltipValueSuffix}`
                    : undefined
                }
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {annotations.map((annotation) => (
            <ReferenceLine
              key={`${annotation.period}-${annotation.label}`}
              x={annotation.period}
              stroke={annotation.color}
              strokeWidth={getDashboardAnnotationStrokeWidth(
                annotation,
                activePeriod,
              )}
              strokeDasharray={annotation.dashed ? "6 6" : undefined}
              label={
                annotation.waypoint && yDomain
                  ? undefined
                  : {
                      value: annotation.label,
                      position: "insideTopRight",
                      fill: annotation.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }
              }
            />
          ))}
          {yDomain
            ? annotations
                .filter((annotation) => annotation.waypoint)
                .map((annotation) => (
                  <ReferenceDot
                    key={`${annotation.period}-${annotation.label}-waypoint`}
                    x={annotation.period}
                    y={yDomain[1]}
                    r={4}
                    fill={annotation.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    ifOverflow="visible"
                    label={{
                      value: annotation.label,
                      position: "top",
                      offset: 8,
                      fill: annotation.color,
                      fontSize: 11,
                      fontWeight: 600,
                      textAnchor: "middle",
                    }}
                  />
                ))
            : null}
          {series.map((item) => (
            <Line
              key={item.key}
              type="linear"
              dataKey={item.key}
              name={item.label}
              stroke={`var(--color-${item.key})`}
              strokeWidth={2}
              strokeDasharray={item.dashed ? "6 6" : undefined}
              dot={false}
              connectNulls
              isAnimationActive={false}
              activeDot={<ChartActiveDot color={`var(--color-${item.key})`} />}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
