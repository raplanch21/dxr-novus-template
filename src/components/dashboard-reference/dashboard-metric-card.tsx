import { DashboardDelta } from "./dashboard-delta";
import type { DashboardMetricCardProps } from "./dashboard-types";

export function DashboardMetricCard({
  description,
  delta,
  label,
  period,
  showBaseline = true,
  supportingValue,
  type,
  value,
}: DashboardMetricCardProps) {
  const isKeyMetric = type === "key";

  return (
    <section className="flex h-full min-w-0 w-full flex-col gap-2">
      <p className="text-[12px] leading-4 font-medium text-[#737373]">
        {label}
      </p>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="font-mono text-[22px] leading-[1.2] font-bold tabular-nums text-[#0a0a0a]">
          {value}
        </p>

        {delta ? (
          <DashboardDelta valence={delta.valence}>{delta.label}</DashboardDelta>
        ) : null}

        {showBaseline && supportingValue ? (
          <p className="self-center font-mono text-[12px] leading-4 font-normal tabular-nums text-[#737373]">
            {supportingValue}
          </p>
        ) : null}
      </div>

      {isKeyMetric && description ? (
        typeof description === "string" ? (
          <p className="text-[14.22px] leading-[1.5] text-[#0a0a0a]">
            {description}
          </p>
        ) : (
          <div className="text-[14.22px] leading-[1.5] text-[#0a0a0a]">
            {description}
          </div>
        )
      ) : null}

      {isKeyMetric && period ? (
        <p className="mt-auto text-[12.64px] leading-[1.5] text-[#737373]">
          {period}
        </p>
      ) : null}
    </section>
  );
}
