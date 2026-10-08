"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export type GoalProgressPoint = {
  date: string;
  value: number;
};

export type GoalProgressHypothesis = {
  confidence: "Early signal" | "Medium confidence" | "High confidence";
  headline: string;
  evidence: string;
  action: string;
};

export type GoalProgressShippedWork = {
  date: string;
  prNumber: number;
  title: string;
  hypothesis: GoalProgressHypothesis;
};

export type DashboardGoalProgressChartProps = {
  ariaLabel: string;
  goalName: string;
  metric: string;
  unit: string;
  direction: "increase" | "decrease";
  startDate: string;
  today: string;
  endDate: string;
  target: number;
  actual: readonly GoalProgressPoint[];
  shippedWork: readonly GoalProgressShippedWork[];
  source: string;
  projectionFloor?: number;
  projectionCeiling?: number;
};

type ChartDatum = {
  timestamp: number;
  actual: number | null;
  required: number | null;
  projection: number | null;
};

type TimelineTick = {
  date: Date;
  isToday: boolean;
  left: number;
  showOnCompact: boolean;
};

const DAY_MS = 86_400_000;
const PLOT_LEFT_CLASS = "ml-[76px]";
const confidenceRank: Record<GoalProgressHypothesis["confidence"], number> = {
  "Early signal": 1,
  "Medium confidence": 2,
  "High confidence": 3,
};
const chartConfig = {
  actual: { label: "Actual", color: "var(--chart-1)" },
  required: { label: "Required pace", color: "var(--chart-4)" },
  projection: { label: "Projection", color: "var(--chart-9)" },
} satisfies ChartConfig;

/**
 * Connects measured goal progress with goal-linked delivery evidence.
 */
export function DashboardGoalProgressChart({
  ariaLabel,
  goalName,
  metric,
  unit,
  direction,
  startDate,
  today,
  endDate,
  target,
  actual,
  shippedWork,
  source,
  projectionFloor = Number.NEGATIVE_INFINITY,
  projectionCeiling = Number.POSITIVE_INFINITY,
}: DashboardGoalProgressChartProps) {
  const sortedActual = useMemo(
    () =>
      [...actual].sort(
        (left, right) =>
          parseDate(left.date).getTime() - parseDate(right.date).getTime(),
      ),
    [actual],
  );
  const defaultWork = useMemo(
    () => selectDefaultWork(shippedWork),
    [shippedWork],
  );
  const [selected, setSelected] = useState<GoalProgressShippedWork | null>(
    defaultWork,
  );
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!hasValidRange(startDate, today, endDate) || sortedActual.length === 0) {
    return <GoalProgressUnavailable ariaLabel={ariaLabel} source={source} />;
  }

  const start = parseDate(startDate);
  const currentDate = parseDate(today);
  const end = parseDate(endDate);
  const current = sortedActual.at(-1);
  const projection = projectValue(
    sortedActual,
    endDate,
    projectionFloor,
    projectionCeiling,
  );
  const chartData = buildChartData(sortedActual, endDate, target, projection);
  const yDomain = createYDomain(
    sortedActual,
    target,
    projection,
    projectionFloor,
    projectionCeiling,
  );
  const days = createDays(start, end);
  const workByDate = groupWorkByDate(shippedWork);
  const totalDays = Math.max(1, daysBetween(start, end));
  const weekCount = Math.max(2, Math.ceil((totalDays + 1) / 7));
  const selectedValue = selected ? valueAt(selected.date, sortedActual) : null;
  const projectionGap =
    projection === null ? null : formatGap(target, projection, direction, unit);
  const timelineTicks = createTimelineTicks(start, currentDate, end, weekCount);
  const todayLeft = timelineLeft(currentDate, start, end);
  const currentTop = current ? plotTop(current.value, yDomain) : 0;
  const targetTop = plotTop(target, yDomain);
  const projectionTop =
    projection === null ? null : plotTop(projection, yDomain);
  const gapTop =
    projection === null ? null : plotTop((target + projection) / 2, yDomain);
  const plotRight = compact ? 24 : 64;

  return (
    <div role="group" aria-label={ariaLabel} className="flex min-h-0 flex-col">
      <p className="sr-only">
        {goalName}. {metric} from {formatLongDate(start)} to{" "}
        {formatLongDate(end)}.
      </p>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[30px] right-6 bottom-[54px] left-[76px] z-10 sm:right-16"
        >
          <span
            data-testid="shared-today-line"
            className="absolute top-0 bottom-0 border-l border-dashed border-[#DADCE5]"
            style={{ left: `${todayLeft}%` }}
          />
        </div>

        <div className="relative h-[300px] min-h-0">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full"
            initialDimension={{ width: 900, height: 300 }}
          >
            <ComposedChart
              data={chartData}
              margin={{ top: 30, right: plotRight, bottom: 8, left: 16 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                type="number"
                dataKey="timestamp"
                domain={[start.getTime(), end.getTime()]}
                scale="time"
                tick={false}
                tickLine={false}
                axisLine={false}
                height={0}
              />
              <YAxis
                domain={yDomain}
                tickFormatter={(value) => formatValue(Number(value), unit)}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={60}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="linear"
                dataKey="actual"
                name="Actual"
                fill="var(--chart-1)"
                fillOpacity={0.12}
                stroke="none"
                baseValue={yDomain[0]}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="actual"
                name="Actual"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="required"
                name="Required pace"
                stroke="var(--chart-4)"
                strokeWidth={3}
                strokeDasharray="9 7"
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              {projection !== null ? (
                <Line
                  type="linear"
                  dataKey="projection"
                  name="Projection"
                  stroke="var(--chart-9)"
                  strokeWidth={3}
                  strokeDasharray="2 7"
                  strokeLinecap="round"
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ) : null}
              {current ? (
                <ReferenceDot
                  x={parseDate(current.date).getTime()}
                  y={current.value}
                  r={4}
                  fill="white"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                />
              ) : null}
              <ReferenceDot
                x={end.getTime()}
                y={target}
                r={4}
                fill="var(--chart-4)"
                stroke="var(--chart-4)"
              />
              {projection !== null ? (
                <ReferenceDot
                  x={end.getTime()}
                  y={projection}
                  r={4}
                  fill="var(--chart-9)"
                  stroke="var(--chart-9)"
                />
              ) : null}
              {selected && selectedValue !== null ? (
                <ReferenceDot
                  x={parseDate(selected.date).getTime()}
                  y={selectedValue}
                  r={5}
                  fill="white"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                />
              ) : null}
            </ComposedChart>
          </ChartContainer>

          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-6 bottom-0 left-[76px] sm:right-16"
          >
            {current ? (
              <span
                className="absolute text-[11px] font-semibold whitespace-nowrap text-[var(--chart-1)]"
                style={{
                  left: `${timelineLeft(parseDate(current.date), start, end)}%`,
                  top: currentTop,
                  transform: "translate(-100%, -22px)",
                }}
              >
                {formatValue(current.value, unit)} today
              </span>
            ) : null}
            <span
              className="absolute text-[11px] font-semibold whitespace-nowrap text-[var(--chart-4)]"
              style={{
                left: "100%",
                top: targetTop,
                transform: "translate(-100%, -22px)",
              }}
            >
              {formatValue(target, unit)} target
            </span>
            {projection !== null && projectionTop !== null ? (
              <span
                className="absolute text-[11px] font-semibold whitespace-nowrap text-[var(--chart-9)]"
                style={{
                  left: "100%",
                  top: projectionTop,
                  transform: "translate(-100%, 5px)",
                }}
              >
                {formatValue(projection, unit)} projected
              </span>
            ) : (
              <span className="absolute right-0 bottom-1 text-[11px] font-semibold whitespace-nowrap text-[#737373]">
                Projection unavailable
              </span>
            )}
            {projectionGap && gapTop !== null ? (
              <span
                className="absolute text-[10px] font-semibold whitespace-nowrap text-[#2A2C35]"
                style={{
                  left: "100%",
                  top: gapTop,
                  transform: "translate(-100%, -50%)",
                }}
              >
                {projectionGap}
              </span>
            ) : null}
          </div>
        </div>

        <section className="border-t border-[#E5E5E5] pt-4">
          <h4 className="text-[12.64px] leading-[1.5] font-semibold text-[#0A0A0A]">
            Goal-linked pull requests merged by week
          </h4>
          <div
            role="grid"
            aria-label="Merged pull requests on the goal timeline"
            className={cn(
              PLOT_LEFT_CLASS,
              "relative mt-3 mr-6 h-[126px] sm:mr-16",
            )}
          >
            {[
              { label: "Sun", top: 0 },
              { label: "Tue", top: 36 },
              { label: "Thu", top: 72 },
              { label: "Sat", top: 108 },
            ].map((weekday) => (
              <span
                key={weekday.label}
                aria-hidden
                className="absolute -left-12 w-9 text-right text-[10px] leading-[14px] text-[#737373]"
                style={{ top: weekday.top }}
              >
                {weekday.label}
              </span>
            ))}
            {days.map((date) => {
              const key = dateKey(date);
              const items =
                date > currentDate ? [] : (workByDate.get(key) ?? []);
              const future = date > currentDate;
              const selectedDate = Boolean(
                selected &&
                items.some((item) => item.prNumber === selected.prNumber),
              );
              const weekIndex = Math.min(
                weekCount - 1,
                Math.floor(daysBetween(start, date) / 7),
              );

              return (
                <ActivityCell
                  key={key}
                  date={date}
                  items={items}
                  future={future}
                  selected={selectedDate}
                  left={(weekIndex / (weekCount - 1)) * 100}
                  top={date.getDay() * 18}
                  onSelect={setSelected}
                />
              );
            })}
          </div>
        </section>

        <TimelineAxis ticks={timelineTicks} />
      </div>

      <HypothesisPanel
        selected={selected}
        projectionAvailable={projection !== null}
      />

      <p className="mt-4 border-t border-[#E5E5E5] pt-3 text-[12px] leading-[18px] text-[#737373]">
        {source}
      </p>
    </div>
  );
}

/**
 * Renders the goal-progress series legend for chart-panel headers.
 */
export function DashboardGoalProgressLegend() {
  return (
    <div
      aria-label="Chart legend"
      className="flex flex-wrap items-center justify-end gap-4"
    >
      <LegendItem label="Actual" color="var(--chart-1)" />
      <LegendItem label="Required pace" color="var(--chart-4)" dashed />
      <LegendItem label="Projection" color="var(--chart-9)" dotted />
    </div>
  );
}

function TimelineAxis({ ticks }: { ticks: readonly TimelineTick[] }) {
  return (
    <div
      aria-label="Shared weekly timeline"
      className={cn(PLOT_LEFT_CLASS, "relative mr-6 h-[54px] pt-3 sm:mr-16")}
    >
      <span
        aria-hidden
        className="absolute top-3 right-0 left-0 border-t border-[#E5E5E5]"
      />
      {ticks.map((tick) => (
        <span
          key={`${tick.date.toISOString()}-${tick.isToday}`}
          className={cn(
            "absolute top-3 text-[10px] whitespace-nowrap text-[#737373]",
            !tick.showOnCompact && "hidden sm:block",
          )}
          style={{
            left: `${tick.left}%`,
            transform:
              tick.left === 0
                ? "none"
                : tick.left === 100
                  ? "translateX(-100%)"
                  : "translateX(-50%)",
          }}
        >
          <span
            aria-hidden
            className={cn(
              "mx-auto block h-1.5 w-px bg-[#737373]",
              tick.isToday && "h-2 bg-[var(--chart-1)]",
            )}
          />
          <span
            className={cn(
              "mt-1 block",
              tick.isToday && "font-semibold text-[#2A2C35]",
            )}
          >
            {tick.isToday
              ? `Today · ${formatShortDate(tick.date)}`
              : formatShortDate(tick.date)}
          </span>
        </span>
      ))}
      <span className="absolute right-0 bottom-0 left-0 text-center text-[8px] leading-4 whitespace-nowrap text-[#737373] sm:text-[9px]">
        Weekly timeline · shared by goal progress and shipped work
      </span>
    </div>
  );
}

function LegendItem({
  label,
  color,
  dashed = false,
  dotted = false,
}: {
  label: string;
  color: string;
  dashed?: boolean;
  dotted?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-[#737373]">
      <span
        aria-hidden
        className={cn(
          "w-6 border-t-2",
          dashed && "border-dashed",
          dotted && "border-dotted",
        )}
        style={{ borderColor: color }}
      />
      {label}
    </span>
  );
}

function ActivityCell({
  date,
  items,
  future,
  selected,
  left,
  top,
  onSelect,
}: {
  date: Date;
  items: readonly GoalProgressShippedWork[];
  future: boolean;
  selected: boolean;
  left: number;
  top: number;
  onSelect: (item: GoalProgressShippedWork) => void;
}) {
  const position = {
    left: `${left}%`,
    top,
    transform: "translateX(-50%)",
  };

  if (items.length === 0) {
    return (
      <span
        role="gridcell"
        aria-label={
          future
            ? `${formatShortDate(date)}: future date`
            : `${formatShortDate(date)}: no linked pull requests merged`
        }
        className={cn(
          "absolute size-3.5 rounded-[3px] border",
          future
            ? "border-[#DADCE5] bg-transparent"
            : "border-[#E5E5E5] bg-[#F3F4F6]",
        )}
        style={position}
      />
    );
  }

  const selectedItem = selectDefaultWork(items);
  const ariaLabel = `${formatShortDate(date)}: ${items.length} linked pull request${
    items.length === 1 ? "" : "s"
  } merged. ${items
    .map((item) => `PR #${item.prNumber}: ${item.title}`)
    .join(". ")}`;
  const intensity = Math.min(80, 30 + items.length * 18);

  return (
    <span role="gridcell" className="absolute size-3.5" style={position}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={selected}
        title={ariaLabel}
        onClick={() => {
          if (selectedItem) onSelect(selectedItem);
        }}
        className={cn(
          "size-3.5 cursor-pointer rounded-[3px] border border-[var(--chart-2)]",
          "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#254A7C]",
          selected && "ring-2 ring-[#0A0A0A] ring-offset-2",
        )}
        style={{
          backgroundColor: `color-mix(in srgb, var(--chart-2) ${intensity}%, white)`,
        }}
      />
    </span>
  );
}

function HypothesisPanel({
  selected,
  projectionAvailable,
}: {
  selected: GoalProgressShippedWork | null;
  projectionAvailable: boolean;
}) {
  if (!selected) {
    return (
      <section
        aria-live="polite"
        className="mt-4 border-t border-[#E5E5E5] pt-4"
      >
        <p className="font-mono text-[12px] leading-[18px] tracking-[0.3px] text-[#737373] uppercase">
          Novus hypothesis
        </p>
        <h4 className="mt-1 text-[16px] leading-6 font-semibold text-[#0A0A0A]">
          No shipped-work hypothesis yet
        </h4>
        <p className="mt-1 text-[12.64px] leading-[1.5] text-[#737373]">
          No merged pull requests are explicitly tied to this goal yet. Keep
          measuring progress and link shipped work only when the evidence
          supports it.
        </p>
        {!projectionAvailable ? <ProjectionUnavailableNote /> : null}
      </section>
    );
  }

  return (
    <section aria-live="polite" className="mt-4 border-t border-[#E5E5E5] pt-4">
      <p className="font-mono text-[12px] leading-[18px] tracking-[0.3px] text-[#737373] uppercase">
        Novus hypothesis · {selected.hypothesis.confidence}
      </p>
      <h4 className="mt-1 text-[16px] leading-6 font-semibold text-[#0A0A0A]">
        {selected.hypothesis.headline}
      </h4>
      <div className="mt-3 grid gap-4 md:grid-cols-2 md:gap-7">
        <div>
          <p className="text-[12px] leading-4 font-semibold text-[#737373]">
            Evidence
          </p>
          <p className="mt-1 text-[12.64px] leading-[1.5] text-[#2A2C35]">
            {selected.hypothesis.evidence}
          </p>
        </div>
        <div>
          <p className="text-[12px] leading-4 font-semibold text-[#737373]">
            Act next
          </p>
          <p className="mt-1 text-[12.64px] leading-[1.5] font-medium text-[#0A0A0A]">
            {selected.hypothesis.action}
          </p>
        </div>
      </div>
      {!projectionAvailable ? <ProjectionUnavailableNote /> : null}
    </section>
  );
}

function ProjectionUnavailableNote() {
  return (
    <p className="mt-3 text-[12.64px] leading-[1.5] text-[#737373]">
      More observations are needed before Novus can project progress.
    </p>
  );
}

function GoalProgressUnavailable({
  ariaLabel,
  source,
}: {
  ariaLabel: string;
  source: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel}>
      <h4 className="text-[16px] leading-6 font-semibold text-[#0A0A0A]">
        Goal progress is unavailable
      </h4>
      <p className="mt-1 text-[12.64px] leading-[1.5] text-[#737373]">
        Check the goal dates and add at least one measured observation before
        drawing progress.
      </p>
      <p className="mt-4 border-t border-[#E5E5E5] pt-3 text-[12px] text-[#737373]">
        {source}
      </p>
    </div>
  );
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}

function timelineLeft(date: Date, start: Date, end: Date) {
  const totalDays = Math.max(1, daysBetween(start, end));
  return Math.min(
    100,
    Math.max(0, (daysBetween(start, date) / totalDays) * 100),
  );
}

function plotTop(value: number, domain: readonly [number, number]) {
  const [minimum, maximum] = domain;
  const ratio = (value - minimum) / Math.max(1, maximum - minimum);
  return 30 + (1 - ratio) * 262;
}

function createTimelineTicks(
  start: Date,
  today: Date,
  end: Date,
  weekCount: number,
) {
  const lastIndex = weekCount - 1;
  const todayIndex = Math.min(
    lastIndex,
    Math.max(0, Math.floor(daysBetween(start, today) / 7)),
  );
  const indexes = [
    0,
    Math.floor(lastIndex / 4),
    todayIndex,
    Math.floor(lastIndex * 0.75),
    lastIndex,
  ];

  return [...new Set(indexes)]
    .sort((left, right) => left - right)
    .map<TimelineTick>((index) => {
      const isToday = index === todayIndex;
      return {
        date: isToday
          ? today
          : index === lastIndex
            ? end
            : new Date(start.getTime() + index * 7 * DAY_MS),
        isToday,
        left: (index / lastIndex) * 100,
        showOnCompact: index === 0 || isToday || index === lastIndex,
      };
    });
}

function formatShortDate(value: Date | number) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatValue(value: number, unit: string) {
  return `${Number(value.toFixed(1)).toLocaleString()}${unit}`;
}

function formatGap(
  target: number,
  projection: number,
  direction: "increase" | "decrease",
  unit: string,
) {
  const gap =
    direction === "increase" ? target - projection : projection - target;
  if (gap > 0) {
    return `${formatValue(Math.abs(gap), unit)} ${
      direction === "increase" ? "short" : "above target"
    }`;
  }
  return `${formatValue(Math.abs(gap), unit)} ahead`;
}

function selectDefaultWork(items: readonly GoalProgressShippedWork[]) {
  return (
    [...items].sort((left, right) => {
      const confidence =
        confidenceRank[right.hypothesis.confidence] -
        confidenceRank[left.hypothesis.confidence];
      return (
        confidence ||
        parseDate(right.date).getTime() - parseDate(left.date).getTime()
      );
    })[0] ?? null
  );
}

function projectValue(
  actual: readonly GoalProgressPoint[],
  endDate: string,
  floor: number,
  ceiling: number,
) {
  if (actual.length < 2) return null;
  const first = actual[0];
  const current = actual.at(-1);
  if (!current) return null;
  const observedDays = daysBetween(
    parseDate(first.date),
    parseDate(current.date),
  );
  if (observedDays <= 0) return null;
  const remainingDays = Math.max(
    0,
    daysBetween(parseDate(current.date), parseDate(endDate)),
  );
  const projected =
    current.value +
    ((current.value - first.value) / observedDays) * remainingDays;
  return Math.min(ceiling, Math.max(floor, projected));
}

function hasValidRange(startDate: string, today: string, endDate: string) {
  const start = parseDate(startDate).getTime();
  const current = parseDate(today).getTime();
  const end = parseDate(endDate).getTime();
  return (
    Number.isFinite(start) &&
    Number.isFinite(current) &&
    Number.isFinite(end) &&
    start <= current &&
    current <= end
  );
}

function buildChartData(
  actual: readonly GoalProgressPoint[],
  endDate: string,
  target: number,
  projection: number | null,
) {
  const rows = new Map<number, ChartDatum>();
  const ensureRow = (timestamp: number) => {
    const existing = rows.get(timestamp);
    if (existing) return existing;
    const row: ChartDatum = {
      timestamp,
      actual: null,
      required: null,
      projection: null,
    };
    rows.set(timestamp, row);
    return row;
  };

  for (const point of actual) {
    ensureRow(parseDate(point.date).getTime()).actual = point.value;
  }

  const current = actual.at(-1);
  if (current) {
    const currentRow = ensureRow(parseDate(current.date).getTime());
    currentRow.required = current.value;
    currentRow.projection = projection === null ? null : current.value;
  }

  const endRow = ensureRow(parseDate(endDate).getTime());
  endRow.required = target;
  endRow.projection = projection;

  return [...rows.values()].sort(
    (left, right) => left.timestamp - right.timestamp,
  );
}

function valueAt(date: string, actual: readonly GoalProgressPoint[]) {
  const timestamp = parseDate(date).getTime();
  const first = actual[0];
  const last = actual.at(-1);
  if (!first || !last) return null;
  if (timestamp <= parseDate(first.date).getTime()) return first.value;
  if (timestamp >= parseDate(last.date).getTime()) return last.value;

  for (let index = 1; index < actual.length; index += 1) {
    const previous = actual[index - 1];
    const next = actual[index];
    const previousTime = parseDate(previous.date).getTime();
    const nextTime = parseDate(next.date).getTime();
    if (timestamp <= nextTime) {
      const progress = (timestamp - previousTime) / (nextTime - previousTime);
      return previous.value + (next.value - previous.value) * progress;
    }
  }
  return last.value;
}

function createYDomain(
  actual: readonly GoalProgressPoint[],
  target: number,
  projection: number | null,
  floor: number,
  ceiling: number,
): [number, number] {
  const values = [
    ...actual.map((point) => point.value),
    target,
    ...(projection === null ? [] : [projection]),
  ];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = Math.max(1, maximum - minimum);
  const lower = Math.max(floor, minimum - range * 0.12);
  const upper = Math.min(ceiling, maximum + range * 0.12);
  return [lower, upper];
}

function createDays(start: Date, end: Date) {
  const count = daysBetween(start, end);
  return Array.from(
    { length: count + 1 },
    (_, index) => new Date(start.getTime() + index * DAY_MS),
  );
}

function groupWorkByDate(items: readonly GoalProgressShippedWork[]) {
  const groups = new Map<string, GoalProgressShippedWork[]>();
  for (const item of items) {
    const group = groups.get(item.date) ?? [];
    group.push(item);
    groups.set(item.date, group);
  }
  return groups;
}
