"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  ChevronRight,
  X,
} from "lucide-react";

import { MetricDelta, type MetricTone } from "@/components/metric-delta";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DashboardDrillSection =
  "instrumentation" | "activity" | "funnel" | "kpi";

export type DashboardDrillSelection = {
  section: DashboardDrillSection;
  breadcrumbSection?: DashboardDrillSection;
  chartMode: string;
  sourceChartTitle: string;
  sublabel?: string;
  delta?: string;
  seriesKey: string;
  label: string;
  value: number;
  interaction: "bar" | "line-point";
  comparison?: {
    leftLabel: string;
    leftValue: number;
    rightLabel: string;
    rightValue: number;
  };
};

export type DashboardDrillTableCellValue = string | number | null;
export type DashboardDrillTableRow = Record<
  string,
  DashboardDrillTableCellValue
>;

export type DashboardDrillKvItem = {
  label: string;
  value: string;
};

export type DashboardDrillMetricContext = {
  value: string;
  delta?: string;
  timeframe: string;
};

type DashboardDrillPayloadBase = {
  title: string;
  subtitle: string;
  summary?: string;
  metricContext?: DashboardDrillMetricContext;
  isFullMetricList?: boolean;
  selection: DashboardDrillSelection;
};

export type DashboardDrillTablePayload = DashboardDrillPayloadBase & {
  dataType: "table";
  columns: string[];
  rows: DashboardDrillTableRow[];
  emptyMessage?: string;
};

export type DashboardDrillKvPayload = DashboardDrillPayloadBase & {
  dataType: "kv";
  items: DashboardDrillKvItem[];
};

export type DashboardDrillPayload =
  DashboardDrillTablePayload | DashboardDrillKvPayload;

const dashboardMeasuredPeriod = "June 14 to July 14, 2026";

const weeklyTrafficPeriods: Record<string, string> = {
  "Jun 14": "June 14 to June 20, 2026",
  "Jun 21": "June 21 to June 27, 2026",
  "Jun 28": "June 28 to July 4, 2026",
  "Jul 5": "July 5 to July 11, 2026",
  "Jul 12": "July 12 to July 14, 2026",
};

const drillSectionLabel: Record<DashboardDrillSection, string> = {
  kpi: "Key metrics",
  instrumentation: "Instrumentation coverage",
  activity: "Activity across key pages",
  funnel: "Funnel readiness",
};

/** Maps a signed dashboard delta to its semantic treatment. */
export function getKpiDeltaTone(delta: string): MetricTone {
  if (delta.startsWith("+")) return "positive";
  if (delta.startsWith("-")) return "negative";
  return "neutral";
}

/** Agrees a dashboard measure identifier with its numeric value. */
export function measureNoun(measure: string, value: number): string {
  return value === 1 ? measure.replace(/s$/, "") : measure;
}

type DashboardDrillSort = {
  column: string;
  direction: "ascending" | "descending";
};

/** Renders a sortable drill table using the shared production table treatment. */
function DashboardDrillTable({
  payload,
  presentation = "blade",
}: {
  payload: Pick<
    DashboardDrillTablePayload,
    "columns" | "rows" | "emptyMessage"
  >;
  presentation?: "blade" | "fullscreen";
}) {
  const [sort, setSort] = useState<DashboardDrillSort | null>(null);
  const sortedRows = useMemo(() => {
    if (!sort) return payload.rows;

    return payload.rows
      .map((row, index) => ({ row, index }))
      .sort((left, right) => {
        const leftValue = left.row[sort.column];
        const rightValue = right.row[sort.column];

        if (leftValue == null && rightValue == null) {
          return left.index - right.index;
        }
        if (leftValue == null) return 1;
        if (rightValue == null) return -1;

        const comparison =
          typeof leftValue === "number" && typeof rightValue === "number"
            ? leftValue - rightValue
            : String(leftValue).localeCompare(String(rightValue), undefined, {
                numeric: true,
                sensitivity: "base",
              });

        return sort.direction === "ascending" ? comparison : -comparison;
      })
      .map(({ row }) => row);
  }, [payload.rows, sort]);

  const toggleSort = (column: string) => {
    setSort((current) => ({
      column,
      direction:
        current?.column === column && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const renderCell = (
    value: DashboardDrillTableCellValue,
    column: string,
    columnIndex: number,
  ) => {
    if (columnIndex === 0) {
      return (
        <span className="block truncate text-[14.22px] font-medium text-foreground">
          {String(value ?? "-")}
        </span>
      );
    }

    if (
      column === "Account ID" ||
      column === "Account name" ||
      column === "Last active" ||
      column === "Last visit" ||
      column === "Date"
    ) {
      return (
        <span className="block truncate text-[12.64px] text-muted-foreground">
          {String(value ?? "-")}
        </span>
      );
    }

    return (
      <span className="block truncate text-[12.64px] text-foreground">
        {String(value ?? "-")}
      </span>
    );
  };

  return (
    <div
      tabIndex={0}
      className="max-h-[70vh] overflow-x-auto overflow-y-auto rounded-lg border"
    >
      <Table
        className="w-max! min-w-full table-auto!"
        aria-label={
          presentation === "fullscreen" ? "Full drill records" : "Drill details"
        }
      >
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {payload.columns.map((column, columnIndex) => (
              <TableHead
                key={column}
                aria-sort={sort?.column === column ? sort.direction : undefined}
                className={cn(
                  "sticky top-0 z-10 bg-background",
                  columnIndex === 0 && "left-0 z-20",
                )}
              >
                <button
                  type="button"
                  aria-label={`Sort by ${column}`}
                  onClick={() => toggleSort(column)}
                  className="inline-flex cursor-pointer items-center text-left text-[12.64px] font-medium whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {column}
                  {sort?.column === column ? (
                    sort.direction === "ascending" ? (
                      <ArrowUp aria-hidden="true" className="ml-1 size-3.5" />
                    ) : (
                      <ArrowDown aria-hidden="true" className="ml-1 size-3.5" />
                    )
                  ) : (
                    <ArrowUpDown
                      aria-hidden="true"
                      className="ml-1 size-3.5 opacity-40"
                    />
                  )}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.length > 0 ? (
            sortedRows.map((row, rowIndex) => (
              <TableRow
                key={`${rowIndex}-${String(row[payload.columns[0]])}`}
                className="h-11"
              >
                {payload.columns.map((column, columnIndex) => (
                  <TableCell
                    key={column}
                    className={cn(
                      "bg-background",
                      columnIndex === 0 && "sticky left-0 z-10",
                    )}
                  >
                    {renderCell(row[column], column, columnIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={payload.columns.length}
                className="bg-background px-3 py-8 text-center text-muted-foreground"
              >
                {payload.emptyMessage ?? "No records found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/** Renders key-value drill details. */
function renderKvList(payload: DashboardDrillKvPayload) {
  return (
    <div className="space-y-2 rounded-[8px] border border-[#e5e5e5] p-3">
      {payload.items.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[#f0f0f0] pb-2 last:border-b-0 last:pb-0"
        >
          <p className="text-[13px] leading-[18px] text-[#6a6c75]">
            {item.label}
          </p>
          <p className="text-[13px] leading-[18px] font-semibold text-[#1c1d23]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Summarizes the selected cohort without repeating visible field labels. */
function DashboardDrillMetadataRail({
  payload,
  className,
}: {
  payload: DashboardDrillPayload;
  className?: string;
}) {
  const selectedValue =
    payload.metricContext?.value ?? payload.selection.value.toLocaleString();
  const selectedDelta = payload.metricContext?.delta ?? payload.selection.delta;
  const timeframe =
    payload.metricContext?.timeframe ??
    weeklyTrafficPeriods[payload.selection.label] ??
    dashboardMeasuredPeriod;
  const rowCount =
    payload.dataType === "table" ? payload.rows.length : payload.items.length;
  const countLabel =
    payload.dataType === "table" && payload.columns.includes("Visitor ID")
      ? payload.columns.includes("Feedback")
        ? "Responses"
        : "Visitors"
      : payload.dataType === "table" && payload.columns.includes("Step")
        ? "Steps"
        : "Records";
  const numericMetricValue = Number(selectedValue.replaceAll(",", ""));
  const combinesMetricAndCount =
    payload.dataType === "table" &&
    (countLabel === "Visitors" || countLabel === "Responses") &&
    Number.isFinite(numericMetricValue) &&
    numericMetricValue === rowCount;

  return (
    <dl
      className={cn(
        "flex flex-wrap items-center gap-y-2 text-[12.64px] leading-[18px] text-[#737373]",
        className,
      )}
    >
      <div className="flex items-center pr-4">
        <dt className="sr-only">
          {combinesMetricAndCount ? countLabel : "Metric value"}
        </dt>
        <dd className="flex items-center gap-2 font-semibold text-[#2a2c35]">
          {combinesMetricAndCount
            ? `${selectedValue} ${measureNoun(countLabel, rowCount).toLowerCase()}`
            : selectedValue}
          {selectedDelta ? (
            <MetricDelta
              tone={getKpiDeltaTone(selectedDelta)}
              variant="filled"
              size="compact"
            >
              {selectedDelta}
            </MetricDelta>
          ) : null}
        </dd>
      </div>
      {!combinesMetricAndCount && payload.dataType === "table" ? (
        <div className="flex items-center border-l border-[#e5e5e5] px-4">
          <dt className="sr-only">{countLabel}</dt>
          <dd>
            {rowCount.toLocaleString()}{" "}
            {measureNoun(countLabel, rowCount).toLowerCase()}
          </dd>
        </div>
      ) : null}
      <div className="flex items-center gap-1.5 border-l border-[#e5e5e5] pl-4">
        <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
        <dt className="sr-only">Measured period</dt>
        <dd>{timeframe}</dd>
      </div>
    </dl>
  );
}

export type DashboardDrillSideBladeProps = {
  payload: DashboardDrillPayload | null;
  isOpen: boolean;
  onClose: () => void;
  widthMode?: "resizable" | "half";
};

/** Shows contextual drill data beside the source dashboard. */
export function DashboardDrillSideBlade({
  payload,
  isOpen,
  onClose,
  widthMode = "resizable",
}: DashboardDrillSideBladeProps) {
  const NARROW_WIDTH = 460;
  const WIDE_WIDTH = 820;
  const MIN_WIDTH = 360;
  const MAX_WIDTH = 1100;

  const [width, setWidth] = useState(NARROW_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const dragStartRef = useRef<{ startX: number; startWidth: number }>({
    startX: 0,
    startWidth: NARROW_WIDTH,
  });

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const RESERVED_FOR_DASHBOARD = 480;
  const maxWidth = Math.min(
    MAX_WIDTH,
    Math.round(viewportWidth * 0.65),
    Math.max(MIN_WIDTH, viewportWidth - RESERVED_FOR_DASHBOARD),
  );
  const effectiveWidth = Math.min(width, maxWidth);
  const panelWidth: number | string =
    widthMode === "half" ? "50%" : effectiveWidth;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: PointerEvent) => {
      const { startX, startWidth } = dragStartRef.current;
      const next = Math.min(
        maxWidth,
        Math.max(MIN_WIDTH, startWidth + (startX - event.clientX)),
      );
      setWidth(next);
    };
    const stopDragging = () => setIsDragging(false);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [isDragging, maxWidth]);

  const startDrag = (event: React.PointerEvent) => {
    event.preventDefault();
    dragStartRef.current = {
      startX: event.clientX,
      startWidth: effectiveWidth,
    };
    setIsDragging(true);
  };

  const toggleWidth = () => {
    setWidth((current) =>
      current >= (NARROW_WIDTH + WIDE_WIDTH) / 2 ? NARROW_WIDTH : WIDE_WIDTH,
    );
  };

  const RESIZE_STEP = 24;
  const handleResizeKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setWidth((current) =>
        Math.min(maxWidth, Math.min(current, effectiveWidth) + RESIZE_STEP),
      );
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setWidth((current) =>
        Math.max(MIN_WIDTH, Math.min(current, effectiveWidth) - RESIZE_STEP),
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      setWidth(maxWidth);
    } else if (event.key === "End") {
      event.preventDefault();
      setWidth(MIN_WIDTH);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleWidth();
    }
  };

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, [isOpen]);

  const open = Boolean(isOpen && payload);
  return (
    <div
      aria-hidden={!isOpen}
      inert={!open}
      role={open ? "dialog" : undefined}
      aria-modal={false}
      aria-label={
        payload
          ? `${payload.selection.sourceChartTitle}: ${payload.selection.label} details`
          : undefined
      }
      style={{ width: open ? panelWidth : 0 }}
      className={`relative sticky top-0 z-30 h-[calc(100vh-105px)] shrink-0 self-start overflow-hidden bg-white ${
        open ? "border-l border-[#e5e5e5]" : "border-l-0"
      } ${isDragging ? "" : "transition-[width] duration-300 ease-in-out"}`}
    >
      {payload ? (
        <>
          {widthMode === "resizable" ? (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-valuemin={MIN_WIDTH}
              aria-valuemax={maxWidth}
              aria-valuenow={effectiveWidth}
              aria-label="Resize details panel"
              title="Drag or use arrow keys to resize · double-click to toggle width"
              onPointerDown={startDrag}
              onDoubleClick={toggleWidth}
              onKeyDown={handleResizeKeyDown}
              style={{ touchAction: "none" }}
              className={`absolute top-0 left-0 z-20 h-full w-1.5 cursor-col-resize transition-colors hover:bg-[#dadce5] focus-visible:bg-[#dadce5] focus-visible:outline-none ${
                isDragging ? "bg-[#dadce5]" : "bg-transparent"
              }`}
            />
          ) : null}
          <div
            className="flex h-full flex-col"
            style={{ width: widthMode === "half" ? "100%" : effectiveWidth }}
          >
            <div className="border-b border-[#e5e5e5] px-5 pt-8 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[18px] leading-6 font-semibold text-[#0a0a0a]">
                    {payload.title}
                  </p>
                  {payload.selection.sublabel ? (
                    <p className="pt-1 text-[13px] leading-[18px] text-[#6a6c75]">
                      {payload.selection.sublabel}
                    </p>
                  ) : null}
                  {payload.subtitle ? (
                    <p className="pt-1 text-[12.642px] leading-[18px] text-[#737373]">
                      {payload.subtitle}
                    </p>
                  ) : null}
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-[6px] px-2 py-1 text-[13px] leading-4 text-[#2a2c35] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dadce5]"
                >
                  Close
                </button>
              </div>
              {widthMode === "half" ? (
                <DashboardDrillMetadataRail
                  payload={payload}
                  className="mt-3"
                />
              ) : null}
            </div>
            <div tabIndex={0} className="space-y-4 overflow-y-auto px-5 py-4">
              {payload.summary ? (
                <p className="text-[14px] leading-[1.5] text-black/80">
                  {payload.summary}
                </p>
              ) : null}
              {payload.dataType === "table" ? (
                <DashboardDrillTable payload={payload} />
              ) : (
                renderKvList(payload)
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export type DashboardDrillFullScreenModalProps = {
  payload: DashboardDrillPayload | null;
  isOpen: boolean;
  onClose: () => void;
};

/** Shows a complete drill record list in a focus-trapped modal. */
export function DashboardDrillFullScreenModal({
  payload,
  isOpen,
  onClose,
}: DashboardDrillFullScreenModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !payload) return null;

  const isFullMetricList = payload.isFullMetricList === true;
  const sectionLabel =
    drillSectionLabel[
      payload.selection.breadcrumbSection ?? payload.selection.section
    ];
  const isFunnelSegmentDrilldown =
    payload.selection.section === "kpi" &&
    payload.selection.chartMode === "funnel";
  const modalTitle = isFullMetricList
    ? payload.selection.sourceChartTitle
    : payload.title;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drilldown-modal-title"
      className="fixed inset-0 z-[100] flex flex-col bg-white motion-safe:animate-in motion-safe:slide-in-from-bottom-full motion-safe:duration-300 motion-safe:ease-out"
    >
      <header className="relative shrink-0 border-b border-[#dadce5] px-6 py-5 lg:px-10">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="flex h-8 items-center gap-4 pr-12">
            <nav aria-label="Drill-down context" className="min-w-0">
              <ol className="flex min-w-0 items-center gap-1 text-[12.64px] leading-[18px] text-[#737373]">
                <li>
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-[4px] hover:text-[#0a0a0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dadce5]"
                  >
                    Dashboard
                  </button>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="truncate">{sectionLabel}</li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li
                  className={cn(
                    "truncate",
                    isFullMetricList && "text-[#2a2c35]",
                  )}
                  aria-current={isFullMetricList ? "page" : undefined}
                >
                  {payload.selection.sourceChartTitle}
                </li>
                {!isFullMetricList ? (
                  <>
                    <li aria-hidden="true">
                      <ChevronRight className="size-3.5" />
                    </li>
                    <li className="truncate text-[#2a2c35]" aria-current="page">
                      {payload.selection.label}
                    </li>
                  </>
                ) : null}
              </ol>
            </nav>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close drill-down"
              className="absolute top-5 right-5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-[#2a2c35] hover:bg-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dadce5]"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div className="mt-5">
            <div className="min-w-0">
              <h1
                id="drilldown-modal-title"
                className="text-[22.78px] leading-[1.3] font-semibold text-[#0a0a0a]"
              >
                {modalTitle}
              </h1>
              {payload.selection.sublabel && !isFunnelSegmentDrilldown ? (
                <p className="mt-1 text-[14px] leading-[1.5] text-[#737373]">
                  {payload.selection.sublabel}
                </p>
              ) : null}

              <DashboardDrillMetadataRail payload={payload} className="mt-3" />
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1440px]">
          {payload.dataType === "table" ? (
            <DashboardDrillTable payload={payload} presentation="fullscreen" />
          ) : (
            renderKvList(payload)
          )}
        </div>
      </div>
    </div>
  );
}
