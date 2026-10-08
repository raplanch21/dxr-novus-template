"use client";

import { useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import {
  ChartActiveDot,
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipPanel,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export type DashboardGoalTimelineObservation = {
  date: string;
  value: number;
};

export type DashboardGoalTimelineTarget = {
  date: string;
  value: number;
  label: string;
};

export type DashboardGoalTimelineEvent = {
  date: string;
  label: string;
  description?: string;
};

type ParsedObservation = DashboardGoalTimelineObservation & {
  timestamp: number;
};

type ParsedEvent = DashboardGoalTimelineEvent & {
  timestamp: number;
};

export type DashboardGoalTimelineEventSummary = {
  timestamp: number;
  value: number;
  periodStartTimestamp?: number;
  events: ParsedEvent[];
};

export type DashboardGoalTimelinePoint = {
  timestamp: number;
  actual?: number;
  required?: number;
};

export type DashboardGoalTimelineData = {
  observations: ParsedObservation[];
  target: DashboardGoalTimelineTarget & { timestamp: number };
  events: ParsedEvent[];
  eventSummaries: DashboardGoalTimelineEventSummary[];
  points: DashboardGoalTimelinePoint[];
};

export type BuildDashboardGoalTimelineDataInput = {
  observations: readonly DashboardGoalTimelineObservation[];
  target: DashboardGoalTimelineTarget;
  events?: readonly DashboardGoalTimelineEvent[];
};

export type DashboardGoalTimelineProps = BuildDashboardGoalTimelineDataInput & {
  ariaLabel: string;
  valueFormatter?: (value: number) => string;
  className?: string;
};

const chartConfig = {
  actual: {
    label: "Actual",
    color: "var(--chart-1)",
  },
  required: {
    label: "Required pace",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const chartConfigWithPullRequests = {
  ...chartConfig,
  plotValue: {
    label: "Merged PRs",
    color: "var(--foreground)",
  },
} satisfies ChartConfig;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function parseTimestamp(date: string) {
  const timestamp = Date.parse(date);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function defaultValueFormatter(value: number) {
  return value.toLocaleString();
}

const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

export type DashboardGoalTimelinePeriod = {
  label: string;
  startTimestamp: number;
  endTimestamp: number;
  timestamp: number;
};

/**
 * Divides the complete timeline into consecutive reporting weeks. The final
 * period is shortened when the timeline does not end on a weekly boundary.
 */
export function getDashboardGoalTimelinePeriods([
  startTimestamp,
  endTimestamp,
]: [number, number]): DashboardGoalTimelinePeriod[] {
  if (
    !Number.isFinite(startTimestamp) ||
    !Number.isFinite(endTimestamp) ||
    endTimestamp <= startTimestamp
  ) {
    return [];
  }

  const periods: DashboardGoalTimelinePeriod[] = [];
  let periodStartTimestamp = startTimestamp;

  while (periodStartTimestamp < endTimestamp) {
    const periodEndTimestamp = Math.min(
      periodStartTimestamp + WEEK_IN_MILLISECONDS,
      endTimestamp,
    );

    periods.push({
      label: `Week ${periods.length + 1}`,
      startTimestamp: periodStartTimestamp,
      endTimestamp: periodEndTimestamp,
      timestamp:
        periodStartTimestamp + (periodEndTimestamp - periodStartTimestamp) / 2,
    });
    periodStartTimestamp = periodEndTimestamp;
  }

  return periods;
}

/**
 * Produces stable, rounded y-axis ticks instead of Recharts' irregular
 * automatic intervals.
 */
export function getDashboardGoalTimelineTicks([minimum, maximum]: [
  number,
  number,
]) {
  if (
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum) ||
    maximum <= minimum
  ) {
    return [minimum];
  }

  const roughStep = (maximum - minimum) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;
  const roundedStep =
    normalizedStep <= 1
      ? 1
      : normalizedStep <= 2
        ? 2
        : normalizedStep <= 5
          ? 5
          : 10;
  const step = roundedStep * magnitude;
  const firstTick = Math.ceil(minimum / step) * step;
  const ticks: number[] = [];

  for (let value = firstTick; value <= maximum; value += step) {
    ticks.push(Number(value.toPrecision(12)));
  }

  return ticks;
}

type GoalTimelineTooltipPayloadItem = {
  dataKey?: unknown;
  payload?: {
    actual?: unknown;
    required?: unknown;
    timestamp?: unknown;
  };
};

/**
 * Removes the duplicate required-pace row where the projection is anchored to
 * the latest actual observation.
 */
export function filterDashboardGoalTimelineTooltipPayload<
  T extends GoalTimelineTooltipPayloadItem,
>(payload: readonly T[] | undefined) {
  return payload?.filter((item) => {
    if (item.dataKey === "timestamp" || item.dataKey === "plotValue") {
      return false;
    }

    return !(
      item.dataKey === "required" &&
      item.payload?.actual !== undefined &&
      item.payload.actual !== null
    );
  });
}

/**
 * Normalizes dated goal observations into the solid actual series and the
 * two-point required-pace series used by the timeline chart.
 */
export function buildDashboardGoalTimelineData({
  observations,
  target,
  events = [],
}: BuildDashboardGoalTimelineDataInput): DashboardGoalTimelineData | null {
  const targetTimestamp = parseTimestamp(target.date);
  if (targetTimestamp === null || !Number.isFinite(target.value)) {
    return null;
  }

  const parsedObservations = observations
    .flatMap((observation) => {
      const timestamp = parseTimestamp(observation.date);
      return timestamp === null || !Number.isFinite(observation.value)
        ? []
        : [{ ...observation, timestamp }];
    })
    .sort((left, right) => left.timestamp - right.timestamp);

  if (parsedObservations.length === 0) {
    return null;
  }

  const parsedEvents = events
    .flatMap((event) => {
      const timestamp = parseTimestamp(event.date);
      return timestamp === null ? [] : [{ ...event, timestamp }];
    })
    .sort((left, right) => left.timestamp - right.timestamp);
  const eventSummaries = parsedObservations.flatMap(
    (observation, observationIndex) => {
      const periodStartTimestamp =
        parsedObservations[observationIndex - 1]?.timestamp;
      const periodEvents = parsedEvents.filter(
        (event) =>
          event.timestamp <= observation.timestamp &&
          (periodStartTimestamp === undefined ||
            event.timestamp > periodStartTimestamp),
      );

      return periodEvents.length === 0
        ? []
        : [
            {
              timestamp: observation.timestamp,
              value: observation.value,
              ...(periodStartTimestamp === undefined
                ? {}
                : { periodStartTimestamp }),
              events: periodEvents,
            },
          ];
    },
  );

  const latestObservation = parsedObservations.at(-1)!;
  const points: DashboardGoalTimelinePoint[] = parsedObservations.map(
    ({ timestamp, value }) => ({
      timestamp,
      actual: value,
      ...(timestamp === latestObservation.timestamp ? { required: value } : {}),
    }),
  );

  points.push({
    timestamp: targetTimestamp,
    required: target.value,
  });
  points.sort((left, right) => left.timestamp - right.timestamp);

  return {
    observations: parsedObservations,
    target: { ...target, timestamp: targetTimestamp },
    events: parsedEvents,
    eventSummaries,
    points,
  };
}

function TimelineLegend() {
  return (
    <div
      aria-label="Goal timeline legend"
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.64px] leading-[1.5] text-muted-foreground"
    >
      <span className="flex items-center gap-2">
        <span className="w-6 border-t-2 border-foreground" aria-hidden />
        Actual
      </span>
      <span className="flex items-center gap-2">
        <span
          className="w-6 border-t-2 border-dashed border-foreground"
          aria-hidden
        />
        Required pace
      </span>
      <span className="flex items-center gap-2">
        <span className="w-6 border-t-2 border-border" aria-hidden />
        Target
      </span>
      <span className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-foreground" aria-hidden />
        Merged PRs
      </span>
    </div>
  );
}

function PullRequestPeriodTooltip({
  summary,
  valueFormatter,
}: {
  summary: DashboardGoalTimelineEventSummary;
  valueFormatter: (value: number) => string;
}) {
  return (
    <ChartTooltipPanel
      className="max-w-[360px]"
      title={
        summary.periodStartTimestamp === undefined
          ? `Through ${dateFormatter.format(summary.timestamp)}`
          : dateFormatter.formatRange(
              summary.periodStartTimestamp,
              summary.timestamp,
            )
      }
      rows={[
        {
          label: "Actual",
          value: valueFormatter(summary.value),
        },
        {
          label: "Merged PRs",
          value: summary.events.length,
        },
        ...summary.events.map((event) => ({
          id: `${event.timestamp}-${event.label}`,
          label: (
            <span className="font-semibold text-foreground">{event.label}</span>
          ),
          value: (
            <span className="max-w-[240px] whitespace-normal text-left font-sans font-normal">
              {event.description ?? ""}
            </span>
          ),
        })),
      ]}
    />
  );
}

function MeasuredPeriodTooltip({
  observation,
  eventSummary,
  valueFormatter,
}: {
  observation: ParsedObservation;
  eventSummary?: DashboardGoalTimelineEventSummary;
  valueFormatter: (value: number) => string;
}) {
  if (eventSummary) {
    return (
      <PullRequestPeriodTooltip
        summary={eventSummary}
        valueFormatter={valueFormatter}
      />
    );
  }

  return (
    <ChartTooltipPanel
      title={dateFormatter.format(observation.timestamp)}
      rows={[
        {
          label: "Actual",
          value: valueFormatter(observation.value),
        },
      ]}
    />
  );
}

/**
 * Plots dated goal observations, the straight-line pace required to reach a
 * confirmed target, and neutral delivery markers that communicate timing only.
 */
export function DashboardGoalTimeline({
  ariaLabel,
  observations,
  target,
  events = [],
  valueFormatter = defaultValueFormatter,
  className,
}: DashboardGoalTimelineProps) {
  const [activeObservation, setActiveObservation] = useState<{
    observation: ParsedObservation & { plotValue: number };
    eventSummary?: DashboardGoalTimelineEventSummary;
    coordinate: { x: number; y: number };
  } | null>(null);
  const timeline = buildDashboardGoalTimelineData({
    observations,
    target,
    events,
  });

  if (!timeline) {
    return (
      <div
        role="status"
        className={cn(
          "rounded-lg border border-dashed border-border p-4 text-[14.22px] leading-[1.5] text-muted-foreground",
          className,
        )}
      >
        Goal timeline unavailable because no valid observations were provided.
      </div>
    );
  }

  const values = [
    ...timeline.observations.map(({ value }) => value),
    timeline.target.value,
  ];
  const minimumValue = Math.min(0, ...values);
  const maximumValue = Math.max(0, ...values);
  const padding = Math.max((maximumValue - minimumValue) * 0.1, 1);
  const yDomain: [number, number] = [
    minimumValue < 0 ? Math.floor(minimumValue - padding) : 0,
    Math.ceil(maximumValue + padding),
  ];
  const xDomain: [number, number] = [
    Math.min(timeline.observations[0].timestamp, timeline.target.timestamp),
    Math.max(
      timeline.observations.at(-1)!.timestamp,
      timeline.target.timestamp,
    ),
  ];
  const periods = getDashboardGoalTimelinePeriods(xDomain);
  const periodLabelsByTimestamp = new Map(
    periods.map(({ timestamp, label }) => [timestamp, label]),
  );
  const yTicks = getDashboardGoalTimelineTicks(yDomain);
  const eventSummariesByTimestamp = new Map(
    timeline.eventSummaries.map((summary) => [summary.timestamp, summary]),
  );
  const firstObservation = timeline.observations[0];
  const latestObservation = timeline.observations.at(-1)!;
  const actualSummary =
    timeline.observations.length === 1
      ? `${valueFormatter(firstObservation.value)} on ${dateFormatter.format(firstObservation.timestamp)}`
      : `${valueFormatter(firstObservation.value)} on ${dateFormatter.format(firstObservation.timestamp)} → ${valueFormatter(latestObservation.value)} on ${dateFormatter.format(latestObservation.timestamp)}`;
  const targetSummary = `${valueFormatter(timeline.target.value)} by ${dateFormatter.format(timeline.target.timestamp)}`;
  const plottedEventSummaries = timeline.eventSummaries.map((summary) => ({
    ...summary,
    plotValue: summary.value,
  }));
  const plottedObservations = timeline.observations.map((observation) => ({
    ...observation,
    plotValue: observation.value,
  }));

  return (
    <section
      role="group"
      aria-label={ariaLabel}
      className={cn("grid min-w-0 gap-3", className)}
    >
      <p className="text-[14.22px] leading-[1.5] text-[#2A2C35]">
        <span className="font-semibold text-foreground">Actual:</span>{" "}
        {actualSummary}
        <span aria-hidden> · </span>
        <span className="font-semibold text-foreground">Target:</span>{" "}
        {targetSummary}
      </p>

      <div className="relative">
        <ChartContainer
          config={chartConfigWithPullRequests}
          className="h-64 min-h-[224px] w-full"
        >
          <ComposedChart
            accessibilityLayer
            data={timeline.points}
            margin={{ top: 8, right: 24, bottom: 0, left: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={xDomain}
              ticks={periods.map(({ timestamp }) => timestamp)}
              tickFormatter={(timestamp) =>
                periodLabelsByTimestamp.get(Number(timestamp)) ?? ""
              }
              minTickGap={12}
              tickMargin={8}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickFormatter={(value) => valueFormatter(Number(value))}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <ZAxis zAxisId="observation-hit-target" range={[576, 576]} />
            <ChartTooltip
              content={(tooltipProps) => {
                if (activeObservation) {
                  return null;
                }

                const timestamp = tooltipProps.payload?.find(
                  (item) => typeof item.payload?.timestamp === "number",
                )?.payload?.timestamp;
                const eventSummary =
                  typeof timestamp === "number"
                    ? eventSummariesByTimestamp.get(timestamp)
                    : undefined;

                if (eventSummary) {
                  return (
                    <PullRequestPeriodTooltip
                      summary={eventSummary}
                      valueFormatter={valueFormatter}
                    />
                  );
                }

                return (
                  <ChartTooltipContent
                    active={tooltipProps.active}
                    label={tooltipProps.label}
                    payload={filterDashboardGoalTimelineTooltipPayload(
                      tooltipProps.payload,
                    )}
                    labelFormatter={(_label, payload) => {
                      const payloadTimestamp = payload?.[0]?.payload?.timestamp;
                      return typeof payloadTimestamp === "number"
                        ? dateFormatter.format(payloadTimestamp)
                        : "";
                    }}
                    formatter={(value) => valueFormatter(Number(value))}
                  />
                );
              }}
            />
            <ReferenceLine
              className="dashboard-goal-timeline__target"
              y={timeline.target.value}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeOpacity={0.65}
              strokeWidth={1}
              label={{
                value: timeline.target.label,
                position: "insideTopRight",
                fill: "var(--foreground)",
                fontSize: 12,
              }}
            />
            <Line
              className="dashboard-goal-timeline__actual"
              type="linear"
              dataKey="actual"
              stroke="var(--color-actual)"
              strokeWidth={2}
              dot={false}
              activeDot={<ChartActiveDot color="var(--color-actual)" />}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              className="dashboard-goal-timeline__required"
              type="linear"
              dataKey="required"
              stroke="var(--color-required)"
              strokeWidth={2}
              strokeDasharray="8 6"
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Scatter
              className="dashboard-goal-timeline__pr-events"
              data={plottedEventSummaries}
              dataKey="plotValue"
              fill="var(--color-plotValue)"
              isAnimationActive={false}
              pointerEvents="none"
              tooltipType="none"
            />
            <Scatter
              className="dashboard-goal-timeline__actual-hit-targets"
              data={plottedObservations}
              dataKey="plotValue"
              fill="transparent"
              isAnimationActive={false}
              tooltipType="none"
              zAxisId="observation-hit-target"
              onMouseEnter={(point) => {
                if (
                  point.cx === undefined ||
                  point.cy === undefined ||
                  !point.payload
                ) {
                  return;
                }

                const observation = point.payload as ParsedObservation & {
                  plotValue: number;
                };

                setActiveObservation({
                  observation,
                  eventSummary: eventSummariesByTimestamp.get(
                    observation.timestamp,
                  ),
                  coordinate: { x: point.cx, y: point.cy },
                });
              }}
              onMouseLeave={() => setActiveObservation(null)}
            />
          </ComposedChart>
        </ChartContainer>
        {activeObservation ? (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full pb-2"
            style={{
              left: activeObservation.coordinate.x,
              top: activeObservation.coordinate.y,
            }}
          >
            <MeasuredPeriodTooltip
              observation={activeObservation.observation}
              eventSummary={activeObservation.eventSummary}
              valueFormatter={valueFormatter}
            />
          </div>
        ) : null}
      </div>

      {timeline.eventSummaries.length > 0 ? (
        <ul className="sr-only">
          {timeline.eventSummaries.map((summary) => (
            <li key={summary.timestamp}>
              {summary.events.length} merged pull{" "}
              {summary.events.length === 1 ? "request" : "requests"} for the
              observation on {dateFormatter.format(summary.timestamp)}:{" "}
              {summary.events
                .map(
                  (event) =>
                    `${event.label}${event.description ? `, ${event.description}` : ""}`,
                )
                .join("; ")}
            </li>
          ))}
        </ul>
      ) : null}

      <TimelineLegend />
    </section>
  );
}
