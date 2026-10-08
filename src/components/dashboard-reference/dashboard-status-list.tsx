import { Badge } from "@/components/ui/badge";

import type {
  DashboardStatus,
  DashboardStatusListProps,
} from "./dashboard-types";

const STATUS_PRESENTATION: Record<
  DashboardStatus,
  { className: string; label: string }
> = {
  healthy: {
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    label: "Healthy",
  },
  watch: {
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950",
    label: "Watch",
  },
  attention: {
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    label: "Attention",
  },
};

/** Summarizes narrative health states with visible labels that do not rely on color alone. */
export function DashboardStatusList({
  emptyMessage = "No statuses available.",
  items,
}: DashboardStatusListProps) {
  if (!items.length) {
    return (
      <div className="rounded-[10px] border border-border bg-background px-4 py-8 text-center text-[14.22px] leading-[1.5] text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul
      aria-label="Dashboard statuses"
      className="overflow-hidden rounded-[10px] border border-border bg-background"
    >
      {items.map((item) => {
        const presentation = STATUS_PRESENTATION[item.status];

        return (
          <li
            key={item.id}
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="break-words text-[14.22px] leading-[1.5] font-semibold whitespace-normal text-foreground">
                {item.title}
              </p>
              <p className="mt-1 break-words text-[12.64px] leading-[1.5] whitespace-normal text-muted-foreground">
                {item.description}
              </p>
            </div>
            <Badge className={presentation.className}>
              {presentation.label}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
