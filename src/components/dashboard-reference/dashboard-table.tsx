"use client";

import { ArrowRight, ChevronDown, ChevronRight, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type {
  DashboardRankedTableRow,
  DashboardRecordTableRow,
  DashboardRecordsSummary,
  DashboardTableProps,
} from "./dashboard-types";

const interactiveRowClassName =
  "cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:outline-none";

function DashboardTableHeader({
  description,
  headerAction,
  title,
}: Pick<DashboardTableProps, "description" | "title"> & {
  headerAction?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <header className="flex items-start justify-between border-b border-[#E5E5E5] px-4 pt-3 pb-[13px]">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="text-[16px] leading-6 font-normal text-[#0A0A0A]">
          {title}
        </h3>
        <p className="text-[12.64px] leading-[1.5] text-[#737373]">
          {description}
        </p>
      </div>

      {headerAction ? (
        <Button
          className="h-auto border-0 px-2 py-1 text-[14px] leading-4 font-normal shadow-none hover:bg-[#F8F8F8] focus-visible:ring-2 focus-visible:ring-[#DADCE5]"
          variant="ghost"
          onClick={headerAction.onClick}
        >
          <Table2 aria-hidden="true" />
          {headerAction.label}
          <ChevronDown aria-hidden="true" />
        </Button>
      ) : null}
    </header>
  );
}

function RankedRows({
  onRowSelect,
  rows,
}: {
  onRowSelect?: (row: DashboardRankedTableRow) => void;
  rows: readonly DashboardRankedTableRow[];
}) {
  return (
    <TableBody>
      {rows.map((row, index) => (
        <TableRow
          key={row.id}
          aria-label={onRowSelect ? `Open ${row.label} details` : undefined}
          className={
            onRowSelect
              ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:outline-none"
              : "hover:bg-transparent"
          }
          tabIndex={onRowSelect ? 0 : undefined}
          onClick={onRowSelect ? () => onRowSelect(row) : undefined}
          onKeyDown={
            onRowSelect
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowSelect(row);
                  }
                }
              : undefined
          }
        >
          <TableCell className="px-0 py-2 text-center font-mono text-[12px] text-muted-foreground">
            {index + 1}
          </TableCell>
          <TableCell className="min-w-0 px-4 py-2">
            <span className="block truncate">{row.label}</span>
          </TableCell>
          <TableCell className="px-3 py-2 text-right font-mono font-normal tabular-nums">
            {row.value}
          </TableCell>
          <TableCell className="py-1 pr-4 pl-0 text-right">
            {onRowSelect ? (
              <ChevronRight
                aria-hidden="true"
                className="ml-auto size-3 text-muted-foreground"
              />
            ) : null}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

function RecordRows({
  onRowSelect,
  rows,
}: {
  onRowSelect?: (row: DashboardRecordTableRow) => void;
  rows: readonly DashboardRecordTableRow[];
}) {
  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow
          key={row.id}
          aria-label={onRowSelect ? `Open ${row.primary} details` : undefined}
          className={
            onRowSelect ? interactiveRowClassName : "hover:bg-transparent"
          }
          tabIndex={onRowSelect ? 0 : undefined}
          onClick={onRowSelect ? () => onRowSelect(row) : undefined}
          onKeyDown={
            onRowSelect
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowSelect(row);
                  }
                }
              : undefined
          }
        >
          <TableCell className="w-[45%] px-4 py-2 whitespace-normal">
            {row.primary}
          </TableCell>
          <TableCell className="min-w-0 px-4 py-2 text-left text-muted-foreground">
            <span className="flex min-w-0 flex-col items-start gap-0 @[480px]:flex-row @[480px]:items-baseline @[480px]:gap-1.5">
              {row.secondaryLabel ? (
                <span className="shrink-0 font-sans text-[12.64px] leading-[1.5]">
                  {row.secondaryLabel}
                </span>
              ) : null}
              <span
                className="block min-w-0 max-w-full truncate font-mono text-[12px] @[480px]:flex-1"
                title={row.secondary}
              >
                {row.secondary}
              </span>
            </span>
          </TableCell>
          {onRowSelect ? (
            <TableCell className="py-1 pr-4 pl-0 text-right">
              <ChevronRight
                aria-hidden="true"
                className="ml-auto size-3 text-muted-foreground"
              />
            </TableCell>
          ) : null}
        </TableRow>
      ))}
    </TableBody>
  );
}

function RecordsSummary({
  summary,
  visibleCount,
}: {
  summary: DashboardRecordsSummary;
  visibleCount: number;
}) {
  const isPartialPreview = visibleCount > 0 && summary.total > visibleCount;
  const shouldShowViewAll = Boolean(
    summary.onViewAll && summary.total > visibleCount,
  );

  return (
    <div
      className="flex items-start justify-between gap-4 border-b border-border px-4 py-4"
      data-testid="dashboard-table-summary"
    >
      <div className="min-w-0">
        <p className="flex items-baseline gap-2">
          <span className="font-mono text-[22px] leading-[1.2] font-bold tabular-nums">
            {summary.total.toLocaleString("en-US")}
          </span>
          <span className="text-[14.22px] leading-[1.5] text-foreground">
            {summary.label}
          </span>
        </p>
        {isPartialPreview ? (
          <p className="mt-1 text-[12.64px] leading-[1.5] text-muted-foreground">
            {visibleCount === 1
              ? "Showing the most recent"
              : `Showing the ${visibleCount} most recent`}
          </p>
        ) : null}
      </div>

      {shouldShowViewAll && summary.onViewAll ? (
        <Button
          className="mt-0.5 h-auto shrink-0 px-0 py-0 text-[14px] leading-5 font-normal hover:bg-transparent hover:underline"
          variant="ghost"
          onClick={summary.onViewAll}
        >
          View all {summary.label}
          <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

/** Renders the shared dashboard panel shell for ranked comparisons or record collections. */
export function DashboardTable(props: DashboardTableProps) {
  const {
    description,
    emptyMessage = "No rows available.",
    rows,
    title,
    variant,
  } = props;
  const headerAction = variant === "ranked" ? props.headerAction : undefined;
  const recordsSummary = variant === "records" ? props.summary : undefined;

  return (
    <section className="@container min-w-0 overflow-hidden rounded-[10px] border border-border bg-background">
      <DashboardTableHeader
        description={description}
        headerAction={headerAction}
        title={title}
      />

      {recordsSummary ? (
        <RecordsSummary summary={recordsSummary} visibleCount={rows.length} />
      ) : null}

      {rows.length ? (
        <Table aria-label={title}>
          {variant === "ranked" ? (
            <colgroup>
              <col className="w-12" />
              <col className="w-[50%]" />
              <col />
              <col className="w-12" />
            </colgroup>
          ) : (
            <colgroup>
              <col className="w-[50%]" />
              <col />
              {props.onRowSelect ? <col className="w-12" /> : null}
            </colgroup>
          )}
          <TableHeader className="sr-only">
            {variant === "ranked" ? (
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            ) : (
              <TableRow>
                <TableHead>Primary value</TableHead>
                <TableHead>Secondary value</TableHead>
                {props.onRowSelect ? <TableHead>Details</TableHead> : null}
              </TableRow>
            )}
          </TableHeader>
          {variant === "ranked" ? (
            <RankedRows onRowSelect={props.onRowSelect} rows={props.rows} />
          ) : (
            <RecordRows onRowSelect={props.onRowSelect} rows={props.rows} />
          )}
        </Table>
      ) : (
        <p className="px-4 py-8 text-center text-[14.22px] leading-[1.5] text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
