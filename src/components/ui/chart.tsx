"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { TooltipPayloadEntry, TooltipValueType } from "recharts";

import { MetricDelta, type MetricTone } from "@/components/metric-delta";
import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

const INITIAL_DIMENSION = { width: 320, height: 200 } as const;
type TooltipNameType = number | string;

export type ChartTooltipComparison =
  | {
      rows: ReadonlyArray<Record<string, string | number>>;
      labelKey: string;
      periodNoun: string;
    }
  | {
      prevKey: string;
      periodNoun: string;
    };

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
  initialDimension?: {
    width: number;
    height: number;
  };
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden [&_.recharts-wrapper_*:focus]:outline-none [&_.recharts-wrapper_*:focus-visible]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          initialDimension={initialDimension}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme ?? config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart="${id}"] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

function ChartActiveDot({
  cx,
  cy,
  color = "currentColor",
}: {
  cx?: number;
  cy?: number;
  color?: string;
}) {
  if (cx == null || cy == null) {
    return null;
  }

  return (
    <circle
      data-slot="chart-active-dot"
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#ffffff"
      strokeWidth={2}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function getTooltipDelta(
  current: number,
  previous: number,
): { label: string; tone: MetricTone } | null {
  if (!Number.isFinite(previous) || previous === 0) {
    return null;
  }

  const percent = Math.round(((current - previous) / previous) * 100);
  return {
    label: `${percent > 0 ? "+" : ""}${percent}%`,
    tone: percent > 0 ? "positive" : percent < 0 ? "negative" : "neutral",
  };
}

function getMeasureNoun(measure: string, value: number) {
  return value === 1 ? measure.replace(/s$/, "") : measure;
}

export type ChartTooltipPanelRow = {
  id?: React.Key;
  label: React.ReactNode;
  value: React.ReactNode;
  color?: string;
  indicator?: React.ReactNode;
  delta?: {
    label: React.ReactNode;
    tone: MetricTone;
  };
  detail?: React.ReactNode;
};

/**
 * Provides the shared visual structure for Recharts and manually positioned
 * chart tooltips.
 */
function ChartTooltipPanel({
  title,
  rows,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title?: React.ReactNode;
  rows: readonly ChartTooltipPanelRow[];
}) {
  const hasIndicators = rows.some((row) => row.indicator || row.color);

  return (
    <div
      data-slot="chart-tooltip-content"
      className={cn(
        "grid w-max items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-left text-xs shadow-xl",
        className,
      )}
      {...props}
    >
      {title ? (
        <div className="text-[14.22px] leading-5 font-semibold text-foreground">
          {title}
        </div>
      ) : null}
      <div className="grid w-full gap-1.5">
        {rows.map((row, index) => (
          <div
            key={row.id ?? index}
            data-slot="chart-tooltip-row"
            className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-1.5 gap-y-0.5 leading-none"
          >
            {hasIndicators ? (
              row.indicator ? (
                row.indicator
              ) : (
                <span
                  aria-hidden="true"
                  data-slot="chart-tooltip-swatch"
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: row.color }}
                />
              )
            ) : null}
            <span className="whitespace-nowrap text-muted-foreground">
              {row.label}
            </span>
            <span className="whitespace-nowrap text-right font-mono font-medium text-foreground tabular-nums">
              {row.value}
            </span>
            {row.delta ? (
              <MetricDelta tone={row.delta.tone} variant="filled">
                {row.delta.label}
              </MetricDelta>
            ) : null}
            {row.detail ? (
              <span
                className={cn(
                  "col-span-3 whitespace-nowrap text-[12.64px] leading-[1.5] text-muted-foreground",
                  hasIndicators && "col-start-2",
                )}
              >
                {row.detail}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartComparisonTooltipContent({
  payload,
  label,
  titlePrefix,
  colorMap,
  measure,
  comparison,
  config,
  className,
}: {
  payload: ReadonlyArray<
    TooltipPayloadEntry<TooltipValueType, TooltipNameType>
  >;
  label?: string | number;
  titlePrefix?: string;
  colorMap?: Record<string, string>;
  measure?: string;
  comparison?: ChartTooltipComparison;
  config: ChartConfig;
  className?: string;
}) {
  const items = payload.filter(
    (item) => item.type !== "none" && item.value != null,
  );

  if (!items.length) {
    return null;
  }

  const titleKey = label != null && label !== "" ? String(label) : null;
  const resolvedTitle = titleKey ? (config[titleKey]?.label ?? titleKey) : null;
  const labelLine =
    resolvedTitle != null && titlePrefix
      ? `${titlePrefix}: ${resolvedTitle}`
      : resolvedTitle;

  const previousValue = (
    seriesKey: string,
    item: TooltipPayloadEntry<TooltipValueType, TooltipNameType>,
  ) => {
    if (!comparison) {
      return null;
    }

    if ("prevKey" in comparison) {
      const previous = item.payload?.[comparison.prevKey];
      return typeof previous === "number" ? previous : null;
    }

    if (titleKey == null) {
      return null;
    }

    const index = comparison.rows.findIndex(
      (row) => String(row[comparison.labelKey]) === titleKey,
    );
    if (index <= 0) {
      return null;
    }

    const previous = comparison.rows[index - 1]?.[seriesKey];
    return typeof previous === "number" ? previous : null;
  };

  if (items.length === 1) {
    const item = items[0];
    const seriesKey = String(item.name ?? item.dataKey ?? "value");
    const seriesLabel = String(
      config[seriesKey]?.label ?? item.name ?? seriesKey,
    );
    const numericValue =
      typeof item.value === "number" ? item.value : Number(item.value);
    const isNumeric = Number.isFinite(numericValue);
    const displayValue = isNumeric
      ? numericValue.toLocaleString()
      : String(item.value);
    const previous = isNumeric ? previousValue(seriesKey, item) : null;
    const delta =
      previous != null ? getTooltipDelta(numericValue, previous) : null;
    const seriesLabelIncludesMeasure =
      measure != null &&
      seriesLabel.toLocaleLowerCase().includes(measure.toLocaleLowerCase());
    const valueLine =
      measure && isNumeric && !seriesLabelIncludesMeasure
        ? `${displayValue} ${getMeasureNoun(measure, numericValue)}`
        : displayValue;
    const swatchColor =
      (titleKey ? colorMap?.[titleKey] : undefined) ??
      item.color ??
      item.payload?.fill ??
      config[seriesKey]?.color ??
      "var(--chart-1)";

    return (
      <ChartTooltipPanel
        title={labelLine}
        className={className}
        rows={[
          {
            id: seriesKey,
            label: seriesLabel,
            value: valueLine,
            color: swatchColor,
            delta: delta ?? undefined,
            detail:
              delta && previous != null
                ? `from previous ${comparison?.periodNoun} (${previous.toLocaleString()} -> ${displayValue})`
                : undefined,
          },
        ]}
      />
    );
  }

  const rows = items.map((item, index): ChartTooltipPanelRow => {
    const seriesKey = String(item.name ?? item.dataKey ?? index);
    const seriesLabel = config[seriesKey]?.label ?? item.name ?? seriesKey;
    const numericValue =
      typeof item.value === "number" ? item.value : Number(item.value);
    const isNumeric = Number.isFinite(numericValue);
    const displayValue = isNumeric
      ? numericValue.toLocaleString()
      : String(item.value);
    const seriesLabelIncludesMeasure =
      measure != null &&
      String(seriesLabel)
        .toLocaleLowerCase()
        .includes(measure.toLocaleLowerCase());
    const valueLine =
      measure && isNumeric && !seriesLabelIncludesMeasure
        ? `${displayValue} ${getMeasureNoun(measure, numericValue)}`
        : displayValue;
    const previous = isNumeric ? previousValue(seriesKey, item) : null;
    const delta =
      previous != null ? getTooltipDelta(numericValue, previous) : null;
    const swatchColor =
      (titleKey ? colorMap?.[titleKey] : undefined) ??
      item.color ??
      item.payload?.fill ??
      config[seriesKey]?.color ??
      "var(--chart-1)";

    return {
      id: seriesKey,
      label: seriesLabel,
      value: valueLine,
      color: swatchColor,
      delta: delta ?? undefined,
    };
  });

  return (
    <ChartTooltipPanel title={labelLine} rows={rows} className={className} />
  );
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  variant = "default",
  titlePrefix,
  colorMap,
  measure,
  comparison,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    variant?: "default" | "comparison";
    titlePrefix?: string;
    colorMap?: Record<string, string>;
    measure?: string;
    comparison?: ChartTooltipComparison;
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      TooltipNameType
    >,
    "accessibilityLayer"
  >) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? (config[label]?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  if (variant === "comparison") {
    return (
      <ChartComparisonTooltipContent
        payload={payload}
        label={
          typeof label === "string" || typeof label === "number"
            ? label
            : undefined
        }
        titlePrefix={titlePrefix}
        colorMap={colorMap}
        measure={measure}
        comparison={comparison}
        config={config}
        className={className}
      />
    );
  }

  const rows = payload
    .filter((item) => item.type !== "none" && item.value != null)
    .map((item, index): ChartTooltipPanelRow => {
      const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const indicatorColor = color ?? item.payload?.fill ?? item.color;
      const indicatorElement = itemConfig?.icon ? (
        <itemConfig.icon />
      ) : !hideIndicator && indicatorColor ? (
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
            {
              "size-2.5": indicator === "dot",
              "h-2.5 w-1": indicator === "line",
              "h-2.5 w-0 border-[1.5px] border-dashed bg-transparent":
                indicator === "dashed",
            },
          )}
          style={
            {
              "--color-bg": indicatorColor,
              "--color-border": indicatorColor,
            } as React.CSSProperties
          }
        />
      ) : undefined;
      const formattedValue =
        formatter && item.name
          ? formatter(item.value, item.name, item, index, item.payload)
          : typeof item.value === "number"
            ? item.value.toLocaleString()
            : String(item.value);

      return {
        id: key,
        label: itemConfig?.label ?? item.name,
        value: formattedValue,
        indicator: indicatorElement,
      };
    });

  return (
    <ChartTooltipPanel title={tooltipLabel} rows={rows} className={className} />
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean;
  nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
  ChartActiveDot,
  ChartContainer,
  ChartTooltip,
  ChartTooltipPanel,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
