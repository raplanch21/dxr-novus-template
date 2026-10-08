import { DashboardMetricCard } from "./dashboard-metric-card";
import type { DashboardMetricCardProps } from "./dashboard-types";

export interface DashboardMetricsGridProps {
  metrics: DashboardMetricCardProps[];
  period: string;
  segment: string;
}

const wideGridClassNames: Record<number, string> = {
  1: "@[860px]:grid-cols-1",
  2: "@[860px]:grid-cols-2",
  3: "@[860px]:grid-cols-3",
  4: "@[860px]:grid-cols-2",
  5: "@[860px]:grid-cols-6",
  6: "@[860px]:grid-cols-3",
};

function wideItemClassName(metricCount: number, index: number) {
  if (metricCount !== 5) return "";
  return index < 3 ? "@[860px]:col-span-2" : "@[860px]:col-span-3";
}

export function DashboardMetricsGrid({
  metrics,
  period,
  segment,
}: DashboardMetricsGridProps) {
  if (metrics.length === 0) return null;

  const wideGridClassName = wideGridClassNames[metrics.length];
  if (!wideGridClassName) {
    throw new Error("DashboardMetricsGrid accepts at most six metrics.");
  }

  return (
    <section
      role="group"
      aria-label="Dashboard metrics grid"
      className="@container min-w-0 w-full overflow-hidden rounded-[10px] border border-[#e5e5e5] bg-white"
    >
      <header className="flex items-center justify-between gap-4 border-b border-[#e5e5e5] px-4 py-3">
        <p className="min-w-0 text-[14px] leading-[1.5] font-semibold text-[#0a0a0a]">
          {segment}
        </p>
        <p className="ml-auto shrink-0 text-right text-[12.64px] leading-[1.5] text-[#737373]">
          {period}
        </p>
      </header>

      <ul
        role="list"
        aria-label="Segment metrics"
        className={`grid grid-cols-1 gap-px bg-[#e5e5e5] @[600px]:grid-cols-2 ${wideGridClassName}`}
      >
        {metrics.map((metric, index) => (
          <li
            key={`${metric.label}-${index}`}
            role="listitem"
            className={`min-w-0 bg-white px-4 py-4 ${wideItemClassName(metrics.length, index)}`}
          >
            <DashboardMetricCard {...metric} type="general" />
          </li>
        ))}
      </ul>
    </section>
  );
}
