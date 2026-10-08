"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { FileText, Zap, type LucideIcon } from "lucide-react";

import { ChartTooltipPanel } from "@/components/ui/chart";

export type DashboardFunnelDatum = {
  step: string;
  eventType: string;
  visitors: number;
};

export type DashboardFunnelSegment = "continued" | "dropped";

export type DashboardFunnelStep = {
  step: string;
  eventType: string;
  reached: number;
  continued: number;
  dropped: number;
  isFirst: boolean;
  isLast: boolean;
  nextStep: string | null;
};

export type DashboardFunnelChartProps = {
  data: readonly DashboardFunnelDatum[];
  ariaLabel?: string;
  onSegmentSelect?: (
    stepIndex: number,
    segment: DashboardFunnelSegment,
  ) => void;
};

/**
 * Derives the continued and dropped cohorts represented within each funnel bar.
 */
export function buildDashboardFunnelSteps(
  data: readonly DashboardFunnelDatum[],
): DashboardFunnelStep[] {
  const started = data[0]?.visitors ?? 0;

  return data.map((step, index) => {
    const next = data[index + 1];
    const isFirst = index === 0;
    const continued = step.visitors;

    return {
      step: step.step,
      eventType: step.eventType,
      reached: step.visitors,
      continued,
      dropped: isFirst ? 0 : Math.max(started - continued, 0),
      isFirst,
      isLast: !next,
      nextStep: next?.step ?? null,
    };
  });
}

/** Scales one cohort within a 100% stacked funnel bar. */
export function getDashboardFunnelSegmentHeight(
  value: number,
  total: number,
  usableHeight: number,
) {
  if (total <= 0 || value <= 0) return 0;
  return Math.min(value / total, 1) * usableHeight;
}

/** Sizes a funnel bar while preserving a small gap between adjacent steps. */
export function getDashboardFunnelBarWidth(columnWidth: number) {
  return Math.min(columnWidth * 0.72, 128);
}

function stepIcon(eventType: string): LucideIcon {
  return eventType === "page" ? FileText : Zap;
}

function activateOnKeyboard(
  event: ReactKeyboardEvent<SVGElement>,
  action: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action();
}

/**
 * Renders a responsive merged funnel with independently selectable continued
 * and dropped cohorts for each tracked step.
 */
export function DashboardFunnelChart({
  data,
  ariaLabel = "Activation funnel: continued versus dropped visitors at each step",
  onSegmentSelect,
}: DashboardFunnelChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(560);
  const [hovered, setHovered] = useState<{
    stepIndex: number;
    segment: DashboardFunnelSegment;
  } | null>(null);
  const steps = buildDashboardFunnelSteps(data);
  const isInteractive = Boolean(onSegmentSelect);
  const activeSegment = hovered;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => setWidth(element.clientWidth || 560);
    update();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const continuedColor = "var(--chart-1)";
  const droppedColor = "#DCDCE1";
  const droppedColorHover = "#D3D2DB";
  const height = 220;
  const topPad = 10;
  const bottomPad = 14;
  const axisGutter = 44;
  const rightPad = 28;
  const usableHeight = height - topPad - bottomPad;
  const plotBottom = height - bottomPad;
  const plotWidth = Math.max(1, width - axisGutter - rightPad);
  const plotLeft = axisGutter;
  const columnWidth = steps.length > 0 ? plotWidth / steps.length : plotWidth;
  const barWidth = getDashboardFunnelBarWidth(columnWidth);
  const percentTicks = [100, 75, 50, 25, 0];
  const yForPercent = (percent: number) =>
    topPad + ((100 - percent) / 100) * usableHeight;
  const cornerRadius = 6;

  const geometry = steps.map((step, index) => {
    const columnLeft = plotLeft + index * columnWidth;
    const barX = columnLeft + (columnWidth - barWidth) / 2;
    const cohortTotal = step.continued + step.dropped;

    return {
      ...step,
      index,
      barX,
      barRight: barX + barWidth,
      reachedTop: cohortTotal > 0 ? topPad : plotBottom,
      continuedTop:
        plotBottom -
        getDashboardFunnelSegmentHeight(
          step.continued,
          cohortTotal,
          usableHeight,
        ),
      centerX: columnLeft + columnWidth / 2,
    };
  });

  const roundedTopRectPath = (
    x: number,
    y: number,
    rectWidth: number,
    rectHeight: number,
  ) => {
    const radius = Math.max(
      0,
      Math.min(cornerRadius, rectWidth / 2, rectHeight),
    );
    return `M${x},${y + rectHeight} L${x},${y + radius} Q${x},${y} ${
      x + radius
    },${y} L${x + rectWidth - radius},${y} Q${x + rectWidth},${y} ${
      x + rectWidth
    },${y + radius} L${x + rectWidth},${y + rectHeight} Z`;
  };

  return (
    <div className="flex flex-col gap-1">
      <div ref={containerRef} className="relative w-full">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block max-w-full"
          role="group"
          aria-label={ariaLabel}
        >
          {percentTicks.map((percent) => (
            <text
              key={percent}
              x={plotLeft - 8}
              y={yForPercent(percent)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-[#737373] text-[11px]"
            >
              {percent}%
            </text>
          ))}

          <line
            data-testid="funnel-x-axis"
            aria-hidden
            x1={plotLeft}
            x2={width - rightPad}
            y1={plotBottom}
            y2={plotBottom}
            stroke="#DADCE5"
            strokeWidth={1}
          />

          {geometry.map((step) => {
            const droppedHeight = step.continuedTop - step.reachedTop;
            const hasDropped = step.dropped > 0 && droppedHeight > 0;
            const isEmpty = step.continued <= 0 && step.dropped <= 0;
            const enterStep = (segment: DashboardFunnelSegment) =>
              setHovered({ stepIndex: step.index, segment });
            const selectContinued = () =>
              onSegmentSelect?.(step.index, "continued");
            const selectDropped = () =>
              onSegmentSelect?.(step.index, "dropped");
            const continuedLabel = step.isFirst
              ? `${step.continued} visitors started at ${step.step}`
              : step.isLast
                ? `${step.continued} visitors converted at ${step.step}`
                : `${step.continued} visitors continued from ${step.step}`;

            return (
              <g key={step.step}>
                {hasDropped ? (
                  <path
                    role={isInteractive ? "button" : undefined}
                    tabIndex={isInteractive ? 0 : undefined}
                    aria-label={
                      isInteractive
                        ? `${step.dropped} visitors dropped at ${step.step}`
                        : undefined
                    }
                    d={roundedTopRectPath(
                      step.barX,
                      step.reachedTop,
                      barWidth,
                      droppedHeight,
                    )}
                    fill={
                      activeSegment?.stepIndex === step.index &&
                      activeSegment.segment === "dropped"
                        ? droppedColorHover
                        : droppedColor
                    }
                    className={
                      isInteractive
                        ? "cursor-pointer transition-[fill] duration-150"
                        : undefined
                    }
                    onMouseEnter={() => enterStep("dropped")}
                    onMouseLeave={() => setHovered(null)}
                    onClick={isInteractive ? selectDropped : undefined}
                    onKeyDown={(event) =>
                      isInteractive
                        ? activateOnKeyboard(event, selectDropped)
                        : undefined
                    }
                  />
                ) : null}

                {isEmpty ? (
                  <>
                    <path
                      data-testid="funnel-empty-bar"
                      aria-hidden="true"
                      d={roundedTopRectPath(
                        step.barX,
                        topPad,
                        barWidth,
                        usableHeight,
                      )}
                      fill={droppedColor}
                    />
                    <line
                      data-testid="funnel-empty-step"
                      aria-hidden="true"
                      x1={step.barX}
                      x2={step.barRight}
                      y1={plotBottom}
                      y2={plotBottom}
                      stroke={continuedColor}
                      strokeWidth={2}
                    />
                  </>
                ) : hasDropped ? (
                  <rect
                    role={isInteractive ? "button" : undefined}
                    tabIndex={isInteractive ? 0 : undefined}
                    aria-label={isInteractive ? continuedLabel : undefined}
                    x={step.barX}
                    y={step.continuedTop}
                    width={barWidth}
                    height={plotBottom - step.continuedTop}
                    fill={continuedColor}
                    className={
                      isInteractive
                        ? "cursor-pointer transition-opacity hover:opacity-85"
                        : undefined
                    }
                    onMouseEnter={() => enterStep("continued")}
                    onMouseLeave={() => setHovered(null)}
                    onClick={isInteractive ? selectContinued : undefined}
                    onKeyDown={(event) =>
                      isInteractive
                        ? activateOnKeyboard(event, selectContinued)
                        : undefined
                    }
                  />
                ) : (
                  <path
                    role={isInteractive ? "button" : undefined}
                    tabIndex={isInteractive ? 0 : undefined}
                    aria-label={isInteractive ? continuedLabel : undefined}
                    d={roundedTopRectPath(
                      step.barX,
                      step.continuedTop,
                      barWidth,
                      plotBottom - step.continuedTop,
                    )}
                    fill={continuedColor}
                    className={
                      isInteractive
                        ? "cursor-pointer transition-opacity hover:opacity-85"
                        : undefined
                    }
                    onMouseEnter={() => enterStep("continued")}
                    onMouseLeave={() => setHovered(null)}
                    onClick={isInteractive ? selectContinued : undefined}
                    onKeyDown={(event) =>
                      isInteractive
                        ? activateOnKeyboard(event, selectContinued)
                        : undefined
                    }
                  />
                )}
              </g>
            );
          })}
        </svg>

        {activeSegment
          ? (() => {
              const step = steps[activeSegment.stepIndex];
              const bar = geometry[activeSegment.stepIndex];
              if (!step || !bar) return null;

              const gap = 12;
              const placeLeft = bar.centerX > width / 2;
              const isDropped = activeSegment.segment === "dropped";
              const label = isDropped
                ? "Dropped off"
                : step.isFirst
                  ? "Started"
                  : step.isLast
                    ? "Converted"
                    : "Continued";
              const value = isDropped ? step.dropped : step.continued;
              const percentage =
                step.continued + step.dropped > 0
                  ? Math.round((value / (step.continued + step.dropped)) * 100)
                  : 0;
              const color = isDropped ? droppedColor : continuedColor;

              return (
                <ChartTooltipPanel
                  title={step.step}
                  rows={[
                    {
                      label,
                      value: `${value.toLocaleString()} (${percentage}%)`,
                      color,
                    },
                  ]}
                  className="pointer-events-none absolute z-10"
                  style={{
                    left: placeLeft ? bar.barX - gap : bar.barRight + gap,
                    top: height / 2,
                    transform: placeLeft
                      ? "translate(-100%, -50%)"
                      : "translate(0, -50%)",
                  }}
                />
              );
            })()
          : null}
      </div>

      <div
        className="grid"
        style={{
          marginLeft: plotLeft,
          width: plotWidth,
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
        }}
      >
        {steps.map((step) => {
          const StepIcon = stepIcon(step.eventType);

          return (
            <div key={step.step} className="min-w-0 px-1 text-center">
              <div className="flex min-w-0 items-start justify-center gap-1.5">
                <StepIcon
                  aria-hidden
                  className="mt-0.5 size-3.5 shrink-0 text-[#737373]"
                />
                <p
                  title={step.step}
                  className="min-w-0 truncate text-center text-[13px] leading-[18px] font-normal text-[#2A2C35]"
                >
                  {step.step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
