import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MetricTone = "positive" | "negative" | "neutral";

const textToneClassName: Record<MetricTone, string> = {
  positive: "text-[#007a3d]",
  negative: "text-[#b42318]",
  neutral: "text-[#5f626b]",
};

const filledToneClassName: Record<MetricTone, string> = {
  positive: "bg-[#e3f7ed] text-[#005027]",
  negative: "bg-[#ffe8d2] text-[#8e0b00]",
  neutral: "bg-[#f5f5f5] text-[#2a2c35]",
};

const toneLabel: Record<MetricTone, string> = {
  positive: "Favorable change",
  negative: "Unfavorable change",
  neutral: "No directional change",
};

type MetricDeltaProps = {
  children: ReactNode;
  className?: string;
  size?: "compact" | "regular";
  tone: MetricTone;
  variant?: "text" | "filled";
};

/** Renders a compact trend delta without relying on color alone for meaning. */
export function MetricDelta({
  children,
  className,
  size = "compact",
  tone,
  variant = "text",
}: MetricDeltaProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold tabular-nums",
        size === "regular"
          ? "text-[12.64px] leading-[1.5]"
          : "text-[11px] leading-4",
        variant === "filled"
          ? cn(
              "rounded-[3px] px-1.5",
              size === "regular" ? "h-6" : "h-5",
              filledToneClassName[tone],
            )
          : textToneClassName[tone],
        className,
      )}
    >
      <span className="sr-only">{toneLabel[tone]}: </span>
      {children}
    </span>
  );
}
