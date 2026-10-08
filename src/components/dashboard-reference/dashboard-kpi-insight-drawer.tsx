import type { ReactNode } from "react";

interface DashboardKpiInsightDrawerProps {
  ariaLabel: string;
  title: string;
  timeframe: string;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
}

/**
 * Frames the expanded KPI analysis shown beneath the selected metric tile.
 */
export function DashboardKpiInsightDrawer({
  ariaLabel,
  title,
  timeframe,
  actionLabel,
  onAction,
  children,
}: DashboardKpiInsightDrawerProps) {
  return (
    <div
      id="kpi-insight-drawer"
      role="region"
      aria-label={ariaLabel}
      className="border-t border-[#e5e5e5] bg-white px-4 py-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-[16px] leading-[1.5] text-[#0a0a0a]">{title}</p>
            <p className="text-[12.642px] leading-[1.5] text-[#737373]">
              {timeframe}
            </p>
          </div>
          <button
            type="button"
            onClick={onAction}
            className="inline-flex w-fit shrink-0 cursor-pointer items-center rounded-[8px] border border-[#e5e5e5] bg-white px-[11px] py-2 text-[14px] font-medium leading-[20px] text-[#2a2c35] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#fafafa]"
          >
            {actionLabel}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
