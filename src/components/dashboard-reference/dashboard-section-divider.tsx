import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { DashboardSectionDividerProps } from "./dashboard-types";

export function DashboardSectionDivider({
  number,
  onAsk,
  onEdit,
  title,
}: DashboardSectionDividerProps) {
  const sectionNumber = String(number).padStart(2, "0");

  return (
    <section className="@container flex min-w-0 w-full flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex min-w-0 flex-1 items-center gap-9">
        <p className="font-mono text-[12px] leading-4 tracking-[0.3px] text-[#737373] uppercase">
          {sectionNumber}
        </p>
        <h2 className="min-w-0 text-[18px] leading-6 font-semibold text-[#0a0a0a]">
          {title}
        </h2>
      </div>

      {(onEdit || onAsk) && (
        <div className="flex w-full flex-wrap items-center gap-3 @[480px]:w-auto @[480px]:justify-end">
          {onEdit ? (
            <Button variant="ghost" onClick={onEdit}>
              Edit with Novus
            </Button>
          ) : null}

          {onAsk ? (
            <Button variant="outline" onClick={onAsk}>
              <MessageCircle aria-hidden="true" />
              Ask Novus
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
