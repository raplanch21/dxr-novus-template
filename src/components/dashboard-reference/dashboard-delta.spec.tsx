import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DashboardDelta } from "./dashboard-delta";

afterEach(() => {
  cleanup();
});

describe("DashboardDelta", () => {
  it.each([
    ["positive", "Favorable change", "bg-emerald-500/10", "text-emerald-700"],
    ["negative", "Unfavorable change", "bg-red-500/10", "text-red-700"],
    ["null", "No directional change", "bg-neutral-200", "text-neutral-700"],
  ] as const)(
    "maps %s valence to an accessible semantic label and Tailwind palette",
    (valence, label, backgroundClass, textClass) => {
      render(<DashboardDelta valence={valence}>+4.8%</DashboardDelta>);
      const semanticLabel = screen.getByText(label, { exact: false });
      expect(semanticLabel).toBeInTheDocument();
      expect(semanticLabel.parentElement).toHaveClass(
        "h-[22px]",
        "px-1.5",
        "py-0.5",
        "font-mono",
        "font-medium",
        backgroundClass,
        textClass,
      );
      expect(semanticLabel.parentElement).not.toHaveClass("font-semibold");
    },
  );
});
