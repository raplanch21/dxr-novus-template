import { DashboardMetricCard } from "./dashboard-metric-card";
import type { DashboardMetricCardProps } from "./dashboard-types";

export interface DashboardKpiHeadlineProps {
  metrics: DashboardMetricCardProps[];
}

const KPI_HEADLINE_GROUP_CLASSNAMES = [
  "@container",
  "min-w-0",
  "w-full",
  "border-y",
  "border-[#e5e5e5]",
].join(" ");

const KPI_HEADLINE_GRID_CLASSNAMES = [
  "grid",
  "grid-cols-1",
  "@[860px]:grid-cols-3",
].join(" ");

const KPI_HEADLINE_ITEM_CLASSNAMES = [
  "min-w-0",
  "px-4",
  "py-4",
  "border-t",
  "border-[#e5e5e5]",
  "first:border-t-0",
  "@[860px]:border-l",
  "@[860px]:[&:nth-child(3n+1)]:border-l-0",
  "@[860px]:[&:nth-child(-n+3)]:border-t-0",
].join(" ");

export function DashboardKpiHeadline({ metrics }: DashboardKpiHeadlineProps) {
  return (
    <section className={KPI_HEADLINE_GROUP_CLASSNAMES}>
      <ul
        role="list"
        aria-label="Headline metrics"
        className={KPI_HEADLINE_GRID_CLASSNAMES}
      >
        {metrics.map((metric, index) => (
          <li
            key={`${metric.label}-${index}`}
            role="listitem"
            className={KPI_HEADLINE_ITEM_CLASSNAMES}
          >
            <DashboardMetricCard {...metric} type="key" />
          </li>
        ))}
      </ul>
    </section>
  );
}
