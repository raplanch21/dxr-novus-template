"use client";

import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DashboardChartPanelOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export type DashboardChartPanelProps = {
  title: string;
  period?: string;
  children: ReactNode;
  modeLabel?: string;
  modeIcon?: LucideIcon;
  options?: readonly DashboardChartPanelOption[];
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  headerAccessory?: ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * Frames an analytical chart with its title, measured period, and optional
 * visualization selector while leaving chart rendering to the caller.
 */
export function DashboardChartPanel({
  title,
  period,
  children,
  modeLabel = "Stacked",
  modeIcon: ModeIcon,
  options,
  selectedValue,
  onValueChange,
  headerAccessory,
  className,
  contentClassName,
}: DashboardChartPanelProps) {
  const titleId = useId();
  const selectedOption =
    options?.find((option) => option.value === selectedValue) ?? options?.[0];
  const hasInteractiveSelector = Boolean(selectedOption && onValueChange);

  return (
    <section
      role="group"
      aria-labelledby={titleId}
      className={cn(
        "h-[480px] min-w-0 rounded-[10px] border border-[#E5E5E5] p-px",
        className,
      )}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[8px]">
        <header
          className={cn(
            "flex items-start justify-between border-b border-[#E5E5E5] px-4 pt-3 pb-[13px]",
            headerAccessory && "flex-col gap-3 sm:flex-row",
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3
              id={titleId}
              className="text-[16px] leading-6 font-normal text-[#0A0A0A]"
            >
              {title}
            </h3>
            {period ? (
              <p className="text-[12.64px] leading-[1.5] text-[#737373]">
                {period}
              </p>
            ) : null}
          </div>

          {headerAccessory ? (
            <div className="shrink-0 self-start pb-0.5 sm:self-end sm:pl-4">
              {headerAccessory}
            </div>
          ) : hasInteractiveSelector && selectedOption ? (
            <Select
              value={selectedOption.value}
              onValueChange={(value) => onValueChange?.(String(value))}
            >
              <SelectTrigger
                aria-label="Chart type"
                className="h-auto border-0 px-2 py-1 text-[14px] leading-4 shadow-none hover:bg-[#F8F8F8] focus-visible:ring-2 focus-visible:ring-[#DADCE5]"
              >
                <selectedOption.icon aria-hidden className="size-4" />
                {selectedOption.label}
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false}>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <option.icon aria-hidden className="size-4" />
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="flex shrink-0 items-center gap-1.5 py-1 pr-0 pl-2 text-[14px] leading-4 text-[#0A0A0A]">
              {ModeIcon ? <ModeIcon aria-hidden className="size-4" /> : null}
              {modeLabel}
            </p>
          )}
        </header>

        <div
          data-slot="chart-panel-content"
          className={cn("min-h-0 flex-1 p-4", contentClassName)}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
