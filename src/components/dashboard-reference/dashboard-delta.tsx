import type { ReactNode } from "react";

import { MetricDelta, type MetricTone } from "@/components/metric-delta";
import { cn } from "@/lib/utils";

import type { DashboardDeltaValence } from "./dashboard-types";

const valenceToneMap: Record<DashboardDeltaValence, MetricTone> = {
  positive: "positive",
  negative: "negative",
  null: "neutral",
};

const dashboardValenceClassName: Record<DashboardDeltaValence, string> = {
  positive: "bg-emerald-500/10 text-emerald-700",
  negative: "bg-red-500/10 text-red-700",
  null: "bg-neutral-200 text-neutral-700",
};

interface DashboardDeltaProps {
  children: ReactNode;
  valence: DashboardDeltaValence;
}

export function DashboardDelta({ children, valence }: DashboardDeltaProps) {
  return (
    <MetricDelta
      className={cn(
        "h-[22px] px-1.5 py-0.5 font-mono text-[12px] leading-[18px] font-medium",
        dashboardValenceClassName[valence],
      )}
      size="regular"
      tone={valenceToneMap[valence]}
      variant="filled"
    >
      {children}
    </MetricDelta>
  );
}
